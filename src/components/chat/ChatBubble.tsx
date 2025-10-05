// WRAPPER DE COMPATIBILIDAD - DEPRECADO
// Este archivo reexporta el componente consolidado en /src/components/ui/ChatBubble.tsx
// - Mover referencias a '@/components/ui/ChatBubble'
// - Este wrapper se eliminará en 30 días tras confirmación de que no hay imports residuales.

export { ChatBubble as default } from '@/components/ui/ChatBubble';
export * from '@/components/ui/ChatBubble';

// Implementación legacy mantenida por compatibilidad
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  id: string;
  message: string;
  isOwn: boolean;
  timestamp: string;
  avatar?: string;
  username?: string;
  className?: string;
}

export const ChatBubbleLegacy: React.FC<ChatBubbleProps> = ({
  id,
  message,
  isOwn,
  timestamp,
  avatar,
  username,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className={cn(
        "flex gap-3 mb-4 group",
        isOwn ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={avatar} alt={username} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500 to-purple-600 text-white">
            {username?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col max-w-[70%]",
        isOwn ? "items-end" : "items-start"
      )}>
        {!isOwn && username && (
          <span className="text-xs text-gray-500 mb-1 px-2">
            {username}
          </span>
        )}
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={cn(
            "relative px-4 py-3 rounded-2xl shadow-sm",
            "backdrop-blur-sm border border-white/10",
            "transition-all duration-300 ease-out",
            isOwn 
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-md" 
              : "bg-white/90 text-gray-800 rounded-bl-md hover:bg-white/95"
          )}
        >
          {/* Mensaje con efectos de gradiente */}
          <p className={cn(
            "text-sm leading-relaxed break-words",
            isOwn ? "text-white" : "text-gray-800"
          )}>
            {message}
          </p>
          
          {/* Timestamp */}
          <span className={cn(
            "text-xs opacity-70 mt-1 block",
            isOwn ? "text-white/80" : "text-gray-500"
          )}>
            {timestamp}
          </span>
          
          {/* Bubble tail con CSS puro */}
          <div className={cn(
            "absolute top-4 w-0 h-0",
            isOwn 
              ? "right-[-6px] border-l-[6px] border-l-pink-500 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"
              : "left-[-6px] border-r-[6px] border-r-white/90 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"
          )} />
        </motion.div>
      </div>
      
      {isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={avatar} alt="Tú" />
          <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500 to-purple-600 text-white">
            Tú
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
};
