# Karigar — Meal Architecture

> Turn whatever's in your fridge into a fully structured recipe, powered by Google Gemini.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-3--flash-4285F4?logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)

---

## Features

- **AI recipe generation** — drop in your ingredients, get a complete recipe with intro, steps, tips, and watch-outs
- **Cook Type personas** — tailor output to your style: Home Cook, Sophisticated Cook, Nutritional Optimizer, Experimentalist, or Eco Cook
- **Rich filters** — cuisine, flavor profile, dietary restrictions, cooking method, and serving size scaler (1–200 servings)
- **EU allergen matrix** — 14-allergen status (present / may contain) per EU Regulation 1169/2011
- **Cooking mode** — full-screen step-by-step walkthrough with auto-detected per-step countdown timers
- **Favorites** — save up to 20 recipes to localStorage, browse and restore them any time
- **PDF export** — Home-style or Pro-style recipe card (with mise en place, HACCP notes, and a legally required allergen disclaimer)
- **Shopping list export** — scaled ingredient list as a printable PDF
- **Mobile & desktop layouts** — bottom-sheet filters on mobile, sidebar on desktop

---

## Tech Stack

| Layer | Tool |
|---|---|
| UI | React 19 + TypeScript |
| Bundler | Vite 8 |
| AI model | Google Gemini `gemini-3-flash-preview` |
| Serverless proxy | Vercel Functions (`api/generate.ts`) |
| Testing | Vitest + jsdom |
| Linting | ESLint 9 |
| Fonts | Fraunces · DM Sans · Kufam (Google Fonts) |

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- [Vercel CLI](https://vercel.com/docs/cli) (for full-stack dev with the API proxy)
- A `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/)

### Install

```bash
git clone <repo-url>
cd karigar/testbed
npm install
```

### Run (UI only — no AI calls)

```bash
cd testbed
npm run dev
# → http://localhost:5173
```

### Run (full stack — AI calls work)

```bash
# From repo root — requires GEMINI_API_KEY set below
vercel dev
# → http://localhost:3000
```

Add your key to `.env.local` in the repo root (never commit this file):

```
GEMINI_API_KEY=your_key_here
```

### Other commands

```bash
cd testbed
npm run build        # production build
npm run lint         # ESLint
npm test             # Vitest (run once)
npm run test:watch   # Vitest watch mode
```

---

## Project Structure

```
karigar/
├── RecipeGenerator.tsx          ← root component (state, layout, orchestration)
├── index.html                   ← SPA shell
├── api/
│   └── generate.ts              ← Vercel serverless proxy → Gemini
├── src/
│   ├── api/recipeApi.ts         ← generateRecipe() — builds prompt, calls /api/generate
│   ├── components/              ← IngredientTags, BottomSheet, AllergenMatrix,
│   │                               MiseEnPlace, FavoritesPanel, ProFieldsPanel,
│   │                               MobileFilterBar, DesktopFilters, CookingMode
│   ├── data/                    ← CUISINES, FLAVORS, DIETS, METHODS, ALLERGENS,
│   │                               COOK_TYPES, SUGGESTIONS
│   ├── export/                  ← exportHomePDF, exportProPDF, exportShoppingList
│   ├── hooks/
│   │   └── useFavorites.ts      ← localStorage persistence (max 20 recipes)
│   ├── types/recipe.ts          ← Recipe, AllergenStatus, Favorite, CookType, …
│   ├── utils/                   ← formatNum, scaleIngredient, makeid, parseStepTime
│   ├── constants.ts             ← MOBILE_BREAKPOINT, CONTACT_EMAIL
│   └── tokens.ts                ← design token helpers (m, card, lbl, …)
└── testbed/                     ← Vite app that wraps RecipeGenerator for dev + deploy
    ├── src/
    │   ├── App.tsx              ← ErrorBoundary wrapper
    │   └── main.tsx             ← Vite entry point
    ├── tests/                   ← Vitest test files
    └── vite.config.ts
```

---

## Deployment

The app deploys to **Vercel** directly from this repo.

1. Import the repo in the [Vercel dashboard](https://vercel.com/new)
2. Set the **root directory** to `testbed/`
3. Add `GEMINI_API_KEY` under **Project Settings → Environment Variables**
4. Deploy — Vercel serves both the Vite SPA and the `api/generate.ts` serverless function

---

## Design

| Palette | Usage |
|---|---|
| Gold / Orange `#f9c74f` · `#f3722c` | Home mode |
| Indigo `#818cf8` · `#6366f1` | Pro mode |

---

## Roadmap

- [ ] Nutrition panel with macro breakdown per serving
- [ ] Ingredient image recognition (camera input)
- [ ] Unit toggle (imperial ↔ metric)
- [ ] Share recipe via URL (encoded state)
- [ ] User accounts and cloud-synced favorites

---

## Contributing

1. Fork the repo and create a feature branch
2. Run `vercel dev` locally to test end-to-end
3. Ensure `npm run lint` and `npm test` pass
4. Open a pull request with a clear description of the change

---

## License

MIT © 2026 Karigar
