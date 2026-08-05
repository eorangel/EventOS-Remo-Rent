import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f3',
          100: '#fce8e6',
          200: '#f9d4d0',
          300: '#f4b3ac',
          400: '#ec857a',
          500: '#df5f52',
          600: '#cb4336',
          700: '#aa352b',
          800: '#8d3029',
          900: '#762d28',
          950: '#401410',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
