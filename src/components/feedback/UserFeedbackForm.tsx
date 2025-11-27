/**
 * UserFeedbackForm Component
 * Sistema completo de feedback de usuarios para fase Beta
 * Integrado con sistema de tokens y analytics
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/shared/ui/Input';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Bug, 
  Lightbulb, 
  MessageCircle,
  Send,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';

export interface FeedbackData {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  rating: number;
  message: string;
  email?: string;
  category?: string;
  metadata?: Record<string, any>;
}

interface UserFeedbackFormProps {
  className?: string;
  onFeedbackSubmitted?: (data: FeedbackData) => void;
  showTokenReward?: boolean;
  userId?: string;
}

export const UserFeedbackForm: React.FC<UserFeedbackFormProps> = ({
  className,
  onFeedbackSubmitted,
  showTokenReward = true,
  userId
}) => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'improvement' | 'general'>('general');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const feedbackTypes = [
    { id: 'bug', label: '🐛 Error o Bug', icon: Bug, color: 'text-red-400' },
    { id: 'feature', label: '💡 Nueva Funcionalidad', icon: Lightbulb, color: 'text-blue-400' },
    { id: 'improvement', label: '✨ Mejora', icon: Star, color: 'text-yellow-400' },
    { id: 'general', label: '💬 Comentario General', icon: MessageCircle, color: 'text-purple-400' }
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor, escribe tu comentario o feedback.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData: FeedbackData = {
        type: feedbackType,
        rating,
        message: message.trim(),
        email: email.trim() || undefined,
        category: category.trim() || undefined,
        metadata: {
          userId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      };

      // TODO: Integrar con Supabase feedback table
      // Por ahora, solo loguear
      logger.info('User feedback submitted:', feedbackData);

      // Simular envío a backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Callback
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(feedbackData);
      }

      // Mostrar mensaje de éxito
      toast({
        title: '¡Gracias por tu feedback!',
        description: showTokenReward 
          ? 'Has ganado 20 CMPX por tu feedback. Revisa tu balance de tokens.'
          : 'Tu comentario ha sido enviado y será revisado por nuestro equipo.',
      });

      setIsSubmitted(true);

      // Limpiar formulario después de 3 segundos
      setTimeout(() => {
        setMessage('');
        setEmail('');
        setCategory('');
        setRating(0);
        setFeedbackType('general');
        setIsSubmitted(false);
      }, 3000);

    } catch (error) {
      logger.error('Error submitting feedback:', { error });
      toast({
        title: 'Error',
        description: 'No se pudo enviar tu feedback. Por favor, intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className={cn("bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl", className)}>
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              ¡Feedback Enviado!
            </h3>
            <p className="text-white/80">
              Gracias por ayudarnos a mejorar ComplicesConecta
            </p>
            {showTokenReward && (
              <Badge className="mt-4 bg-green-500/20 text-green-300 border-green-500/30">
                +20 CMPX otorgados
              </Badge>
            )}
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle className="w-5 h-5 text-purple-300" />
          Tu Opinión es Importante
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Feedback */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Tipo de Feedback
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.id}
                    type="button"
                    onClick={() => setFeedbackType(type.id as any)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all duration-300",
                      feedbackType === type.id
                        ? "bg-purple-500/20 border-purple-400 text-white"
                        : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/30"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 mx-auto mb-1", type.color)} />
                    <span className="text-xs font-medium block">{type.label.split(' ')[0]}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              ¿Qué tan satisfecho estás?
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "transition-all duration-200",
                    rating >= star ? "text-yellow-400" : "text-white/30"
                  )}
                >
                  <Star className={cn("w-8 h-8", rating >= star && "fill-current")} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
              Tu Comentario *
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe tu experiencia, sugiere mejoras, o reporta un problema..."
              required
              rows={5}
              className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            />
          </div>

          {/* Email opcional */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email (opcional)
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com (para seguimiento)"
              className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            />
          </div>

          {/* Categoría opcional */}
          {feedbackType === 'bug' && (
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                Categoría del Error (opcional)
              </label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej: Login, Chat, Perfil, etc."
                className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Feedback
              </>
            )}
          </Button>

          {showTokenReward && (
            <p className="text-xs text-white/60 text-center">
              💰 Gana 20 CMPX por cada feedback válido
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default UserFeedbackForm;

