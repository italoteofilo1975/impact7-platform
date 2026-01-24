import { describe, it, expect, beforeEach } from "vitest";
import {
  canExecute,
  recordSuccess,
  recordFailure,
  executeWithCircuitBreaker,
  getCircuitBreakerStats,
  getAllCircuitBreakerStats,
  resetCircuitBreaker,
  resetAllCircuitBreakers,
  DEFAULT_CONFIGS,
} from "./circuit-breaker-service";

describe("Circuit Breaker Service", () => {
  beforeEach(() => {
    // Reset all circuit breakers before each test
    resetAllCircuitBreakers();
  });

  describe("canExecute", () => {
    it("should allow execution when circuit is closed", () => {
      expect(canExecute("test-service")).toBe(true);
    });

    it("should block execution when circuit is open", () => {
      const serviceName = "test-block";
      
      // Record enough failures to open the circuit
      for (let i = 0; i < 5; i++) {
        recordFailure(serviceName);
      }
      
      expect(canExecute(serviceName)).toBe(false);
    });
  });

  describe("recordSuccess", () => {
    it("should update stats on success", () => {
      const serviceName = "test-success";
      
      recordSuccess(serviceName);
      
      const stats = getCircuitBreakerStats(serviceName);
      expect(stats.totalSuccesses).toBe(1);
      expect(stats.totalCalls).toBe(1);
      expect(stats.lastSuccess).not.toBeNull();
    });

    it("should reset failures on success in closed state", () => {
      const serviceName = "test-reset";
      
      recordFailure(serviceName);
      recordFailure(serviceName);
      recordSuccess(serviceName);
      
      const stats = getCircuitBreakerStats(serviceName);
      expect(stats.failures).toBe(0);
    });
  });

  describe("recordFailure", () => {
    it("should update stats on failure", () => {
      const serviceName = "test-failure";
      
      recordFailure(serviceName);
      
      const stats = getCircuitBreakerStats(serviceName);
      expect(stats.totalFailures).toBe(1);
      expect(stats.totalCalls).toBe(1);
      expect(stats.lastFailure).not.toBeNull();
    });

    it("should open circuit after threshold failures", () => {
      const serviceName = "test-threshold";
      
      // Default threshold is 5
      for (let i = 0; i < 5; i++) {
        recordFailure(serviceName);
      }
      
      const stats = getCircuitBreakerStats(serviceName);
      expect(stats.state).toBe("OPEN");
      expect(stats.openedAt).not.toBeNull();
    });
  });

  describe("executeWithCircuitBreaker", () => {
    it("should execute function when circuit is closed", async () => {
      const result = await executeWithCircuitBreaker(
        "test-exec",
        async () => "success"
      );
      
      expect(result).toBe("success");
    });

    it("should record success on successful execution", async () => {
      const serviceName = "test-exec-success";
      
      await executeWithCircuitBreaker(
        serviceName,
        async () => "success"
      );
      
      const stats = getCircuitBreakerStats(serviceName);
      expect(stats.totalSuccesses).toBe(1);
    });

    it("should record failure on failed execution", async () => {
      const serviceName = "test-exec-failure";
      
      try {
        await executeWithCircuitBreaker(
          serviceName,
          async () => { throw new Error("test error"); }
        );
      } catch (e) {
        // Expected
      }
      
      const stats = getCircuitBreakerStats(serviceName);
      expect(stats.totalFailures).toBe(1);
    });

    it("should use fallback when circuit is open", async () => {
      const serviceName = "test-fallback";
      
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        recordFailure(serviceName);
      }
      
      const result = await executeWithCircuitBreaker(
        serviceName,
        async () => "primary",
        () => "fallback"
      );
      
      expect(result).toBe("fallback");
    });

    it("should throw when circuit is open and no fallback", async () => {
      const serviceName = "test-no-fallback";
      
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        recordFailure(serviceName);
      }
      
      await expect(
        executeWithCircuitBreaker(
          serviceName,
          async () => "primary"
        )
      ).rejects.toThrow("Circuit breaker test-no-fallback is OPEN");
    });
  });

  describe("getCircuitBreakerStats", () => {
    it("should return stats for a circuit breaker", () => {
      const serviceName = "test-stats";
      
      recordSuccess(serviceName);
      recordFailure(serviceName);
      
      const stats = getCircuitBreakerStats(serviceName);
      
      expect(stats.name).toBe(serviceName);
      expect(stats.totalCalls).toBe(2);
      expect(stats.totalSuccesses).toBe(1);
      expect(stats.totalFailures).toBe(1);
    });
  });

  describe("getAllCircuitBreakerStats", () => {
    it("should return stats for all default circuit breakers", () => {
      const allStats = getAllCircuitBreakerStats();
      
      expect(allStats.length).toBeGreaterThanOrEqual(Object.keys(DEFAULT_CONFIGS).length);
    });
  });

  describe("resetCircuitBreaker", () => {
    it("should reset a circuit breaker to closed state", () => {
      const serviceName = "test-reset-cb";
      
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        recordFailure(serviceName);
      }
      
      expect(getCircuitBreakerStats(serviceName).state).toBe("OPEN");
      
      resetCircuitBreaker(serviceName);
      
      expect(getCircuitBreakerStats(serviceName).state).toBe("CLOSED");
      expect(getCircuitBreakerStats(serviceName).failures).toBe(0);
    });
  });

  describe("DEFAULT_CONFIGS", () => {
    it("should have configs for common services", () => {
      expect(DEFAULT_CONFIGS.llm).toBeDefined();
      expect(DEFAULT_CONFIGS.database).toBeDefined();
      expect(DEFAULT_CONFIGS.email).toBeDefined();
      expect(DEFAULT_CONFIGS.stripe).toBeDefined();
      expect(DEFAULT_CONFIGS.storage).toBeDefined();
      expect(DEFAULT_CONFIGS.webhook).toBeDefined();
    });

    it("should have valid threshold values", () => {
      Object.values(DEFAULT_CONFIGS).forEach(config => {
        expect(config.failureThreshold).toBeGreaterThan(0);
        expect(config.successThreshold).toBeGreaterThan(0);
        expect(config.timeout).toBeGreaterThan(0);
        expect(config.resetTimeout).toBeGreaterThan(0);
      });
    });
  });
});
