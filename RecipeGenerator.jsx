import { useState, useEffect, useCallback, useMemo } from "react";

// ── App-level constants ───────────────────────────────────────────────────────
/** Largest allowed displayed-servings value. */
const MAX_SERVINGS    = 200;
/** Smallest allowed displayed-servings value. */
const MIN_SERVINGS    = 1;
/** Duration (ms) the save/delete toast notification is visible. */
const TOAST_DURATION_MS = 2200;
/** Delay (ms) before hiding the bottom sheet after close animation. */
const SHEET_CLOSE_DELAY_MS = 380;

// ── Data ──────────────────────────────────────────────────────────────────────
import { CUISINES }                      from "./src/data/cuisines.js";
import { FLAVORS }                       from "./src/data/flavors.js";
import { DIETS }                         from "./src/data/diets.js";
import { METHODS, SERVING_PRESETS, PRO_BATCH_PRESETS } from "./src/data/methods.js";
import { ALLERGENS }                     from "./src/data/allergens.js";

// ── Utilities ─────────────────────────────────────────────────────────────────
import { formatNum }                     from "./src/utils/formatNum.js";
import { scaleIngredient }               from "./src/utils/scaleIngredient.js";
// ── API ───────────────────────────────────────────────────────────────────────
import { generateRecipe }                from "./src/api/recipeApi.js";

// ── Hooks ─────────────────────────────────────────────────────────────────────
import { useFavorites }                  from "./src/hooks/useFavorites.js";

// ── Export ────────────────────────────────────────────────────────────────────
import { exportProPDF }                  from "./src/export/exportProPDF.js";
import { exportHomePDF }                 from "./src/export/exportHomePDF.js";

// ── Components ────────────────────────────────────────────────────────────────
import { IngredientTags }                from "./src/components/IngredientTags.jsx";
import { BottomSheet }                   from "./src/components/BottomSheet.jsx";
import { NutritionBar }                  from "./src/components/NutritionBar.jsx";
import { AllergenMatrix }                from "./src/components/AllergenMatrix.jsx";
import { MiseEnPlace }                   from "./src/components/MiseEnPlace.jsx";
import { FavoritesPanel }               from "./src/components/FavoritesPanel.jsx";
import { ProFieldsPanel }               from "./src/components/ProFieldsPanel.jsx";

// ─────────────────────────────────────────────────────────────────────────────
export default function RecipeGenerator() {
  // ── State ───────────────────────────────────────────────────────────────────
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
  const [activeProTab, setActiveProTab]       = useState("recipe"); // recipe | allergens | mise
  // BP-15: sessionStorage limits API key exposure to the current browser session
  const [apiKey, setApiKey]   = useState(() => sessionStorage.getItem("flavorlab_key") || "");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Toast ─────────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(""), TOAST_DURATION_MS); // BP-18
  }, []);

  // ── Favorites helpers ────────────────────────────────────────────────────────
  const { favorites, isFav, setIsFav, toggleFav, loadFavorite, deleteFavorite } = useFavorites({
    showToast,
    setRecipe, setNutrition, setAllergens, setIngredientTags,
    setBaseServings, setDisplayServings, setProMode, setTab,
  });

  const toggle = useCallback((val, list, setList) => {
    setList(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val]);
  }, []);

  // ── Generate ─────────────────────────────────────────────────────────────────
  const generate = async () => {
    if (ingredientTags.length === 0) { setError("Please add at least one ingredient."); return; }
    // BP-17: validate API key BEFORE setLoading(true) — prevents spinner sticking on early return
    if (!apiKey.trim()) {
      setError("Please enter your Anthropic API key (click the 🔑 button in the nav).");
      return;
    }
    const cuisine = customCuisine.trim() || selectedCuisine;
    setError(""); setLoading(true); setRecipe(null); setNutrition(null); setAllergens(null); setIsFav(false);
    try {
      const result = await generateRecipe({
        ingredientTags, cuisine, selectedFlavors, selectedDiets, selectedMethod, servings, proMode, apiKey,
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

  // ── Shared styles ─────────────────────────────────────────────────────────────
  const chipSt = (active, color = "#f9c74f") => ({
    padding:"0.4rem 0.9rem", borderRadius:999,
    border:`1.5px solid ${active ? color : "rgba(255,255,255,0.15)"}`,
    background:active ? `${color}28` : "rgba(255,255,255,0.03)",
    color:active ? color : "rgba(255,255,255,0.6)",
    fontSize:"0.82rem", cursor:"pointer", transition:"all 0.18s",
    fontFamily:"inherit", fontWeight:active ? 700 : 400,
  });
  const card    = { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:"1.6rem 1.75rem", marginBottom:"1.25rem", backdropFilter:"blur(8px)" };
  const proCard = { background:"rgba(129,140,248,0.05)", border:"1px solid rgba(129,140,248,0.2)", borderRadius:16, padding:"1.6rem 1.75rem", marginBottom:"1.25rem", backdropFilter:"blur(8px)" };
  const lbl     = { display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.72rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"#f9c74f", fontWeight:700, marginBottom:"0.85rem" };
  const proLbl  = { display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.72rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"#818cf8", fontWeight:700, marginBottom:"0.85rem" };
  const subSt   = { color:"rgba(255,255,255,0.28)", fontWeight:400, letterSpacing:0, textTransform:"none", fontSize:"0.75rem" };
  const secT    = { fontSize:"0.66rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#f3722c", fontWeight:700, marginBottom:"1rem", paddingBottom:"0.5rem", borderBottom:"1px solid rgba(255,255,255,0.08)" };
  const bdg     = (color = "#f9c74f") => ({ display:"inline-block", background:`${color}22`, border:`1px solid ${color}66`, color, fontSize:"0.68rem", letterSpacing:"0.15em", textTransform:"uppercase", padding:"0.22rem 0.7rem", borderRadius:999, fontWeight:700 });

  // ── Shell-local components (tightly coupled to state) ──────────────────────
  const FilterChips = ({ items, selected, onToggle, color, single }) => (
    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem" }}>
      {items.map(item => (
        <button key={item.val} style={chipSt(single ? selected === item.val : selected.includes(item.val), color)}
          onClick={() => single ? onToggle(selected === item.val ? "" : item.val) : onToggle(item.val)}>
          {item.label}
        </button>
      ))}
    </div>
  );

  // BP-12: memoize sheetMap so JSX content isn’t recreated on every render
  const sheetMap = useMemo(() => ({
    cuisine:   { title:"🌍 Cuisine Style",        color:"#f9c74f", content:<>
      <FilterChips items={CUISINES} selected={selectedCuisine} onToggle={v => { setSelectedCuisine(v); setCustomCuisine(""); }} color="#f9c74f" single />
      <input type="text" placeholder="Or type your own..." value={customCuisine} onChange={e => { setCustomCuisine(e.target.value); setSelectedCuisine(""); }} style={{ width:"100%", marginTop:"1rem", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"0.8rem 1rem", color:"#f0ede6", fontSize:"0.9rem", fontFamily:"inherit", outline:"none" }} />
    </> },
    flavor:    { title:"🎨 Flavor Profile",        color:"#f3722c", content:<FilterChips items={FLAVORS} selected={selectedFlavors} onToggle={v => toggle(v, selectedFlavors, setSelectedFlavors)} color="#f3722c" /> },
    diet:      { title:"🥦 Dietary Requirements",  color:"#4ade80", content:<FilterChips items={DIETS}   selected={selectedDiets}   onToggle={v => toggle(v, selectedDiets, setSelectedDiets)}     color="#4ade80" /> },
    method:    { title:"👨‍🍳 Cooking Method",        color:"#818cf8", content:<FilterChips items={METHODS} selected={selectedMethod}  onToggle={setSelectedMethod} color="#818cf8" single /> },
    servings:  { title:"👥 Serving Size",          color:"#f9c74f", content:<>
      <p style={{ fontSize:"0.82rem", color:"rgba(255,255,255,0.4)", marginBottom:"1rem" }}>How many people are you cooking for?</p>
      <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap" }}>
        {(proMode ? PRO_BATCH_PRESETS : SERVING_PRESETS).map(n => (
          <button key={n} onClick={() => setServings(n)} style={{ width:56, height:56, borderRadius:"50%", border:`2px solid ${servings===n?"#f9c74f":"rgba(255,255,255,0.15)"}`, background:servings===n?"rgba(249,199,79,0.2)":"rgba(0,0,0,0.3)", color:servings===n?"#f9c74f":"rgba(255,255,255,0.55)", fontSize:"1rem", fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>{n}</button>
        ))}
      </div>
    </> },
    profields: { title:"⚙️ Recipe Card Details",  color:"#818cf8", content:<ProFieldsPanel proFields={proFields} onChange={setProFields} /> },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [selectedCuisine, customCuisine, selectedFlavors, selectedDiets, selectedMethod, servings, proMode, proFields, toggle]);

  const MobileFilterBar = () => {
    const pills = [
      { id:"cuisine",   icon:"🌍", label:customCuisine||selectedCuisine||"Cuisine",  active:!!(customCuisine||selectedCuisine), color:"#f9c74f" },
      { id:"flavor",    icon:"🎨", label:selectedFlavors.length?`${selectedFlavors.length} flavor${selectedFlavors.length>1?"s":""}`:  "Flavor", active:selectedFlavors.length>0, color:"#f3722c" },
      { id:"diet",      icon:"🥦", label:selectedDiets.length?`${selectedDiets.length} diet${selectedDiets.length>1?"s":""}`:    "Diet",   active:selectedDiets.length>0,   color:"#4ade80" },
      { id:"method",    icon:"👨‍🍳", label:selectedMethod||"Method", active:!!selectedMethod, color:"#818cf8" },
      { id:"servings",  icon:"👥", label:`${servings} ${proMode?"covers":"people"}`, active:true, color:"#f9c74f" },
      ...(proMode ? [{ id:"profields", icon:"⚙️", label:"Card Details", active:!!(proFields.chefName||proFields.station), color:"#818cf8" }] : []),
    ];
    return (
      <div style={{ display:"flex", gap:"0.5rem", overflowX:"auto", paddingBottom:"0.25rem", WebkitOverflowScrolling:"touch" }}>
        {pills.map(p => (
          <button key={p.id} onClick={() => setActiveSheet(p.id)} style={{ display:"flex", alignItems:"center", gap:"0.4rem", padding:"0.45rem 0.9rem", borderRadius:999, flexShrink:0, border:`1.5px solid ${p.active?p.color:"rgba(255,255,255,0.15)"}`, background:p.active?`${p.color}18`:"rgba(255,255,255,0.04)", color:p.active?p.color:"rgba(255,255,255,0.5)", fontSize:"0.78rem", fontWeight:p.active?700:400, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
            <span>{p.icon}</span><span>{p.label}</span><span style={{ opacity:0.5, fontSize:"0.65rem" }}>▾</span>
          </button>
        ))}
      </div>
    );
  };

  const DesktopFilters = () => (<>
    <div style={card}>
      <div style={lbl}>🌍 Cuisine Style</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
        {CUISINES.map(c => <button key={c.val} style={chipSt(selectedCuisine===c.val&&!customCuisine)} onClick={() => { setSelectedCuisine(c.val); setCustomCuisine(""); }}>{c.label}</button>)}
      </div>
      <input type="text" placeholder="Or type your own (e.g. Cajun, Hawaiian...)" value={customCuisine} onChange={e => { setCustomCuisine(e.target.value); setSelectedCuisine(""); }} style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"0.75rem 1rem", color:"#f0ede6", fontSize:"0.9rem", fontFamily:"inherit", outline:"none", marginTop:"0.75rem" }} />
    </div>
    <div style={card}>
      <div style={lbl}>🎨 Flavor Profile <span style={subSt}>(pick any)</span></div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
        {FLAVORS.map(f => <button key={f.val} style={chipSt(selectedFlavors.includes(f.val),"#f3722c")} onClick={() => toggle(f.val, selectedFlavors, setSelectedFlavors)}>{f.label}</button>)}
      </div>
    </div>
    <div style={card}>
      <div style={lbl}>🥦 Dietary Requirements <span style={subSt}>(pick any)</span></div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
        {DIETS.map(d => <button key={d.val} style={chipSt(selectedDiets.includes(d.val),"#4ade80")} onClick={() => toggle(d.val, selectedDiets, setSelectedDiets)}>{d.label}</button>)}
      </div>
    </div>
    <div style={card}>
      <div style={lbl}>👨‍🍳 Cooking Method <span style={subSt}>(pick one)</span></div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
        {METHODS.map(m => <button key={m.val} style={chipSt(selectedMethod===m.val,"#818cf8")} onClick={() => setSelectedMethod(selectedMethod===m.val?"":m.val)}>{m.label}</button>)}
      </div>
    </div>
    {proMode && (
      <div style={proCard}>
        <div style={proLbl}>⚙️ Recipe Card Details <span style={{ ...subSt, color:"rgba(129,140,248,0.5)" }}>(optional)</span></div>
        <ProFieldsPanel proFields={proFields} onChange={setProFields} />
      </div>
    )}
  </>);

  const ProResultTabs = () => {
    const tabs = [{ id:"recipe", label:"📋 Recipe" }, { id:"allergens", label:"⚠️ Allergens" }, { id:"mise", label:"🔪 Mise en Place" }];
    return (
      <div style={{ display:"flex", gap:"0.4rem", padding:"1rem 1.75rem 0", borderBottom:"1px solid rgba(255,255,255,0.08)", background:"rgba(0,0,0,0.15)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveProTab(t.id)} style={{ padding:"0.5rem 1rem", borderRadius:"8px 8px 0 0", border:`1px solid ${activeProTab===t.id?"rgba(255,255,255,0.15)":"transparent"}`, borderBottom:"none", background:activeProTab===t.id?"rgba(255,255,255,0.08)":"transparent", color:activeProTab===t.id?"#f0ede6":"rgba(255,255,255,0.4)", fontSize:"0.78rem", fontWeight:activeProTab===t.id?700:400, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)", fontFamily:"'Segoe UI',system-ui,sans-serif", color:"#f0ede6" }}>
      <style>{`
        @keyframes spin    { to{transform:rotate(360deg);} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        @keyframes toast   { 0%{opacity:0;transform:translate(-50%,12px);}15%{opacity:1;transform:translate(-50%,0);}85%{opacity:1;}100%{opacity:0;} }
        @keyframes tagPop  { from{opacity:0;transform:scale(0.8);}to{opacity:1;transform:scale(1);} }
        @keyframes proGlow { 0%,100%{box-shadow:0 0 0 0 rgba(129,140,248,0.3);}50%{box-shadow:0 0 0 8px rgba(129,140,248,0);} }
        input:focus{border-color:rgba(249,199,79,0.5)!important;box-shadow:0 0 0 3px rgba(249,199,79,0.08);}
        button:not(:disabled):hover{filter:brightness(1.1);}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px;}
        @media(max-width:660px){.rb{grid-template-columns:1fr!important;}.sc{border-right:none!important;border-bottom:1px solid rgba(255,255,255,0.08)!important;}}
      `}</style>

      {/* NAV */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1rem 1.5rem", borderBottom:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(10px)", background:"rgba(0,0,0,0.3)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
          <div style={{ fontSize:"1.4rem", fontWeight:800, background:"linear-gradient(90deg,#f9c74f,#f3722c)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>🍳 FlavorLab</div>
          {proMode && <span style={{ background:"rgba(129,140,248,0.2)", border:"1px solid rgba(129,140,248,0.5)", color:"#818cf8", fontSize:"0.62rem", fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", padding:"0.2rem 0.6rem", borderRadius:4 }}>PRO</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
          {/* BP-08: role=switch+aria-checked on Pro Mode toggle; BP-06: aria-label on key button */}
          <div
            role="switch"
            aria-checked={proMode}
            aria-label="Toggle Pro mode"
            tabIndex={0}
            onKeyDown={e => (e.key === " " || e.key === "Enter") && setProMode(p => !p)}
            style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.3rem 0.75rem", borderRadius:999, background:proMode?"rgba(129,140,248,0.15)":"rgba(255,255,255,0.05)", border:`1px solid ${proMode?"rgba(129,140,248,0.4)":"rgba(255,255,255,0.12)"}`, cursor:"pointer", transition:"all 0.2s", animation:proMode?"proGlow 2s infinite":"none" }} onClick={() => setProMode(p => !p)}>
            <div style={{ width:28, height:16, borderRadius:999, background:proMode?"#818cf8":"rgba(255,255,255,0.15)", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
              <div style={{ position:"absolute", top:2, left:proMode?14:2, width:12, height:12, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.3)" }} />
            </div>
            <span style={{ fontSize:"0.72rem", fontWeight:700, color:proMode?"#818cf8":"rgba(255,255,255,0.4)", whiteSpace:"nowrap" }}>Pro Mode</span>
          </div>
          <button
            onClick={() => setShowKey(p => !p)}
            aria-label={apiKey ? "API key is set — click to change" : "API key needed — click to enter"}
            aria-pressed={showKey}
            style={{ background:apiKey?"rgba(74,222,128,0.12)":"rgba(249,65,68,0.12)", border:`1px solid ${apiKey?"rgba(74,222,128,0.4)":"rgba(249,65,68,0.4)"}`, color:apiKey?"#4ade80":"#f87171", padding:"0.4rem 0.75rem", borderRadius:999, fontSize:"0.8rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            {apiKey ? "🔑" : "🔑 Key needed"}
          </button>
          {["generator","favorites"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              style={{ background:tab===t?"rgba(249,199,79,0.15)":"transparent", border:`1px solid ${tab===t?"rgba(249,199,79,0.4)":"rgba(255,255,255,0.12)"}`, color:tab===t?"#f9c74f":"rgba(255,255,255,0.4)", padding:"0.4rem 0.9rem", borderRadius:999, fontSize:"0.75rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              {t==="generator" ? "✨ Generator" : `♥ Saved${favorites.length?` (${favorites.length})`:""}`}
            </button>
          ))}
        </div>
      </nav>

      {/* Pro Mode Banner */}
      {showKey && (
        <div style={{ background:"rgba(0,0,0,0.5)", borderBottom:"1px solid rgba(255,255,255,0.1)", padding:"0.75rem 1.5rem", display:"flex", alignItems:"center", gap:"0.75rem", animation:"fadeUp 0.2s ease" }}>
          {/* BP-09: proper label on the API key input */}
          <label htmlFor="api-key-input" style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.4)", whiteSpace:"nowrap", flexShrink:0 }}>🔑 Anthropic API Key</label>
          <input
            id="api-key-input"
            type="password"
            value={apiKey}
            onChange={e => {
              setApiKey(e.target.value);
              sessionStorage.setItem("flavorlab_key", e.target.value); // BP-15: sessionStorage
            }}
            placeholder="sk-ant-..."
            style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, padding:"0.45rem 0.9rem", color:"#f0ede6", fontSize:"0.85rem", fontFamily:"inherit", outline:"none" }}
          />
          <button onClick={() => setShowKey(false)} aria-label="Close API key panel" style={{ background:"none", border:"none", color:"rgba(255,255,255,0.35)", fontSize:"1rem", cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>✕</button>
          <span style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.22)", whiteSpace:"nowrap" }}>Get one free at aistudio.google.com · Stored for this session only</span>
        </div>
      )}
      {proMode && (
        <div style={{ background:"linear-gradient(90deg,rgba(129,140,248,0.12),rgba(99,102,241,0.08))", borderBottom:"1px solid rgba(129,140,248,0.2)", padding:"0.6rem 1.5rem", display:"flex", alignItems:"center", gap:"0.75rem", animation:"fadeUp 0.3s ease" }}>
          <span style={{ fontSize:"1rem" }}>👨‍🍳</span>
          <div>
            <span style={{ fontSize:"0.78rem", fontWeight:700, color:"#818cf8" }}>Professional Kitchen Mode</span>
            <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.35)", marginLeft:"0.5rem" }}>Metric weights · Mise en place · HACCP notes · Allergen matrix · Pro recipe card PDF</span>
          </div>
        </div>
      )}

      <div style={{ maxWidth:940, margin:"0 auto", padding:"2rem 1.25rem 5rem" }}>

        {/* FAVORITES */}
        {tab === "favorites" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <h2 style={{ fontSize:"1.5rem", fontWeight:800, marginBottom:"1.5rem" }}>♥ Saved Recipes</h2>
            <FavoritesPanel favorites={favorites} onLoad={loadFavorite} onDelete={deleteFavorite} />
          </div>
        )}

        {/* GENERATOR */}
        {tab === "generator" && (<>
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <h1 style={{ fontSize:"clamp(1.9rem,5vw,3.2rem)", fontWeight:800, lineHeight:1.15, marginBottom:"0.5rem" }}>
              {proMode
                ? <>Professional <span style={{ background:"linear-gradient(90deg,#818cf8,#6366f1)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>kitchen-grade</span><br />recipe generation.</>
                : <>Any ingredients, <span style={{ background:"linear-gradient(90deg,#f9c74f,#f3722c,#f94144)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>any cuisine,</span><br />any craving.</>}
            </h1>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.95rem" }}>
              {proMode ? "Metric weights, mise en place, HACCP notes, and full allergen matrix." : "Tell us what you have. We'll craft the perfect recipe."}
            </p>
          </div>

          <div style={card}>
            <div style={lbl}>
              🧺 {proMode ? "Kitchen Inventory" : "Your Ingredients"}
              {ingredientTags.length > 0 && (
                <span style={{ marginLeft:"auto", background:"rgba(249,199,79,0.15)", border:"1px solid rgba(249,199,79,0.3)", color:"#f9c74f", borderRadius:999, padding:"0.15rem 0.6rem", fontSize:"0.7rem", fontWeight:700 }}>
                  {ingredientTags.length} added
                </span>
              )}
            </div>
            <IngredientTags tags={ingredientTags} onChange={setIngredientTags} />
          </div>

          {/* SERVING SIZE */}
          <div style={card}>
            <div style={lbl}>👥 {proMode ? "Covers / Yield" : "Serving Size"}</div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", flexWrap:"wrap" }}>
              {(proMode ? PRO_BATCH_PRESETS : SERVING_PRESETS).map(n => (
                <button key={n} onClick={() => setServings(n)} style={{ width:44, height:44, borderRadius:"50%", border:`1.5px solid ${servings===n?(proMode?"#818cf8":"#f9c74f"):"rgba(255,255,255,0.15)"}`, background:servings===n?(proMode?"rgba(129,140,248,0.2)":"rgba(249,199,79,0.2)"):"rgba(0,0,0,0.3)", color:servings===n?(proMode?"#818cf8":"#f9c74f"):"rgba(255,255,255,0.5)", fontSize:"0.88rem", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>{n}</button>
              ))}
              <span style={{ fontSize:"0.8rem", color:"rgba(255,255,255,0.35)" }}>{proMode ? "covers" : "people"}</span>
            </div>
          </div>

          {isMobile ? (
            <div style={card}>
              <div style={lbl}>⚙️ Preferences</div>
              <MobileFilterBar />
              <p style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.25)", marginTop:"0.5rem" }}>Tap a pill to open options ↑</p>
            </div>
          ) : <DesktopFilters />}

          <button disabled={loading} onClick={generate} style={{ width:"100%", padding:"1.1rem", borderRadius:12, border:"none", background:loading?"rgba(255,255,255,0.08)":proMode?"linear-gradient(135deg,#818cf8,#6366f1)":"linear-gradient(135deg,#f9c74f,#f3722c)", color:loading?"rgba(255,255,255,0.35)":"#fff", fontSize:"0.9rem", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.6rem", transition:"all 0.2s", fontFamily:"inherit" }}>
            {loading
              ? <><span style={{ width:18, height:18, border:"2.5px solid rgba(255,255,255,0.15)", borderTopColor:"rgba(255,255,255,0.6)", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }} /> {proMode ? "Generating professional recipe…" : "Crafting your recipe…"}</>
              : (proMode ? "👨‍🍳 Generate Professional Recipe" : "✨ Generate My Recipe")}
          </button>

          {error && <div style={{ background:"rgba(249,65,68,0.12)", border:"1px solid rgba(249,65,68,0.4)", borderRadius:10, padding:"0.9rem 1.2rem", color:"#f94144", fontSize:"0.88rem", marginTop:"1rem" }}>⚠️ {error}</div>}

          {/* RESULT */}
          {recipe && (
            <div id="result-anchor" style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${proMode?"rgba(129,140,248,0.2)":"rgba(255,255,255,0.1)"}`, borderRadius:16, overflow:"hidden", marginTop:"2rem", animation:"fadeUp 0.5s ease" }}>

              {/* Result header */}
              <div style={{ background:proMode?"linear-gradient(135deg,rgba(129,140,248,0.15),rgba(99,102,241,0.08))":"linear-gradient(135deg,rgba(249,199,79,0.15),rgba(243,114,44,0.1))", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"1.75rem" }}>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", marginBottom:"0.75rem" }}>
                  {recipe.badge    && <span style={bdg(proMode?"#818cf8":"#f9c74f")}>{recipe.badge}</span>}
                  {proMode         && <span style={bdg("#818cf8")}>PRO</span>}
                  {selectedDiets.map(d  => <span key={d}  style={bdg("#4ade80")}>{d}</span>)}
                  {selectedMethod  && <span style={bdg("#818cf8")}>{selectedMethod}</span>}
                </div>
                <div style={{ fontSize:"clamp(1.5rem,4vw,2.4rem)", fontWeight:800, marginBottom:"0.5rem", lineHeight:1.2 }}>{recipe.title}</div>
                <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.95rem", lineHeight:1.7, fontStyle:"italic", marginBottom:"1rem" }}>{recipe.intro}</p>
                {ingredientTags.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.3rem", marginBottom:"1.1rem" }}>
                    {ingredientTags.map((t, i) => {
                      const colors = [["rgba(249,199,79,0.15)","rgba(249,199,79,0.35)","#f9c74f"],["rgba(243,114,44,0.15)","rgba(243,114,44,0.35)","#f3722c"],["rgba(129,140,248,0.15)","rgba(129,140,248,0.35)","#818cf8"],["rgba(74,222,128,0.15)","rgba(74,222,128,0.35)","#4ade80"]];
                      const [bg, border, color] = colors[i % colors.length];
                      return <span key={t} style={{ fontSize:"0.7rem", background:bg, border:`1px solid ${border}`, color, borderRadius:999, padding:"0.15rem 0.55rem", fontWeight:600 }}>{t}</span>;
                    })}
                  </div>
                )}
                <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap" }}>
                  <button onClick={() => toggleFav(recipe, nutrition, allergens, ingredientTags, proMode)} style={{ display:"flex", alignItems:"center", gap:"0.4rem", padding:"0.5rem 1rem", borderRadius:999, border:`1.5px solid ${isFav?"#f94144":"rgba(255,255,255,0.2)"}`, background:isFav?"rgba(249,65,68,0.15)":"rgba(255,255,255,0.06)", color:isFav?"#f94144":"rgba(255,255,255,0.7)", fontSize:"0.8rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                    {isFav ? "♥ Saved" : "♡ Save Recipe"}
                  </button>
                  <button onClick={() => {
                    setExportingPDF(true);
                    if (proMode) exportProPDF(recipe, ingredientTags, nutrition, allergens, displayServings, ratio, proFields);
                    else exportHomePDF(recipe, ingredientTags, nutrition, displayServings, ratio);
                    setTimeout(() => setExportingPDF(false), 1000);
                  }} style={{ display:"flex", alignItems:"center", gap:"0.4rem", padding:"0.5rem 1rem", borderRadius:999, border:`1.5px solid ${proMode?"rgba(129,140,248,0.4)":"rgba(255,255,255,0.2)"}`, background:proMode?"rgba(129,140,248,0.12)":"rgba(255,255,255,0.06)", color:proMode?"#818cf8":"rgba(255,255,255,0.7)", fontSize:"0.8rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                    {exportingPDF ? "⏳ Opening…" : (proMode ? "📋 Pro Recipe Card PDF" : "📄 Export PDF")}
                  </button>
                </div>
              </div>

              {proMode && <ProResultTabs />}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 300px" }} className="rb">
                {/* Main column */}
                <div style={{ padding:"1.75rem", borderRight:"1px solid rgba(255,255,255,0.08)" }} className="sc">
                  {proMode && activeProTab === "mise"     && <MiseEnPlace items={recipe.miseEnPlace} />}
                  {proMode && activeProTab === "allergens" && <AllergenMatrix allergens={allergens} />}

                  {(!proMode || activeProTab === "recipe") && (<>
                    <div style={secT}>Method</div>
                    {(recipe.steps || []).map((step, i) => (
                      <div key={i} style={{ display:"flex", gap:"1rem", marginBottom:"1.2rem", paddingBottom:"1.2rem", borderBottom:i===recipe.steps.length-1?"none":"1px solid rgba(255,255,255,0.06)", alignItems:"flex-start" }}>
                        <div style={{ minWidth:28, height:28, background:proMode?"linear-gradient(135deg,#818cf8,#6366f1)":"linear-gradient(135deg,#f9c74f,#f3722c)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", fontWeight:800, color:"#fff", flexShrink:0, marginTop:2 }}>{i + 1}</div>
                        <div style={{ fontSize:"0.9rem", lineHeight:1.7, color:"rgba(255,255,255,0.82)" }}>{step}</div>
                      </div>
                    ))}
                    {recipe.tips && (
                      <div style={{ background:"rgba(243,114,44,0.08)", border:"1px solid rgba(243,114,44,0.25)", borderRadius:10, padding:"1rem", marginTop:"1.5rem", fontSize:"0.85rem", color:"rgba(255,255,255,0.7)", lineHeight:1.65 }}>
                        <div style={{ fontSize:"0.62rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"#f3722c", fontWeight:700, marginBottom:"0.4rem" }}>💡 Chef's Tip</div>
                        {recipe.tips}
                      </div>
                    )}
                    {recipe.proTips?.length > 0 && (
                      <div style={{ marginTop:"2rem" }}>
                        <div style={secT}>💡 Pro Tips</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                          {recipe.proTips.map((tip, i) => (
                            <div key={i} style={{ display:"flex", gap:"0.9rem", alignItems:"flex-start", background:"rgba(249,199,79,0.06)", border:"1px solid rgba(249,199,79,0.15)", borderRadius:12, padding:"1rem 1.1rem" }}>
                              <span style={{ fontSize:"1.3rem", flexShrink:0, lineHeight:1, marginTop:"0.1rem" }}>{tip.icon || "💡"}</span>
                              <div>
                                <div style={{ fontSize:"0.82rem", fontWeight:700, color:"#f9c74f", marginBottom:"0.3rem" }}>{tip.title}</div>
                                <div style={{ fontSize:"0.85rem", color:"rgba(255,255,255,0.68)", lineHeight:1.65 }}>{tip.body}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {recipe.watchOuts?.length > 0 && (
                      <div style={{ marginTop:"1.75rem" }}>
                        <div style={{ ...secT, color:"#f94144", borderBottomColor:"rgba(249,65,68,0.15)" }}>⚠️ What to Watch Out For</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                          {recipe.watchOuts.map((w, i) => (
                            <div key={i} style={{ display:"flex", gap:"0.9rem", alignItems:"flex-start", background:"rgba(249,65,68,0.06)", border:"1px solid rgba(249,65,68,0.18)", borderRadius:12, padding:"1rem 1.1rem" }}>
                              <span style={{ fontSize:"1.3rem", flexShrink:0, lineHeight:1, marginTop:"0.1rem" }}>{w.icon || "⚠️"}</span>
                              <div>
                                <div style={{ fontSize:"0.82rem", fontWeight:700, color:"#f87171", marginBottom:"0.3rem" }}>{w.title}</div>
                                <div style={{ fontSize:"0.85rem", color:"rgba(255,255,255,0.65)", lineHeight:1.65 }}>{w.body}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {proMode && recipe.haccp?.length > 0 && (
                      <div style={{ marginTop:"1.75rem" }}>
                        <div style={{ ...secT, color:"#7c3aed", borderBottomColor:"rgba(124,58,237,0.15)" }}>🛡️ HACCP / Food Safety</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                          {recipe.haccp.map((h, i) => (
                            <div key={i} style={{ display:"flex", gap:"0.75rem", alignItems:"flex-start", background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.18)", borderRadius:10, padding:"0.85rem 1rem", fontSize:"0.83rem", color:"rgba(255,255,255,0.7)", lineHeight:1.6 }}>
                              <span style={{ flexShrink:0, marginTop:"0.1rem" }}>⚠️</span>{h}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>)}
                </div>

                {/* Sidebar */}
                <div style={{ padding:"1.75rem" }}>
                  {/* Scaler */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:proMode?"rgba(129,140,248,0.07)":"rgba(249,199,79,0.07)", border:`1px solid ${proMode?"rgba(129,140,248,0.2)":"rgba(249,199,79,0.2)"}`, borderRadius:10, padding:"0.65rem 1rem", marginBottom:"1.25rem" }}>
                    <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{proMode ? "Covers" : "Servings"}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.65rem" }}>
                      <button onClick={() => setDisplayServings(s => Math.max(1, s - 1))} style={{ width:28, height:28, borderRadius:"50%", border:`1px solid ${proMode?"rgba(129,140,248,0.4)":"rgba(249,199,79,0.4)"}`, background:"transparent", color:proMode?"#818cf8":"#f9c74f", fontSize:"1.1rem", fontWeight:700, cursor:displayServings<=1?"not-allowed":"pointer", opacity:displayServings<=1?0.3:1, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>−</button>
                      <span style={{ fontSize:"1.1rem", fontWeight:800, color:proMode?"#818cf8":"#f9c74f", minWidth:24, textAlign:"center" }}>{displayServings}</span>
                      <button onClick={() => setDisplayServings(s => Math.min(200, s + 1))} style={{ width:28, height:28, borderRadius:"50%", border:`1px solid ${proMode?"rgba(129,140,248,0.4)":"rgba(249,199,79,0.4)"}`, background:"transparent", color:proMode?"#818cf8":"#f9c74f", fontSize:"1.1rem", fontWeight:700, cursor:displayServings>=200?"not-allowed":"pointer", opacity:displayServings>=200?0.3:1, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>+</button>
                    </div>
                  </div>

                  {/* Meta */}
                  {recipe.meta && (<>
                    <div style={secT}>At a Glance</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.55rem", marginBottom:"1.5rem" }}>
                      {[["⏱ Prep",recipe.meta.prep],["🔥 Cook",recipe.meta.cook],["📊 Level",recipe.meta.difficulty],["👨‍🍳 Method",recipe.meta.method||selectedMethod||"—"]].map(([k,v]) => (
                        <div key={k} style={{ background:"rgba(0,0,0,0.25)", borderRadius:10, padding:"0.7rem", textAlign:"center" }}>
                          <div style={{ fontSize:"0.56rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", marginBottom:"0.2rem" }}>{k}</div>
                          <div style={{ fontSize:"0.82rem", fontWeight:700, color:proMode?"#818cf8":"#f9c74f" }}>{v || "—"}</div>
                        </div>
                      ))}
                    </div>
                  </>)}

                  {/* Ingredients */}
                  <div style={{ ...secT, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    Ingredients {ratio !== 1 && <span style={{ color:proMode?"#818cf8":"#f9c74f", fontSize:"0.7rem" }}>×{formatNum(ratio)}</span>}
                  </div>
                  {(recipe.ingredients || []).map((ing, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"0.5rem", padding:"0.45rem 0", borderBottom:i===recipe.ingredients.length-1?"none":"1px solid rgba(255,255,255,0.06)", fontSize:"0.83rem", color:"rgba(255,255,255,0.78)", lineHeight:1.5 }}>
                      <div style={{ width:5, height:5, borderRadius:"50%", background:proMode?"#818cf8":"#f9c74f", marginTop:6, flexShrink:0 }} />
                      {scaleIngredient(ing, ratio)}
                    </div>
                  ))}

                  {/* Allergen quick summary — pro sidebar */}
                  {proMode && allergens && (
                    <div style={{ marginTop:"1.5rem" }}>
                      <div style={{ ...secT, color:"#f94144", borderBottomColor:"rgba(249,65,68,0.15)" }}>⚠️ Allergens</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"0.3rem", marginBottom:"0.5rem" }}>
                        {ALLERGENS.map(a => {
                          const hit = allergens.find(x => x.id === a.id);
                          if (!hit?.present && !hit?.mayContain) return null;
                          return (
                            <span key={a.id} style={{ fontSize:"0.7rem", background:hit.present?"rgba(249,65,68,0.15)":"rgba(249,199,79,0.1)", border:`1px solid ${hit.present?"rgba(249,65,68,0.4)":"rgba(249,199,79,0.3)"}`, color:hit.present?"#f87171":"#f9c74f", borderRadius:6, padding:"0.2rem 0.5rem", fontWeight:600 }}>
                              {a.icon} {a.label}
                            </span>
                          );
                        })}
                      </div>
                      <button onClick={() => setActiveProTab("allergens")} style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:0, textDecoration:"underline" }}>View full allergen matrix →</button>
                    </div>
                  )}

                  {/* Nutrition */}
                  {nutrition && (<>
                    <div style={{ ...secT, marginTop:"1.5rem" }}>Nutrition <span style={{ color:"rgba(255,255,255,0.25)", fontWeight:400, textTransform:"none", letterSpacing:0, fontSize:"0.7rem" }}>per serving</span></div>
                    <div style={{ background:proMode?"rgba(129,140,248,0.08)":"rgba(249,199,79,0.08)", border:`1px solid ${proMode?"rgba(129,140,248,0.2)":"rgba(249,199,79,0.2)"}`, borderRadius:10, padding:"0.75rem 1rem", marginBottom:"1rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Calories</span>
                      <span style={{ fontSize:"1.4rem", fontWeight:800, color:proMode?"#818cf8":"#f9c74f" }}>{nutrition.calories}<span style={{ fontSize:"0.7rem", fontWeight:400, color:"rgba(255,255,255,0.4)", marginLeft:3 }}>kcal</span></span>
                    </div>
                    <NutritionBar label="Protein"       value={nutrition.protein} unit="g"  max={60}   color="#4ade80" />
                    <NutritionBar label="Carbohydrates" value={nutrition.carbs}   unit="g"  max={100}  color="#818cf8" />
                    <NutritionBar label="Fat"           value={nutrition.fat}     unit="g"  max={60}   color="#f3722c" />
                    <NutritionBar label="Fiber"         value={nutrition.fiber}   unit="g"  max={30}   color="#34d399" />
                    <NutritionBar label="Sodium"        value={nutrition.sodium}  unit="mg" max={2300} color="#fb923c" />
                    {nutrition.note && <p style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.22)", marginTop:"0.75rem", lineHeight:1.5 }}>ⓘ {nutrition.note}</p>}
                  </>)}
                </div>
              </div>
            </div>
          )}
        </>)}
      </div>

      {/* Toast — BP-07: role=status + aria-live so screen readers announce saves/deletes */}
      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          style={{ position:"fixed", bottom:"2rem", left:"50%", transform:"translateX(-50%)", background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.5)", color:"#4ade80", padding:"0.75rem 1.5rem", borderRadius:999, fontSize:"0.88rem", fontWeight:700, zIndex:300, animation:"toast 2.2s ease forwards", backdropFilter:"blur(10px)", whiteSpace:"nowrap" }}>
          {savedToast}
        </div>
      )}

      {/* Bottom Sheets */}
      {Object.entries(sheetMap).map(([id, { title, color, content }]) => (
        <BottomSheet key={id} open={activeSheet === id} onClose={() => setActiveSheet(null)} title={title} color={color}>
          {content}
          <button onClick={() => setActiveSheet(null)} style={{ width:"100%", marginTop:"1.5rem", padding:"0.9rem", borderRadius:12, border:"none", background:proMode?"linear-gradient(135deg,#818cf8,#6366f1)":"linear-gradient(135deg,#f9c74f,#f3722c)", color:"#fff", fontSize:"0.88rem", fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", fontFamily:"inherit" }}>Done</button>
        </BottomSheet>
      ))}
    </div>
  );
}
