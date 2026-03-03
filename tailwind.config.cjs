/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        sm: '320px',
        md: '640px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      spacing: {
        50: '12.5rem',
        200: '50rem',
      },
      colors: {
        gray: {
          DEFAULT: '#6b7280',
          2: '#e5e7eb',
          3: '#d1d5db',
          4: '#9ca3af',
          5: '#6b7280',
          7: '#374151',
          8: '#1f2937',
          9: '#111827',
        },
        blue: {
          DEFAULT: '#3b82f6',
          4: '#60a5fa',
          5: '#3b82f6',
        },
        yellow: {
          DEFAULT: '#f59e0b',
          3: '#fcd34d',
          4: '#fbbf24',
          5: '#f59e0b',
          7: '#b45309',
        },
        red: {
          4: '#f87171',
          7: '#b91c1c',
        },
        coolGray: {
          DEFAULT: '#94a3b8',
        },
      },
    },
  },
  plugins: [],
}
