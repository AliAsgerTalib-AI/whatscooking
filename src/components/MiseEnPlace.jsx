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
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.08]">
        <div className="text-[0.66rem] tracking-[0.2em] uppercase text-fl-indigo font-bold">🔪 Mise en Place</div>
        {/* BP-07: live region so screen readers announce progress */}
        <div role="status" aria-live="polite" className="text-[0.72rem] text-white/35">{done}/{items.length} done</div>
      </div>
      <div className="flex flex-col gap-1.5">
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
              className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-150 ${
                checked[k]
                  ? "bg-fl-green/[0.06] border-fl-green/25"
                  : "bg-black/20 border-white/[0.06]"
              }`}
            >
              <div className={`w-[18px] h-[18px] rounded mt-px shrink-0 flex items-center justify-center border-[1.5px] transition-all duration-150 ${
                checked[k]
                  ? "bg-fl-green border-fl-green"
                  : "bg-transparent border-white/20"
              }`}>
                {checked[k] && <span className="text-[#0f0c29] text-[0.7rem] font-black">✓</span>}
              </div>
              <span className={`text-[0.83rem] leading-[1.5] transition-all duration-150 ${
                checked[k] ? "text-white/30 line-through" : "text-white/75"
              }`}>{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
