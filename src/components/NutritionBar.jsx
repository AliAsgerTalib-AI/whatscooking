/**
 * NutritionBar — labelled progress bar for a single macro nutrient.
 * Color prop is accepted but unused; all bars render in primary (#000).
 *
 * @param {{ label: string, value: number, unit: string, max: number }} props
 */
export function NutritionBar({ label, value, unit, max }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-label-sm uppercase tracking-label">{label}</span>
        <span className="text-label-sm font-bold">{value}{unit}</span>
      </div>
      <div
        role="img"
        aria-label={`${label}: ${value}${unit}`}
        className="h-[3px] bg-surface-container-high w-full"
      >
        <div
          className="h-full bg-primary transition-[width] duration-100 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
