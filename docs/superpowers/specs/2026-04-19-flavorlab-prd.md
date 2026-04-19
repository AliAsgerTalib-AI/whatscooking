# FlavorLab — Product Requirements Document

**Version:** 1.0  
**Date:** 2026-04-19  
**Status:** Active  

---

## 1. Problem & Vision

Most AI recipe tools are generic — they produce one-size-fits-all results that don't account for who's cooking or why. Home cooks get overly formal output; professional chefs get output that ignores compliance requirements, batch scaling, and kitchen standards.

Professional kitchen software that does handle these needs is expensive, proprietary, and inaccessible to culinary students or independent chefs.

**FlavorLab's vision:** A free, open-source AI recipe assistant that serves both home cooks and professional chefs from a single interface, with clearly distinct UX modes for each — casual and approachable for home use, rigorous and compliance-ready for pro use.

The app is powered by Claude Sonnet and deployed on Vercel. The API key is server-side only — users never need an Anthropic account.

---

## 2. Users

### The Home Cook
Wants quick, casual recipe ideas from whatever's in the fridge. Cares about taste, simplicity, and imperial units. Not interested in precision measurements or formal structure — just something delicious to make tonight.

**Key needs:** fast ingredient input, readable recipe cards, flavor/diet filters, favorites, PDF export.

### The Professional Chef / Culinary Student
Needs batch-scaled recipes, HACCP food safety compliance, EU allergen matrices, metric weights, and cost-per-portion tracking. Accuracy and professionalism are non-negotiable — this output may be used in a real kitchen or submitted as coursework.

**Key needs:** metric scaling (10–200 portions), 14-allergen EU matrix, HACCP critical control points, mise en place checklist, chef metadata fields, professional PDF export.

---

## 3. Features

### v1 — Current

**Shared (Home + Pro)**
- Ingredient input with autocomplete and quick-add suggestions
- Filter system: cuisine (14 options), flavor profile (10), dietary requirements (10), cooking method (10), allergen exclusion (14 EU allergens)
- AI recipe generation via Claude Sonnet (`claude-sonnet-4-20250514`), proxied through Vercel serverless
- Serving/batch size scaling with presets and custom input
- Nutrition panel (calories, protein, carbs, fat, fiber, sodium)
- Favorites panel (localStorage, max 20 saved recipes)
- PDF export (home and pro variants)

**Home Mode** (`#f9c74f` / `#f3722c` gold-orange palette)
- Casual recipe cards with title, intro, ingredients, steps, chef tips, warnings
- Imperial units
- Serving presets: 1, 2, 4, 6, 8, 12 + custom (max 200)

**Pro Mode** (`#818cf8` / `#6366f1` indigo palette)
- Metric ingredient weights (e.g., "200g chicken breast, trimmed")
- HACCP food safety critical control points per step
- EU allergen compliance matrix (14 allergens; contains / may contain / absent)
- Mise en place interactive checklist with completion counter
- Three-tab result view: Recipe / Allergens / Mise en Place
- Chef metadata fields: chef name, station, recipe version, cost/portion
- Batch presets: 10, 20, 50, 100, 200 portions + custom
- Professional PDF: dark header band, two-column layout, allergen grid, cost breakdown, legal allergen disclaimer

### v2 — Roadmap

| Feature | Priority | Notes |
|---|---|---|
| Cloud sync / auth | High | Replace localStorage-only favorites; enable cross-device access |
| Recipe sharing | Medium | Permalink or public gallery for sharing generated recipes |
| Cost calculator enhancement | Medium | Ingredient price input → real cost/portion calculation |
| Accessibility audit | High | WCAG 2.1 AA compliance pass |
| Test suite | High | Unit tests for utils, integration tests for API proxy |

---

## 4. OSS Contribution Guide

FlavorLab is open source. Contributions are welcome.

### Setup

```bash
# Clone and install
git clone <repo-url>
cd whatscooking/testbed && npm install

# Run full-stack dev (API proxy included)
cd ..  # back to repo root
vercel dev  # requires Vercel CLI and ANTHROPIC_API_KEY set

# Or run frontend only (no AI generation)
cd testbed && npm run dev
```

**Required environment variable:**
```
ANTHROPIC_API_KEY=sk-ant-...
```
Set this in your local `.env` file (gitignored) or in Vercel project settings.

### Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS 3
- **AI:** Anthropic Claude Sonnet via `@anthropic-ai/sdk`
- **Backend:** Vercel serverless function (`api/generate.js`)
- **Deployment:** Vercel (SPA routing configured in `vercel.json`)

### Contribution Areas

- **New filter types** — add to `src/data/` and wire into `RecipeGenerator.jsx`
- **Allergen data** — expand or localize allergen lists beyond EU Reg. 1169/2011
- **UI components** — new panels, charts, or mobile improvements in `src/components/`
- **Accessibility** — keyboard navigation, ARIA labels, screen reader support
- **Testing** — unit tests for `src/utils/`, integration tests for `api/generate.js`
- **Localization** — metric/imperial toggle, language support

### Invariants (Do Not Break)

1. **Never remove the allergen disclaimer text** in `src/export/exportProPDF.js` — it is legally required.
2. **Keep home/pro visually distinct** — home uses gold/orange (`#f9c74f`, `#f3722c`); pro uses indigo (`#818cf8`, `#6366f1`).
3. **API calls must go through `/api/generate`** — never call `api.anthropic.com` directly from browser code.
4. **Allergen list order is fixed** per EU Reg. 1169/2011: gluten, crustaceans, eggs, fish, peanuts, soybeans, dairy, nuts, celery, mustard, sesame, sulphites, lupin, molluscs.
