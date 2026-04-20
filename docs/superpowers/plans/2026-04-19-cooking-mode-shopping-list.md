# Cooking Mode & Shopping List Export — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fullscreen step-by-step cooking mode with per-step countdown timers, and a shopping list export (clipboard copy + print PDF) to the FlavorLab recipe result card.

**Architecture:** Three new files (`parseStepTime.js`, `CookingMode.jsx`, `exportShoppingList.js`) integrate into `RecipeGenerator.jsx` via two new state flags (`cookingMode`, `copyingList`) and three new buttons in the recipe action row. No new dependencies required.

**Tech Stack:** React 19, Vite 8, Vitest 4 (already configured), Web Audio API (built-in browser), Tailwind CSS (already configured).

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/utils/parseStepTime.js` | Regex — extract seconds from step text |
| Create | `testbed/tests/parseStepTime.test.js` | Unit tests for parseStepTime |
| Create | `src/components/CookingMode.jsx` | Fullscreen overlay component |
| Create | `src/export/exportShoppingList.js` | Branded print window for shopping list |
| Modify | `RecipeGenerator.jsx` | Imports, state, buttons, CookingMode render |

---

## Task 1: `parseStepTime` utility (TDD)

**Files:**
- Create: `src/utils/parseStepTime.js`
- Create: `testbed/tests/parseStepTime.test.js`

- [ ] **Step 1.1 — Write the failing tests**

Create `testbed/tests/parseStepTime.test.js`:

```js
import { describe, it, expect } from "vitest";
import { parseStepTime } from "../../src/utils/parseStepTime.js";

describe("parseStepTime", () => {
  it("returns null for steps with no time hint", () => {
    expect(parseStepTime("Chop the onions finely")).toBeNull();
    expect(parseStepTime("Season with salt and pepper")).toBeNull();
  });

  it("handles en-dash range 'cook for 3–4 minutes' → 240 (takes upper bound)", () => {
    expect(parseStepTime("Cook for 3–4 minutes until golden")).toBe(240);
  });

  it("handles hyphen range 'fry for 3-4 minutes' → 240", () => {
    expect(parseStepTime("Fry for 3-4 minutes")).toBe(240);
  });

  it("handles 'to' range '3 to 4 minutes' → 240", () => {
    expect(parseStepTime("Simmer for 3 to 4 minutes")).toBe(240);
  });

  it("handles 'about 10 minutes' → 600", () => {
    expect(parseStepTime("Cook for about 10 minutes")).toBe(600);
  });

  it("handles plain '5 min' → 300", () => {
    expect(parseStepTime("Rest the dough for 5 min")).toBe(300);
  });

  it("handles '30 seconds' → 30", () => {
    expect(parseStepTime("Stir vigorously for 30 seconds")).toBe(30);
  });

  it("handles '1 hour' → 3600", () => {
    expect(parseStepTime("Roast for 1 hour until caramelised")).toBe(3600);
  });

  it("prefers minutes over seconds when both appear", () => {
    expect(parseStepTime("Cook for 2 minutes, stirring every 30 seconds")).toBe(120);
  });
});
```

- [ ] **Step 1.2 — Run tests to confirm they fail**

```bash
cd testbed && npm test
```

Expected: 9 failures — `parseStepTime is not a function` (or similar import error).

- [ ] **Step 1.3 — Implement `parseStepTime`**

Create `src/utils/parseStepTime.js`:

```js
/**
 * Extracts a duration in seconds from natural-language step text.
 * Returns null if no time hint is found.
 * Priority: hours > minutes range > minutes > seconds.
 */
export function parseStepTime(text) {
  // 1 hour / 2 hours
  const hourMatch = text.match(/(\d+)\s*hour/i);
  if (hourMatch) return parseInt(hourMatch[1], 10) * 3600;

  // Range: "3–4 min", "3-4 minutes", "3 to 4 minutes" — take upper bound
  const rangeMatch = text.match(/(\d+)\s*(?:[–\-]|to)\s*(\d+)\s*min/i);
  if (rangeMatch) return parseInt(rangeMatch[2], 10) * 60;

  // Single minutes: "10 minutes", "about 5 min"
  const minMatch = text.match(/(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1], 10) * 60;

  // Seconds only
  const secMatch = text.match(/(\d+)\s*sec/i);
  if (secMatch) return parseInt(secMatch[1], 10);

  return null;
}
```

- [ ] **Step 1.4 — Run tests to confirm they all pass**

```bash
cd testbed && npm test
```

Expected: 9 passing, 0 failing.

- [ ] **Step 1.5 — Commit**

```bash
cd "C:\Users\alias\OneDrive\AI Projects\whatscooking"
git add src/utils/parseStepTime.js testbed/tests/parseStepTime.test.js
git commit -m "feat: add parseStepTime utility with tests"
```

---

## Task 2: `CookingMode` component

**Files:**
- Create: `src/components/CookingMode.jsx`

- [ ] **Step 2.1 — Create the component**

Create `src/components/CookingMode.jsx`:

```jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { parseStepTime } from "../utils/parseStepTime.js";

export function CookingMode({ steps, proMode, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [secondsLeft, setSecondsLeft]   = useState(null);
  const [running, setRunning]           = useState(false);
  const [editing, setEditing]           = useState(false);
  const [editVal, setEditVal]           = useState("");
  const [done, setDone]                 = useState(false);
  const intervalRef = useRef(null);

  const accent = proMode ? "#6366f1" : "#f3722c";

  const loadStep = useCallback((idx) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setEditing(false);
    setSecondsLeft(parseStepTime(steps[idx]));
  }, [steps]);

  // Load step 0 on mount; clean up interval on unmount
  useEffect(() => {
    loadStep(0);
    return () => clearInterval(intervalRef.current);
  }, [loadStep]);

  // Countdown tick
  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          playBell();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Lock body scroll while overlay is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function playBell() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch (_) { /* silently ignore if AudioContext unavailable */ }
  }

  function fmt(s) {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  function commitEdit() {
    const parts = editVal.split(":").map(n => parseInt(n, 10) || 0);
    const total = parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] * 60;
    setSecondsLeft(Math.max(0, total));
    setEditing(false);
  }

  function goNext() {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      loadStep(next);
    } else {
      setDone(true);
    }
  }

  function goPrev() {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      loadStep(prev);
    }
  }

  if (done) {
    return (
      <div style={overlay}>
        <div className="flex flex-col items-center justify-center flex-1 gap-4 px-8 text-center">
          <div className="text-6xl">🎉</div>
          <div className="text-2xl font-bold text-white">All done!</div>
          <div className="text-slate-400 text-sm">Enjoy your meal.</div>
          <button
            onClick={onClose}
            style={{ background: "#22c55e", ...pillBtn }}
          >Back to Recipe</button>
        </div>
      </div>
    );
  }

  const isZero = secondsLeft === 0;

  return (
    <div style={overlay}>

      {/* Top bar: progress + close */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <span className="text-[0.65rem] font-semibold tracking-widest uppercase text-slate-400 shrink-0">
          Step {currentStep + 1} of {steps.length}
        </span>
        <div className="flex flex-1 gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[3px] rounded-full transition-colors duration-300"
              style={{ background: i <= currentStep ? accent : "#333" }}
            />
          ))}
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-200 transition-colors text-lg shrink-0 bg-transparent border-none cursor-pointer font-[inherit] leading-none"
        >✕</button>
      </div>

      {/* Step text */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 overflow-y-auto">
        <p className="text-xl leading-relaxed text-slate-100 max-w-lg text-center">
          {steps[currentStep]}
        </p>

        {/* Timer */}
        {secondsLeft !== null && (
          <div className="flex flex-col items-center gap-4 mt-10">
            {editing ? (
              <input
                autoFocus
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => e.key === "Enter" && commitEdit()}
                placeholder="MM:SS"
                className="bg-white/10 border border-white/20 rounded-xl text-white text-5xl font-mono text-center w-40 px-3 py-1 outline-none"
              />
            ) : (
              <button
                onClick={() => { setEditVal(fmt(secondsLeft)); setEditing(true); setRunning(false); }}
                className="bg-transparent border-none cursor-pointer font-mono text-6xl font-bold tracking-wider transition-colors"
                style={{ color: isZero ? "#ef4444" : "#fff" }}
                title="Tap to edit"
              >{fmt(secondsLeft)}</button>
            )}
            <button
              onClick={() => setRunning(r => !r)}
              style={{ background: running ? "#333" : accent, ...pillBtn, minWidth: "120px" }}
            >{running ? "⏸ Pause" : "▶ Start"}</button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex gap-3 px-5 py-4 border-t border-white/10">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          style={{ background: "#222", ...pillBtn, flex: 1, opacity: currentStep === 0 ? 0.3 : 1 }}
        >← Prev</button>
        <button
          onClick={goNext}
          style={{ background: accent, ...pillBtn, flex: 2 }}
        >{currentStep === steps.length - 1 ? "Finish 🎉" : "Next Step →"}</button>
      </div>

    </div>
  );
}

const overlay = {
  position: "fixed", inset: 0, zIndex: 200,
  background: "#111",
  display: "flex", flexDirection: "column",
  fontFamily: "inherit",
};

const pillBtn = {
  border: "none", borderRadius: "14px",
  color: "#fff", padding: "0.9rem 1.5rem",
  fontSize: "0.875rem", fontWeight: "bold",
  cursor: "pointer", fontFamily: "inherit",
};
```

- [ ] **Step 2.2 — Commit**

```bash
cd "C:\Users\alias\OneDrive\AI Projects\whatscooking"
git add src/components/CookingMode.jsx
git commit -m "feat: add CookingMode fullscreen overlay component"
```

---

## Task 3: `exportShoppingList`

**Files:**
- Create: `src/export/exportShoppingList.js`

- [ ] **Step 3.1 — Create the export function**

Create `src/export/exportShoppingList.js`:

```js
import { scaleIngredient } from "../utils/scaleIngredient.js";

export function exportShoppingList(recipe, displayServings, ratio) {
  const win = window.open("", "_blank");
  if (!win) return;

  const scaledIngs = (recipe.ingredients || []).map(i => scaleIngredient(i, ratio));

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>Shopping List — ${recipe.title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Georgia',serif;max-width:520px;margin:0 auto;padding:2rem;color:#1a1a1a;}
    .header{border-bottom:3px solid #f3722c;padding-bottom:1rem;margin-bottom:1.5rem;}
    .logo{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:#f3722c;font-weight:bold;margin-bottom:0.4rem;font-family:sans-serif;}
    h1{font-size:1.4rem;line-height:1.2;margin-bottom:0.3rem;}
    .serves{font-size:0.75rem;color:#999;font-family:sans-serif;}
    .ing-list{display:grid;grid-template-columns:1fr 1fr;gap:0 1.5rem;margin-top:1rem;}
    .ing{display:flex;gap:0.6rem;padding:0.4rem 0;border-bottom:1px solid #f0f0f0;font-size:0.88rem;align-items:baseline;}
    .box{width:14px;height:14px;border:1.5px solid #ccc;border-radius:3px;flex-shrink:0;margin-top:3px;}
    .footer{margin-top:2rem;padding-top:0.8rem;border-top:1px solid #eee;font-size:0.6rem;color:#bbb;font-family:sans-serif;}
    @media print{
      body{font-size:9pt;}
      @page{margin:1.2cm;size:A4;}
      .ing{break-inside:avoid;}
    }
  </style></head><body>
  <div class="header">
    <div class="logo">🛒 FlavorLab — Shopping List</div>
    <h1>${recipe.title}</h1>
    <div class="serves">Serves ${displayServings}</div>
  </div>
  <div class="ing-list">
    ${scaledIngs.map(i => `<div class="ing"><div class="box"></div>${i}</div>`).join("")}
  </div>
  <div class="footer">FlavorLab AI · ${new Date().toLocaleDateString()}</div>
  <script>window.onload=()=>window.print();</script>
  </body></html>`;

  win.document.write(html);
  win.document.close();
}
```

- [ ] **Step 3.2 — Commit**

```bash
cd "C:\Users\alias\OneDrive\AI Projects\whatscooking"
git add src/export/exportShoppingList.js
git commit -m "feat: add exportShoppingList print window"
```

---

## Task 4: Integrate into `RecipeGenerator.jsx`

**Files:**
- Modify: `RecipeGenerator.jsx`

- [ ] **Step 4.1 — Add imports**

At the top of `RecipeGenerator.jsx`, after the existing import block, add:

```jsx
import { CookingMode }        from "./src/components/CookingMode.jsx";
import { exportShoppingList } from "./src/export/exportShoppingList.js";
```

- [ ] **Step 4.2 — Add state**

Inside `RecipeGenerator()`, after the existing `const [exportingPDF, setExportingPDF] = useState(false);` line, add:

```jsx
const [cookingMode, setCookingMode]   = useState(false);
const [copyingList, setCopyingList]   = useState(false);
```

- [ ] **Step 4.3 — Add clipboard copy handler**

After the existing `showToast` declaration, add:

```jsx
const copyShoppingList = useCallback(async () => {
  if (!recipe) return;
  const scaledIngs = (recipe.ingredients || []).map(i => scaleIngredient(i, ratio));
  const text = [
    `${recipe.title} — serves ${displayServings}`,
    "─".repeat(28),
    ...scaledIngs.map(i => `□ ${i}`),
  ].join("\n");
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  } catch {
    showToast("Copy failed — try again.");
  }
  setCopyingList(true);
  setTimeout(() => setCopyingList(false), 2000);
}, [recipe, ratio, displayServings, showToast]);
```

- [ ] **Step 4.4 — Add buttons to the recipe action row**

Find the existing action button group (the `<div className="flex gap-2 flex-wrap">` just below the recipe title in the result section). It currently has "Save Recipe" and "Export PDF" buttons.

Add three new buttons **after** the Export PDF button:

```jsx
<button
  onClick={() => setCookingMode(true)}
  className="rounded-full bg-white text-slate-700 border border-slate-200 px-5 py-2.5 text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] hover:border-slate-400 transition-all duration-150"
>Start Cooking</button>
<button
  onClick={copyShoppingList}
  disabled={copyingList}
  className="rounded-full bg-white text-slate-700 border border-slate-200 px-5 py-2.5 text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] hover:border-slate-400 transition-all duration-150 disabled:opacity-50"
>{copyingList ? "✓ Copied" : "📋 Copy List"}</button>
<button
  onClick={() => exportShoppingList(recipe, displayServings, ratio)}
  className="rounded-full bg-white text-slate-700 border border-slate-200 px-5 py-2.5 text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] hover:border-slate-400 transition-all duration-150"
>🖨 Print List</button>
```

- [ ] **Step 4.5 — Render `CookingMode` overlay**

Just before the closing `</div>` of the outermost return (after the Bottom Sheets block), add:

```jsx
{/* Cooking Mode overlay */}
{cookingMode && recipe && (
  <CookingMode
    steps={recipe.steps || []}
    proMode={proMode}
    onClose={() => setCookingMode(false)}
  />
)}
```

- [ ] **Step 4.6 — Run lint to catch any issues**

```bash
cd testbed && npm run lint
```

Expected: 0 errors. Fix any reported issues before continuing.

- [ ] **Step 4.7 — Run tests to confirm nothing regressed**

```bash
cd testbed && npm test
```

Expected: All tests pass (including the 9 parseStepTime tests).

- [ ] **Step 4.8 — Commit**

```bash
cd "C:\Users\alias\OneDrive\AI Projects\whatscooking"
git add RecipeGenerator.jsx
git commit -m "feat: integrate cooking mode and shopping list into recipe card"
```

---

## Task 5: Manual smoke test & push

- [ ] **Step 5.1 — Start dev server**

```bash
cd testbed && npm run dev
```

Open `http://localhost:5173` (or whichever port Vite reports).

- [ ] **Step 5.2 — Smoke test cooking mode**

1. Add some ingredients, generate a recipe.
2. Click "Start Cooking" — fullscreen dark overlay should appear.
3. Progress bar shows Step 1 of N.
4. Steps that mention a time (e.g. "cook for 3–4 minutes") should show a `04:00` countdown.
5. Tap the timer digits — should become editable input.
6. Click "▶ Start" — timer counts down.
7. Click "← Prev" / "Next Step →" — step changes, timer resets.
8. On the last step, button reads "Finish 🎉". Tapping it shows the done screen.
9. "Back to Recipe" closes the overlay.
10. ✕ button closes from any step.

- [ ] **Step 5.3 — Smoke test shopping list**

1. With a recipe generated, click "📋 Copy List".
2. Paste into a text editor — should show title, rule, and `□ ingredient` lines.
3. Toast "Copied to clipboard!" should appear briefly.
4. Click "🖨 Print List" — new window opens with branded shopping list, print dialog fires.
5. Adjust serving size (e.g. ÷2), then copy again — quantities should be halved.

- [ ] **Step 5.4 — Push to GitHub**

```bash
cd "C:\Users\alias\OneDrive\AI Projects\whatscooking"
git push origin main
```

---

## Checklist: spec coverage

| Spec requirement | Task |
|---|---|
| Fullscreen dark overlay | Task 2 |
| Progress bar (step X of N) | Task 2 step 2.1 |
| Per-step countdown auto-parsed from text | Task 1 + Task 2 |
| Tap to edit timer | Task 2 step 2.1 |
| Play/pause | Task 2 step 2.1 |
| Bell on zero (Web Audio API) | Task 2 step 2.1 — `playBell()` |
| Prev / Next nav | Task 2 step 2.1 |
| Done screen with Back to Recipe | Task 2 step 2.1 |
| Home + Pro colour tokens | Task 2 — `accent` var from `proMode` |
| Copy to clipboard (plain text) | Task 4 step 4.3 |
| Print shopping list (branded) | Task 3 |
| Respects `displayServings` / `ratio` | Tasks 3 & 4.3 |
| "Start Cooking" + "📋 Copy" + "🖨 Print" buttons on action row | Task 4 step 4.4 |
