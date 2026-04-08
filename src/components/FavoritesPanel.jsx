/**
 * FavoritesPanel — lists saved recipes with load and delete actions.
 *
 * @param {{
 *   favorites: import("../types/recipe.ts").Favorite[],
 *   onLoad: (fav: import("../types/recipe.ts").Favorite) => void,
 *   onDelete: (id: string) => void
 * }} props
 */
export function FavoritesPanel({ favorites, onLoad, onDelete }) {
  if (!favorites.length) return (
    <div className="text-center py-8 text-white/30">
      <div className="text-[2rem] mb-2">🤍</div>
      <div className="text-[0.85rem]">No saved recipes yet.<br />Hit ♥ on any recipe to save it.</div>
    </div>
  );

  return (
    <div>
      {favorites.map(fav => (
        <div key={fav.id} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-[0.95rem] mb-0.5">{fav.recipe.title}</div>
              <div className="text-[0.72rem] text-white/35">
                {fav.recipe.badge} · {fav.recipe.meta?.serves} servings · {new Date(fav.savedAt).toLocaleDateString()}
                {fav.proMode && (
                  <span className="ml-2 bg-fl-indigo/20 border border-fl-indigo/40 text-fl-indigo rounded px-1.5 py-[0.1rem] text-[0.62rem] font-bold">PRO</span>
                )}
              </div>
              {fav.tags?.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {fav.tags.slice(0, 5).map(t => (
                    <span key={t} className="text-[0.65rem] bg-fl-gold/10 border border-fl-gold/25 text-fl-gold/70 rounded-full px-[0.45rem] py-[0.1rem]">{t}</span>
                  ))}
                  {fav.tags.length > 5 && <span className="text-[0.65rem] text-white/25">+{fav.tags.length - 5}</span>}
                </div>
              )}
            </div>
            <div className="flex gap-1.5 shrink-0">
              {/* BP-06: descriptive aria-labels on icon/short-text buttons */}
              <button
                onClick={() => onLoad(fav)}
                aria-label={`Load recipe: ${fav.recipe.title}`}
                className="bg-fl-gold/[0.15] border border-fl-gold/40 text-fl-gold rounded-lg px-[0.7rem] py-[0.35rem] text-[0.72rem] font-bold cursor-pointer font-[inherit]"
              >Load</button>
              <button
                onClick={() => onDelete(fav.id)}
                aria-label={`Delete recipe: ${fav.recipe.title}`}
                className="bg-fl-red/10 border border-fl-red/30 text-fl-red rounded-lg px-[0.5rem] py-[0.35rem] text-[0.75rem] cursor-pointer font-[inherit]"
              >✕</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
