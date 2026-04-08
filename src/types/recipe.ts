// ── FlavorLab type definitions ─────────────────────────────────────────────────
// These interfaces document every object shape used across the application.
// They are ready to be consumed once the .js/.jsx files are converted to .ts/.tsx.

// ── Recipe ─────────────────────────────────────────────────────────────────────

export interface RecipeMeta {
  prep:       string;   // e.g. "15 min"
  cook:       string;   // e.g. "25 min"
  serves:     string;   // e.g. "4"
  difficulty: string;   // "Easy" | "Intermediate" | "Advanced"
  method:     string;   // e.g. "Stovetop"
}

export interface ProTip {
  icon:  string;   // emoji
  title: string;
  body:  string;
}

export interface WatchOut {
  icon:  string;   // emoji
  title: string;
  body:  string;
}

/** Core recipe data returned by the API (both Home and Pro mode). */
export interface Recipe {
  title:       string;
  badge:       string;       // cuisine label, e.g. "Japanese"
  intro:       string;       // one-sentence vivid description
  meta:        RecipeMeta;
  ingredients: string[];     // one item per ingredient, quantity included
  steps:       string[];     // full numbered step text
  tips:        string;       // single chef tip string
  proTips:     ProTip[];
  watchOuts:   WatchOut[];
  // Pro-mode only fields:
  miseEnPlace?: string[];    // prep tasks for professional kitchen
  haccp?:       string[];    // food safety critical control points
}

// ── Nutrition ──────────────────────────────────────────────────────────────────

export interface Nutrition {
  calories: number;   // kcal per serving
  protein:  number;   // grams
  carbs:    number;   // grams
  fat:      number;   // grams
  fiber:    number;   // grams
  sodium:   number;   // milligrams
  note?:    string;   // "Estimated values per serving"
}

// ── Allergens ─────────────────────────────────────────────────────────────────

/** One of the 14 EU allergen IDs (EU Reg. 1169/2011). */
export type AllergenId =
  | "gluten"
  | "crustaceans"
  | "eggs"
  | "fish"
  | "peanuts"
  | "soybeans"
  | "dairy"
  | "nuts"
  | "celery"
  | "mustard"
  | "sesame"
  | "sulphites"
  | "lupin"
  | "molluscs";

/** An allergen status entry returned by the Pro-mode API. */
export interface AllergenStatus {
  id:         AllergenId;
  present:    boolean;    // dish actively contains this allergen
  mayContain: boolean;    // cross-contamination risk
}

/** Static allergen metadata stored in src/data/allergens.js. */
export interface AllergenMeta {
  id:    AllergenId;
  label: string;    // e.g. "Gluten"
  icon:  string;    // emoji
  color: string;    // hex, used for UI accents
}

// ── Favorites ──────────────────────────────────────────────────────────────────

/** A saved recipe stored in localStorage["flavorlab_favs"]. */
export interface Favorite {
  id:        string;               // short random ID from makeid()
  recipe:    Recipe;
  nutrition: Nutrition | null;
  allergens: AllergenStatus[] | null;
  tags:      string[];             // ingredient tags at time of save
  savedAt:   number;               // Date.now() timestamp
  proMode:   boolean;
}

// ── Pro Fields ─────────────────────────────────────────────────────────────────

/** Optional metadata the user fills in for the professional recipe card PDF. */
export interface ProFields {
  chefName:       string;
  station:        string;    // e.g. "Hot line", "Pastry"
  version:        string;    // e.g. "1.2"
  costPerPortion: string;    // free-text, e.g. "$4.20"
  // Optional per-ingredient cost breakdown (for cost table in PDF):
  ingredients?: Array<{ name: string; cost?: string }>;
  totalCost?:   string;
}

// ── API ───────────────────────────────────────────────────────────────────────

/** Input parameters for generateRecipe() in src/api/recipeApi.js. */
export interface GenerateRecipeParams {
  ingredientTags:  string[];
  cuisine:         string;     // resolved: customCuisine || selectedCuisine
  selectedFlavors: string[];
  selectedDiets:   string[];
  selectedMethod:  string;
  servings:        number;
  proMode:         boolean;
  apiKey?:         string;     // optional; use server-side proxy in production
}

/** Return value of generateRecipe(). */
export interface GenerateRecipeResult {
  recipe:    Recipe;
  nutrition: Nutrition | null;
  allergens: AllergenStatus[] | null;
  servings:  number;           // parsed from meta.serves
}

// ── Data constants ─────────────────────────────────────────────────────────────

/** An item in CUISINES, FLAVORS, DIETS, or METHODS. */
export interface SelectOption {
  label: string;   // display string (may include emoji)
  val:   string;   // value sent to the API
}
