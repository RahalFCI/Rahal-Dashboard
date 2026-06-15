/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary amber — high-intent actions, active accents
        primary: '#755700',
        'primary-container': '#FFF3D6',

        // Secondary earth tones
        secondary: '#665e48',
        'secondary-container': '#ede2c5',

        // Tertiary blue accent
        tertiary: '#224478',
        'tertiary-container': '#3c5c91',

        // Semantic error
        error: '#ba1a1a',
        'error-container': '#ffdad6',

        // Warm cream surface stack (Relic Modernism)
        surface: '#fff8f2',
        'surface-lowest': '#ffffff',
        'surface-low': '#fbf2e8',
        'surface-mid': '#f5ede2',
        'surface-high': '#efe7dc',
        'surface-highest': '#eae1d7',

        // Text
        'on-surface': '#1f1b15',
        'on-surface-variant': '#4e4637',
        'inverse-surface': '#343029',
        'inverse-on-surface': '#f8efe5',

        // Borders
        outline: '#7f7666',
        'outline-variant': '#d1c5b2',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '0.5rem',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        ambient: '0 10px 40px rgba(31, 27, 21, 0.06)',
      },
      spacing: {
        sidebar: '240px',
      },
    },
  },
  plugins: [],
};
