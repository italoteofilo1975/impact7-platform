import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  sanitizeObject,
  isValidEmail,
  isValidUrl,
  isValidUuid,
  commonSchemas,
  contactFormSchema,
  validateAndSanitize,
} from "./input-validation";

describe("Input Validation", () => {
  describe("sanitizeString", () => {
    it("should remove null bytes", () => {
      expect(sanitizeString("hello\0world")).toBe("helloworld");
    });

    it("should escape HTML tags", () => {
      expect(sanitizeString("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert('xss')&lt;/script&gt;"
      );
    });

    it("should remove control characters", () => {
      expect(sanitizeString("hello\x00\x01\x02world")).toBe("helloworld");
    });

    it("should trim whitespace", () => {
      expect(sanitizeString("  hello  ")).toBe("hello");
    });

    it("should handle empty string", () => {
      expect(sanitizeString("")).toBe("");
    });

    it("should handle non-string input", () => {
      expect(sanitizeString(null as unknown as string)).toBe("");
      expect(sanitizeString(undefined as unknown as string)).toBe("");
    });
  });

  describe("sanitizeObject", () => {
    it("should sanitize nested strings", () => {
      const input = {
        name: "<script>alert('xss')</script>",
        nested: {
          value: "<b>bold</b>",
        },
      };
      const result = sanitizeObject(input);
      expect(result.name).toBe("&lt;script&gt;alert('xss')&lt;/script&gt;");
      expect(result.nested.value).toBe("&lt;b&gt;bold&lt;/b&gt;");
    });

    it("should sanitize arrays of strings", () => {
      const input = {
        tags: ["<script>", "normal", "<b>bold</b>"],
      };
      const result = sanitizeObject(input);
      expect(result.tags).toEqual(["&lt;script&gt;", "normal", "&lt;b&gt;bold&lt;/b&gt;"]);
    });

    it("should preserve non-string values", () => {
      const input = {
        count: 42,
        active: true,
        date: new Date("2024-01-01"),
      };
      const result = sanitizeObject(input);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
    });
  });

  describe("isValidUrl", () => {
    it("should validate correct URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://localhost:3000")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("ftp://example.com")).toBe(true); // FTP is valid URL
    });
  });

  describe("isValidUuid", () => {
    it("should validate correct UUIDs", () => {
      expect(isValidUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    it("should reject invalid UUIDs", () => {
      expect(isValidUuid("not-a-uuid")).toBe(false);
      expect(isValidUuid("550e8400-e29b-41d4-a716")).toBe(false);
    });
  });

  describe("commonSchemas", () => {
    it("should validate name", () => {
      expect(commonSchemas.name.safeParse("João Silva").success).toBe(true);
      expect(commonSchemas.name.safeParse("A").success).toBe(false);
      expect(commonSchemas.name.safeParse("Name123").success).toBe(false);
    });

    it("should validate phone", () => {
      expect(commonSchemas.phone.safeParse("+55 11 99999-9999").success).toBe(true);
      expect(commonSchemas.phone.safeParse("(11) 99999-9999").success).toBe(true);
    });

    it("should validate percentage", () => {
      expect(commonSchemas.percentage.safeParse(50).success).toBe(true);
      expect(commonSchemas.percentage.safeParse(101).success).toBe(false);
      expect(commonSchemas.percentage.safeParse(-1).success).toBe(false);
    });
  });

  describe("contactFormSchema", () => {
    it("should validate correct contact form", () => {
      const validForm = {
        name: "João Silva",
        email: "joao@example.com",
        subject: "Dúvida sobre o método",
        message: "Gostaria de saber mais sobre o IMPACT7.",
      };
      expect(contactFormSchema.safeParse(validForm).success).toBe(true);
    });

    it("should reject invalid contact form", () => {
      const invalidForm = {
        name: "A", // too short
        email: "invalid-email",
        subject: "",
        message: "",
      };
      expect(contactFormSchema.safeParse(invalidForm).success).toBe(false);
    });
  });

  describe("validateAndSanitize", () => {
    it("should sanitize and validate", () => {
      const input = {
        name: "  João Silva  ",
        email: "joao@example.com",
        subject: "<script>alert('xss')</script>",
        message: "Mensagem normal",
      };
      const result = validateAndSanitize(contactFormSchema, input);
      expect(result.name).toBe("João Silva");
      expect(result.subject).toBe("&lt;script&gt;alert('xss')&lt;/script&gt;");
    });

    it("should throw on invalid data", () => {
      const input = {
        name: "A",
        email: "invalid",
        subject: "",
        message: "",
      };
      expect(() => validateAndSanitize(contactFormSchema, input)).toThrow();
    });
  });
});
