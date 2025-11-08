import React, { useState } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Maximize2,
  Minimize2,
  Settings
} from 'lucide-react';
import { useVideoChat } from '@/features/chat/useVideoChat';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';

interface VideoCallWindowProps {
  targetUserId?: string;
  onCallEnd?: () => void;
  className?: string;
}

export const VideoCallWindow: React.FC<VideoCallWindowProps> = ({
  targetUserId,
  onCallEnd,
  className = ''
}) => {
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [incomingCall, setIncomingCall] = useState<{
    callId: string;
    fromUserId: string;
  } | null>(null);

  const {
    isInCall,
    isConnecting,
    isMuted,
    isVideoEnabled,
    callId: _callId,
    remoteUserId,
    error,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    isCallActive,
    hasLocalStream
  } = useVideoChat({
    userId: user?.id || '',
    onIncomingCall: (callId, fromUserId) => {
      setIncomingCall({ callId, fromUserId });
    },
    onCallAccepted: (callId) => {
      logger.info('Video call started', { callId, context: 'video-call' });
      setIncomingCall(null);
    },
    onCallRejected: (callId) => {
      logger.info('Call rejected', { callId, context: 'video-call' });
      setIncomingCall(null);
    },
    onCallEnded: (callId) => {
      logger.info('Video call ended', { callId, context: 'video-call' });
      setIncomingCall(null);
      onCallEnd?.();
    },
    onError: (error) => {
      logger.error('Error in video call', { error: String(error), context: 'video-call' });
    }
  });

  const handleStartCall = async () => {
    if (targetUserId) {
      await startCall(targetUserId);
    }
  };

  const handleAcceptCall = async () => {
    if (incomingCall) {
      // Note: In a real implementation, you'd need to get the offer from the signaling
      // This is simplified for demonstration
      await acceptCall(incomingCall.callId, incomingCall.fromUserId, {} as RTCSessionDescriptionInit);
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      rejectCall(incomingCall.callId, incomingCall.fromUserId);
      setIncomingCall(null);
    }
  };

  const handleEndCall = () => {
    endCall();
    onCallEnd?.();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Incoming call modal
  if (incomingCall && !isCallActive) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Video className="h-12 w-12 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Llamada entrante
            </h3>
            
            <p className="text-gray-600 mb-8">
              Usuario {incomingCall.fromUserId.slice(0, 8)} te está llamando
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={handleRejectCall}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <PhoneOff className="h-5 w-5" />
                <span>Rechazar</span>
              </button>
              
              <button
                onClick={handleAcceptCall}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Phone className="h-5 w-5" />
                <span>Aceptar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-900 rounded-2xl overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'
    } ${className}`}>
      
      {/* Remote video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Local video (picture-in-picture) */}
      <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {!isVideoEnabled && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <VideoOff className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Connection status */}
      {isConnecting && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-sm">Conectando...</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg max-w-xs">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Controls */}
      {(showControls || !isInCall) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="flex items-center justify-center space-x-4">
            
            {/* Mute button */}
            <button
              onClick={toggleMute}
              disabled={!hasLocalStream}
              className={`p-4 rounded-full transition-colors ${
                isMuted 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isMuted ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </button>

            {/* Video toggle button */}
            <button
              onClick={toggleVideo}
              disabled={!hasLocalStream}
              className={`p-4 rounded-full transition-colors ${
                !isVideoEnabled 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isVideoEnabled ? (
                <Video className="h-6 w-6 text-white" />
              ) : (
                <VideoOff className="h-6 w-6 text-white" />
              )}
            </button>

            {/* Call/End call button */}
            {isCallActive ? (
              <button
                onClick={handleEndCall}
                className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              >
                <PhoneOff className="h-6 w-6 text-white" />
              </button>
            ) : (
              <button
                onClick={handleStartCall}
                disabled={!targetUserId}
                className="p-4 bg-green-500 hover:bg-green-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Phone className="h-6 w-6 text-white" />
              </button>
            )}

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="h-6 w-6 text-white" />
              ) : (
                <Maximize2 className="h-6 w-6 text-white" />
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            >
              <Settings className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Call info */}
      {isInCall && remoteUserId && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm">
              En llamada con {remoteUserId.slice(0, 8)}
            </span>
          </div>
        </div>
      )}

      {/* No video placeholder */}
      {!isInCall && !isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center text-white">
            <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Video Chat</h3>
            <p className="text-gray-400 mb-6">
              {targetUserId ? 'Presiona el botón para iniciar la llamada' : 'Selecciona un usuario para llamar'}
            </p>
            
            {targetUserId && (
              <button
                onClick={handleStartCall}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
              >
                Iniciar llamada
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallWindow;
