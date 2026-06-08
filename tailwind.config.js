/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#755700',
        'primary-container': '#FFDEA0',
        surface: '#F5F6F7',
        'surface-lowest': '#FFFFFF',
        'surface-low': '#EFF1F2',
        'surface-mid': '#E7E9EA',
        'surface-high': '#DFE1E3',
        'on-surface': '#2C2F30',
        'on-surface-variant': '#5C5F61',
        outline: '#C4C7C9',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        ambient: '0 10px 40px rgba(44, 47, 48, 0.06)',
      },
    },
  },
  plugins: [],
};
