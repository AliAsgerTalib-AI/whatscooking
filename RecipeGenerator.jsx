import { useState, useEffect, useCallback, useMemo } from "react";

// ── App-level constants ───────────────────────────────────────────────────────
const MAX_SERVINGS      = 200;
const MIN_SERVINGS      = 1;
const TOAST_DURATION_MS = 2200;

// ── Data ──────────────────────────────────────────────────────────────────────
import { CUISINES }                              from "./src/data/cuisines.js";
import { FLAVORS }                               from "./src/data/flavors.js";
import { DIETS }                                 from "./src/data/diets.js";
import { METHODS, SERVING_PRESETS, PRO_BATCH_PRESETS } from "./src/data/methods.js";
import { ALLERGENS }                             from "./src/data/allergens.js";

// ── Utilities ─────────────────────────────────────────────────────────────────
import { formatNum }        from "./src/utils/formatNum.js";
import { scaleIngredient }  from "./src/utils/scaleIngredient.js";

// ── API / hooks / export ──────────────────────────────────────────────────────
import { generateRecipe }   from "./src/api/recipeApi.js";
import { useFavorites }     from "./src/hooks/useFavorites.js";
import { exportProPDF }     from "./src/export/exportProPDF.js";
import { exportHomePDF }    from "./src/export/exportHomePDF.js";

// ── Components ────────────────────────────────────────────────────────────────
import { IngredientTags }   from "./src/components/IngredientTags.jsx";
import { BottomSheet }      from "./src/components/BottomSheet.jsx";
import { NutritionBar }     from "./src/components/NutritionBar.jsx";
import { AllergenMatrix }   from "./src/components/AllergenMatrix.jsx";
import { MiseEnPlace }      from "./src/components/MiseEnPlace.jsx";
import { FavoritesPanel }   from "./src/components/FavoritesPanel.jsx";
import { ProFieldsPanel }   from "./src/components/ProFieldsPanel.jsx";

// ── Tailwind class helpers ────────────────────────────────────────────────────

/** Glass card */
const card    = "bg-white/5 border border-white/10 rounded-2xl px-7 py-[1.6rem] mb-5 backdrop-blur-[8px]";
/** Pro-tinted glass card */
const proCard = "bg-fl-indigo/5 border border-fl-indigo/20 rounded-2xl px-7 py-[1.6rem] mb-5 backdrop-blur-[8px]";
/** Section header label — home gold */
const lbl     = "flex items-center gap-2 text-[0.72rem] tracking-[0.18em] uppercase text-fl-gold font-bold mb-[0.85rem]";
/** Section header label — pro indigo */
const proLbl  = "flex items-center gap-2 text-[0.72rem] tracking-[0.18em] uppercase text-fl-indigo font-bold mb-[0.85rem]";
/** Section title (inside result area) */
const secT    = "text-[0.66rem] tracking-[0.2em] uppercase text-fl-orange font-bold mb-4 pb-2 border-b border-white/[0.08]";

/** Inline badge pill */
const bdg = (variant = "gold") => {
  const v = {
    gold:   "bg-fl-gold/[0.13]   border-fl-gold/40   text-fl-gold",
    indigo: "bg-fl-indigo/[0.13] border-fl-indigo/40 text-fl-indigo",
    green:  "bg-fl-green/[0.13]  border-fl-green/40  text-fl-green",
  };
  return `inline-block border text-[0.68rem] tracking-[0.15em] uppercase px-[0.7rem] py-[0.22rem] rounded-full font-bold ${v[variant] ?? v.gold}`;
};

/** Filter chip button */
const chipClass = (active, variant = "gold") => {
  const base = "px-[0.9rem] py-1.5 rounded-full border-[1.5px] text-[0.82rem] cursor-pointer transition-all duration-[180ms] font-[inherit]";
  const active_v = {
    gold:   "border-fl-gold   bg-fl-gold/[0.17]   text-fl-gold   font-bold",
    orange: "border-fl-orange bg-fl-orange/[0.17] text-fl-orange font-bold",
    green:  "border-fl-green  bg-fl-green/[0.17]  text-fl-green  font-bold",
    indigo: "border-fl-indigo bg-fl-indigo/[0.17] text-fl-indigo font-bold",
  };
  const inactive = "border-white/[0.15] bg-white/[0.03] text-white/60 font-normal";
  return `${base} ${active ? (active_v[variant] ?? active_v.gold) : inactive}`;
};

/** Mobile filter pill button */
const pillClass = (active, variant = "gold") => {
  const base = "flex items-center gap-1.5 px-[0.9rem] py-[0.45rem] rounded-full shrink-0 border-[1.5px] text-[0.78rem] cursor-pointer font-[inherit] whitespace-nowrap transition-all";
  const active_v = {
    gold:   "border-fl-gold   bg-fl-gold/[0.09]   text-fl-gold   font-bold",
    orange: "border-fl-orange bg-fl-orange/[0.09] text-fl-orange font-bold",
    green:  "border-fl-green  bg-fl-green/[0.09]  text-fl-green  font-bold",
    indigo: "border-fl-indigo bg-fl-indigo/[0.09] text-fl-indigo font-bold",
  };
  const inactive = "border-white/[0.15] bg-white/[0.04] text-white/50 font-normal";
  return `${base} ${active ? (active_v[variant] ?? active_v.gold) : inactive}`;
};

// ─────────────────────────────────────────────────────────────────────────────
export default function RecipeGenerator() {
  // ── State ────────────────────────────────────────────────────────────────────
  const [tab, setTab]                         = useState("generator");
  const [proMode, setProMode]                 = useState(false);
  const [ingredientTags, setIngredientTags]   = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [customCuisine, setCustomCuisine]     = useState("");
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [selectedDiets, setSelectedDiets]     = useState([]);
  const [selectedMethod, setSelectedMethod]   = useState("");
  const [servings, setServings]               = useState(4);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [recipe, setRecipe]                   = useState(null);
  const [nutrition, setNutrition]             = useState(null);
  const [allergens, setAllergens]             = useState(null);
  const [baseServings, setBaseServings]       = useState(4);
  const [displayServings, setDisplayServings] = useState(4);
  const [activeSheet, setActiveSheet]         = useState(null);
  const [isMobile, setIsMobile]               = useState(false);
  const [savedToast, setSavedToast]           = useState("");
  const [exportingPDF, setExportingPDF]       = useState(false);
  const [proFields, setProFields]             = useState({ chefName:"", station:"", version:"1.0", costPerPortion:"" });
  const [activeProTab, setActiveProTab]       = useState("recipe");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const showToast = useCallback((msg) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(""), TOAST_DURATION_MS);
  }, []);

  const { favorites, isFav, setIsFav, toggleFav, loadFavorite, deleteFavorite } = useFavorites({
    showToast,
    setRecipe, setNutrition, setAllergens, setIngredientTags,
    setBaseServings, setDisplayServings, setProMode, setTab,
  });

  const toggle = useCallback((val, list, setList) => {
    setList(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val]);
  }, []);

  // ── Generate ──────────────────────────────────────────────────────────────────
  const generate = async () => {
    if (ingredientTags.length === 0) { setError("Please add at least one ingredient."); return; }
    const cuisine = customCuisine.trim() || selectedCuisine;
    setError(""); setLoading(true); setRecipe(null); setNutrition(null); setAllergens(null); setIsFav(false);
    try {
      const result = await generateRecipe({
        ingredientTags, cuisine, selectedFlavors, selectedDiets, selectedMethod, servings, proMode,
      });
      setRecipe(result.recipe);
      setNutrition(result.nutrition);
      setAllergens(result.allergens);
      setBaseServings(result.servings);
      setDisplayServings(result.servings);
      setActiveProTab("recipe");
      setTimeout(() => document.getElementById("result-anchor")?.scrollIntoView({ behavior:"smooth" }), 100);
    } catch (e) {
      setError("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const ratio = baseServings > 0 ? displayServings / baseServings : 1;

  // ── Shell-local sub-components ────────────────────────────────────────────────

  const FilterChips = ({ items, selected, onToggle, variant = "gold", single }) => (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <button
          key={item.val}
          className={chipClass(single ? selected === item.val : selected.includes(item.val), variant)}
          onClick={() => single ? onToggle(selected === item.val ? "" : item.val) : onToggle(item.val)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  // BP-12: memoize sheetMap so JSX content isn't recreated on every render
  const sheetMap = useMemo(() => ({
    cuisine:   { title:"🌍 Cuisine Style",       color:"#f9c74f", content:<>
      <FilterChips items={CUISINES} selected={selectedCuisine} onToggle={v => { setSelectedCuisine(v); setCustomCuisine(""); }} variant="gold" single />
      <input
        type="text"
        placeholder="Or type your own..."
        value={customCuisine}
        onChange={e => { setCustomCuisine(e.target.value); setSelectedCuisine(""); }}
        className="w-full mt-4 bg-black/30 border border-white/[0.15] rounded-[10px] px-4 py-3 text-fl-text text-[0.9rem] font-[inherit] outline-none"
      />
    </> },
    flavor:   { title:"🎨 Flavor Profile",       color:"#f3722c", content:<FilterChips items={FLAVORS} selected={selectedFlavors} onToggle={v => toggle(v, selectedFlavors, setSelectedFlavors)} variant="orange" /> },
    diet:     { title:"🥦 Dietary Requirements", color:"#4ade80", content:<FilterChips items={DIETS}   selected={selectedDiets}   onToggle={v => toggle(v, selectedDiets, setSelectedDiets)}     variant="green" /> },
    method:   { title:"👨‍🍳 Cooking Method",       color:"#818cf8", content:<FilterChips items={METHODS} selected={selectedMethod}  onToggle={setSelectedMethod} variant="indigo" single /> },
    servings: { title:"👥 Serving Size",          color:"#f9c74f", content:<>
      <p className="text-[0.82rem] text-white/40 mb-4">How many people are you cooking for?</p>
      <div className="flex gap-2.5 flex-wrap">
        {(proMode ? PRO_BATCH_PRESETS : SERVING_PRESETS).map(n => (
          <button
            key={n}
            onClick={() => setServings(n)}
            className={`w-14 h-14 rounded-full border-2 text-base font-extrabold cursor-pointer flex items-center justify-center font-[inherit] ${
              servings === n
                ? "border-fl-gold bg-fl-gold/20 text-fl-gold"
                : "border-white/[0.15] bg-black/30 text-white/55"
            }`}
          >{n}</button>
        ))}
      </div>
    </> },
    profields:{ title:"⚙️ Recipe Card Details",  color:"#818cf8", content:<ProFieldsPanel proFields={proFields} onChange={setProFields} /> },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [selectedCuisine, customCuisine, selectedFlavors, selectedDiets, selectedMethod, servings, proMode, proFields, toggle]);

  const MobileFilterBar = () => {
    const pills = [
      { id:"cuisine",   icon:"🌍", label:customCuisine||selectedCuisine||"Cuisine",                                              active:!!(customCuisine||selectedCuisine), variant:"gold" },
      { id:"flavor",    icon:"🎨", label:selectedFlavors.length?`${selectedFlavors.length} flavor${selectedFlavors.length>1?"s":""}`:  "Flavor", active:selectedFlavors.length>0, variant:"orange" },
      { id:"diet",      icon:"🥦", label:selectedDiets.length?`${selectedDiets.length} diet${selectedDiets.length>1?"s":""}`:    "Diet",   active:selectedDiets.length>0,   variant:"green" },
      { id:"method",    icon:"👨‍🍳", label:selectedMethod||"Method",                                                              active:!!selectedMethod,                    variant:"indigo" },
      { id:"servings",  icon:"👥", label:`${servings} ${proMode?"covers":"people"}`,                                              active:true,                                variant:"gold" },
      ...(proMode ? [{ id:"profields", icon:"⚙️", label:"Card Details", active:!!(proFields.chefName||proFields.station), variant:"indigo" }] : []),
    ];
    return (
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling:"touch" }}>
        {pills.map(p => (
          <button key={p.id} onClick={() => setActiveSheet(p.id)} className={pillClass(p.active, p.variant)}>
            <span>{p.icon}</span><span>{p.label}</span><span className="opacity-50 text-[0.65rem]">▾</span>
          </button>
        ))}
      </div>
    );
  };

  const DesktopFilters = () => (<>
    <div className={card}>
      <div className={lbl}>🌍 Cuisine Style</div>
      <div className="flex flex-wrap gap-1.5">
        {CUISINES.map(c => (
          <button key={c.val} className={chipClass(selectedCuisine===c.val&&!customCuisine)} onClick={() => { setSelectedCuisine(c.val); setCustomCuisine(""); }}>{c.label}</button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Or type your own (e.g. Cajun, Hawaiian...)"
        value={customCuisine}
        onChange={e => { setCustomCuisine(e.target.value); setSelectedCuisine(""); }}
        className="w-full bg-black/30 border border-white/[0.15] rounded-[10px] px-4 py-3 text-fl-text text-[0.9rem] font-[inherit] outline-none mt-3"
      />
    </div>
    <div className={card}>
      <div className={lbl}>🎨 Flavor Profile <span className="text-white/[0.28] font-normal normal-case tracking-normal text-[0.75rem]">(pick any)</span></div>
      <div className="flex flex-wrap gap-1.5">
        {FLAVORS.map(f => <button key={f.val} className={chipClass(selectedFlavors.includes(f.val),"orange")} onClick={() => toggle(f.val, selectedFlavors, setSelectedFlavors)}>{f.label}</button>)}
      </div>
    </div>
    <div className={card}>
      <div className={lbl}>🥦 Dietary Requirements <span className="text-white/[0.28] font-normal normal-case tracking-normal text-[0.75rem]">(pick any)</span></div>
      <div className="flex flex-wrap gap-1.5">
        {DIETS.map(d => <button key={d.val} className={chipClass(selectedDiets.includes(d.val),"green")} onClick={() => toggle(d.val, selectedDiets, setSelectedDiets)}>{d.label}</button>)}
      </div>
    </div>
    <div className={card}>
      <div className={lbl}>👨‍🍳 Cooking Method <span className="text-white/[0.28] font-normal normal-case tracking-normal text-[0.75rem]">(pick one)</span></div>
      <div className="flex flex-wrap gap-1.5">
        {METHODS.map(m => <button key={m.val} className={chipClass(selectedMethod===m.val,"indigo")} onClick={() => setSelectedMethod(selectedMethod===m.val?"":m.val)}>{m.label}</button>)}
      </div>
    </div>
    {proMode && (
      <div className={proCard}>
        <div className={proLbl}>⚙️ Recipe Card Details <span className="text-fl-indigo/50 font-normal normal-case tracking-normal text-[0.75rem]">(optional)</span></div>
        <ProFieldsPanel proFields={proFields} onChange={setProFields} />
      </div>
    )}
  </>);

  const ProResultTabs = () => {
    const tabs = [{ id:"recipe", label:"📋 Recipe" }, { id:"allergens", label:"⚠️ Allergens" }, { id:"mise", label:"🔪 Mise en Place" }];
    return (
      <div className="flex gap-1.5 px-7 pt-4 border-b border-white/[0.08] bg-black/[0.15]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveProTab(t.id)}
            className={`px-4 py-2 rounded-t-lg border border-b-0 text-[0.78rem] cursor-pointer font-[inherit] transition-all duration-150 ${
              activeProTab === t.id
                ? "border-white/[0.15] bg-white/[0.08] text-fl-text font-bold"
                : "border-transparent bg-transparent text-white/40 font-normal"
            }`}
          >{t.label}</button>
        ))}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-app font-sans text-fl-text">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] backdrop-blur-[10px] bg-black/30 sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <div className="text-[1.4rem] font-extrabold bg-logo bg-clip-text text-transparent">🍳 FlavorLab</div>
          {proMode && (
            <span className="bg-fl-indigo/20 border border-fl-indigo/50 text-fl-indigo text-[0.62rem] font-extrabold tracking-[0.15em] uppercase px-[0.6rem] py-[0.2rem] rounded">PRO</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* BP-08: role=switch + aria-checked on Pro Mode toggle */}
          <div
            role="switch"
            aria-checked={proMode}
            aria-label="Toggle Pro mode"
            tabIndex={0}
            onKeyDown={e => (e.key === " " || e.key === "Enter") && setProMode(p => !p)}
            onClick={() => setProMode(p => !p)}
            className={`flex items-center gap-2 px-3 py-[0.3rem] rounded-full cursor-pointer transition-all duration-200 border ${
              proMode
                ? "bg-fl-indigo/[0.15] border-fl-indigo/40 animate-pro-glow"
                : "bg-white/[0.05] border-white/[0.12]"
            }`}
          >
            <div className={`w-7 h-4 rounded-full relative transition-colors duration-200 shrink-0 ${proMode ? "bg-fl-indigo" : "bg-white/[0.15]"}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-[left] duration-200 shadow-sm ${proMode ? "left-[14px]" : "left-0.5"}`} />
            </div>
            <span className={`text-[0.72rem] font-bold whitespace-nowrap ${proMode ? "text-fl-indigo" : "text-white/40"}`}>Pro Mode</span>
          </div>
          {["generator","favorites"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`px-[0.9rem] py-1.5 rounded-full border text-[0.75rem] font-bold cursor-pointer font-[inherit] ${
                tab === t
                  ? "bg-fl-gold/[0.15] border-fl-gold/40 text-fl-gold"
                  : "bg-transparent border-white/[0.12] text-white/40"
              }`}
            >
              {t === "generator" ? "✨ Generator" : `♥ Saved${favorites.length ? ` (${favorites.length})` : ""}`}
            </button>
          ))}
        </div>
      </nav>

      {proMode && (
        <div className="bg-pro-banner border-b border-fl-indigo/20 px-6 py-[0.6rem] flex items-center gap-3 animate-fade-up-xs">
          <span className="text-base">👨‍🍳</span>
          <div>
            <span className="text-[0.78rem] font-bold text-fl-indigo">Professional Kitchen Mode</span>
            <span className="text-[0.75rem] text-white/35 ml-2">Metric weights · Mise en place · HACCP notes · Allergen matrix · Pro recipe card PDF</span>
          </div>
        </div>
      )}

      <div className="max-w-[940px] mx-auto px-5 pt-8 pb-20">

        {/* FAVORITES */}
        {tab === "favorites" && (
          <div className="animate-fade-up-md">
            <h2 className="text-[1.5rem] font-extrabold mb-6">♥ Saved Recipes</h2>
            <FavoritesPanel favorites={favorites} onLoad={loadFavorite} onDelete={deleteFavorite} />
          </div>
        )}

        {/* GENERATOR */}
        {tab === "generator" && (<>
          <div className="text-center mb-8">
            <h1 className="text-[clamp(1.9rem,5vw,3.2rem)] font-extrabold leading-[1.15] mb-2">
              {proMode
                ? <>Professional <span className="bg-hero-pro bg-clip-text text-transparent">kitchen-grade</span><br />recipe generation.</>
                : <>Any ingredients, <span className="bg-hero-home bg-clip-text text-transparent">any cuisine,</span><br />any craving.</>}
            </h1>
            <p className="text-white/40 text-[0.95rem]">
              {proMode ? "Metric weights, mise en place, HACCP notes, and full allergen matrix." : "Tell us what you have. We'll craft the perfect recipe."}
            </p>
          </div>

          {/* Ingredients card */}
          <div className={card}>
            <div className={lbl}>
              🧺 {proMode ? "Kitchen Inventory" : "Your Ingredients"}
              {ingredientTags.length > 0 && (
                <span className="ml-auto bg-fl-gold/[0.15] border border-fl-gold/30 text-fl-gold rounded-full px-[0.6rem] py-[0.15rem] text-[0.7rem] font-bold">
                  {ingredientTags.length} added
                </span>
              )}
            </div>
            <IngredientTags tags={ingredientTags} onChange={setIngredientTags} />
          </div>

          {/* Serving size card */}
          <div className={card}>
            <div className={lbl}>👥 {proMode ? "Covers / Yield" : "Serving Size"}</div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {(proMode ? PRO_BATCH_PRESETS : SERVING_PRESETS).map(n => (
                <button
                  key={n}
                  onClick={() => setServings(n)}
                  className={`w-11 h-11 rounded-full border-[1.5px] text-[0.88rem] font-bold cursor-pointer flex items-center justify-center font-[inherit] ${
                    servings === n
                      ? proMode
                        ? "border-fl-indigo bg-fl-indigo/20 text-fl-indigo"
                        : "border-fl-gold   bg-fl-gold/20   text-fl-gold"
                      : "border-white/[0.15] bg-black/30 text-white/50"
                  }`}
                >{n}</button>
              ))}
              <span className="text-[0.8rem] text-white/35">{proMode ? "covers" : "people"}</span>
            </div>
          </div>

          {/* Filters */}
          {isMobile ? (
            <div className={card}>
              <div className={lbl}>⚙️ Preferences</div>
              <MobileFilterBar />
              <p className="text-[0.72rem] text-white/25 mt-2">Tap a pill to open options ↑</p>
            </div>
          ) : <DesktopFilters />}

          {/* Generate button */}
          <button
            disabled={loading}
            onClick={generate}
            className={`w-full py-[1.1rem] rounded-xl border-none text-[0.9rem] font-extrabold tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 transition-all duration-200 font-[inherit] ${
              loading
                ? "bg-white/[0.08] text-white/35 cursor-not-allowed"
                : proMode
                  ? "bg-cta-pro   text-white cursor-pointer"
                  : "bg-cta-home  text-white cursor-pointer"
            }`}
          >
            {loading
              ? <>
                  <span className="w-[18px] h-[18px] border-[2.5px] border-white/[0.15] border-t-white/60 rounded-full inline-block animate-[spin_0.7s_linear_infinite]" />
                  {proMode ? "Generating professional recipe…" : "Crafting your recipe…"}
                </>
              : (proMode ? "👨‍🍳 Generate Professional Recipe" : "✨ Generate My Recipe")}
          </button>

          {error && (
            <div className="bg-fl-red/[0.12] border border-fl-red/40 rounded-[10px] px-5 py-[0.9rem] text-fl-red text-[0.88rem] mt-4">
              ⚠️ {error}
            </div>
          )}

          {/* RESULT */}
          {recipe && (
            <div
              id="result-anchor"
              className={`bg-white/[0.04] border rounded-2xl overflow-hidden mt-8 animate-fade-up ${
                proMode ? "border-fl-indigo/20" : "border-white/10"
              }`}
            >
              {/* Result header */}
              <div className={`border-b border-white/[0.08] p-7 ${proMode ? "bg-result-pro" : "bg-result-home"}`}>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {recipe.badge   && <span className={bdg(proMode?"indigo":"gold")}>{recipe.badge}</span>}
                  {proMode        && <span className={bdg("indigo")}>PRO</span>}
                  {selectedDiets.map(d  => <span key={d}  className={bdg("green")}>{d}</span>)}
                  {selectedMethod && <span className={bdg("indigo")}>{selectedMethod}</span>}
                </div>
                <div className="text-[clamp(1.5rem,4vw,2.4rem)] font-extrabold mb-2 leading-[1.2]">{recipe.title}</div>
                <p className="text-white/50 text-[0.95rem] leading-[1.7] italic mb-4">{recipe.intro}</p>
                {ingredientTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-[1.1rem]">
                    {ingredientTags.map((t, i) => {
                      const cls = [
                        "bg-fl-gold/[0.15]   border-fl-gold/35   text-fl-gold",
                        "bg-fl-orange/[0.15] border-fl-orange/35 text-fl-orange",
                        "bg-fl-indigo/[0.15] border-fl-indigo/35 text-fl-indigo",
                        "bg-fl-green/[0.15]  border-fl-green/35  text-fl-green",
                      ][i % 4];
                      return <span key={t} className={`text-[0.7rem] border rounded-full px-[0.55rem] py-[0.15rem] font-semibold ${cls}`}>{t}</span>;
                    })}
                  </div>
                )}
                <div className="flex gap-2.5 flex-wrap">
                  <button
                    onClick={() => toggleFav(recipe, nutrition, allergens, ingredientTags, proMode)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-[1.5px] text-[0.8rem] font-bold cursor-pointer font-[inherit] ${
                      isFav
                        ? "border-fl-red   bg-fl-red/[0.15]   text-fl-red"
                        : "border-white/20 bg-white/[0.06]    text-white/70"
                    }`}
                  >{isFav ? "♥ Saved" : "♡ Save Recipe"}</button>
                  <button
                    onClick={() => {
                      setExportingPDF(true);
                      if (proMode) exportProPDF(recipe, ingredientTags, nutrition, allergens, displayServings, ratio, proFields);
                      else exportHomePDF(recipe, ingredientTags, nutrition, displayServings, ratio);
                      setTimeout(() => setExportingPDF(false), 1000);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-[1.5px] text-[0.8rem] font-bold cursor-pointer font-[inherit] ${
                      proMode
                        ? "border-fl-indigo/40 bg-fl-indigo/[0.12] text-fl-indigo"
                        : "border-white/20     bg-white/[0.06]     text-white/70"
                    }`}
                  >{exportingPDF ? "⏳ Opening…" : (proMode ? "📋 Pro Recipe Card PDF" : "📄 Export PDF")}</button>
                </div>
              </div>

              {proMode && <ProResultTabs />}

              {/* Two-column result layout — collapses to single column below 660px */}
              <div className="grid grid-cols-1 wide:grid-cols-[1fr_300px]">
                {/* Main column */}
                <div className="p-7 border-b border-white/[0.08] wide:border-b-0 wide:border-r wide:border-white/[0.08]">
                  {proMode && activeProTab === "mise"      && <MiseEnPlace   items={recipe.miseEnPlace} />}
                  {proMode && activeProTab === "allergens" && <AllergenMatrix allergens={allergens} />}

                  {(!proMode || activeProTab === "recipe") && (<>
                    <div className={secT}>Method</div>
                    {(recipe.steps || []).map((step, i) => (
                      <div key={i} className={`flex gap-4 mb-[1.2rem] pb-[1.2rem] items-start ${i === recipe.steps.length - 1 ? "" : "border-b border-white/[0.06]"}`}>
                        <div className={`min-w-[28px] h-7 rounded-[6px] flex items-center justify-center text-[0.75rem] font-extrabold text-white shrink-0 mt-0.5 ${proMode ? "bg-step-pro" : "bg-step-home"}`}>{i + 1}</div>
                        <div className="text-[0.9rem] leading-[1.7] text-white/[0.82]">{step}</div>
                      </div>
                    ))}
                    {recipe.tips && (
                      <div className="bg-fl-orange/[0.08] border border-fl-orange/25 rounded-[10px] p-4 mt-6 text-[0.85rem] text-white/70 leading-[1.65]">
                        <div className="text-[0.62rem] tracking-[0.15em] uppercase text-fl-orange font-bold mb-[0.4rem]">💡 Chef's Tip</div>
                        {recipe.tips}
                      </div>
                    )}
                    {recipe.proTips?.length > 0 && (
                      <div className="mt-8">
                        <div className={secT}>💡 Pro Tips</div>
                        <div className="flex flex-col gap-3">
                          {recipe.proTips.map((tip, i) => (
                            <div key={i} className="flex gap-[0.9rem] items-start bg-fl-gold/[0.06] border border-fl-gold/[0.15] rounded-xl p-4">
                              <span className="text-[1.3rem] shrink-0 leading-none mt-[0.1rem]">{tip.icon || "💡"}</span>
                              <div>
                                <div className="text-[0.82rem] font-bold text-fl-gold mb-1">{tip.title}</div>
                                <div className="text-[0.85rem] text-white/68 leading-[1.65]">{tip.body}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {recipe.watchOuts?.length > 0 && (
                      <div className="mt-7">
                        <div className="text-[0.66rem] tracking-[0.2em] uppercase text-fl-red font-bold mb-4 pb-2 border-b border-fl-red/[0.15]">⚠️ What to Watch Out For</div>
                        <div className="flex flex-col gap-3">
                          {recipe.watchOuts.map((w, i) => (
                            <div key={i} className="flex gap-[0.9rem] items-start bg-fl-red/[0.06] border border-fl-red/[0.18] rounded-xl p-4">
                              <span className="text-[1.3rem] shrink-0 leading-none mt-[0.1rem]">{w.icon || "⚠️"}</span>
                              <div>
                                <div className="text-[0.82rem] font-bold text-[#f87171] mb-1">{w.title}</div>
                                <div className="text-[0.85rem] text-white/65 leading-[1.65]">{w.body}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {proMode && recipe.haccp?.length > 0 && (
                      <div className="mt-7">
                        <div className="text-[0.66rem] tracking-[0.2em] uppercase text-fl-violet font-bold mb-4 pb-2 border-b border-fl-violet/[0.15]">🛡️ HACCP / Food Safety</div>
                        <div className="flex flex-col gap-2">
                          {recipe.haccp.map((h, i) => (
                            <div key={i} className="flex gap-3 items-start bg-fl-violet/[0.06] border border-fl-violet/[0.18] rounded-[10px] px-4 py-[0.85rem] text-[0.83rem] text-white/70 leading-[1.6]">
                              <span className="shrink-0 mt-[0.1rem]">⚠️</span>{h}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>)}
                </div>

                {/* Sidebar */}
                <div className="p-7">
                  {/* Scaler */}
                  <div className={`flex items-center justify-between rounded-[10px] px-4 py-[0.65rem] mb-5 border ${
                    proMode
                      ? "bg-fl-indigo/[0.07] border-fl-indigo/20"
                      : "bg-fl-gold/[0.07]   border-fl-gold/20"
                  }`}>
                    <span className="text-[0.7rem] text-white/40 tracking-[0.1em] uppercase">{proMode ? "Covers" : "Servings"}</span>
                    <div className="flex items-center gap-[0.65rem]">
                      <button
                        onClick={() => setDisplayServings(s => Math.max(MIN_SERVINGS, s - 1))}
                        className={`w-7 h-7 rounded-full border bg-transparent text-[1.1rem] font-bold flex items-center justify-center font-[inherit] transition-opacity ${
                          proMode ? "border-fl-indigo/40 text-fl-indigo" : "border-fl-gold/40 text-fl-gold"
                        } ${displayServings <= MIN_SERVINGS ? "cursor-not-allowed opacity-30" : "cursor-pointer opacity-100"}`}
                      >−</button>
                      <span className={`text-[1.1rem] font-extrabold min-w-[24px] text-center ${proMode ? "text-fl-indigo" : "text-fl-gold"}`}>{displayServings}</span>
                      <button
                        onClick={() => setDisplayServings(s => Math.min(MAX_SERVINGS, s + 1))}
                        className={`w-7 h-7 rounded-full border bg-transparent text-[1.1rem] font-bold flex items-center justify-center font-[inherit] transition-opacity ${
                          proMode ? "border-fl-indigo/40 text-fl-indigo" : "border-fl-gold/40 text-fl-gold"
                        } ${displayServings >= MAX_SERVINGS ? "cursor-not-allowed opacity-30" : "cursor-pointer opacity-100"}`}
                      >+</button>
                    </div>
                  </div>

                  {/* Meta */}
                  {recipe.meta && (<>
                    <div className={secT}>At a Glance</div>
                    <div className="grid grid-cols-2 gap-[0.55rem] mb-6">
                      {[["⏱ Prep",recipe.meta.prep],["🔥 Cook",recipe.meta.cook],["📊 Level",recipe.meta.difficulty],["👨‍🍳 Method",recipe.meta.method||selectedMethod||"—"]].map(([k,v]) => (
                        <div key={k} className="bg-black/25 rounded-[10px] p-[0.7rem] text-center">
                          <div className="text-[0.56rem] tracking-[0.12em] uppercase text-white/30 mb-0.5">{k}</div>
                          <div className={`text-[0.82rem] font-bold ${proMode ? "text-fl-indigo" : "text-fl-gold"}`}>{v || "—"}</div>
                        </div>
                      ))}
                    </div>
                  </>)}

                  {/* Ingredients */}
                  <div className={`${secT} flex items-center justify-between`}>
                    Ingredients {ratio !== 1 && <span className={`text-[0.7rem] ${proMode ? "text-fl-indigo" : "text-fl-gold"}`}>×{formatNum(ratio)}</span>}
                  </div>
                  {(recipe.ingredients || []).map((ing, i) => (
                    <div key={i} className={`flex items-start gap-2 py-[0.45rem] text-[0.83rem] text-white/[0.78] leading-[1.5] ${i === recipe.ingredients.length - 1 ? "" : "border-b border-white/[0.06]"}`}>
                      <div className={`w-[5px] h-[5px] rounded-full mt-[6px] shrink-0 ${proMode ? "bg-fl-indigo" : "bg-fl-gold"}`} />
                      {scaleIngredient(ing, ratio)}
                    </div>
                  ))}

                  {/* Allergen quick summary — pro sidebar */}
                  {proMode && allergens && (
                    <div className="mt-6">
                      <div className="text-[0.66rem] tracking-[0.2em] uppercase text-fl-red font-bold mb-4 pb-2 border-b border-fl-red/[0.15]">⚠️ Allergens</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {ALLERGENS.map(a => {
                          const hit = allergens.find(x => x.id === a.id);
                          if (!hit?.present && !hit?.mayContain) return null;
                          return (
                            <span
                              key={a.id}
                              className={`text-[0.7rem] border rounded-[6px] px-2 py-[0.2rem] font-semibold ${
                                hit.present
                                  ? "bg-fl-red/[0.15]  border-fl-red/40  text-[#f87171]"
                                  : "bg-fl-gold/10     border-fl-gold/30 text-fl-gold"
                              }`}
                            >{a.icon} {a.label}</span>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setActiveProTab("allergens")}
                        className="text-[0.7rem] text-white/30 bg-transparent border-none cursor-pointer font-[inherit] p-0 underline"
                      >View full allergen matrix →</button>
                    </div>
                  )}

                  {/* Nutrition */}
                  {nutrition && (<>
                    <div className={`${secT} mt-6`}>
                      Nutrition <span className="text-white/25 font-normal normal-case tracking-normal text-[0.7rem]">per serving</span>
                    </div>
                    <div className={`border rounded-[10px] px-4 py-3 mb-4 flex items-center justify-between ${
                      proMode
                        ? "bg-fl-indigo/[0.08] border-fl-indigo/20"
                        : "bg-fl-gold/[0.08]   border-fl-gold/20"
                    }`}>
                      <span className="text-[0.72rem] text-white/40 tracking-[0.1em] uppercase">Calories</span>
                      <span className={`text-[1.4rem] font-extrabold ${proMode ? "text-fl-indigo" : "text-fl-gold"}`}>
                        {nutrition.calories}<span className="text-[0.7rem] font-normal text-white/40 ml-[3px]">kcal</span>
                      </span>
                    </div>
                    <NutritionBar label="Protein"       value={nutrition.protein} unit="g"  max={60}   color="#4ade80" />
                    <NutritionBar label="Carbohydrates" value={nutrition.carbs}   unit="g"  max={100}  color="#818cf8" />
                    <NutritionBar label="Fat"           value={nutrition.fat}     unit="g"  max={60}   color="#f3722c" />
                    <NutritionBar label="Fiber"         value={nutrition.fiber}   unit="g"  max={30}   color="#34d399" />
                    <NutritionBar label="Sodium"        value={nutrition.sodium}  unit="mg" max={2300} color="#fb923c" />
                    {nutrition.note && <p className="text-[0.65rem] text-white/22 mt-3 leading-[1.5]">ⓘ {nutrition.note}</p>}
                  </>)}
                </div>
              </div>
            </div>
          )}
        </>)}
      </div>

      {/* Toast — BP-07: role=status + aria-live */}
      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-fl-green/[0.15] border border-fl-green/50 text-fl-green px-6 py-3 rounded-full text-[0.88rem] font-bold z-[300] animate-toast backdrop-blur-[10px] whitespace-nowrap"
        >
          {savedToast}
        </div>
      )}

      {/* Bottom Sheets */}
      {Object.entries(sheetMap).map(([id, { title, color, content }]) => (
        <BottomSheet key={id} open={activeSheet === id} onClose={() => setActiveSheet(null)} title={title} color={color}>
          {content}
          <button
            onClick={() => setActiveSheet(null)}
            className={`w-full mt-6 py-[0.9rem] rounded-xl border-none text-white text-[0.88rem] font-extrabold tracking-[0.1em] uppercase cursor-pointer font-[inherit] ${proMode ? "bg-cta-pro" : "bg-cta-home"}`}
          >Done</button>
        </BottomSheet>
      ))}
    </div>
  );
}
