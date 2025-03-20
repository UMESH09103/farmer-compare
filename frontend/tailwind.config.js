// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // Scan all JS, TS, JSX, and TSX files in src/
    ],
    theme: {
      extend: {
        colors: {
          primary: '#2D3748',
          secondary: '#48BB78',
          background: '#F7FAFC',
          card: '#FFFFFF',
          text: '#1A202C',
          muted: '#718096',
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };