import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        paper: "#FFFFFF",
        mute: "#6B6B6B",
        accent: "var(--accent)",
      },
      fontFamily: {
        display: ["var(--font-archivo-black)", "sans-serif"],
        sans: ["var(--font-space-grotesk)", "sans-serif"],
      },
      letterSpacing: {
        logo: "0.08em",
        nav: "0.12em",
      },
    },
  },
  plugins: [],
};
export default config;
