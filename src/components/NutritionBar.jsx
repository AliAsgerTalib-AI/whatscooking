export function NutritionBar({ label, value, unit, max, barColor = "bg-slate-700" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1.5">
        <span className="text-[0.65rem] font-semibold tracking-widest uppercase text-slate-400">{label}</span>
        <span className="text-[0.65rem] font-bold text-slate-600">{value}{unit}</span>
      </div>
      <div
        role="img"
        aria-label={`${label}: ${value}${unit}`}
        className="h-[4px] bg-slate-100 w-full rounded-full overflow-hidden"
      >
        <div
          className={`h-full ${barColor} rounded-full transition-[width] duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
