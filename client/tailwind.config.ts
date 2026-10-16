import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        os: {
          bg: "#0a0e14",
          surface: "#111822",
          border: "#1e2a3a",
          text: "#c5d0dc",
          muted: "#5c6e81",
          accent: "#0ea5e9",
          accentDim: "#0c8bc7",
          green: "#4ade80",
          red: "#f87171",
          amber: "#fbbf24",
        },
        desk: {
          wood: "#3d2b1f",
          woodLight: "#5c3d2e",
          woodDark: "#2a1a10",
          paper: "#f5f0e6",
          paperDark: "#e8e0d0",
          leather: "#2c1810",
          brass: "#b5882a",
          green: "#1a3c28",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
        sans: ["'Inter'", "'Segoe UI'", "system-ui", "sans-serif"],
      },
      animation: {
        "blink": "blink 1s step-end infinite",
        "scan": "scan 8s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
        "typewriter": "typewriter 2s steps(40) forwards",
      },
      keyframes: {
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } },
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100vh)" } },
        glow: { "0%": { boxShadow: "0 0 5px #0ea5e9" }, "100%": { boxShadow: "0 0 20px #0ea5e9, 0 0 40px #0ea5e944" } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        typewriter: { "0%": { width: "0" }, "100%": { width: "100%" } },
      },
    },
  },
  plugins: [],
};

export default config;
