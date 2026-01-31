/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#FFD700',
          500: '#D4AF37', // Metallic gold
          600: '#B8860B', // Dark goldenrod
        },
        slate: {
          850: '#151b23',
          900: '#0F1419',
          950: '#020617',
        },
        profit: {
          500: '#10B981',
          600: '#059669',
        },
        loss: {
          500: '#EF4444',
          600: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'gold-gradient': 'linear-gradient(to right, #D4AF37, #B8860B)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
