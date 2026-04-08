/**
 * AllergenMatrix — EU Reg. 1169/2011 allergen display grid.
 *
 * @param {{ allergens: import("../types/recipe.ts").AllergenStatus[] | null }} props
 */

import { ALLERGENS } from "../data/allergens.js";

export function AllergenMatrix({ allergens }) {
  if (!allergens) return null;
  const present    = allergens.filter(a => a.present);
  const mayContain = allergens.filter(a => a.mayContain);

  return (
    <div className="mt-6">
      <div className="text-label-sm uppercase tracking-label font-bold mb-3 pb-1 border-b border-primary">
        Allergen Matrix — EU Reg. 1169/2011
      </div>

      {/* Grid of all 14 */}
      <div className="grid gap-px mb-4 bg-primary" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}>
        {ALLERGENS.map(a => {
          const hit       = allergens.find(x => x.id === a.id);
          const isPresent = hit?.present;
          const isMay     = hit?.mayContain;
          return (
            <div
              key={a.id}
              className={`py-2 px-1 text-center transition-colors duration-100 ease-linear ${
                isPresent
                  ? "bg-primary text-on-primary"
                  : isMay
                    ? "bg-surface-container text-primary"
                    : "bg-surface text-outline"
              }`}
              aria-label={`${a.label}: ${isPresent ? "contains" : isMay ? "may contain" : "not present"}`}
            >
              <div className="text-[1.1rem] leading-none mb-1">{a.icon}</div>
              <div className="text-label-sm uppercase tracking-label font-bold leading-[1.2]">{a.label}</div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap mb-3">
        {[
          ["bg-primary",              "on-primary", "Contains"],
          ["bg-surface-container",    "primary",    "May contain"],
          ["bg-surface border border-primary", "outline", "Not present"],
        ].map(([bg, , lbl]) => (
          <div key={lbl} className="flex items-center gap-2 text-label-sm">
            <div className={`w-3 h-3 border border-primary ${bg}`} aria-hidden="true" />
            <span className="uppercase tracking-label">{lbl}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      {present.length > 0 && (
        <div className="border border-primary px-3 py-2 text-body-md mb-2">
          <span className="text-label-sm uppercase tracking-label font-bold">Contains: </span>
          {present.map(a => ALLERGENS.find(x => x.id === a.id)?.label).filter(Boolean).join(", ")}
        </div>
      )}
      {mayContain.length > 0 && (
        <div className="border border-primary bg-surface-container px-3 py-2 text-body-md">
          <span className="text-label-sm uppercase tracking-label font-bold">May contain: </span>
          {mayContain.map(a => ALLERGENS.find(x => x.id === a.id)?.label).filter(Boolean).join(", ")}
        </div>
      )}

      <p className="text-label-sm text-outline mt-3">
        AI-generated allergen data. Always verify against actual ingredient labels before service. Not a substitute for professional allergen assessment.
      </p>
    </div>
  );
}
