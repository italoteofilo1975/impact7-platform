import { describe, expect, it } from "vitest";
import { searchKnowledge, listCategories, getDocumentsByCategory } from "./services/jarvis/knowledge-base";
import { jarvisSkills, getSuggestedQuestions } from "./services/jarvis/jarvis-service";

describe("Jarvis Knowledge Base", () => {
  it("should search knowledge base and return results", () => {
    const results = searchKnowledge("Impact7", 3);

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);

    // Each result should have required fields
    results.forEach(result => {
      expect(result).toHaveProperty("titulo");
      expect(result).toHaveProperty("conteudo");
      expect(result).toHaveProperty("categoria");
      expect(result).toHaveProperty("subcategoria");
      expect(result).toHaveProperty("tags");
    });
  });

  it("should list all categories", () => {
    const categories = listCategories();

    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);

    // Should include expected categories
    expect(categories).toContain("metodo");
    expect(categories).toContain("funilIve");
    expect(categories).toContain("funilImpacta");
    expect(categories).toContain("sroi");
  });

  it("should get documents by category", () => {
    const docs = getDocumentsByCategory("metodo");

    expect(docs).toBeDefined();
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThan(0);

    // Each document should have required fields
    docs.forEach(doc => {
      expect(doc).toHaveProperty("titulo");
      expect(doc).toHaveProperty("conteudo");
      expect(doc).toHaveProperty("categoria");
      expect(doc).toHaveProperty("subcategoria");
      expect(doc.categoria).toBe("metodo");
    });
  });

  it("should return empty array for non-existent category", () => {
    const docs = getDocumentsByCategory("non_existent_category");

    expect(docs).toBeDefined();
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBe(0);
  });

  it("should search and return relevant results", () => {
    const results = searchKnowledge("S-ROI honesto desconto", 5);

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);

    // Results should have required structure
    results.forEach(result => {
      expect(result).toHaveProperty("titulo");
      expect(result).toHaveProperty("conteudo");
      expect(result).toHaveProperty("categoria");
      expect(result).toHaveProperty("subcategoria");
    });
  });
});

describe("Jarvis Skills", () => {
  it("should simulate S-ROI using the real calcSroi formula", async () => {
    const result = await jarvisSkills.calculator({
      gatilhos: 500,
      transformacoes: 100,
      valorGatilhoReais: 30,
      valorTransformacaoReais: 800,
      atribuicaoPercent: 60,
      deadweightPercent: 10,
      dropOffPercent: 5,
      custoImtsReais: 20000,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("skill");
    expect(result).toHaveProperty("data");
    expect(result.skill).toBe("calculator");

    // The response must clearly label the result as illustrative, never as real audited data
    expect(result.message).toMatch(/simulação ilustrativa/i);
    expect(result.data).toHaveProperty("sroi");
    expect(result.data).toHaveProperty("alavancagem");
    expect(result.data).toHaveProperty("valorSocial");
    expect(result.data!.illustrative).toBe(true);

    // gatilhos=500, valorGatilho=30 -> valorGatilhoBruto = 15000; transformacoes=100, valor=800 -> 80000
    // valorSocialBruto = 95000; fatorDesconto = 0.6 * 0.9 * 0.95 = 0.513
    // valorSocial = 95000 * 0.513 = 48735; sroi = 48735 / 20000 = 2.43675
    expect(result.data!.sroi as number).toBeCloseTo(2.43675, 4);
  });

  it("should not divide by zero when custoImtsReais is very small", async () => {
    const result = await jarvisSkills.calculator({
      gatilhos: 10,
      transformacoes: 1,
      valorGatilhoReais: 30,
      valorTransformacaoReais: 800,
      atribuicaoPercent: 50,
      custoImtsReais: 1,
    });

    expect(isFinite(result.data!.sroi as number)).toBe(true);
    expect(result.data!.sroi as number).toBeGreaterThan(0);
  });

  it("should export report data", async () => {
    const result = await jarvisSkills.exportReport({
      projectName: "Projeto Teste",
      sroi: 4.2,
      gatilhos: 500
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("skill");
    expect(result.skill).toBe("export");
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.message).toContain("Relatório Impact7");
  });
});

describe("Jarvis Suggestions", () => {
  it("should return suggested questions", () => {
    const suggestions = getSuggestedQuestions();

    expect(suggestions).toBeDefined();
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);

    // Each suggestion should be a non-empty string
    suggestions.forEach(suggestion => {
      expect(typeof suggestion).toBe("string");
      expect(suggestion.length).toBeGreaterThan(0);
    });

    // Should not reference the old fictitious equation
    suggestions.forEach(suggestion => {
      expect(suggestion).not.toMatch(/C⁷/);
    });
  });
});
