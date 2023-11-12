/** @type {import('tailwindcss').Config} */
module.exports = {
  important: '#extension-root',
  content: [
    "./popup/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      padding: '2rem',
    }
  }
}
