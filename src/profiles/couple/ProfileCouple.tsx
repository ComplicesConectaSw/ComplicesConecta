import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
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
  Baby,
  Calendar,
  MessageCircle,
  Eye,
  TrendingUp,
  Award,
  CheckCircle,
  Edit,
  Camera,
  Gift,
  Zap
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { TikTokShareButton } from '@/components/sharing/TikTokShareButton';

type CoupleProfileRow = Database['public']['Tables']['couple_profiles']['Row'];

const ProfileCouple: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CoupleProfileWithPartners | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState('overview');

  const [showPrivateImageRequest, setShowPrivateImageRequest] = useState(false);
  const [privateImageAccess, setPrivateImageAccess] = useState<'none' | 'pending' | 'approved' | 'denied'>('none');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [demoPrivateUnlocked, setDemoPrivateUnlocked] = useState(false);
  const [isParentalLocked, setIsParentalLocked] = usePersistedState('parentalLock', false);
  
  // Estados para modal de imágenes
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLikes, setImageLikes] = useState<{[key: string]: number}>({});
  const [imageUserLikes, setImageUserLikes] = useState<{[key: string]: boolean}>({});
  const [_imageComments, _setImageComments] = useState<{[key: string]: string[]}>({});
  
  // Estados para Stats y Gamification (Traído de Single)
  const [profileStats, setProfileStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalMatches: 0,
    profileCompleteness: 0,
    lastActive: new Date(),
    joinDate: new Date(),
    verificationLevel: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  const { isAuthenticated, user, profile: authProfile } = useAuth();
  
  // Helper de autenticación
  const checkAuth = () => {
    return typeof isAuthenticated === 'function' ? isAuthenticated() : !!isAuthenticated;
  };

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

  // Función para hacer funcional el botón "Ver Fotos Privadas"
  const handleViewPrivatePhotos = () => {
    if (isOwnProfile) {
      if (isParentalLocked) {
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

  // Handlers para las acciones del perfil (Posts)
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

  // Carga de Stats y Logros (Simulado, igual que en Single)
  const loadProfileStats = () => {
    setProfileStats({
      totalViews: Math.floor(Math.random() * 2000) + 500,
      totalLikes: Math.floor(Math.random() * 800) + 100,
      totalMatches: Math.floor(Math.random() * 150) + 20,
      profileCompleteness: 85,
      lastActive: new Date(),
      joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180), // 6 meses
      verificationLevel: 2
    });
  };

  const loadRecentActivity = () => {
    setRecentActivity([
      { id: 1, type: 'match', description: '¡Match con Pareja Ana & Luis!', time: 'Hace 2 horas' },
      { id: 2, type: 'view', description: 'Tu perfil está siendo tendencia hoy', time: 'Hace 5 horas' },
      { id: 3, type: 'like', description: 'A 15 parejas les gustó tu foto', time: 'Ayer' },
    ]);
  };

  const loadAchievements = () => {
    setAchievements([
      { id: 1, title: 'Doble Verificación', description: 'Ambos miembros verificados', icon: Verified, unlocked: true },
      { id: 2, title: 'Pareja Popular', description: 'Más de 500 likes', icon: Heart, unlocked: true },
      { id: 3, title: 'Anfitriones VIP', description: 'Organizaron su primer evento', icon: Crown, unlocked: false },
      { id: 4, title: 'Identidad Real', description: 'KYC Completado', icon: CheckCircle, unlocked: true }
    ]);
  };

  // Funciones blockchain específicas para parejas
  const loadCoupleBlockchainData = async () => {
    if (!user?.id) return;
    
    try {
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
        const result = await walletService.executeDemoAction(user.id, 'couple_nft', { 
          partnerEmail,
          name: `NFT de ${profile?.partner1_first_name} & ${profile?.partner2_first_name}`,
          description: 'NFT de pareja con consentimiento doble'
        });
        logger.info('Solicitud de NFT de pareja creada (DEMO):', { result });
        
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
        alert('💍 Solicitud de Consentimiento enviada a tu pareja.');
      }
    } catch (error) {
      logger.error('Error creando solicitud de NFT de pareja:', { error: String(error) });
    }
  };
  
  // Persisted state para demo
  const [demoAuth, _setDemoAuth] = usePersistedState('demo_authenticated', 'false');
  const [demoUser, _setDemoUser] = usePersistedState<any>('demo_user', null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Cargar datos stats
        loadProfileStats();
        loadRecentActivity();
        loadAchievements();

        // Verificar sesión demo
        if (demoAuth === 'true' && demoUser) {
          const mockProfiles = generateMockCoupleProfiles();
          const demoCoupleProfile = mockProfiles[0];
          setProfile(demoCoupleProfile);
          setLoading(false);
          loadCoupleBlockchainData();
          return;
        }

        // Usuarios reales
        if (!checkAuth() || !user?.id) {
          navigate('/auth', { replace: true });
          return;
        }

        if (!supabase) {
          const mockCoupleProfiles = generateMockCoupleProfiles();
          setProfile(mockCoupleProfiles[0]);
          setLoading(false);
          return;
        }

        const { data: coupleRow, error } = await supabase
          .from('couple_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_demo', false)
          .maybeSingle<CoupleProfileRow>();

        if (error || !coupleRow) {
          const mockCoupleProfiles = generateMockCoupleProfiles();
          setProfile(mockCoupleProfiles[0]);
          setLoading(false);
          loadCoupleBlockchainData();
          return;
        }

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
        const mockCoupleProfiles = generateMockCoupleProfiles();
        setProfile(mockCoupleProfiles[0]);
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [isAuthenticated, navigate, demoAuth, demoUser, user]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 profile-page">
      {/* Background decorativo */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10"></div>
        </div>
      </div>
      
      <Navigation />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header centrado */}
        <div className="profile-header-container pt-20">
          <div className="max-w-36rem mx-auto text-center space-y-4">
            <div>
              <h1 className="profile-header-title">{profile.couple_name || 'Perfil de Pareja'}</h1>
              <p className="profile-header-username">{profile.username || '@sofiayleo_sw'}</p>
              <p className="text-sm text-white/60">ID: {profile.id || 'CC-2025-002'}</p>
            </div>

            <VanishSearchInput
              placeholders={[
                'Buscar parejas en Ciudad de México...',
                'Eventos exclusivos este fin de semana...',
                'Clubs verificados con alberca...',
              ]}
              onSubmit={(val) => console.log('Buscando:', val)}
            />
          </div>
        </div>
        
        {/* Acciones Rápidas Superiores */}
        <div className="flex-1 pb-20 px-2 sm:px-4 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-4">
            <div className="flex gap-1 sm:gap-2 justify-center">
              {/* Botones de acción rápida opcionales o utilitarios */}
            </div>

            {/* Tarjeta Principal de Perfil */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* Avatares de la pareja (Doble) */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                        <SafeImage
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.partner1_first_name)}&background=random`}
                          alt="P1"
                          fallbackType="avatar"
                          className="rounded-full w-full h-full object-cover"
                        />
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
                        <SafeImage
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.partner2_first_name)}&background=random`}
                          alt="P2"
                          fallbackType="avatar"
                          className="rounded-full w-full h-full object-cover"
                        />
                      </div>
                      {profile?.is_verified && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                          <Verified className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información básica */}
                  <div className="flex flex-col items-center sm:items-start justify-start flex-1 w-full">
                    <h2 className="text-lg font-bold text-center sm:text-left">{profile?.partner1_first_name} & {profile?.partner2_first_name}</h2>
                    <div className="flex flex-wrap gap-1 mt-2 justify-center sm:justify-start">
                      <Badge className="profile-badge badge-location">
                        <MapPin className="w-4 h-4" />
                        {profile?.location || 'CDMX, México'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4 w-full max-w-xs sm:max-w-none">
                      <div>
                        <p className="font-semibold text-white">{profile.partner1_first_name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge className="profile-badge badge-age">🎂 {profile.partner1_age}</Badge>
                          <Badge className="profile-badge badge-gender">{profile.partner1_gender === 'female' ? '♀️' : '♂️'}</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{profile.partner2_first_name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge className="profile-badge badge-age">🎂 {profile.partner2_age}</Badge>
                          <Badge className="profile-badge badge-gender">{profile.partner2_gender === 'female' ? '♀️' : '♂️'}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-white/90 mt-4 text-center sm:text-left">
                      Una pareja aventurera que busca nuevas experiencias y conexiones auténticas.
                    </p>

                    {/* Botones de acción principales */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start mt-4 w-full">
                      <Button 
                        onClick={() => navigate('/edit-profile-couple')}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex items-center gap-2 text-sm sm:text-base px-3 py-2"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      
                      <Button 
                        onClick={() => setShowReportDialog(true)}
                        variant="outline"
                        className="bg-red-500/20 hover:bg-red-600/30 text-red-200 border-red-400/30 flex items-center gap-2 text-sm sm:text-base px-3 py-2"
                        size="sm"
                      >
                        <Flag className="w-4 h-4" />
                        <span className="hidden sm:inline">Reportar</span>
                      </Button>

                      <TikTokShareButton
                        url={window.location.href}
                        text={`Mira el perfil de ${profile.couple_name} en ComplicesConecta 💕`}
                        hashtags={['ComplicesConecta', 'Parejas', 'Swinger', 'Mexico']}
                        className="bg-black/20 hover:bg-black/30 text-white border-white/30 flex items-center gap-2 text-sm sm:text-base px-3 py-2"
                        variant="outline"
                        size="default"
                      />

                      {/* Botón Logout (NUEVO) */}
                      {isOwnProfile && (
                         <Button 
                           onClick={() => {
                             if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                               localStorage.removeItem('demo_authenticated');
                               localStorage.removeItem('demo_user');
                               window.location.href = '/';
                             }
                           }}
                           className="bg-gray-600/80 hover:bg-gray-700/80 text-white flex items-center gap-2 text-sm sm:text-base px-3 py-2"
                           size="sm"
                         >
                           <Lock className="w-4 h-4" />
                           <span className="hidden sm:inline">Salir</span>
                         </Button>
                      )}
                      
                      {/* Lógica Fotos Privadas */}
                      {privateImageAccess === 'none' && (
                        <Button 
                          onClick={handleViewPrivatePhotos}
                          className="bg-purple-600/80 hover:bg-purple-700/80 text-white flex items-center gap-2 text-sm sm:text-base px-3 py-2"
                          size="sm"
                        >
                          <Lock className="w-4 h-4" />
                          <span className="hidden sm:inline">Privadas</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards con Animación (Traído de Single) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-colors">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Eye className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-lg sm:text-2xl font-bold">{profileStats.totalViews}</div>
                    <div className="text-xs sm:text-sm text-white/70">Visitas</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-colors">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-pink-400" />
                    <div className="text-lg sm:text-2xl font-bold">{profileStats.totalLikes}</div>
                    <div className="text-xs sm:text-sm text-white/70">Likes</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-colors">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-purple-400" />
                    <div className="text-lg sm:text-2xl font-bold">{profileStats.totalMatches}</div>
                    <div className="text-xs sm:text-sm text-white/70">Matches</div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-colors">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-green-400" />
                    <div className="text-lg sm:text-2xl font-bold">{profileStats.profileCompleteness}%</div>
                    <div className="text-xs sm:text-sm text-white/70">Completo</div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sección Blockchain para Parejas (Mantenido Lógica Couple) */}
            {isOwnProfile && (
              <Card className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 backdrop-blur-md border-pink-400/30 text-white">
                <CardHeader>
                   <CardTitle className="text-white flex items-center gap-2">
                     <Wallet className="w-5 h-5 text-pink-400" />
                     Bóveda de Pareja (Shared Wallet)
                     {isDemoMode && <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 text-xs">DEMO</Badge>}
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium">CMPX</span>
                      </div>
                      <div className="text-lg font-bold">{tokenBalances.cmpx}</div>
                      <div className="text-xs text-white/70">Saldo Conjunto</div>
                    </div>
                    
                    <div className="p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-pink-400" />
                        <span className="text-sm font-medium">NFTs</span>
                      </div>
                      <div className="text-lg font-bold">{coupleNFTs.length}</div>
                      <div className="text-xs text-white/70">Colección Pareja</div>
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

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleRequestCoupleNFT('pareja@demo.com')}
                      className="bg-pink-500/20 hover:bg-pink-600/30 text-pink-200 border-pink-400/30 flex items-center gap-2 text-sm px-3 py-2 border"
                    >
                      <Heart className="w-4 h-4" />
                      Solicitar NFT de Unión (Requiere Doble Firma)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sistema de Tabs (Igualando arquitectura Single) */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white/20 text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-white/20 text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Actividad
                </TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-white/20 text-white">
                  <Award className="w-4 h-4 mr-2" />
                  Logros
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20 text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* CONTENIDO TAB RESUMEN */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                
                {/* Beneficios demo para parejas */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                  <CardContent className="pt-4">
                    <HoverEffect
                      items={[
                        {
                          title: 'Intercambio Seguro',
                          description: 'Acuerdos claros, control parental y consentimiento doble.',
                          link: '#',
                          icon: <Heart className="w-5 h-5 text-pink-300" />,
                        },
                        {
                          title: 'Fiestas Privadas',
                          description: 'Invitaciones a eventos cerrados con parejas verificadas.',
                          link: '#',
                          icon: <Crown className="w-5 h-5 text-yellow-300" />,
                        },
                        {
                          title: 'Viajes Lifestyle',
                          description: 'Escapadas seleccionadas para parejas afines.',
                          link: '#',
                          icon: <MapPin className="w-5 h-5 text-blue-200" />,
                        },
                      ]}
                      className="pt-2"
                    />
                  </CardContent>
                </Card>

                {/* Experiencias */}
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
                            <span>Ver experiencias Parejas VIP</span>
                          </ModalTrigger>
                          <ModalBody>
                            <ModalContent>
                              <h4 className="text-lg md:text-2xl text-white font-bold text-center mb-8">
                                Experiencias para Parejas
                              </h4>
                              <div className="text-center text-neutral-300 space-y-4">
                                <p>Conecta con otras parejas verificadas en un entorno seguro.</p>
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

                {/* GALERÍA PRIVADA DENTRO DE TABS */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Fotos Privadas (4)
                    </h4>
                    <Button
                      onClick={() => {
                        if (!isParentalLocked) {
                          setIsParentalLocked(true);
                          setDemoPrivateUnlocked(false);
                          localStorage.setItem('parentalControlLocked', JSON.stringify(true));
                        }
                      }}
                      className={`text-xs px-3 py-1.5 flex items-center gap-1.5 transition-all ${
                        isParentalLocked 
                          ? 'bg-red-600/80 hover:bg-red-700/80 text-white cursor-default' 
                          : 'bg-orange-600/80 hover:bg-orange-700/80 text-white hover:scale-105'
                      }`}
                      disabled={isParentalLocked}
                    >
                      {isParentalLocked ? (
                        <>
                          <Lock className="w-3 h-3" />
                          🔒 Bloqueado (PIN requerido)
                        </>
                      ) : demoPrivateUnlocked ? (
                        <>
                          <Baby className="w-3 h-3" />
                          Bloquear Ahora
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          Click en foto para desbloquear
                        </>
                      )}
                    </Button>
                  </div>

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
                            // Se abrirá el modal por el componente ParentalControl
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
                          className={cn(
                            "w-full h-full object-cover transition-all duration-500",
                            isParentalLocked ? 'blur-xl scale-110' : 'blur-0 scale-100'
                          )}
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

                {/* ProfileNavTabs MOVIDO AQUI PARA EVITAR DUPLICIDAD FUERA DEL TABS */}
                <ProfileNavTabs 
                  isOwnProfile={isOwnProfile}
                  onUploadImage={handleUploadImage}
                  onDeletePost={handleDeletePost}
                  onCommentPost={handleCommentPost}
                />
              </TabsContent>

              {/* CONTENIDO TAB ACTIVIDAD */}
              <TabsContent value="activity" className="mt-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Actividad de la Pareja
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{activity.description}</p>
                            <p className="text-white/60 text-xs">{activity.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* CONTENIDO TAB LOGROS */}
              <TabsContent value="achievements" className="mt-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Logros de Pareja
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {achievements.map((achievement) => {
                        const Icon = achievement.icon;
                        return (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-lg border ${
                              achievement.unlocked 
                                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/30' 
                                : 'bg-white/5 border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                achievement.unlocked 
                                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                                  : 'bg-gray-600'
                              }`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className={`font-semibold ${
                                  achievement.unlocked ? 'text-yellow-300' : 'text-white/60'
                                }`}>
                                  {achievement.title}
                                </h3>
                                <p className="text-white/70 text-sm">{achievement.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* CONTENIDO TAB ANALYTICS */}
              <TabsContent value="analytics" className="mt-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Analytics de la Cuenta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h3 className="text-white font-semibold mb-2">Última Conexión</h3>
                          <p className="text-white/70 text-sm">
                            {profileStats.lastActive.toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h3 className="text-white font-semibold mb-2">Pareja Desde</h3>
                          <p className="text-white/70 text-sm">
                            {profileStats.joinDate.toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Navegación inferior fija */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <Navigation />
        </div>
      </div>
      
      {/* Modales Auxiliares */}
      {showPrivateImageRequest && (
        <PrivateImageRequest
          isOpen={showPrivateImageRequest}
          onClose={() => setShowPrivateImageRequest(false)}
          profileId={profile?.id || ''}
          profileName={profile.couple_name}
          profileType="couple"
          onRequestSent={() => {
            setPrivateImageAccess('pending');
            setShowPrivateImageRequest(false);
          }}
        />
      )}

      <ParentalControl
        isLocked={isParentalLocked}
        onToggle={(locked) => {
          setIsParentalLocked(locked);
          localStorage.setItem('parentalControlLocked', JSON.stringify(locked));
          if (!locked) {
            setDemoPrivateUnlocked(true);
          } else {
            setDemoPrivateUnlocked(false);
          }
        }}
        onUnlock={() => setDemoPrivateUnlocked(true)}
      />

      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        images={[
          '/assets/people/couple/privado/coupleprivjpg.jpg',
          '/assets/people/couple/privado/privadicouple2.jpg',
          '/assets/people/couple/privado/privado couplple4.jpg',
          '/assets/people/couple/privado/privadocouple (3).jpg'
        ]}
        currentIndex={selectedImageIndex}
        onNavigate={navigateCarousel}
        onLike={handleImageLike}
        onComment={handleAddComment}
        likes={imageLikes}
        userLikes={imageUserLikes}
        isPrivate={true}
      />

      <ReportDialog
        profileId={profile?.id || ''}
        profileName={profile.couple_name}
        isOpen={showReportDialog}
        onOpenChange={setShowReportDialog}
        onReport={(reason) => console.log('Reportado:', reason)}
      />
    </div>
  );
};

export default ProfileCouple;