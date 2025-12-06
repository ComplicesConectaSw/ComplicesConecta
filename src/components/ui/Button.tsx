import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, type HTMLMotionProps } from "framer-motion"
import { Loader2 } from "lucide-react"

import { cn } from "@/shared/lib/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-dark shadow-love hover:shadow-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft",
        outline:
          "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground shadow-card",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-light shadow-soft",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",

        // Variantes profesionales para apps de citas
        love: "bg-love-gradient text-white hover:shadow-love transform hover:scale-105 transition-all duration-300 font-bold",
        passion:
          "bg-passion-gradient text-white hover:shadow-passion transform hover:scale-105 transition-all duration-300 font-bold",
        romance:
          "bg-romance-gradient text-white hover:shadow-romance transform hover:scale-105 transition-all duration-300 font-bold",
        premium:
          "bg-premium-gradient text-white hover:shadow-premium transform hover:scale-105 transition-all duration-300 font-bold",

        // Variantes de estado mejoradas
        success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-soft",
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-soft",
        info: "bg-blue-500 text-white hover:bg-blue-600 shadow-soft",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-soft",

        // Variantes especiales
        glass:
          "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 shadow-soft",
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

  // Props heredadas de UnifiedButton
  gradient?: boolean
  ripple?: boolean
  loading?: boolean
  loadingText?: string

  // Props heredadas de AnimatedButton
  motionProps?: HTMLMotionProps<"div">

  /**
   * Control de animaciones integradas
   * - 'hover': escala suave al hacer hover/tap (por defecto)
   * - 'tap': solo efecto en tap
   * - 'pulse': animación continua de pulso
   * - false: sin animación
   */
  animate?: "hover" | "tap" | "pulse" | false
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      gradient = false,
      ripple = false,
      loading = false,
      loadingText = "Cargando...",
      motionProps,
      animate = "hover",
      disabled,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = "button"

    const [rippleEffect, setRippleEffect] = React.useState<{
      x: number
      y: number
      show: boolean
    }>({
      x: 0,
      y: 0,
      show: false,
    })

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !loading) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setRippleEffect({ x, y, show: true })

        setTimeout(() => {
          setRippleEffect(prev => ({ ...prev, show: false }))
        }, 600)
      }

      if (!loading && !disabled) {
        onClick?.(e)
      }
    }

    const isDisabled = disabled || loading

    const baseWhileHover =
      animate === "hover" && !isDisabled ? { scale: 1.02 } : undefined
    const baseWhileTap =
      (animate === "hover" || animate === "tap") && !isDisabled
        ? { scale: 0.98 }
        : undefined
    const baseAnimate =
      animate === "pulse" && !isDisabled
        ? { scale: [1, 1.03, 1] }
        : motionProps?.animate

    // Modo asChild: delegar completamente al hijo, asegurando un único elemento
    if (asChild) {
      return (
        <motion.div
          whileHover={motionProps?.whileHover ?? baseWhileHover}
          whileTap={motionProps?.whileTap ?? baseWhileTap}
          animate={baseAnimate}
          transition={
            motionProps?.transition ?? {
              duration: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }
          }
          {...motionProps}
        >
          <Slot
            ref={ref as any}
            className={cn(
              buttonVariants({ variant, size }),
              "relative overflow-hidden transition-all duration-200",
              gradient && [
                "bg-gradient-to-r from-purple-600 to-blue-600",
                "hover:from-purple-700 hover:to-blue-700",
                "text-white border-0",
              ],
              className
            )}
          >
            {children}
          </Slot>
        </motion.div>
      )
    }

    return (
      <motion.div
        whileHover={motionProps?.whileHover ?? baseWhileHover}
        whileTap={motionProps?.whileTap ?? baseWhileTap}
        animate={baseAnimate}
        transition={
          motionProps?.transition ?? {
            duration: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }
        }
        {...motionProps}
      >
        <Comp
          ref={ref}
          className={cn(
            buttonVariants({ variant, size }),
            "relative overflow-hidden transition-all duration-200",
            gradient && [
              "bg-gradient-to-r from-purple-600 to-blue-600",
              "hover:from-purple-700 hover:to-blue-700",
              "text-white border-0",
            ],
            className
          )}
          disabled={isDisabled}
          onClick={handleClick}
          {...props}
        >
          <span className={cn("flex items-center gap-2", loading && "opacity-0")}>
            {children}
          </span>

          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {loadingText}
            </span>
          )}

          {ripple && rippleEffect.show && (
            <motion.span
              className="absolute bg-white/30 rounded-full pointer-events-none"
              style={{
                left: rippleEffect.x - 25,
                top: rippleEffect.y - 25,
                width: 50,
                height: 50,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}
        </Comp>
      </motion.div>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
