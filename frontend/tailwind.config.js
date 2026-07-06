/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Driven by CSS variables so the whole palette can flip between the
        // dark (default) and light themes — see globals.css. RGB channels are
        // used so Tailwind's /opacity modifiers (e.g. bg-card/80) keep working.
        navy:   'rgb(var(--c-navy) / <alpha-value>)',
        navy2:  'rgb(var(--c-navy2) / <alpha-value>)',
        card:   'rgb(var(--c-card) / <alpha-value>)',
        sky:    'rgb(var(--c-sky) / <alpha-value>)',
        skyl:   'rgb(var(--c-skyl) / <alpha-value>)',
        mint:   'rgb(var(--c-mint) / <alpha-value>)',
        ice:    'rgb(var(--c-ice) / <alpha-value>)',
      },
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
