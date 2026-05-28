/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // RawBlock Design System Colors
        'raw-black': '#000000',
        'raw-white': '#FFFFFF',
        'raw-blue': '#0000FF',
        'raw-green': '#008000',
        'raw-orange': '#FFA500',
        'raw-red': '#FF0000',
        'raw-surface': '#FFFFFF',
        'raw-surface-inverted': '#000000',
        'raw-surface-sunken': '#F0F0F0',
      },
      fontFamily: {
        headline: ['Archivo Black', 'sans-serif'],
        body: ['Work Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      fontSize: {
        'h1': ['64px', { lineHeight: '1.0' }],
        'h2': ['48px', { lineHeight: '1.05' }],
        'h3': ['32px', { lineHeight: '1.1' }],
        'h4': ['22px', { lineHeight: '1.2', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'small': ['14px', { lineHeight: '1.5' }],
        'tiny': ['12px', { lineHeight: '1.4' }],
        'mono': ['15px', { lineHeight: '1.5' }],
      },
      spacing: {
        'sp-1': '4px',
        'sp-2': '8px',
        'sp-3': '16px',
        'sp-4': '24px',
        'sp-5': '40px',
        'sp-6': '64px',
        'sp-7': '80px',
        'sp-8': '120px',
      },
      borderWidth: {
        'thin': '1px',
        'thick': '3px',
        'heavy': '5px',
      },
      borderRadius: {
        'none': '0px',
      },
      boxShadow: {
        'none': 'none',
        'brutal': '4px 4px 0 0 rgba(0, 0, 0, 1)',
      },
      animation: {
        'toast-in': 'toastIn 0.3s ease-out forwards',
      },
      keyframes: {
        toastIn: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
