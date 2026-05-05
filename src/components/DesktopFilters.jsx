import { CUISINES }  from "../data/cuisines.js";
import { FLAVORS }   from "../data/flavors.js";
import { DIETS }     from "../data/diets.js";
import { METHODS }   from "../data/methods.js";
import { ALLERGENS } from "../data/allergens.js";
import { card, lbl, chipClass, inputCls } from "../tokens.js";

export function DesktopFilters({
  selectedCuisine, customCuisine,
  selectedFlavors, selectedDiets,
  selectedMethod, selectedAllergens,
  onCuisineChange, onCustomCuisineChange,
  onFlavorToggle, onDietToggle,
  onMethodToggle, onAllergenToggle,
}) {
  return (<>
    <div className={card}>
      <div className={lbl}>Cuisine Style</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {CUISINES.map(c => (
          <button
            key={c.val}
            className={chipClass(selectedCuisine === c.val && !customCuisine)}
            onClick={() => { onCuisineChange(c.val); onCustomCuisineChange(""); }}
          >{c.label}</button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Or type your own (e.g. Cajun, Hawaiian...)"
        value={customCuisine}
        onChange={e => { onCustomCuisineChange(e.target.value); onCuisineChange(""); }}
        className={inputCls}
      />
    </div>
    <div className={card}>
      <div className={lbl}>Flavor Profile <span className="font-normal normal-case tracking-normal text-slate-300">— pick any</span></div>
      <div className="flex flex-wrap gap-1.5">
        {FLAVORS.map(f => (
          <button key={f.val} className={chipClass(selectedFlavors.includes(f.val))} onClick={() => onFlavorToggle(f.val)}>{f.label}</button>
        ))}
      </div>
    </div>
    <div className={card}>
      <div className={lbl}>Dietary Requirements <span className="font-normal normal-case tracking-normal text-slate-300">— pick any</span></div>
      <div className="flex flex-wrap gap-1.5">
        {DIETS.map(d => (
          <button key={d.val} className={chipClass(selectedDiets.includes(d.val))} onClick={() => onDietToggle(d.val)}>{d.label}</button>
        ))}
      </div>
    </div>
    <div className={card}>
      <div className={lbl}>Allergens to Avoid <span className="font-normal normal-case tracking-normal text-slate-300">— pick any</span></div>
      <div className="flex flex-wrap gap-1.5">
        {ALLERGENS.map(a => (
          <button key={a.id} className={chipClass(selectedAllergens.includes(a.id))} onClick={() => onAllergenToggle(a.id)}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>
    </div>
    <div className={card}>
      <div className={lbl}>Cooking Method <span className="font-normal normal-case tracking-normal text-slate-300">— pick one</span></div>
      <div className="flex flex-wrap gap-1.5">
        {METHODS.map(me => (
          <button key={me.val} className={chipClass(selectedMethod === me.val)} onClick={() => onMethodToggle(me.val)}>{me.label}</button>
        ))}
      </div>
    </div>
  </>);
}
