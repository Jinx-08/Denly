/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sun: {
          50: '#FFFDF0',
          100: '#FEF8D6',
          200: '#FDEE9E',
          300: '#FCE066',
          primary: '#FED530',
          hover: '#ECC11C',
          deep: '#D6A80C',
        },
        brand: {
          dark: '#1E1B18',
          deep: '#2D2824',
          subtle: '#57514B',
          muted: '#8B8277',
          border: '#EFECE6',
          surface: '#FAF8F5',
          cream: '#FFFDF9',
        },
        pill: {
          peachBg: '#FEEFE3',
          peachText: '#D95D24',
          peachBorder: '#FCD8BF',
          mintBg: '#E7F8EE',
          mintText: '#15803D',
          mintBorder: '#C3EED3',
          roseBg: '#FDECEF',
          roseText: '#BE123C',
          roseBorder: '#FAC6D0',
          skyBg: '#E0F2FE',
          skyText: '#0369A1',
          skyBorder: '#BAE6FD',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0, 0, 0, 0.05)',
        'float': '0 20px 40px -15px rgba(254, 213, 48, 0.35)',
        'card': '0 4px 20px rgba(45, 40, 36, 0.06)',
        'card-hover': '0 16px 36px rgba(45, 40, 36, 0.12)',
      },
    },
  },
  plugins: [],
}
