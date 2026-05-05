import { pillClass } from "../tokens.js";

export function MobileFilterBar({
  customCuisine, selectedCuisine,
  selectedFlavors, selectedDiets,
  selectedMethod, servings, selectedAllergens,
  onOpen,
}) {
  const pills = [
    { id: "cuisine",   label: customCuisine || selectedCuisine || "Cuisine",         active: !!(customCuisine || selectedCuisine) },
    { id: "flavor",    label: selectedFlavors.length   ? `${selectedFlavors.length} Flavor${selectedFlavors.length > 1 ? "s" : ""}` : "Flavor",     active: selectedFlavors.length > 0 },
    { id: "diet",      label: selectedDiets.length     ? `${selectedDiets.length} Diet${selectedDiets.length > 1 ? "s" : ""}`       : "Diet",       active: selectedDiets.length > 0 },
    { id: "method",    label: selectedMethod || "Method",                             active: !!selectedMethod },
    { id: "servings",  label: `${servings} People`,                                  active: true },
    { id: "allergies", label: selectedAllergens.length ? `${selectedAllergens.length} Allergen${selectedAllergens.length > 1 ? "s" : ""}` : "Allergens", active: selectedAllergens.length > 0 },
  ];
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
      {pills.map(p => (
        <button key={p.id} onClick={() => onOpen(p.id)} className={pillClass(p.active)}>
          {p.label} <span className="opacity-50 text-[0.65rem]">▾</span>
        </button>
      ))}
    </div>
  );
}
