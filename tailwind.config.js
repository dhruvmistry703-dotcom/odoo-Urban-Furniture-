/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F1F5F9',
          100: '#E2E8F0',
          200: '#CBD5E1',
          300: '#94A3B8',
          400: '#64748B',
          500: '#475569',
          600: '#334155',
          700: '#1E293B',
          800: '#0F172A',
          900: '#0B1120',
          950: '#060A14',
        },
        brand: {
          green: '#16A34A',
          'green-hover': '#15803D',
          'green-light': '#DCFCE7',
          orange: '#F59E0B',
          'orange-light': '#FEF3C7',
          red: '#EF4444',
          'red-light': '#FEE2E2',
          blue: '#3B82F6',
          'blue-light': '#DBEAFE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
