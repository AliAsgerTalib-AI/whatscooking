/**
 * IngredientTags — tokenised multi-value ingredient input with autocomplete.
 *
 * @param {{ tags: string[], onChange: (tags: string[]) => void }} props
 */
import { useState, useRef, useCallback, useMemo } from "react";
import { SUGGESTIONS } from "../data/suggestions.js";

const TAG_COLORS = [
  { bg:"rgba(249,199,79,0.18)",  border:"rgba(249,199,79,0.5)",  text:"#f9c74f" },
  { bg:"rgba(243,114,44,0.18)",  border:"rgba(243,114,44,0.5)",  text:"#f3722c" },
  { bg:"rgba(129,140,248,0.18)", border:"rgba(129,140,248,0.5)", text:"#818cf8" },
  { bg:"rgba(74,222,128,0.18)",  border:"rgba(74,222,128,0.5)",  text:"#4ade80" },
  { bg:"rgba(251,146,60,0.18)",  border:"rgba(251,146,60,0.5)",  text:"#fb923c" },
  { bg:"rgba(52,211,153,0.18)",  border:"rgba(52,211,153,0.5)",  text:"#34d399" },
];

// Quick-add defaults shown when the field is empty
const QUICK_ADD = [
  "chicken breast","garlic","onion","rice","pasta","eggs",
  "salmon","tofu","tomato","mushrooms","ginger","butter",
];

export function IngredientTags({ tags, onChange }) {
  const [input, setInput]               = useState("");
  const [focused, setFocused]           = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef(null);

  // BP-11: memoize filtered suggestions so the array isn't rebuilt on every render
  const tagsLower  = useMemo(() => tags.map(t => t.toLowerCase()), [tags]);
  const filtered   = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return SUGGESTIONS
      .filter(s => s.toLowerCase().includes(q) && !tagsLower.includes(s.toLowerCase()))
      .slice(0, 8);
  }, [input, tagsLower]);

  // BP-01: useCallback so the function reference is stable and won't trigger
  // unnecessary re-renders of consumers or stale closures in event handlers.
  const addTag = useCallback((val) => {
    const clean = val.trim().replace(/,+$/, "").trim();
    if (!clean) return;
    const parts   = clean.split(",").map(p => p.trim()).filter(Boolean);
    const newTags = parts.filter(p => !tagsLower.includes(p.toLowerCase()));
    if (newTags.length) onChange([...tags, ...newTags]);
    setInput(""); setHighlightIdx(-1);
    inputRef.current?.focus();
  }, [tags, tagsLower, onChange]);

  const removeTag = useCallback((i) => {
    onChange(tags.filter((_, idx) => idx !== i));
    inputRef.current?.focus();
  }, [tags, onChange]);

  const onKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (highlightIdx >= 0 && filtered[highlightIdx]) addTag(filtered[highlightIdx]);
      else if (input.trim()) addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    } else if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if  (e.key === "ArrowUp")   { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, -1)); }
    else if  (e.key === "Escape")    { setInput(""); setHighlightIdx(-1); }
  }, [highlightIdx, filtered, input, tags, onChange, addTag]);

  return (
    <div style={{ position:"relative" }}>
      {/* BP-08: aria-pressed not needed here; this is a combobox pattern */}
      <div
        role="combobox"
        aria-expanded={focused && filtered.length > 0}
        aria-haspopup="listbox"
        aria-controls="ingredient-listbox"
        aria-label="Ingredient input"
        onClick={() => inputRef.current?.focus()}
        style={{ minHeight:56, background:"rgba(0,0,0,0.3)", border:`1.5px solid ${focused?"rgba(249,199,79,0.5)":"rgba(255,255,255,0.15)"}`, borderRadius:12, padding:"0.5rem 0.75rem", display:"flex", flexWrap:"wrap", gap:"0.4rem", alignItems:"center", cursor:"text", transition:"border-color 0.2s, box-shadow 0.2s", boxShadow:focused?"0 0 0 3px rgba(249,199,79,0.08)":"none" }}
      >
        {/* BP-02: tag text is the stable key (tags must be unique within this component) */}
        {tags.map((tag, i) => {
          const c = TAG_COLORS[i % TAG_COLORS.length];
          return (
            <span key={tag} style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem", background:c.bg, border:`1px solid ${c.border}`, color:c.text, borderRadius:999, padding:"0.28rem 0.55rem 0.28rem 0.7rem", fontSize:"0.82rem", fontWeight:600, lineHeight:1, animation:"tagPop 0.18s ease" }}>
              {tag}
              {/* BP-06: aria-label on the remove button */}
              <button
                onClick={e => { e.stopPropagation(); removeTag(i); }}
                aria-label={`Remove ${tag}`}
                style={{ background:"none", border:"none", color:c.text, cursor:"pointer", fontSize:"0.9rem", lineHeight:1, padding:"0 0.1rem", opacity:0.7, fontFamily:"inherit", display:"flex", alignItems:"center" }}
              >×</button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          id="ingredient-input"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="ingredient-listbox"
          aria-activedescendant={highlightIdx >= 0 ? `ingredient-option-${highlightIdx}` : undefined}
          value={input}
          onChange={e => { setInput(e.target.value); setHighlightIdx(-1); }}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={tags.length === 0 ? "Type an ingredient and press Enter or comma…" : "Add more…"}
          style={{ flex:"1 1 120px", minWidth:120, background:"none", border:"none", outline:"none", color:"#f0ede6", fontSize:"0.9rem", fontFamily:"inherit", padding:"0.25rem" }}
        />
      </div>

      {focused && filtered.length > 0 && (
        <div
          id="ingredient-listbox"
          role="listbox"
          aria-label="Ingredient suggestions"
          style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"#1e1b3a", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, overflow:"hidden", zIndex:50, boxShadow:"0 8px 32px rgba(0,0,0,0.5)", animation:"fadeUp 0.15s ease" }}
        >
          {filtered.map((s, i) => {
            const idx = s.toLowerCase().indexOf(input.toLowerCase());
            return (
              <div
                key={s}
                id={`ingredient-option-${i}`}
                role="option"
                aria-selected={i === highlightIdx}
                onMouseDown={() => addTag(s)}
                style={{ padding:"0.65rem 1rem", cursor:"pointer", fontSize:"0.88rem", background:i===highlightIdx?"rgba(249,199,79,0.12)":"transparent", color:i===highlightIdx?"#f9c74f":"rgba(255,255,255,0.75)", borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,0.06)":"none", display:"flex", alignItems:"center", gap:"0.5rem" }}
              >
                <span style={{ opacity:0.4, fontSize:"0.75rem" }}>+</span>
                {idx === -1
                  ? s
                  : <>{s.slice(0,idx)}<strong style={{ color:"#f9c74f", fontWeight:700 }}>{s.slice(idx,idx+input.length)}</strong>{s.slice(idx+input.length)}</>
                }
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"0.55rem" }}>
        <p style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.25)", margin:0 }}>
          Press <kbd style={{ background:"rgba(255,255,255,0.08)", borderRadius:4, padding:"0.1rem 0.35rem", fontSize:"0.65rem", fontFamily:"inherit" }}>Enter</kbd> or <kbd style={{ background:"rgba(255,255,255,0.08)", borderRadius:4, padding:"0.1rem 0.35rem", fontSize:"0.65rem", fontFamily:"inherit" }}>,</kbd> to add · <kbd style={{ background:"rgba(255,255,255,0.08)", borderRadius:4, padding:"0.1rem 0.35rem", fontSize:"0.65rem", fontFamily:"inherit" }}>⌫</kbd> to remove last
        </p>
        {tags.length > 0 && (
          <button
            onClick={() => onChange([])}
            aria-label="Clear all ingredients"
            style={{ background:"none", border:"none", color:"rgba(255,255,255,0.25)", fontSize:"0.7rem", cursor:"pointer", fontFamily:"inherit", padding:0 }}
          >clear all</button>
        )}
      </div>

      {tags.length === 0 && !input && (
        <div style={{ marginTop:"0.85rem" }}>
          <p style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.25)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"0.5rem" }}>Quick add</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem" }}>
            {QUICK_ADD.map(s => (
              <button
                key={s}
                onMouseDown={() => addTag(s)}
                aria-label={`Quick add ${s}`}
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", borderRadius:999, padding:"0.25rem 0.65rem", fontSize:"0.75rem", cursor:"pointer", fontFamily:"inherit" }}
              >+ {s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
