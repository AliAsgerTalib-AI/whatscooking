/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./RecipeGenerator.jsx",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // dynamic accent classes used via `m` token object
    "bg-indigo-600","bg-orange-500","bg-indigo-100","bg-orange-100",
    "bg-indigo-50","bg-orange-50","bg-amber-50",
    "border-indigo-100","border-orange-100","border-amber-100",
    "border-indigo-200","border-orange-200",
    "text-indigo-600","text-orange-500","text-orange-600",
    "text-indigo-700","text-orange-700","text-amber-700",
    "text-indigo-500","text-orange-500",
    "bg-indigo-400","bg-orange-400",
    "bg-indigo-500","bg-orange-500",
    "from-indigo-600","from-orange-500",
    "to-purple-500","to-amber-400",
    "shadow-indigo-200/60","shadow-orange-200/60",
    "shadow-indigo-200/80","shadow-orange-200/80",
    "bg-gradient-to-r","bg-gradient-to-br",
    "from-indigo-50/60","from-orange-50/60",
    "to-purple-50/40","to-amber-50/40",
    "from-indigo-600/8","to-purple-500/8",
    "border-indigo-100","hover:text-indigo-700","hover:text-orange-700",
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
        // legacy tokens — kept for component compatibility
        primary:                  '#111111',
        'on-primary':             '#FFFFFF',
        'primary-container':      '#333333',
        surface:                  '#FAFAF9',
        'surface-container':      '#F4F3F0',
        'surface-container-high': '#ECEAE6',
        outline:                  '#9B9790',
        // new tokens
        'card-border': '#E5E3DF',
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
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
      backgroundImage: {
        'primary-cta': 'linear-gradient(135deg, #111111, #333333)',
        'home-cta':    'linear-gradient(135deg, #F97316, #F59E0B)',
        'pro-cta':     'linear-gradient(135deg, #6366F1, #818CF8)',
      },
      screens: {
        wide: '660px',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-lg': '0 8px 48px rgba(0,0,0,0.08)',
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
