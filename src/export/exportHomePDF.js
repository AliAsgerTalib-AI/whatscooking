import { scaleIngredient } from "../utils/scaleIngredient.js";

/**
 * Opens a new window with a clean home-mode recipe card and auto-triggers print.
 */
export function exportHomePDF(recipe, tags, nutrition, displayServings, ratio) {
  const win = window.open("", "_blank");
  if (!win) return;

  const scaledIngs = (recipe.ingredients || []).map(i => scaleIngredient(i, ratio));

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${recipe.title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Georgia',serif;max-width:680px;margin:0 auto;padding:2rem;color:#1a1a1a;}
    .header{border-bottom:3px solid #f3722c;padding-bottom:1.2rem;margin-bottom:1.5rem;}
    .logo{font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:#f3722c;font-weight:bold;margin-bottom:0.5rem;}
    h1{font-size:2rem;line-height:1.2;margin-bottom:0.5rem;}
    .intro{color:#666;font-style:italic;font-size:0.95rem;line-height:1.6;}
    .tags{display:flex;flex-wrap:wrap;gap:0.3rem;margin:0.6rem 0;}
    .tag{font-size:0.65rem;border:1px solid #c8a800;color:#c8a800;padding:0.15rem 0.5rem;border-radius:999px;font-family:sans-serif;}
    .meta{display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;margin:1.2rem 0;background:#fafafa;padding:1rem;border-radius:6px;}
    .meta-box{text-align:center;}
    .meta-key{font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;color:#999;margin-bottom:0.2rem;font-family:sans-serif;}
    .meta-val{font-size:0.85rem;font-weight:bold;color:#f3722c;}
    .section-title{font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;color:#f3722c;font-weight:bold;padding-bottom:0.4rem;border-bottom:1px solid #eee;margin:1.5rem 0 0.75rem;font-family:sans-serif;}
    .ing-list{display:grid;grid-template-columns:1fr 1fr;gap:0 1rem;margin-bottom:1.5rem;}
    .grid{display:grid;grid-template-columns:1fr;gap:1.5rem;}
    .step{display:flex;gap:0.75rem;margin-bottom:0.9rem;align-items:flex-start;}
    .step-num{min-width:24px;height:24px;background:#f3722c;color:#fff;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:bold;flex-shrink:0;margin-top:2px;font-family:sans-serif;}
    .step-text{font-size:0.88rem;line-height:1.65;}
    .ing{font-size:0.85rem;padding:0.35rem 0;border-bottom:1px solid #f0f0f0;display:flex;gap:0.5rem;}
    .ing-dot{width:5px;height:5px;border-radius:50%;background:#f3722c;margin-top:6px;flex-shrink:0;}
    .tip-card{display:flex;gap:0.5rem;background:#fff8f5;border:1px solid #fde8d8;border-radius:6px;padding:0.6rem 0.8rem;margin-bottom:0.4rem;font-size:0.83rem;line-height:1.5;}
    .warn-card{display:flex;gap:0.5rem;background:#fffbea;border:1px solid #f0d060;border-radius:6px;padding:0.6rem 0.8rem;margin-bottom:0.4rem;font-size:0.83rem;line-height:1.5;}
    .footer{margin-top:2rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.65rem;color:#bbb;font-family:sans-serif;display:flex;justify-content:space-between;}
    @media print{
      body{font-size:9pt;}
      @page{margin:1.2cm;size:A4;}
      .ing-list{grid-template-columns:1fr 1fr;}
      .step{break-inside:avoid;}
      .tip-card,.warn-card{break-inside:avoid;}
      .footer{break-inside:avoid;}
    }
  </style></head><body>

  <div class="header">
    <div class="logo">🍳 FlavorLab</div>
    <h1>${recipe.title}</h1>
    <p class="intro">${recipe.intro || ""}</p>
    ${tags.length ? `<div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
    <div class="meta">
      <div class="meta-box"><div class="meta-key">Prep</div><div class="meta-val">${recipe.meta?.prep || "—"}</div></div>
      <div class="meta-box"><div class="meta-key">Cook</div><div class="meta-val">${recipe.meta?.cook || "—"}</div></div>
      <div class="meta-box"><div class="meta-key">Serves</div><div class="meta-val">${displayServings}</div></div>
      <div class="meta-box"><div class="meta-key">Level</div><div class="meta-val">${recipe.meta?.difficulty || "—"}</div></div>
    </div>
  </div>

  <div class="section-title">Ingredients (serves ${displayServings})</div>
  <div class="ing-list">
    ${scaledIngs.map(i => `<div class="ing"><div class="ing-dot"></div>${i}</div>`).join("")}
  </div>

  <div class="grid">
    <div>
      <div class="section-title">Method</div>
      ${(recipe.steps || []).map((s, i) => `<div class="step"><div class="step-num">${i + 1}</div><div class="step-text">${s}</div></div>`).join("")}
      ${recipe.tips ? `<div style="background:#fff8f5;border-left:3px solid #f3722c;padding:0.75rem 1rem;margin-top:1rem;font-size:0.85rem;line-height:1.6;color:#555;"><strong>💡 Chef's Tip:</strong> ${recipe.tips}</div>` : ""}

      ${(recipe.proTips || []).length ? `
      <div class="section-title" style="margin-top:1.5rem">💡 Pro Tips</div>
      ${(recipe.proTips || []).map(t => `<div class="tip-card"><span>${t.icon || "💡"}</span><div><strong>${t.title}</strong> — ${t.body}</div></div>`).join("")}` : ""}

      ${(recipe.watchOuts || []).length ? `
      <div class="section-title" style="margin-top:1.5rem;color:#c0392b">⚠️ Watch Out For</div>
      ${(recipe.watchOuts || []).map(w => `<div class="warn-card"><span>${w.icon || "⚠️"}</span><div><strong>${w.title}</strong> — ${w.body}</div></div>`).join("")}` : ""}
    </div>
  </div>

  <div class="footer">
    <span>FlavorLab AI · ${new Date().toLocaleDateString()}</span>
    <span>Nutritional values are estimates only</span>
  </div>

  <script>window.onload=()=>window.print();</script>
  </body></html>`;

  win.document.write(html);
  win.document.close();
}
