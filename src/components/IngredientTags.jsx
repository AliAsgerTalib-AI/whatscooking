/**
 * IngredientTags — tokenised multi-value ingredient input with autocomplete.
 *
 * @param {{ tags: string[], onChange: (tags: string[]) => void }} props
 */
import { useState, useRef, useCallback, useMemo } from "react";
import { SUGGESTIONS } from "../data/suggestions.js";

const QUICK_ADD = [
  "chicken breast","garlic","onion","rice","pasta","eggs",
  "salmon","tofu","tomato","mushrooms","ginger","butter",
];

export function IngredientTags({ tags, onChange }) {
  const [input, setInput]               = useState("");
  const [focused, setFocused]           = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef(null);

  const tagsLower = useMemo(() => tags.map(t => t.toLowerCase()), [tags]);
  const filtered  = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return SUGGESTIONS
      .filter(s => s.toLowerCase().includes(q) && !tagsLower.includes(s.toLowerCase()))
      .slice(0, 8);
  }, [input, tagsLower]);

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
      <div
        role="combobox"
        aria-expanded={focused && filtered.length > 0}
        aria-haspopup="listbox"
        aria-controls="ingredient-listbox"
        aria-label="Ingredient input"
        onClick={() => inputRef.current?.focus()}
        className={`min-h-[56px] border bg-surface px-2 py-2 flex flex-wrap gap-1 items-center cursor-text transition-colors duration-100 ease-linear ${
          focused ? "border-primary bg-surface-container" : "border-primary"
        }`}
      >
        {tags.map((tag, i) => (
          <span key={tag} className="inline-flex items-center gap-1 border border-primary bg-surface px-2 py-[0.2rem] text-body-md font-medium animate-tag-pop">
            {tag}
            <button
              onClick={e => { e.stopPropagation(); removeTag(i); }}
              aria-label={`Remove ${tag}`}
              className="bg-transparent border-none cursor-pointer text-[0.9rem] leading-none px-[0.1rem] font-[inherit] flex items-center hover:bg-primary hover:text-on-primary transition-colors duration-100 ease-linear"
            >×</button>
          </span>
        ))}
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
          className="flex-[1_1_120px] min-w-[120px] bg-transparent border-none outline-none text-primary text-body-md font-[inherit] px-1 py-[0.25rem]"
        />
      </div>

      {focused && filtered.length > 0 && (
        <div
          id="ingredient-listbox"
          role="listbox"
          aria-label="Ingredient suggestions"
          className="absolute top-full left-0 right-0 bg-surface border border-primary border-t-0 z-50 animate-fade-in"
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
                className={`px-3 py-2 cursor-pointer text-body-md flex items-center gap-2 transition-colors duration-100 ease-linear ${
                  i < filtered.length - 1 ? "border-b border-primary" : ""
                } ${i === highlightIdx ? "bg-primary text-on-primary" : "bg-surface text-primary"}`}
              >
                <span className="text-label-sm text-outline">+</span>
                {idx === -1
                  ? s
                  : <>{s.slice(0,idx)}<strong className="font-bold">{s.slice(idx,idx+input.length)}</strong>{s.slice(idx+input.length)}</>
                }
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <p className="text-label-sm text-outline m-0">
          Press{" "}
          <kbd className="border border-outline px-1 font-[inherit] text-label-sm">Enter</kbd>
          {" "}or{" "}
          <kbd className="border border-outline px-1 font-[inherit] text-label-sm">,</kbd>
          {" "}to add &middot;{" "}
          <kbd className="border border-outline px-1 font-[inherit] text-label-sm">⌫</kbd>
          {" "}to remove last
        </p>
        {tags.length > 0 && (
          <button
            onClick={() => onChange([])}
            aria-label="Clear all ingredients"
            className="text-label-sm text-outline uppercase tracking-label border-none bg-transparent cursor-pointer font-[inherit] hover:text-primary transition-colors duration-100 ease-linear p-0"
          >Clear all</button>
        )}
      </div>

      {!input && (
        <div className="mt-3">
          <p className="text-label-sm uppercase tracking-label text-outline mb-2">Quick add</p>
          <div className="flex flex-wrap gap-1">
            {QUICK_ADD.map(s => (
              <button
                key={s}
                onMouseDown={() => addTag(s)}
                aria-label={`Quick add ${s}`}
                className="border border-primary bg-surface text-primary px-2 py-1 text-label-md cursor-pointer font-[inherit] hover:bg-primary hover:text-on-primary transition-colors duration-100 ease-linear"
              >+ {s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
