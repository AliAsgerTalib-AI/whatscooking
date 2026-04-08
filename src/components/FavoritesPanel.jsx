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
    <div style={{ textAlign:"center", padding:"2rem", color:"rgba(255,255,255,0.3)" }}>
      <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>🤍</div>
      <div style={{ fontSize:"0.85rem" }}>No saved recipes yet.<br />Hit ♥ on any recipe to save it.</div>
    </div>
  );

  return (
    <div>
      {favorites.map(fav => (
        <div key={fav.id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"1rem", marginBottom:"0.75rem" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"0.5rem" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:"0.2rem" }}>{fav.recipe.title}</div>
              <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.35)" }}>
                {fav.recipe.badge} · {fav.recipe.meta?.serves} servings · {new Date(fav.savedAt).toLocaleDateString()}
                {fav.proMode && (
                  <span style={{ marginLeft:"0.5rem", background:"rgba(129,140,248,0.2)", border:"1px solid rgba(129,140,248,0.4)", color:"#818cf8", borderRadius:4, padding:"0.1rem 0.4rem", fontSize:"0.62rem", fontWeight:700 }}>PRO</span>
                )}
              </div>
              {fav.tags?.length > 0 && (
                <div style={{ marginTop:"0.4rem", display:"flex", flexWrap:"wrap", gap:"0.25rem" }}>
                  {fav.tags.slice(0, 5).map(t => (
                    <span key={t} style={{ fontSize:"0.65rem", background:"rgba(249,199,79,0.1)", border:"1px solid rgba(249,199,79,0.25)", color:"rgba(249,199,79,0.7)", borderRadius:999, padding:"0.1rem 0.45rem" }}>{t}</span>
                  ))}
                  {fav.tags.length > 5 && <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.25)" }}>+{fav.tags.length - 5}</span>}
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:"0.4rem", flexShrink:0 }}>
              {/* BP-06: descriptive aria-labels on icon/short-text buttons */}
              <button
                onClick={() => onLoad(fav)}
                aria-label={`Load recipe: ${fav.recipe.title}`}
                style={{ background:"rgba(249,199,79,0.15)", border:"1px solid rgba(249,199,79,0.4)", color:"#f9c74f", borderRadius:8, padding:"0.35rem 0.7rem", fontSize:"0.72rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
              >Load</button>
              <button
                onClick={() => onDelete(fav.id)}
                aria-label={`Delete recipe: ${fav.recipe.title}`}
                style={{ background:"rgba(249,65,68,0.1)", border:"1px solid rgba(249,65,68,0.3)", color:"#f94144", borderRadius:8, padding:"0.35rem 0.5rem", fontSize:"0.75rem", cursor:"pointer", fontFamily:"inherit" }}
              >✕</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
