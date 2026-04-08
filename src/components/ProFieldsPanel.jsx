/**
 * ProFieldsPanel — metadata fields for the professional recipe card.
 *
 * @param {{
 *   proFields: import("../types/recipe.ts").ProFields,
 *   onChange: (fields: import("../types/recipe.ts").ProFields) => void
 * }} props
 */

const labelCls = "block text-label-sm uppercase tracking-label text-outline mb-[0.75rem]";
const inputCls = "w-full border border-primary bg-surface px-2 py-2 text-body-md font-[inherit] outline-none transition-colors duration-100 ease-linear focus:bg-surface-container";

export function ProFieldsPanel({ proFields, onChange }) {
  const f   = proFields;
  const set = (key, val) => onChange({ ...f, [key]: val });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pro-chef-name" className={labelCls}>Chef Name</label>
          <input id="pro-chef-name" value={f.chefName || ""} onChange={e => set("chefName", e.target.value)} placeholder="e.g. Chef Marcos" className={inputCls} />
        </div>
        <div>
          <label htmlFor="pro-station" className={labelCls}>Station</label>
          <input id="pro-station" value={f.station || ""} onChange={e => set("station", e.target.value)} placeholder="e.g. Hot line, Pastry" className={inputCls} />
        </div>
        <div>
          <label htmlFor="pro-version" className={labelCls}>Version</label>
          <input id="pro-version" value={f.version || ""} onChange={e => set("version", e.target.value)} placeholder="e.g. 1.2" className={inputCls} />
        </div>
        <div>
          <label htmlFor="pro-cost" className={labelCls}>Cost / Portion</label>
          <input id="pro-cost" value={f.costPerPortion || ""} onChange={e => set("costPerPortion", e.target.value)} placeholder="e.g. $4.20" className={inputCls} />
        </div>
      </div>
      <p className="text-label-sm text-outline">
        These fields appear on the professional recipe card PDF alongside recipe ID, allergen matrix, and mise en place.
      </p>
    </div>
  );
}
