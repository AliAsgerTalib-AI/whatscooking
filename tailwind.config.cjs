/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./RecipeGenerator.tsx",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    "bg-[#6B7730]","text-[#6B7730]","border-[#6B7730]",
    "bg-[#556020]","text-[#556020]",
    "bg-[#EBE4D2]","bg-[#E4EDD6]","bg-[#F6F3EA]",
    "text-[#6B5A48]","text-[#8B7A6A]","text-[#3B2D1C]",
    "border-[#E6DFD0]","border-[#E0D9C8]",
  ],
  theme: {
    borderRadius: {
      none:    '0px',
      sm:      '6px',
      DEFAULT: '8px',
      md:      '12px',
      lg:      '16px',
      xl:      '20px',
      '2xl':   '24px',
      '3xl':   '32px',
      full:    '9999px',
    },
    extend: {
      colors: {
        primary:                  '#3B2D1C',
        'on-primary':             '#FFFFFF',
        'primary-container':      '#E4EDD6',
        surface:                  '#F6F3EA',
        'surface-container':      '#FFFFFF',
        'surface-container-high': '#EBE4D2',
        outline:                  '#8B7A6A',
        'card-border':            '#E6DFD0',
      },
      fontFamily: {
        sans:    ['"Nunito"', 'system-ui', 'sans-serif'],
        display: ['"Lora"', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-lg':  ['3.5rem',    { lineHeight: '1.05', fontWeight: '800' }],
        'headline-sm': ['1.5rem',    { lineHeight: '1.2',  fontWeight: '700' }],
        'label-sm':    ['0.6875rem', { lineHeight: '1.4',  letterSpacing: '0.06rem' }],
        'label-md':    ['0.75rem',   { lineHeight: '1.4',  letterSpacing: '0.06rem' }],
        'body-md':     ['0.9375rem', { lineHeight: '1.65' }],
      },
      letterSpacing: {
        label: '0.06rem',
      },
      screens: {
        wide: '660px',
      },
      boxShadow: {
        'card':    '0 1px 4px rgba(59,45,28,0.05), 0 6px 24px rgba(59,45,28,0.04)',
        'card-lg': '0 8px 48px rgba(59,45,28,0.09)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        toast: {
          '0%':   { opacity: '0' },
          '10%':  { opacity: '1' },
          '85%':  { opacity: '1' },
          '100%': { opacity: '0' },
        },
        tagPop: {
          from: { opacity: '0', transform: 'scale(0.88)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'fade-up':  'fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'toast':    'toast 2.2s ease-out forwards',
        'tag-pop':  'tagPop 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
