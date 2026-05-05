// ── Design tokens and style helpers ───────────────────────────────────────────
// Palette: warm cream bg · olive green accent (#6B7730) · sage green (#7A9E68)

export const m = {
  heroBadge:    "bg-[#E4EDD6] text-[#6B7730]",
  heroGrad:     "from-[#6B7730] to-[#7A8C3D]",
  chipActive:   "bg-[#6B7730] text-white border-[#6B7730]",
  pillActive:   "bg-[#6B7730] text-white border-[#6B7730]",
  servBtn:      "bg-[#6B7730] text-white border-[#6B7730] shadow-sm",
  ctaBtn:       "bg-[#6B7730] text-white shadow-lg shadow-[#6B7730]/20 hover:bg-[#556020] hover:shadow-xl hover:shadow-[#6B7730]/25 hover:scale-[1.003]",
  resultTint:   "from-[#EBE4D2] to-[#F6F3EA]",
  badge:        "border-[#E6DFD0] bg-[#EBE4D2] text-[#6B5A48]",
  savedBtn:     "bg-[#6B7730] text-white border-[#6B7730]",
  tipCard:      "bg-[#F5F0E4] border border-[#E4DDD0]",
  tipLabel:     "text-[#9E7B38]",
  stepNum:      "bg-[#6B7730]",
  watchCard:    "bg-[#F5EEE4] border border-[#E8DDCC]",
  watchLabel:   "text-[#9E6B48]",
  flavourCard:  "bg-[#EEF5E8] border border-[#C0D5AA]",
  flavourLabel: "text-[#6B7730]",
  kitchenCard:  "bg-[#EEF5E8] border border-[#C0D5AA]",
  kitchenLabel: "text-[#4A6B30]",
  dot:          "bg-[#6B7730]",
  barColor:     "bg-[#6B7730]",
  toast:        "bg-[#3B2D1C]",
  sheetDone:    "bg-[#6B7730] text-white shadow-md",
  footerLink:   "text-[#6B7730] hover:text-[#556020]",
  logoGrad:     "from-[#6B7730] to-[#7A8C3D]",
};

export const card     = "bg-white rounded-2xl border border-[#E6DFD0] shadow-card p-6 mb-4";
export const lbl      = "text-[0.7rem] font-semibold tracking-widest uppercase text-[#8B7A6A] mb-3";
export const secT     = "text-[0.7rem] font-semibold tracking-widest uppercase text-[#8B7A6A] mb-3 pb-2 border-b border-[#E6DFD0]";
export const inputCls = "w-full rounded-xl border border-[#E6DFD0] bg-[#EDE7D5] px-4 py-3 text-base font-[inherit] text-[#3B2D1C] outline-none focus:border-[#6B7730] focus:bg-white transition-colors duration-150 placeholder:text-[#A88E7C]";

export const bdg = (): string =>
  `inline-block rounded-full border text-[0.65rem] uppercase tracking-widest px-2.5 py-0.5 font-bold ${m.badge}`;

export const chipClass = (active: boolean): string =>
  `px-3 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-wide uppercase cursor-pointer font-[inherit] transition-all duration-150 border ${
    active
      ? m.chipActive
      : "bg-[#EBE4D2] text-[#6B5A48] border-[#E6DFD0] hover:border-[#C5BAA8] hover:text-[#3B2D1C]"
  }`;

export const pillClass = (active: boolean): string =>
  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-wide uppercase cursor-pointer font-[inherit] whitespace-nowrap transition-all duration-150 border ${
    active
      ? m.pillActive
      : "bg-[#EBE4D2] text-[#6B5A48] border-[#E6DFD0] hover:border-[#C5BAA8]"
  }`;
