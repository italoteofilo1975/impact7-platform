import { describe, expect, it } from "vitest";
import { searchKnowledge, listCategories, getDocumentsByCategory } from "./services/jarvis/knowledge-base";
import { jarvisSkills, getSuggestedQuestions } from "./services/jarvis/jarvis-service";

describe("Jarvis Knowledge Base", () => {
  it("should search knowledge base and return results", () => {
    const results = searchKnowledge("IMPACT7", 3);
    
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
    expect(categories).toContain("ciencia");
    expect(categories).toContain("matematica");
    expect(categories).toContain("pilares");
  });

  it("should get documents by category", () => {
    const docs = getDocumentsByCategory("ciencia");
    
    expect(docs).toBeDefined();
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThan(0);
    
    // Each document should have required fields
    docs.forEach(doc => {
      expect(doc).toHaveProperty("titulo");
      expect(doc).toHaveProperty("conteudo");
      expect(doc).toHaveProperty("categoria");
      expect(doc).toHaveProperty("subcategoria");
      expect(doc.categoria).toBe("ciencia");
    });
  });

  it("should return empty array for non-existent category", () => {
    const docs = getDocumentsByCategory("non_existent_category");
    
    expect(docs).toBeDefined();
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBe(0);
  });

  it("should search and return relevant results", () => {
    const results = searchKnowledge("equação impacto", 5);
    
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
  it("should calculate impact using the IMPACT7 equation", async () => {
    const result = await jarvisSkills.calculator({
      investment: 100000,
      contextScore: 8,
      resistanceScore: 3,
      beneficiaries: 500,
      duration: 24
    });
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("skill");
    expect(result).toHaveProperty("data");
    expect(result.skill).toBe("calculator");
    
    // Data should have calculated values
    expect(result.data).toHaveProperty("impactScore");
    expect(result.data).toHaveProperty("sRoi");
    expect(result.data).toHaveProperty("socialValue");
    expect(result.data).toHaveProperty("rating");
    
    // Values should be positive
    expect(result.data!.impactScore).toBeGreaterThan(0);
    expect(result.data!.sRoi).toBeGreaterThan(0);
    expect(result.data!.socialValue).toBeGreaterThan(0);
  });

  it("should export report data", async () => {
    const result = await jarvisSkills.exportReport({
      projectName: "Projeto Teste",
      impactScore: 1500,
      sRoi: 8.5,
      beneficiaries: 500
    });
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("skill");
    expect(result.skill).toBe("export");
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.message).toContain("Relatório de Impacto");
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
  });
});
