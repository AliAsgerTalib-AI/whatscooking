const NUTRIENTS = [
  { key: "protein", label: "Protein", unit: "g",  max: 60 },
  { key: "carbs",   label: "Carbs",   unit: "g",  max: 120 },
  { key: "fat",     label: "Fat",     unit: "g",  max: 60 },
  { key: "fiber",   label: "Fiber",   unit: "g",  max: 30 },
  { key: "sodium",  label: "Sodium",  unit: "mg", max: 2300 },
];

export function NutritionBar({ nutrition, barColor = "bg-orange-500" }) {
  if (!nutrition) return null;
  return (
    <div>
      <div className="text-[0.7rem] font-semibold tracking-widest uppercase text-slate-400 mb-3 pb-2 border-b border-slate-100">
        Nutrition <span className="font-normal normal-case tracking-normal text-slate-300">per serving</span>
      </div>
      <div className="text-center mb-4 py-2 rounded-xl bg-orange-50 border border-orange-100">
        <div className="text-2xl font-bold text-orange-500">{nutrition.calories}</div>
        <div className="text-[0.6rem] font-semibold tracking-widest uppercase text-slate-400">kcal</div>
      </div>
      {NUTRIENTS.map(({ key, label, unit, max }) => {
        const value = nutrition[key];
        if (value == null) return null;
        const pct = Math.min(100, Math.round((value / max) * 100));
        return (
          <div key={key} className="mb-3">
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
      })}
      {nutrition.note && (
        <p className="text-[0.6rem] text-slate-300 mt-2 italic">{nutrition.note}</p>
      )}
    </div>
  );
}
