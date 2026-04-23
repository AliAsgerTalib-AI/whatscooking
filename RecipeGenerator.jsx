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
import { COOK_TYPES }                            from "./src/data/cookTypes.js";

// ── Utilities ─────────────────────────────────────────────────────────────────
import { formatNum }       from "./src/utils/formatNum.js";
import { scaleIngredient } from "./src/utils/scaleIngredient.js";

// ── API / hooks / export ──────────────────────────────────────────────────────
import { generateRecipe }  from "./src/api/recipeApi.js";
import { useFavorites }    from "./src/hooks/useFavorites.js";
import { exportProPDF }    from "./src/export/exportProPDF.js";
import { exportHomePDF }   from "./src/export/exportHomePDF.js";
import { CookingMode }        from "./src/components/CookingMode.jsx";
import { exportShoppingList } from "./src/export/exportShoppingList.js";

// ── Components ────────────────────────────────────────────────────────────────
import { IngredientTags }  from "./src/components/IngredientTags.jsx";
import { BottomSheet }     from "./src/components/BottomSheet.jsx";
import { NutritionBar }    from "./src/components/NutritionBar.jsx";
import { AllergenMatrix }  from "./src/components/AllergenMatrix.jsx";
import { MiseEnPlace }     from "./src/components/MiseEnPlace.jsx";
import { FavoritesPanel }  from "./src/components/FavoritesPanel.jsx";
import { ProFieldsPanel }  from "./src/components/ProFieldsPanel.jsx";

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
  const [cookingMode, setCookingMode]         = useState(false);
  const [copyingList, setCopyingList]         = useState(false);
  const [proFields, setProFields]             = useState({ chefName:"", station:"", version:"1.0", costPerPortion:"" });
  const [activeProTab, setActiveProTab]       = useState("recipe");
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [cookType, setCookType]                   = useState(null);

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

  const ratio = baseServings > 0 ? displayServings / baseServings : 1;

  const copyShoppingList = useCallback(async () => {
    if (!recipe) return;
    const scaledIngs = (recipe.ingredients || []).map(i => scaleIngredient(i, ratio));
    const text = [
      `${recipe.title} — serves ${displayServings}`,
      "─".repeat(28),
      ...scaledIngs.map(i => `□ ${i}`),
    ].join("\n");
    let copied = false;
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(text); copied = true; } catch { /* fall through */ }
    }
    if (!copied) {
      try {
        const ta = Object.assign(document.createElement("textarea"), {
          value: text, style: "position:fixed;opacity:0"
        });
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        copied = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch { /* ignore */ }
    }
    if (copied) {
      showToast("Copied to clipboard!");
      setCopyingList(true);
      setTimeout(() => setCopyingList(false), 2000);
    } else {
      showToast("Copy failed — try again.");
    }
  }, [recipe, ratio, displayServings, showToast]);

  const { favorites, isFav, setIsFav, toggleFav, loadFavorite, deleteFavorite } = useFavorites({
    showToast,
    setRecipe, setNutrition, setAllergens, setIngredientTags,
    setBaseServings, setDisplayServings, setProMode, setTab,
  });

  const toggle = useCallback((val, list, setList) => {
    setList(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val]);
  }, []);

  // ── Mode-aware design tokens ──────────────────────────────────────────────────
  const m = proMode ? {
    logoGrad:        "from-indigo-600 to-purple-500",
    proToggle:       "bg-gradient-to-r from-indigo-600 to-purple-500 text-white border-transparent shadow-sm",
    heroBadge:       "bg-indigo-100 text-indigo-700",
    heroGrad:        "from-indigo-600 to-purple-500",
    chipActive:      "bg-indigo-600 text-white border-transparent shadow-sm",
    pillActive:      "bg-indigo-600 text-white border-transparent",
    servBtn:         "bg-indigo-600 text-white border-transparent shadow-md",
    ctaBtn:          "bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-lg shadow-indigo-200/60 hover:shadow-xl hover:shadow-indigo-200/80 hover:scale-[1.005]",
    resultTint:      "from-indigo-50/60 to-purple-50/40",
    badge:           "border-indigo-200 bg-indigo-50 text-indigo-700",
    savedBtn:        "bg-indigo-600 text-white border-transparent",
    tipCard:         "bg-indigo-50 border border-indigo-100",
    tipLabel:        "text-indigo-600",
    stepNum:         "bg-indigo-600",
    watchCard:       "bg-slate-50 border border-slate-100",
    watchLabel:      "text-slate-700",
    calCard:         "bg-indigo-50 border-indigo-100",
    calText:         "text-indigo-700",
    dot:             "bg-indigo-400",
    barColor:        "bg-indigo-500",
    allergenPresent: "bg-indigo-600 text-white",
    allergenMaybe:   "bg-indigo-100 text-indigo-700",
    allergenLink:    "text-indigo-500 hover:text-indigo-700",
    proTabActive:    "bg-indigo-600 text-white",
    toast:           "bg-indigo-600",
    sheetDone:       "bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-md",
    navBanner:       "from-indigo-600/8 to-purple-500/8 border-indigo-100 text-indigo-600",
    footerLink:      "text-indigo-500 hover:text-indigo-700",
  } : {
    logoGrad:        "from-orange-500 to-amber-400",
    proToggle:       "bg-white text-slate-600 border-slate-200 hover:border-slate-400",
    heroBadge:       "bg-orange-100 text-orange-700",
    heroGrad:        "from-orange-500 to-amber-400",
    chipActive:      "bg-orange-500 text-white border-transparent shadow-sm",
    pillActive:      "bg-orange-500 text-white border-transparent",
    servBtn:         "bg-orange-500 text-white border-transparent shadow-md",
    ctaBtn:          "bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-lg shadow-green-200/60 hover:shadow-xl hover:shadow-green-200/80 hover:scale-[1.005]",
    resultTint:      "from-orange-50/60 to-amber-50/40",
    badge:           "border-orange-200 bg-orange-50 text-orange-700",
    savedBtn:        "bg-orange-500 text-white border-transparent",
    tipCard:         "bg-orange-50 border border-orange-100",
    tipLabel:        "text-orange-600",
    stepNum:         "bg-orange-500",
    watchCard:       "bg-amber-50 border border-amber-100",
    watchLabel:      "text-amber-700",
    calCard:         "bg-orange-50 border-orange-100",
    calText:         "text-orange-600",
    dot:             "bg-orange-400",
    barColor:        "bg-orange-500",
    allergenPresent: "bg-orange-600 text-white",
    allergenMaybe:   "bg-orange-100 text-orange-700",
    allergenLink:    "text-orange-500 hover:text-orange-700",
    proTabActive:    "bg-orange-500 text-white",
    toast:           "bg-orange-500",
    sheetDone:       "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md",
    navBanner:       "",
    footerLink:      "text-orange-500 hover:text-orange-700",
  };

  // ── Design-system class strings ───────────────────────────────────────────────
  const card = "bg-white rounded-2xl border border-slate-200 shadow-card p-6 mb-4";
  const lbl  = "text-[0.7rem] font-semibold tracking-widest uppercase text-slate-400 mb-3";
  const secT = "text-[0.7rem] font-semibold tracking-widest uppercase text-slate-400 mb-3 pb-2 border-b border-slate-100";
  const bdg  = () => `inline-block rounded-full border text-[0.65rem] uppercase tracking-widest px-2.5 py-0.5 font-bold ${m.badge}`;

  const chipClass = (active) =>
    `px-3 py-1.5 rounded-full text-[0.7rem] font-semibold tracking-wide uppercase cursor-pointer font-[inherit] transition-all duration-150 border ${
      active ? m.chipActive : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
    }`;

  const pillClass = (active) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.7rem] font-semibold tracking-wide uppercase cursor-pointer font-[inherit] whitespace-nowrap transition-all duration-150 border ${
      active ? m.pillActive : "bg-white text-slate-600 border-slate-200"
    }`;

  // ── Generate ──────────────────────────────────────────────────────────────────
  const generate = async () => {
    if (ingredientTags.length === 0) { setError("Please add at least one ingredient."); return; }
    const cuisine = customCuisine.trim() || selectedCuisine;
    setError(""); setLoading(true); setRecipe(null); setNutrition(null); setAllergens(null); setIsFav(false);
    try {
      const result = await generateRecipe({
        ingredientTags, cuisine, selectedFlavors, selectedDiets, selectedMethod, selectedAllergens, servings, proMode,
        cookType: COOK_TYPES.find(t => t.val === cookType) ?? null,
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

  // ── Shell-local sub-components ────────────────────────────────────────────────

  const FilterChips = ({ items, selected, onToggle, single }) => (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <button
          key={item.val}
          className={chipClass(single ? selected === item.val : selected.includes(item.val))}
          onClick={() => single ? onToggle(selected === item.val ? "" : item.val) : onToggle(item.val)}
        >{item.label}</button>
      ))}
    </div>
  );

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-[inherit] outline-none focus:border-slate-400 focus:bg-slate-50/50 transition-colors duration-150";

  const sheetMap = useMemo(() => ({
    cuisine:  { title:"Cuisine Style", content:<>
      <FilterChips items={CUISINES} selected={selectedCuisine} onToggle={v => { setSelectedCuisine(v); setCustomCuisine(""); }} single />
      <input
        type="text"
        placeholder="Or type your own..."
        value={customCuisine}
        onChange={e => { setCustomCuisine(e.target.value); setSelectedCuisine(""); }}
        className={inputCls + " mt-3"}
      />
    </> },
    flavor:   { title:"Flavor Profile",       content:<FilterChips items={FLAVORS} selected={selectedFlavors} onToggle={v => toggle(v, selectedFlavors, setSelectedFlavors)} /> },
    diet:     { title:"Dietary Requirements", content:<FilterChips items={DIETS}   selected={selectedDiets}   onToggle={v => toggle(v, selectedDiets, setSelectedDiets)} /> },
    method:   { title:"Cooking Method",       content:<FilterChips items={METHODS} selected={selectedMethod}  onToggle={setSelectedMethod} single /> },
    servings: { title:"Serving Size",         content:<>
      <p className="text-sm text-slate-500 mb-4">How many {proMode ? "covers" : "people"}?</p>
      <div className="flex gap-2 flex-wrap">
        {(proMode ? PRO_BATCH_PRESETS : SERVING_PRESETS).map(n => (
          <button
            key={n}
            onClick={() => setServings(n)}
            className={`w-14 h-14 rounded-xl text-lg font-bold cursor-pointer font-[inherit] transition-all duration-150 border ${
              servings === n ? m.servBtn : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
            }`}
          >{n}</button>
        ))}
      </div>
    </> },
    allergies:{ title:"Allergens to Avoid",  content:<FilterChips items={ALLERGENS.map(a => ({ val:a.id, label:`${a.icon} ${a.label}` }))} selected={selectedAllergens} onToggle={v => toggle(v, selectedAllergens, setSelectedAllergens)} /> },
    profields:{ title:"Recipe Card Details", content:<ProFieldsPanel proFields={proFields} onChange={setProFields} /> },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [selectedCuisine, customCuisine, selectedFlavors, selectedDiets, selectedMethod, selectedAllergens, servings, proMode, proFields, toggle]);

  const MobileFilterBar = () => {
    const pills = [
      { id:"cuisine",   label:customCuisine||selectedCuisine||"Cuisine",                                             active:!!(customCuisine||selectedCuisine) },
      { id:"flavor",    label:selectedFlavors.length ? `${selectedFlavors.length} Flavor${selectedFlavors.length>1?"s":""}` : "Flavor", active:selectedFlavors.length>0 },
      { id:"diet",      label:selectedDiets.length   ? `${selectedDiets.length} Diet${selectedDiets.length>1?"s":""}` : "Diet",         active:selectedDiets.length>0 },
      { id:"method",    label:selectedMethod||"Method",                                                              active:!!selectedMethod },
      { id:"servings",  label:`${servings} ${proMode?"Covers":"People"}`,                                           active:true },
      { id:"allergies", label:selectedAllergens.length ? `${selectedAllergens.length} Allergen${selectedAllergens.length>1?"s":""}` : "Allergens", active:selectedAllergens.length>0 },
      ...(proMode ? [{ id:"profields", label:"Card Details", active:!!(proFields.chefName||proFields.station) }] : []),
    ];
    return (
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling:"touch" }}>
        {pills.map(p => (
          <button key={p.id} onClick={() => setActiveSheet(p.id)} className={pillClass(p.active)}>
            {p.label} <span className="opacity-50 text-[0.65rem]">▾</span>
          </button>
        ))}
      </div>
    );
  };

  const DesktopFilters = () => (<>
    <div className={card}>
      <div className={lbl}>Cuisine Style</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {CUISINES.map(c => (
          <button key={c.val} className={chipClass(selectedCuisine===c.val&&!customCuisine)} onClick={() => { setSelectedCuisine(c.val); setCustomCuisine(""); }}>{c.label}</button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Or type your own (e.g. Cajun, Hawaiian...)"
        value={customCuisine}
        onChange={e => { setCustomCuisine(e.target.value); setSelectedCuisine(""); }}
        className={inputCls}
      />
    </div>
    <div className={card}>
      <div className={lbl}>Flavor Profile <span className="font-normal normal-case tracking-normal text-slate-300">— pick any</span></div>
      <div className="flex flex-wrap gap-1.5">
        {FLAVORS.map(f => <button key={f.val} className={chipClass(selectedFlavors.includes(f.val))} onClick={() => toggle(f.val, selectedFlavors, setSelectedFlavors)}>{f.label}</button>)}
      </div>
    </div>
    <div className={card}>
      <div className={lbl}>Dietary Requirements <span className="font-normal normal-case tracking-normal text-slate-300">— pick any</span></div>
      <div className="flex flex-wrap gap-1.5">
        {DIETS.map(d => <button key={d.val} className={chipClass(selectedDiets.includes(d.val))} onClick={() => toggle(d.val, selectedDiets, setSelectedDiets)}>{d.label}</button>)}
      </div>
    </div>
    <div className={card}>
      <div className={lbl}>Allergens to Avoid <span className="font-normal normal-case tracking-normal text-slate-300">— pick any</span></div>
      <div className="flex flex-wrap gap-1.5">
        {ALLERGENS.map(a => (
          <button key={a.id} className={chipClass(selectedAllergens.includes(a.id))} onClick={() => toggle(a.id, selectedAllergens, setSelectedAllergens)}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>
    </div>
    <div className={card}>
      <div className={lbl}>Cooking Method <span className="font-normal normal-case tracking-normal text-slate-300">— pick one</span></div>
      <div className="flex flex-wrap gap-1.5">
        {METHODS.map(me => <button key={me.val} className={chipClass(selectedMethod===me.val)} onClick={() => setSelectedMethod(selectedMethod===me.val?"":me.val)}>{me.label}</button>)}
      </div>
    </div>
    {proMode && (
      <div className={card}>
        <div className={lbl}>Recipe Card Details <span className="font-normal normal-case tracking-normal text-slate-300">— optional</span></div>
        <ProFieldsPanel proFields={proFields} onChange={setProFields} />
      </div>
    )}
  </>);

  const ProResultTabs = () => {
    const tabs = [{ id:"recipe", label:"Recipe" }, { id:"allergens", label:"Allergens" }, { id:"mise", label:"Mise en Place" }];
    return (
      <div className="flex gap-1.5 p-4 border-b border-slate-100">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveProTab(t.id)}
            className={`px-4 py-2 rounded-full text-[0.7rem] font-semibold tracking-widest uppercase cursor-pointer font-[inherit] transition-all duration-150 ${
              activeProTab === t.id ? m.proTabActive : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >{t.label}</button>
        ))}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900 font-sans">

      {/* NAV — glassmorphism */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-3.5 sticky top-0 z-[100] glass border-b border-slate-200/70">
        <div className={`font-display text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${m.logoGrad}`}>
          FlavorLab
        </div>
        <div className="flex items-center gap-2">
          <button
            role="switch"
            aria-checked={proMode}
            aria-label="Toggle Pro mode"
            onClick={() => setProMode(p => !p)}
            onKeyDown={e => (e.key === " " || e.key === "Enter") && setProMode(p => !p)}
            className={`rounded-full px-4 py-1.5 text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] transition-all duration-200 border ${m.proToggle}`}
          >{proMode ? "Pro: On" : "Pro"}</button>
          {["generator","favorites"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`rounded-full px-4 py-1.5 text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] transition-all duration-200 ${
                tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t === "generator" ? "Generator" : `Saved${favorites.length ? ` (${favorites.length})` : ""}`}
            </button>
          ))}
        </div>
      </nav>

      {/* Pro Mode banner */}
      {proMode && (
        <div className={`px-6 md:px-16 py-2.5 bg-gradient-to-r border-b animate-fade-in ${m.navBanner}`}>
          <span className="text-[0.7rem] font-semibold tracking-widest uppercase">
            Professional Mode — Metric weights · Mise en place · HACCP · Allergen matrix · Pro recipe card PDF
          </span>
        </div>
      )}

      <div className="max-w-[960px] mx-auto px-6 md:px-16 py-10">

        {/* FAVORITES */}
        {tab === "favorites" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-3xl font-bold mb-6 text-slate-900">Saved Recipes</h2>
            <FavoritesPanel favorites={favorites} onLoad={loadFavorite} onDelete={deleteFavorite} />
          </div>
        )}

        {/* GENERATOR */}
        {tab === "generator" && (<>

          {/* Hero */}
          <div className="mb-10 pt-4 pb-10 border-b border-slate-100">
            <h1 className="font-display text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.06] mb-4 tracking-tight text-slate-900 animate-fade-up">
              {proMode
                ? <>Professional <span className={`text-transparent bg-clip-text bg-gradient-to-r ${m.heroGrad}`}>kitchen-grade</span><br />recipe generation.</>
                : <>Any ingredients,<br /><span className={`text-transparent bg-clip-text bg-gradient-to-r ${m.heroGrad}`}>any cuisine</span>, any craving.</>}
            </h1>
            <p className="text-[0.9375rem] text-slate-500 max-w-md leading-relaxed animate-fade-up" style={{ animationDelay: "60ms" }}>
              {proMode
                ? "Metric weights, mise en place, HACCP notes, and full allergen matrix."
                : "Tell us what you have. We'll craft the perfect recipe."}
            </p>
          </div>

          {/* Cook Type */}
          <div className={card}>
            <div className={`${lbl} flex items-center justify-between`}>
              <span>Your Cooking Style</span>
              {cookType && (
                <button
                  onClick={() => setCookType(null)}
                  className="text-[0.6rem] font-semibold tracking-widest uppercase text-slate-400 hover:text-slate-600 transition-colors"
                >Clear</button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {COOK_TYPES.map(ct => {
                const active = cookType === ct.val;
                return (
                  <button
                    key={ct.val}
                    onClick={() => setCookType(active ? null : ct.val)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center cursor-pointer font-[inherit] transition-all duration-150 border ${
                      active
                        ? `${m.chipActive} shadow-sm`
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <span className="text-xl leading-none">{ct.icon}</span>
                    <span className="text-[0.65rem] font-bold tracking-wide uppercase leading-tight">{ct.label}</span>
                    <span className={`text-[0.6rem] leading-tight ${active ? "text-white/80" : "text-slate-400"}`}>{ct.tagline}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ingredients */}
          <div className={card}>
            <div className={`${lbl} flex items-center justify-between`}>
              <span>{proMode ? "Kitchen Inventory" : "Your Ingredients"}</span>
              {ingredientTags.length > 0 && (
                <span className={`text-[0.65rem] font-bold rounded-full px-2.5 py-0.5 ${m.heroBadge}`}>
                  {ingredientTags.length} added
                </span>
              )}
            </div>
            <IngredientTags tags={ingredientTags} onChange={setIngredientTags} />
          </div>

          {/* Serving size */}
          <div className={card}>
            <div className={lbl}>{proMode ? "Covers / Yield" : "Serving Size"}</div>
            <div className="flex items-center gap-2 flex-wrap">
              {(proMode ? PRO_BATCH_PRESETS : SERVING_PRESETS).map(n => (
                <button
                  key={n}
                  onClick={() => setServings(n)}
                  className={`w-11 h-11 rounded-xl text-base font-bold cursor-pointer font-[inherit] transition-all duration-150 border ${
                    servings === n ? m.servBtn : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                  }`}
                >{n}</button>
              ))}
              <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-slate-400 ml-1">{proMode ? "covers" : "people"}</span>
            </div>
          </div>

          {/* Filters */}
          {isMobile ? (
            <div className={card}>
              <div className={lbl}>Preferences</div>
              <MobileFilterBar />
              <p className="text-[0.65rem] text-slate-400 mt-2.5 font-semibold tracking-widest uppercase">Tap to open options</p>
            </div>
          ) : <DesktopFilters />}

          {/* Generate CTA */}
          <button
            disabled={loading}
            onClick={generate}
            className={`w-full py-4 rounded-2xl text-sm font-bold tracking-wider uppercase font-[inherit] transition-all duration-200 active:scale-[0.999] ${
              loading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : m.ctaBtn
            }`}
          >
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {proMode ? "Generating professional recipe…" : "Crafting your recipe…"}
                </span>
              : (proMode ? "Generate Professional Recipe" : "Generate My Recipe")}
          </button>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 mt-4">
              {error}
            </div>
          )}

          {/* ── RESULT ───────────────────────────────────────────────────────── */}
          {recipe && (
            <div id="result-anchor" className="rounded-3xl border border-slate-200 shadow-card-lg mt-10 bg-white overflow-hidden animate-scale-in">

              {/* Result header */}
              <div className={`p-6 md:p-8 border-b border-slate-100 bg-gradient-to-br ${m.resultTint}`}>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {recipe.badge   && <span className={bdg()}>{recipe.badge}</span>}
                  {proMode        && <span className={bdg()}>Pro</span>}
                  {selectedDiets.map(d  => <span key={d}  className={bdg()}>{d}</span>)}
                  {selectedMethod && <span className={bdg()}>{selectedMethod}</span>}
                </div>

                <h2 className="font-display text-[clamp(1.8rem,4.5vw,3.2rem)] font-bold leading-[1.05] mb-3 text-slate-900 tracking-tight">{recipe.title}</h2>
                <p className="text-[0.9375rem] text-slate-500 mb-5 max-w-[600px] leading-relaxed">{recipe.intro}</p>

                {ingredientTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {ingredientTags.map(t => (
                      <span key={t} className="rounded-full bg-white border border-slate-200 text-[0.7rem] px-3 py-0.5 font-semibold text-slate-600 uppercase tracking-wide">{t}</span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => toggleFav(recipe, nutrition, allergens, ingredientTags, proMode)}
                    className={`rounded-full px-5 py-2.5 text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] transition-all duration-150 border ${
                      isFav ? m.savedBtn : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                    }`}
                  >{isFav ? "✓ Saved" : "Save Recipe"}</button>
                  <button
                    onClick={() => {
                      setExportingPDF(true);
                      if (proMode) exportProPDF(recipe, ingredientTags, nutrition, allergens, displayServings, ratio, proFields);
                      else exportHomePDF(recipe, ingredientTags, nutrition, displayServings, ratio);
                      setTimeout(() => setExportingPDF(false), 1000);
                    }}
                    className="rounded-full bg-white text-slate-700 border border-slate-200 px-5 py-2.5 text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] hover:border-slate-400 transition-all duration-150"
                  >{exportingPDF ? "Opening…" : (proMode ? "Pro Recipe Card PDF" : "Export PDF")}</button>
                  <button
                    onClick={() => setCookingMode(true)}
                    className="rounded-full bg-white text-slate-700 border border-slate-200 px-5 py-2.5 text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] hover:border-slate-400 transition-all duration-150"
                  >Start Cooking</button>
                  <button
                    onClick={copyShoppingList}
                    disabled={copyingList}
                    className="rounded-full bg-white text-slate-700 border border-slate-200 px-5 py-2.5 text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] hover:border-slate-400 transition-all duration-150 disabled:opacity-50"
                  >{copyingList ? "✓ Copied" : "📋 Copy List"}</button>
                  <button
                    onClick={() => exportShoppingList(recipe, displayServings, ratio)}
                    className="rounded-full bg-white text-slate-700 border border-slate-200 px-5 py-2.5 text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] hover:border-slate-400 transition-all duration-150"
                  >🖨 Print List</button>
                </div>
              </div>

              {proMode && <ProResultTabs />}

              {/* Two-column body — collapses at 660px */}
              <div className="grid grid-cols-1 wide:grid-cols-[1fr_300px]">

                {/* Main column */}
                <div className="p-6 md:p-8 border-b border-slate-100 wide:border-b-0 wide:border-r wide:border-slate-100">
                  {proMode && activeProTab === "mise"      && <MiseEnPlace   items={recipe.miseEnPlace} />}
                  {proMode && activeProTab === "allergens" && <AllergenMatrix allergens={allergens} />}

                  {(!proMode || activeProTab === "recipe") && (<>
                    <div className={secT}>Method</div>
                    {(recipe.steps || []).map((step, i) => (
                      <div key={i} className={`flex gap-4 mb-5 pb-5 items-start ${i === recipe.steps.length - 1 ? "" : "border-b border-slate-100"}`}>
                        <div className={`w-7 h-7 rounded-lg ${m.stepNum} text-white flex items-center justify-center text-[0.7rem] font-bold shrink-0 mt-[2px]`}>{i + 1}</div>
                        <div className="text-[0.9375rem] text-slate-700 leading-relaxed">{step}</div>
                      </div>
                    ))}

                    {recipe.tips && (
                      <div className={`rounded-2xl ${m.tipCard} p-5 mt-5`}>
                        <div className={`text-[0.7rem] font-semibold tracking-widest uppercase mb-2 ${m.tipLabel}`}>Chef's Tip</div>
                        <div className="text-[0.9375rem] text-slate-700 leading-relaxed">{recipe.tips}</div>
                      </div>
                    )}

                    {recipe.proTips?.length > 0 && (
                      <div className="mt-6">
                        <div className={secT}>Pro Tips</div>
                        <div className="flex flex-col gap-3">
                          {recipe.proTips.map((tip, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                              <div className="text-[0.7rem] font-bold tracking-widest uppercase mb-1 text-slate-700">{tip.title}</div>
                              <div className="text-[0.9375rem] text-slate-500 leading-relaxed">{tip.body}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {recipe.watchOuts?.length > 0 && (
                      <div className="mt-6">
                        <div className={secT}>Watch Out For</div>
                        <div className="flex flex-col gap-3">
                          {recipe.watchOuts.map((w, i) => (
                            <div key={i} className={`rounded-xl ${m.watchCard} p-4`}>
                              <div className={`text-[0.7rem] font-bold tracking-widest uppercase mb-1 ${m.watchLabel}`}>{w.title}</div>
                              <div className="text-[0.9375rem] text-slate-500 leading-relaxed">{w.body}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {proMode && recipe.haccp?.length > 0 && (
                      <div className="mt-6">
                        <div className={secT}>HACCP / Food Safety</div>
                        <div className="flex flex-col gap-3">
                          {recipe.haccp.map((h, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-[0.9375rem] text-slate-600 leading-relaxed">{h}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>)}
                </div>

                {/* Sidebar */}
                <div className="p-6">

                  {/* Scaler */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 mb-5">
                    <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-slate-400">{proMode ? "Covers" : "Servings"}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setDisplayServings(s => Math.max(MIN_SERVINGS, s - 1))}
                        disabled={displayServings <= MIN_SERVINGS}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-700 flex items-center justify-center font-bold cursor-pointer font-[inherit] hover:border-slate-400 transition-all duration-150 disabled:text-slate-300 disabled:cursor-not-allowed"
                      >−</button>
                      <span className="text-lg font-bold min-w-[2ch] text-center text-slate-900">{displayServings}</span>
                      <button
                        onClick={() => setDisplayServings(s => Math.min(MAX_SERVINGS, s + 1))}
                        disabled={displayServings >= MAX_SERVINGS}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-700 flex items-center justify-center font-bold cursor-pointer font-[inherit] hover:border-slate-400 transition-all duration-150 disabled:text-slate-300 disabled:cursor-not-allowed"
                      >+</button>
                    </div>
                  </div>

                  {/* Meta */}
                  {recipe.meta && (<>
                    <div className={secT}>At a Glance</div>
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {[["Prep",recipe.meta.prep],["Cook",recipe.meta.cook],["Level",recipe.meta.difficulty],["Method",recipe.meta.method||selectedMethod||"—"]].map(([k,v]) => (
                        <div key={k} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-[0.65rem] font-semibold tracking-widest uppercase text-slate-400 mb-1">{k}</div>
                          <div className="text-base font-bold text-slate-800">{v || "—"}</div>
                        </div>
                      ))}
                    </div>
                  </>)}

                  {/* Ingredients */}
                  <div className={`${secT} flex items-center justify-between`}>
                    <span>Ingredients</span>
                    {ratio !== 1 && <span className="text-[0.65rem] text-slate-400 font-normal normal-case tracking-normal">×{formatNum(ratio)}</span>}
                  </div>
                  <div className="flex flex-col mb-5">
                    {(recipe.ingredients || []).map((ing, i) => (
                      <div key={i} className="py-2.5 border-b border-slate-100 last:border-0 text-[0.9375rem] text-slate-700 flex items-baseline gap-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[0.45rem] ${m.dot}`}></span>
                        {scaleIngredient(ing, ratio)}
                      </div>
                    ))}
                  </div>

                  {/* Allergen quick summary — pro sidebar */}
                  {proMode && allergens && (
                    <div className="mb-5">
                      <div className={secT}>Allergens</div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {ALLERGENS.map(a => {
                          const hit = allergens.find(x => x.id === a.id);
                          if (!hit?.present && !hit?.mayContain) return null;
                          return (
                            <span
                              key={a.id}
                              className={`text-[0.65rem] rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wide ${
                                hit.present ? m.allergenPresent : m.allergenMaybe
                              }`}
                            >{a.label}</span>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setActiveProTab("allergens")}
                        className={`text-[0.7rem] font-semibold uppercase tracking-widest bg-transparent border-none cursor-pointer font-[inherit] p-0 transition-colors duration-150 ${m.allergenLink}`}
                      >View full allergen matrix →</button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}
        </>)}
      </div>

      {/* Toast */}
      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${m.toast} text-white rounded-full px-6 py-3 text-[0.7rem] font-bold tracking-widest uppercase z-[300] animate-toast whitespace-nowrap shadow-lg`}
        >
          {savedToast}
        </div>
      )}

      {/* Bottom Sheets */}
      {Object.entries(sheetMap).map(([id, { title, content }]) => (
        <BottomSheet key={id} open={activeSheet === id} onClose={() => setActiveSheet(null)} title={title}>
          {content}
          <button
            onClick={() => setActiveSheet(null)}
            className={`w-full mt-5 py-3.5 rounded-2xl text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] transition-all duration-150 ${m.sheetDone}`}
          >Done</button>
        </BottomSheet>
      ))}

      {/* Cooking Mode overlay */}
      {cookingMode && recipe && (
        <CookingMode
          steps={recipe.steps || []}
          proMode={proMode}
          onClose={() => setCookingMode(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-100 py-8 px-6 text-center">
        <p className="text-[0.75rem] font-medium text-slate-500 mb-1">
          Questions or feedback?{" "}
          <a
            href="mailto:aliasgertalib@gmail.com"
            className={`underline underline-offset-2 transition-colors ${m.footerLink}`}
          >
            aliasgertalib@gmail.com
          </a>
        </p>
        <p className="text-[0.65rem] leading-relaxed text-slate-400 max-w-xl mx-auto mt-3">
          FlavorLab is provided for informational and entertainment purposes only. Recipes are AI-generated and may
          contain errors — always verify ingredients, quantities, cooking temperatures, and techniques before
          preparing food. FlavorLab is not responsible for adverse reactions, dietary harm, or any outcomes
          resulting from use of generated content. Allergen information is indicative only and must not replace
          professional dietary or medical advice. Pro mode HACCP notes are illustrative and do not constitute
          certified food-safety guidance.
        </p>
        <p className="text-[0.6rem] text-slate-300 mt-3">
          © {new Date().getFullYear()} FlavorLab. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
