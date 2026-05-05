/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./RecipeGenerator.jsx",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    "bg-[#2C5F4A]","text-[#2C5F4A]","border-[#2C5F4A]",
    "bg-[#1E4433]","text-[#1E4433]",
    "bg-[#F5F0E8]","bg-[#E8F2ED]","bg-[#FDFAF5]",
    "text-[#7A6B5E]","text-[#9A8878]","text-[#1A1208]",
    "border-[#E5DDD3]","border-[#EDE8E0]",
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
        primary:                  '#1A1208',
        'on-primary':             '#FFFFFF',
        'primary-container':      '#E8F2ED',
        surface:                  '#FDFAF5',
        'surface-container':      '#FFFFFF',
        'surface-container-high': '#F5F0E8',
        outline:                  '#9A8878',
        'card-border':            '#E5DDD3',
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
      screens: {
        wide: '660px',
      },
      boxShadow: {
        'card':    '0 1px 4px rgba(26,18,8,0.05), 0 6px 24px rgba(26,18,8,0.04)',
        'card-lg': '0 8px 48px rgba(26,18,8,0.08)',
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
