import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck, Clock, Smile, MoreHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatBubbleProps {
  id: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  status?: "sending" | "sent" | "delivered" | "read";
  isPrivate?: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  className?: string;
}

const statusIcons = {
  sending: Clock,
  sent: Check,
  delivered: Check,
  read: CheckCheck
};

const statusColors = {
  sending: "text-gray-600 dark:text-gray-300",
  sent: "text-gray-600 dark:text-gray-300",
  delivered: "text-gray-700 dark:text-gray-200",
  read: "text-blue-500"
};

// Wrapper de compatibilidad para ChatBubble avanzado
export const ChatBubble = React.memo<ChatBubbleProps>(function ChatBubble({
  id,
  message,
  timestamp,
  isOwn,
  senderName,
  senderAvatar,
  status = "sent",
  isPrivate = false,
  reactions = [],
  onReact,
  onReply,
  className
}) {
  // Hooks siempre deben estar en el nivel superior
  const [showReactions, setShowReactions] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const StatusIcon = statusIcons[status];
  const commonEmojis = ["❤️", "😂", "😮", "😢", "😡", "👍"];

  const handleReaction = React.useCallback((emoji: string) => {
    onReact?.(id, emoji);
    setShowReactions(false);
  }, [id, onReact]);

  // Componente simple integrado (sin funcionalidades avanzadas)
  if (!reactions?.length && !onReact && !onReply && !isPrivate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn("flex gap-3 mb-4 group", isOwn ? "flex-row-reverse" : "flex-row", className)}
      >
        {!isOwn && senderAvatar && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={senderAvatar} alt={senderName} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              {senderName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn("flex flex-col max-w-[70%]", isOwn ? "items-end" : "items-start")}>
          {!isOwn && senderName && (
            <span className="text-xs text-gray-500 mb-1 px-2">{senderName}</span>
          )}
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
              "relative px-4 py-3 rounded-2xl shadow-sm backdrop-blur-sm border border-white/10 transition-all duration-300 ease-out",
              isOwn 
                ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-br-md" 
                : "bg-gradient-to-r from-blue-500/90 to-purple-600/90 text-white rounded-bl-md hover:from-blue-500/95 hover:to-purple-600/95"
            )}
          >
            <p className="text-sm leading-relaxed break-words text-white">{message}</p>
            <span className={cn("text-xs opacity-70 mt-1 block", "text-white/80")}>
              {timestamp}
            </span>
          </motion.div>
        </div>
        
        {isOwn && senderAvatar && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={senderAvatar} alt="Tú" />
            <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              Tú
            </AvatarFallback>
          </Avatar>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "flex gap-2 sm:gap-3 group relative",
        isOwn ? "flex-row-reverse" : "flex-row",
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Avatar */}
      {!isOwn && senderAvatar && (
        <motion.div
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <img
            src={senderAvatar}
            alt={senderName}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      <div className={cn("flex flex-col max-w-[85%] sm:max-w-[70%]", isOwn && "items-end")}>
        {/* Sender Name */}
        {!isOwn && senderName && (
          <span className="text-xs text-gray-700 dark:text-gray-200 mb-1 px-2">{senderName}</span>
        )}

        {/* Message Container */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Message Bubble */}
          <div
            className={cn(
              "relative px-4 py-2 rounded-2xl shadow-sm",
              isOwn
                ? isPrivate
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-blue-500 text-white"
                : "bg-white/10 backdrop-blur-md text-white border border-white/20"
            )}
          >
            {/* Private Message Indicator */}
            {isPrivate && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white pointer-events-none"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            <p className="text-sm leading-relaxed break-words">{message}</p>

            {/* Message Status & Timestamp */}
            <div
              className={cn(
                "flex items-center gap-1 mt-1 text-xs",
                isOwn
                  ? "text-white/70 justify-end"
                  : "text-gray-700 dark:text-gray-200 justify-start"
              )}
            >
              <span>{timestamp}</span>
              {isOwn && (
                <StatusIcon className={cn("w-3 h-3", statusColors[status])} />
              )}
            </div>
          </div>

          {/* Hover Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 flex gap-1",
                  isOwn ? "-left-12" : "-right-12"
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 bg-white shadow-md border"
                  onClick={() => setShowReactions(!showReactions)}
                  aria-label="Reaccionar"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 bg-white shadow-md border"
                  onClick={() => onReply?.(id)}
                  aria-label="Responder"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reaction Picker */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                className={cn(
                  "absolute top-full mt-2 bg-white rounded-lg shadow-lg border p-2 flex gap-1 z-10",
                  isOwn ? "right-0" : "left-0"
                )}
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {commonEmojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-lg"
                    onClick={() => handleReaction(emoji)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Reaccionar con ${emoji}`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Reactions */}
        {reactions.length > 0 && (
          <motion.div
            className={cn("flex gap-1 mt-1", isOwn && "flex-row-reverse")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {reactions.map((reaction, index) => (
              <motion.button
                key={`${reaction.emoji}-${index}`}
                type="button"
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReaction(reaction.emoji)}
                aria-label={`${reaction.count} reacciones con ${reaction.emoji}`}
              >
                <span>{reaction.emoji}</span>
                <span className="text-gray-600">{reaction.count}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

export default ChatBubble;

