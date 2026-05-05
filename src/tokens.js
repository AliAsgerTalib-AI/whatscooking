// ── Design tokens and style helpers (Home mode) ──────────────────────────────
// Kept at module level so sub-components can import them without prop-drilling.

export const m = {
  logoGrad:    "from-orange-500 to-amber-400",
  heroBadge:   "bg-orange-100 text-orange-700",
  heroGrad:    "from-orange-500 to-amber-400",
  chipActive:  "bg-orange-500 text-white border-transparent shadow-sm",
  pillActive:  "bg-orange-500 text-white border-transparent",
  servBtn:     "bg-orange-500 text-white border-transparent shadow-md",
  ctaBtn:      "bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-lg shadow-green-200/60 hover:shadow-xl hover:shadow-green-200/80 hover:scale-[1.005]",
  resultTint:  "from-orange-50/60 to-amber-50/40",
  badge:       "border-orange-200 bg-orange-50 text-orange-700",
  savedBtn:    "bg-orange-500 text-white border-transparent",
  tipCard:     "bg-orange-50 border border-orange-100",
  tipLabel:    "text-orange-600",
  stepNum:     "bg-orange-500",
  watchCard:   "bg-amber-50 border border-amber-100",
  watchLabel:  "text-amber-700",
  flavourCard: "bg-green-50 border border-green-100",
  flavourLabel:"text-green-700",
  kitchenCard: "bg-sky-50 border border-sky-100",
  kitchenLabel:"text-sky-700",
  dot:         "bg-orange-400",
  barColor:    "bg-orange-500",
  toast:       "bg-orange-500",
  sheetDone:   "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md",
  footerLink:  "text-orange-500 hover:text-orange-700",
};

export const card     = "bg-white rounded-2xl border border-slate-200 shadow-card p-6 mb-4";
export const lbl      = "text-[0.7rem] font-semibold tracking-widest uppercase text-slate-400 mb-3";
export const secT     = "text-[0.7rem] font-semibold tracking-widest uppercase text-slate-400 mb-3 pb-2 border-b border-slate-100";
export const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-[inherit] outline-none focus:border-slate-400 focus:bg-slate-50/50 transition-colors duration-150";

export const bdg = () =>
  `inline-block rounded-full border text-[0.65rem] uppercase tracking-widest px-2.5 py-0.5 font-bold ${m.badge}`;

export const chipClass = (active) =>
  `px-3 py-1.5 rounded-full text-[0.7rem] font-semibold tracking-wide uppercase cursor-pointer font-[inherit] transition-all duration-150 border ${
    active ? m.chipActive : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
  }`;

export const pillClass = (active) =>
  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.7rem] font-semibold tracking-wide uppercase cursor-pointer font-[inherit] whitespace-nowrap transition-all duration-150 border ${
    active ? m.pillActive : "bg-white text-slate-600 border-slate-200"
  }`;
