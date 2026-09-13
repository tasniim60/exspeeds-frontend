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
          800: "#FAFBFC",
          700: "#F1F5F9",
          600: "#E2E8F0",
          500: "#94A3B8",
          400: "#64748B",
          dark: "#0F172A",
          ink: "#1E293B",
          orange: "#C45B2A",
          "orange-light": "#D4723F",
          "orange-deep": "#A34920",
          "orange-ink": "#7A3416",
          cream: "#FAFBFC",
          "cream-dim": "#64748B",
        },
        latte: {
          50: "#FFFFFF",
          100: "#FAFBFC",
          200: "#F1F5F9",
          300: "#E2E8F0",
          400: "#CBD5E1",
        },
      },
      borderRadius: {
        deck: "16px",
        "deck-lg": "24px",
        pill: "9999px",
      },
      boxShadow: {
        deck: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)",
        "deck-sm": "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)",
        "deck-glow": "0 0 0 3px rgba(196,91,42,0.15), 0 10px 25px -5px rgba(196,91,42,0.2)",
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
        "ribbon-scroll": "ribbonScroll 22s linear infinite",
        "deck-float": "deckFloat 7s ease-in-out infinite",
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
        ribbonScroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        deckFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
