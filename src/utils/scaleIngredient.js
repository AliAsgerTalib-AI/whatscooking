import { formatNum } from "./formatNum.js";

/**
 * Scales all numeric quantities in an ingredient string by the given ratio.
 * Handles plain decimals and simple fractions (e.g. "1/2").
 */
export function scaleIngredient(text, ratio) {
  if (ratio === 1) return text;
  return text.replace(/\d+\.?\d*(?:\/\d+)?/g, m => {
    const val = m.includes("/")
      ? m.split("/").reduce((a, b, i) => i === 0 ? +a : +a / +b)
      : parseFloat(m);
    return formatNum(val * ratio);
  });
}
