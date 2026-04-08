/**
 * IngredientTags — tokenised multi-value ingredient input with autocomplete.
 *
 * @param {{ tags: string[], onChange: (tags: string[]) => void }} props
 */
import { useState, useRef, useCallback, useMemo } from "react";
import { SUGGESTIONS } from "../data/suggestions.js";

// Full Tailwind class strings — must be complete literals so JIT scanner picks them up
const TAG_COLORS = [
  { wrap: "bg-fl-gold/[0.18]   border border-fl-gold/50   text-fl-gold" },
  { wrap: "bg-fl-orange/[0.18] border border-fl-orange/50 text-fl-orange" },
  { wrap: "bg-fl-indigo/[0.18] border border-fl-indigo/50 text-fl-indigo" },
  { wrap: "bg-fl-green/[0.18]  border border-fl-green/50  text-fl-green" },
  { wrap: "bg-fl-amber/[0.18]  border border-fl-amber/50  text-fl-amber" },
  { wrap: "bg-fl-teal/[0.18]   border border-fl-teal/50   text-fl-teal" },
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

  // BP-11: memoize filtered suggestions
  const tagsLower = useMemo(() => tags.map(t => t.toLowerCase()), [tags]);
  const filtered  = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return SUGGESTIONS
      .filter(s => s.toLowerCase().includes(q) && !tagsLower.includes(s.toLowerCase()))
      .slice(0, 8);
  }, [input, tagsLower]);

  // BP-01: stable callback references
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
    <div className="relative">
      {/* BP-08: combobox pattern */}
      <div
        role="combobox"
        aria-expanded={focused && filtered.length > 0}
        aria-haspopup="listbox"
        aria-controls="ingredient-listbox"
        aria-label="Ingredient input"
        onClick={() => inputRef.current?.focus()}
        className={`min-h-14 bg-black/30 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 items-center cursor-text transition-[border-color,box-shadow] duration-200 border-[1.5px] ${
          focused
            ? "border-fl-gold/50 shadow-[0_0_0_3px_rgba(249,199,79,0.08)]"
            : "border-white/[0.15]"
        }`}
      >
        {/* BP-02: tag text is stable key */}
        {tags.map((tag, i) => {
          const c = TAG_COLORS[i % TAG_COLORS.length];
          return (
            <span key={tag} className={`inline-flex items-center gap-1 rounded-full px-[0.7rem] py-[0.28rem] text-[0.82rem] font-semibold leading-none animate-tag-pop ${c.wrap}`}>
              {tag}
              {/* BP-06: aria-label on the remove button */}
              <button
                onClick={e => { e.stopPropagation(); removeTag(i); }}
                aria-label={`Remove ${tag}`}
                className="bg-transparent border-none cursor-pointer text-[0.9rem] leading-none px-[0.1rem] opacity-70 font-[inherit] flex items-center"
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
          className="flex-[1_1_120px] min-w-[120px] bg-transparent border-none outline-none text-fl-text text-[0.9rem] font-[inherit] p-1"
        />
      </div>

      {focused && filtered.length > 0 && (
        <div
          id="ingredient-listbox"
          role="listbox"
          aria-label="Ingredient suggestions"
          className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#1e1b3a] border border-white/[0.12] rounded-xl overflow-hidden z-50 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-fade-up-fast"
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
                className={`px-4 py-[0.65rem] cursor-pointer text-[0.88rem] flex items-center gap-2 ${
                  i < filtered.length - 1 ? "border-b border-white/[0.06]" : ""
                } ${
                  i === highlightIdx
                    ? "bg-fl-gold/[0.12] text-fl-gold"
                    : "bg-transparent text-white/75"
                }`}
              >
                <span className="opacity-40 text-xs">+</span>
                {idx === -1
                  ? s
                  : <>{s.slice(0,idx)}<strong className="text-fl-gold font-bold">{s.slice(idx,idx+input.length)}</strong>{s.slice(idx+input.length)}</>
                }
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-[0.55rem]">
        <p className="text-[0.7rem] text-white/25 m-0">
          Press{" "}
          <kbd className="bg-white/[0.08] rounded px-[0.35rem] py-[0.1rem] text-[0.65rem] font-[inherit]">Enter</kbd>
          {" "}or{" "}
          <kbd className="bg-white/[0.08] rounded px-[0.35rem] py-[0.1rem] text-[0.65rem] font-[inherit]">,</kbd>
          {" "}to add ·{" "}
          <kbd className="bg-white/[0.08] rounded px-[0.35rem] py-[0.1rem] text-[0.65rem] font-[inherit]">⌫</kbd>
          {" "}to remove last
        </p>
        {tags.length > 0 && (
          <button
            onClick={() => onChange([])}
            aria-label="Clear all ingredients"
            className="bg-transparent border-none text-white/25 text-[0.7rem] cursor-pointer font-[inherit] p-0"
          >clear all</button>
        )}
      </div>

      {tags.length === 0 && !input && (
        <div className="mt-[0.85rem]">
          <p className="text-[0.68rem] text-white/25 tracking-[0.12em] uppercase mb-2">Quick add</p>
          <div className="flex flex-wrap gap-[0.35rem]">
            {QUICK_ADD.map(s => (
              <button
                key={s}
                onMouseDown={() => addTag(s)}
                aria-label={`Quick add ${s}`}
                className="bg-white/[0.05] border border-white/10 text-white/50 rounded-full px-[0.65rem] py-1 text-[0.75rem] cursor-pointer font-[inherit]"
              >+ {s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
