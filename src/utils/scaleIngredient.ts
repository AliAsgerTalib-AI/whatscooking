import { formatNum } from "./formatNum";

export function scaleIngredient(text: string, ratio: number): string {
  if (ratio === 1) return text;
  return text.replace(/\d+\.?\d*(?:\/\d+)?/g, m => {
    const val = m.includes("/")
      ? m.split("/").reduce((a, b, i) => i === 0 ? +a : +a / +b)
      : parseFloat(m);
    return formatNum(val * ratio);
  });
}
