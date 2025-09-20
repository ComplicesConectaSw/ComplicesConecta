/**
 * Tarjeta Animada con Glass Effect
 * Componente reutilizable para cards con animaciones suaves
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "children" | "ref"> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  glassEffect?: boolean;
  hoverScale?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function AnimatedCard({
  children,
  title,
  subtitle,
  glassEffect = true,
  hoverScale = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
  ...motionProps
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={hoverScale ? { 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 }
      } : {}}
      {...motionProps}
    >
      <Card 
        className={cn(
          "transition-all duration-300",
          glassEffect && "bg-white/10 backdrop-blur-md border-white/20 shadow-xl",
          "hover:shadow-2xl",
          className
        )}
      >
        {(title || subtitle) && (
          <CardHeader className={cn("pb-3", headerClassName)}>
            {title && (
              <CardTitle className="text-white font-semibold">
                {title}
              </CardTitle>
            )}
            {subtitle && (
              <p className="text-white/80 text-sm">
                {subtitle}
              </p>
            )}
          </CardHeader>
        )}
        
        <CardContent className={cn("text-white", contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AnimatedCard;
