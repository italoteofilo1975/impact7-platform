import { describe, it, expect } from "vitest";
import {
  localEmbedding,
  generateEmbedding,
  cosineSimilarity,
  chunkText,
  EMBEDDING_DIM,
} from "./embeddings";

describe("embeddings — localEmbedding", () => {
  it("gera vetor com a dimensão esperada", () => {
    const v = localEmbedding("Método Impacta Sete e impacto social");
    expect(v).toHaveLength(EMBEDDING_DIM);
  });

  it("é determinístico (mesma entrada → mesmo vetor)", () => {
    const a = localEmbedding("cálculo de S-ROI");
    const b = localEmbedding("cálculo de S-ROI");
    expect(a).toEqual(b);
  });

  it("é L2-normalizado (norma ~1 para texto não vazio)", () => {
    const v = localEmbedding("gamificação e engajamento");
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    expect(norm).toBeCloseTo(1, 5);
  });

  it("retorna vetor nulo para texto vazio", () => {
    const v = localEmbedding("   ");
    expect(v.every((x) => x === 0)).toBe(true);
  });

  it("ignora acentuação/caixa na normalização (alta similaridade)", () => {
    const a = localEmbedding("Consciência e Colaboração");
    const b = localEmbedding("consciencia e colaboracao");
    expect(cosineSimilarity(a, b)).toBeGreaterThan(0.9);
  });
});

describe("embeddings — cosineSimilarity", () => {
  it("textos semelhantes têm similaridade maior que textos diferentes", () => {
    const q = localEmbedding("como calcular o retorno social do investimento");
    const relevante = localEmbedding("cálculo do S-ROI: retorno social sobre o investimento");
    const irrelevante = localEmbedding("receita de bolo de chocolate com morango");
    const simRel = cosineSimilarity(q, relevante);
    const simIrr = cosineSimilarity(q, irrelevante);
    expect(simRel).toBeGreaterThan(simIrr);
  });

  it("vetor idêntico tem similaridade ~1", () => {
    const v = localEmbedding("os 7 pilares do método");
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 6);
  });

  it("retorna 0 para dimensões incompatíveis", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2])).toBe(0);
  });
});

describe("embeddings — generateEmbedding (provider seam)", () => {
  it("usa o provider local por padrão e é consistente com localEmbedding", async () => {
    const text = "engajamento dos stakeholders";
    const viaAsync = await generateEmbedding(text);
    expect(viaAsync).toEqual(localEmbedding(text));
  });
});

describe("embeddings — chunkText", () => {
  it("retorna um único chunk quando o texto é curto", () => {
    expect(chunkText("texto curto")).toEqual(["texto curto"]);
  });

  it("retorna vazio para texto em branco", () => {
    expect(chunkText("   ")).toEqual([]);
  });

  it("divide textos longos em múltiplos chunks dentro do limite", () => {
    const long = "frase. ".repeat(600); // ~4200 chars
    const chunks = chunkText(long, 1000, 100);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.length).toBeLessThanOrEqual(1000);
    }
  });
});
