/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
      },
      colors: {
        // Midnight Mint Color Palette
        midnight: {
          bg: '#0F172A', // Slate 900 - Background
          surface: '#1E293B', // Slate 800 - Surface/Cards
          border: '#334155', // Slate 700 - Borders
        },
        mint: {
          primary: '#2DD4BF', // Teal 400 - Primary Accent
          secondary: '#38BDF8', // Sky 400 - Secondary Accent
        },
        text: {
          main: '#F8FAFC', // Slate 50 - Text Main
          muted: '#94A3B8', // Slate 400 - Text Muted
        },
        
        // Legacy colors for app compatibility
        obsidian: '#020617',
        surface: '#172554',
        primary: '#3B82F6',
        accent: '#F97316',
        text: '#DBEAFE',
        
        // Keep zinc for compatibility
        zinc: {
          950: '#0F172A', // Midnight background
          900: '#1E293B', // Midnight surface
          800: '#334155', // Midnight border
          700: '#475569',
          600: '#64748B',
          500: '#94A3B8', // Text muted
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC', // Text main
        },
        // Teal for mint primary
        teal: {
          400: '#2DD4BF', // Mint primary
          500: '#14B8A6',
        },
        // Sky for mint secondary
        sky: {
          400: '#38BDF8', // Mint secondary
          500: '#0EA5E9',
        }
      }
    }
  },
  plugins: [],
}

