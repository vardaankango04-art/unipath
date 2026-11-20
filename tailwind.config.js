/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#291C0E',
        bark: '#6E473B',
        taupe: '#A78D78',
        stone: '#BEB5A9',
        sand: '#E1D4C2',
        cream: '#F4E6D2',
        paper: '#FBF4EA', // lightest tint of cream, for cards and inputs
      },
      fontFamily: {
        display: ['Aboreto', 'Georgia', 'serif'],
        accent: ['Arapey', 'Georgia', 'serif'],
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.3em',
      },
    },
  },
  plugins: [],
};
