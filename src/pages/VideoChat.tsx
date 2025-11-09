import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users, Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import HeaderNav from '@/components/HeaderNav';

const VideoChat = () => {
  const navigate = useNavigate();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [_participants, _setParticipants] = useState([
    {
      id: 1,
      name: "Mara Elena",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      isVideoOn: true,
      isMicOn: true,
      isHost: true
    },
    {
      id: 2,
      name: "Carlos & Ana",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      isVideoOn: true,
      isMicOn: false,
      isHost: false
    }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Simular inicializacin de video
    if (videoRef.current) {
      videoRef.current.srcObject = null; // En produccin sera el stream real
    }
  }, []);

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // En produccin aqu se manejara el stream de video
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    // En produccin aqu se manejara el audio
  };

  const startCall = () => {
    setIsCallActive(true);
    // En produccin aqu se iniciara la llamada WebRTC
  };

  const endCall = () => {
    setIsCallActive(false);
    navigate('/chat');
  };

  const callHistory = [
    {
      id: 1,
      participants: ["Mara Elena", "Carlos & Ana"],
      duration: "15:32",
      date: "Hoy",
      type: "video"
    },
    {
      id: 2,
      participants: ["Sofa", "Roberto"],
      duration: "8:45",
      date: "Ayer",
      type: "video"
    },
    {
      id: 3,
      participants: ["Anabella & Julio"],
      duration: "22:15",
      date: "2 das",
      type: "video"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-blue-900/20"></div>
      
      <div className="relative z-10">
        <HeaderNav />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              onClick={() => navigate('/chat')}
              className="bg-card/80 backdrop-blur-sm border border-primary/20 hover:bg-primary/10 transition-all duration-300 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Chat
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Video className="h-12 w-12 text-purple-400 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Video Chat P2P
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Llamadas de video seguras y privadas con tecnologa WebRTC para conexiones autnticas
            </p>
          </div>

          {!isCallActive ? (
            /* Pre-call Interface */
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Video Preview */}
              <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Vista Previa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gray-800 rounded-lg aspect-video mb-4">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover rounded-lg"
                      autoPlay
                      muted
                      playsInline
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-500/80 text-white">
                        {isVideoOn ? 'Video ON' : 'Video OFF'}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500/80 text-white">
                        {isMicOn ? 'Mic ON' : 'Mic OFF'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={toggleVideo}
                      variant={isVideoOn ? "default" : "destructive"}
                      className="bg-card/80 backdrop-blur-sm border border-primary/20 hover:bg-primary/10"
                    >
                      {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={toggleMic}
                      variant={isMicOn ? "default" : "destructive"}
                      className="bg-card/80 backdrop-blur-sm border border-primary/20 hover:bg-primary/10"
                    >
                      {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={startCall}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Iniciar Llamada
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Participantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {_participants.map((participant: any) => (
                      <div key={participant.id} className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
                        <img
                          src={participant.avatar}
                          alt={participant.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{participant.name}</h3>
                          <div className="flex space-x-2 mt-1">
                            <Badge 
                              variant={participant.isVideoOn ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {participant.isVideoOn ? 'Video ON' : 'Video OFF'}
                            </Badge>
                            <Badge 
                              variant={participant.isMicOn ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {participant.isMicOn ? 'Mic ON' : 'Mic OFF'}
                            </Badge>
                            {participant.isHost && (
                              <Badge className="bg-yellow-500/80 text-white text-xs">
                                Host
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Active Call Interface */
            <div className="space-y-6">
              {/* Main Video Grid */}
              <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {_participants.map((participant: any) => (
                      <div key={participant.id} className="relative bg-gray-800 rounded-lg aspect-video">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-white font-medium">{participant.name}</h3>
                        </div>
                        <div className="absolute top-4 right-4 flex space-x-2">
                          {!participant.isVideoOn && (
                            <Badge className="bg-red-500/80 text-white text-xs">
                              Video OFF
                            </Badge>
                          )}
                          {!participant.isMicOn && (
                            <Badge className="bg-red-500/80 text-white text-xs">
                              Mic OFF
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Call Controls */}
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={toggleVideo}
                      variant={isVideoOn ? "default" : "destructive"}
                      size="lg"
                      className="bg-card/80 backdrop-blur-sm border border-primary/20 hover:bg-primary/10"
                    >
                      {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>
                    <Button
                      onClick={toggleMic}
                      variant={isMicOn ? "default" : "destructive"}
                      size="lg"
                      className="bg-card/80 backdrop-blur-sm border border-primary/20 hover:bg-primary/10"
                    >
                      {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    <Button
                      onClick={endCall}
                      variant="destructive"
                      size="lg"
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Call Info */}
              <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-white font-medium">Llamada activa</span>
                      <span className="text-muted-foreground">15:32</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configuracin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Call History */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Historial de Llamadas
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {callHistory.map((call) => (
                <Card key={call.id} className="bg-card/80 backdrop-blur-sm border border-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Video className="h-5 w-5 text-purple-400" />
                        <span className="text-white font-medium">{call.type.toUpperCase()}</span>
                      </div>
                      <Badge className="bg-gray-600/80 text-white text-xs">
                        {call.date}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {call.participants.map((participant, index) => (
                        <p key={index} className="text-muted-foreground text-sm">
                          {participant}
                        </p>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-white font-medium">{call.duration}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        Llamar de nuevo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default VideoChat;
