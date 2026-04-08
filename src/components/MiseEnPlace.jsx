/**
 * MiseEnPlace — interactive prep-task checklist for professional kitchen mode.
 *
 * @param {{ items: string[] }} props
 */
import { useState } from "react";

export function MiseEnPlace({ items }) {
  const [checked, setChecked] = useState(/** @type {Record<string, boolean>} */ ({}));
  if (!items?.length) return null;

  const keyFor = (item, i) => `${item}::${i}`;
  const toggle = key => setChecked(p => ({ ...p, [key]: !p[key] }));
  const done   = Object.values(checked).filter(Boolean).length;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3 pb-1 border-b border-primary">
        <span className="text-label-sm uppercase tracking-label font-bold">Mise en Place</span>
        <span role="status" aria-live="polite" className="text-label-sm text-outline">{done}/{items.length} done</span>
      </div>
      <div className="flex flex-col gap-1">
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
              className={`flex items-start gap-3 px-2 py-2 border border-primary cursor-pointer transition-colors duration-100 ease-linear ${
                checked[k] ? "bg-surface-container" : "bg-surface"
              }`}
            >
              <div className={`w-4 h-4 border border-primary shrink-0 mt-px flex items-center justify-center transition-colors duration-100 ease-linear ${
                checked[k] ? "bg-primary" : "bg-surface"
              }`}>
                {checked[k] && <span className="text-on-primary text-[0.6rem] font-black leading-none">✓</span>}
              </div>
              <span className={`text-body-md transition-colors duration-100 ease-linear ${
                checked[k] ? "text-outline line-through" : "text-primary"
              }`}>{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
