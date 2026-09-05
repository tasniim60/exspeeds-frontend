/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        xspeed: {
          900: "#FFFFFF",
          800: "#F9FAFB",
          700: "#F3F4F6",
          600: "#E5E7EB",
          500: "#9CA3AF",
          400: "#6B7280",
          dark: "#251516",
          orange: "#C45B2A",
          "orange-light": "#D4723F",
          "orange-deep": "#A34920",
          cream: "#251516",
          "cream-dim": "#4B5563",
        },
      },
      fontFamily: {
        display: ['var(--font-cairo)', '"Clash Display"', '"General Sans"', 'system-ui', 'sans-serif'],
        body: ['var(--font-cairo)', '"General Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        cairo: ['var(--font-cairo)', 'Cairo', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "count-up": "countUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in": "slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
