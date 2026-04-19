# PRD Publish + Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the FlavorLab PRD as part of the repo and add a Vitest unit test suite covering all four utility modules.

**Architecture:** Tests live in `testbed/tests/` and import utilities from `../../src/utils/`. Vitest is configured inside `testbed/` (where `package.json` lives) with a jsdom environment for the localStorage-dependent storage tests. The PRD doc is committed as `docs/superpowers/specs/2026-04-19-flavorlab-prd.md` and linked from a rewritten root-level README.

**Tech Stack:** Vitest 2, @vitest/environment-jsdom, existing React 18 + Vite + Tailwind stack.

---

## File Map

| Action | Path | Purpose |
|---|---|---|
| Create | `testbed/vitest.config.js` | Vitest configuration pointing at `tests/` |
| Create | `testbed/tests/formatNum.test.js` | Unit tests for `formatNum` |
| Create | `testbed/tests/scaleIngredient.test.js` | Unit tests for `scaleIngredient` |
| Create | `testbed/tests/makeid.test.js` | Unit tests for `makeid` |
| Create | `testbed/tests/storage.test.js` | Unit tests for storage utils (jsdom env) |
| Modify | `testbed/package.json` | Add vitest + jsdom dev deps, add `test` script |
| Modify | `testbed/README.md` | Replace Vite boilerplate with FlavorLab project README |

Source files being tested (read-only):
- `src/utils/formatNum.js`
- `src/utils/scaleIngredient.js`
- `src/utils/makeid.js`
- `src/utils/storage.js`

---

## Task 1: Publish the PRD — update README and commit

**Files:**
- Modify: `testbed/README.md`
- Commit: `docs/superpowers/specs/2026-04-19-flavorlab-prd.md` + `testbed/README.md`

- [ ] **Step 1: Replace testbed/README.md with project README**

Replace the entire contents of `testbed/README.md` with:

```markdown
# FlavorLab

An open-source AI recipe generator powered by Claude Sonnet. Two modes: **Home** (casual, imperial units) and **Pro** (professional kitchen, metric weights, EU allergen compliance, HACCP notes).

**[Try it live →](https://whatscooking.vercel.app)**

## Quick Start

```bash
# Install
cd testbed && npm install

# Full-stack dev (AI generation enabled)
cd ..  # repo root
vercel dev  # requires ANTHROPIC_API_KEY in .env

# Frontend only
cd testbed && npm run dev
```

## Environment

Create `.env` at repo root:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Tech Stack

React 18 · Vite · Tailwind CSS · Claude Sonnet (`claude-sonnet-4-20250514`) · Vercel Serverless

## Docs

- [Product Requirements Document](../docs/superpowers/specs/2026-04-19-flavorlab-prd.md)

## Contributing

See the PRD for contribution areas. Key invariant: **never remove the allergen disclaimer** in `src/export/exportProPDF.js` — it is legally required.
```

- [ ] **Step 2: Commit the PRD and README**

```bash
git add docs/superpowers/specs/2026-04-19-flavorlab-prd.md testbed/README.md
git commit -m "docs: add PRD and update project README"
```

Expected: commit succeeds, `git log --oneline -1` shows the docs commit.

---

## Task 2: Install Vitest and configure

**Files:**
- Modify: `testbed/package.json`
- Create: `testbed/vitest.config.js`

- [ ] **Step 1: Install vitest and jsdom**

```bash
cd testbed && npm install --save-dev vitest @vitest/environment-jsdom
```

Expected: `package.json` devDependencies now includes `vitest` and `@vitest/environment-jsdom`.

- [ ] **Step 2: Add test script to testbed/package.json**

In `testbed/package.json`, add `"test": "vitest run"` and `"test:watch": "vitest"` to `"scripts"`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Create testbed/vitest.config.js**

```js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    environment: "node",
  },
});
```

- [ ] **Step 4: Verify vitest is runnable (no tests yet)**

```bash
cd testbed && npm test
```

Expected: exits 0 with "No test files found" or similar — not an error crash.

- [ ] **Step 5: Commit**

```bash
cd ..
git add testbed/package.json testbed/package-lock.json testbed/vitest.config.js
git commit -m "chore: add vitest test framework"
```

---

## Task 3: Test `formatNum`

**Files:**
- Create: `testbed/tests/formatNum.test.js`
- Source: `src/utils/formatNum.js`

`formatNum(n)` converts a decimal to a human-friendly fraction string.
Rules: `0` → `"0"`, whole numbers → their string, known fractions → unicode symbols, others → one decimal place.

- [ ] **Step 1: Write the failing tests**

Create `testbed/tests/formatNum.test.js`:

```js
import { describe, it, expect } from "vitest";
import { formatNum } from "../../src/utils/formatNum.js";

describe("formatNum", () => {
  it("returns '0' for zero and negative numbers", () => {
    expect(formatNum(0)).toBe("0");
    expect(formatNum(-1)).toBe("0");
  });

  it("returns string integer for whole numbers", () => {
    expect(formatNum(1)).toBe("1");
    expect(formatNum(3)).toBe("3");
    expect(formatNum(10)).toBe("10");
  });

  it("returns unicode fraction for 0.25", () => {
    expect(formatNum(0.25)).toBe("¼");
  });

  it("returns unicode fraction for 0.5", () => {
    expect(formatNum(0.5)).toBe("½");
  });

  it("returns unicode fraction for 0.75", () => {
    expect(formatNum(0.75)).toBe("¾");
  });

  it("returns unicode fraction for 0.33", () => {
    expect(formatNum(0.33)).toBe("⅓");
  });

  it("returns unicode fraction for 0.67", () => {
    expect(formatNum(0.67)).toBe("⅔");
  });

  it("combines whole number with fraction for 1.5", () => {
    expect(formatNum(1.5)).toBe("1½");
  });

  it("combines whole number with fraction for 2.25", () => {
    expect(formatNum(2.25)).toBe("2¼");
  });

  it("falls back to one decimal place for unrecognized fractions", () => {
    expect(formatNum(1.1)).toBe("1.1");
    expect(formatNum(2.6)).toBe("2.6");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd testbed && npm test
```

Expected: FAIL — "Cannot find module '../../src/utils/formatNum.js'" (the import path resolves relative to testbed; confirm the path is correct by checking that `src/utils/formatNum.js` exists two directories up from `testbed/`).

- [ ] **Step 3: Fix import path if needed**

The project structure is:
```
whatscooking/
├── src/utils/formatNum.js   ← source
└── testbed/tests/           ← tests live here
```

From `testbed/tests/`, the correct import is `../../src/utils/formatNum.js`. If the test runner reports the file not found, verify with:
```bash
ls ../../src/utils/formatNum.js  # run from testbed/tests/
```

Vitest resolves from the config file location (`testbed/`), so the import `../../src/utils/formatNum.js` resolves to `src/utils/formatNum.js` from repo root. This is correct.

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd testbed && npm test
```

Expected: all 10 `formatNum` assertions pass.

- [ ] **Step 5: Commit**

```bash
cd ..
git add testbed/tests/formatNum.test.js
git commit -m "test: add unit tests for formatNum"
```

---

## Task 4: Test `scaleIngredient`

**Files:**
- Create: `testbed/tests/scaleIngredient.test.js`
- Source: `src/utils/scaleIngredient.js`

`scaleIngredient(text, ratio)` multiplies all numeric quantities in a string by `ratio` and returns a new string with human-friendly fractions. Handles plain decimals and `a/b` fractions in the text.

- [ ] **Step 1: Write the failing tests**

Create `testbed/tests/scaleIngredient.test.js`:

```js
import { describe, it, expect } from "vitest";
import { scaleIngredient } from "../../src/utils/scaleIngredient.js";

describe("scaleIngredient", () => {
  it("returns text unchanged when ratio is 1", () => {
    expect(scaleIngredient("2 cups flour", 1)).toBe("2 cups flour");
  });

  it("doubles integer quantities", () => {
    expect(scaleIngredient("2 cups flour", 2)).toBe("4 cups flour");
  });

  it("halves integer quantities using fraction symbols", () => {
    expect(scaleIngredient("2 cups flour", 0.5)).toBe("1 cups flour");
  });

  it("scales decimal quantities", () => {
    expect(scaleIngredient("1.5 kg chicken", 2)).toBe("3 kg chicken");
  });

  it("scales fraction notation (1/2)", () => {
    expect(scaleIngredient("1/2 tsp salt", 2)).toBe("1 tsp salt");
  });

  it("scales fraction notation and produces fraction symbol", () => {
    expect(scaleIngredient("1/2 tsp salt", 0.5)).toBe("¼ tsp salt");
  });

  it("handles multiple numbers in one string", () => {
    expect(scaleIngredient("2 cups and 1 tsp", 2)).toBe("4 cups and 2 tsp");
  });

  it("handles zero ratio producing '0'", () => {
    expect(scaleIngredient("3 eggs", 0)).toBe("0 eggs");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd testbed && npm test
```

Expected: FAIL on the new scaleIngredient tests (module not yet found or assertions fail).

- [ ] **Step 3: Run tests to confirm they pass**

No code to write — `scaleIngredient.js` already exists. Re-run after confirming import resolves:

```bash
cd testbed && npm test
```

Expected: all 8 scaleIngredient assertions pass (plus all 10 formatNum assertions from Task 3).

- [ ] **Step 4: Commit**

```bash
cd ..
git add testbed/tests/scaleIngredient.test.js
git commit -m "test: add unit tests for scaleIngredient"
```

---

## Task 5: Test `makeid`

**Files:**
- Create: `testbed/tests/makeid.test.js`
- Source: `src/utils/makeid.js`

`makeid()` returns a unique string ID. Uses `crypto.randomUUID()` when available, falls back to a Math.random hex string.

- [ ] **Step 1: Write the failing tests**

Create `testbed/tests/makeid.test.js`:

```js
import { describe, it, expect } from "vitest";
import { makeid } from "../../src/utils/makeid.js";

describe("makeid", () => {
  it("returns a non-empty string", () => {
    expect(typeof makeid()).toBe("string");
    expect(makeid().length).toBeGreaterThan(0);
  });

  it("returns unique values on successive calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => makeid()));
    expect(ids.size).toBe(100);
  });

  it("returns a UUID-shaped string when crypto is available", () => {
    // Node 14.17+ and all modern browsers support crypto.randomUUID
    const id = makeid();
    // UUID format: 8-4-4-4-12 hex chars separated by hyphens
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidRegex);
  });
});
```

- [ ] **Step 2: Run tests to confirm they pass**

```bash
cd testbed && npm test
```

Expected: all 3 makeid assertions pass (Vitest runs in Node where `crypto.randomUUID` is available).

- [ ] **Step 3: Commit**

```bash
cd ..
git add testbed/tests/makeid.test.js
git commit -m "test: add unit tests for makeid"
```

---

## Task 6: Test `storage`

**Files:**
- Create: `testbed/tests/storage.test.js`
- Modify: `testbed/vitest.config.js` (add jsdom environment for this file)
- Source: `src/utils/storage.js`

`storage.js` wraps localStorage with a `"flavorlab_"` prefix. Tests need a browser-like environment (`jsdom`) to have `localStorage` available.

- [ ] **Step 1: Update vitest.config.js to use jsdom for storage tests**

Replace `testbed/vitest.config.js` with:

```js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    environment: "node",
    environmentMatchGlobs: [
      ["tests/storage.test.js", "jsdom"],
    ],
  },
});
```

- [ ] **Step 2: Write the failing tests**

Create `testbed/tests/storage.test.js`:

```js
import { describe, it, expect, beforeEach } from "vitest";
import {
  storageGet,
  storageSet,
  storageRemove,
  storageAvailable,
} from "../../src/utils/storage.js";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("storageAvailable", () => {
    it("returns true in jsdom environment", () => {
      expect(storageAvailable()).toBe(true);
    });
  });

  describe("storageSet / storageGet round-trip", () => {
    it("stores and retrieves a string value", () => {
      storageSet("test", "hello");
      const result = storageGet("test", null);
      expect(result.ok).toBe(true);
      expect(result.value).toBe("hello");
    });

    it("stores and retrieves an object value", () => {
      storageSet("prefs", { theme: "dark" });
      const result = storageGet("prefs", null);
      expect(result.ok).toBe(true);
      expect(result.value).toEqual({ theme: "dark" });
    });

    it("uses the flavorlab_ prefix (key is not stored bare)", () => {
      storageSet("mykey", 42);
      expect(localStorage.getItem("mykey")).toBeNull();
      expect(localStorage.getItem("flavorlab_mykey")).toBe("42");
    });
  });

  describe("storageGet fallback", () => {
    it("returns fallback when key does not exist", () => {
      const result = storageGet("nonexistent", "default");
      expect(result.ok).toBe(true);
      expect(result.value).toBe("default");
    });
  });

  describe("storageRemove", () => {
    it("removes a stored key", () => {
      storageSet("toRemove", "data");
      storageRemove("toRemove");
      const result = storageGet("toRemove", "fallback");
      expect(result.value).toBe("fallback");
    });

    it("returns ok:true even when key does not exist", () => {
      const result = storageRemove("phantom");
      expect(result.ok).toBe(true);
    });
  });
});
```

- [ ] **Step 3: Run tests to confirm they pass**

```bash
cd testbed && npm test
```

Expected: all 7 storage assertions pass (jsdom provides `localStorage`), all previous tests still pass.

- [ ] **Step 4: Commit**

```bash
cd ..
git add testbed/vitest.config.js testbed/tests/storage.test.js
git commit -m "test: add unit tests for storage utils"
```

---

## Verification

Run the full suite from `testbed/`:

```bash
cd testbed && npm test
```

Expected output summary:
```
Test Files  4 passed (4)
Tests       28 passed (28)
```

Also confirm the existing dev workflow is unaffected:

```bash
cd testbed && npm run lint
```

Expected: no lint errors introduced by test files.
