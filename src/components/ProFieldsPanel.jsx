/**
 * ProFieldsPanel — optional metadata fields for the professional recipe card.
 *
 * @param {{
 *   proFields: import("../types/recipe.ts").ProFields,
 *   onChange: (fields: import("../types/recipe.ts").ProFields) => void
 * }} props
 */

const labelCls = "block text-[0.68rem] text-white/40 tracking-[0.1em] uppercase mb-1.5";
const inputCls = "w-full bg-black/30 border border-white/[0.15] rounded-lg px-3 py-2 text-fl-text text-[0.82rem] font-[inherit] outline-none";

export function ProFieldsPanel({ proFields, onChange }) {
  const f   = proFields;
  const set = (key, val) => onChange({ ...f, [key]: val });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pro-chef-name" className={labelCls}>Chef Name</label>
          <input
            id="pro-chef-name"
            value={f.chefName || ""}
            onChange={e => set("chefName", e.target.value)}
            placeholder="e.g. Chef Marcos"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="pro-station" className={labelCls}>Station</label>
          <input
            id="pro-station"
            value={f.station || ""}
            onChange={e => set("station", e.target.value)}
            placeholder="e.g. Hot line, Pastry"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="pro-version" className={labelCls}>Version</label>
          <input
            id="pro-version"
            value={f.version || ""}
            onChange={e => set("version", e.target.value)}
            placeholder="e.g. 1.2"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="pro-cost" className={labelCls}>Cost / Portion</label>
          <input
            id="pro-cost"
            value={f.costPerPortion || ""}
            onChange={e => set("costPerPortion", e.target.value)}
            placeholder="e.g. $4.20"
            className={inputCls}
          />
        </div>
      </div>
      <p className="text-[0.7rem] text-white/25 leading-[1.5]">
        These fields appear on the professional recipe card PDF alongside recipe ID, allergen matrix, and mise en place.
      </p>
    </div>
  );
}
