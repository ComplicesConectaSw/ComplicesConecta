import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MapPin, 
  Verified, 
  Crown, 
  Settings, 
  Share2, 
  Lock, 
  Images, 
  Flag, 
  Coins, 
  Wallet, 
  Users, 
  Baby
} from "lucide-react";
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
import { ImageModal } from '@/profiles/shared/ImageModal';
import { ParentalControl } from '@/components/profile/ParentalControl';
import { HoverEffect } from '@/components/ui/card-hover-effect';
import { ComplianceSignupForm } from '@/shared/ui/compliance-signup-form';
import { EventsCarousel } from '@/shared/ui/events-carousel';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalTrigger } from '@/components/modals/animated-modal';
import { FileUpload } from '@/shared/ui/file-upload';
import { VanishSearchInput } from '@/shared/ui/vanish-search-input';
import { walletService, WalletService } from '@/services/WalletService';
import { nftService } from '@/services/NFTService';
import { SafeImage } from '@/shared/ui/SafeImage';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase-generated';

type CoupleProfileRow = Database['public']['Tables']['couple_profiles']['Row'];

const ProfileCouple: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CoupleProfileWithPartners | null>(null);
  const [loading, setLoading] = useState(true);
  const [_activeTab, _setActiveTab] = useState<'couple' | 'individual'>('couple');
  const [showPrivateImageRequest, setShowPrivateImageRequest] = useState(false);
  const [privateImageAccess, setPrivateImageAccess] = useState<'none' | 'pending' | 'approved' | 'denied'>('none');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [demoPrivateUnlocked, setDemoPrivateUnlocked] = useState(false);
  const [isParentalLocked, setIsParentalLocked] = usePersistedState('parentalLock', false);
  const isGalleryUnlocked = !isParentalLocked && demoPrivateUnlocked;
  
  // Estados para modal de imágenes
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLikes, setImageLikes] = useState<{[key: string]: number}>({});
  const [imageUserLikes, setImageUserLikes] = useState<{[key: string]: boolean}>({});
  const [_imageComments, _setImageComments] = useState<{[key: string]: string[]}>({});
  
  // Función para hacer funcional el botón "Ver Fotos Privadas"
  const handleViewPrivatePhotos = () => {
    if (isOwnProfile) {
      // Si es el propio perfil, solicitar desbloqueo con PIN
      if (isParentalLocked) {
        // Mostrar el modal de control parental para ingresar PIN
        // El control parental ya está en la página, solo necesitamos activarlo
        return;
      }
      setDemoPrivateUnlocked(true);
    } else {
      setShowPrivateImageRequest(true);
    }
  };

  // Funciones para modal de imágenes
  const handleImageLike = (imageIndex: number) => {
    const imageId = imageIndex.toString();
    const currentLikes = imageLikes[imageId] || 0;
    const userLiked = imageUserLikes[imageId] || false;
    
    if (userLiked) {
      setImageLikes(prev => ({ ...prev, [imageId]: currentLikes - 1 }));
      setImageUserLikes(prev => ({ ...prev, [imageId]: false }));
    } else {
      setImageLikes(prev => ({ ...prev, [imageId]: currentLikes + 1 }));
      setImageUserLikes(prev => ({ ...prev, [imageId]: true }));
    }
  };

  const handleAddComment = (imageIndex: number) => {
    const comment = prompt('Añadir comentario:');
    if (comment) {
      const imageId = imageIndex.toString();
      _setImageComments(prev => ({
        ...prev,
        [imageId]: [...(prev[imageId] || []), comment]
      }));
    }
  };

  const navigateCarousel = (index: number) => {
    setSelectedImageIndex(index);
  };

  const _openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

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
    alert('🖼️ Subir Imagen (DEMO)\n\nEn la versión completa, esto abrirá la galería para que puedas subir una nueva foto.');
  };

  const handleDeletePost = (postId: string) => {
    logger.info('Eliminar post solicitado', { postId });
    if (window.confirm('🗑️ ¿Seguro que quieres eliminar este post? (Acción de DEMO)')) {
      alert('✅ Post eliminado (temporalmente para el demo)');
    }
  };

  const handleCommentPost = (postId: string) => {
    logger.info('Comentar post solicitado', { postId });
    alert('💬 Comentar Post (DEMO)\n\nAquí se abriría la sección de comentarios para que puedas escribir.');
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
  
  // Migración localStorage → usePersistedState
  const [demoAuth, _setDemoAuth] = usePersistedState('demo_authenticated', 'false');
  const [demoUser, _setDemoUser] = usePersistedState<any>('demo_user', null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        logger.info('?? ProfileCouple - Estado de autenticación:', {
          isAuthenticated,
          user: !!user,
          authProfile: !!authProfile
        });

        // Verificar si hay sesión demo activa PRIMERO
        if (demoAuth === 'true' && demoUser) {
          logger.info('?? Cargando perfil demo pareja...');
          const mockProfiles = generateMockCoupleProfiles();
          const demoCoupleProfile = mockProfiles[0];
          setProfile(demoCoupleProfile);
          setLoading(false);
          loadCoupleBlockchainData();
          return;
        }

        // Usuarios reales: intentar cargar desde couple_profiles
        if (!isAuthenticated || !user?.id) {
          logger.info('? No autenticado, redirigiendo a auth');
          navigate('/auth', { replace: true });
          return;
        }

        if (!supabase) {
          logger.error('Supabase no está disponible, usando mocks de pareja');
          const mockCoupleProfiles = generateMockCoupleProfiles();
          setProfile(mockCoupleProfiles[0]);
          setLoading(false);
          return;
        }

        logger.info('🔗 Cargando perfil de pareja real desde couple_profiles...', { userId: user.id });

        const { data: coupleRow, error } = await supabase
          .from('couple_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_demo', false)
          .maybeSingle<CoupleProfileRow>();

        if (error) {
          logger.error('❌ Error cargando couple_profiles, usando mocks', { error: error.message });
          const mockCoupleProfiles = generateMockCoupleProfiles();
          setProfile(mockCoupleProfiles[0]);
          setLoading(false);
          loadCoupleBlockchainData();
          return;
        }

        if (!coupleRow) {
          logger.info('ℹ️ No se encontró perfil de pareja real, usando mocks');
          const mockCoupleProfiles = generateMockCoupleProfiles();
          setProfile(mockCoupleProfiles[0]);
          setLoading(false);
          loadCoupleBlockchainData();
          return;
        }

        // Mapear CoupleProfileRow (DB) a CoupleProfileWithPartners (UI) usando solo columnas existentes
        const realCoupleProfile: CoupleProfileWithPartners = {
          id: coupleRow.id,
          couple_name: coupleRow.display_name || 'Pareja Anónima',
          username: undefined,
          couple_bio: null,
          relationship_type: 'man-woman',
          partner1_id: coupleRow.partner_1_id || coupleRow.user_id,
          partner2_id: coupleRow.partner_2_id || `${coupleRow.user_id}-partner-2`,
          couple_images: null,
          is_verified: coupleRow.verification_level ? coupleRow.verification_level > 0 : null,
          is_premium: null,
          created_at: coupleRow.created_at || new Date().toISOString(),
          updated_at: coupleRow.updated_at || new Date().toISOString(),
          partner1_first_name: 'Partner 1',
          partner1_last_name: '',
          partner1_age: 0,
          partner1_bio: null,
          partner1_gender: 'desconocido',
          partner1_interested_in: undefined,
          partner2_first_name: 'Partner 2',
          partner2_last_name: '',
          partner2_age: 0,
          partner2_bio: null,
          partner2_gender: 'desconocido',
          partner2_interested_in: undefined,
          location: coupleRow.location || undefined,
          isOnline: coupleRow.last_active ? true : false,
        };

        setProfile(realCoupleProfile);
        setLoading(false);
        loadCoupleBlockchainData();
        
      } catch (error) {
        logger.error('Error loading profile:', { error: String(error) });
        // Fallback a perfil mock
        const mockCoupleProfiles = generateMockCoupleProfiles();
        setProfile(mockCoupleProfiles[0]);
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [isAuthenticated, navigate, demoAuth, demoUser, user]);

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
        <div className="profile-header-container">
          <div className="max-w-36rem mx-auto text-center space-y-4">
            <div>
              <h1 className="profile-header-title">{profile.couple_name || 'Perfil de Pareja'}</h1>
              <p className="profile-header-username">{profile.username || '@sofiayleo_sw'}</p>
              <p className="text-sm text-white/60">ID: {profile.id || 'CC-2025-002'}</p>
              {isAuthenticated() && user && (
                <p className="profile-header-email">{user.email || 'Usuario'}</p>
              )}
            </div>

            <VanishSearchInput
              placeholders={[
                'Buscar parejas en Ciudad de México...',
                'Eventos exclusivos este fin de semana...',
                'Clubs verificados con alberca...',
                'Cenas románticas Lifestyle...',
                'Usuarios con intereses en Viajes...',
              ]}
              onSubmit={(val) => {
                console.log('Buscando:', val);
              }}
            />
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
                  <div className="flex flex-col items-center justify-start flex-1">
                    <h2 className="text-lg font-bold">{profile?.partner1_first_name} & {profile?.partner2_first_name}</h2>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge className="profile-badge badge-location">
                        <MapPin className="w-4 h-4" />
                        {profile?.location || 'CDMX, México'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
                      <div>
                        <p className="font-semibold text-white">{profile.partner1_first_name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge className="profile-badge badge-age">🎂 {profile.partner1_age} años</Badge>
                          <Badge className="profile-badge badge-gender">{profile.partner1_gender === 'female' ? '♀️' : '♂️'}</Badge>
                          <Badge className="profile-badge badge-orientation">{profile.partner1_interested_in === 'both' ? '⚥' : '⚤'}</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{profile.partner2_first_name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge className="profile-badge badge-age">🎂 {profile.partner2_age} años</Badge>
                          <Badge className="profile-badge badge-gender">{profile.partner2_gender === 'female' ? '♀️' : '♂️'}</Badge>
                          <Badge className="profile-badge badge-orientation">{profile.partner2_interested_in === 'both' ? '⚥' : '⚤'}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Biografa */}
                    <p className="text-sm text-white/90 mt-4">
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
                      
                      {/* Botón para solicitar acceso a fotos privadas */}
                      {privateImageAccess === 'none' && (
                        <Button 
                          onClick={handleViewPrivatePhotos}
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

            {/* Beneficios demo para parejas - grid con efecto hover */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="pt-4">
                <HoverEffect
                  items={[
                    {
                      title: 'Intercambio Seguro',
                      description: 'Acuerdos claros, control parental y consentimiento doble en cada paso.',
                      link: '#',
                      icon: <Heart className="w-5 h-5 text-pink-300" />,
                    },
                    {
                      title: 'Fiestas Privadas',
                      description: 'Invitaciones a eventos cerrados con parejas verificadas y anfitriones confiables.',
                      link: '#',
                      icon: <Crown className="w-5 h-5 text-yellow-300" />,
                    },
                    {
                      title: 'Clubes Verificados',
                      description: 'Acceso a clubes lifestyle auditados para seguridad y discreción.',
                      link: '#',
                      icon: <Users className="w-5 h-5 text-purple-200" />,
                    },
                    {
                      title: 'Viajes Lifestyle',
                      description: 'Escapadas seleccionadas para parejas afines en destinos exclusivos.',
                      link: '#',
                      icon: <MapPin className="w-5 h-5 text-blue-200" />,
                    },
                    {
                      title: 'Comunidad Selecta',
                      description: 'Perfiles curados para minimizar fricción y maximizar compatibilidad.',
                      link: '#',
                      icon: <Verified className="w-5 h-5 text-green-300" />,
                    },
                    {
                      title: 'Parejas Afines',
                      description: 'Algoritmos que priorizan intereses, límites y estilo de relación.',
                      link: '#',
                      icon: <Baby className="w-5 h-5 text-pink-200" />,
                    },
                  ]}
                  className="pt-2"
                />
              </CardContent>
            </Card>

            {/* Experiencias demo compartidas: eventos, registro rápido y verificación KYC */}
            <Card className="bg-black/60 backdrop-blur-xl border border-purple-500/30 text-white">
              <CardContent className="space-y-6 pt-4">
                <EventsCarousel />
                <div className="grid gap-4 lg:grid-cols-2">
                  <ComplianceSignupForm />
                  <div className="space-y-4">
                    <FileUpload />
                    <Modal>
                      <ModalTrigger className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold flex items-center justify-center gap-2 rounded-xl py-3 shadow-lg">
                        <Heart className="w-4 h-4" />
                        <span>Ver experiencias VIP demo</span>
                      </ModalTrigger>

                      <ModalBody>
                        <ModalContent>
                          <h4 className="text-lg md:text-2xl text-white font-bold text-center mb-8">
                            Experiencias para Parejas
                          </h4>
                          <div className="text-center text-neutral-300 space-y-4">
                            <p>Conecta con otras parejas verificadas en un entorno seguro.</p>
                            {/* TODO: Reutilizar contenido existente de experiencias VIP para parejas si se define un bloque específico */}
                          </div>
                        </ModalContent>
                        <ModalFooter className="gap-4">
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-md">Continuar</button>
                        </ModalFooter>
                      </ModalBody>
                    </Modal>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Navigation Tabs - Estilo Twitter/Instagram */}
            <ProfileNavTabs 
              isOwnProfile={isOwnProfile}
              onUploadImage={handleUploadImage}
              onDeletePost={handleDeletePost}
              onCommentPost={handleCommentPost}
            />

            {/* SECCIÓN GALERÍA PRIVADA (DÚO/PAREJA) BLINDADA */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Fotos Privadas (4)
                </h4>
                {/* Indicador de estado */}
                <div
                  className={`text-xs px-3 py-1.5 flex items-center gap-1.5 rounded-full font-medium transition-all ${
                    isParentalLocked ? 'bg-red-600/80 text-white' : 'bg-green-600/80 text-white'
                  }`}
                >
                  {isParentalLocked ? <Lock className="w-3 h-3" /> : <Baby className="w-3 h-3" />}
                  {isParentalLocked ? 'Protegido' : 'Visible'}
                </div>
              </div>

              {/* Grid Dinámico (Igual que Single) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 cursor-pointer">
                {[
                  '/assets/people/couple/privado/coupleprivjpg.jpg',
                  '/assets/people/couple/privado/privadicouple2.jpg',
                  '/assets/people/couple/privado/privado couplple4.jpg',
                  '/assets/people/couple/privado/privadocouple (3).jpg'
                ].map((imageSrc, idx) => (
                  <div
                    key={imageSrc}
                    className="relative aspect-square rounded-xl overflow-hidden group"
                    onClick={() => {
                      if (isParentalLocked) {
                        alert('🔒 Contenido protegido. Ingresa el PIN de Control Parental para desbloquear.');
                        return;
                      }

                      if (isOwnProfile) {
                        setDemoPrivateUnlocked(true);
                      } else {
                        setShowPrivateImageRequest(true);
                      }

                      setSelectedImageIndex(idx);
                      setShowImageModal(true);
                    }}
                  >
                    <SafeImage
                      src={imageSrc}
                      alt={`Foto privada ${idx + 1}`}
                      fallbackType="private"
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        isParentalLocked ? 'blur-xl scale-110' : 'blur-0 scale-100'
                      }`}
                    />

                    {isParentalLocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all group-hover:bg-black/30">
                        <div className="bg-black/60 p-3 rounded-full border border-white/20 backdrop-blur-md">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-white mt-2 bg-black/50 px-2 py-1 rounded-md">
                          Click para desbloquear
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Galera privada - solo si tiene acceso aprobado */}
            {(privateImageAccess === 'approved' || (demoPrivateUnlocked && isOwnProfile)) && (
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
                        url: '/assets/people/couple/privado/coupleprivjpg.jpg',
                        thumbnail: '/assets/people/couple/privado/coupleprivjpg.jpg',
                        uploadedAt: new Date()
                      },
                      {
                        id: '2',
                        url: '/assets/people/couple/privado/privadicouple2.jpg',
                        thumbnail: '/assets/people/couple/privado/privadicouple2.jpg',
                        uploadedAt: new Date()
                      },
                      {
                        id: '3',
                        url: '/assets/people/couple/privado/privado couplple4.jpg',
                        thumbnail: '/assets/people/couple/privado/privado couplple4.jpg',
                        uploadedAt: new Date()
                      },
                      {
                        id: '4',
                        url: '/assets/people/couple/privado/privadocouple (3).jpg',
                        thumbnail: '/assets/people/couple/privado/privadocouple (3).jpg',
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

      {/* Control Parental */}
      <ParentalControl
        isLocked={isParentalLocked}
        onToggle={(locked) => {
          setIsParentalLocked(locked);
          localStorage.setItem('parentalControlLocked', JSON.stringify(locked));
          // Si se desbloquea, permitir acceso a imágenes privadas
          if (!locked) {
            setDemoPrivateUnlocked(true);
          } else {
            // Si se bloquea, ocultar imágenes privadas
            setDemoPrivateUnlocked(false);
          }
        }}
        onUnlock={() => {
          // Callback cuando se desbloquea exitosamente con PIN
          setDemoPrivateUnlocked(true);
        }}
      />

      {/* Modal de carrusel de imágenes */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        images={[
          '/src/assets/people/couple/privado/couple-private-1.jpg',
          '/src/assets/people/couple/privado/couple-private-2.jpg',
          '/src/assets/people/couple/privado/couple-private-3.jpg',
          '/src/assets/people/couple/privado/couple-private-4.jpg'
        ]}
        currentIndex={selectedImageIndex}
        onNavigate={navigateCarousel}
        onLike={handleImageLike}
        onComment={handleAddComment}
        likes={imageLikes}
        userLikes={imageUserLikes}
        isPrivate={true}
      />

      {/* Modal de reporte */}
      <ReportDialog
        profileId={profile?.id || ''}
        profileName={`${profile?.partner1_first_name || ''} & ${profile?.partner2_first_name || ''}`}
        isOpen={showReportDialog}
        onOpenChange={setShowReportDialog}
        onReport={(reason) => {
          console.log('Perfil reportado por:', reason);
        }}
      />
    </div>
  );
};

export default ProfileCouple;