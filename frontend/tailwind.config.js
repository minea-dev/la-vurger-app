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
        // --- APP CLIENT ---
        vurger: {
          bg: '#FAF7F2',
          surface: '#F2EDE4',
          border: '#E8E0D4',
          primary: '#2A4A35',
          primaryHover: '#3D6B4F',
          muted: '#8AAB96',
          pale: '#C8DDD0',
          dark: '#1A2820'
        },
        // ---APP ADMIN ---
        admin: {
          bg: '#F3F6F8',
          white: '#FFFFFF',
          border: '#DDE3E8',
          border2: '#C8D0D8',
          text: '#191F28',
          text2: '#4A5568',
          text3: '#8A96A3',
          blue: '#0A66C2',
          'blue-lt': '#EBF3FB',
          green: '#057642',
          'green-lt': '#E8F5EE',
          orange: '#B54708',
          'orange-lt': '#FEF3E2',
          red: '#C0392B',
          'red-lt': '#FDEDEB',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        inter: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
