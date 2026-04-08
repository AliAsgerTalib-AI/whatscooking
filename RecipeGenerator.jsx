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
import { formatNum }       from "./src/utils/formatNum.js";
import { scaleIngredient } from "./src/utils/scaleIngredient.js";

// ── API / hooks / export ──────────────────────────────────────────────────────
import { generateRecipe }  from "./src/api/recipeApi.js";
import { useFavorites }    from "./src/hooks/useFavorites.js";
import { exportProPDF }    from "./src/export/exportProPDF.js";
import { exportHomePDF }   from "./src/export/exportHomePDF.js";

// ── Components ────────────────────────────────────────────────────────────────
import { IngredientTags }  from "./src/components/IngredientTags.jsx";
import { BottomSheet }     from "./src/components/BottomSheet.jsx";
import { NutritionBar }    from "./src/components/NutritionBar.jsx";
import { AllergenMatrix }  from "./src/components/AllergenMatrix.jsx";
import { MiseEnPlace }     from "./src/components/MiseEnPlace.jsx";
import { FavoritesPanel }  from "./src/components/FavoritesPanel.jsx";
import { ProFieldsPanel }  from "./src/components/ProFieldsPanel.jsx";

// ── Design-system class strings ───────────────────────────────────────────────

/** 1px bordered grid cell */
const card = "border border-primary bg-surface p-6 mb-4";

/** Section label — uppercase annotation */
const lbl  = "text-label-sm uppercase tracking-label font-bold mb-3";

/** Section title inside result panel */
const secT = "text-label-sm uppercase tracking-label font-bold mb-3 pb-1 border-b border-primary";

/** Inline badge pill */
const bdg  = () => "inline-block border border-primary text-label-sm uppercase tracking-label px-2 py-[0.15rem] font-bold";

/** Filter chip — active = black fill, inactive = outline */
const chipClass = (active) =>
  `px-3 py-1 border border-primary text-label-md uppercase tracking-label cursor-pointer font-[inherit] transition-colors duration-100 ease-linear ${
    active
      ? "bg-primary text-on-primary"
      : "bg-surface text-primary hover:bg-surface-container"
  }`;

/** Mobile filter pill */
const pillClass = (active) =>
  `flex items-center gap-1 px-3 py-1 border border-primary text-label-md uppercase tracking-label cursor-pointer font-[inherit] whitespace-nowrap transition-colors duration-100 ease-linear ${
    active ? "bg-primary text-on-primary" : "bg-surface text-primary"
  }`;

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
  const [selectedAllergens, setSelectedAllergens] = useState([]);

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
        ingredientTags, cuisine, selectedFlavors, selectedDiets, selectedMethod, selectedAllergens, servings, proMode,
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

  const FilterChips = ({ items, selected, onToggle, single }) => (
    <div className="flex flex-wrap gap-1">
      {items.map(item => (
        <button
          key={item.val}
          className={chipClass(single ? selected === item.val : selected.includes(item.val))}
          onClick={() => single ? onToggle(selected === item.val ? "" : item.val) : onToggle(item.val)}
        >{item.label}</button>
      ))}
    </div>
  );

  const sheetMap = useMemo(() => ({
    cuisine:  { title:"Cuisine Style", content:<>
      <FilterChips items={CUISINES} selected={selectedCuisine} onToggle={v => { setSelectedCuisine(v); setCustomCuisine(""); }} single />
      <input
        type="text"
        placeholder="Or type your own..."
        value={customCuisine}
        onChange={e => { setCustomCuisine(e.target.value); setSelectedCuisine(""); }}
        className="w-full mt-3 border border-primary bg-surface px-2 py-2 text-body-md font-[inherit] outline-none focus:bg-surface-container transition-colors duration-100 ease-linear"
      />
    </> },
    flavor:   { title:"Flavor Profile",       content:<FilterChips items={FLAVORS} selected={selectedFlavors} onToggle={v => toggle(v, selectedFlavors, setSelectedFlavors)} /> },
    diet:     { title:"Dietary Requirements", content:<FilterChips items={DIETS}   selected={selectedDiets}   onToggle={v => toggle(v, selectedDiets, setSelectedDiets)} /> },
    method:   { title:"Cooking Method",       content:<FilterChips items={METHODS} selected={selectedMethod}  onToggle={setSelectedMethod} single /> },
    servings: { title:"Serving Size",         content:<>
      <p className="text-body-md text-outline mb-3">How many {proMode ? "covers" : "people"}?</p>
      <div className="flex gap-1 flex-wrap">
        {(proMode ? PRO_BATCH_PRESETS : SERVING_PRESETS).map(n => (
          <button
            key={n}
            onClick={() => setServings(n)}
            className={`w-14 h-14 border border-primary text-headline-sm font-bold cursor-pointer font-[inherit] transition-colors duration-100 ease-linear ${
              servings === n ? "bg-primary text-on-primary" : "bg-surface text-primary hover:bg-surface-container"
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
      <div className="flex gap-1 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling:"touch" }}>
        {pills.map(p => (
          <button key={p.id} onClick={() => setActiveSheet(p.id)} className={pillClass(p.active)}>
            {p.label} <span className="text-label-sm">▾</span>
          </button>
        ))}
      </div>
    );
  };

  const DesktopFilters = () => (<>
    <div className={card}>
      <div className={lbl}>Cuisine Style</div>
      <div className="flex flex-wrap gap-1 mb-3">
        {CUISINES.map(c => (
          <button key={c.val} className={chipClass(selectedCuisine===c.val&&!customCuisine)} onClick={() => { setSelectedCuisine(c.val); setCustomCuisine(""); }}>{c.label}</button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Or type your own (e.g. Cajun, Hawaiian...)"
        value={customCuisine}
        onChange={e => { setCustomCuisine(e.target.value); setSelectedCuisine(""); }}
        className="w-full border border-primary bg-surface px-2 py-2 text-body-md font-[inherit] outline-none transition-colors duration-100 ease-linear focus:bg-surface-container"
      />
    </div>
    <div className={card}>
      <div className={lbl}>Flavor Profile <span className="text-outline font-normal normal-case tracking-normal">— pick any</span></div>
      <div className="flex flex-wrap gap-1">
        {FLAVORS.map(f => <button key={f.val} className={chipClass(selectedFlavors.includes(f.val))} onClick={() => toggle(f.val, selectedFlavors, setSelectedFlavors)}>{f.label}</button>)}
      </div>
    </div>
    <div className={card}>
      <div className={lbl}>Dietary Requirements <span className="text-outline font-normal normal-case tracking-normal">— pick any</span></div>
      <div className="flex flex-wrap gap-1">
        {DIETS.map(d => <button key={d.val} className={chipClass(selectedDiets.includes(d.val))} onClick={() => toggle(d.val, selectedDiets, setSelectedDiets)}>{d.label}</button>)}
      </div>
    </div>
    <div className={card}>
      <div className={lbl}>Allergens to Avoid <span className="text-outline font-normal normal-case tracking-normal">— pick any</span></div>
      <div className="flex flex-wrap gap-1">
        {ALLERGENS.map(a => (
          <button key={a.id} className={chipClass(selectedAllergens.includes(a.id))} onClick={() => toggle(a.id, selectedAllergens, setSelectedAllergens)}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>
    </div>
    <div className={card}>
      <div className={lbl}>Cooking Method <span className="text-outline font-normal normal-case tracking-normal">— pick one</span></div>
      <div className="flex flex-wrap gap-1">
        {METHODS.map(m => <button key={m.val} className={chipClass(selectedMethod===m.val)} onClick={() => setSelectedMethod(selectedMethod===m.val?"":m.val)}>{m.label}</button>)}
      </div>
    </div>
    {proMode && (
      <div className={card}>
        <div className={lbl}>Recipe Card Details <span className="text-outline font-normal normal-case tracking-normal">— optional</span></div>
        <ProFieldsPanel proFields={proFields} onChange={setProFields} />
      </div>
    )}
  </>);

  const ProResultTabs = () => {
    const tabs = [{ id:"recipe", label:"Recipe" }, { id:"allergens", label:"Allergens" }, { id:"mise", label:"Mise en Place" }];
    return (
      <div className="flex border-b border-primary">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveProTab(t.id)}
            className={`px-4 py-2 text-label-md uppercase tracking-label font-bold cursor-pointer font-[inherit] border-r border-primary transition-colors duration-100 ease-linear last:border-r-0 ${
              activeProTab === t.id
                ? "bg-primary text-on-primary"
                : "bg-surface text-primary hover:bg-surface-container"
            }`}
          >{t.label}</button>
        ))}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface text-primary font-sans">

      {/* NAV — 2px bottom border as primary structural rule */}
      <nav className="flex items-center justify-between px-6 md:px-[5.5rem] py-4 border-b-2 border-primary bg-surface sticky top-0 z-[100]">
        <div className="text-headline-sm font-bold tracking-tight">FLAVORLAB</div>
        <div className="flex items-center gap-1">
          {/* Pro toggle — plain bordered button, no visual flourish */}
          <button
            role="switch"
            aria-checked={proMode}
            aria-label="Toggle Pro mode"
            onClick={() => setProMode(p => !p)}
            onKeyDown={e => (e.key === " " || e.key === "Enter") && setProMode(p => !p)}
            className={`border border-primary px-3 py-1 text-label-md uppercase tracking-label font-bold cursor-pointer font-[inherit] transition-colors duration-100 ease-linear ${
              proMode ? "bg-primary text-on-primary" : "bg-surface text-primary"
            }`}
          >{proMode ? "Pro: On" : "Pro: Off"}</button>
          {["generator","favorites"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`border border-primary px-3 py-1 text-label-md uppercase tracking-label font-bold cursor-pointer font-[inherit] transition-colors duration-100 ease-linear ${
                tab === t ? "bg-primary text-on-primary" : "bg-surface text-primary hover:bg-surface-container"
              }`}
            >
              {t === "generator" ? "Generator" : `Saved${favorites.length ? ` (${favorites.length})` : ""}`}
            </button>
          ))}
        </div>
      </nav>

      {/* Pro Mode annotation — full-width ruled banner */}
      {proMode && (
        <div className="px-6 md:px-[5.5rem] py-2 border-b border-primary bg-surface-container animate-fade-in">
          <span className="text-label-sm uppercase tracking-label">
            Professional Mode — Metric weights · Mise en place · HACCP · Allergen matrix · Pro recipe card PDF
          </span>
        </div>
      )}

      <div className="max-w-[940px] mx-auto px-6 md:px-[5.5rem] py-10">

        {/* FAVORITES */}
        {tab === "favorites" && (
          <div className="animate-fade-in">
            <h2 className="text-headline-sm font-bold mb-6 uppercase tracking-label">Saved Recipes</h2>
            <FavoritesPanel favorites={favorites} onLoad={loadFavorite} onDelete={deleteFavorite} />
          </div>
        )}

        {/* GENERATOR */}
        {tab === "generator" && (<>

          {/* Hero — flush-left per Swiss grid rules */}
          <div className="mb-10 border-b border-primary pb-8">
            <h1 className="text-[clamp(1.9rem,5vw,3.2rem)] font-extrabold leading-[1.1] mb-2">
              {proMode
                ? <>Professional kitchen-grade<br />recipe generation.</>
                : <>Any ingredients,<br />any cuisine, any craving.</>}
            </h1>
            <p className="text-body-md text-outline">
              {proMode
                ? "Metric weights, mise en place, HACCP notes, and full allergen matrix."
                : "Tell us what you have. We'll craft the perfect recipe."}
            </p>
          </div>

          {/* Ingredients */}
          <div className={card}>
            <div className={`${lbl} flex items-center justify-between`}>
              <span>{proMode ? "Kitchen Inventory" : "Your Ingredients"}</span>
              {ingredientTags.length > 0 && (
                <span className="border border-primary px-2 py-[0.1rem] text-label-sm font-bold">
                  {ingredientTags.length} added
                </span>
              )}
            </div>
            <IngredientTags tags={ingredientTags} onChange={setIngredientTags} />
          </div>

          {/* Serving size */}
          <div className={card}>
            <div className={lbl}>{proMode ? "Covers / Yield" : "Serving Size"}</div>
            <div className="flex items-center gap-1 flex-wrap">
              {(proMode ? PRO_BATCH_PRESETS : SERVING_PRESETS).map(n => (
                <button
                  key={n}
                  onClick={() => setServings(n)}
                  className={`w-11 h-11 border border-primary text-headline-sm font-bold cursor-pointer font-[inherit] transition-colors duration-100 ease-linear ${
                    servings === n
                      ? "bg-primary text-on-primary"
                      : "bg-surface text-primary hover:bg-surface-container"
                  }`}
                >{n}</button>
              ))}
              <span className="text-label-sm uppercase tracking-label text-outline ml-1">{proMode ? "covers" : "people"}</span>
            </div>
          </div>

          {/* Filters */}
          {isMobile ? (
            <div className={card}>
              <div className={lbl}>Preferences</div>
              <MobileFilterBar />
              <p className="text-label-sm text-outline mt-2 uppercase tracking-label">Tap to open options</p>
            </div>
          ) : <DesktopFilters />}

          {/* Grid divider */}
          <div className="w-full border-b border-primary mb-4" />

          {/* Generate button — primary CTA */}
          <button
            disabled={loading}
            onClick={generate}
            className={`w-full py-4 border border-primary text-label-md uppercase tracking-label font-bold font-[inherit] transition-colors duration-100 ease-linear ${
              loading
                ? "bg-surface-container text-outline cursor-not-allowed"
                : "bg-[linear-gradient(to_bottom,#000000,#3b3b3b)] text-on-primary cursor-pointer hover:bg-none hover:bg-surface hover:text-primary"
            }`}
          >
            {loading
              ? `${proMode ? "Generating professional recipe" : "Crafting your recipe"}…`
              : (proMode ? "Generate Professional Recipe" : "Generate My Recipe")}
          </button>

          {error && (
            <div className="border border-primary bg-surface-container px-4 py-3 text-body-md mt-4">
              {error}
            </div>
          )}

          {/* ── RESULT ───────────────────────────────────────────────────────── */}
          {recipe && (
            <div id="result-anchor" className="border-2 border-primary mt-8 animate-fade-in">

              {/* Result header */}
              <div className="border-b border-primary p-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {recipe.badge   && <span className={bdg()}>{recipe.badge}</span>}
                  {proMode        && <span className={bdg()}>Pro</span>}
                  {selectedDiets.map(d  => <span key={d}  className={bdg()}>{d}</span>)}
                  {selectedMethod && <span className={bdg()}>{selectedMethod}</span>}
                </div>

                {/* Recipe title — Display-LG: the "Final Truth" output */}
                <h2 className="text-display-lg font-extrabold leading-[1.05] mb-3">{recipe.title}</h2>
                <p className="text-body-md text-outline mb-4 max-w-[600px]">{recipe.intro}</p>

                {/* Ingredient tags used */}
                {ingredientTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {ingredientTags.map(t => (
                      <span key={t} className="border border-primary text-label-sm px-2 py-[0.1rem] uppercase tracking-label">{t}</span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => toggleFav(recipe, nutrition, allergens, ingredientTags, proMode)}
                    className={`border border-primary px-4 py-2 text-label-md uppercase tracking-label font-bold cursor-pointer font-[inherit] transition-colors duration-100 ease-linear ${
                      isFav
                        ? "bg-primary text-on-primary"
                        : "bg-surface text-primary hover:bg-surface-container"
                    }`}
                  >{isFav ? "Saved" : "Save Recipe"}</button>
                  <button
                    onClick={() => {
                      setExportingPDF(true);
                      if (proMode) exportProPDF(recipe, ingredientTags, nutrition, allergens, displayServings, ratio, proFields);
                      else exportHomePDF(recipe, ingredientTags, nutrition, displayServings, ratio);
                      setTimeout(() => setExportingPDF(false), 1000);
                    }}
                    className="border border-primary bg-surface text-primary px-4 py-2 text-label-md uppercase tracking-label font-bold cursor-pointer font-[inherit] hover:bg-surface-container transition-colors duration-100 ease-linear"
                  >{exportingPDF ? "Opening…" : (proMode ? "Pro Recipe Card PDF" : "Export PDF")}</button>
                </div>
              </div>

              {proMode && <ProResultTabs />}

              {/* Two-column body — collapses at 660px */}
              <div className="grid grid-cols-1 wide:grid-cols-[1fr_300px]">

                {/* Main column */}
                <div className="p-6 border-b border-primary wide:border-b-0 wide:border-r wide:border-primary">
                  {proMode && activeProTab === "mise"      && <MiseEnPlace   items={recipe.miseEnPlace} />}
                  {proMode && activeProTab === "allergens" && <AllergenMatrix allergens={allergens} />}

                  {(!proMode || activeProTab === "recipe") && (<>
                    <div className={secT}>Method</div>
                    {(recipe.steps || []).map((step, i) => (
                      <div key={i} className={`flex gap-4 mb-4 pb-4 items-start ${i === recipe.steps.length - 1 ? "" : "border-b border-primary"}`}>
                        {/* Step number — solid black square */}
                        <div className="w-7 h-7 bg-primary text-on-primary flex items-center justify-center text-label-sm font-bold shrink-0 mt-[2px]">{i + 1}</div>
                        <div className="text-body-md">{step}</div>
                      </div>
                    ))}

                    {recipe.tips && (
                      <div className="border border-primary bg-surface-container p-4 mt-4">
                        <div className={`${lbl} mb-2`}>Chef's Tip</div>
                        <div className="text-body-md">{recipe.tips}</div>
                      </div>
                    )}

                    {recipe.proTips?.length > 0 && (
                      <div className="mt-6">
                        <div className={secT}>Pro Tips</div>
                        <div className="flex flex-col gap-px bg-primary border border-primary">
                          {recipe.proTips.map((tip, i) => (
                            <div key={i} className="bg-surface p-4">
                              <div className="text-label-sm uppercase tracking-label font-bold mb-1">{tip.title}</div>
                              <div className="text-body-md text-outline">{tip.body}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {recipe.watchOuts?.length > 0 && (
                      <div className="mt-6">
                        <div className={secT}>Watch Out For</div>
                        <div className="flex flex-col gap-px bg-primary border border-primary">
                          {recipe.watchOuts.map((w, i) => (
                            <div key={i} className="bg-surface p-4">
                              <div className="text-label-sm uppercase tracking-label font-bold mb-1">{w.title}</div>
                              <div className="text-body-md text-outline">{w.body}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {proMode && recipe.haccp?.length > 0 && (
                      <div className="mt-6">
                        <div className={secT}>HACCP / Food Safety</div>
                        <div className="flex flex-col gap-px bg-primary border border-primary">
                          {recipe.haccp.map((h, i) => (
                            <div key={i} className="bg-surface-container p-4 text-body-md">{h}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>)}
                </div>

                {/* Sidebar */}
                <div className="p-6">

                  {/* Scaler */}
                  <div className="flex items-center justify-between border border-primary px-3 py-2 mb-4">
                    <span className="text-label-sm uppercase tracking-label text-outline">{proMode ? "Covers" : "Servings"}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDisplayServings(s => Math.max(MIN_SERVINGS, s - 1))}
                        disabled={displayServings <= MIN_SERVINGS}
                        className="w-7 h-7 border border-primary bg-surface text-primary flex items-center justify-center font-bold cursor-pointer font-[inherit] hover:bg-primary hover:text-on-primary transition-colors duration-100 ease-linear disabled:text-outline disabled:cursor-not-allowed"
                      >−</button>
                      <span className="text-headline-sm font-bold min-w-[2ch] text-center">{displayServings}</span>
                      <button
                        onClick={() => setDisplayServings(s => Math.min(MAX_SERVINGS, s + 1))}
                        disabled={displayServings >= MAX_SERVINGS}
                        className="w-7 h-7 border border-primary bg-surface text-primary flex items-center justify-center font-bold cursor-pointer font-[inherit] hover:bg-primary hover:text-on-primary transition-colors duration-100 ease-linear disabled:text-outline disabled:cursor-not-allowed"
                      >+</button>
                    </div>
                  </div>

                  {/* Meta */}
                  {recipe.meta && (<>
                    <div className={secT}>At a Glance</div>
                    <div className="grid grid-cols-2 gap-px bg-primary border border-primary mb-4">
                      {[["Prep",recipe.meta.prep],["Cook",recipe.meta.cook],["Level",recipe.meta.difficulty],["Method",recipe.meta.method||selectedMethod||"—"]].map(([k,v]) => (
                        <div key={k} className="bg-surface p-3">
                          <div className="text-label-sm uppercase tracking-label text-outline mb-[0.75rem]">{k}</div>
                          <div className="text-headline-sm font-bold">{v || "—"}</div>
                        </div>
                      ))}
                    </div>
                  </>)}

                  {/* Ingredients */}
                  <div className={`${secT} flex items-center justify-between`}>
                    <span>Ingredients</span>
                    {ratio !== 1 && <span className="text-label-sm text-outline font-normal normal-case tracking-normal">×{formatNum(ratio)}</span>}
                  </div>
                  <div className="flex flex-col gap-px bg-primary border border-primary mb-4">
                    {(recipe.ingredients || []).map((ing, i) => (
                      <div key={i} className="bg-surface px-3 py-2 text-body-md flex items-baseline gap-2">
                        <span className="text-outline shrink-0">—</span>
                        {scaleIngredient(ing, ratio)}
                      </div>
                    ))}
                  </div>

                  {/* Allergen quick summary — pro sidebar */}
                  {proMode && allergens && (
                    <div className="mb-4">
                      <div className={secT}>Allergens</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {ALLERGENS.map(a => {
                          const hit = allergens.find(x => x.id === a.id);
                          if (!hit?.present && !hit?.mayContain) return null;
                          return (
                            <span
                              key={a.id}
                              className={`text-label-sm border border-primary px-2 py-[0.1rem] uppercase tracking-label font-bold ${
                                hit.present ? "bg-primary text-on-primary" : "bg-surface-container text-primary"
                              }`}
                            >{a.label}</span>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setActiveProTab("allergens")}
                        className="text-label-sm uppercase tracking-label text-outline border-none bg-transparent cursor-pointer font-[inherit] p-0 hover:text-primary transition-colors duration-100 ease-linear underline"
                      >View full allergen matrix</button>
                    </div>
                  )}

                  {/* Nutrition */}
                  {nutrition && (<>
                    <div className={secT}>
                      Nutrition <span className="text-outline font-normal normal-case tracking-normal text-label-sm">per serving</span>
                    </div>
                    {/* Calories — the focal data point */}
                    <div className="border border-primary bg-surface-container px-3 py-3 mb-4 flex items-baseline justify-between">
                      <span className="text-label-sm uppercase tracking-label text-outline">Calories</span>
                      <span className="text-display-lg font-extrabold leading-none">{nutrition.calories}<span className="text-label-sm font-normal text-outline ml-1">kcal</span></span>
                    </div>
                    <NutritionBar label="Protein"       value={nutrition.protein} unit="g"  max={60}   />
                    <NutritionBar label="Carbohydrates" value={nutrition.carbs}   unit="g"  max={100}  />
                    <NutritionBar label="Fat"           value={nutrition.fat}     unit="g"  max={60}   />
                    <NutritionBar label="Fiber"         value={nutrition.fiber}   unit="g"  max={30}   />
                    <NutritionBar label="Sodium"        value={nutrition.sodium}  unit="mg" max={2300} />
                    {nutrition.note && <p className="text-label-sm text-outline mt-2">{nutrition.note}</p>}
                  </>)}
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
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary text-on-primary border border-primary px-6 py-3 text-label-md uppercase tracking-label font-bold z-[300] animate-toast whitespace-nowrap"
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
            className="w-full mt-4 py-3 border border-primary bg-[linear-gradient(to_bottom,#000000,#3b3b3b)] text-on-primary text-label-md uppercase tracking-label font-bold cursor-pointer font-[inherit] hover:bg-none hover:bg-surface hover:text-primary transition-colors duration-100 ease-linear"
          >Done</button>
        </BottomSheet>
      ))}
    </div>
  );
}
