import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveNavigation } from '@/components/navigation/ResponsiveNavigation';
import { cn } from '@/shared/lib/cn';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  className?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  className
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      <ResponsiveNavigation
        currentPath={currentPath}
        onNavigate={onNavigate}
      />
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "transition-all duration-300",
          isMobile 
            ? "pt-16 pb-20 px-4" // Mobile: top bar + bottom nav spacing
            : "ml-20 hover:ml-64 p-6" // Desktop: sidebar spacing
        )}
      >
        {children}
      </motion.main>
    </div>
  );
};
