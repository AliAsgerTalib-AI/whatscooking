# PLAN.md — FlavorLab: AI Recipe Generator
> Technical specification derived from design review, professional feature planning, and implementation session.
> Intended for use with an agentic IDE + Claude extension.

---

## Project Overview

**FlavorLab** is a React single-file application that calls the Anthropic Claude API (`claude-sonnet-4-20250514`) to generate recipes from user-supplied ingredients. It has two modes:

- **Home Mode** — casual recipe generation with flavor/diet/cuisine/method filters, serving scaler, nutrition info, and favorites.
- **Pro Mode** — professional kitchen output with metric weights, mise en place checklists, HACCP food safety notes, a 14-allergen EU matrix, and a print-ready professional recipe card PDF.

The delivered file is `RecipeGenerator.jsx` — a default-exported React component ready to drop into any React app.

---

## Current File

| File | Description |
|------|-------------|
| `RecipeGenerator.jsx` | Complete single-file React component (~1,100 lines). No external CSS. All styles are inline. |

---

## Architecture

### Component Tree

```
RecipeGenerator (default export)
├── IngredientTags          — tag input with autocomplete + quick-add
├── BottomSheet             — draggable mobile bottom drawer (touch + mouse)
├── NutritionBar            — labeled progress bar for macros
├── AllergenMatrix          — 14-cell EU allergen grid with legend + summary
├── MiseEnPlace             — interactive checklist of prep tasks
├── FavoritesPanel          — saved recipe list with load/delete
├── ProFieldsPanel          — optional metadata fields for recipe card PDF
├── FilterChips             — reusable chip selector (single or multi)
├── MobileFilterBar         — scrollable horizontal pill bar (mobile only)
├── DesktopFilters          — inline filter cards (desktop only)
└── ProResultTabs           — tab bar: Recipe / Allergens / Mise en Place
```

### Utility Functions

```
formatNum(n)                — formats decimals as fractions (½, ¾ etc.)
scaleIngredient(text, ratio)— regex-replaces quantities proportionally
makeid()                    — generates a short random ID
exportProPDF(...)           — opens new window with professional recipe card HTML, auto-prints
exportHomePDF(...)          — opens new window with simple home recipe HTML, auto-prints
```

---

## State (RecipeGenerator)

| State variable | Type | Purpose |
|---|---|---|
| `tab` | `"generator" \| "favorites"` | Active nav tab |
| `proMode` | `boolean` | Toggles professional kitchen mode |
| `ingredientTags` | `string[]` | User's ingredient list |
| `selectedCuisine` | `string` | One of CUISINES.val or "" |
| `customCuisine` | `string` | Free-text cuisine override |
| `selectedFlavors` | `string[]` | Multi-select from FLAVORS |
| `selectedDiets` | `string[]` | Multi-select from DIETS |
| `selectedMethod` | `string` | Single-select from METHODS |
| `servings` | `number` | Base serving count for generation |
| `loading` | `boolean` | API call in flight |
| `error` | `string` | Error message |
| `recipe` | `object \| null` | Parsed recipe from API |
| `nutrition` | `object \| null` | Nutrition data from API |
| `allergens` | `array \| null` | 14-allergen array from API (pro only) |
| `baseServings` | `number` | Servings the recipe was generated for |
| `displayServings` | `number` | Current scaler value |
| `activeSheet` | `string \| null` | Open bottom sheet ID (mobile) |
| `isMobile` | `boolean` | `window.innerWidth < 700` |
| `favorites` | `array` | Persisted to `localStorage["flavorlab_favs"]` |
| `isFav` | `boolean` | Whether current recipe is saved |
| `savedToast` | `string` | Toast message text |
| `exportingPDF` | `boolean` | PDF button loading state |
| `proFields` | `object` | Chef name, station, version, cost/portion |
| `activeProTab` | `"recipe" \| "allergens" \| "mise"` | Pro result tab |

---

## Data Constants

```js
CUISINES        — 14 cuisines with emoji label + val
FLAVORS         — 10 flavor profiles
DIETS           — 10 dietary requirements
METHODS         — 10 cooking methods
SERVING_PRESETS — [1, 2, 4, 6, 8, 12]          (home mode)
PRO_BATCH_PRESETS— [10, 20, 50, 100, 200]        (pro mode)
SUGGESTIONS     — ~100 ingredient autocomplete strings
ALLERGENS       — 14 EU allergens: { id, label, icon, color }
```

### ALLERGENS list (EU Reg. 1169/2011)
`gluten, crustaceans, eggs, fish, peanuts, soybeans, dairy, nuts, celery, mustard, sesame, sulphites, lupin, molluscs`

---

## API Integration

### Endpoint
```
POST https://api.anthropic.com/v1/messages
model: claude-sonnet-4-20250514
max_tokens: 3200 (pro) / 2800 (home)
```

> ⚠️ **Security note:** API key is currently passed from the browser directly. For production this must be proxied through a backend route (Next.js API route, Express, etc.).

### Home Mode Prompt
Returns JSON with: `title, badge, intro, meta, ingredients, steps, tips, proTips[], watchOuts[], nutrition`

### Pro Mode Prompt
Returns JSON with all home fields **plus**:
- `ingredients` — metric weights (e.g. `"200g chicken breast, trimmed"`)
- `steps` — include exact °C temperatures and technique names
- `miseEnPlace[]` — every prep task as a separate string
- `haccp[]` — food safety critical control points
- `allergens[]` — array of 14 objects: `{ id, present: bool, mayContain: bool }`

### Response Parsing
```js
const raw = data.content.map(b => b.text || "").join("");
const parsed = JSON.parse(raw.replace(/```json|```/gi, "").trim());
```

---

## PDF Export

### Home PDF (`exportHomePDF`)
- Clean single-column layout
- Title, intro, meta grid, ingredient list, numbered steps, chef tip
- Auto-triggers `window.print()`

### Professional Recipe Card PDF (`exportProPDF`)
- **Dark header band** — recipe title, intro, badge row, chef name, station, recipe ID (auto-generated), issue date, version
- **Meta bar** — yield, prep, cook, difficulty, method, cost/portion
- **Two-column body** — left: mise en place checklist, numbered steps with °C highlights, pro tips, watch-outs, HACCP; right: scaled ingredient list, nutrition panel, cost breakdown table (if filled)
- **Allergen section** — full 7×2 grid of all 14 EU allergens, colour-coded (red = contains, amber = may contain, grey = not present), plain-text summary, legal disclaimer
- **Footer** — brand, date, recipe ID, nutrition disclaimer
- References `proFields`: `chefName`, `station`, `version`, `costPerPortion`, `ingredients[].cost`, `totalCost`

---

## Pro Mode Feature Summary

| Feature | Where |
|---|---|
| Toggle in nav bar | Slide toggle, purple scheme |
| Info banner | Below nav when active |
| Metric weights in ingredients | Prompt instruction |
| Batch presets 10–200 covers | Serving size selector |
| Recipe Card Details fields | Desktop card + mobile bottom sheet |
| Three-tab result panel | Recipe / Allergens / Mise en Place |
| Allergen Matrix component | Full grid + legend + summary |
| Mise en Place checklist | Interactive, with completion counter |
| HACCP food safety notes | Inline in Recipe tab |
| Allergen sidebar summary | Quick pills + link to full matrix |
| Pro Recipe Card PDF | Dark-band A4 print layout |
| PRO badge on saved recipes | Favorites panel |

---

## Known Issues & Technical Debt

### 🔴 Critical
- **API key exposed in browser** — all `fetch` calls to `api.anthropic.com` are made client-side. Must be moved behind a server-side proxy before any public deployment.

### 🟡 Important
- **Single 1,100-line file** — needs splitting into `/components`, `/hooks`, `/data`, `/utils`, `/api` directories.
- **No TypeScript** — `recipe`, `nutrition`, `allergens`, `proFields` objects are untyped. Add interfaces.
- **`localStorage` fragility** — no migration strategy, no cross-device sync. Replace with backend persistence + user accounts for production.
- **Inline styles throughout** — no design system or token file. Move to Tailwind, CSS modules, or a shared `tokens.js`.
- **BottomSheet re-registers event listeners on every render** — `onMove`/`onEnd` should use `useRef` to avoid re-registration churn.

### 🟢 Minor
- No loading skeleton in result area during generation
- No undo for "clear all" ingredients
- `className="rb"` responsive override relies on injected `<style>` tag — fragile
- No error boundary around result panel
- Accessibility incomplete (missing `aria-` labels, focus traps in BottomSheet)

---

## Planned Features (Backlog)

### Phase 2 — Professionalisation
- [ ] **Split into multi-file structure** (`/components`, `/hooks`, `/data`, `/utils`, `/api`)
- [ ] **TypeScript** — add `Recipe`, `Nutrition`, `Allergen`, `Favorite`, `ProFields` interfaces
- [ ] **Backend proxy** — Next.js API route or Express to hide API key
- [ ] **Replace inline styles** with Tailwind or CSS modules + design token file
- [ ] **Error boundary** around result section

### Phase 3 — Pro Kitchen Features
- [ ] **User accounts** — favorites tied to profile, not browser
- [ ] **Recipe versioning** — changelog per recipe, head chef approval status
- [ ] **Yield-based scaling** — input target weight/volume, not just headcount
- [ ] **Trim/waste factor** — AP vs EP weight per ingredient
- [ ] **Cost calculator** — per-ingredient cost input → total cost → cost per portion → food cost %
- [ ] **Prep timeline** — reverse-schedule from service time
- [ ] **Menu balance analysis** — flag over-represented proteins, missing vegetarian options, cost outliers
- [ ] **Plating notes** — clock-position garnish spec
- [ ] **Component recipes** — multi-element dishes (sauce, protein, starch, garnish) generated separately

### Phase 4 — UX Polish
- [ ] **Loading skeleton** — shimmer card during generation
- [ ] **Recipe history** — last 3 generated, without requiring explicit save
- [ ] **Shareable URL** — encode recipe state in URL for sharing
- [ ] **Undo for clear all** ingredients
- [ ] **Custom serving input** — number field alongside presets
- [ ] **Full keyboard accessibility** — `aria-*`, focus trap in BottomSheet, roving tab index for chips

---

## Folder Structure (Target)

```
src/
├── components/
│   ├── IngredientTags.tsx
│   ├── BottomSheet.tsx
│   ├── NutritionBar.tsx
│   ├── AllergenMatrix.tsx
│   ├── MiseEnPlace.tsx
│   ├── FavoritesPanel.tsx
│   ├── ProFieldsPanel.tsx
│   └── FilterChips.tsx
├── hooks/
│   ├── useRecipeGenerator.ts
│   ├── useFavorites.ts
│   └── useMediaQuery.ts
├── data/
│   ├── cuisines.ts
│   ├── flavors.ts
│   ├── diets.ts
│   ├── methods.ts
│   ├── allergens.ts
│   └── suggestions.ts
├── utils/
│   ├── formatNum.ts
│   ├── scaleIngredient.ts
│   └── makeid.ts
├── api/
│   └── recipeApi.ts          ← isolated fetch + prompt builder
├── export/
│   ├── exportProPDF.ts
│   └── exportHomePDF.ts
├── types/
│   └── recipe.ts             ← Recipe, Nutrition, Allergen, ProFields, Favorite
└── RecipeGenerator.tsx       ← thin shell, imports everything above
```

---

## Design Tokens (Current, Inline)

```
Background:   linear-gradient(135deg, #0f0c29, #302b63, #24243e)
Home accent:  #f9c74f (gold), #f3722c (orange), #f94144 (red)
Pro accent:   #818cf8 (indigo), #6366f1 (indigo dark)
Success:      #4ade80
Text primary: #f0ede6
Text muted:   rgba(255,255,255,0.4)
Card bg:      rgba(255,255,255,0.05)
Card border:  rgba(255,255,255,0.1)
Font:         'Segoe UI', system-ui, sans-serif
```

---

## Testing Priorities (None currently exist)

| Function | Test type | Priority |
|---|---|---|
| `formatNum` | Unit | High — edge cases: 0, fractions, large numbers |
| `scaleIngredient` | Unit | High — fractions, ranges, text-only strings |
| `AllergenMatrix` | Component | High — present/mayContain/absent states |
| `generate()` API call | Integration | High — error handling, malformed JSON |
| `BottomSheet` drag | E2E | Medium |
| PDF export | Visual regression | Medium |

---

## Quick-Start for Claude Extension

When working on this codebase, Claude should:

1. **Preserve** the existing component interface contracts — props and state shape should not change without updating all consumers.
2. **Match** the inline style pattern until a design system migration is explicitly requested.
3. **Keep home mode and pro mode visually distinct** — home = gold/orange, pro = indigo/purple.
4. **Never remove** the allergen disclaimer text — it is legally important.
5. **Always update** both `exportHomePDF` and `exportProPDF` when ingredient or recipe schema changes.
6. **Test JSON parsing** defensively — the API response `.replace(/```json|```/gi, "").trim()` pattern must be kept for robustness.
7. **Do not call** `api.anthropic.com` from new server-side code without first implementing the proxy route.
