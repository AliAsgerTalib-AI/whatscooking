import { useState, useCallback } from "react";
import { storageGet, storageSet } from "../utils/storage.js";
import { makeid } from "../utils/makeid.js";

const MAX_FAVORITES = 20;

/**
 * Manages favourites state with crash-guarded localStorage persistence.
 *
 * @param {{
 *   showToast: (msg: string) => void,
 *   setRecipe: Function,
 *   setNutrition: Function,
 *   setAllergens: Function,
 *   setIngredientTags: Function,
 *   setBaseServings: Function,
 *   setDisplayServings: Function,
 *   setProMode: Function,
 *   setTab: Function,
 * }} setters
 */
export function useFavorites({
  showToast,
  setRecipe,
  setNutrition,
  setAllergens,
  setIngredientTags,
  setBaseServings,
  setDisplayServings,
  setProMode,
  setTab,
}) {
  const [favorites, setFavorites] = useState(() => storageGet("favs", []).value);
  const [isFav, setIsFav]         = useState(false);

  const saveFavorites = useCallback((favs) => {
    setFavorites(favs);
    const { ok } = storageSet("favs", favs);
    if (!ok) showToast("⚠️ Couldn't save — storage unavailable in this browser");
  }, [showToast]);

  const toggleFav = useCallback((recipe, nutrition, allergens, ingredientTags, proMode) => {
    if (!recipe) return;
    if (isFav) {
      setFavorites(prev => {
        const next = prev.filter(f => f.recipe.title !== recipe.title);
        const { ok } = storageSet("favs", next);
        if (!ok) showToast("⚠️ Couldn't save — storage unavailable in this browser");
        return next;
      });
      setIsFav(false);
    } else {
      const entry = { id: makeid(), recipe, nutrition, allergens, tags: ingredientTags, savedAt: Date.now(), proMode };
      setFavorites(prev => {
        const next = [entry, ...prev].slice(0, MAX_FAVORITES);
        const { ok } = storageSet("favs", next);
        if (!ok) showToast("⚠️ Couldn't save — storage unavailable in this browser");
        return next;
      });
      setIsFav(true);
      showToast("♥ Recipe saved!");
    }
  }, [isFav, showToast]);

  const loadFavorite = useCallback((fav) => {
    setRecipe(fav.recipe);
    setNutrition(fav.nutrition || null);
    setAllergens(fav.allergens || null);
    setIngredientTags(fav.tags || []);
    const sv = parseInt(fav.recipe.meta?.serves, 10) || 4;
    setBaseServings(sv);
    setDisplayServings(sv);
    setIsFav(true);
    setProMode(fav.proMode || false);
    setTab("generator");
    setTimeout(() => document.getElementById("result-anchor")?.scrollIntoView({ behavior: "smooth" }), 200);
  }, [setRecipe, setNutrition, setAllergens, setIngredientTags, setBaseServings, setDisplayServings, setProMode, setTab]);

  const deleteFavorite = useCallback((id) => {
    setFavorites(prev => {
      const next = prev.filter(f => f.id !== id);
      const { ok } = storageSet("favs", next);
      if (!ok) showToast("⚠️ Couldn't save — storage unavailable in this browser");
      return next;
    });
    showToast("🗑 Recipe removed");
  }, [showToast]);

  return { favorites, isFav, setIsFav, saveFavorites, toggleFav, loadFavorite, deleteFavorite };
}
