/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./views/**/*.{js,ts,jsx,tsx}"],
	darkMode: ["class"],
	theme: {
		extend: {
			fontFamily: {
				primary: ["Metropolis", "sans-serif"],
				title: ["Forte", "sans-serif"],
				subtitle: ["Segoe-Script", "sans-serif"],
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					1: "hsl(var(--chart-1))",
					2: "hsl(var(--chart-2))",
					3: "hsl(var(--chart-3))",
					4: "hsl(var(--chart-4))",
					5: "hsl(var(--chart-5))",
				},
				bagan: "#F9B00E",
				bagan_dark: "#C38805",
				bagan_light: "#FCF8D9",
			},
			backgroundImage: {
				banner7:
					'url("https://res.cloudinary.com/dzgcvfgha/image/upload/f_webp,f_auto,q_auto/v1/Bagan/flrbonprdnba6ds0m2sc")',
				cebada: 'url("https://res.cloudinary.com/dzgcvfgha/image/upload/f_auto,q_auto/v1/Bagan/z9sxddor9unauu4hmidk")',
			},
			dropShadow: {
				white: "0 25px 25px rgba(255, 255, 255, 1)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
}
