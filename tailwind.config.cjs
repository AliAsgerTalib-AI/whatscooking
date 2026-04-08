/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./RecipeGenerator.jsx",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    // ── Absolute Zero Rule — no border-radius anywhere ─────────────────────────
    borderRadius: {
      none:    '0px',
      DEFAULT: '0px',
      sm:      '0px',
      md:      '0px',
      lg:      '0px',
      xl:      '0px',
      '2xl':   '0px',
      '3xl':   '0px',
      full:    '0px',
    },
    extend: {
      // ── Design tokens ──────────────────────────────────────────────────────────
      colors: {
        primary:                   '#000000',
        'on-primary':              '#e2e2e2',
        'primary-container':       '#3b3b3b',
        surface:                   '#f9f9f9',
        'surface-container':       '#eeeeee',
        'surface-container-high':  '#e8e8e8',
        outline:                   '#777777',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // ── Type scale ─────────────────────────────────────────────────────────────
      fontSize: {
        'display-lg':  ['3.5rem',    { lineHeight: '1.05', fontWeight: '800' }],
        'headline-sm': ['1.5rem',    { lineHeight: '1.2',  fontWeight: '700' }],
        'label-sm':    ['0.6875rem', { lineHeight: '1.4',  letterSpacing: '0.05rem' }],
        'label-md':    ['0.75rem',   { lineHeight: '1.4',  letterSpacing: '0.05rem' }],
        'body-md':     ['0.875rem',  { lineHeight: '1.6' }],
      },
      letterSpacing: {
        label: '0.05rem',
      },
      // ── CTA gradient mimics ink density variation of physical print ────────────
      backgroundImage: {
        'primary-cta': 'linear-gradient(to bottom, #000000, #3b3b3b)',
      },
      screens: {
        wide: '660px',
      },
      // ── Hard-cut animations (0.1s linear) ─────────────────────────────────────
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        toast: {
          '0%':   { opacity: '0' },
          '10%':  { opacity: '1' },
          '85%':  { opacity: '1' },
          '100%': { opacity: '0' },
        },
        tagPop: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.1s linear',
        'toast':   'toast 2.2s linear forwards',
        'tag-pop': 'tagPop 0.1s linear',
      },
    },
  },
  plugins: [],
};
