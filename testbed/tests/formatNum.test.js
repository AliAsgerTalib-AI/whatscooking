import { describe, it, expect } from "vitest";
import { formatNum } from "../../src/utils/formatNum.js";

describe("formatNum", () => {
  it("returns '0' for zero and negative numbers", () => {
    expect(formatNum(0)).toBe("0");
    expect(formatNum(-1)).toBe("0");
  });

  it("returns string integer for whole numbers", () => {
    expect(formatNum(1)).toBe("1");
    expect(formatNum(3)).toBe("3");
    expect(formatNum(10)).toBe("10");
  });

  it("returns unicode fraction for 0.25", () => {
    expect(formatNum(0.25)).toBe("¼");
  });

  it("returns unicode fraction for 0.5", () => {
    expect(formatNum(0.5)).toBe("½");
  });

  it("returns unicode fraction for 0.75", () => {
    expect(formatNum(0.75)).toBe("¾");
  });

  it("returns unicode fraction for 0.33", () => {
    expect(formatNum(0.33)).toBe("⅓");
  });

  it("returns unicode fraction for 0.67", () => {
    expect(formatNum(0.67)).toBe("⅔");
  });

  it("combines whole number with fraction for 1.5", () => {
    expect(formatNum(1.5)).toBe("1½");
  });

  it("combines whole number with fraction for 2.25", () => {
    expect(formatNum(2.25)).toBe("2¼");
  });

  it("falls back to one decimal place for unrecognized fractions", () => {
    expect(formatNum(1.1)).toBe("1.1");
    expect(formatNum(1.9)).toBe("1.9");
  });
});
