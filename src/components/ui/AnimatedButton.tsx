import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Button, type ButtonProps } from '@/components/ui/Button';

type AnimatedButtonBaseProps = Omit<ButtonProps, 'asChild'>;

interface AnimatedButtonProps extends AnimatedButtonBaseProps {
  motionProps?: HTMLMotionProps<'div'>;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  motionProps,
  disabled,
  ...buttonProps
}) => {
  return (
    <motion.div
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...motionProps}
    >
      <Button disabled={disabled} {...buttonProps}>
        {children}
      </Button>
    </motion.div>
  );
};