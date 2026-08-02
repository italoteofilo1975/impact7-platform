/**
 * Serviço de RAG do Jarvis
 * ------------------------------------------------------------------
 * Ingestão, indexação e busca semântica sobre a tabela `knowledgeDocuments`.
 * Os embeddings são gerados por `./embeddings` e persistidos como JSON no
 * campo `embedding` (text). A busca é por similaridade de cosseno em memória
 * (MySQL não tem tipo vetorial nativo nesta stack) — adequado ao volume atual;
 * pode evoluir para índice ANN/extensão vetorial sem mudar a interface pública.
 */

import { getDb } from "../../db";
import { knowledgeDocuments } from "../../../drizzle/schema";
import type { KnowledgeDocument } from "../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import {
  generateEmbedding,
  cosineSimilarity,
  EMBEDDING_DIM,
} from "./embeddings";

export interface RagSearchResult {
  id: number;
  title: string;
  category: string;
  score: number;
  snippet: string;
}

/** Serializa um vetor para armazenamento em coluna text. */
export function serializeEmbedding(vec: number[]): string {
  return JSON.stringify(vec);
}

/** Faz o parse de um embedding persistido; retorna null se inválido. */
export function parseEmbedding(raw: string | null | undefined): number[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === EMBEDDING_DIM) {
      return parsed as number[];
    }
    return null;
  } catch {
    return null;
  }
}

function makeSnippet(content: string, maxLen = 240): string {
  const clean = content.replace(/\s+/g, " ").trim();
  return clean.length <= maxLen ? clean : clean.slice(0, maxLen) + "…";
}

type RankableDoc = Pick<KnowledgeDocument, "id" | "title" | "content" | "category" | "embedding">;

/**
 * FUNÇÃO PURA (testável sem DB): ranqueia documentos por similaridade de
 * cosseno contra o vetor da consulta. Documentos sem embedding válido são
 * ignorados no ranqueamento vetorial.
 */
export function rankBySimilarity(
  queryVec: number[],
  docs: RankableDoc[],
  topK = 3,
  minScore = 0.05
): RagSearchResult[] {
  const scored: RagSearchResult[] = [];
  for (const doc of docs) {
    const vec = parseEmbedding(doc.embedding);
    if (!vec) continue;
    const score = cosineSimilarity(queryVec, vec);
    if (score >= minScore) {
      scored.push({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        score,
        snippet: makeSnippet(doc.content),
      });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/** Ingesta um novo documento na base de conhecimento (gera o embedding). */
export async function ingestDocument(input: {
  title: string;
  content: string;
  category: string;
  tags?: string;
}): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  const embedding = await generateEmbedding(`${input.title}\n\n${input.content}`);
  const now = Date.now();

  const result = await db.insert(knowledgeDocuments).values({
    title: input.title,
    content: input.content,
    category: input.category,
    tags: input.tags ?? null,
    embedding: serializeEmbedding(embedding),
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  });

  // mysql2 retorna insertId em result[0].insertId
  const insertId = (result as unknown as Array<{ insertId?: number }>)[0]?.insertId ?? 0;
  return { id: insertId };
}

/** Lista documentos da base (por padrão apenas ativos). */
export async function listDocuments(activeOnly = true): Promise<KnowledgeDocument[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(knowledgeDocuments)
    .orderBy(desc(knowledgeDocuments.updatedAt));
  return activeOnly ? rows.filter((r) => r.isActive === 1) : rows;
}

/** Remove um documento da base. */
export async function deleteDocument(id: number): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(knowledgeDocuments).where(eq(knowledgeDocuments.id, id));
  return { success: true };
}

/**
 * Recalcula embeddings ausentes/inválidos (ou todos com force=true).
 * Útil após importar documentos ou trocar o provider de embeddings.
 */
export async function reindexAll(force = false): Promise<{ reindexed: number }> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const rows = await db.select().from(knowledgeDocuments);
  let reindexed = 0;
  for (const doc of rows) {
    if (!force && parseEmbedding(doc.embedding)) continue;
    const embedding = await generateEmbedding(`${doc.title}\n\n${doc.content}`);
    await db
      .update(knowledgeDocuments)
      .set({ embedding: serializeEmbedding(embedding), updatedAt: Date.now() })
      .where(eq(knowledgeDocuments.id, doc.id));
    reindexed++;
  }
  return { reindexed };
}

/** Busca semântica: retorna os `topK` documentos mais similares à consulta. */
export async function semanticSearch(
  query: string,
  topK = 3,
  minScore = 0.05
): Promise<RagSearchResult[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(knowledgeDocuments);
  const active = rows.filter((r) => r.isActive === 1);
  const queryVec = await generateEmbedding(query);
  return rankBySimilarity(queryVec, active, topK, minScore);
}

/**
 * Contexto RAG formatado para injeção no prompt do LLM.
 * Best-effort: NUNCA lança — se o DB estiver indisponível ou não houver
 * resultados, retorna string vazia (o Jarvis segue com a KB estática).
 */
export async function getRagContext(query: string, topK = 3): Promise<string> {
  try {
    const results = await semanticSearch(query, topK);
    if (results.length === 0) return "";
    const blocks = results.map(
      (r) => `### ${r.title} (${r.category})\n${r.snippet}`
    );
    return (
      "BASE DE CONHECIMENTO DINÂMICA (documentos mais relevantes para a pergunta):\n\n" +
      blocks.join("\n\n")
    );
  } catch (err) {
    console.error("[RAG] getRagContext falhou (seguindo sem RAG):", err);
    return "";
  }
}
