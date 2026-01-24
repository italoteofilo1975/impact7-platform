import { describe, it, expect } from "vitest";
import {
  withTimeout,
  withRetry,
  withResiliency,
  getTimeoutConfig,
  TimeoutError,
  RetryExhaustedError,
  DEFAULT_TIMEOUTS,
} from "./timeout-service";

describe("Timeout Service", () => {
  describe("withTimeout", () => {
    it("should resolve when function completes within timeout", async () => {
      const result = await withTimeout(
        async () => "success",
        1000,
        "test"
      );
      
      expect(result).toBe("success");
    });

    it("should reject with TimeoutError when function exceeds timeout", async () => {
      await expect(
        withTimeout(
          async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            return "success";
          },
          50,
          "test"
        )
      ).rejects.toThrow(TimeoutError);
    });

    it("should propagate errors from the function", async () => {
      await expect(
        withTimeout(
          async () => { throw new Error("test error"); },
          1000,
          "test"
        )
      ).rejects.toThrow("test error");
    });
  });

  describe("withRetry", () => {
    it("should succeed on first attempt", async () => {
      let attempts = 0;
      
      const result = await withRetry(
        async () => {
          attempts++;
          return "success";
        },
        { name: "test", retries: 3, timeout: 1000, retryDelay: 10, exponentialBackoff: false }
      );
      
      expect(result).toBe("success");
      expect(attempts).toBe(1);
    });

    it("should retry on failure", async () => {
      let attempts = 0;
      
      const result = await withRetry(
        async () => {
          attempts++;
          if (attempts < 3) throw new Error("fail");
          return "success";
        },
        { name: "test", retries: 3, timeout: 1000, retryDelay: 10, exponentialBackoff: false }
      );
      
      expect(result).toBe("success");
      expect(attempts).toBe(3);
    });

    it("should throw RetryExhaustedError after all retries fail", async () => {
      await expect(
        withRetry(
          async () => { throw new Error("always fails"); },
          { name: "test", retries: 2, timeout: 1000, retryDelay: 10, exponentialBackoff: false }
        )
      ).rejects.toThrow(RetryExhaustedError);
    });
  });

  describe("withResiliency", () => {
    it("should execute function successfully", async () => {
      const result = await withResiliency(
        "http",
        async () => "success"
      );
      
      expect(result).toBe("success");
    });

    it("should use fallback on failure", async () => {
      const result = await withResiliency(
        "http",
        async () => { throw new Error("fail"); },
        {
          retries: 0,
          fallback: () => "fallback"
        }
      );
      
      expect(result).toBe("fallback");
    });
  });

  describe("getTimeoutConfig", () => {
    it("should return config for known service", () => {
      const config = getTimeoutConfig("llm");
      
      expect(config.name).toBe("llm");
      expect(config.timeout).toBe(60000);
    });

    it("should return default http config for unknown service", () => {
      const config = getTimeoutConfig("unknown-service");
      
      expect(config.timeout).toBe(DEFAULT_TIMEOUTS.http.timeout);
    });
  });

  describe("DEFAULT_TIMEOUTS", () => {
    it("should have configs for common services", () => {
      expect(DEFAULT_TIMEOUTS.llm).toBeDefined();
      expect(DEFAULT_TIMEOUTS.database).toBeDefined();
      expect(DEFAULT_TIMEOUTS.email).toBeDefined();
      expect(DEFAULT_TIMEOUTS.stripe).toBeDefined();
      expect(DEFAULT_TIMEOUTS.storage).toBeDefined();
      expect(DEFAULT_TIMEOUTS.webhook).toBeDefined();
      expect(DEFAULT_TIMEOUTS.http).toBeDefined();
    });

    it("should have appropriate timeout values", () => {
      // LLM should have longer timeout
      expect(DEFAULT_TIMEOUTS.llm.timeout).toBeGreaterThanOrEqual(60000);
      
      // Database should be fast
      expect(DEFAULT_TIMEOUTS.database.timeout).toBeLessThanOrEqual(10000);
      
      // Webhook should be quick
      expect(DEFAULT_TIMEOUTS.webhook.timeout).toBeLessThanOrEqual(10000);
    });
  });

  describe("TimeoutError", () => {
    it("should contain operation details", () => {
      const error = new TimeoutError("test-op", 5000, 2);
      
      expect(error.operation).toBe("test-op");
      expect(error.timeout).toBe(5000);
      expect(error.attempt).toBe(2);
      expect(error.name).toBe("TimeoutError");
    });
  });

  describe("RetryExhaustedError", () => {
    it("should contain retry details", () => {
      const lastError = new Error("last error");
      const error = new RetryExhaustedError("test-op", 3, lastError);
      
      expect(error.operation).toBe("test-op");
      expect(error.attempts).toBe(3);
      expect(error.lastError).toBe(lastError);
      expect(error.name).toBe("RetryExhaustedError");
    });
  });
});
