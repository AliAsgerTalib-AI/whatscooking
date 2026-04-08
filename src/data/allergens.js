// EU Regulation 1169/2011 — 14 major allergens

/** @type {import("../types/recipe.ts").AllergenMeta[]} */
export const ALLERGENS = [
  { id: "gluten",      label: "Gluten",         icon: "🌾", color: "#f59e0b" },
  { id: "crustaceans", label: "Crustaceans",     icon: "🦐", color: "#ef4444" },
  { id: "eggs",        label: "Eggs",            icon: "🥚", color: "#eab308" },
  { id: "fish",        label: "Fish",            icon: "🐟", color: "#3b82f6" },
  { id: "peanuts",     label: "Peanuts",         icon: "🥜", color: "#a16207" },
  { id: "soybeans",    label: "Soybeans",        icon: "🫘", color: "#65a30d" },
  { id: "dairy",       label: "Dairy / Milk",    icon: "🥛", color: "#0ea5e9" },
  { id: "nuts",        label: "Tree Nuts",       icon: "🌰", color: "#92400e" },
  { id: "celery",      label: "Celery",          icon: "🥬", color: "#16a34a" },
  { id: "mustard",     label: "Mustard",         icon: "🌿", color: "#ca8a04" },
  { id: "sesame",      label: "Sesame",          icon: "🌱", color: "#d97706" },
  { id: "sulphites",   label: "Sulphites/SO₂",  icon: "🍷", color: "#9333ea" },
  { id: "lupin",       label: "Lupin",           icon: "🌸", color: "#ec4899" },
  { id: "molluscs",    label: "Molluscs",        icon: "🐚", color: "#64748b" },
];
