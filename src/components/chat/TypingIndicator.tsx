import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/shared/lib/cn';

interface TypingIndicatorProps {
  username?: string;
  avatar?: string;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  username = "Usuario",
  avatar,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("flex items-center gap-3 mb-4", className)}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={avatar} alt={username} />
        <AvatarFallback className="text-xs bg-gradient-to-br from-gray-400 to-gray-600 text-white">
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1 px-2">
          {username} está escribiendo...
        </span>
        
        <motion.div
          className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-white/10"
        >
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
