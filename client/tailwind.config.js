/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#313338',
          secondary: '#2b2d31',
          tertiary: '#1e1f22',
        },
        header: {
          primary: '#dbdee1',
          secondary: '#949ba4',
        },
        nautilus: '#5865f2',
      }
    },
  },
  plugins: [],
}
