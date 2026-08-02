import { describe, it, expect } from "vitest";
import { rankBySimilarity, serializeEmbedding, parseEmbedding } from "./rag-service";
import { localEmbedding, EMBEDDING_DIM } from "./embeddings";

function doc(id: number, title: string, content: string, category = "geral") {
  return {
    id,
    title,
    content,
    category,
    embedding: serializeEmbedding(localEmbedding(`${title}\n\n${content}`)),
  };
}

describe("rag-service — serialize/parseEmbedding", () => {
  it("round-trip preserva o vetor", () => {
    const v = localEmbedding("teste de round-trip");
    expect(parseEmbedding(serializeEmbedding(v))).toEqual(v);
  });

  it("rejeita entradas inválidas", () => {
    expect(parseEmbedding(null)).toBeNull();
    expect(parseEmbedding("não é json")).toBeNull();
    expect(parseEmbedding(JSON.stringify([1, 2, 3]))).toBeNull(); // dimensão errada
  });

  it("aceita vetor com a dimensão correta", () => {
    const v = new Array(EMBEDDING_DIM).fill(0);
    expect(parseEmbedding(JSON.stringify(v))).toHaveLength(EMBEDDING_DIM);
  });
});

describe("rag-service — rankBySimilarity", () => {
  const corpus = [
    doc(1, "Cálculo de S-ROI", "Como calcular o retorno social sobre o investimento do seu projeto."),
    doc(2, "Os 7 Pilares I", "Imersão, Ideação, Implementação, Iteração, Impacto, Inspiração, Independência."),
    doc(3, "Gamificação", "Sistema de badges, pontos e conquistas para engajamento de usuários."),
  ];

  it("retorna o documento mais relevante em primeiro", () => {
    const q = localEmbedding("quero calcular o retorno social do meu investimento");
    const results = rankBySimilarity(q, corpus, 3, 0);
    expect(results[0].id).toBe(1);
  });

  it("respeita topK", () => {
    const q = localEmbedding("impacto social");
    const results = rankBySimilarity(q, corpus, 2, 0);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("filtra por minScore alto (nenhum resultado para consulta sem relação)", () => {
    const q = localEmbedding("automóveis esportivos italianos de corrida");
    const results = rankBySimilarity(q, corpus, 3, 0.5);
    expect(results.length).toBe(0);
  });

  it("ignora documentos sem embedding válido", () => {
    const q = localEmbedding("gamificação e badges");
    const withBroken = [
      ...corpus,
      { id: 99, title: "Quebrado", content: "sem embedding", category: "x", embedding: null },
    ];
    const results = rankBySimilarity(q, withBroken, 5, 0);
    expect(results.find((r) => r.id === 99)).toBeUndefined();
  });

  it("resultados vêm ordenados por score decrescente", () => {
    const q = localEmbedding("engajamento pontos badges conquistas");
    const results = rankBySimilarity(q, corpus, 3, 0);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});
