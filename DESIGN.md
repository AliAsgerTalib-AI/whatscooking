```markdown
# Design System Document: The Mathematical Editorial

## 1. Overview & Creative North Star: "The Digital Lithograph"
The Creative North Star for this design system is **The Digital Lithograph**. Moving away from the "soft" trends of modern UI, this system embraces the uncompromising rigors of Mid-Century Swiss Design. It treats the screen not as a flexible canvas, but as a high-precision printing plate. 

The aesthetic is defined by **Strict Brutalism**: a relentless commitment to the 1px black stroke, absolute zero-radius corners, and a mathematical grid that dictates every placement. We break the "template" look by utilizing extreme typographic scale contrasts—pairing massive display numbers with tiny, utilitarian labels—creating a layout that feels like a bespoke poster rather than a standard web form.

---

## 2. Colors
This system operates on a binary high-contrast philosophy. Depth is not achieved through shadows, but through the tension between `primary` (#000000) and `surface` (#f9f9f9).

- **Primary (#000000):** Used for all structural borders, primary text, and high-impact CTAs.
- **Surface (#f9f9f9):** The "Paper." All layouts begin here.
- **Surface Tiers:** Use `surface_container` (#eeeeee) and `surface_container_high` (#e8e8e8) to define active input zones or focused calculation results.
- **The "Visible Skeleton" Rule:** In direct opposition to standard "borderless" UI, this system mandates the use of `primary` (#000000) 1px solid borders to define every container. No background color shifts should exist without a defining stroke.
- **Signature Textures:** To avoid a "cheap" digital feel, large black areas (like a footer or a primary CTA) should utilize a subtle gradient from `primary` (#000000) to `primary_container` (#3b3b3b) to mimic the slight ink density variations of a physical print.

---

## 3. Typography
We utilize a Neo-Grotesque scale (Inter) to emulate the Helvetica ethos. The hierarchy is designed to be "Top-Heavy."

- **Display-LG (3.5rem):** Reserved for the output (the converted date). It should feel uncomfortably large, demanding the user's focus.
- **Headline-SM (1.5rem):** Used for primary input numbers (Day/Month/Year).
- **Label-SM (0.6875rem) & Label-MD (0.75rem):** These are the "Technical Annotations." Use these for field descriptors and units. They should always be uppercase with a slight letter-spacing increase (0.05rem) to ensure legibility against the 1px grid lines.
- **Body-MD (0.875rem):** Use for instructional text or secondary data points.

---

## 4. Elevation & Depth: The Flat Stack
In this system, "Elevation" is a purely mathematical concept. There are no shadows.

- **The Stacking Principle:** Depth is conveyed by "nesting" boxes within boxes. A result area is not "raised"; it is a smaller 1px box nested within the parent 1px grid cell.
- **The "No-Shadow" Mandate:** Shadows are strictly prohibited. If an element needs to "pop," give it a `primary` (#000000) background and switch the text to `on_primary` (#e2e2e2).
- **The Absolute Zero Rule:** All `Roundedness Scale` tokens are set to `0px`. There are no exceptions. Any radius introduced will break the mathematical integrity of the Swiss Grid.
- **The Grid as Navigation:** Use the 1px line as a wayfinding tool. Vertical lines should align across the entire page, creating "columns of data" that the eye can follow from input to result.

---

## 5. Components

### Input Fields
- **Styling:** No "box" for the input. Instead, the input occupies a full cell of the Swiss Grid, defined by 1px black borders on all four sides.
- **State:** On focus, the background shifts from `surface` to `surface_container`. The text remains `primary`.
- **Typography:** Use `headline-md` for the numeric entry to make the act of typing feel consequential.

### Buttons (The "Block" Button)
- **Primary:** Solid `primary` (#000000) background, `on_primary` text, uppercase `label-md`. 
- **Interaction:** On hover, the button flips to `on_primary` background with `primary` text (inverted). This high-contrast "flash" provides immediate feedback without needing shadows.

### Date Result Display
- **Styling:** A large, spanning container defined by a 2px black border (the only exception to the 1px rule) to denote the "Final Truth" of the calculation.
- **Content:** The converted date sits in `display-lg`, justified to the bottom-left of the cell.

### The "Grid Divider"
- **Styling:** Use the `spacing-px` (1px) token with the `primary` color to create a continuous vertical or horizontal line that bleeds to the edges of the viewport, reinforcing the "infinite grid" feel.

---

## 6. Do's and Don'ts

### Do:
- **Do** align every element to a common vertical axis. If a label starts at 2.25rem (Spacing-10) from the left, the result text must also start there.
- **Do** use whitespace as a structural element. A completely empty grid cell is a valid way to create visual breathing room.
- **Do** treat the UI as a static document. Transitions should be "Hard Cuts" or very fast linear fades (0.1s) to maintain the mechanical feel.

### Don't:
- **Don't** use icons unless absolutely necessary. If required, use strictly geometric, non-rounded line icons with a 1px or 2px stroke weight.
- **Don't** use "Grey." Stick to the high-contrast `primary` and `surface` tiers. The `outline` (#777777) should only be used for disabled states.
- **Don't** use centered text. Everything should be Flush-Left (Ragged Right) to maintain the architectural alignment of the Swiss style.
- **Don't** use 1px borders for "decoration." Every line must be a boundary between functional data points.

---

## 7. Spacing Logic
The grid follows a strict adherence to the `Spacing Scale`. 
- **Outer Margins:** Always use `24` (5.5rem) or `20` (4.5rem) to create a "frame" of white space around the grid.
- **Gutter:** Use `2` (0.4rem) for internal cell padding between a border and its content. 
- **Vertical Rhythm:** Labels should be exactly `3.5` (0.75rem) above their respective input values.```