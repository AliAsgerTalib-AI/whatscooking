import { useState, useRef, useCallback, useMemo } from "react";
import { SUGGESTIONS } from "../data/suggestions";

const QUICK_ADD = [
  "chicken breast","garlic","onion","rice","pasta","eggs",
  "salmon","tofu","tomato","mushrooms","ginger","butter",
];

interface IngredientTagsProps {
  tags:     string[];
  onChange: (tags: string[]) => void;
}

export function IngredientTags({ tags, onChange }: IngredientTagsProps) {
  const [input, setInput]               = useState("");
  const [focused, setFocused]           = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const tagsLower = useMemo(() => tags.map(t => t.toLowerCase()), [tags]);
  const filtered  = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return SUGGESTIONS
      .filter(s => s.toLowerCase().includes(q) && !tagsLower.includes(s.toLowerCase()))
      .slice(0, 8);
  }, [input, tagsLower]);

  const addTag = useCallback((val: string) => {
    const clean = val.trim().replace(/,+$/, "").trim();
    if (!clean) return;
    const parts   = clean.split(",").map(p => p.trim()).filter(Boolean);
    const newTags = parts.filter(p => !tagsLower.includes(p.toLowerCase()));
    if (newTags.length) onChange([...tags, ...newTags]);
    setInput(""); setHighlightIdx(-1);
    inputRef.current?.focus();
  }, [tags, tagsLower, onChange]);

  const removeTag = useCallback((i: number) => {
    onChange(tags.filter((_, idx) => idx !== i));
    inputRef.current?.focus();
  }, [tags, onChange]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
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
        className={`min-h-[56px] rounded-xl border px-3 py-2.5 flex flex-wrap gap-1.5 items-center cursor-text transition-colors duration-150 bg-[#EDE7D5] ${
          focused ? "border-[#6B7730] bg-white" : "border-[#E6DFD0]"
        }`}
      >
        {tags.map((tag, i) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-[#E6DFD0] bg-[#EBE4D2] px-3 py-0.5 text-sm font-medium text-[#4A3D2C] animate-tag-pop">
            {tag}
            <button
              onClick={e => { e.stopPropagation(); removeTag(i); }}
              aria-label={`Remove ${tag}`}
              className="bg-transparent border-none cursor-pointer text-[0.9rem] leading-none px-0.5 font-[inherit] flex items-center text-[#8B7A6A] hover:text-[#3B2D1C] transition-colors duration-100"
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
          className="flex-[1_1_120px] min-w-[120px] bg-transparent border-none outline-none text-[#3B2D1C] text-sm font-[inherit] px-1 py-[0.25rem] placeholder:text-[#A88E7C]"
        />
      </div>

      {focused && filtered.length > 0 && (
        <div
          id="ingredient-listbox"
          role="listbox"
          aria-label="Ingredient suggestions"
          className="absolute top-full left-0 right-0 bg-white rounded-xl border border-[#E6DFD0] border-t-0 rounded-t-none z-50 animate-fade-in shadow-card overflow-hidden"
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
                className={`px-4 py-2.5 cursor-pointer text-sm flex items-center gap-2 transition-colors duration-100 ${
                  i < filtered.length - 1 ? "border-b border-[#E6DFD0]" : ""
                } ${i === highlightIdx ? "bg-[#6B7730] text-white" : "bg-white text-[#4A3D2C] hover:bg-[#EBE4D2]"}`}
              >
                <span className={`text-[0.65rem] ${i === highlightIdx ? "text-white/60" : "text-[#8B7A6A]"}`}>+</span>
                {idx === -1
                  ? s
                  : <>{s.slice(0,idx)}<strong className="font-bold">{s.slice(idx,idx+input.length)}</strong>{s.slice(idx+input.length)}</>
                }
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-2.5">
        <p className="text-[0.68rem] text-[#8B7A6A] m-0">
          Press{" "}
          <kbd className="rounded border border-[#E6DFD0] bg-[#EBE4D2] px-1 font-[inherit] text-[0.65rem] text-[#6B5A48]">Enter</kbd>
          {" "}or{" "}
          <kbd className="rounded border border-[#E6DFD0] bg-[#EBE4D2] px-1 font-[inherit] text-[0.65rem] text-[#6B5A48]">,</kbd>
          {" "}to add · {" "}
          <kbd className="rounded border border-[#E6DFD0] bg-[#EBE4D2] px-1 font-[inherit] text-[0.65rem] text-[#6B5A48]">⌫</kbd>
          {" "}to remove last
        </p>
        {tags.length > 0 && (
          <button
            onClick={() => onChange([])}
            aria-label="Clear all ingredients"
            className="text-[0.68rem] text-[#8B7A6A] uppercase tracking-widest font-semibold border-none bg-transparent cursor-pointer font-[inherit] hover:text-[#3B2D1C] transition-colors duration-150 p-0"
          >Clear all</button>
        )}
      </div>

      {!input && (
        <div className="mt-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-[#8B7A6A] mb-2">Quick add</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ADD.map(s => (
              <button
                key={s}
                onMouseDown={() => addTag(s)}
                aria-label={`Quick add ${s}`}
                className="rounded-full border border-[#E6DFD0] bg-[#EBE4D2] text-[#6B5A48] px-3 py-1 text-[0.68rem] font-semibold cursor-pointer font-[inherit] hover:border-[#6B7730] hover:text-[#6B7730] hover:bg-[#E4EDD6] transition-all duration-150"
              >+ {s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
