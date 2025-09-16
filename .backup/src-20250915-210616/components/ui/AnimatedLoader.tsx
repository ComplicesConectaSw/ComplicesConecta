import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedLoaderProps {
  variant?: "spinner" | "dots" | "pulse" | "wave" | "heart" | "love";
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "accent" | "love" | "premium";
  className?: string;
  text?: string;
}

const sizeVariants = {
  sm: { container: "w-6 h-6", dot: "w-1.5 h-1.5", text: "text-sm" },
  md: { container: "w-8 h-8", dot: "w-2 h-2", text: "text-base" },
  lg: { container: "w-12 h-12", dot: "w-3 h-3", text: "text-lg" },
  xl: { container: "w-16 h-16", dot: "w-4 h-4", text: "text-xl" }
};

const colorVariants = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  love: "text-pink-500",
  premium: "text-yellow-500"
};

export const AnimatedLoader = React.memo<AnimatedLoaderProps>(function AnimatedLoader({
  variant = "spinner",
  size = "md",
  color = "primary",
  className,
  text
}) {
  const { container, dot, text: textSize } = sizeVariants[size];

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return (
          <motion.div
            className={cn(container, "border-2 border-current border-t-transparent rounded-full", colorVariants[color])}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        );

      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(dot, "rounded-full bg-current", colorVariants[color])}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <motion.div
            className={cn(container, "rounded-full bg-current", colorVariants[color])}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          />
        );

      case "wave":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={cn("w-1 bg-current", colorVariants[color])}
                style={{ height: size === "sm" ? "16px" : size === "md" ? "20px" : size === "lg" ? "24px" : "32px" }}
                animate={{
                  scaleY: [1, 2, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        );

      case "heart":
        return (
          <motion.div
            className={cn(container, colorVariants[color])}
            animate={{
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        );

      case "love":
        return (
          <div className="flex space-x-2">
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className={cn(dot, "bg-gradient-to-r from-pink-500 to-red-500 rounded-full")}
                animate={{
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-full h-full p-0.5"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </motion.div>
            ))}
          </div>
        );

      default:
        return (
          <motion.div
            className={cn(container, "border-2 border-current border-t-transparent rounded-full", colorVariants[color])}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        );
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      {renderLoader()}
      {text && (
        <motion.p
          className={cn("font-medium", colorVariants[color], textSize)}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
});

export default AnimatedLoader;
