// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  storageGet,
  storageSet,
  storageRemove,
  storageAvailable,
} from "../../src/utils/storage.js";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("storageAvailable", () => {
    it("returns true in jsdom environment", () => {
      expect(storageAvailable()).toBe(true);
    });
  });

  describe("storageSet / storageGet round-trip", () => {
    it("stores and retrieves a string value", () => {
      storageSet("test", "hello");
      const result = storageGet("test", null);
      expect(result.ok).toBe(true);
      expect(result.value).toBe("hello");
    });

    it("stores and retrieves an object value", () => {
      storageSet("prefs", { theme: "dark" });
      const result = storageGet("prefs", null);
      expect(result.ok).toBe(true);
      expect(result.value).toEqual({ theme: "dark" });
    });

    it("uses the flavorlab_ prefix (key is not stored bare)", () => {
      storageSet("mykey", 42);
      expect(localStorage.getItem("mykey")).toBeNull();
      expect(localStorage.getItem("flavorlab_mykey")).toBe("42");
    });
  });

  describe("storageGet fallback", () => {
    it("returns fallback when key does not exist", () => {
      const result = storageGet("nonexistent", "default");
      expect(result.ok).toBe(true);
      expect(result.value).toBe("default");
    });
  });

  describe("storageRemove", () => {
    it("removes a stored key", () => {
      storageSet("toRemove", "data");
      storageRemove("toRemove");
      const result = storageGet("toRemove", "fallback");
      expect(result.value).toBe("fallback");
    });

    it("returns ok:true even when key does not exist", () => {
      const result = storageRemove("phantom");
      expect(result.ok).toBe(true);
    });
  });
});
