import { useState, useEffect, useCallback, useMemo } from "react";
import type { Recipe, SelectOption } from "./src/types/recipe";

import { MOBILE_BREAKPOINT, CONTACT_EMAIL } from "./src/constants";
import { m, card, lbl, secT, inputCls, bdg, chipClass } from "./src/tokens";

import { CUISINES }                 from "./src/data/cuisines";
import { FLAVORS }                  from "./src/data/flavors";
import { DIETS }                    from "./src/data/diets";
import { METHODS, SERVING_PRESETS } from "./src/data/methods";
import { ALLERGENS }                from "./src/data/allergens";
import { COOK_TYPES }               from "./src/data/cookTypes";

import { formatNum }       from "./src/utils/formatNum";
import { scaleIngredient } from "./src/utils/scaleIngredient";

import { generateRecipe }     from "./src/api/recipeApi";
import { useFavorites }       from "./src/hooks/useFavorites";
import { exportHomePDF }      from "./src/export/exportHomePDF";
import { CookingMode }        from "./src/components/CookingMode";
import { exportShoppingList } from "./src/export/exportShoppingList";

import { IngredientTags }  from "./src/components/IngredientTags";
import { BottomSheet }     from "./src/components/BottomSheet";
import { FavoritesPanel }  from "./src/components/FavoritesPanel";
import { MobileFilterBar } from "./src/components/MobileFilterBar";
import { DesktopFilters }  from "./src/components/DesktopFilters";

const MAX_SERVINGS      = 200;
const MIN_SERVINGS      = 1;
const TOAST_DURATION_MS = 2200;

interface FilterChipsProps {
  items:    SelectOption[];
  selected: string | string[];
  onToggle: (val: string) => void;
  single?:  boolean;
}

const FilterChips = ({ items, selected, onToggle, single }: FilterChipsProps) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map(item => (
      <button
        key={item.val}
        className={chipClass(single ? selected === item.val : (selected as string[]).includes(item.val))}
        onClick={() => single ? onToggle(selected === item.val ? "" : item.val) : onToggle(item.val)}
      >{item.label}</button>
    ))}
  </div>
);

export default function RecipeGenerator() {
  const [tab, setTab]                         = useState("generator");
  const [ingredientTags, setIngredientTags]   = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [customCuisine, setCustomCuisine]     = useState("");
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedDiets, setSelectedDiets]     = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod]   = useState("");
  const [servings, setServings]               = useState(4);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [recipe, setRecipe]                   = useState<Recipe | null>(null);
  const [baseServings, setBaseServings]       = useState(4);
  const [displayServings, setDisplayServings] = useState(4);
  const [activeSheet, setActiveSheet]         = useState<string | null>(null);
  const [isMobile, setIsMobile]               = useState(false);
  const [savedToast, setSavedToast]           = useState("");
  const [exportingPDF, setExportingPDF]       = useState(false);
  const [cookingMode, setCookingMode]         = useState(false);
  const [copyingList, setCopyingList]         = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [cookType, setCookType]               = useState<string | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const showToast = useCallback((msg: string) => {
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
    setRecipe, setIngredientTags,
    setBaseServings, setDisplayServings, setTab,
  });

  const toggle = useCallback((val: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val]);
  }, []);

  const generate = async () => {
    if (ingredientTags.length === 0) { setError("Please add at least one ingredient."); return; }
    const cuisine = customCuisine.trim() || selectedCuisine;
    setError(""); setLoading(true); setRecipe(null); setIsFav(false);
    try {
      const result = await generateRecipe({
        ingredientTags, cuisine, selectedFlavors, selectedDiets, selectedMethod, selectedAllergens, servings,
        cookType: COOK_TYPES.find(t => t.val === cookType) ?? null,
      });
      setRecipe(result.recipe);
      setBaseServings(result.servings);
      setDisplayServings(result.servings);
      setTimeout(() => document.getElementById("result-anchor")?.scrollIntoView({ behavior:"smooth" }), 100);
    } catch (e) {
      setError("Error: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const actionBtnCls = `rounded-full px-4 py-2 text-[0.68rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] transition-all duration-150 border bg-white text-[#7A6B5E] border-[#E5DDD3] hover:border-[#C5B9AD] hover:text-[#1A1208]`;

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
    flavor:   { title:"Flavor Profile",       content:<FilterChips items={FLAVORS}   selected={selectedFlavors}   onToggle={v => toggle(v, selectedFlavors, setSelectedFlavors)} /> },
    diet:     { title:"Dietary Requirements", content:<FilterChips items={DIETS}     selected={selectedDiets}     onToggle={v => toggle(v, selectedDiets, setSelectedDiets)} /> },
    method:   { title:"Cooking Method",       content:<FilterChips items={METHODS}   selected={selectedMethod}    onToggle={setSelectedMethod} single /> },
    servings: { title:"Serving Size",         content:<>
      <p className="text-sm text-[#7A6B5E] mb-4">How many people?</p>
      <div className="flex gap-2 flex-wrap">
        {SERVING_PRESETS.map(n => (
          <button
            key={n}
            onClick={() => setServings(n)}
            className={`w-14 h-14 rounded-xl text-lg font-bold cursor-pointer font-[inherit] transition-all duration-150 border ${
              servings === n
                ? "bg-[#2C5F4A] text-white border-[#2C5F4A] shadow-sm"
                : "bg-[#F5F0E8] text-[#7A6B5E] border-[#E5DDD3] hover:border-[#C5B9AD]"
            }`}
          >{n}</button>
        ))}
      </div>
    </> },
    allergies:{ title:"Allergens to Avoid",  content:<FilterChips items={ALLERGENS.map(a => ({ val:a.id, label:`${a.icon} ${a.label}` }))} selected={selectedAllergens} onToggle={v => toggle(v, selectedAllergens, setSelectedAllergens)} /> },
  }), [selectedCuisine, customCuisine, selectedFlavors, selectedDiets, selectedMethod, selectedAllergens, servings, toggle]);

  const metaFields: [string, string][] = recipe?.meta
    ? [
        ["Prep",   recipe.meta.prep       || "—"],
        ["Cook",   recipe.meta.cook       || "—"],
        ["Serves", String(recipe.meta.serves || displayServings)],
        ["Level",  recipe.meta.difficulty || "—"],
        ["Method", recipe.meta.method || selectedMethod || "—"],
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#FDFAF5] text-[#1A1208] font-sans">

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-4 sticky top-0 z-[100] glass border-b border-[#E5DDD3]">
        <span
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: "1.45rem", letterSpacing: "-0.01em", color: "#1A1208" }}
        >
          Karigar
        </span>
        <button
          onClick={() => setTab(tab === "favorites" ? "generator" : "favorites")}
          aria-pressed={tab === "favorites"}
          className={`rounded-full px-4 py-1.5 text-[0.72rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] transition-all duration-200 border ${
            tab === "favorites"
              ? "bg-[#1A1208] text-white border-[#1A1208]"
              : "bg-transparent text-[#7A6B5E] border-[#E5DDD3] hover:border-[#C5B9AD] hover:text-[#1A1208]"
          }`}
        >
          {`Saved${favorites.length ? ` (${favorites.length})` : ""}`}
        </button>
      </nav>

      <div className="max-w-[960px] mx-auto px-6 md:px-16 py-10">

        {/* ── Favorites tab ── */}
        {tab === "favorites" && (
          <div className="animate-fade-in">
            <h2
              className="mb-6 text-[#1A1208]"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: "2rem" }}
            >
              Saved Recipes
            </h2>
            <FavoritesPanel favorites={favorites} onLoad={loadFavorite} onDelete={deleteFavorite} />
          </div>
        )}

        {/* ── Generator tab ── */}
        {tab === "generator" && (<>

          <div className="mb-8 pt-4 pb-8 border-b border-[#E5DDD3]">
            <p className="text-[1rem] text-[#7A6B5E] max-w-md leading-relaxed animate-fade-up">
              Tell us what you have. We'll craft the perfect recipe — with flavour tips and kitchen tricks.
            </p>
          </div>

          {/* Cook type */}
          <div className={card}>
            <div className={`${lbl} flex items-center justify-between`}>
              <span>Your Cooking Style</span>
              {cookType && (
                <button
                  onClick={() => setCookType(null)}
                  className="text-[0.62rem] font-semibold tracking-widest uppercase text-[#B5A898] hover:text-[#7A6B5E] transition-colors"
                >Clear</button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 flex-nowrap">
              {COOK_TYPES.map(ct => {
                const active = cookType === ct.val;
                return (
                  <button
                    key={ct.val}
                    onClick={() => setCookType(active ? null : ct.val)}
                    className={`flex-none flex flex-col items-center gap-1.5 rounded-xl px-3 py-3.5 text-center cursor-pointer font-[inherit] transition-all duration-150 border w-[96px] shrink-0 ${
                      active
                        ? "bg-[#2C5F4A] text-white border-[#2C5F4A] shadow-sm"
                        : "bg-[#F5F0E8] text-[#7A6B5E] border-[#E5DDD3] hover:border-[#C5B9AD] hover:text-[#1A1208]"
                    }`}
                  >
                    <span className="text-xl leading-none">{ct.icon}</span>
                    <span className="text-[0.62rem] font-bold tracking-wide uppercase leading-tight whitespace-nowrap">{ct.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ingredients */}
          <div className={card}>
            <div className={`${lbl} flex items-center justify-between`}>
              <span>Your Ingredients</span>
              {ingredientTags.length > 0 && (
                <span className="text-[0.65rem] font-bold rounded-full px-2.5 py-0.5 bg-[#E8F2ED] text-[#2C5F4A]">
                  {ingredientTags.length} added
                </span>
              )}
            </div>
            <IngredientTags tags={ingredientTags} onChange={setIngredientTags} />
          </div>

          {/* Serving size */}
          <div className={card}>
            <div className={lbl}>Serving Size</div>
            <div className="flex items-center gap-2 flex-wrap">
              {SERVING_PRESETS.map(n => (
                <button
                  key={n}
                  onClick={() => setServings(n)}
                  className={`w-11 h-11 rounded-xl text-base font-bold cursor-pointer font-[inherit] transition-all duration-150 border ${
                    servings === n
                      ? "bg-[#2C5F4A] text-white border-[#2C5F4A] shadow-sm"
                      : "bg-[#F5F0E8] text-[#7A6B5E] border-[#E5DDD3] hover:border-[#C5B9AD] hover:text-[#1A1208]"
                  }`}
                >{n}</button>
              ))}
              <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-[#9A8878] ml-1">people</span>
            </div>
          </div>

          {/* Filters */}
          {isMobile ? (
            <div className={card}>
              <div className={lbl}>Preferences</div>
              <MobileFilterBar
                customCuisine={customCuisine}
                selectedCuisine={selectedCuisine}
                selectedFlavors={selectedFlavors}
                selectedDiets={selectedDiets}
                selectedMethod={selectedMethod}
                servings={servings}
                selectedAllergens={selectedAllergens}
                onOpen={setActiveSheet}
              />
              <p className="text-[0.65rem] text-[#B5A898] mt-2.5 font-semibold tracking-widest uppercase">Tap to open options</p>
            </div>
          ) : (
            <DesktopFilters
              selectedCuisine={selectedCuisine}
              customCuisine={customCuisine}
              selectedFlavors={selectedFlavors}
              selectedDiets={selectedDiets}
              selectedMethod={selectedMethod}
              selectedAllergens={selectedAllergens}
              onCuisineChange={setSelectedCuisine}
              onCustomCuisineChange={setCustomCuisine}
              onFlavorToggle={v => toggle(v, selectedFlavors, setSelectedFlavors)}
              onDietToggle={v => toggle(v, selectedDiets, setSelectedDiets)}
              onMethodToggle={v => setSelectedMethod(selectedMethod === v ? "" : v)}
              onAllergenToggle={v => toggle(v, selectedAllergens, setSelectedAllergens)}
            />
          )}

          {/* Generate button */}
          <button
            disabled={loading}
            onClick={generate}
            className={`w-full py-4 rounded-2xl text-[0.85rem] font-bold tracking-wider uppercase font-[inherit] transition-all duration-200 active:scale-[0.999] ${
              loading
                ? "bg-[#E5DDD3] text-[#B5A898] cursor-not-allowed"
                : "bg-[#2C5F4A] text-white shadow-lg shadow-[#2C5F4A]/20 hover:bg-[#1E4433] hover:shadow-xl hover:shadow-[#2C5F4A]/25 hover:scale-[1.003]"
            }`}
          >
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Crafting your recipe…
                </span>
              : "Generate My Recipe"}
          </button>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 mt-4">
              {error}
            </div>
          )}

          {/* ── Recipe output ── */}
          {recipe && (
            <div id="result-anchor" className="rounded-3xl border border-[#E5DDD3] shadow-card-lg mt-10 bg-white overflow-hidden animate-scale-in">

              {/* Header */}
              <div className="p-8 md:p-10 border-b border-[#E5DDD3]">
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {recipe.badge   && <span className={bdg()}>{recipe.badge}</span>}
                  {selectedDiets.map(d  => <span key={d}  className={bdg()}>{d}</span>)}
                  {selectedMethod && <span className={bdg()}>{selectedMethod}</span>}
                </div>

                <h2
                  className="leading-[1.05] mb-4 text-[#1A1208] tracking-tight"
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontWeight: 700,
                    fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  }}
                >
                  {recipe.title}
                </h2>

                <p className="text-[1rem] text-[#7A6B5E] mb-6 max-w-[640px] leading-[1.72]">{recipe.intro}</p>

                {ingredientTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {ingredientTags.map(t => (
                      <span key={t} className="rounded-full bg-[#F5F0E8] border border-[#E5DDD3] text-[0.68rem] px-3 py-0.5 font-semibold text-[#7A6B5E] uppercase tracking-wide">{t}</span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => toggleFav(recipe, ingredientTags)}
                    className={`rounded-full px-4 py-2 text-[0.68rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] transition-all duration-150 border ${
                      isFav
                        ? "bg-[#2C5F4A] text-white border-[#2C5F4A]"
                        : actionBtnCls
                    }`}
                  >{isFav ? "✓ Saved" : "Save Recipe"}</button>
                  <button
                    onClick={() => {
                      setExportingPDF(true);
                      exportHomePDF(recipe, ingredientTags, displayServings, ratio);
                      setTimeout(() => setExportingPDF(false), 1000);
                    }}
                    className={actionBtnCls}
                  >{exportingPDF ? "Opening…" : "Export PDF"}</button>
                  <button onClick={() => setCookingMode(true)} className={actionBtnCls}>Start Cooking</button>
                  <button
                    onClick={copyShoppingList}
                    disabled={copyingList}
                    className={`${actionBtnCls} disabled:opacity-50`}
                  >{copyingList ? "✓ Copied" : "Copy List"}</button>
                  <button onClick={() => exportShoppingList(recipe, displayServings, ratio)} className={actionBtnCls}>Print List</button>
                </div>
              </div>

              {/* Meta strip */}
              {metaFields.length > 0 && (
                <div className="grid grid-cols-2 wide:grid-cols-5 border-b border-[#E5DDD3] bg-[#FDFAF5]">
                  {metaFields.map(([k, v], idx) => (
                    <div
                      key={k}
                      className={`px-5 py-4 ${idx < metaFields.length - 1 ? "border-r border-[#E5DDD3]" : ""}`}
                    >
                      <div className="text-[0.62rem] font-semibold tracking-widest uppercase text-[#9A8878] mb-1">{k}</div>
                      <div className="text-[0.95rem] font-bold text-[#1A1208]">{v}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Body */}
              <div className="grid grid-cols-1 wide:grid-cols-[1fr_288px]">

                {/* Steps & tips column */}
                <div className="p-8 md:p-10 border-b border-[#E5DDD3] wide:border-b-0 wide:border-r wide:border-[#E5DDD3]">

                  <div className={secT}>Method</div>
                  {(recipe.steps || []).map((step, i) => (
                    <div key={i} className={`flex gap-5 mb-6 pb-6 items-start ${i === recipe.steps.length - 1 ? "" : "border-b border-[#EDE8E0]"}`}>
                      <div className="w-8 h-8 rounded-full bg-[#2C5F4A] text-white flex items-center justify-center text-[0.68rem] font-bold shrink-0 mt-[3px]">
                        {i + 1}
                      </div>
                      <div className="text-[1rem] text-[#3D3028] leading-[1.75]">{step}</div>
                    </div>
                  ))}

                  {recipe.tips && (
                    <div className="rounded-2xl bg-[#FBF7F0] border border-[#EDE5D8] p-5 mt-2">
                      <div className="text-[0.65rem] font-bold tracking-widest uppercase mb-2 text-[#B8873A]">Chef's Tip</div>
                      <div className="text-[1rem] text-[#3D3028] leading-[1.72]">{recipe.tips}</div>
                    </div>
                  )}

                  {recipe.flavourTips?.length > 0 && (
                    <div className="mt-8">
                      <div className={secT}>Flavour Tips</div>
                      <div className="flex flex-col gap-3">
                        {recipe.flavourTips.map((tip, i) => (
                          <div key={i} className="rounded-xl bg-[#F4F9F6] border border-[#D8EBE1] p-4">
                            <div className="text-[0.65rem] font-bold tracking-widest uppercase mb-1.5 text-[#2C5F4A]">{tip.title}</div>
                            <div className="text-[0.9375rem] text-[#3D3028] leading-relaxed">{tip.body}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recipe.kitchenTips?.length > 0 && (
                    <div className="mt-8">
                      <div className={secT}>Kitchen Tips</div>
                      <div className="flex flex-col gap-3">
                        {recipe.kitchenTips.map((tip, i) => (
                          <div key={i} className="rounded-xl bg-[#F4F7FB] border border-[#D8E2F0] p-4">
                            <div className="text-[0.65rem] font-bold tracking-widest uppercase mb-1.5 text-[#4A6B9E]">{tip.title}</div>
                            <div className="text-[0.9375rem] text-[#3D3028] leading-relaxed">{tip.body}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recipe.watchOuts?.length > 0 && (
                    <div className="mt-8">
                      <div className={secT}>Watch Out For</div>
                      <div className="flex flex-col gap-3">
                        {recipe.watchOuts.map((w, i) => (
                          <div key={i} className="rounded-xl bg-[#FBF5EF] border border-[#F0E6D5] p-4">
                            <div className="text-[0.65rem] font-bold tracking-widest uppercase mb-1.5 text-[#C97B3A]">{w.title}</div>
                            <div className="text-[0.9375rem] text-[#3D3028] leading-relaxed">{w.body}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="p-6 bg-[#FDFAF5]">

                  {/* Servings adjuster */}
                  <div className="flex items-center justify-between rounded-xl border border-[#E5DDD3] bg-white px-4 py-3 mb-5">
                    <span className="text-[0.68rem] font-semibold tracking-widest uppercase text-[#9A8878]">Servings</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setDisplayServings(s => Math.max(MIN_SERVINGS, s - 1))}
                        disabled={displayServings <= MIN_SERVINGS}
                        className="w-7 h-7 rounded-lg border border-[#E5DDD3] bg-white text-[#7A6B5E] flex items-center justify-center font-bold cursor-pointer hover:border-[#C5B9AD] hover:text-[#1A1208] transition-all duration-150 disabled:text-[#C5B9AD] disabled:cursor-not-allowed font-[inherit]"
                      >−</button>
                      <span className="text-lg font-bold min-w-[2ch] text-center text-[#1A1208]">{displayServings}</span>
                      <button
                        onClick={() => setDisplayServings(s => Math.min(MAX_SERVINGS, s + 1))}
                        disabled={displayServings >= MAX_SERVINGS}
                        className="w-7 h-7 rounded-lg border border-[#E5DDD3] bg-white text-[#7A6B5E] flex items-center justify-center font-bold cursor-pointer hover:border-[#C5B9AD] hover:text-[#1A1208] transition-all duration-150 disabled:text-[#C5B9AD] disabled:cursor-not-allowed font-[inherit]"
                      >+</button>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className={`${secT} flex items-center justify-between`}>
                    <span>Ingredients</span>
                    {ratio !== 1 && <span className="text-[0.62rem] text-[#9A8878] font-normal normal-case tracking-normal">×{formatNum(ratio)}</span>}
                  </div>
                  <div className="flex flex-col">
                    {(recipe.ingredients || []).map((ing, i) => (
                      <div key={i} className="py-2.5 border-b border-[#EDE8E0] last:border-0 text-[0.9375rem] text-[#3D3028] leading-relaxed flex items-baseline gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2C5F4A] shrink-0 mt-[0.45rem]"></span>
                        {scaleIngredient(ing, ratio)}
                      </div>
                    ))}
                  </div>

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
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1208] text-white rounded-full px-6 py-3 text-[0.68rem] font-bold tracking-widest uppercase z-[300] animate-toast whitespace-nowrap shadow-lg"
        >
          {savedToast}
        </div>
      )}

      {/* Bottom sheets (mobile) */}
      {Object.entries(sheetMap).map(([id, { title, content }]) => (
        <BottomSheet key={id} open={activeSheet === id} onClose={() => setActiveSheet(null)} title={title}>
          {content}
          <button
            onClick={() => setActiveSheet(null)}
            className="w-full mt-5 py-3.5 rounded-2xl text-[0.7rem] font-bold tracking-widest uppercase cursor-pointer font-[inherit] transition-all duration-150 bg-[#2C5F4A] text-white shadow-md hover:bg-[#1E4433]"
          >Done</button>
        </BottomSheet>
      ))}

      {cookingMode && recipe && (
        <CookingMode
          steps={recipe.steps || []}
          onClose={() => setCookingMode(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-[#E5DDD3] py-10 px-6 text-center">
        <p className="text-[0.75rem] font-medium text-[#9A8878] mb-1">
          Questions or feedback?{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="underline underline-offset-2 text-[#2C5F4A] hover:text-[#1E4433] transition-colors"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-[0.65rem] leading-relaxed text-[#B5A898] max-w-xl mx-auto mt-3">
          Karigar is provided for informational and entertainment purposes only. Recipes are AI-generated and may
          contain errors — always verify ingredients, quantities, cooking temperatures, and techniques before
          preparing food. Karigar is not responsible for adverse reactions, dietary harm, or any outcomes
          resulting from use of generated content. Allergen information is indicative only and must not replace
          professional dietary or medical advice.
        </p>
        <p className="text-[0.6rem] text-[#9A8878] mt-3">
          © {new Date().getFullYear()} Karigar. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
