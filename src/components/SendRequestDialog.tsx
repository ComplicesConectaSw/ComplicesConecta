import React, { useState } from 'react';
import { X, Send, Users, User, MessageCircle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface SendRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
    avatar_url?: string;
    profile_type: 'single' | 'couple';
    age?: number;
    location?: string;
  };
  onRequestSent: () => void;
}

export const SendRequestDialog: React.FC<SendRequestDialogProps> = ({
  isOpen,
  onClose,
  targetUser,
  onRequestSent
}) => {
  const [message, setMessage] = useState('');
  const [_isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendRequest = async () => {
    if (_isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      // Mock implementation for now
      const result = { success: true, error: null };
      // TODO: Implement actual request service
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (result.success) {
        onRequestSent();
        onClose();
        setMessage('');
      } else {
        setError(result.error || 'Error al enviar solicitud');
      }
    } catch (error) {
      logger.error('Error sending request:', { error: error instanceof Error ? error.message : String(error) });
      setError('Error inesperado al enviar solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!_isLoading) {
      onClose();
      setMessage('');
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Enviar Solicitud
          </h2>
          <button
            onClick={handleClose}
            disabled={_isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Target User Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {targetUser.avatar_url ? (
                <img
                  src={targetUser.avatar_url}
                  alt={targetUser.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  {targetUser.profile_type === 'couple' ? (
                    <Users className="w-8 h-8 text-white" />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
              )}
              
              {/* Profile type indicator */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                targetUser.profile_type === 'couple' ? 'bg-pink-500' : 'bg-blue-500'
              }`}>
                {targetUser.profile_type === 'couple' ? (
                  <Users className="w-3 h-3" />
                ) : (
                  <User className="w-3 h-3" />
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {targetUser.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                {targetUser.age && <span>{targetUser.age} años</span>}
                {targetUser.location && (
                  <>
                    {targetUser.age && <span>•</span>}
                    <span>{targetUser.location}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 mt-1">
                {targetUser.profile_type === 'couple' ? (
                  <>
                    <Users className="w-3 h-3" />
                    <span>Pareja</span>
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3" />
                    <span>Single</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensaje (opcional)
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-gray-600 dark:text-gray-300" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje para acompañar tu solicitud..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                rows={4}
                maxLength={500}
                disabled={_isLoading}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-700 dark:text-gray-200">
                Presenta tu interés de manera respetuosa
              </p>
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {message.length}/500
              </span>
            </div>
          </div>

          {/* Error Message */}
          {_error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{_error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={_isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSendRequest}
              disabled={_isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 font-medium"
            >
              {_isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Solicitud
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendRequestDialog;
