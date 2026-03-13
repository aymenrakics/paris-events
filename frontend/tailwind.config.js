/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4f3',
          100: '#fce7e4',
          200: '#fad3cd',
          300: '#f5b3a9',
          400: '#ed8777',
          500: '#e0604d',
          600: '#cc4430',
          700: '#ab3625',
          800: '#8e3023',
          900: '#762d23',
          950: '#40140e',
        },
        accent: {
          50: '#f0f5fe',
          100: '#dde8fc',
          200: '#c3d8fa',
          300: '#9ac0f6',
          400: '#6a9fef',
          500: '#477de8',
          600: '#3260dc',
          700: '#294dca',
          800: '#2740a4',
          900: '#253a82',
          950: '#1b254f',
        },
        dark: {
          50: '#f6f6f9',
          100: '#ececf2',
          200: '#d5d5e2',
          300: '#b0b0c9',
          400: '#8585ab',
          500: '#666691',
          600: '#525178',
          700: '#434262',
          800: '#3a3953',
          900: '#333247',
          950: '#1e1d2d',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
