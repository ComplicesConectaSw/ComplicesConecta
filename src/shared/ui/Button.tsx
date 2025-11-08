import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-dark shadow-love hover:shadow-hover",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft",
        outline: "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground shadow-card",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-light shadow-soft",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        // Variantes profesionales para apps de citas
        love: "bg-love-gradient text-white hover:shadow-love transform hover:scale-105 transition-all duration-300 font-bold",
        passion: "bg-passion-gradient text-white hover:shadow-passion transform hover:scale-105 transition-all duration-300 font-bold",
        romance: "bg-romance-gradient text-white hover:shadow-romance transform hover:scale-105 transition-all duration-300 font-bold",
        premium: "bg-premium-gradient text-white hover:shadow-premium transform hover:scale-105 transition-all duration-300 font-bold",
        
        // Variantes de estado mejoradas
        success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-soft",
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-soft",
        info: "bg-blue-500 text-white hover:bg-blue-600 shadow-soft",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-soft",
        
        // Variantes especiales
        glass: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 shadow-soft",
        glow: "bg-primary text-primary-foreground shadow-glow hover:shadow-glow/80 animate-pulse-glow",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 px-4 py-1 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-12 py-4 text-lg",
        icon: "h-11 w-11",
        // Tamaños específicos para la app
        hero: "h-16 px-12 py-4 text-lg font-bold",
        action: "h-12 px-8 py-3 text-sm font-semibold",
        compact: "h-8 px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
