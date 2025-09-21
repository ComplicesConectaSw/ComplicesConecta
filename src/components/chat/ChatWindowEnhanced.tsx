import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion';
import { Send, MoreVertical, Phone, Video, Image, Smile, Paperclip, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatUser, Message } from "@/pages/Chat";
import { cn } from "@/lib/utils";

interface ChatWindowEnhancedProps {
  chat: ChatUser;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isTyping?: boolean;
  onGenerateSuggestion?: () => void;
  // Nuevas props opcionales para mejoras
  enableAnimations?: boolean;
  showTypingIndicator?: boolean;
  maxMessages?: number;
}

export const ChatWindowEnhanced = ({ 
  chat, 
  messages, 
  onSendMessage, 
  isTyping, 
  onGenerateSuggestion,
  enableAnimations = true,
  showTypingIndicator = true,
  maxMessages = 1000
}: ChatWindowEnhancedProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    
    setIsScrolledToBottom(isAtBottom);
    setShowScrollButton(!isAtBottom && messages.length > 5);
  }, [messages.length]);

  useEffect(() => {
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, isScrolledToBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
      
      // Animación de envío
      if (enableAnimations) {
        controls.start({
          scale: [1, 0.95, 1],
          transition: { duration: 0.2 }
        });
      }
      
      // Focus automático en input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Variantes de animación
  const messageVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const typingVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const inputVariants = {
    focus: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    blur: { 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  // Optimización: solo mostrar últimos N mensajes
  const displayMessages = messages.slice(-maxMessages);

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] h-full flex flex-col overflow-hidden">
      {/* Chat Header */}
      <motion.div 
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="p-3 sm:p-4 border-b border-gray-200/50 backdrop-blur-sm bg-white/60"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-white/50">
                <AvatarImage src={chat.image} alt={chat.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                  {chat.name[0]}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {chat.isOnline && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-full h-full bg-green-400 rounded-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div>
              <motion.h3 
                className="font-semibold text-gray-800"
                whileHover={{ scale: 1.02 }}
              >
                {chat.name}
              </motion.h3>
              <div className="h-4">
                <AnimatePresence mode="wait">
                  {isTyping && showTypingIndicator ? (
                    <motion.div
                      variants={typingVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="flex items-center space-x-1"
                    >
                      <span className="text-xs text-purple-600 font-medium">Escribiendo</span>
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ 
                              duration: 0.6, 
                              repeat: Infinity, 
                              delay: i * 0.2 
                            }}
                            className="w-1 h-1 bg-purple-500 rounded-full"
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-500"
                    >
                      {chat.isOnline ? 'En línea' : 'Desconectado'}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {[
              { icon: Phone, label: "Llamada de voz" },
              { icon: Video, label: "Videollamada" },
              { icon: MoreVertical, label: "Más opciones" }
            ].map(({ icon: Icon, label }, index) => (
              <motion.div key={index} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100/80 backdrop-blur-sm" 
                  aria-label={label}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 custom-scrollbar relative"
      >
        <AnimatePresence initial={false}>
          {displayMessages.map((message, index) => (
            <motion.div
              key={`${message.id}-${index}`}
              variants={enableAnimations ? messageVariants : undefined}
              initial={enableAnimations ? "hidden" : undefined}
              animate={enableAnimations ? "visible" : undefined}
              exit={enableAnimations ? "exit" : undefined}
              layout={enableAnimations}
              className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                whileHover={enableAnimations ? { scale: 1.02 } : {}}
                className={cn(
                  "max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2 break-words",
                  "backdrop-blur-sm border shadow-sm",
                  message.senderId === 0
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300/30 ml-auto'
                    : 'bg-white/80 text-gray-800 border-gray-200/50'
                )}
              >
                <p className="text-xs sm:text-sm leading-relaxed break-words overflow-wrap-anywhere">
                  {message.content}
                </p>
                <p className={cn(
                  "text-xs mt-1",
                  message.senderId === 0 ? 'text-white/70' : 'text-gray-500'
                )}>
                  {message.timestamp}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scrollToBottom()}
              className="fixed bottom-20 right-6 w-10 h-10 bg-purple-500 text-white rounded-full shadow-lg backdrop-blur-sm border border-white/20 flex items-center justify-center z-10"
            >
              ↓
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Message Input */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="p-3 sm:p-4 border-t border-gray-200/50 bg-white/60 backdrop-blur-sm"
        animate={controls}
      >
        <div className="flex items-end space-x-2">
          <div className="flex space-x-1">
            {onGenerateSuggestion && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 relative group hover:bg-purple-100/80" 
                  onClick={onGenerateSuggestion}
                >
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span className="absolute -top-2 -right-2 text-xs bg-purple-500 text-white font-bold px-1 rounded-full group-hover:scale-110 transition-transform">
                    AI
                  </span>
                </Button>
              </motion.div>
            )}
            
            {[
              { icon: Paperclip, label: "Adjuntar archivo" },
              { icon: Image, label: "Enviar imagen" },
              { icon: Smile, label: "Insertar emoji" }
            ].map(({ icon: Icon, label }, index) => (
              <motion.div key={index} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 hover:bg-gray-100/80" 
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="flex-1"
            variants={inputVariants}
            whileFocus="focus"
            initial="blur"
          >
            <Input
              ref={inputRef}
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-purple-300 focus:ring-purple-200"
            />
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button 
              type="submit" 
              size="icon" 
              disabled={!newMessage.trim()} 
              aria-label="Enviar mensaje"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.form>
    </div>
  );
};
