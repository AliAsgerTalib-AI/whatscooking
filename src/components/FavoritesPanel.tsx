import type { Favorite } from "../types/recipe";

interface FavoritesPanelProps {
  favorites: Favorite[];
  onLoad:    (fav: Favorite) => void;
  onDelete:  (id: string) => void;
}

export function FavoritesPanel({ favorites, onLoad, onDelete }: FavoritesPanelProps) {
  if (!favorites.length) return (
    <div className="rounded-2xl border border-[#E6DFD0] bg-white px-6 py-14 text-center">
      <div className="text-[0.7rem] uppercase tracking-widest text-[#8B7A6A] mb-2">No saved recipes yet</div>
      <div className="text-[0.9375rem] text-[#6B5A48]">Hit Save on any recipe to add it here.</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {favorites.map(fav => (
        <div
          key={fav.id}
          className="bg-white rounded-2xl border border-[#E6DFD0] shadow-card px-5 py-5 flex items-start justify-between gap-4"
        >
          <div className="min-w-0">
            <div
              className="mb-1 truncate text-[#3B2D1C] text-[1.05rem]"
              style={{ fontFamily: "'Lora', Georgia, serif", fontWeight: 700 }}
            >
              {fav.recipe.title}
            </div>
            <div className="text-[0.68rem] text-[#8B7A6A] uppercase tracking-widest mb-2.5">
              {fav.recipe.badge && <>{fav.recipe.badge} · </>}
              {fav.recipe.meta?.serves && <>{fav.recipe.meta.serves} servings · </>}
              {new Date(fav.savedAt).toLocaleDateString()}
            </div>
            {fav.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {fav.tags.slice(0, 5).map(t => (
                  <span key={t} className="rounded-full bg-[#EBE4D2] border border-[#E6DFD0] text-[0.65rem] px-2.5 py-0.5 font-semibold text-[#6B5A48] uppercase tracking-wide">
                    {t}
                  </span>
                ))}
                {fav.tags.length > 5 && (
                  <span className="text-[0.7rem] text-[#8B7A6A]">+{fav.tags.length - 5}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => onLoad(fav)}
              aria-label={`Load recipe: ${fav.recipe.title}`}
              className="rounded-lg border border-[#E6DFD0] bg-white px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-widest text-[#6B7730] cursor-pointer hover:bg-[#6B7730] hover:text-white hover:border-[#6B7730] transition-all duration-150 font-[inherit]"
            >
              Load
            </button>
            <button
              onClick={() => onDelete(fav.id)}
              aria-label={`Delete recipe: ${fav.recipe.title}`}
              className="rounded-lg border border-[#E6DFD0] bg-white px-3 py-1.5 text-[0.68rem] text-[#8B7A6A] cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-150 font-[inherit]"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
