import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        danger: "hsl(var(--danger))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        "chart-1": "hsl(var(--chart-1))",
        "chart-2": "hsl(var(--chart-2))",
        "chart-3": "hsl(var(--chart-3))",
        "chart-4": "hsl(var(--chart-4))",
        "chart-5": "hsl(var(--chart-5))"
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.5rem"
      },
      boxShadow: {
        soft: "0 18px 50px -24px rgba(15, 23, 42, 0.3)",
        card: "0 10px 30px -18px rgba(15, 23, 42, 0.28)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at 20% 20%, rgba(32, 178, 170, 0.22), transparent 30%), radial-gradient(circle at 80% 0%, rgba(245, 158, 11, 0.2), transparent 24%), linear-gradient(180deg, rgba(250, 250, 249, 0.95), rgba(244, 247, 245, 1))"
      }
    }
  },
  plugins: []
};

export default config;
