import { useState, useCallback } from "react";
import { storageGet, storageSet } from "../utils/storage";
import { makeid } from "../utils/makeid";
import type { Favorite, Recipe } from "../types/recipe";

const MAX_FAVORITES = 20;

interface UseFavoritesProps {
  showToast:          (msg: string) => void;
  setRecipe:          (r: Recipe) => void;
  setIngredientTags:  (tags: string[]) => void;
  setBaseServings:    (n: number) => void;
  setDisplayServings: (n: number) => void;
  setTab:             (t: string) => void;
}

export function useFavorites({
  showToast,
  setRecipe,
  setIngredientTags,
  setBaseServings,
  setDisplayServings,
  setTab,
}: UseFavoritesProps) {
  const [favorites, setFavorites] = useState<Favorite[]>(() => storageGet<Favorite[]>("favs", []).value);
  const [isFav, setIsFav]         = useState(false);

  const saveFavorites = useCallback((favs: Favorite[]) => {
    setFavorites(favs);
    const { ok } = storageSet("favs", favs);
    if (!ok) showToast("⚠️ Couldn't save — storage unavailable in this browser");
  }, [showToast]);

  const toggleFav = useCallback((recipe: Recipe, ingredientTags: string[]) => {
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
      const entry: Favorite = { id: makeid(), recipe, tags: ingredientTags, savedAt: Date.now() };
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

  const loadFavorite = useCallback((fav: Favorite) => {
    setRecipe(fav.recipe);
    setIngredientTags(fav.tags || []);
    const sv = parseInt(fav.recipe.meta?.serves, 10) || 4;
    setBaseServings(sv);
    setDisplayServings(sv);
    setIsFav(true);
    setTab("generator");
    setTimeout(() => document.getElementById("result-anchor")?.scrollIntoView({ behavior: "smooth" }), 200);
  }, [setRecipe, setIngredientTags, setBaseServings, setDisplayServings, setTab]);

  const deleteFavorite = useCallback((id: string) => {
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
