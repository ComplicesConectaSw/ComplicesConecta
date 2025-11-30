// ------------------------------------------------------------------
// 1. BLOQUE DE IMPORTS Y DEFINICIONES DE TIPO
// ------------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, MapPin, Verified, Crown, Settings, Share2, Lock, Images, Flag, 
  Coins, Wallet, Users, Baby, Calendar, MessageCircle, Eye, TrendingUp, 
  Award, CheckCircle, Edit, Camera, Gift, Zap, LogOut, Bell, X, Info, Loader2, 
  ShieldCheck, Gamepad2, Unlock, BarChart3 
} from "lucide-react";
import { TikTokShareButton } from '@/components/sharing/TikTokShareButton';
import Navigation from "@/components/Navigation";
import { generateMockCoupleProfiles, type CoupleProfileWithPartners } from "@/features/profile/coupleProfiles";
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';
import { PrivateImageRequest } from '@/components/profile/PrivateImageRequest';
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
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

// --- CORRECCIÓN DE IMÁGENES PARA EVITAR ERROR DE BUILD ---
// Usamos las imágenes NFT que sabemos que existen
import nftImage1 from '@/assets/Ntf/imagen1.jpg';
import nftImage2 from '@/assets/Ntf/imagen2.png';
import nftImage3 from '@/assets/Ntf/imagen3.png';
import nftImage4 from '@/assets/Ntf/imagen4.png';

// Usamos URLs externas para la galería de pareja para evitar errores de archivo no encontrado (ENOENT)
const COUPLE_GALLERY_1 = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=600&fit=crop";
const COUPLE_GALLERY_2 = "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=600&fit=crop";
const COUPLE_GALLERY_3 = "https://images.unsplash.com/photo-1519742866993-66d3cfef4dbd?w=600&h=600&fit=crop";
const COUPLE_GALLERY_4 = "https://images.unsplash.com/photo-1542596594-649edbc13630?w=600&h=600&fit=crop";

// Assets para la demo (Minteo, etc)
const DEMO_COUPLE_ASSETS = [nftImage1, nftImage2, nftImage3, nftImage4];

type CoupleProfileRow = Database['public']['Tables']['couple_profiles']['Row'];

type PrivateImageItem = {
  id?: string;
  url?: string;
  src?: string;
  caption?: string;
  likes?: number;
  userLiked?: boolean;
};

// --- TOAST COMPONENT ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
    className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${
      type === 'success' ? 'bg-green-900/90 border-green-500 text-white' : 
      type === 'error' ? 'bg-red-900/90 border-red-500 text-white' :
      'bg-blue-900/90 border-blue-500 text-white'
    }`}
  >
    {type === 'success' ? <CheckCircle className="w-5 h-5"/> : <Info className="w-5 h-5"/>}
    <span className="font-medium">{message}</span>
  </motion.div>
);

// ------------------------------------------------------------------
// 2. BLOQUE DEL COMPONENTE PRINCIPAL
// ------------------------------------------------------------------
const ProfileCouple: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const hasDataLoaded = useRef(false);
  const checkAuth = () => typeof isAuthenticated === 'function' ? isAuthenticated() : !!isAuthenticated;

  // --- ESTADOS ---
  const [profile, setProfile] = useState<CoupleProfileWithPartners | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modales y Seguridad
  const [showPrivateImageRequest, setShowPrivateImageRequest] = useState(false);
  const [privateImageAccess, setPrivateImageAccess] = useState<'none' | 'pending' | 'approved' | 'denied'>('none');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [demoPrivateUnlocked, setDemoPrivateUnlocked] = useState(false);
  
  const [isParentalLocked, setIsParentalLocked] = useState(() => {
    const saved = localStorage.getItem('parentalControlLocked');
    return saved !== null ? JSON.parse(saved) : true; // Bloqueado por defecto
  });

  // Notificaciones
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success'|'error'|'info'}>({ show: false, message: '', type: 'info' });
  const [showTopBanner, setShowTopBanner] = useState(true);

  // Galería y Actividad
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<PrivateImageItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  // Likes & Comments
  const [imageLikes, setImageLikes] = useState<{[key: string]: number}>({ '1': 45, '2': 32, '3': 89 });
  const [imageUserLikes, setImageUserLikes] = useState<{[key: string]: boolean}>({});
  const [_imageComments, setImageComments] = useState<{[key: string]: string[]}>({});

  // Blockchain & Demo
  const [_walletInfo, setWalletInfo] = useState<any>(null);
  const [tokenBalances, setTokenBalances] = useState({ cmpx: '0', gtk: '0', matic: '0' });
  const [coupleNFTs, setCoupleNFTs] = useState<any[]>([]);
  const [coupleRequests, setCoupleRequests] = useState<any[]>([]);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [isDemoMode] = useState(WalletService.isDemoMode());

  // Estado de Autenticación Persistente
  const [demoAuth] = usePersistedState('demo_authenticated', 'false');
  const [demoUser] = usePersistedState<any>('demo_user', null);
  const isOwnProfile = true; // Asumimos control en esta vista

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  // Stats iniciales para evitar vacío
  const [profileStats, setProfileStats] = useState({
    totalViews: 2500, totalLikes: 890, totalMatches: 120, profileCompleteness: 95,
    lastActive: new Date(), joinDate: new Date("2023-11-15"), verificationLevel: 3
  });

  // ------------------------------------------------------------------
  // 3. LÓGICA DE CARGA (HÍBRIDA)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (hasDataLoaded.current) return;

    const loadProfile = async () => {
      try {
        // Datos Mock Iniciales para Parejas
        const demoActivity = [
            { id: 1, type: 'match', description: '¡Match con Pareja Ana & Luis!', time: 'Hace 2 horas' },
            { id: 2, type: 'view', description: 'Tu perfil está siendo tendencia hoy', time: 'Hace 5 horas' },
            { id: 3, type: 'like', description: 'A 15 parejas les gustó tu foto', time: 'Ayer' },
        ];
        const demoAchievements = [
            { id: 1, title: 'Doble Verificación', description: 'Ambos miembros verificados', icon: Verified, unlocked: true },
            { id: 2, title: 'Pareja Popular', description: 'Más de 500 likes', icon: Heart, unlocked: true },
            { id: 3, title: 'Anfitriones VIP', description: 'Organizaron su primer evento', icon: Crown, unlocked: false },
            { id: 4, title: 'Identidad Real', description: 'KYC Completado', icon: CheckCircle, unlocked: true }
        ];
        const demoImages = [
            { id: '1', url: COUPLE_GALLERY_1, caption: 'Noche de fiesta', likes: 45, userLiked: false },
            { id: '2', url: COUPLE_GALLERY_2, caption: 'Viaje a Tulum', likes: 32, userLiked: false },
            { id: '3', url: COUPLE_GALLERY_3, caption: 'Relax en casa', likes: 89, userLiked: false },
            { id: '4', url: COUPLE_GALLERY_4, caption: 'Cena romántica', likes: 60, userLiked: false }
        ];

        setRecentActivity(demoActivity);
        setAchievements(demoAchievements);
        setGalleryImages(demoImages);
        setTokenBalances({ cmpx: '2500', gtk: '150', matic: '1.2' });

        // 1. Caso Demo
        if (demoAuth === 'true' && demoUser) {
          const mockProfiles = generateMockCoupleProfiles();
          setProfile(mockProfiles[0]); // Perfil Demo Pareja
          hasDataLoaded.current = true;
          setIsLoading(false);
          return;
        }

        // 2. Caso Real
        if (!checkAuth() || !user?.id) {
           // Fallback a mock si no hay auth
           const mockProfiles = generateMockCoupleProfiles();
           setProfile(mockProfiles[0]);
           setIsLoading(false);
           return;
        }

        if (user?.id) {
           // Intentar cargar de Supabase (CORRECCIÓN: Added optional chaining)
           const { data: coupleRow } = await supabase?.from('couple_profiles')
             .select('*')
             .eq('user_id', user.id)
             .maybeSingle<CoupleProfileRow>() || { data: null };
           
           if (coupleRow) {
             const realProfile: CoupleProfileWithPartners = {
                id: coupleRow.id,
                couple_name: coupleRow.display_name || 'Pareja Anónima',
                // ... mapeo completo (simplificado por brevedad)
                partner1_first_name: 'Partner 1', partner2_first_name: 'Partner 2',
                partner1_age: 25, partner2_age: 28,
                relationship_type: 'man-woman',
                isOnline: true
             } as any;
             setProfile(realProfile);
           } else {
             const mockProfiles = generateMockCoupleProfiles();
             setProfile(mockProfiles[0]);
           }
        }
        
        hasDataLoaded.current = true;
        setIsLoading(false);
      } catch (error) {
        logger.error('Error loading profile:', { error: String(error) });
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [isAuthenticated, demoAuth, demoUser, user]);

  // ------------------------------------------------------------------
  // 4. HANDLERS
  // ------------------------------------------------------------------
  
  // Subida de Imagen Simulada
  const handleUploadImage = () => {
    setIsUploading(true);
    setTimeout(() => {
        const randomImg = DEMO_COUPLE_ASSETS[Math.floor(Math.random() * DEMO_COUPLE_ASSETS.length)];
        const newId = Date.now().toString();

        // Agregar a Actividad y Galería
        setRecentActivity(prev => [{ 
            id: newId, type: 'post', description: 'Nuevo momento compartido 💕', time: 'Ahora mismo', image: randomImg 
        }, ...prev]);
        
        setGalleryImages(prev => [{ id: newId, url: randomImg, caption: 'Nueva carga', likes: 0, userLiked: false }, ...prev]);

        setIsUploading(false);
        showToast("Imagen publicada en el feed de pareja", "success");
        setActiveTab('activity');
    }, 1500);
  };

  const handlePinSubmit = () => {
    if (pinInput === "1234") {
        setIsParentalLocked(false);
        localStorage.setItem('parentalControlLocked', 'false');
        setShowPinModal(false);
        setPinInput("");
        showToast("Galería desbloqueada", "success");
    } else {
        showToast("PIN incorrecto (Prueba 1234)", "error");
        setPinInput("");
    }
  };

  const handleLockGallery = () => {
    setIsParentalLocked(true);
    localStorage.setItem('parentalControlLocked', 'true');
    showToast("Galería bloqueada", "info");
  };

  const handleViewPrivatePhotos = () => {
    if (isParentalLocked) setShowPinModal(true);
    else setDemoPrivateUnlocked(true);
  };

  const handleImageClick = (index: number) => {
    if (isParentalLocked) {
      setShowPinModal(true);
      return;
    }
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const handleClaimTokens = () => {
    if (isClaimingTokens) return;
    setIsClaimingTokens(true);
    setTimeout(() => {
        setTokenBalances(prev => ({ ...prev, cmpx: (parseFloat(prev.cmpx) + 2000).toString() }));
        setIsClaimingTokens(false);
        showToast("¡Bono de Pareja: 2000 CMPX reclamados!", "success");
    }, 1500);
  };

  const handleMintClick = () => setShowMintDialog(true);

  const confirmMinting = () => {
    setShowMintDialog(false);
    setIsMinting(true);
    setTimeout(() => {
        const randomImage = DEMO_COUPLE_ASSETS[Math.floor(Math.random() * DEMO_COUPLE_ASSETS.length)];
        const newNFT = {
            id: Date.now(),
            name: `Couple NFT #${coupleNFTs.length + 1}`,
            image: randomImage,
            description: "NFT de Unión de Pareja Verificado"
        };
        setCoupleNFTs(prev => [newNFT, ...prev]);
        setIsMinting(false);
        showToast("¡NFT de Pareja creado exitosamente!", "success");
    }, 2000);
  };

  // Handlers básicos
  const handleImageLike = (idx: number) => { showToast("Te gusta esta foto", "success"); };
  const handleAddComment = () => { showToast("Comentario agregado", "success"); };
  const handleDeletePost = (id: string) => { 
      if(window.confirm("¿Borrar post?")) {
          setRecentActivity(prev => prev.filter(p => p.id !== id));
          showToast("Post eliminado", "success");
      }
  };
  const handleCommentPost = () => { showToast("Comentar...", "info"); };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin"/>
      </div>
    );
  }

  const isDemoActive = (String(demoAuth) === 'true') && demoUser;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-purple-900 dark:via-purple-800 dark:to-blue-900 profile-page relative overflow-hidden transition-colors duration-300">
      
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 opacity-90 hidden dark:block"></div>
      
      {/* Navegación oculta si estamos logueados/demo */}
      {!isAuthenticated() && !isDemoActive && <Navigation />}
      
      {/* BANNER */}
      {(isAuthenticated() || isDemoActive) && showTopBanner && (
        <div className="relative z-50 bg-white/5 border-b border-white/10 px-4 py-2 flex items-center justify-between backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-white/90">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                <span>Pareja Verificada</span>
                <span className="mx-2 text-gray-300 dark:text-white/20">|</span>
                <Heart className="w-3 h-3 text-pink-500"/>
                <span className="text-pink-600 dark:text-pink-200">Aniversario: 15 Nov</span>
            </div>
            <X className="w-4 h-4 text-gray-400 dark:text-white/50 cursor-pointer hover:text-red-500" onClick={() => setShowTopBanner(false)}/>
        </div>
      )}
      
      <AnimatePresence>
        {notification.show && <Toast message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, show: false })} />}
      </AnimatePresence>
      
      <div className="relative z-10 pt-8 pb-6 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.couple_name}</h1>
        <p className="text-purple-600 dark:text-purple-200">@{profile.username || 'pareja_demo'}</p>
        <p className="text-sm text-gray-500 dark:text-white/60">ID: {profile.id}</p>
        <div className="mt-4 max-w-md mx-auto">
            <VanishSearchInput placeholders={['Buscar parejas...', 'Eventos swinger...', 'Clubs...']} onSubmit={(val) => console.log(val)} />
        </div>
      </div>

      <div className="relative z-10 flex-1 pb-20 px-2 sm:px-4 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-4">

            {/* TARJETA PRINCIPAL PAREJA */}
            <Card className="bg-white dark:bg-white/10 backdrop-blur-md border-gray-200 dark:border-white/20 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* AVATARES DOBLES */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 p-1 shadow-lg">
                        <SafeImage src={`https://ui-avatars.com/api/?name=${profile.partner1_first_name}&background=random`} alt="P1" className="rounded-full w-full h-full object-cover" />
                      </div>
                      {profile.is_verified && <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white"><Verified className="w-3 h-3 text-white" /></div>}
                    </div>
                    <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 p-1 shadow-lg">
                        <SafeImage src={`https://ui-avatars.com/api/?name=${profile.partner2_first_name}&background=random`} alt="P2" className="rounded-full w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="flex flex-col items-center sm:items-start justify-start flex-1 w-full">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{profile.partner1_first_name} & {profile.partner2_first_name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-white/10 dark:text-white"><MapPin className="w-3 h-3 mr-1"/> CDMX</Badge>
                      <Badge variant="outline" className="text-gray-600 dark:text-white border-gray-300 dark:border-white/40">{profile.partner1_age} y {profile.partner2_age} años</Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-white/90 mt-3 text-center sm:text-left italic">
                      "Una pareja aventurera buscando nuevas experiencias y conexiones auténticas."
                    </p>

                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start mt-4 w-full">
                      <Button onClick={() => navigate('/edit-profile-couple')} variant="secondary" size="sm" className="bg-gray-100 dark:bg-white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/30 border-none"><Edit className="w-4 h-4 mr-2"/> Editar</Button>
                      <Button onClick={() => setShowReportDialog(true)} variant="destructive" size="sm" className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200 border-red-200 dark:border-red-500/30 hover:bg-red-200"><Flag className="w-4 h-4 mr-2"/> Reportar</Button>
                      <TikTokShareButton url={window.location.href} text={`Mira el perfil de ${profile.couple_name}`} hashtags={['Parejas']} className="bg-black/10 dark:bg-black/40 text-gray-900 dark:text-white border-gray-200 dark:border-white/30" size="sm" />
                      {isOwnProfile && (
                         <Button onClick={() => { if (window.confirm(isDemoActive ? '¿Salir Demo?' : '¿Cerrar Sesión?')) { localStorage.removeItem('demo_authenticated'); localStorage.removeItem('demo_user'); window.location.href = '/'; }}} className="bg-gray-200 dark:bg-gray-600/50 hover:bg-gray-300 dark:hover:bg-gray-700/80 text-gray-800 dark:text-white flex items-center gap-2 text-sm px-3 py-2 border border-gray-300 dark:border-white/10">
                           {isDemoActive ? <><Gamepad2 className="w-4 h-4 mr-2" /> Salir Demo</> : <><LogOut className="w-4 h-4 mr-2" /> Salir</>}
                         </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
               <Card className="bg-white/80 dark:bg-black/40 border-gray-200 dark:border-white/10 backdrop-blur-sm"><CardContent className="p-3 text-center"><Eye className="w-6 h-6 mx-auto text-blue-500 dark:text-blue-400"/><div className="text-xl font-bold text-gray-900 dark:text-white">{profileStats.totalViews}</div><div className="text-xs text-gray-500 dark:text-gray-300">Visitas</div></CardContent></Card>
               <Card className="bg-white/80 dark:bg-black/40 border-gray-200 dark:border-white/10 backdrop-blur-sm"><CardContent className="p-3 text-center"><Heart className="w-6 h-6 mx-auto text-pink-500 dark:text-pink-400"/><div className="text-xl font-bold text-gray-900 dark:text-white">{profileStats.totalLikes}</div><div className="text-xs text-gray-500 dark:text-gray-300">Likes</div></CardContent></Card>
               <Card className="bg-white/80 dark:bg-black/40 border-gray-200 dark:border-white/10 backdrop-blur-sm"><CardContent className="p-3 text-center"><Users className="w-6 h-6 mx-auto text-purple-600 dark:text-purple-400"/><div className="text-xl font-bold text-gray-900 dark:text-white">{profileStats.totalMatches}</div><div className="text-xs text-gray-500 dark:text-gray-300">Matches</div></CardContent></Card>
               <Card className="bg-white/80 dark:bg-black/40 border-gray-200 dark:border-white/10 backdrop-blur-sm"><CardContent className="p-3 text-center"><TrendingUp className="w-6 h-6 mx-auto text-green-600 dark:text-green-400"/><div className="text-xl font-bold text-gray-900 dark:text-white">{profileStats.profileCompleteness}%</div><div className="text-xs text-gray-500 dark:text-gray-300">Completo</div></CardContent></Card>
            </div>

            {/* WALLET PAREJA */}
            {isOwnProfile && (
              <Card className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 border-pink-200 dark:border-pink-500/30 shadow-md">
                <CardHeader><CardTitle className="text-pink-900 dark:text-white flex items-center gap-2"><Wallet className="w-5 h-5 text-pink-500"/> Bóveda de Pareja (Shared)</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/60 dark:bg-black/40 p-3 rounded-lg border border-pink-100 dark:border-white/5"><div className="text-xs text-gray-500 dark:text-gray-400">CMPX</div><div className="font-bold text-yellow-600 dark:text-yellow-400 text-lg">{tokenBalances.cmpx}</div></div>
                    <div className="bg-white/60 dark:bg-black/40 p-3 rounded-lg border border-pink-100 dark:border-white/5"><div className="text-xs text-gray-500 dark:text-gray-400">GTK</div><div className="font-bold text-blue-600 dark:text-blue-400 text-lg">{tokenBalances.gtk}</div></div>
                    <div className="bg-white/60 dark:bg-black/40 p-3 rounded-lg border border-pink-100 dark:border-white/5"><div className="text-xs text-gray-500 dark:text-gray-400">NFTs</div><div className="font-bold text-purple-600 dark:text-purple-400 text-lg">{coupleNFTs.length}</div></div>
                  </div>
                  
                  <div className="bg-pink-900/10 border border-pink-500/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                          <Info className="w-5 h-5 text-pink-400" />
                          <span className="text-sm font-medium text-pink-800 dark:text-pink-200">Colección Conjunta</span>
                      </div>
                      {coupleNFTs.length > 0 ? (
                          <div className="flex gap-4 overflow-x-auto py-2 pb-4 scrollbar-hide">
                              {coupleNFTs.map((nft, i) => (
                                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} key={i} className="min-w-[140px] w-36 h-48 bg-black/40 rounded-xl overflow-hidden border border-pink-500/50 shadow-xl flex-shrink-0">
                                      <img src={nft.image} alt="NFT" className="w-full h-32 object-cover" />
                                      <div className="p-2"><div className="text-sm font-bold text-white truncate">{nft.name}</div></div>
                                  </motion.div>
                              ))}
                          </div>
                      ) : (
                          <p className="text-sm text-gray-500 dark:text-white/40 text-center py-4 italic">Aún no tienen NFTs de pareja.</p>
                      )}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleClaimTokens} disabled={isClaimingTokens} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6">{isClaimingTokens ? <Loader2 className="w-5 h-5 animate-spin"/> : <div className="flex flex-col items-center"><span className="flex items-center"><Gift className="w-4 h-4 mr-2"/> Reclamar</span><span className="text-[10px] opacity-90">Bono Pareja</span></div>}</Button>
                    <Button onClick={handleMintClick} disabled={isMinting} className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-6">{isMinting ? <Loader2 className="w-5 h-5 animate-spin"/> : <div className="flex flex-col items-center"><span className="flex items-center"><Camera className="w-4 h-4 mr-2"/> Mintear NFT</span><span className="text-[10px] opacity-90">Token de Unión</span></div>}</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TABS */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-white/10 backdrop-blur-md p-1 rounded-xl border border-gray-200 dark:border-white/10">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
                <TabsTrigger value="achievements">Logros</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* TAB RESUMEN */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                 {/* INTERESES PAREJA */}
                 <Card className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20">
                    <CardHeader><CardTitle className="text-gray-900 dark:text-white">Intereses Compartidos</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {['Intercambio Parejas', 'Viajes', 'Cenas', 'Fiestas Temáticas', 'Swinger Lifestyle'].map((tag, i) => (
                            <Badge key={i} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 px-3 py-1 text-xs hover:opacity-90">{tag}</Badge>
                        ))}
                    </CardContent>
                </Card>

                {/* GALERÍA PRIVADA */}
                <Card className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-2"><Lock className="w-4 h-4"/> Fotos Privadas</CardTitle>
                        <Button size="sm" className={isParentalLocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"} onClick={isParentalLocked ? () => setShowPinModal(true) : handleLockGallery}>
                            {isParentalLocked ? <><Unlock className="w-3 h-3 mr-1"/> Desbloquear</> : <><Lock className="w-3 h-3 mr-1"/> Bloquear</>}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {galleryImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden cursor-pointer shadow-sm" onClick={() => handleImageClick(idx)}>
                                    <SafeImage src={img.url || ''} className={cn("w-full h-full object-cover transition-all duration-500", isParentalLocked ? "blur-xl scale-110" : "blur-0 scale-100")} />
                                    {isParentalLocked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-black/30 z-10 backdrop-blur-[2px]">
                                            <div className="bg-white/80 dark:bg-black/50 p-2 rounded-full border border-gray-200 dark:border-white/20"><Lock className="w-5 h-5 text-gray-800 dark:text-white"/></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <ProfileNavTabs isOwnProfile={isOwnProfile} onUploadImage={handleUploadImage} onDeletePost={handleDeletePost} onCommentPost={handleCommentPost} />
              </TabsContent>
              
              {/* TAB ACTIVIDAD */}
              <TabsContent value="activity" className="mt-4 space-y-4">
                  {recentActivity.map((a) => (
                      <Card key={a.id} className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white overflow-hidden shadow-sm">
                          <CardContent className="p-0">
                              <div className="flex items-start gap-4 p-4">
                                  <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">
                                      {a.type === 'post' ? <Camera className="w-5 h-5 text-pink-600 dark:text-pink-300"/> : <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-300"/>}
                                  </div>
                                  <div className="flex-1">
                                      <p className="font-medium text-sm">{a.description}</p>
                                      <p className="text-xs text-gray-500 dark:text-white/50 mt-1">{a.time}</p>
                                  </div>
                              </div>
                              {a.image && (<div className="w-full h-64 bg-gray-100 dark:bg-black/50 border-t border-gray-200 dark:border-white/10"><img src={a.image} alt="Post" className="w-full h-full object-cover"/></div>)}
                          </CardContent>
                      </Card>
                  ))}
              </TabsContent>

              <TabsContent value="achievements" className="mt-4"><Card className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white"><CardContent className="p-4 grid grid-cols-2 gap-3">{achievements.map((a,i) => <div key={i} className={`p-3 rounded-lg border flex items-start gap-3 ${a.unlocked ? 'bg-pink-50 dark:bg-pink-900/40 border-pink-200 dark:border-pink-500/50' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-60'}`}><div className={`p-2 rounded-full ${a.unlocked ? 'bg-pink-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>{a.icon ? <a.icon className="w-4 h-4"/> : <Award className="w-4 h-4"/>}</div><div><div className="font-bold text-sm">{a.title}</div><div className="text-xs text-gray-500 dark:text-white/60 leading-tight">{a.description}</div></div></div>)}</CardContent></Card></TabsContent>
              <TabsContent value="analytics" className="mt-4"><Card className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5"/> Rendimiento Pareja</CardTitle></CardHeader><CardContent className="space-y-6 text-center text-gray-500 dark:text-white/60">Gráficos de rendimiento simulados...</CardContent></Card></TabsContent>
            </Tabs>
          </div>
      </div>

      {/* MODALES */}
      {showPrivateImageRequest && <PrivateImageRequest isOpen={showPrivateImageRequest} onClose={() => setShowPrivateImageRequest(false)} profileId={profile.id} profileName={profile.couple_name} profileType="couple" onRequestSent={() => setShowPrivateImageRequest(false)} />}
      
      <ParentalControl isLocked={isParentalLocked} onToggle={() => {}} onUnlock={() => {}} />
      
      {/* PIN MODAL */}
      <AnimatePresence>
        {showPinModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setShowPinModal(false)}>
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-pink-500/30 p-6 rounded-3xl w-full max-w-sm shadow-2xl mx-4 text-center backdrop-blur-xl" onClick={e => e.stopPropagation()}>
                    <div className="w-16 h-16 bg-pink-100 dark:bg-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-2 ring-pink-500/20"><Lock className="w-8 h-8 text-pink-600 dark:text-pink-400"/></div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seguridad</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Ingresa el PIN <strong className="text-pink-600 dark:text-white">1234</strong></p>
                    <input type="password" maxLength={4} value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full bg-gray-100 dark:bg-black/40 border border-gray-300 dark:border-white/20 rounded-xl p-3 text-center text-2xl tracking-widest text-gray-900 dark:text-white mb-6 focus:outline-none focus:border-pink-500" placeholder="••••" />
                    <div className="grid grid-cols-2 gap-4"><Button variant="outline" onClick={() => setShowPinModal(false)} className="border-gray-300 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5">Cancelar</Button><Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white border-0" onClick={handlePinSubmit}>Desbloquear</Button></div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* MINTEO MODAL */}
      <AnimatePresence>
      {showMintDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
              <div className="bg-white dark:bg-gray-900/90 p-6 rounded-2xl border border-gray-200 dark:border-pink-500/40 text-center max-w-sm m-4 shadow-2xl backdrop-blur-xl">
                  <div className="w-40 h-40 mx-auto mb-6 bg-pink-50 dark:bg-pink-900/50 rounded-xl flex items-center justify-center overflow-hidden border-2 border-pink-200 dark:border-pink-400/50 shadow-lg">
                      <img src={DEMO_COUPLE_ASSETS[Math.floor(Math.random() * DEMO_COUPLE_ASSETS.length)]} alt="Preview" className="w-full h-full object-cover"/>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mintear NFT de Unión</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-6">Token de Pareja en la red Polygon.</p>
                  <div className="flex gap-3"><Button variant="outline" className="flex-1 border-gray-300 dark:border-white/10 text-gray-700 dark:text-white" onClick={() => setShowMintDialog(false)}>Cancelar</Button><Button className="flex-1 bg-pink-600 hover:bg-pink-500 text-white" onClick={confirmMinting}>Confirmar</Button></div>
              </div>
          </motion.div>
      )}
      </AnimatePresence>

      <ImageModal isOpen={showImageModal} onClose={() => setShowImageModal(false)} images={galleryImages.map(img => img.url || '')} currentIndex={selectedImageIndex} onNavigate={setSelectedImageIndex} onLike={handleImageLike} onComment={handleAddComment} likes={imageLikes} userLikes={imageUserLikes} isPrivate={true} />
      <ReportDialog profileId={profile?.id || ''} profileName={profile.couple_name} isOpen={showReportDialog} onOpenChange={setShowReportDialog} onReport={(r) => console.log(r)} />
    </div>
  );
};

export default ProfileCouple;