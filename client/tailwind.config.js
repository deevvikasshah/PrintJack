/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        brown: {
          50: '#fdf8f3',
          100: '#faf0e6',
          200: '#f3e1cc',
          300: '#e8cbb0',
          400: '#dab892',
          500: '#c9a270',
          600: '#b88b58',
          700: '#9d7044',
          800: '#825a3b',
          900: '#6b4b35',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        gold: '#D4A843',
        paper: {
          50: '#FCFBF9',
          100: '#F7F4EF',
          200: '#EFEAE1',
          300: '#E3DBCB',
          400: '#D4C7AE',
          500: '#BFAC8A',
        },
        ink: {
          50: '#fdf8f3',
          100: '#faf0e6',
          200: '#f3e1cc',
          300: '#e8cbb0',
          400: '#dab892',
          500: '#c9a270',
          600: '#b88b58',
          700: '#9d7044',
          800: '#825a3b',
          900: '#6b4b35',
        },
        pj: {
          green: '#EAB308',
          sage: '#F5F0E1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12)',
        'nav': '0 2px 20px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
