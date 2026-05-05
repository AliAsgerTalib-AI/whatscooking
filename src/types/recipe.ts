// ── Karigar type definitions ─────────────────────────────────────────────────

// ── Recipe ─────────────────────────────────────────────────────────────────────

export interface RecipeMeta {
  prep:       string;
  cook:       string;
  serves:     string;
  difficulty: string;
  method:     string;
}

export interface ProTip {
  icon:  string;
  title: string;
  body:  string;
}

export interface WatchOut {
  icon:  string;
  title: string;
  body:  string;
}

export interface FlavourTip {
  title: string;
  body:  string;
}

export interface KitchenTip {
  title: string;
  body:  string;
}

export interface Recipe {
  title:        string;
  badge:        string;
  intro:        string;
  meta:         RecipeMeta;
  ingredients:  string[];
  steps:        string[];
  tips:         string;
  proTips:      ProTip[];
  watchOuts:    WatchOut[];
  flavourTips:  FlavourTip[];
  kitchenTips:  KitchenTip[];
  miseEnPlace?: string[];
  haccp?:       string[];
}

// ── Cook Type ─────────────────────────────────────────────────────────────────

export interface CookType {
  val:     string;
  icon:    string;
  label:   string;
  tagline: string;
  prompt:  string;
}

// ── Allergens ─────────────────────────────────────────────────────────────────

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

export interface AllergenStatus {
  id:         AllergenId;
  present:    boolean;
  mayContain: boolean;
}

export interface AllergenMeta {
  id:    AllergenId;
  label: string;
  icon:  string;
  color: string;
}

// ── Favorites ──────────────────────────────────────────────────────────────────

export interface Favorite {
  id:      string;
  recipe:  Recipe;
  tags:    string[];
  savedAt: number;
}

// ── Pro Fields ─────────────────────────────────────────────────────────────────

export interface ProFields {
  chefName:       string;
  station:        string;
  version:        string;
  costPerPortion: string;
  ingredients?:   Array<{ name: string; cost?: string }>;
  totalCost?:     string;
}

// ── API ───────────────────────────────────────────────────────────────────────

export interface GenerateRecipeParams {
  ingredientTags:   string[];
  cuisine:          string;
  selectedFlavors:  string[];
  selectedDiets:    string[];
  selectedMethod:   string;
  selectedAllergens:string[];
  servings:         number;
  cookType:         CookType | null;
}

export interface GenerateRecipeResult {
  recipe:   Recipe;
  servings: number;
}

// ── Data constants ─────────────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  val:   string;
}
