// ── Design tokens and style helpers (Home mode) ──────────────────────────────

export const m = {
  logoGrad:    "from-orange-500 to-amber-400",
  heroBadge:   "bg-orange-100 text-orange-700",
  heroGrad:    "from-orange-500 to-amber-400",
  chipActive:  "bg-orange-500 text-white border-transparent shadow-sm",
  pillActive:  "bg-orange-500 text-white border-transparent",
  servBtn:     "bg-orange-500 text-white border-transparent shadow-md",
  ctaBtn:      "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-900/40 hover:shadow-xl hover:shadow-orange-900/60 hover:scale-[1.005]",
  resultTint:  "from-[#1e1800]/80 to-[#181400]/40",
  badge:       "border-orange-200 bg-orange-50 text-orange-700",
  savedBtn:    "bg-orange-500 text-white border-transparent",
  tipCard:     "bg-[#1e1a0e] border border-[#302a18]",
  tipLabel:    "text-orange-400",
  stepNum:     "bg-orange-500",
  watchCard:   "bg-[#1e1a0e] border border-[#302a18]",
  watchLabel:  "text-amber-400",
  flavourCard: "bg-[#0f1a0f] border border-[#1a2e1a]",
  flavourLabel:"text-green-400",
  kitchenCard: "bg-[#0e1620] border border-[#182030]",
  kitchenLabel:"text-sky-400",
  dot:         "bg-orange-400",
  barColor:    "bg-orange-500",
  toast:       "bg-orange-500",
  sheetDone:   "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md",
  footerLink:  "text-orange-500 hover:text-orange-700",
};

export const card     = "bg-[#1c1c1c] rounded-2xl border border-[#2e2e2e] shadow-card p-6 mb-4";
export const lbl      = "text-[0.75rem] font-semibold tracking-widest uppercase text-slate-500 mb-3";
export const secT     = "text-[0.75rem] font-semibold tracking-widest uppercase text-slate-500 mb-3 pb-2 border-b border-[#2e2e2e]";
export const inputCls = "w-full rounded-xl border border-[#333] bg-[#222] px-4 py-3 text-base font-[inherit] text-slate-100 outline-none focus:border-[#555] focus:bg-[#1a1a1a] transition-colors duration-150 placeholder:text-slate-600";

export const bdg = (): string =>
  `inline-block rounded-full border text-[0.65rem] uppercase tracking-widest px-2.5 py-0.5 font-bold ${m.badge}`;

export const chipClass = (active: boolean): string =>
  `px-3 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-wide uppercase cursor-pointer font-[inherit] transition-all duration-150 border ${
    active ? m.chipActive : "bg-[#222] text-slate-300 border-[#333] hover:border-[#555]"
  }`;

export const pillClass = (active: boolean): string =>
  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-wide uppercase cursor-pointer font-[inherit] whitespace-nowrap transition-all duration-150 border ${
    active ? m.pillActive : "bg-[#222] text-slate-300 border-[#333]"
  }`;
