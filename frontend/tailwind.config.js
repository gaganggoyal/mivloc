/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:   '#06152a',
        navy2:  '#0a1f3d',
        card:   '#0b1e38',
        sky:    '#0ea5e9',
        skyl:   '#7dd3fc',
        mint:   '#10b981',
        ice:    '#e0f2fe',
      },
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
