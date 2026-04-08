/**
 * NutritionBar — renders a labelled progress bar for a single macro nutrient.
 *
 * @param {{ label: string, value: number, unit: string, max: number, color: string }} props
 */
export function NutritionBar({ label, value, unit, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mb-3.5">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}{unit}</span>
      </div>
      <div
        role="img"
        aria-label={`${label}: ${value}${unit}`}
        className="h-[5px] rounded-full bg-white/[0.08] overflow-hidden"
      >
        <div
          className="h-full rounded-full transition-[width] duration-[600ms] ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
