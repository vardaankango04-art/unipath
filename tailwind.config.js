/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        unipath: {
          bg: '#FAFAFA',            // Main background: clean very light grey
          card: '#FFFFFF',          // Cards: pure white
          surface: '#F4F4F5',       // Subtle off-white / secondary surface
          text: '#09090B',          // Deep black primary text
          secondary: '#71717A',     // Secondary text: medium grey
          border: '#E4E4E7',        // Borders: light grey
          primary: '#09090B',       // Primary buttons: charcoal black
          buttonText: '#FFFFFF',    // Button text
          selected: '#E4E4E7',      // Selected highlight
          route: '#18181B',         // Route highlight
        },
        dark: {
          bg: '#09090B',            // Main background: near-black
          card: '#14171C',          // Cards: dark charcoal
          surface: '#1E232B',       // Secondary dark surface
          text: '#FFFFFF',          // Primary text: crisp white
          secondary: '#A1A1AA',     // Secondary text: muted grey
          border: '#27272A',        // Borders: subtle dark grey
          primary: '#FFFFFF',       // Primary buttons: white
          buttonText: '#09090B',    // Button text: charcoal black
          selected: '#262C36',      // Dark selected highlight
          route: '#FFFFFF',         // Route highlight
          hover: '#1E232B',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 16px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        glossy: '0 8px 32px 0 rgba(0, 0, 0, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        dropdown: '0 14px 34px -4px rgba(0, 0, 0, 0.16), 0 6px 16px -2px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
