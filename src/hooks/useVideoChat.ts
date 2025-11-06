import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export interface VideoCallState {
  isInCall: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  callId: string | null;
  remoteUserId: string | null;
  error: string | null;
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end';
  data?: any;
  from: string;
  to: string;
  callId: string;
  timestamp: number;
}

interface UseVideoChatOptions {
  userId: string;
  onIncomingCall?: (callId: string, fromUserId: string) => void;
  onCallAccepted?: (callId: string) => void;
  onCallRejected?: (callId: string) => void;
  onCallEnded?: (callId: string) => void;
  onError?: (error: string) => void;
}

export const useVideoChat = ({
  userId,
  onIncomingCall,
  onCallAccepted,
  onCallRejected,
  onCallEnded,
  onError
}: UseVideoChatOptions) => {
  const [state, setState] = useState<VideoCallState>({
    isInCall: false,
    isConnecting: false,
    isMuted: false,
    isVideoEnabled: true,
    callId: null,
    remoteUserId: null,
    error: null
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // WebRTC configuration
  const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // Add TURN servers for production
      // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
    ]
  };

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    peerConnectionRef.current = peerConnection;

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && channelRef.current && state.callId) {
        const signal: CallSignal = {
          type: 'ice-candidate',
          data: event.candidate,
          from: userId,
          to: state.remoteUserId!,
          callId: state.callId,
          timestamp: Date.now()
        };

        channelRef.current.send({
          type: 'broadcast',
          event: 'call-signal',
          payload: signal
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      logger.info('📹 Remote stream received');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      logger.info('Connection state changed:', { connectionState: peerConnection.connectionState });
      
      if (peerConnection.connectionState === 'connected') {
        setState(prev => ({ ...prev, isConnecting: false, isInCall: true }));
      } else if (peerConnection.connectionState === 'failed' || 
                 peerConnection.connectionState === 'disconnected') {
        endCall();
      }
    };

    return peerConnection;
  }, [userId, state.callId, state.remoteUserId]);

  // Get user media
  const getUserMedia = useCallback(async (video: boolean = true, audio: boolean = true): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 640, height: 480 } : false,
        audio: audio
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      logger.error('Error accessing media devices:', { error: String(error) });
      const errorMessage = error instanceof Error ? error.message : 'Error accessing camera/microphone';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
      return null;
    }
  }, [onError]);

  // Start call
  const startCall = useCallback(async (targetUserId: string): Promise<string | null> => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      
      const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      // Get user media
      const stream = await getUserMedia(state.isVideoEnabled, !state.isMuted);
      if (!stream) return null;

      // Initialize peer connection
      const peerConnection = initializePeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send call request
      if (channelRef.current) {
        const signal: CallSignal = {
          type: 'call-request',
          data: offer,
          from: userId,
          to: targetUserId,
          callId,
          timestamp: Date.now()
        };

        channelRef.current.send({
          type: 'broadcast',
          event: 'call-signal',
          payload: signal
        });
      }

      setState(prev => ({
        ...prev,
        callId,
        remoteUserId: targetUserId
      }));

      return callId;
    } catch (error) {
      logger.error('Error handling offer:', { error: String(error) });
      const errorMessage = error instanceof Error ? error.message : 'Error starting call';
      setState(prev => ({ ...prev, error: errorMessage, isConnecting: false }));
      onError?.(errorMessage);
      return null;
    }
  }, [userId, state.isVideoEnabled, state.isMuted, getUserMedia, initializePeerConnection, onError]);

  // Accept call
  const acceptCall = useCallback(async (callId: string, fromUserId: string, offer: RTCSessionDescriptionInit) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isConnecting: true, 
        callId, 
        remoteUserId: fromUserId,
        error: null 
      }));

      // Get user media
      const stream = await getUserMedia(state.isVideoEnabled, !state.isMuted);
      if (!stream) return;

      // Initialize peer connection
      const peerConnection = initializePeerConnection();
      
      // Add local stream
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Set remote description and create answer
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer
      if (channelRef.current) {
        const signal: CallSignal = {
          type: 'call-accept',
          data: answer,
          from: userId,
          to: fromUserId,
          callId,
          timestamp: Date.now()
        };

        channelRef.current.send({
          type: 'broadcast',
          event: 'call-signal',
          payload: signal
        });
      }

      onCallAccepted?.(callId);
    } catch (error) {
      logger.error('Error creating offer:', { error: String(error) });
      const errorMessage = error instanceof Error ? error.message : 'Error accepting call';
      setState(prev => ({ ...prev, error: errorMessage, isConnecting: false }));
      onError?.(errorMessage);
    }
  }, [userId, state.isVideoEnabled, state.isMuted, getUserMedia, initializePeerConnection, onCallAccepted, onError]);

  // Reject call
  const rejectCall = useCallback((callId: string, fromUserId: string) => {
    if (channelRef.current) {
      const signal: CallSignal = {
        type: 'call-reject',
        from: userId,
        to: fromUserId,
        callId,
        timestamp: Date.now()
      };

      channelRef.current.send({
        type: 'broadcast',
        event: 'call-signal',
        payload: signal
      });
    }

    onCallRejected?.(callId);
  }, [userId, onCallRejected]);

  // End call
  const endCall = useCallback(() => {
    // Send end call signal
    if (channelRef.current && state.callId && state.remoteUserId) {
      const signal: CallSignal = {
        type: 'call-end',
        from: userId,
        to: state.remoteUserId,
        callId: state.callId,
        timestamp: Date.now()
      };

      channelRef.current.send({
        type: 'broadcast',
        event: 'call-signal',
        payload: signal
      });
    }

    // Clean up
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    const callId = state.callId;
    setState({
      isInCall: false,
      isConnecting: false,
      isMuted: false,
      isVideoEnabled: true,
      callId: null,
      remoteUserId: null,
      error: null
    });

    if (callId) {
      onCallEnded?.(callId);
    }
  }, [userId, state.callId, state.remoteUserId, onCallEnded]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = state.isMuted;
        setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
      }
    }
  }, [state.isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !state.isVideoEnabled;
        setState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
      }
    }
  }, [state.isVideoEnabled]);

  // Setup signaling channel
  useEffect(() => {
    if (!userId) return;

    if (!supabase) {
      logger.error('Supabase no está disponible');
      onError?.('Supabase no está disponible');
      return;
    }

    logger.info('Setting up video call signaling channel');

    const channel = supabase.channel(`video_calls_${userId}`, {
      config: {
        broadcast: { self: false }
      }
    });

    channelRef.current = channel;

    // Handle call signals
    channel.on('broadcast', { event: 'call-signal' }, (payload) => {
      const signal = payload.payload as CallSignal;
      
      if (signal.to !== userId) return;

      logger.info('Received call signal:', { type: signal.type });

      switch (signal.type) {
        case 'call-request':
          onIncomingCall?.(signal.callId, signal.from);
          break;

        case 'call-accept':
          if (peerConnectionRef.current && signal.data) {
            peerConnectionRef.current.setRemoteDescription(signal.data);
            onCallAccepted?.(signal.callId);
          }
          break;

        case 'call-reject':
          setState(prev => ({ 
            ...prev, 
            isConnecting: false, 
            callId: null, 
            remoteUserId: null 
          }));
          onCallRejected?.(signal.callId);
          break;

        case 'call-end':
          endCall();
          break;

        case 'ice-candidate':
          if (peerConnectionRef.current && signal.data) {
            peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.data));
          }
          break;
      }
    });

    channel.subscribe((status) => {
      logger.info('Channel status:', { status: String(status) });
    });

    return () => {
      logger.info('Cleaning up video call channel');
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [userId, onIncomingCall, onCallAccepted, onCallRejected, endCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    // State
    ...state,
    
    // Refs for video elements
    localVideoRef,
    remoteVideoRef,
    
    // Actions
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    
    // Utilities
    isCallActive: state.isInCall || state.isConnecting,
    hasLocalStream: !!localStreamRef.current
  };
};

export default useVideoChat;
