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
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
				xl: '2.5rem',
				'2xl': '3rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px',
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1400px',
			// Breakpoints específicos para apps de citas y Android
			'mobile': '480px',
			'tablet': '768px',
			'desktop': '1024px',
			'wide': '1440px',
			// Breakpoints específicos para Android
			'android-sm': '360px',
			'android-md': '411px',
			'android-lg': '480px',
		},
			extend: {
			// Tipografía profesional para apps de citas
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
				heading: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
				'8xl': ['6rem', { lineHeight: '1' }],
				'9xl': ['8rem', { lineHeight: '1' }],
				// Tamaños específicos para la app
				'hero': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'display': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
				'heading': ['1.5rem', { lineHeight: '1.3' }],
				'body': ['1rem', { lineHeight: '1.6' }],
				'caption': ['0.875rem', { lineHeight: '1.4' }],
			},
			fontWeight: {
				thin: '100',
				extralight: '200',
				light: '300',
				normal: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
				extrabold: '800',
				black: '900',
			},
			letterSpacing: {
				tighter: '-0.05em',
				tight: '-0.025em',
				normal: '0em',
				wide: '0.025em',
				wider: '0.05em',
				widest: '0.1em',
			},
			lineHeight: {
				none: '1',
				tight: '1.25',
				snug: '1.375',
				normal: '1.5',
				relaxed: '1.625',
				loose: '2',
			},
			// Espaciado optimizado para apps de citas
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
				'144': '36rem',
			},
			// Z-index personalizado
			zIndex: {
				'60': '60',
				'70': '70',
				'80': '80',
				'90': '90',
				'100': '100',
			},
			colors: {
				// Sistema de colores profesional para apps de citas
				border: "hsl(0 0% 90%)",
				input: "hsl(0 0% 95%)",
				ring: "hsl(340 85% 65%)",
				background: "hsl(0 0% 100%)",
				foreground: "hsl(0 0% 10%)",
				
				// Colores primarios optimizados para citas
				primary: {
					DEFAULT: "hsl(340 85% 65%)", // Rosa vibrante para amor
					foreground: "hsl(0 0% 100%)",
					glow: "hsl(340 85% 75%)",
					light: "hsl(340 85% 85%)",
					dark: "hsl(340 85% 45%)",
				},
				
				// Colores secundarios elegantes
				secondary: {
					DEFAULT: "hsl(280 60% 25%)", // Púrpura sofisticado
					foreground: "hsl(0 0% 100%)",
					light: "hsl(280 60% 35%)",
					dark: "hsl(280 60% 15%)",
				},
				
				// Colores de estado mejorados
				destructive: {
					DEFAULT: "hsl(0 85% 60%)", // Rojo más vibrante
					foreground: "hsl(0 0% 100%)",
				},
				
				muted: {
					DEFAULT: "hsl(0 0% 96%)", // Gris muy claro
					foreground: "hsl(0 0% 45%)",
				},
				
				accent: {
					DEFAULT: "hsl(45 95% 60%)", // Dorado elegante
					foreground: "hsl(0 0% 100%)",
					light: "hsl(45 95% 70%)",
					dark: "hsl(45 95% 50%)",
				},
				
				popover: {
					DEFAULT: "hsl(0 0% 100%)",
					foreground: "hsl(0 0% 10%)",
				},
				
				card: {
					DEFAULT: "hsl(0 0% 100%)",
					foreground: "hsl(0 0% 10%)",
				},
				
				// Colores específicos para la app
				love: {
					DEFAULT: "hsl(340 85% 65%)",
					foreground: "hsl(0 0% 100%)",
					light: "hsl(340 85% 85%)",
					dark: "hsl(340 85% 45%)",
				},
				
				passion: {
					DEFAULT: "hsl(320 85% 65%)",
					foreground: "hsl(0 0% 100%)",
					light: "hsl(320 85% 85%)",
					dark: "hsl(320 85% 45%)",
				},
				
				romance: {
					DEFAULT: "hsl(280 70% 60%)",
					foreground: "hsl(0 0% 100%)",
					light: "hsl(280 70% 80%)",
					dark: "hsl(280 70% 40%)",
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
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				// Animaciones profesionales para apps de citas
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsl(340 85% 65% / 0.3)' 
					},
					'50%': { 
						boxShadow: '0 0 40px hsl(340 85% 65% / 0.6)' 
					}
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'heart-beat': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.1)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'slide-up': 'slide-up 0.6s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'heart-beat': 'heart-beat 1s ease-in-out infinite',
				'shimmer': 'shimmer 2s ease-in-out infinite',
				'wiggle': 'wiggle 0.5s ease-in-out infinite'
			},
			backgroundImage: {
				// Gradientes profesionales para apps de citas
				"hero-gradient":
					"linear-gradient(135deg, hsl(340 85% 65%) 0%, hsl(320 85% 65%) 50%, hsl(280 70% 60%) 100%)",
				"love-gradient": "linear-gradient(135deg, hsl(340 85% 65%), hsl(320 85% 65%))",
				"passion-gradient": "linear-gradient(135deg, hsl(320 85% 65%), hsl(280 70% 60%))",
				"romance-gradient": "linear-gradient(135deg, hsl(280 70% 60%), hsl(340 85% 65%))",
				"card-gradient": "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 98%) 100%)",
				"glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
				"premium-gradient": "linear-gradient(135deg, hsl(45 95% 60%) 0%, hsl(340 85% 65%) 100%)",
			},
			boxShadow: {
				// Sombras profesionales para apps de citas
				primary: "0 10px 30px -10px hsl(340 85% 65% / 0.4)",
				glow: "0 0 40px hsl(340 85% 75% / 0.5)",
				soft: "0 4px 20px -8px hsl(0 0% 0% / 0.1)",
				love: "0 8px 25px -8px hsl(340 85% 65% / 0.3)",
				passion: "0 8px 25px -8px hsl(320 85% 65% / 0.3)",
				romance: "0 8px 25px -8px hsl(280 70% 60% / 0.3)",
				premium: "0 12px 35px -12px hsl(45 95% 60% / 0.4)",
				card: "0 2px 15px -2px hsl(0 0% 0% / 0.05)",
				hover: "0 8px 30px -8px hsl(0 0% 0% / 0.15)",
			},
		}
	},
	plugins: [tailwindAnimate],
} satisfies Config;
