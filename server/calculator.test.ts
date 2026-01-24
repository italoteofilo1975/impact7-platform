import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("calculator.calculate", () => {
  it("calculates impact score using IMPACT7 equation", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calculator.calculate({
      investment: 100000,
      contextScore: 8,
      resistanceScore: 3,
      beneficiaries: 500,
      duration: 12,
    });

    expect(result).toHaveProperty("impactScore");
    expect(result).toHaveProperty("sRoi");
    expect(result).toHaveProperty("socialValue");
    expect(result).toHaveProperty("rating");
    
    // Verify calculation logic
    // I = (E × C^7) / R where C and R are normalized (divided by 10)
    const E = 100000;
    const C = 8 / 10; // 0.8
    const R = 3 / 10; // 0.3
    const expectedImpact = (E * Math.pow(C, 7)) / R;
    
    expect(result.impactScore).toBe(Math.round(expectedImpact));
    expect(typeof result.sRoi).toBe("number");
    expect(result.sRoi).toBeGreaterThan(0);
  });

  it("returns correct rating based on S-ROI", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // High context, low resistance = high S-ROI
    const highResult = await caller.calculator.calculate({
      investment: 50000,
      contextScore: 10,
      resistanceScore: 1,
      beneficiaries: 1000,
      duration: 24,
    });

    expect(["Excelente", "Muito Bom", "Bom"]).toContain(highResult.rating);

    // Low context, high resistance = low S-ROI
    const lowResult = await caller.calculator.calculate({
      investment: 50000,
      contextScore: 2,
      resistanceScore: 9,
      beneficiaries: 50,
      duration: 6,
    });

    expect(["Baixo", "Moderado"]).toContain(lowResult.rating);
  });

  it("handles edge cases with minimum resistance", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Very low resistance should not cause division by zero
    const result = await caller.calculator.calculate({
      investment: 10000,
      contextScore: 5,
      resistanceScore: 1,
      beneficiaries: 100,
      duration: 12,
    });

    expect(result.impactScore).toBeGreaterThan(0);
    expect(isFinite(result.impactScore)).toBe(true);
    expect(isFinite(result.sRoi)).toBe(true);
  });
});

describe("leads.create", () => {
  it("validates required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should throw for invalid email
    await expect(
      caller.leads.create({
        name: "Test User",
        email: "invalid-email",
      })
    ).rejects.toThrow();

    // Should throw for short name
    await expect(
      caller.leads.create({
        name: "A",
        email: "test@example.com",
      })
    ).rejects.toThrow();
  });
});

describe("contacts.create", () => {
  it("validates message length", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should throw for short message
    await expect(
      caller.contacts.create({
        name: "Test User",
        email: "test@example.com",
        message: "Hi",
      })
    ).rejects.toThrow();
  });
});

describe("newsletter.subscribe", () => {
  it("validates email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.newsletter.subscribe({
        email: "not-an-email",
      })
    ).rejects.toThrow();
  });
});
