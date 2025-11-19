import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF6B35',
          green: '#4CAF50',
          primary: '#1E40AF',
          secondary: '#64748B',
        },
        naira: {
          green: '#008751',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'touch': '44px',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
};

export default config;
