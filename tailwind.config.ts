import { Config } from 'tailwindcss';
import tailwindAnimate from "tailwindcss-animate";

export default {
	darkMode: "class",
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
			extend: {
			colors: {
				border: "hsl(280 20% 85%)",
				input: "hsl(280 15% 90%)",
				ring: "hsl(320 70% 60%)",
				background: "hsl(270 25% 8%)",
				foreground: "hsl(320 15% 95%)",
				primary: {
					DEFAULT: "hsl(320 70% 60%)",
					foreground: "hsl(0 0% 100%)",
					glow: "hsl(320 70% 70%)",
				},
				secondary: {
					DEFAULT: "hsl(280 60% 25%)",
					foreground: "hsl(320 15% 95%)",
				},
				destructive: {
					DEFAULT: "hsl(0 70% 60%)",
					foreground: "hsl(0 0% 100%)",
				},
				muted: {
					DEFAULT: "hsl(280 15% 15%)",
					foreground: "hsl(320 10% 70%)",
				},
				accent: {
					DEFAULT: "hsl(340 80% 65%)",
					foreground: "hsl(0 0% 100%)",
				},
				popover: {
					DEFAULT: "hsl(280 25% 12%)",
					foreground: "hsl(320 15% 95%)",
				},
				card: {
					DEFAULT: "hsl(280 25% 12%)",
					foreground: "hsl(320 15% 95%)",
				},
				sidebar: {
					DEFAULT: "hsl(0 0% 98%)",
					foreground: "hsl(240 5.3% 26.1%)",
					primary: "hsl(240 5.9% 10%)",
					"primary-foreground": "hsl(0 0% 98%)",
					accent: "hsl(240 4.8% 95.9%)",
					"accent-foreground": "hsl(240 5.9% 10%)",
					border: "hsl(220 13% 91%)",
					ring: "hsl(217.2 91.2% 59.8%)",
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsl(345 85% 65% / 0.3)' 
					},
					'50%': { 
						boxShadow: '0 0 40px hsl(345 85% 65% / 0.6)' 
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'slide-up': 'slide-up 0.6s ease-out'
			},
			backgroundImage: {
				"hero-gradient":
					"linear-gradient(135deg, hsl(320 70% 60%) 0%, hsl(280 60% 50%) 50%, hsl(340 80% 65%) 100%)",
				"love-gradient": "linear-gradient(135deg, hsl(320 70% 60%), hsl(340 80% 65%))",
				"card-gradient": "linear-gradient(180deg, hsl(280 25% 12%) 0%, hsl(280 20% 15%) 100%)",
			},
			boxShadow: {
				primary: "0 10px 30px -10px hsl(320 70% 60% / 0.4)",
				glow: "0 0 40px hsl(320 70% 70% / 0.5)",
				soft: "0 4px 20px -8px hsl(320 15% 5% / 0.3)",
			},
		}
	},
	plugins: [tailwindAnimate],
} satisfies Config;
