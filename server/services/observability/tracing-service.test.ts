import { describe, it, expect, beforeEach } from "vitest";
import {
  createTrace,
  createSpan,
  endSpan,
  addSpanEvent,
  setSpanAttribute,
  withTracing,
  withChildSpan,
  getTrace,
  getRecentTraces,
  getTraceStats,
  clearTraces,
  generateTraceId,
  generateSpanId,
} from "./tracing-service";

describe("Tracing Service", () => {
  beforeEach(() => {
    clearTraces();
  });

  describe("generateTraceId", () => {
    it("should generate unique trace IDs", () => {
      const id1 = generateTraceId();
      const id2 = generateTraceId();
      
      expect(id1).not.toBe(id2);
      expect(id1.length).toBe(32);
      expect(id2.length).toBe(32);
    });
  });

  describe("generateSpanId", () => {
    it("should generate unique span IDs", () => {
      const id1 = generateSpanId();
      const id2 = generateSpanId();
      
      expect(id1).not.toBe(id2);
      expect(id1.length).toBe(16);
      expect(id2.length).toBe(16);
    });
  });

  describe("createTrace", () => {
    it("should create a new trace with context", () => {
      const context = createTrace("test-trace");
      
      expect(context.traceId).toBeDefined();
      expect(context.spanId).toBeDefined();
      expect(context.name).toBe("test-trace");
      expect(context.startTime).toBeGreaterThan(0);
    });

    it("should accept attributes", () => {
      const context = createTrace("test-trace", { key: "value" });
      
      expect(context.attributes.key).toBe("value");
    });
  });

  describe("createSpan", () => {
    it("should create a child span", () => {
      const parent = createTrace("parent-trace");
      const child = createSpan(parent, "child-span");
      
      expect(child.traceId).toBe(parent.traceId);
      expect(child.parentSpanId).toBe(parent.spanId);
      expect(child.spanId).not.toBe(parent.spanId);
    });
  });

  describe("endSpan", () => {
    it("should end a span with OK status", () => {
      const context = createTrace("test-trace");
      endSpan(context, "OK");
      
      const traces = getRecentTraces();
      expect(traces.length).toBe(1);
      expect(traces[0].status).toBe("OK");
      expect(traces[0].duration).toBeGreaterThanOrEqual(0);
    });

    it("should end a span with ERROR status", () => {
      const context = createTrace("test-trace");
      endSpan(context, "ERROR");
      
      const traces = getRecentTraces();
      expect(traces[0].status).toBe("ERROR");
    });
  });

  describe("addSpanEvent", () => {
    it("should add event to active span", () => {
      const context = createTrace("test-trace");
      addSpanEvent(context, "test-event", { data: "value" });
      endSpan(context);
      
      const traces = getRecentTraces();
      expect(traces[0].events.length).toBe(1);
      expect(traces[0].events[0].name).toBe("test-event");
    });
  });

  describe("setSpanAttribute", () => {
    it("should set attribute on active span", () => {
      const context = createTrace("test-trace");
      setSpanAttribute(context, "custom.key", "custom-value");
      endSpan(context);
      
      const traces = getRecentTraces();
      expect(traces[0].attributes["custom.key"]).toBe("custom-value");
    });
  });

  describe("withTracing", () => {
    it("should trace successful function execution", async () => {
      const result = await withTracing("test-operation", async () => {
        return "success";
      });
      
      expect(result).toBe("success");
      
      const traces = getRecentTraces();
      expect(traces.length).toBe(1);
      expect(traces[0].status).toBe("OK");
    });

    it("should trace failed function execution", async () => {
      await expect(
        withTracing("failing-operation", async () => {
          throw new Error("test error");
        })
      ).rejects.toThrow("test error");
      
      const traces = getRecentTraces();
      expect(traces[0].status).toBe("ERROR");
      expect(traces[0].attributes["error.message"]).toBe("test error");
    });
  });

  describe("withChildSpan", () => {
    it("should create nested spans", async () => {
      await withTracing("parent", async (parentCtx) => {
        await withChildSpan(parentCtx, "child", async () => {
          return "done";
        });
        return "parent done";
      });
      
      const traces = getRecentTraces();
      expect(traces.length).toBe(2);
      
      const parent = traces.find(t => t.name === "parent");
      const child = traces.find(t => t.name === "child");
      
      expect(parent).toBeDefined();
      expect(child).toBeDefined();
      expect(child?.parentSpanId).toBe(parent?.spanId);
    });
  });

  describe("getTrace", () => {
    it("should return spans for a trace ID", async () => {
      const context = createTrace("test-trace");
      const traceId = context.traceId;
      
      createSpan(context, "child-1");
      createSpan(context, "child-2");
      
      endSpan(context);
      
      const spans = getTrace(traceId);
      expect(spans.length).toBe(1); // Only completed spans
    });
  });

  describe("getTraceStats", () => {
    it("should return trace statistics", async () => {
      await withTracing("op1", async () => "done");
      await withTracing("op2", async () => "done");
      
      const stats = getTraceStats();
      
      expect(stats.completedSpans).toBe(2);
      expect(stats.activeSpans).toBe(0);
      expect(stats.errorRate).toBe(0);
      expect(stats.avgDuration).toBeGreaterThanOrEqual(0);
    });

    it("should calculate error rate", async () => {
      await withTracing("success", async () => "done");
      
      try {
        await withTracing("fail", async () => { throw new Error("fail"); });
      } catch (e) {}
      
      const stats = getTraceStats();
      expect(stats.errorRate).toBe(0.5);
    });
  });

  describe("clearTraces", () => {
    it("should clear all traces", async () => {
      await withTracing("test", async () => "done");
      
      expect(getRecentTraces().length).toBe(1);
      
      clearTraces();
      
      expect(getRecentTraces().length).toBe(0);
    });
  });
});
