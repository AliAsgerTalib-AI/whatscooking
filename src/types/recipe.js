// ── FlavorLab type definitions (JSDoc) ────────────────────────────────────────
// Usable in any .js/.jsx file via @type {import('./types/recipe.js').Recipe}

/**
 * @typedef {{ prep: string, cook: string, serves: string, difficulty: string, method: string }} RecipeMeta
 */

/**
 * @typedef {{ icon: string, title: string, body: string }} ProTip
 */

/**
 * @typedef {{ icon: string, title: string, body: string }} WatchOut
 */

/**
 * @typedef {{ title: string, body: string }} FlavourTip
 */

/**
 * @typedef {{ title: string, body: string }} KitchenTip
 */

/**
 * Core recipe data returned by the API.
 * @typedef {{
 *   title:        string,
 *   badge:        string,
 *   intro:        string,
 *   meta:         RecipeMeta,
 *   ingredients:  string[],
 *   steps:        string[],
 *   tips:         string,
 *   proTips:      ProTip[],
 *   watchOuts:    WatchOut[],
 *   flavourTips:  FlavourTip[],
 *   kitchenTips:  KitchenTip[],
 *   miseEnPlace?: string[],
 *   haccp?:       string[],
 * }} Recipe
 */

/**
 * @typedef {{
 *   calories: number,
 *   protein:  number,
 *   carbs:    number,
 *   fat:      number,
 *   fiber:    number,
 *   sodium:   number,
 *   note?:    string,
 * }} Nutrition
 */

/**
 * One of the 14 EU allergen IDs (EU Reg. 1169/2011).
 * @typedef {"gluten"|"crustaceans"|"eggs"|"fish"|"peanuts"|"soybeans"|"dairy"|"nuts"|"celery"|"mustard"|"sesame"|"sulphites"|"lupin"|"molluscs"} AllergenId
 */

/**
 * @typedef {{ id: AllergenId, present: boolean, mayContain: boolean }} AllergenStatus
 */

/**
 * Static allergen metadata stored in src/data/allergens.js.
 * @typedef {{ id: AllergenId, label: string, icon: string, color: string }} AllergenMeta
 */

/**
 * A saved recipe stored in localStorage["flavorlab_favs"].
 * @typedef {{
 *   id:        string,
 *   recipe:    Recipe,
 *   nutrition: Nutrition|null,
 *   tags:      string[],
 *   savedAt:   number,
 * }} Favorite
 */

/**
 * Optional metadata for the professional recipe card PDF.
 * @typedef {{
 *   chefName:        string,
 *   station:         string,
 *   version:         string,
 *   costPerPortion:  string,
 *   ingredients?:    Array<{name: string, cost?: string}>,
 *   totalCost?:      string,
 * }} ProFields
 */

/**
 * @typedef {{
 *   ingredientTags:   string[],
 *   cuisine:          string,
 *   selectedFlavors:  string[],
 *   selectedDiets:    string[],
 *   selectedMethod:   string,
 *   selectedAllergens:string[],
 *   servings:         number,
 *   cookType:         object|null,
 * }} GenerateRecipeParams
 */

/**
 * @typedef {{ recipe: Recipe, nutrition: Nutrition|null, servings: number }} GenerateRecipeResult
 */

/**
 * An item in CUISINES, FLAVORS, DIETS, or METHODS.
 * @typedef {{ label: string, val: string }} SelectOption
 */
