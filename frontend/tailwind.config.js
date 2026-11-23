/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AI GLAM Requested Official Palette
        brand: {
          primary: '#B92F60',     // Main buttons, active nav, progress, interactive
          rose: '#C94D78',        // Secondary buttons, hover, gradients, accents
          soft: '#F8DCE5',        // Cards, input backgrounds, borders, soft accents
          blush: '#FFF1F5',       // Main page & section backgrounds
          plum: '#30232A',        // Headings, body text, readable text
        },
        // GlowAI Brand Palette (matching reference screenshot)
        glow: {
          berry: '#962852',       // Primary headline deep berry/magenta
          magenta: '#B33261',     // Primary CTA button deep rose
          magentaHover: '#9F2A54',
          pink: '#E86A92',
          blush: '#FFF0F4',       // Soft pastel blush gradient background
          blushSoft: '#FFF7F9',
          blushDark: '#FFE6ED',
          border: '#F8D7E3',
          slate: '#5D5663',       // Subtitle body text
          dark: '#2D2327',
        },
        ivory: {
          DEFAULT: '#FAF6F1',
          cream: '#FFF0F4',
          warm: '#FAF6F1',
          soft: '#F4ECE4',
          100: '#FAF6F1',
          200: '#E8DDD2',
          300: '#DCCDBF',
        },
        dustyrose: {
          DEFAULT: '#B33261',
          50: '#FFF0F4',
          100: '#FCE4EC',
          200: '#F8D7E3',
          300: '#F1A9C0',
          400: '#E86A92',
          500: '#B33261',
          600: '#962852',
          700: '#7E1F43',
        },
        charcoal: {
          DEFAULT: '#2D2327',
          900: '#2D2327',
          800: '#42373B',
          700: '#5D5663',
          600: '#756D7B',
          500: '#918898',
          400: '#B4ACB9',
          300: '#D5CFD9',
          200: '#EAE6EC',
          100: '#F5F2F6',
        },
      },
      fontFamily: {
        sans: ['"Poppins"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(180, 50, 97, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'float': '0 12px 36px -4px rgba(180, 50, 97, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
