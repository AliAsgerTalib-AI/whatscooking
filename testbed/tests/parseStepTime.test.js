import { describe, it, expect } from "vitest";
import { parseStepTime } from "../../src/utils/parseStepTime.js";

describe("parseStepTime", () => {
  it("returns null for steps with no time hint", () => {
    expect(parseStepTime("Chop the onions finely")).toBeNull();
    expect(parseStepTime("Season with salt and pepper")).toBeNull();
  });

  it("handles en-dash range 'cook for 3–4 minutes' → 240 (takes upper bound)", () => {
    expect(parseStepTime("Cook for 3–4 minutes until golden")).toBe(240);
  });

  it("handles hyphen range 'fry for 3-4 minutes' → 240", () => {
    expect(parseStepTime("Fry for 3-4 minutes")).toBe(240);
  });

  it("handles 'to' range '3 to 4 minutes' → 240", () => {
    expect(parseStepTime("Simmer for 3 to 4 minutes")).toBe(240);
  });

  it("handles 'about 10 minutes' → 600", () => {
    expect(parseStepTime("Cook for about 10 minutes")).toBe(600);
  });

  it("handles plain '5 min' → 300", () => {
    expect(parseStepTime("Rest the dough for 5 min")).toBe(300);
  });

  it("handles '30 seconds' → 30", () => {
    expect(parseStepTime("Stir vigorously for 30 seconds")).toBe(30);
  });

  it("handles '1 hour' → 3600", () => {
    expect(parseStepTime("Roast for 1 hour until caramelised")).toBe(3600);
  });

  it("handles '1-2 hours' → 7200 (takes upper bound)", () => {
    expect(parseStepTime("Braise for 1–2 hours until tender")).toBe(7200);
  });

  it("prefers minutes over seconds when both appear", () => {
    expect(parseStepTime("Cook for 2 minutes, stirring every 30 seconds")).toBe(120);
  });
});
