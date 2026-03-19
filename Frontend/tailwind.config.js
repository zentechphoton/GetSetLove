/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          purple: '#9d00ff',
          pink: '#ff006e',
          orange: '#ff6b35',
          hoverPurple: '#7d00cc',
          lightPurple: '#b933ff',
        },
        // Status Colors
        status: {
          red: '#ef4444',
          green: '#10b981',
          yellow: '#fbbf24',
        },
        // Badge Colors
        badge: {
          blue: {
            bg: '#dbeafe',
            text: '#1e40af',
          },
          green: {
            bg: '#dcfce7',
            text: '#166534',
          },
          purple: {
            bg: '#f3e8ff',
            text: '#7c3aed',
          },
          orange: {
            bg: '#fed7aa',
            text: '#c2410c',
          },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #9d00ff 0%, #ff006e 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #b933ff 0%, #9d00ff 100%)',
        'gradient-warm': 'linear-gradient(135deg, #ff006e 0%, #9d00ff 100%)',
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(157, 0, 255, 0.4)',
      },
      borderColor: {
        'brand': 'rgba(157, 0, 255, 0.2)',
      },
    },
  },
  plugins: [],
}