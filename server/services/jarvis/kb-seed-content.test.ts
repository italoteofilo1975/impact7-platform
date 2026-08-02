import { describe, it, expect } from "vitest";
import { KB_SEED_DOCUMENTS } from "./kb-seed-content";
import { localEmbedding } from "./embeddings";
import { rankBySimilarity, serializeEmbedding } from "./rag-service";

describe("kb-seed-content", () => {
  it("tem documentos de seed", () => {
    expect(KB_SEED_DOCUMENTS.length).toBeGreaterThanOrEqual(5);
  });

  it("todos os documentos são bem-formados (campos não vazios)", () => {
    for (const doc of KB_SEED_DOCUMENTS) {
      expect(doc.title.trim().length).toBeGreaterThan(0);
      expect(doc.content.trim().length).toBeGreaterThan(20);
      expect(doc.category.trim().length).toBeGreaterThan(0);
      expect(typeof doc.tags).toBe("string");
    }
  });

  it("os títulos são únicos (idempotência do seed depende disso)", () => {
    const titles = KB_SEED_DOCUMENTS.map((d) => d.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("uma consulta sobre os 7 C's recupera o documento correto", () => {
    const corpus = KB_SEED_DOCUMENTS.map((d, i) => ({
      id: i + 1,
      title: d.title,
      content: d.content,
      category: d.category,
      embedding: serializeEmbedding(localEmbedding(`${d.title}\n\n${d.content}`)),
    }));
    const q = localEmbedding("quais são as sete capacidades os 7 c's do contexto");
    const results = rankBySimilarity(q, corpus, 3, 0);
    expect(results[0].title).toBe("Os 7 C's do Contexto");
  });
});
