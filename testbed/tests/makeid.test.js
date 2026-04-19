import { describe, it, expect } from "vitest";
import { makeid } from "../../src/utils/makeid.js";

describe("makeid", () => {
  it("returns a non-empty string", () => {
    expect(typeof makeid()).toBe("string");
    expect(makeid().length).toBeGreaterThan(0);
  });

  it("returns unique values on successive calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => makeid()));
    expect(ids.size).toBe(100);
  });

  it("returns a UUID-shaped string when crypto is available", () => {
    const id = makeid();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidRegex);
  });
});
