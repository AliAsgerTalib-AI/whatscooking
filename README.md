# FlavorLab

> Turn any ingredients into a chef-quality recipe — powered by Google Gemini AI.

FlavorLab is a React web app that generates complete, personalized recipes from a list of ingredients. Pick a cuisine, dietary restrictions, allergens to avoid, and even a cooking persona — then let AI craft a full recipe with steps, pro tips, and a printable PDF in seconds.

---

## Features

- **AI Recipe Generation** — calls Google Gemini (`gemini-3-flash-preview`) to produce structured JSON recipes with ingredients, steps, pro tips, watch-outs, flavour tips, and kitchen tips
- **Cook Type Personas** — tailor output style to five profiles: Home Cook, Sophisticated Cook, Nutritional Optimizer, Experimentalist, and Eco Cook
- **Smart Filters** — filter by cuisine (including custom), flavor profile, dietary requirements, cooking method, and EU-regulated allergens (14 allergens per EU Reg. 1169/2011)
- **Serving Scaler** — dynamically rescales ingredient quantities from 1 to 200 servings
- **Cooking Mode** — full-screen step-by-step walkthrough with auto-detected per-step countdown timers
- **Favorites** — save up to 20 recipes to `localStorage` and reload them instantly
- **PDF Export** — one-click printable recipe card and a separate printable shopping list
- **Mobile-First** — bottom sheet filter drawer on mobile, sidebar on desktop; responsive throughout

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19, Tailwind CSS |
| Build | Vite 8 |
| AI | Google Gemini API (`gemini-3-flash-preview`) |
| Serverless Proxy | Vercel Functions (`api/generate.js`) |
| Testing | Vitest, jsdom |
| Linting | ESLint 9 |
| Deployment | Vercel |

---

## Quick Start

### Prerequisites

- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com/) API key
- [Vercel CLI](https://vercel.com/docs/cli) (for full-stack local dev)

### Installation

```bash
git clone <repo-url>
cd whatscooking/testbed
npm install
```

### Running locally

```bash
# UI only (no API calls — Gemini proxy won't be available)
cd testbed && npm run dev

# Full-stack with the /api/generate proxy (recommended)
# Run from repo root — requires GEMINI_API_KEY in .env.local
vercel dev
```

Add your API key to `.env.local` in the repo root:

```
GEMINI_API_KEY=your_key_here
```

### Other commands

```bash
cd testbed

npm run lint       # ESLint
npm run build      # Production build
npm test           # Vitest (run once)
npm run test:watch # Vitest (watch mode)
```

---

## Project Structure

```
whatscooking/
├── RecipeGenerator.tsx       # Main app shell — state, layout, orchestration
├── api/
│   └── generate.ts           # Vercel serverless proxy → Gemini API
├── src/
│   ├── api/
│   │   └── recipeApi.ts      # generateRecipe() — builds prompt, calls /api/generate
│   ├── components/
│   │   ├── IngredientTags.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── CookingMode.tsx
│   │   ├── FavoritesPanel.tsx
│   │   ├── AllergenMatrix.tsx
│   │   ├── MiseEnPlace.tsx
│   │   ├── MobileFilterBar.tsx
│   │   └── DesktopFilters.tsx
│   ├── data/                 # CUISINES, FLAVORS, DIETS, METHODS, ALLERGENS, COOK_TYPES
│   ├── export/
│   │   ├── exportHomePDF.ts
│   │   └── exportShoppingList.ts
│   ├── hooks/
│   │   └── useFavorites.ts   # localStorage persistence (key: "favs", max 20)
│   ├── types/
│   │   └── recipe.ts         # TypeScript interfaces for Recipe, Nutrition, Favorite, etc.
│   └── utils/                # formatNum, scaleIngredient, makeid, storage, parseStepTime
└── testbed/                  # Vite app wrapper (dev server & deployment entry point)
    ├── src/main.tsx
    └── vite.config.ts
```

---

## Deployment

The app deploys to **Vercel** directly from this repo.

1. Import the repo in the [Vercel dashboard](https://vercel.com/new)
2. Set the **root directory** to `testbed/`
3. Add the environment variable `GEMINI_API_KEY` in Project Settings → Environment Variables
4. Deploy — Vercel handles both the Vite SPA and the `api/generate.js` serverless function

---

## Roadmap

- [ ] Nutrition panel (macros per serving)
- [ ] Unit toggle (Imperial ↔ Metric)
- [ ] Recipe history / recent generations
- [ ] Share recipe via URL (encoded state)
- [ ] Dark mode

---

## Contributing

1. Fork the repo and create a feature branch
2. Run `vercel dev` locally to test end-to-end
3. Ensure `npm run lint` and `npm test` pass
4. Open a pull request with a clear description of the change

---

## License

MIT © FlavorLab
