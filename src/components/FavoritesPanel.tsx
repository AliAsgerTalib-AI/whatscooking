import type { Favorite } from "../types/recipe";

interface FavoritesPanelProps {
  favorites: Favorite[];
  onLoad:    (fav: Favorite) => void;
  onDelete:  (id: string) => void;
}

export function FavoritesPanel({ favorites, onLoad, onDelete }: FavoritesPanelProps) {
  if (!favorites.length) return (
    <div className="rounded-2xl border border-[#E5DDD3] bg-white px-6 py-14 text-center">
      <div className="text-[0.7rem] uppercase tracking-widest text-[#9A8878] mb-2">No saved recipes yet</div>
      <div className="text-[0.9375rem] text-[#7A6B5E]">Hit Save on any recipe to add it here.</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {favorites.map(fav => (
        <div
          key={fav.id}
          className="bg-white rounded-2xl border border-[#E5DDD3] shadow-card px-5 py-5 flex items-start justify-between gap-4"
        >
          <div className="min-w-0">
            <div
              className="mb-1 truncate text-[#1A1208] text-[1.05rem]"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }}
            >
              {fav.recipe.title}
            </div>
            <div className="text-[0.68rem] text-[#9A8878] uppercase tracking-widest mb-2.5">
              {fav.recipe.badge && <>{fav.recipe.badge} · </>}
              {fav.recipe.meta?.serves && <>{fav.recipe.meta.serves} servings · </>}
              {new Date(fav.savedAt).toLocaleDateString()}
            </div>
            {fav.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {fav.tags.slice(0, 5).map(t => (
                  <span key={t} className="rounded-full bg-[#F5F0E8] border border-[#E5DDD3] text-[0.65rem] px-2.5 py-0.5 font-semibold text-[#7A6B5E] uppercase tracking-wide">
                    {t}
                  </span>
                ))}
                {fav.tags.length > 5 && (
                  <span className="text-[0.7rem] text-[#9A8878]">+{fav.tags.length - 5}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => onLoad(fav)}
              aria-label={`Load recipe: ${fav.recipe.title}`}
              className="rounded-lg border border-[#E5DDD3] bg-white px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-widest text-[#2C5F4A] cursor-pointer hover:bg-[#2C5F4A] hover:text-white hover:border-[#2C5F4A] transition-all duration-150 font-[inherit]"
            >
              Load
            </button>
            <button
              onClick={() => onDelete(fav.id)}
              aria-label={`Delete recipe: ${fav.recipe.title}`}
              className="rounded-lg border border-[#E5DDD3] bg-white px-3 py-1.5 text-[0.68rem] text-[#9A8878] cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-150 font-[inherit]"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
