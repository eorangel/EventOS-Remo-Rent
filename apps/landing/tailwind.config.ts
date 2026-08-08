import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5EEAD4',
          400: '#5EEAD4',
          500: '#14BBA6',
          600: '#22D3BC',
          700: '#1D70B8',
          800: '#123B6D',
          900: '#0B1F3A',
          950: '#050B17',
        },
        accent: {
          500: '#FF6B4A',
          600: '#e85a3a',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
