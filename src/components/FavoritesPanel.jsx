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
    <div className="border border-primary px-6 py-12 text-center">
      <div className="text-label-sm uppercase tracking-label text-outline mb-2">No saved recipes</div>
      <div className="text-body-md text-outline">Hit Save on any recipe to add it here.</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-px bg-primary border border-primary">
      {favorites.map(fav => (
        <div key={fav.id} className="bg-surface px-4 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-body-md font-bold mb-1 truncate">{fav.recipe.title}</div>
            <div className="text-label-sm text-outline uppercase tracking-label mb-2">
              {fav.recipe.badge} &middot; {fav.recipe.meta?.serves} servings &middot; {new Date(fav.savedAt).toLocaleDateString()}
            </div>
            {fav.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {fav.tags.slice(0, 5).map(t => (
                  <span key={t} className="text-label-sm border border-primary px-1 uppercase tracking-label">{t}</span>
                ))}
                {fav.tags.length > 5 && (
                  <span className="text-label-sm text-outline">+{fav.tags.length - 5}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onLoad(fav)}
              aria-label={`Load recipe: ${fav.recipe.title}`}
              className="border border-primary px-3 py-1 text-label-md uppercase tracking-label font-bold cursor-pointer font-[inherit] bg-surface hover:bg-primary hover:text-on-primary transition-colors duration-100 ease-linear"
            >Load</button>
            <button
              onClick={() => onDelete(fav.id)}
              aria-label={`Delete recipe: ${fav.recipe.title}`}
              className="border border-primary px-3 py-1 text-label-md cursor-pointer font-[inherit] bg-surface hover:bg-primary hover:text-on-primary transition-colors duration-100 ease-linear"
            >✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
