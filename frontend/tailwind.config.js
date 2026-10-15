/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07080a',
          900: '#0c0e12',
          850: '#11141a',
          800: '#171b22',
          750: '#1e232d',
          700: '#262d3a',
          600: '#384252',
        },
        neon: {
          400: '#c8f53c',
          500: '#b2ea25',
          600: '#94cb14',
          glow: 'rgba(178, 234, 37, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'neon-sm': '0 0 12px rgba(178, 234, 37, 0.2)',
        'neon-md': '0 0 24px rgba(178, 234, 37, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at 50% 0%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
