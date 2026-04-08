/**
 * Anthropic Claude API call + prompt builder for FlavorLab.
 *
 * Uses the Anthropic Messages REST API (no SDK needed).
 * Endpoint: https://api.anthropic.com/v1/messages
 *
 * ⚠️ Security: API key is sent directly from the browser.
 *    Move to a server-side proxy before public deployment (see PLAN.md).
 *
 * @param {import("../types/recipe.ts").GenerateRecipeParams} opts
 * @returns {Promise<import("../types/recipe.ts").GenerateRecipeResult>}
 */

// ── Models — swap these strings to upgrade without touching any other code ──────
const HOME_MODEL = "claude-sonnet-4-20250514";
const PRO_MODEL  = "claude-sonnet-4-20250514";

// ── Constants ────────────────────────────────────────────────────────────────────
const ANTHROPIC_BASE       = "https://api.anthropic.com/v1/messages";
const MAX_RESPONSE_CHARS   = 32_000;   // guard against runaway JSON from the model
const HOME_MAX_TOKENS      = 2800;
const PRO_MAX_TOKENS       = 3200;
const GENERATION_TEMP      = 0.8;

export async function generateRecipe({
  ingredientTags,
  cuisine,
  selectedFlavors,
  selectedDiets,
  selectedMethod,
  servings,
  proMode,
  apiKey,
}) {
  const ingList = ingredientTags.join(", ");
  const model   = proMode ? PRO_MODEL : HOME_MODEL;

  const homePrompt = `You are a creative world-class chef and nutritionist. Create a complete recipe.

INGREDIENTS: ${ingList}
${cuisine             ? `CUISINE STYLE: ${cuisine}`                                       : ""}
${selectedFlavors.length ? `FLAVOR PROFILE: ${selectedFlavors.join(", ")}`              : ""}
${selectedDiets.length   ? `DIETARY REQUIREMENTS (strictly follow ALL): ${selectedDiets.join(", ")}` : ""}
${selectedMethod      ? `COOKING METHOD (must use this): ${selectedMethod}`              : ""}
SERVING SIZE: ${servings} people

Respond ONLY with a valid JSON object. No markdown, no explanation. Exact structure:
{
  "title": "Creative dish name",
  "badge": "Cuisine label",
  "intro": "One vivid sentence.",
  "meta": { "prep": "15 min", "cook": "25 min", "serves": "${servings}", "difficulty": "Easy", "method": "${selectedMethod || "Stovetop"}" },
  "ingredients": ["quantity + ingredient for ${servings} people", "..."],
  "steps": ["Full step 1.", "Full step 2.", "..."],
  "tips": "One short chef tip or substitution idea.",
  "proTips": [
    { "icon": "🔥", "title": "Short tip title", "body": "Detailed tip." },
    { "icon": "🧂", "title": "Another tip title", "body": "Another useful insight." },
    { "icon": "⏱", "title": "Timing tip", "body": "Timing advice." }
  ],
  "watchOuts": [
    { "icon": "⚠️", "title": "Common mistake", "body": "What goes wrong and how to avoid it." },
    { "icon": "🌡️", "title": "Temperature warning", "body": "Heat and doneness tips." },
    { "icon": "🧪", "title": "Texture pitfall", "body": "What ruins this dish." }
  ],
  "nutrition": { "calories": 420, "protein": 32, "carbs": 38, "fat": 14, "fiber": 5, "sodium": 680, "note": "Estimated values per serving" }
}`;

  const proPrompt = `You are an executive chef and food safety expert creating a professional kitchen recipe card.

INGREDIENTS: ${ingList}
${cuisine             ? `CUISINE STYLE: ${cuisine}`                                       : ""}
${selectedFlavors.length ? `FLAVOR PROFILE: ${selectedFlavors.join(", ")}`              : ""}
${selectedDiets.length   ? `DIETARY REQUIREMENTS (strictly follow ALL): ${selectedDiets.join(", ")}` : ""}
${selectedMethod      ? `COOKING METHOD: ${selectedMethod}`                              : ""}
YIELD / SERVING SIZE: ${servings} portions

Writing for a professional kitchen brigade. Use metric weights, precise temperatures (°C), and correct culinary technique.

Respond ONLY with a valid JSON object. No markdown, no explanation. Exact structure:
{
  "title": "Professional dish name",
  "badge": "Cuisine category",
  "intro": "One precise professional description.",
  "meta": { "prep": "20 min", "cook": "35 min", "serves": "${servings}", "difficulty": "Intermediate", "method": "${selectedMethod || "Stovetop"}" },
  "ingredients": ["200g chicken breast (trimmed)", "... use metric weights for all"],
  "steps": ["Precise step with temp e.g. Sear at 220°C for 2 min each side until golden.", "..."],
  "tips": "Professional chef tip.",
  "miseEnPlace": ["Brunoise 200g shallots", "Reduce 500ml stock to 150ml", "..."],
  "proTips": [
    { "icon": "🌡️", "title": "Internal temp", "body": "Exact probe temperature and doneness." },
    { "icon": "🔪", "title": "Knife technique", "body": "Specific cut for best result." },
    { "icon": "⏱", "title": "Timing & resting", "body": "Resting or holding guidance." }
  ],
  "watchOuts": [
    { "icon": "⚠️", "title": "Professional mistake", "body": "What fails in a kitchen." },
    { "icon": "🌡️", "title": "Heat management", "body": "Temperature pitfall for this dish." },
    { "icon": "🧪", "title": "Texture/emulsion risk", "body": "Texture risk and remedy." }
  ],
  "haccp": [
    "Store raw proteins below 4°C and use within 48 hours.",
    "Ensure internal temperature of [protein] reaches [°C] before service.",
    "Cool sauce from 60°C to 20°C within 2 hours if holding."
  ],
  "allergens": [
    { "id": "gluten",      "present": false, "mayContain": false },
    { "id": "crustaceans", "present": false, "mayContain": false },
    { "id": "eggs",        "present": false, "mayContain": false },
    { "id": "fish",        "present": false, "mayContain": false },
    { "id": "peanuts",     "present": false, "mayContain": false },
    { "id": "soybeans",    "present": false, "mayContain": false },
    { "id": "dairy",       "present": false, "mayContain": false },
    { "id": "nuts",        "present": false, "mayContain": false },
    { "id": "celery",      "present": false, "mayContain": false },
    { "id": "mustard",     "present": false, "mayContain": false },
    { "id": "sesame",      "present": false, "mayContain": false },
    { "id": "sulphites",   "present": false, "mayContain": false },
    { "id": "lupin",       "present": false, "mayContain": false },
    { "id": "molluscs",    "present": false, "mayContain": false }
  ],
  "nutrition": { "calories": 420, "protein": 32, "carbs": 38, "fat": 14, "fiber": 5, "sodium": 680, "note": "Estimated values per 100g edible portion" }
}`;

  const res = await fetch(ANTHROPIC_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens:  proMode ? PRO_MAX_TOKENS : HOME_MAX_TOKENS,
      temperature: GENERATION_TEMP,
      messages: [{ role: "user", content: proMode ? proPrompt : homePrompt }],
    }),
  });

  if (!res.ok) {
    // BP-16: surface HTTP status clearly in the thrown error
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error?.message || `Anthropic API error (HTTP ${res.status})`);
  }

  const data = await res.json();
  const raw  = data.content.map(b => b.text || "").join("");

  // BP-14: Guard against runaway responses before parsing
  if (raw.length > MAX_RESPONSE_CHARS) {
    throw new Error(`API response unexpectedly large (${raw.length} chars). Aborting parse.`);
  }

  // Strip JSON fences in case the model wraps the response
  const text   = raw.replace(/```json|```/gi, "").trim();
  const parsed = JSON.parse(text);

  const { nutrition, allergens, proTips, watchOuts, ...recipeData } = parsed;
  recipeData.proTips   = proTips   || [];
  recipeData.watchOuts = watchOuts || [];

  return {
    recipe:    recipeData,
    nutrition: nutrition || null,
    allergens: allergens || null,
    // BP-04: always pass radix 10 to parseInt
    servings:  parseInt(parsed.meta?.serves, 10) || servings,
  };
}
