import React from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const ChatDemo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border-b border-white/20">
        <Button
          onClick={() => navigate(-1)}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-white text-xl font-bold">Chat</h1>
        <div className="w-20"></div>
      </div>

      {/* Content */}
      <div className="p-6 text-center">
        <MessageCircle className="w-24 h-24 text-white/60 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Chat Demo</h2>
        <p className="text-white/80 mb-6 max-w-md mx-auto">
          Esta es una página demo del chat. En la versión completa aquí podrás chatear con otros usuarios de la comunidad.
        </p>
        
        {/* Demo Chat List */}
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-semibold">Ana García</h3>
                <p className="text-white/60 text-sm">¡Hola! ¿Cómo estás?</p>
              </div>
              <div className="text-white/40 text-xs">10:30</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-semibold">María & Juan</h3>
                <p className="text-white/60 text-sm">Nos encantaría conocerte</p>
              </div>
              <div className="text-white/40 text-xs">09:15</div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-white/60 text-sm">
            💬 Función disponible en la versión completa
          </p>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default ChatDemo;
