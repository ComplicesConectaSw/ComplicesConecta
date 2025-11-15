import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Verified, Crown, Settings, Share2, Lock, Images, Flag, Coins, Wallet, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { generateMockCoupleProfiles, type CoupleProfileWithPartners } from "@/features/profile/coupleProfiles";
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';
import { PrivateImageRequest } from '@/components/profile/PrivateImageRequest';
import { PrivateImageGallery } from '@/components/profile/PrivateImageGallery';
import { ReportDialog } from '@/components/swipe/ReportDialog';
import { ProfileNavTabs } from '@/profiles/shared/ProfileNavTabs';
import { walletService, WalletService } from '@/services/WalletService';
import { nftService } from '@/services/NFTService';

const ProfileCouple: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CoupleProfileWithPartners | null>(null);
  const [loading, setLoading] = useState(true);
  const [_activeTab, _setActiveTab] = useState<'couple' | 'individual'>('couple');
  const [showPrivateImageRequest, setShowPrivateImageRequest] = useState(false);
  const [privateImageAccess, setPrivateImageAccess] = useState<'none' | 'pending' | 'approved' | 'denied'>('none');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const { isAuthenticated, user, profile: authProfile } = useAuth();

  // Estados para funcionalidades blockchain
  const [_walletInfo, setWalletInfo] = useState<any>(null);
  const [tokenBalances, setTokenBalances] = useState({ cmpx: '0', gtk: '0', matic: '0' });
  const [_testnetInfo, setTestnetInfo] = useState<any>(null);
  const [coupleNFTs, setCoupleNFTs] = useState<any[]>([]);
  const [coupleRequests, setCoupleRequests] = useState<any[]>([]);
  const [_isClaimingTokens, _setIsClaimingTokens] = useState(false);
  const [isDemoMode] = useState(WalletService.isDemoMode());

  // Determinar si es el perfil propio
  const isOwnProfile = user?.id === profile?.id;

  // Handlers para las acciones del perfil
  const handleUploadImage = () => {
    logger.info('Subir imagen solicitado');
    // Implementar lgica de subida de imagen
  };

  const handleDeletePost = (postId: string) => {
    logger.info('Eliminar post solicitado', { postId });
    // Implementar lgica de eliminacin de post
  };

  const handleCommentPost = (postId: string) => {
    logger.info('Comentar post solicitado', { postId });
    // Implementar lgica de comentario
  };

  // Funciones blockchain específicas para parejas
  const loadCoupleBlockchainData = async () => {
    if (!user?.id) return;
    
    try {
      // Cargar información específica de pareja
      const [wallet, tokens, nfts, requests, testnet] = await Promise.all([
        walletService.getOrCreateWallet(user.id).catch(() => null),
        walletService.getTokenBalances('').catch(() => ({ cmpx: '0', gtk: '0', matic: '0' })),
        nftService.getUserNFTs(user.id).catch(() => []),
        Promise.resolve([]).catch(() => []),
        walletService.getTestnetTokensInfo(user.id).catch(() => null)
      ]);
      
      setWalletInfo(wallet);
      setTokenBalances(tokens);
      setCoupleNFTs(nfts.filter(nft => nft.is_couple));
      setCoupleRequests(requests);
      setTestnetInfo(testnet);
    } catch (error) {
      logger.error('Error cargando datos blockchain de pareja:', { error: String(error) });
    }
  };

  const handleRequestCoupleNFT = async (partnerEmail: string) => {
    if (!user?.id) return;
    
    try {
      if (isDemoMode) {
        // Modo demo - simular solicitud de NFT de pareja
        const result = await walletService.executeDemoAction(user.id, 'couple_nft', { 
          partnerEmail,
          name: `NFT de ${profile?.partner1_first_name} & ${profile?.partner2_first_name}`,
          description: 'NFT de pareja con consentimiento doble'
        });
        logger.info('Solicitud de NFT de pareja creada (DEMO):', { result });
        
        // Agregar solicitud simulada
        const mockRequest = {
          id: `demo-${Date.now()}`,
          requestId: result.requestId,
          partner1_address: 'demo-address-1',
          partner2_address: 'demo-address-2',
          status: 'pending',
          expiresIn: result.expiresIn,
          created_at: new Date().toISOString()
        };
        setCoupleRequests(prev => [mockRequest, ...prev]);
      } else {
        // Modo real - crear solicitud real
        // Crear un archivo temporal para el NFT de pareja
        const tempFile = new File([''], 'couple-nft.png', { type: 'image/png' });
        const request = await nftService.requestCoupleNFT(user.id, partnerEmail, `NFT de ${profile?.partner1_first_name} & ${profile?.partner2_first_name}`, 'NFT de pareja con consentimiento doble', tempFile);
        logger.info('Solicitud de NFT de pareja creada:', request);
        
        // Recargar solicitudes
        const updatedRequests = await nftService.getCoupleNFTRequests(user.id);
        setCoupleRequests(updatedRequests);
      }
    } catch (error) {
      logger.error('Error creando solicitud de NFT de pareja:', { error: String(error) });
    }
  };

  const _handleApproveCoupleNFT = async (requestId: string) => {
    if (!user?.id) return;
    
    try {
      if (isDemoMode) {
        // Modo demo - simular aprobación
        logger.info('NFT de pareja aprobado (DEMO):', { requestId });
        
        // Actualizar estado de la solicitud
        setCoupleRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'approved', consent2_timestamp: new Date().toISOString() }
              : req
          )
        );
      } else {
        // Modo real - aprobar solicitud
        await nftService.approveCoupleNFT(requestId, user.id);
        logger.info('NFT de pareja aprobado:', { requestId });
        
        // Recargar solicitudes
        const updatedRequests = await nftService.getCoupleNFTRequests(user.id);
        setCoupleRequests(updatedRequests);
      }
    } catch (error) {
      logger.error('Error aprobando NFT de pareja:', { error: String(error) });
    }
  };
  
  // Migracin localStorage ? usePersistedState
  const [demoAuth, _setDemoAuth] = usePersistedState('demo_authenticated', 'false');
  const [demoUser, _setDemoUser] = usePersistedState<any>('demo_user', null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        logger.info('?? ProfileCouple - Estado de autenticacin:', {
          isAuthenticated,
          user: !!user,
          authProfile: !!authProfile
        });

        // Verificar si hay sesin demo activa PRIMERO
        if (demoAuth === 'true' && demoUser) {
          try {
            const parsedUser = typeof demoUser === 'string' ? JSON.parse(demoUser) : demoUser;
            logger.info('?? Cargando perfil demo pareja:', parsedUser);
            
            // Usar el perfil demo o generar uno basado en los datos demo
            const mockCoupleProfiles = generateMockCoupleProfiles();
            const demoProfile = mockCoupleProfiles[0]; // Usar el primer perfil como demo
            
            setProfile(demoProfile);
            setLoading(false);
            // Cargar datos blockchain para demo
            loadCoupleBlockchainData();
            return;
          } catch (error) {
            logger.error('Error parseando usuario demo pareja:', { error: String(error) });
          }
        }
        
        // Verificar autenticacin usando useAuth
        if (!isAuthenticated) {
          logger.info('? No autenticado, redirigiendo a auth');
          navigate('/auth', { replace: true });
          return;
        }
        
        // Simular carga de perfil de pareja real
        setTimeout(() => {
          const mockCoupleProfiles = generateMockCoupleProfiles();
          const selectedProfile = mockCoupleProfiles[0];
          
          setProfile(selectedProfile);
          setLoading(false);
          // Cargar datos blockchain
          loadCoupleBlockchainData();
        }, 1500);
        
      } catch (error) {
        logger.error('Error loading profile:', { error: String(error) });
        // Fallback a perfil mock
        const mockCoupleProfiles = generateMockCoupleProfiles();
        setProfile(mockCoupleProfiles[0]);
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [isAuthenticated, navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-hero-gradient">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-gradient-x"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-secondary/10 to-primary/15 animate-gradient-y"></div>
          </div>
          
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute top-40 right-32 w-48 h-48 bg-accent/8 rounded-full blur-2xl animate-float-reverse"></div>
            <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-secondary/4 rounded-full blur-3xl animate-float-slow shape-delay-2"></div>
            <div className="absolute bottom-20 right-20 w-56 h-56 bg-primary/6 rounded-full blur-2xl animate-float shape-delay-1"></div>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="bg-black/80 backdrop-blur-md border-b border-white/30 p-3 sm:p-4 shadow-lg flex-shrink-0">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-3 text-white">Cargando perfil...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 profile-page">
      {/* Background decorativo uniforme */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10"></div>
        </div>
      </div>
      
      {/* Navegacin superior */}
      <Navigation />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header centrado */}
        <div className="pt-20 pb-6 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {profile ? profile.couple_name : 'Mi Perfil - Pareja'}
            </h1>
            {isAuthenticated() && user && (
              <p className="text-white/80 text-sm sm:text-base">
                Logueado como: {user.email || 'Usuario'}
              </p>
            )}
          </div>
        </div>
        
        {/* Contenido principal centrado */}
        <div className="flex-1 pb-20 px-2 sm:px-4 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-4">
            <div className="flex gap-1 sm:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-white/10 hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: `Perfil de ${profile ? profile.partner1_first_name : 'Ella'} y ${profile ? profile.partner2_first_name : 'l'}`,
                      text: `Conoce a esta pareja en ComplicesConecta`,
                      url: window.location.href
                    }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(window.location.href).then(() => 
                      alert('Enlace copiado al portapapeles')
                    ).catch(console.error);
                  }
                }}
              >
                <Share2 className="h-4 w-4 text-white opacity-90" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/edit-profile-couple');
                }}
                className="hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
              >
                <Settings className="h-4 w-4 text-white" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/tokens');
                }}
                className="hover:bg-white/20 p-2 transition-all duration-300 hover:scale-105"
              >
                <Crown className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
            {/* Informacin principal de la pareja */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* Avatares de la pareja */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                        {profile?.partner1_first_name?.[0]?.toUpperCase() || 'E'}
                      </div>
                      {profile?.is_verified && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                          <Verified className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400 animate-pulse" />
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                        {profile?.partner2_first_name?.[0]?.toUpperCase() || ''}
                      </div>
                      {profile?.is_verified && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                          <Verified className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informacin bsica */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">
                      {profile?.partner1_first_name} & {profile?.partner2_first_name}
                    </h2>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                        Pareja
                      </Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 flex items-center gap-1 text-xs sm:text-sm">
                        <MapPin className="w-3 h-3" />
                        {profile?.location || 'CDMX, Mxico'}
                      </Badge>
                    </div>
                    
                    {/* Biografa */}
                    <p className="text-white/90 mb-4 leading-relaxed text-sm sm:text-base">
                      Una pareja aventurera que busca nuevas experiencias y conexiones autnticas.
                    </p>

                    {/* Botones de accin */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate('/edit-profile-couple');
                        }}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                        size="sm"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar Perfil</span>
                        <span className="sm:hidden">Editar</span>
                      </Button>
                      
                      <Button 
                        onClick={() => setShowReportDialog(true)}
                        variant="outline"
                        className="bg-red-500/20 hover:bg-red-600/30 text-red-200 border-red-400/30 flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                        size="sm"
                      >
                        <Flag className="w-4 h-4" />
                        <span className="hidden sm:inline">Reportar</span>
                        <span className="sm:hidden">Report</span>
                      </Button>
                      
                      {/* Botn para solicitar acceso a fotos privadas */}
                      {privateImageAccess === 'none' && (
                        <Button 
                          onClick={() => setShowPrivateImageRequest(true)}
                          className="bg-purple-600/80 hover:bg-purple-700/80 text-white flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                          size="sm"
                        >
                          <Lock className="w-4 h-4" />
                          <span className="hidden sm:inline">Ver Fotos Privadas</span>
                          <span className="sm:hidden">Privadas</span>
                        </Button>
                      )}
                      
                      {/* Estado de solicitud pendiente */}
                      {privateImageAccess === 'pending' && (
                        <Button 
                          disabled
                          className="bg-yellow-600/80 text-white flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                          size="sm"
                        >
                          <Lock className="w-4 h-4" />
                          <span className="hidden sm:inline">Solicitud Pendiente</span>
                          <span className="sm:hidden">Pendiente</span>
                        </Button>
                      )}
                      
                      {/* Acceso aprobado */}
                      {privateImageAccess === 'approved' && (
                        <Button 
                          onClick={() => {/* Mostrar galera privada */}}
                          className="bg-green-600/80 hover:bg-green-700/80 text-white flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                          size="sm"
                        >
                          <Images className="w-4 h-4" />
                          <span className="hidden sm:inline">Fotos Privadas</span>
                          <span className="sm:hidden">Privadas</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sección Blockchain para Parejas - Solo para perfil propio */}
            {isOwnProfile && (
              <Card className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 backdrop-blur-md border-pink-400/30 text-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-5 h-5 text-pink-400" />
                    <h3 className="text-lg font-semibold">Blockchain & NFTs de Pareja</h3>
                    {isDemoMode && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 text-xs">
                        DEMO
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium">CMPX</span>
                      </div>
                      <div className="text-lg font-bold">{tokenBalances.cmpx}</div>
                      <div className="text-xs text-white/70">Tokens Compartidos</div>
                    </div>
                    
                    <div className="p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-pink-400" />
                        <span className="text-sm font-medium">NFTs Pareja</span>
                      </div>
                      <div className="text-lg font-bold">{coupleNFTs.length}</div>
                      <div className="text-xs text-white/70">Colección Conjunta</div>
                    </div>
                    
                    <div className="p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span className="text-sm font-medium">Solicitudes</span>
                      </div>
                      <div className="text-lg font-bold">{coupleRequests.length}</div>
                      <div className="text-xs text-white/70">Pendientes</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      onClick={() => handleRequestCoupleNFT('pareja@demo.com')}
                      className="bg-pink-500/20 hover:bg-pink-600/30 text-pink-200 border-pink-400/30 flex items-center gap-2 text-sm px-3 py-2 border"
                    >
                      <Heart className="w-4 h-4" />
                      Crear NFT de Pareja
                    </Button>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-yellow-400" />
                      Sistema de Consentimiento Doble
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Todos los NFTs de pareja requieren aprobación de ambos miembros.
                      {isDemoMode && ' (Modo demo - sin transacciones reales)'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Navigation Tabs - Estilo Twitter/Instagram */}
            <ProfileNavTabs 
              isOwnProfile={isOwnProfile}
              onUploadImage={handleUploadImage}
              onDeletePost={handleDeletePost}
              onCommentPost={handleCommentPost}
            />

            {/* Galera privada - solo si tiene acceso aprobado */}
            {privateImageAccess === 'approved' && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white mt-6">
                <CardContent className="p-4 sm:p-6">
                  <PrivateImageGallery 
                    profileId={profile?.id || ''}
                    profileName={profile ? `${profile.partner1_first_name || ''} & ${profile.partner2_first_name || ''}` : 'Pareja'}
                    profileType="couple"
                    isOwner={false}
                    hasAccess={true}
                    images={[
                      {
                        id: '1',
                        url: '/src/assets/people/privado/coupleprivjpg.jpg',
                        thumbnail: '/src/assets/people/privado/coupleprivjpg.jpg',
                        uploadedAt: new Date()
                      }
                    ]}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navegacin inferior fija */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <Navigation />
        </div>
      </div>
      
      {/* Modal de solicitud de acceso a fotos privadas */}
      {showPrivateImageRequest && (
        <PrivateImageRequest
          isOpen={showPrivateImageRequest}
          onClose={() => setShowPrivateImageRequest(false)}
          profileId={profile?.id || ''}
          profileName={profile ? `${profile.partner1_first_name || ''} & ${profile.partner2_first_name || ''}` : 'Pareja'}
          profileType="couple"
          onRequestSent={() => {
            setPrivateImageAccess('pending');
            setShowPrivateImageRequest(false);
          }}
        />
      )}

      {/* Modal de reporte */}
      <ReportDialog
        profileId={profile?.id || ''}
        profileName={profile ? `${profile.partner1_first_name || ''} & ${profile.partner2_first_name || ''}` : 'Pareja'}
        isOpen={showReportDialog}
        onOpenChange={setShowReportDialog}
        onReport={(reason) => {
          console.log('Perfil reportado por:', reason);
          // Aqu se implementar la lgica de reporte
        }}
      />
    </div>
  );
};

export default ProfileCouple;