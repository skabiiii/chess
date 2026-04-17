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
        'chess-dark-bg': 'hsl(220, 18%, 12%)',
        'chess-light-bg': 'hsl(0, 0%, 98%)',
        'chess-board-dark': 'hsl(210, 20%, 25%)',
        'chess-board-light': 'hsl(210, 30%, 85%)',
        'chess-accent': 'hsl(200, 100%, 50%)',
        'chess-glow': 'hsl(200, 100%, 60%)',
      },
      animation: {
        'piece-move': 'moveIn 0.3s ease-out',
        'capture': 'capture 0.2s ease-in-out',
      },
      keyframes: {
        moveIn: {
          '0%': { transform: 'translate3d(0,0,0)', opacity: 1 },
          '100%': { transform: 'translate3d(0,0,0)', opacity: 1 },
        },
        capture: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.2)', opacity: 0.7 },
          '100%': { transform: 'scale(0)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
