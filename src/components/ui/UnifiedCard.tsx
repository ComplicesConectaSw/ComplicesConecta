import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/shared/lib/cn';

interface UnifiedCardProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  glass?: boolean;
  gradient?: boolean;
  hover?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  motionProps?: HTMLMotionProps<"div">;
}

export const UnifiedCard: React.FC<UnifiedCardProps> = ({
  children,
  title,
  description,
  footer,
  glass = false,
  gradient = false,
  hover = true,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  motionProps
}) => {
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: hover ? { y: -5, scale: 1.02 } : {},
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...motionProps}
    >
      <Card
        className={cn(
          "transition-all duration-300",
          glass && [
            "bg-white/10 backdrop-blur-md border-white/20",
            "shadow-xl shadow-black/20"
          ],
          gradient && [
            "bg-gradient-to-br from-white to-gray-50",
            "border-gradient-to-r from-pink-200 to-purple-200"
          ],
          hover && "hover:shadow-lg",
          className
        )}
      >
        {(title || description) && (
          <CardHeader className={cn("space-y-2", headerClassName)}>
            {title && (
              <CardTitle className="text-lg font-semibold text-white">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-white/80">
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}

        {children && (
          <CardContent className={cn("space-y-4", contentClassName)}>
            {children}
          </CardContent>
        )}

        {footer && (
          <CardFooter className={cn("pt-4", footerClassName)}>
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

