# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**FlavorLab** — a React AI recipe generator that calls Google Gemini (`gemini-3-flash-preview`) to generate recipes from user-supplied ingredients. Home mode: casual, imperial units, gold/orange palette.

The app is deployed to Vercel. The Vite dev server lives in `testbed/` and imports `RecipeGenerator.jsx` from the root.

## Commands

```bash
# Dev (run from testbed/)
cd testbed && npm run dev          # Vite dev server (no API proxy — use vercel dev for full stack)
vercel dev                         # Full-stack dev with /api/generate proxy (run from repo root)

# Lint
cd testbed && npm run lint

# Build
cd testbed && npm run build
```

Tests live in `testbed/tests/` (Vitest). Run with `cd testbed && npm test`.

## Architecture

```
RecipeGenerator.jsx          ← thin shell; imports from src/
src/
├── api/recipeApi.js         ← generateRecipe(); builds prompts, calls /api/generate
├── api/generate.js  →  api/generate.js (Vercel serverless proxy to Anthropic)
├── components/              ← IngredientTags, BottomSheet, NutritionBar, AllergenMatrix,
│                               MiseEnPlace, FavoritesPanel, ProFieldsPanel, FilterChips,
│                               MobileFilterBar, DesktopFilters, ProResultTabs
├── hooks/useFavorites.js    ← localStorage persistence (key: "favs", max 20)
├── data/                    ← CUISINES, FLAVORS, DIETS, METHODS, ALLERGENS, SUGGESTIONS
├── utils/                   ← formatNum, scaleIngredient, makeid, storage
├── export/                  ← exportHomePDF, exportProPDF (open new window + auto-print)
└── types/recipe.ts          ← interfaces: Recipe, Nutrition, AllergenStatus, Favorite, ProFields
```

**API flow:** `RecipeGenerator` → `generateRecipe()` → `POST /api/generate` (Vercel serverless) → `generativelanguage.googleapis.com`. The API key (`GEMINI_API_KEY`) is server-side only.

**Response parsing** always uses: `JSON.parse(raw.replace(/```json|```/gi, "").trim())` — keep this pattern for robustness against markdown-wrapped responses.

## Key Invariants

1. **Never remove the allergen disclaimer text** in `exportProPDF` — it is legally required.
2. **Keep home/pro visually distinct** — home = gold/orange (`#f9c74f`, `#f3722c`), pro = indigo (`#818cf8`, `#6366f1`).
3. **Both PDF export functions must stay in sync** whenever the recipe or ingredient schema changes.
4. **API calls go through `/api/generate`** — never call `generativelanguage.googleapis.com` directly from browser code.
5. **Allergen list order is fixed** (EU Reg. 1169/2011): gluten, crustaceans, eggs, fish, peanuts, soybeans, dairy, nuts, celery, mustard, sesame, sulphites, lupin, molluscs.

## Deployment

Vercel project. `vercel.json` configures the build output and SPA routing. Set `GEMINI_API_KEY` in Vercel environment variables.

The `testbed/` directory is the Vite app that wraps `RecipeGenerator.jsx` for local development and Vercel deployment.
