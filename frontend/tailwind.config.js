/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./projects/lavurger-client/src/**/*.{html,ts}",
    "./projects/lavurger-admin/src/**/*.{html,ts}",
    "./projects/shared/src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        vurger: {
          bg: '#FAF7F2',        // --ch
          surface: '#F2EDE4',   // --ch2
          border: '#E8E0D4',    // --ch3
          primary: '#2A4A35',   // --fo
          primaryHover: '#3D6B4F', // --fol
          muted: '#8AAB96',     // --fom
          pale: '#C8DDD0',      // --fop
          dark: '#1A2820'       // --ink
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      }
    },
  },
  plugins: [],
}
