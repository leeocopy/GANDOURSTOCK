/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#05070a',
        'cyan-neon': '#00f2ff',
        'cyan-dim': '#00c8d4',
        'glass-border': 'rgba(0, 242, 255, 0.15)',
        'surface': 'rgba(255,255,255,0.04)',
        'surface-hover': 'rgba(0, 242, 255, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 242, 255, 0.15), 0 0 60px rgba(0, 242, 255, 0.05)',
        'cyan-glow-sm': '0 0 8px rgba(0, 242, 255, 0.25)',
        'card': '0 8px 32px rgba(0,0,0,0.5)',
      },
      backdropBlur: {
        xs: '4px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out 2s infinite',
        'float-delay2': 'float 6s ease-in-out 4s infinite',
        'pulse-cyan': 'pulseCyan 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseCyan: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,242,255,0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(0,242,255,0.5)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
