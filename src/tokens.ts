// ── Design tokens and style helpers ───────────────────────────────────────────
// Palette: warm cream bg · forest green accent (#2C5F4A) · warm gold (#B8873A)

export const m = {
  heroBadge:    "bg-[#E8F2ED] text-[#2C5F4A]",
  heroGrad:     "from-[#2C5F4A] to-[#3D7A62]",
  chipActive:   "bg-[#2C5F4A] text-white border-[#2C5F4A]",
  pillActive:   "bg-[#2C5F4A] text-white border-[#2C5F4A]",
  servBtn:      "bg-[#2C5F4A] text-white border-[#2C5F4A] shadow-sm",
  ctaBtn:       "bg-[#2C5F4A] text-white shadow-lg shadow-[#2C5F4A]/20 hover:bg-[#1E4433] hover:shadow-xl hover:shadow-[#2C5F4A]/25 hover:scale-[1.003]",
  resultTint:   "from-[#F5F0E8] to-[#FDFAF5]",
  badge:        "border-[#E5DDD3] bg-[#F5F0E8] text-[#7A6B5E]",
  savedBtn:     "bg-[#2C5F4A] text-white border-[#2C5F4A]",
  tipCard:      "bg-[#FBF7F0] border border-[#EDE5D8]",
  tipLabel:     "text-[#B8873A]",
  stepNum:      "bg-[#2C5F4A]",
  watchCard:    "bg-[#FBF5EF] border border-[#F0E6D5]",
  watchLabel:   "text-[#C97B3A]",
  flavourCard:  "bg-[#F4F9F6] border border-[#D8EBE1]",
  flavourLabel: "text-[#2C5F4A]",
  kitchenCard:  "bg-[#F4F7FB] border border-[#D8E2F0]",
  kitchenLabel: "text-[#4A6B9E]",
  dot:          "bg-[#2C5F4A]",
  barColor:     "bg-[#2C5F4A]",
  toast:        "bg-[#1A1208]",
  sheetDone:    "bg-[#2C5F4A] text-white shadow-md",
  footerLink:   "text-[#2C5F4A] hover:text-[#1E4433]",
  logoGrad:     "from-[#2C5F4A] to-[#3D7A62]",
};

export const card     = "bg-white rounded-2xl border border-[#E5DDD3] shadow-card p-6 mb-4";
export const lbl      = "text-[0.7rem] font-semibold tracking-widest uppercase text-[#9A8878] mb-3";
export const secT     = "text-[0.7rem] font-semibold tracking-widest uppercase text-[#9A8878] mb-3 pb-2 border-b border-[#E5DDD3]";
export const inputCls = "w-full rounded-xl border border-[#E5DDD3] bg-[#F8F4EF] px-4 py-3 text-base font-[inherit] text-[#1A1208] outline-none focus:border-[#2C5F4A] focus:bg-white transition-colors duration-150 placeholder:text-[#B5A898]";

export const bdg = (): string =>
  `inline-block rounded-full border text-[0.65rem] uppercase tracking-widest px-2.5 py-0.5 font-bold ${m.badge}`;

export const chipClass = (active: boolean): string =>
  `px-3 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-wide uppercase cursor-pointer font-[inherit] transition-all duration-150 border ${
    active
      ? m.chipActive
      : "bg-[#F5F0E8] text-[#7A6B5E] border-[#E5DDD3] hover:border-[#C5B9AD] hover:text-[#1A1208]"
  }`;

export const pillClass = (active: boolean): string =>
  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-wide uppercase cursor-pointer font-[inherit] whitespace-nowrap transition-all duration-150 border ${
    active
      ? m.pillActive
      : "bg-[#F5F0E8] text-[#7A6B5E] border-[#E5DDD3] hover:border-[#C5B9AD]"
  }`;
