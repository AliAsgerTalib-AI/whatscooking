import type { SelectOption } from "../types/recipe";

export const METHODS: SelectOption[] = [
  { label: "🍳 Stovetop", val: "Stovetop" },    { label: "🌡️ Oven / Bake", val: "Oven-Baked" },
  { label: "🔥 Grill / BBQ", val: "Grilled" },  { label: "💨 Air Fryer", val: "Air Fryer" },
  { label: "⚡ Instant Pot", val: "Instant Pot" },{ label: "🐢 Slow Cooker", val: "Slow Cooker" },
  { label: "🫕 One Pan", val: "One-Pan" },       { label: "🥗 No-Cook", val: "No-Cook / Raw" },
  { label: "🍱 Wok / Stir Fry", val: "Wok / Stir Fry" }, { label: "♨️ Steamed", val: "Steamed" },
];

export const SERVING_PRESETS:   number[] = [1, 2, 4, 6, 8, 12];
export const PRO_BATCH_PRESETS:  number[] = [10, 20, 50, 100, 200];
