// ── Models — swap these strings to upgrade without touching any other code ──────
const MODEL = "gemini-2.5-flash";

// ── Constants ────────────────────────────────────────────────────────────────────
const ANTHROPIC_BASE       = "/api/generate";
const MAX_RESPONSE_CHARS   = 32_000;
const MAX_TOKENS           = 8192;
const GENERATION_TEMP      = 0.8;

export async function generateRecipe({
  ingredientTags,
  cuisine,
  selectedFlavors,
  selectedDiets,
  selectedMethod,
  selectedAllergens,
  servings,
  cookType,
}) {
  const ingList = ingredientTags.join(", ");

  const cookTypeInstruction = cookType?.prompt ? `\nCOOK PERSONA: ${cookType.prompt}` : "";

  const homePrompt = `You are a creative world-class chef and nutritionist. Create a complete recipe.

INGREDIENTS: ${ingList}
${cuisine             ? `CUISINE STYLE: ${cuisine}`                                       : ""}
${selectedFlavors.length ? `FLAVOR PROFILE: ${selectedFlavors.join(", ")}`              : ""}
${selectedDiets.length      ? `DIETARY REQUIREMENTS (strictly follow ALL): ${selectedDiets.join(", ")}` : ""}
${selectedAllergens?.length ? `ALLERGENS TO AVOID (recipe must contain absolutely none of these): ${selectedAllergens.join(", ")}` : ""}
${selectedMethod            ? `COOKING METHOD (must use this): ${selectedMethod}`              : ""}
SERVING SIZE: ${servings} people${cookTypeInstruction}

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
  "flavourTips": [
    { "title": "Tip title", "body": "Specific technique to intensify or balance the flavour of this dish." },
    { "title": "Tip title", "body": "A seasoning, acid, fat, or umami suggestion tailored to these ingredients." },
    { "title": "Tip title", "body": "A finishing touch or garnish that elevates the final flavour." }
  ],
  "kitchenTips": [
    { "title": "Tip title", "body": "Equipment or preparation advice that makes this recipe easier." },
    { "title": "Tip title", "body": "Knife, heat, or timing technique specific to this dish." },
    { "title": "Tip title", "body": "Storage, make-ahead, or leftover guidance for this recipe." }
  ],
  "nutrition": { "calories": 420, "protein": 32, "carbs": 38, "fat": 14, "fiber": 5, "sodium": 680, "note": "Estimated values per serving" }
}`;

  const res = await fetch(ANTHROPIC_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      generationConfig: {
        temperature:      GENERATION_TEMP,
        maxOutputTokens:  MAX_TOKENS,
        responseMimeType: "application/json",
      },
      contents: [{ role: "user", parts: [{ text: homePrompt }] }],
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error?.message || `Gemini API error (HTTP ${res.status})`);
  }

  const data      = await res.json();
  const candidate = data.candidates?.[0];
  if (candidate?.finishReason === "MAX_TOKENS") {
    throw new Error("Recipe response was cut off (token limit hit). Please try again.");
  }
  const raw  = (candidate?.content?.parts ?? []).map(p => p.text || "").join("");

  // BP-14: Guard against runaway responses before parsing
  if (raw.length > MAX_RESPONSE_CHARS) {
    throw new Error(`API response unexpectedly large (${raw.length} chars). Aborting parse.`);
  }

  // Strip JSON fences in case the model wraps the response
  const text   = raw.replace(/```json|```/gi, "").trim();
  const parsed = JSON.parse(text);

  const { nutrition, proTips, watchOuts, flavourTips, kitchenTips, ...recipeData } = parsed;
  recipeData.proTips    = proTips    || [];
  recipeData.watchOuts  = watchOuts  || [];
  recipeData.flavourTips = flavourTips || [];
  recipeData.kitchenTips = kitchenTips || [];

  return {
    recipe:    recipeData,
    nutrition: nutrition || null,
    // BP-04: always pass radix 10 to parseInt
    servings:  parseInt(parsed.meta?.serves, 10) || servings,
  };
}
