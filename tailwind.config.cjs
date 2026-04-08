/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./RecipeGenerator.jsx",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ── Design tokens ─────────────────────────────────────────────────────────
      colors: {
        fl: {
          gold:         '#f9c74f',
          orange:       '#f3722c',
          red:          '#f94144',
          indigo:       '#818cf8',
          'indigo-deep':'#6366f1',
          green:        '#4ade80',
          teal:         '#34d399',
          amber:        '#fb923c',
          text:         '#f0ede6',
          violet:       '#7c3aed',
        },
      },
      backgroundImage: {
        'app':         'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
        'cta-home':    'linear-gradient(135deg,#f9c74f,#f3722c)',
        'cta-pro':     'linear-gradient(135deg,#818cf8,#6366f1)',
        'pro-banner':  'linear-gradient(90deg,rgba(129,140,248,0.12),rgba(99,102,241,0.08))',
        'result-home': 'linear-gradient(135deg,rgba(249,199,79,0.15),rgba(243,114,44,0.1))',
        'result-pro':  'linear-gradient(135deg,rgba(129,140,248,0.15),rgba(99,102,241,0.08))',
        'sheet':       'linear-gradient(180deg,#1a1730,#141128)',
        'hero-home':   'linear-gradient(90deg,#f9c74f,#f3722c,#f94144)',
        'hero-pro':    'linear-gradient(90deg,#818cf8,#6366f1)',
        'logo':        'linear-gradient(90deg,#f9c74f,#f3722c)',
        'step-home':   'linear-gradient(135deg,#f9c74f,#f3722c)',
        'step-pro':    'linear-gradient(135deg,#818cf8,#6366f1)',
      },
      screens: {
        // Custom breakpoint matching the original 660px collapse point
        'wide': '660px',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        toast: {
          '0%':   { opacity: '0', transform: 'translate(-50%, 12px)' },
          '15%':  { opacity: '1', transform: 'translate(-50%, 0)' },
          '85%':  { opacity: '1' },
          '100%': { opacity: '0' },
        },
        tagPop: {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        proGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(129,140,248,0.3)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(129,140,248,0)' },
        },
      },
      animation: {
        'fade-up':      'fadeUp 0.5s ease',
        'fade-up-md':   'fadeUp 0.4s ease',
        'fade-up-sm':   'fadeUp 0.3s ease',
        'fade-up-xs':   'fadeUp 0.2s ease',
        'fade-up-fast': 'fadeUp 0.15s ease',
        'toast':        'toast 2.2s ease forwards',
        'tag-pop':      'tagPop 0.18s ease',
        'pro-glow':     'proGlow 2s infinite',
      },
    },
  },
  plugins: [],
};
