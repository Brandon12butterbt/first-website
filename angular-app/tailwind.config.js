/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          850: '#1a1e2a',
          875: '#161923',
          900: '#0f1119',
          950: '#0c0d13',
        },
        purple: {
          950: '#2e1065',
        },
        emerald: {
          300: '#6ee7b7',
          700: '#047857',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        pink: {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
        },
      },
      blur: {
        '3xl': '64px',
        '4xl': '96px',
        '5xl': '128px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'progress': 'progress 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-progress': 'pulse-progress 2s ease-in-out infinite alternate',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-out': 'fade-out 0.3s ease-in forwards',
        'float': 'float 6s ease-in-out infinite alternate',
        'spin-slow': 'spin 6s linear infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
      },
      keyframes: {
        'pulse': {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '0.3' },
        },
        'progress': {
          '0%': { width: '30%' },
          '100%': { width: '70%' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '100% 0' },
        },
        'pulse-progress': {
          '0%': { width: '30%' },
          '100%': { width: '70%' },
        },
        'fade-in': {
          'from': { 
            opacity: '0',
            transform: 'translate(-50%, -20px)'
          },
          'to': { 
            opacity: '1',
            transform: 'translate(-50%, 0)'
          },
        },
        'fade-out': {
          'from': { opacity: '1' },
          'to': { opacity: '0' },
        },
        'float': {
          '0%': { 
            transform: 'translateY(0px) rotate(0deg)' 
          },
          '50%': { 
            transform: 'translateY(-10px) rotate(2deg)' 
          },
          '100%': { 
            transform: 'translateY(0px) rotate(0deg)' 
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
      transitionDuration: {
        '700': '700ms',
        '1000': '1000ms',
        '2000': '2000ms',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      lineClamp: {
        2: '2',
        3: '3',
      },
      boxShadow: {
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)',
        'feature': '0 0 20px -5px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [],
  important: true,
} 