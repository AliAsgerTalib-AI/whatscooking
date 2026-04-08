/**
 * NutritionBar — renders a labelled progress bar for a single macro nutrient.
 *
 * @param {{ label: string, value: number, unit: string, max: number, color: string }} props
 */
export function NutritionBar({ label, value, unit, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ marginBottom:"0.85rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.3rem" }}>
        <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.5)" }}>{label}</span>
        <span style={{ fontSize:"0.75rem", fontWeight:700, color }}>{value}{unit}</span>
      </div>
      <div
        role="img"
        aria-label={`${label}: ${value}${unit}`}
        style={{ height:5, borderRadius:3, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}
      >
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:3, transition:"width 0.6s ease" }} />
      </div>
    </div>
  );
}
