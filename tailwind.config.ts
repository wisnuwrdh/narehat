import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3525cd",
          light: "#eeecfb",
        },
        accent: {
          DEFAULT: "#8b85e8",
        },
        muted: {
          DEFAULT: "#64748b",
          light: "#94a3b8",
        },
        border: {
          subtle: "#f1f5f9",
          light: "#e2e8f0",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
