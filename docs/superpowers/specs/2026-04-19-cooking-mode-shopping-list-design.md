# Design: Step-by-step Cooking Mode & Shopping List Export

**Date:** 2026-04-19
**Status:** Approved

---

## Overview

Two new features added to the recipe result card in FlavorLab:

1. **Step-by-step Cooking Mode** — fullscreen dark overlay that walks the user through each recipe step one at a time, with a per-step countdown timer.
2. **Shopping List Export** — one-tap copy to clipboard and/or print of a clean ingredient checklist.

Both features work in Home and Pro mode and respect the existing mode colour tokens.

---

## Feature 1 — Step-by-step Cooking Mode

### Trigger
A "Start Cooking" button is added to the recipe action row alongside "Save Recipe" and "Export PDF". Only rendered when `recipe` is present.

### UI — Fullscreen Overlay
`position: fixed; inset: 0` dark overlay (`bg-[#111]`), `z-index: 200`.

**Layout (top to bottom):**
- **Top bar:** `Step X of N` label · segmented progress bar (one segment per step, filled = complete) · close (✕) button
- **Step text:** Large (`text-xl`), white, generous line-height. Centred vertically in remaining space.
- **Timer area:**
  - Auto-populated by `parseStepTime(stepText)` — regex extracts the upper bound of any time range (e.g. "3–4 minutes" → 4:00, "about 10 minutes" → 10:00). Returns `null` if no time found; timer area hidden in that case.
  - Displays `MM:SS` countdown in large monospace font.
  - Tap the time display to edit (inline input, seconds clamped 0–59, minutes clamped 0–99).
  - Play / Pause button.
  - When countdown reaches 0:00 — plays a short bell tone via Web Audio API (`AudioContext`, no library), flashes the timer red briefly.
  - Timer resets when navigating to a new step.
- **Bottom bar:** "← Prev" (disabled on step 1) · "Next Step →" (becomes "Finish 🎉" on last step). Tapping Finish shows a completion screen ("You did it! 🎉") with a "Back to Recipe" button that closes the overlay.

### State
All cooking mode state is local to `CookingMode.jsx` (no lift to parent needed):
- `currentStep` (index, 0-based)
- `secondsLeft` (number | null)
- `running` (boolean)

### New files
- `src/components/CookingMode.jsx` — the overlay component
- `src/utils/parseStepTime.js` — extracts minutes from step text via regex

### Integration
- Import `CookingMode` in `RecipeGenerator.jsx`
- Add `cookingMode` boolean state, defaulting `false`
- Render `<CookingMode>` when `cookingMode === true`, passing `steps`, `proMode`, and `onClose`
- Add "Start Cooking" button to recipe action row

---

## Feature 2 — Shopping List Export

### Trigger
A "Shopping List" button added to the recipe action row. Renders two sub-actions inline (no modal):
- **📋 Copy** button
- **🖨 Print** button

Both buttons are always visible — stacked on mobile (flex-wrap handles overflow), side by side on desktop.

### Copy to Clipboard
Writes plain-text to `navigator.clipboard.writeText()`. Format:
```
{recipe.title} — serves {displayServings}
─────────────────────
□ {scaled ingredient 1}
□ {scaled ingredient 2}
...
```
Uses existing `scaleIngredient(ing, ratio)` for correct quantities. Shows the existing toast mechanism: "Copied to clipboard!".

### Print / PDF
Calls `exportShoppingList(recipe, displayServings, ratio)` — opens a new window and auto-triggers `window.print()`. Matches the branded style of `exportHomePDF`:
- FlavorLab header with orange accent
- Recipe title + serves count
- Two-column ingredient checklist (same `.ing-list` grid pattern)
- Compact footer

### New file
- `src/export/exportShoppingList.js`

### Integration
- Import in `RecipeGenerator.jsx`
- Add "Shopping List" to recipe action row
- Add `copyingList` boolean state for clipboard feedback

---

## Constraints

- No new dependencies — Web Audio API only, no sound files
- `parseStepTime` must handle: "3–4 minutes", "about 10 min", "2 to 3 minutes", "30 seconds". Returns `null` for steps with no time hint.
- Shopping list copy/print respects current `displayServings` and `ratio`
- Allergen disclaimer is not required on shopping list (it's not a recipe card)
- Both features must maintain home/pro visual distinction via existing `m.*` tokens
