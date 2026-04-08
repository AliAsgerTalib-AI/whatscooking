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
      <div className="text-[0.66rem] tracking-[0.2em] uppercase text-fl-red font-bold mb-4 pb-2 border-b border-fl-red/20">
        ⚠️ Allergen Matrix — EU Reg. 1169/2011
      </div>

      {/* Grid of all 14 — BP-02: use stable allergen id as key */}
      <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}>
        {ALLERGENS.map(a => {
          const hit       = allergens.find(x => x.id === a.id);
          const isPresent = hit?.present;
          const isMay     = hit?.mayContain;
          return (
            <div
              key={a.id}
              className={`relative rounded-[10px] py-2 px-[0.4rem] text-center border-[1.5px] transition-all duration-200 ${
                isPresent
                  ? "bg-fl-red/[0.12] border-fl-red/60"
                  : isMay
                    ? "bg-fl-gold/[0.07] border-fl-gold/40"
                    : "bg-black/20 border-white/[0.07]"
              }`}
              aria-label={`${a.label}: ${isPresent ? "contains" : isMay ? "may contain" : "not present"}`}
            >
              <div className="text-[1.3rem] leading-none mb-1">{a.icon}</div>
              <div className={`text-[0.6rem] leading-[1.2] ${
                isPresent
                  ? "text-[#f87171] font-bold"
                  : isMay
                    ? "text-fl-gold font-bold"
                    : "text-white/25 font-normal"
              }`}>{a.label}</div>
              {isPresent           && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-fl-red"          aria-hidden="true" />}
              {isMay && !isPresent && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-fl-gold"         aria-hidden="true" />}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap mb-3">
        {[
          ["bg-fl-red",          "Contains"],
          ["bg-fl-gold",         "May contain"],
          ["bg-white/[0.15]",    "Not present"],
        ].map(([bg, lbl]) => (
          <div key={lbl} className="flex items-center gap-1.5 text-[0.72rem] text-white/50">
            <div className={`w-2.5 h-2.5 rounded-full ${bg}`} aria-hidden="true" />{lbl}
          </div>
        ))}
      </div>

      {/* Summary */}
      {present.length > 0 && (
        <div className="bg-fl-red/[0.08] border border-fl-red/25 rounded-[10px] px-4 py-3 text-[0.78rem] text-white/65 leading-[1.6] mb-2">
          <strong className="text-[#f87171]">Contains: </strong>
          {present.map(a => ALLERGENS.find(x => x.id === a.id)?.label).filter(Boolean).join(", ")}
        </div>
      )}
      {mayContain.length > 0 && (
        <div className="bg-fl-gold/[0.06] border border-fl-gold/20 rounded-[10px] px-4 py-3 text-[0.78rem] text-white/55 leading-[1.6]">
          <strong className="text-fl-gold">May contain: </strong>
          {mayContain.map(a => ALLERGENS.find(x => x.id === a.id)?.label).filter(Boolean).join(", ")}
        </div>
      )}

      <p className="text-[0.62rem] text-white/20 mt-2.5 leading-[1.5]">
        ⓘ AI-generated allergen data. Always verify against actual ingredient labels before service. Not a substitute for professional allergen assessment.
      </p>
    </div>
  );
}
