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
    <div style={{ marginTop:"1.5rem" }}>
      <div style={{ fontSize:"0.66rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#f94144", fontWeight:700, marginBottom:"1rem", paddingBottom:"0.5rem", borderBottom:"1px solid rgba(249,65,68,0.2)" }}>
        ⚠️ Allergen Matrix — EU Reg. 1169/2011
      </div>

      {/* Grid of all 14 — BP-02: use stable allergen id as key */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(90px, 1fr))", gap:"0.5rem", marginBottom:"1rem" }}>
        {ALLERGENS.map(a => {
          const hit       = allergens.find(x => x.id === a.id);
          const isPresent = hit?.present;
          const isMay     = hit?.mayContain;
          return (
            <div
              key={a.id}
              style={{ borderRadius:10, padding:"0.55rem 0.4rem", textAlign:"center", border:`1.5px solid ${isPresent?"rgba(249,65,68,0.6)":isMay?"rgba(249,199,79,0.4)":"rgba(255,255,255,0.07)"}`, background:isPresent?"rgba(249,65,68,0.12)":isMay?"rgba(249,199,79,0.07)":"rgba(0,0,0,0.2)", transition:"all 0.2s", position:"relative" }}
              aria-label={`${a.label}: ${isPresent ? "contains" : isMay ? "may contain" : "not present"}`}
            >
              <div style={{ fontSize:"1.3rem", lineHeight:1, marginBottom:"0.3rem" }}>{a.icon}</div>
              <div style={{ fontSize:"0.6rem", color:isPresent?"#f87171":isMay?"#f9c74f":"rgba(255,255,255,0.25)", fontWeight:isPresent||isMay?700:400, lineHeight:1.2 }}>{a.label}</div>
              {isPresent         && <div style={{ position:"absolute", top:4, right:4, width:8, height:8, borderRadius:"50%", background:"#f94144" }} aria-hidden="true" />}
              {isMay && !isPresent && <div style={{ position:"absolute", top:4, right:4, width:8, height:8, borderRadius:"50%", background:"#f9c74f" }} aria-hidden="true" />}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", marginBottom:"0.75rem" }}>
        {[["#f94144","Contains"],["#f9c74f","May contain"],["rgba(255,255,255,0.15)","Not present"]].map(([bg,lbl]) => (
          <div key={lbl} style={{ display:"flex", alignItems:"center", gap:"0.4rem", fontSize:"0.72rem", color:"rgba(255,255,255,0.5)" }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:bg }} aria-hidden="true" />{lbl}
          </div>
        ))}
      </div>

      {/* Summary */}
      {present.length > 0 && (
        <div style={{ background:"rgba(249,65,68,0.08)", border:"1px solid rgba(249,65,68,0.25)", borderRadius:10, padding:"0.75rem 1rem", fontSize:"0.78rem", color:"rgba(255,255,255,0.65)", lineHeight:1.6, marginBottom:"0.5rem" }}>
          <strong style={{ color:"#f87171" }}>Contains: </strong>
          {present.map(a => ALLERGENS.find(x => x.id === a.id)?.label).filter(Boolean).join(", ")}
        </div>
      )}
      {mayContain.length > 0 && (
        <div style={{ background:"rgba(249,199,79,0.06)", border:"1px solid rgba(249,199,79,0.2)", borderRadius:10, padding:"0.75rem 1rem", fontSize:"0.78rem", color:"rgba(255,255,255,0.55)", lineHeight:1.6 }}>
          <strong style={{ color:"#f9c74f" }}>May contain: </strong>
          {mayContain.map(a => ALLERGENS.find(x => x.id === a.id)?.label).filter(Boolean).join(", ")}
        </div>
      )}

      <p style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.2)", marginTop:"0.6rem", lineHeight:1.5 }}>
        ⓘ AI-generated allergen data. Always verify against actual ingredient labels before service. Not a substitute for professional allergen assessment.
      </p>
    </div>
  );
}
