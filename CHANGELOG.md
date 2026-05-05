# Changelog

All notable changes to Karigar are documented here.

## [0.6.0] - 2026-05-05

### Features
- Rebranded app from "FlavorLab" to **Karigar** across nav, footer, PDF exports, shopping list, and page titles
- Logo wordmark redesigned in Kufam typeface with "Meal Architecture" tagline; clicking the logo navigates back to the generator (replaces the separate Generator tab button)
- Added Kufam font family to both HTML entry points

### Tests
- Replaced Playwright boilerplate spec (`example.spec.js`) with project-specific E2E suite (`karigar.spec.js`) covering brand rendering, ingredient input (Enter/comma/Backspace/Quick-add/Clear all), autocomplete, serving size, cook type, validation, and tab navigation

---

## [0.5.0] - 2026-05-05

### Refactors
- Completed full TypeScript migration — all `.js`/`.jsx` source files replaced with `.ts`/`.tsx` counterparts, including build configs, entry points, and test files

### Bug Fixes
- Minor bug corrected (unspecified)

---

## [0.4.0] - 2026-04-22

### Features
- Added Cook Type selector to personalise recipe generation style (e.g. home cook, professional chef)
- Added site footer with contact email, legal disclaimer, and copyright notice
- Replaced Pro mode with Flavour and Kitchen Tips fields for a streamlined single-mode experience

---

## [0.3.0] - 2026-04-19

### Features
- Added CookingMode — fullscreen step-by-step overlay with per-step timers
- Added shopping list export (print window with formatted ingredient list)
- Integrated cooking mode and shopping list into the recipe card UI
- Added Pro Tips and Watch Outs sections to home PDF export
- Added `parseStepTime` utility for parsing natural-language time strings
- Added ErrorBoundary component to catch and display runtime errors gracefully

### Bug Fixes
- Clipboard copy now falls back to `execCommand` in non-secure (HTTP) contexts
- Fixed temporal dead zone (TDZ) error — moved `ratio` declaration before `copyShoppingList`
- Copied button state only shown on a confirmed successful clipboard write
- `commitEdit` now handles bare seconds; z-index raised above BottomSheet
- `parseStepTime` now handles hour ranges and em-dash separators
- Improved `exportShoppingList` column alignment
- Ingredients moved above method in PDFs; nutrition sidebar removed for cleaner print layout
- Improved overall print layout for PDF exports

---

## [0.2.0] - 2026-04-19

### Features
- Redesigned UI with Apple/Figma-inspired aesthetic

### Bug Fixes
- Switched API backend from Anthropic to Google Gemini
- Enforced JSON response mode on Gemini to prevent markdown-wrapped parse errors
- Increased token limits to 8 192 and added handling for `MAX_TOKENS` finish reason

### Tests
- Added Vitest test framework
- Unit tests for `formatNum`, `scaleIngredient`, `makeid`, and storage utilities

---

## [0.1.0] - 2026-04-08

### Features
- Scaffolded Vite + React app with Vercel API proxy and Tailwind design system
- Added allergen multi-selection filter (EU Reg. 1169/2011 order)
- Applied Swiss Brutalist design system ("The Digital Lithograph")

### Bug Fixes
- Fixed quick-add remaining visible after the first ingredient is added
- Added `vercel.json` to configure build output and SPA routing
- Fixed API provider initialisation, BottomSheet event listeners, and localStorage crash guard
