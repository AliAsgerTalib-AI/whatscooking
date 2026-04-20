import { scaleIngredient } from "../utils/scaleIngredient.js";

/**
 * Opens a new window with a branded shopping list and auto-triggers print.
 */
export function exportShoppingList(recipe, displayServings, ratio) {
  const win = window.open("", "_blank");
  if (!win) return;

  const scaledIngs = (recipe.ingredients || []).map(i => scaleIngredient(i, ratio));

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>Shopping List — ${recipe.title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Georgia',serif;max-width:520px;margin:0 auto;padding:2rem;color:#1a1a1a;}
    .header{border-bottom:3px solid #f3722c;padding-bottom:1rem;margin-bottom:1.5rem;}
    .logo{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:#f3722c;font-weight:bold;margin-bottom:0.4rem;font-family:sans-serif;}
    h1{font-size:1.4rem;line-height:1.2;margin-bottom:0.3rem;}
    .serves{font-size:0.75rem;color:#999;font-family:sans-serif;}
    .ing-list{display:grid;grid-template-columns:1fr 1fr;gap:0 1.5rem;margin-top:1rem;}
    .ing{display:flex;gap:0.6rem;padding:0.4rem 0;border-bottom:1px solid #f0f0f0;font-size:0.88rem;align-items:flex-start;}
    .box{width:14px;height:14px;border:1.5px solid #ccc;border-radius:3px;flex-shrink:0;margin-top:2px;}
    .footer{margin-top:2rem;padding-top:0.8rem;border-top:1px solid #eee;font-size:0.6rem;color:#bbb;font-family:sans-serif;}
    @media print{
      body{font-size:9pt;}
      @page{margin:1.2cm;size:A4;}
      .ing{break-inside:avoid;}
    }
  </style></head><body>
  <div class="header">
    <div class="logo">🛒 FlavorLab — Shopping List</div>
    <h1>${recipe.title}</h1>
    <div class="serves">Serves ${displayServings}</div>
  </div>
  <div class="ing-list">
    ${scaledIngs.map(i => `<div class="ing"><div class="box"></div>${i}</div>`).join("")}
  </div>
  <div class="footer">FlavorLab AI · ${new Date().toLocaleDateString()}</div>
  <script>window.onload=()=>window.print();</script>
  </body></html>`;

  win.document.write(html);
  win.document.close();
}
