/**
 * =====================================================
 * MESSAGE REACTIONS
 * =====================================================
 * Reacciones a mensajes del chat
 * Features: Emojis rápidos, contador, usuarios
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  userReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions?: Reaction[];
  onReactionAdd: (messageId: string, emoji: string) => void;
  onReactionRemove: (messageId: string, emoji: string) => void;
  currentUserId?: string;
  className?: string;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '🎉', '😮', '👏'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions = [],
  onReactionAdd,
  onReactionRemove,
  currentUserId,
  className = ''
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleReactionClick = (emoji: string, userReacted: boolean) => {
    if (userReacted) {
      onReactionRemove(messageId, emoji);
    } else {
      onReactionAdd(messageId, emoji);
    }
  };

  const handleQuickReaction = (emoji: string) => {
    const existing = reactions.find(r => r.emoji === emoji);
    if (existing?.userReacted) {
      onReactionRemove(messageId, emoji);
    } else {
      onReactionAdd(messageId, emoji);
    }
    setShowPicker(false);
  };

  if (reactions.length === 0 && !showPicker) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPicker(true)}
        className={`h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
      >
        <Plus className="h-3 w-3 mr-1" />
        React
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {/* Existing Reactions */}
      {reactions.map((reaction) => (
        <motion.button
          key={reaction.emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleReactionClick(reaction.emoji, reaction.userReacted)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
            reaction.userReacted
              ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700'
              : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          title={reaction.users.join(', ')}
        >
          <span>{reaction.emoji}</span>
          <span className="text-xs font-medium">{reaction.count}</span>
        </motion.button>
      ))}

      {/* Add Reaction Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPicker(!showPicker)}
          className="h-6 w-6 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>

        {/* Quick Reactions Picker */}
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex gap-1 z-10"
          >
            {QUICK_REACTIONS.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuickReaction(emoji)}
                className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1 transition-colors"
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
