import { ALLERGENS } from "../data/allergens.js";
import { scaleIngredient } from "../utils/scaleIngredient.js";

/**
 * Opens a new window with a professional A4 recipe card and auto-triggers print.
 */
export function exportProPDF(recipe, tags, nutrition, allergens, displayServings, ratio, proFields) {
  const win = window.open("", "_blank");
  if (!win) return;

  const scaledIngs          = (recipe.ingredients || []).map(i => scaleIngredient(i, ratio));
  const presentAllergens    = (allergens || []).filter(a => a.present).map(a => ALLERGENS.find(x => x.id === a.id)?.label).filter(Boolean);
  const mayContainAllergens = (allergens || []).filter(a => a.mayContain).map(a => ALLERGENS.find(x => x.id === a.id)?.label).filter(Boolean);
  const today               = new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
  const recipeId            = `FL-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const allergenGrid = ALLERGENS.map(a => {
    const hit       = (allergens || []).find(x => x.id === a.id);
    const isPresent = hit?.present;
    const isMay     = hit?.mayContain;
    return `<div class="allergen-cell ${isPresent ? "present" : isMay ? "may" : ""}">
      <div class="a-icon">${a.icon}</div>
      <div class="a-label">${a.label}</div>
      ${isPresent ? '<div class="a-dot present-dot"></div>' : isMay ? '<div class="a-dot may-dot"></div>' : ''}
    </div>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
  <title>Recipe Card — ${recipe.title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Georgia',serif;color:#1a1a1a;background:#fff;font-size:10pt;}
    .page{max-width:210mm;margin:0 auto;padding:0;}

    .header{background:#1a1a2e;color:#fff;padding:1.4rem 1.8rem 1.2rem;display:grid;grid-template-columns:1fr auto;gap:1rem;align-items:start;}
    .brand{font-family:sans-serif;font-size:7pt;letter-spacing:0.25em;text-transform:uppercase;color:rgba(249,199,79,0.7);margin-bottom:0.4rem;}
    .title{font-size:22pt;font-weight:bold;line-height:1.15;color:#fff;margin-bottom:0.35rem;}
    .intro{font-size:9pt;color:rgba(255,255,255,0.55);font-style:italic;line-height:1.55;}
    .badge-row{display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.6rem;}
    .badge{font-family:sans-serif;font-size:6pt;letter-spacing:0.12em;text-transform:uppercase;border:1px solid rgba(249,199,79,0.5);color:#f9c74f;padding:0.2rem 0.55rem;border-radius:3px;font-weight:bold;}
    .header-right{text-align:right;font-family:sans-serif;}
    .recipe-id{font-size:7pt;color:rgba(255,255,255,0.3);letter-spacing:0.1em;margin-bottom:0.3rem;}
    .date{font-size:7pt;color:rgba(255,255,255,0.4);}
    .pro-badge{display:inline-block;background:rgba(129,140,248,0.25);border:1px solid rgba(129,140,248,0.6);color:#a5b4fc;font-size:6pt;letter-spacing:0.15em;text-transform:uppercase;padding:0.2rem 0.5rem;border-radius:3px;font-weight:bold;margin-bottom:0.4rem;}

    .meta-row{background:#f8f7f4;border-bottom:2px solid #e5e2da;display:flex;padding:0.7rem 1.8rem;}
    .meta-item{flex:1;text-align:center;border-right:1px solid #e5e2da;}
    .meta-item:last-child{border-right:none;}
    .meta-key{font-family:sans-serif;font-size:6pt;letter-spacing:0.15em;text-transform:uppercase;color:#999;margin-bottom:0.2rem;}
    .meta-val{font-family:sans-serif;font-size:9pt;font-weight:bold;color:#1a1a1a;}

    .body-grid{display:grid;grid-template-columns:1fr 200px;gap:0;}
    .main-col{padding:1.4rem 1.8rem;border-right:1px solid #e5e2da;}
    .side-col{padding:1.2rem;}

    .sec{font-family:sans-serif;font-size:6.5pt;letter-spacing:0.2em;text-transform:uppercase;color:#f3722c;font-weight:bold;padding-bottom:0.4rem;border-bottom:1px solid #eee;margin-bottom:0.8rem;margin-top:1.2rem;}
    .sec:first-child{margin-top:0;}

    .mise-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.25rem 1rem;margin-bottom:0.5rem;}
    .mise-item{font-size:8.5pt;line-height:1.5;display:flex;gap:0.35rem;align-items:baseline;}
    .mise-item::before{content:"□";font-size:8pt;color:#ccc;flex-shrink:0;}

    .step{display:flex;gap:0.65rem;margin-bottom:0.8rem;align-items:flex-start;}
    .step-num{min-width:20px;height:20px;background:#f3722c;color:#fff;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:7pt;font-weight:bold;flex-shrink:0;margin-top:1px;font-family:sans-serif;}
    .step-text{font-size:8.5pt;line-height:1.65;}

    .tips-box{background:#fff8f5;border-left:3px solid #f3722c;padding:0.6rem 0.85rem;font-size:8pt;line-height:1.6;color:#555;margin-top:0.5rem;}
    .tip-card{display:flex;gap:0.5rem;background:#fffbea;border:1px solid #f0d060;border-radius:4px;padding:0.5rem 0.7rem;margin-bottom:0.35rem;font-size:7.5pt;line-height:1.5;}
    .warn-card{display:flex;gap:0.5rem;background:#fff5f5;border:1px solid #f5c6c6;border-radius:4px;padding:0.5rem 0.7rem;margin-bottom:0.35rem;font-size:7.5pt;line-height:1.5;}

    .ing{font-size:8.5pt;padding:0.3rem 0;border-bottom:1px solid #f0f0f0;display:flex;gap:0.4rem;line-height:1.45;}
    .ing-dot{width:4px;height:4px;border-radius:50%;background:#f3722c;margin-top:5px;flex-shrink:0;}

    .allergen-section{padding:1rem 1.8rem;border-top:2px solid #1a1a2e;background:#fafafa;}
    .allergen-title{font-family:sans-serif;font-size:7pt;letter-spacing:0.2em;text-transform:uppercase;color:#c0392b;font-weight:bold;margin-bottom:0.8rem;}
    .allergen-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:0.3rem;margin-bottom:0.8rem;}
    .allergen-cell{border-radius:5px;padding:0.4rem 0.2rem;text-align:center;border:1.5px solid #e5e2da;background:#fff;position:relative;}
    .allergen-cell.present{border-color:#ef4444;background:#fff5f5;}
    .allergen-cell.may{border-color:#f59e0b;background:#fffbea;}
    .a-icon{font-size:11pt;line-height:1;margin-bottom:0.2rem;}
    .a-label{font-family:sans-serif;font-size:5.5pt;color:#666;line-height:1.2;}
    .allergen-cell.present .a-label{color:#ef4444;font-weight:bold;}
    .allergen-cell.may .a-label{color:#d97706;font-weight:bold;}
    .a-dot{position:absolute;top:3px;right:3px;width:5px;height:5px;border-radius:50%;}
    .present-dot{background:#ef4444;}
    .may-dot{background:#f59e0b;}
    .allergen-legend{display:flex;gap:1.5rem;margin-top:0.5rem;}
    .legend-item{display:flex;align-items:center;gap:0.3rem;font-family:sans-serif;font-size:6.5pt;color:#666;}
    .legend-dot{width:7px;height:7px;border-radius:50%;}

    .nut-row{display:flex;justify-content:space-between;padding:0.3rem 0;border-bottom:1px solid #f0f0f0;font-size:8pt;}
    .nut-row:last-child{border-bottom:none;}
    .nut-cal{font-size:13pt;font-weight:bold;color:#f3722c;text-align:center;margin:0.5rem 0;}
    .nut-cal-label{font-family:sans-serif;font-size:6pt;text-transform:uppercase;letter-spacing:0.1em;color:#999;text-align:center;margin-bottom:0.5rem;}

    .pro-table{width:100%;border-collapse:collapse;font-size:8pt;margin-bottom:0.5rem;}
    .pro-table td{padding:0.3rem 0.5rem;border:1px solid #e5e2da;}
    .pro-table th{padding:0.3rem 0.5rem;border:1px solid #e5e2da;background:#f3f3f3;font-family:sans-serif;font-size:6.5pt;text-transform:uppercase;letter-spacing:0.1em;color:#666;font-weight:bold;}

    .footer{background:#1a1a2e;color:rgba(255,255,255,0.35);padding:0.6rem 1.8rem;display:flex;justify-content:space-between;align-items:center;font-family:sans-serif;font-size:6pt;letter-spacing:0.05em;}
    .footer strong{color:rgba(255,255,255,0.55);}

    .haccp-item{display:flex;gap:0.5rem;margin-bottom:0.35rem;font-size:8pt;align-items:flex-start;}
    .haccp-icon{flex-shrink:0;font-size:9pt;}

    @media print{
      body{font-size:9pt;}
      .page{max-width:100%;}
      @page{margin:1.2cm;size:A4;}
      .body-grid{display:block;}
      .main-col,.side-col{display:block;width:100%;border:none;break-inside:auto;}
      .step{break-inside:avoid;}
      .allergen-section{break-inside:avoid;}
      .footer{break-inside:avoid;}
    }
  </style>
  </head><body><div class="page">

  <div class="header">
    <div class="header-left">
      <div class="brand">🍳 FlavorLab — Professional Kitchen</div>
      <div class="title">${recipe.title}</div>
      <div class="intro">${recipe.intro || ""}</div>
      <div class="badge-row">
        ${recipe.badge ? `<span class="badge">${recipe.badge}</span>` : ""}
        ${tags.map(t => `<span class="badge" style="border-color:rgba(129,140,248,0.5);color:#a5b4fc">${t}</span>`).join("")}
        ${proFields?.chefName ? `<span class="badge" style="border-color:rgba(74,222,128,0.5);color:#86efac">Chef: ${proFields.chefName}</span>` : ""}
        ${proFields?.station  ? `<span class="badge" style="border-color:rgba(251,146,60,0.5);color:#fdba74">Station: ${proFields.station}</span>` : ""}
      </div>
    </div>
    <div class="header-right">
      <div class="pro-badge">PRO RECIPE</div><br/>
      <div class="recipe-id">ID: ${recipeId}</div>
      <div class="date">Issued: ${today}</div>
      ${proFields?.version ? `<div class="date" style="margin-top:0.2rem">v${proFields.version}</div>` : ""}
    </div>
  </div>

  <div class="meta-row">
    <div class="meta-item"><div class="meta-key">Yield</div><div class="meta-val">${displayServings} portions</div></div>
    <div class="meta-item"><div class="meta-key">Prep</div><div class="meta-val">${recipe.meta?.prep || "—"}</div></div>
    <div class="meta-item"><div class="meta-key">Cook</div><div class="meta-val">${recipe.meta?.cook || "—"}</div></div>
    <div class="meta-item"><div class="meta-key">Level</div><div class="meta-val">${recipe.meta?.difficulty || "—"}</div></div>
    <div class="meta-item"><div class="meta-key">Method</div><div class="meta-val">${recipe.meta?.method || "—"}</div></div>
    ${proFields?.costPerPortion ? `<div class="meta-item"><div class="meta-key">Cost/Portion</div><div class="meta-val" style="color:#16a34a">${proFields.costPerPortion}</div></div>` : ""}
  </div>

  <div class="body-grid">
    <div class="main-col">
      ${recipe.miseEnPlace?.length ? `
      <div class="sec">🔪 Mise en Place</div>
      <div class="mise-grid">
        ${(recipe.miseEnPlace || []).map(m => `<div class="mise-item">${m}</div>`).join("")}
      </div>` : ""}

      <div class="sec">Method</div>
      ${(recipe.steps || []).map((s, i) => `<div class="step"><div class="step-num">${i + 1}</div><div class="step-text">${s}</div></div>`).join("")}

      ${recipe.tips ? `<div class="tips-box"><strong>💡 Chef's Tip:</strong> ${recipe.tips}</div>` : ""}

      ${(recipe.proTips || []).length ? `
      <div class="sec" style="margin-top:1rem">💡 Pro Tips</div>
      ${(recipe.proTips || []).map(t => `<div class="tip-card"><span>${t.icon || "💡"}</span><div><strong>${t.title}</strong> — ${t.body}</div></div>`).join("")}` : ""}

      ${(recipe.watchOuts || []).length ? `
      <div class="sec" style="color:#c0392b;border-color:#f5c6c6">⚠️ What to Watch Out For</div>
      ${(recipe.watchOuts || []).map(w => `<div class="warn-card"><span>${w.icon || "⚠️"}</span><div><strong style="color:#c0392b">${w.title}</strong> — ${w.body}</div></div>`).join("")}` : ""}

      ${recipe.haccp?.length ? `
      <div class="sec" style="color:#7c3aed;border-color:#ddd6fe">🛡️ HACCP / Food Safety</div>
      ${(recipe.haccp || []).map(h => `<div class="haccp-item"><span class="haccp-icon">⚠️</span><span>${h}</span></div>`).join("")}` : ""}
    </div>

    <div class="side-col">
      <div class="sec" style="margin-top:0">Ingredients × ${displayServings}</div>
      ${scaledIngs.map(i => `<div class="ing"><div class="ing-dot"></div>${i}</div>`).join("")}

      ${nutrition ? `
      <div class="sec" style="margin-top:1rem">Nutrition / serving</div>
      <div class="nut-cal-label">Calories</div>
      <div class="nut-cal">${nutrition.calories} kcal</div>
      <div class="nut-row"><span>Protein</span><strong>${nutrition.protein}g</strong></div>
      <div class="nut-row"><span>Carbs</span><strong>${nutrition.carbs}g</strong></div>
      <div class="nut-row"><span>Fat</span><strong>${nutrition.fat}g</strong></div>
      <div class="nut-row"><span>Fiber</span><strong>${nutrition.fiber}g</strong></div>
      <div class="nut-row"><span>Sodium</span><strong>${nutrition.sodium}mg</strong></div>` : ""}

      ${proFields?.ingredients?.some(i => i.cost) ? `
      <div class="sec" style="margin-top:1rem">Cost Breakdown</div>
      <table class="pro-table">
        <tr><th>Ingredient</th><th>Cost</th></tr>
        ${proFields.ingredients.filter(i => i.cost).map(i => `<tr><td>${i.name}</td><td>$${parseFloat(i.cost).toFixed(2)}</td></tr>`).join("")}
        ${proFields.totalCost      ? `<tr><td><strong>Total</strong></td><td><strong>$${parseFloat(proFields.totalCost).toFixed(2)}</strong></td></tr>` : ""}
        ${proFields.costPerPortion ? `<tr><td><strong>Per Portion</strong></td><td><strong>${proFields.costPerPortion}</strong></td></tr>` : ""}
      </table>` : ""}
    </div>
  </div>

  <div class="allergen-section">
    <div class="allergen-title">⚠️ Allergen Information — EU Regulation 1169/2011 (14 Major Allergens)</div>
    <div class="allergen-grid">${allergenGrid}</div>
    <div class="allergen-legend">
      <div class="legend-item"><div class="legend-dot" style="background:#ef4444"></div> Contains</div>
      <div class="legend-item"><div class="legend-dot" style="background:#f59e0b"></div> May contain / cross-contamination risk</div>
      <div class="legend-item"><div class="legend-dot" style="background:#e5e2da"></div> Not present</div>
    </div>
    ${presentAllergens.length    ? `<div style="margin-top:0.6rem;font-family:sans-serif;font-size:7.5pt;"><strong style="color:#c0392b">CONTAINS:</strong> ${presentAllergens.join(" · ")}</div>` : ""}
    ${mayContainAllergens.length ? `<div style="margin-top:0.3rem;font-family:sans-serif;font-size:7.5pt;"><strong style="color:#d97706">MAY CONTAIN:</strong> ${mayContainAllergens.join(" · ")}</div>` : ""}
    <div style="margin-top:0.5rem;font-family:sans-serif;font-size:6.5pt;color:#999;font-style:italic;">AI-generated allergen data. Always verify against actual ingredient labels. Not a substitute for certified allergen assessment. For allergy sufferers, check all ingredient packaging before preparation.</div>
  </div>

  <div class="footer">
    <span><strong>FlavorLab</strong> Professional Kitchen · ${today}</span>
    <span>Recipe ID: <strong>${recipeId}</strong></span>
    <span>Nutritional values are estimates only</span>
  </div>

  <script>window.onload=()=>window.print();</script>
  </div></body></html>`;

  win.document.write(html);
  win.document.close();
}
