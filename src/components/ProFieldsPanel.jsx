/**
 * ProFieldsPanel — optional metadata fields for the professional recipe card.
 *
 * @param {{
 *   proFields: import("../types/recipe.ts").ProFields,
 *   onChange: (fields: import("../types/recipe.ts").ProFields) => void
 * }} props
 */

const inp = (extra = {}) => ({
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  padding: "0.55rem 0.75rem",
  color: "#f0ede6",
  fontSize: "0.82rem",
  fontFamily: "inherit",
  outline: "none",
  width: "100%",
  ...extra,
});

export function ProFieldsPanel({ proFields, onChange }) {
  const f   = proFields;
  const set = (key, val) => onChange({ ...f, [key]: val });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
        <div>
          <label
            htmlFor="pro-chef-name"
            style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:"0.35rem" }}
          >Chef Name</label>
          <input
            id="pro-chef-name"
            value={f.chefName || ""}
            onChange={e => set("chefName", e.target.value)}
            placeholder="e.g. Chef Marcos"
            style={inp()}
          />
        </div>
        <div>
          <label
            htmlFor="pro-station"
            style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:"0.35rem" }}
          >Station</label>
          <input
            id="pro-station"
            value={f.station || ""}
            onChange={e => set("station", e.target.value)}
            placeholder="e.g. Hot line, Pastry"
            style={inp()}
          />
        </div>
        <div>
          <label
            htmlFor="pro-version"
            style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:"0.35rem" }}
          >Version</label>
          <input
            id="pro-version"
            value={f.version || ""}
            onChange={e => set("version", e.target.value)}
            placeholder="e.g. 1.2"
            style={inp()}
          />
        </div>
        <div>
          <label
            htmlFor="pro-cost"
            style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:"0.35rem" }}
          >Cost / Portion</label>
          <input
            id="pro-cost"
            value={f.costPerPortion || ""}
            onChange={e => set("costPerPortion", e.target.value)}
            placeholder="e.g. $4.20"
            style={inp()}
          />
        </div>
      </div>
      <p style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.25)", lineHeight:1.5 }}>
        These fields appear on the professional recipe card PDF alongside recipe ID, allergen matrix, and mise en place.
      </p>
    </div>
  );
}
