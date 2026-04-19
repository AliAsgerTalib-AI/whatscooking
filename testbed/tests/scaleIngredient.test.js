import { describe, it, expect } from "vitest";
import { scaleIngredient } from "../../src/utils/scaleIngredient.js";

describe("scaleIngredient", () => {
  it("returns text unchanged when ratio is 1", () => {
    expect(scaleIngredient("2 cups flour", 1)).toBe("2 cups flour");
  });

  it("doubles integer quantities", () => {
    expect(scaleIngredient("2 cups flour", 2)).toBe("4 cups flour");
  });

  it("halves integer quantities using fraction symbols", () => {
    expect(scaleIngredient("2 cups flour", 0.5)).toBe("1 cups flour");
  });

  it("scales decimal quantities", () => {
    expect(scaleIngredient("1.5 kg chicken", 2)).toBe("3 kg chicken");
  });

  it("scales fraction notation (1/2)", () => {
    expect(scaleIngredient("1/2 tsp salt", 2)).toBe("1 tsp salt");
  });

  it("scales fraction notation and produces fraction symbol", () => {
    expect(scaleIngredient("1/2 tsp salt", 0.5)).toBe("¼ tsp salt");
  });

  it("handles multiple numbers in one string", () => {
    expect(scaleIngredient("2 cups and 1 tsp", 2)).toBe("4 cups and 2 tsp");
  });

  it("handles zero ratio producing '0'", () => {
    expect(scaleIngredient("3 eggs", 0)).toBe("0 eggs");
  });
});
