/**
 * MiseEnPlace — interactive prep-task checklist for professional kitchen mode.
 *
 * @param {{ items: string[] }} props
 */
import { useState } from "react";

export function MiseEnPlace({ items }) {
  // BP-13: use item text as key rather than array index — stable across re-renders
  const [checked, setChecked] = useState(/** @type {Record<string, boolean>} */ ({}));
  if (!items?.length) return null;

  // Key by item text; fall back to index suffix only on true duplicates
  const keyFor = (item, i) => `${item}::${i}`;
  const toggle = key => setChecked(p => ({ ...p, [key]: !p[key] }));
  const done   = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{ marginTop:"1.5rem" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem", paddingBottom:"0.5rem", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize:"0.66rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#818cf8", fontWeight:700 }}>🔪 Mise en Place</div>
        {/* BP-07: live region so screen readers announce progress */}
        <div role="status" aria-live="polite" style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.35)" }}>{done}/{items.length} done</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
        {items.map((item, i) => {
          const k = keyFor(item, i);
          return (
            <div
              key={k}
              role="checkbox"
              aria-checked={!!checked[k]}
              tabIndex={0}
              onClick={() => toggle(k)}
              onKeyDown={e => (e.key === " " || e.key === "Enter") && toggle(k)}
              style={{ display:"flex", alignItems:"flex-start", gap:"0.65rem", padding:"0.6rem 0.75rem", borderRadius:8, background:checked[k]?"rgba(74,222,128,0.06)":"rgba(0,0,0,0.2)", border:`1px solid ${checked[k]?"rgba(74,222,128,0.25)":"rgba(255,255,255,0.06)"}`, cursor:"pointer", transition:"all 0.15s" }}
            >
              <div style={{ width:18, height:18, borderRadius:4, border:`1.5px solid ${checked[k]?"#4ade80":"rgba(255,255,255,0.2)"}`, background:checked[k]?"#4ade80":"transparent", flexShrink:0, marginTop:1, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                {checked[k] && <span style={{ color:"#0f0c29", fontSize:"0.7rem", fontWeight:900 }}>✓</span>}
              </div>
              <span style={{ fontSize:"0.83rem", color:checked[k]?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.75)", textDecoration:checked[k]?"line-through":"none", lineHeight:1.5, transition:"all 0.15s" }}>{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
