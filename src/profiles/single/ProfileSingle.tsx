import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
// AQUÍ ESTABA EL DETALLE: Agregamos ShieldCheck, Gamepad2 y Send a la lista
import { 
  Heart, MessageCircle, Share2, MapPin, Calendar, Star, Camera, Flag, Lock,   
  CheckCircle, Award, Edit, Images, Eye, Users, TrendingUp, Wallet, 
  Coins, Zap, Gift, Unlock, Loader2, Info, ExternalLink, BarChart3, ShieldCheck, LogOut, Bell, X, Gamepad2, Send
} from 'lucide-react';
import { TikTokShareButton } from '@/components/sharing/TikTokShareButton';
import Navigation from '@/components/Navigation';
// ESTA LÍNEA ES LA QUE TE FALTABA PARA EL ERROR DE ProfileNavTabs:
import { ProfileNavTabs } from '@/profiles/shared/ProfileNavTabs';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { Database } from '@/types/supabase-generated';
import { PrivateImageRequest } from '@/components/profile/PrivateImageRequest';
import { ReportDialog } from '@/components/swipe/ReportDialog';
import { ImageModal } from '@/profiles/shared/ImageModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { walletService, WalletService } from '@/services/WalletService';
import { nftService } from '@/services/NFTService';
import { HoverEffect } from '@/components/ui/card-hover-effect';
import { ComplianceSignupForm } from '@/shared/ui/compliance-signup-form';
import { EventsCarousel } from '@/shared/ui/events-carousel';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalTrigger } from '@/components/modals/animated-modal';
import { FileUpload } from '@/shared/ui/file-upload';
import { VanishSearchInput } from '@/shared/ui/vanish-search-input';
import { SafeImage } from '@/shared/ui/SafeImage';
import { cn } from '@/shared/lib/cn';

// IMÁGENES LOCALES
import nftImage1 from '@/assets/Ntf/imagen1.jpg';
import nftImage2 from '@/assets/Ntf/imagen2.png';
import nftImage3 from '@/assets/Ntf/imagen3.png';
import nftImage4 from '@/assets/Ntf/imagen4.png';

const DEMO_ASSETS = [nftImage1, nftImage2, nftImage3, nftImage4];

// --- TIPOS ---
type ProfileRow = Database['public']['Tables']['profiles']['Row'] & {
  nickname?: string | null;
  profile_id?: string | null;
  privateImages?: unknown;
};

type PrivateImageItem = {
  id?: string;
  url?: string;
  src?: string;
  caption?: string;
  likes?: number;
  userLiked?: boolean;
};

// --- TOAST ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
    className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${
      type === 'success' ? 'bg-green-600 text-white border-green-400' : 
      type === 'error' ? 'bg-red-600 text-white border-red-400' :
      'bg-blue-600 text-white border-blue-400'
    }`}
  >
    {type === 'success' ? <CheckCircle className="w-5 h-5"/> : <Info className="w-5 h-5"/>}
    <span className="font-medium">{message}</span>
  </motion.div>
);

const ProfileSingle: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile: authProfile, isAuthenticated } = useAuth();
  const hasDataLoaded = useRef(false);
  const checkAuth = () => typeof isAuthenticated === 'function' ? isAuthenticated() : !!isAuthenticated;

  // --- ESTADOS ---
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrivateImageRequest, setShowPrivateImageRequest] = useState(false);
  const [privateImageAccess, setPrivateImageAccess] = usePersistedState<'none' | 'pending' | 'approved' | 'denied'>('private_image_access', 'none');
  const [demoPrivateUnlocked, setDemoPrivateUnlocked] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  
  // UI States
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success'|'error'|'info'}>({ show: false, message: '', type: 'info' });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTopBanner, setShowTopBanner] = useState(true);

  const [isParentalLocked, setIsParentalLocked] = useState(() => {
    const saved = localStorage.getItem('parentalControlLocked');
    return saved !== null ? JSON.parse(saved) : true; 
  });

  const [profileStats, setProfileStats] = useState({
    totalViews: 0, totalLikes: 0, totalMatches: 0, profileCompleteness: 0,
    lastActive: new Date(), joinDate: new Date(), verificationLevel: 0
  });
  
  // Estado local para imágenes y actividad
  const [galleryImages, setGalleryImages] = useState<PrivateImageItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  // Likes & Comments States
  const [imageLikes, setImageLikes] = useState<{[key: string]: number}>({ '1': 12, '2': 8, '3': 15 });
  const [imageUserLikes, setImageUserLikes] = useState<{[key: string]: boolean}>({});
  const [_imageComments, setImageComments] = useState<{[key: string]: string[]}>({});

  // Blockchain State
  const [tokenBalances, setTokenBalances] = useState({ cmpx: '0', gtk: '0', matic: '0' });
  const [testnetInfo, setTestnetInfo] = useState<any>({ canClaim: true, remaining: 1000 });
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [isDemoMode] = useState(WalletService.isDemoMode());

  const isOwnProfile = true; 
  const [demoAuth] = usePersistedState('demo_authenticated', 'false');
  const [demoUser] = usePersistedState<any>('demo_user', null);

  const SHOW_ONLINE_BADGE = true;
  const SHOW_BIO_SECTION = true;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  // --- LÓGICA DE CARGA ---
  useEffect(() => {
    if (hasDataLoaded.current) return;

    const initProfile = async () => {
      try {
        const isDemoActive = (String(demoAuth) === 'true') && demoUser;
        
        // Datos Mock Iniciales
        const demoStats = {
            totalViews: 1250, totalLikes: 342, totalMatches: 45, profileCompleteness: 85,
            lastActive: new Date(), joinDate: new Date("2024-01-15"), verificationLevel: 2
        };
        const demoActivity = [
            { id: 1, type: 'match', description: 'Match con Pareja Ana & Luis', time: 'Hace 2h' },
            { id: 2, type: 'view', description: 'Tu perfil es tendencia', time: 'Hace 5h' }
        ];
        const demoAchievements = [
            { id: 1, title: 'Primer Like', description: 'Recibiste tu primer like', icon: Heart, unlocked: true },
            { id: 2, title: 'Verificado', description: 'Identidad confirmada', icon: ShieldCheck, unlocked: true },
            { id: 3, title: 'Popular', description: 'Más de 100 visitas', icon: Star, unlocked: true },
            { id: 4, title: 'VIP', description: 'Miembro exclusivo', icon: Award, unlocked: false }
        ];
        const demoImages = [
            { id: '1', url: nftImage1, caption: 'Foto artística', likes: 12, userLiked: false },
            { id: '2', url: nftImage2, caption: 'Sesión profesional', likes: 8, userLiked: false },
            { id: '3', url: nftImage3, caption: 'Momento íntimo', likes: 15, userLiked: false }
        ];

        setProfileStats(demoStats);
        setRecentActivity(demoActivity);
        setAchievements(demoAchievements);
        setGalleryImages(demoImages);
        setTokenBalances({ cmpx: '100', gtk: '50', matic: '0.5' });

        if (isDemoActive) {
           const parsedUser = typeof demoUser === 'string' ? JSON.parse(demoUser) : demoUser;
           const demoProfileData: any = {
             id: parsedUser.id || 'demo-single-1',
             name: parsedUser.name || 'Sofía Demo',
             nickname: '@sofia_demo',
             age: 28,
           };
           setProfile(demoProfileData);
        } else if (authProfile) {
           setProfile(authProfile);
        }

        hasDataLoaded.current = true;
        setIsLoading(false);

      } catch (error) {
        console.error('Error initProfile:', error);
        setIsLoading(false);
      }
    };
    initProfile();
  }, [authProfile, demoAuth, demoUser]);

  // --- HANDLERS ---
  const handleImageLike = (imageIndex: number) => { 
    const id = imageIndex.toString();
    setImageLikes(prev => ({...prev, [id]: (prev[id] || 0) + 1}));
    showToast("¡Te gusta esta foto!", "success");
  };

  const handleAddComment = (imageIndex: number) => { 
    const comment = prompt('Escribe tu comentario:');
    if (comment) {
        showToast("Comentario agregado", "success");
    }
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
        setTokenBalances(prev => ({ ...prev, cmpx: (parseFloat(prev.cmpx) + 1000).toString() }));
        setIsClaimingTokens(false);
        showToast("¡Has reclamado 1000 CMPX!", "success");
    }, 1500);
  };

  const handleMintClick = () => setShowMintDialog(true);
  
  const confirmMinting = () => {
    setShowMintDialog(false);
    setIsMinting(true);
    setTimeout(() => {
        const randomImage = DEMO_ASSETS[Math.floor(Math.random() * DEMO_ASSETS.length)];
        const newNFT = {
            id: Date.now(),
            name: `Profile #${userNFTs.length + 1}`,
            image: randomImage,
            description: "Identidad Digital Verificada"
        };
        setUserNFTs(prev => [newNFT, ...prev]);
        setIsMinting(false);
        showToast("¡NFT Minteado exitosamente!", "success");
    }, 2000);
  };

  // --- SUBIDA DE IMAGEN DEMO ---
  const handleUploadImage = () => {
    setIsUploading(true);
    setTimeout(() => {
        const randomImg = DEMO_ASSETS[Math.floor(Math.random() * DEMO_ASSETS.length)];
        const newId = Date.now().toString();

        const newPost = { 
            id: newId, 
            type: 'post', 
            description: 'Nuevo post desde la app 📸', 
            time: 'Ahora mismo', 
            image: randomImg 
        };

        // Actualizar Actividad
        setRecentActivity(prev => [newPost, ...prev]);
        
        // Actualizar Galería
        setGalleryImages(prev => [
            { id: newId, url: randomImg, caption: 'Nueva carga', likes: 0, userLiked: false },
            ...prev
        ]);

        setIsUploading(false);
        showToast("Imagen publicada y guardada", "success");
        // No cambiamos de tab, para que vea que se agrega en la lista de abajo
    }, 1500);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('🗑️ ¿Eliminar este post?')) {
        setRecentActivity(prev => prev.filter(p => p.id !== postId));
        showToast("Post eliminado", "success");
    }
  };

  const handleCommentPost = (postId: string) => { 
      const comment = prompt("Escribe un comentario...");
      if(comment) showToast("Comentario enviado", "success");
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

  const handleShareProfile = async () => {
    if (navigator.share) { await navigator.share({ title: `Perfil de ${profile?.name}`, url: window.location.href }); } 
    else { navigator.clipboard.writeText(window.location.href); showToast("Link copiado", "success"); }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Cargando...</div>;
  
  const currentProfile = profile || { name: 'Usuario', nickname: 'usuario', id: 'invitado', age: 25 } as ProfileRow;
  const displayName = currentProfile.display_name || currentProfile.name || 'Usuario';
  const displayAge = currentProfile.age || 25;
  const isDemoActive = (String(demoAuth) === 'true') && demoUser;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-purple-900 dark:via-purple-800 dark:to-blue-900 profile-page relative overflow-hidden transition-colors duration-300">
      
      {/* Background solo en dark mode */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 opacity-90 hidden dark:block"></div>
      
      {/* ZONA SUPERIOR RESERVADA (Top Banner) */}
      {!isAuthenticated() && !isDemoActive && <Navigation />}
      
      {/* BANNER DE ESTADO */}
      {(isAuthenticated() || isDemoActive) && showTopBanner && (
        <div className="relative z-50 bg-white dark:bg-white/5 border-b border-gray-200 dark:border-white/10 px-4 py-2 flex items-center justify-between backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-white/90">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span>Sistema Online</span>
                <span className="mx-2 text-gray-300 dark:text-white/20">|</span>
                <Gift className="w-3 h-3 text-purple-600 dark:text-yellow-400"/>
                <span className="text-purple-700 dark:text-yellow-100">Promo: +50% primera recarga</span>
            </div>
            <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-gray-500 dark:text-white/70 cursor-pointer hover:text-purple-600 dark:hover:text-white"/>
                <X className="w-4 h-4 text-gray-400 dark:text-white/50 cursor-pointer hover:text-red-500 dark:hover:text-white" onClick={() => setShowTopBanner(false)}/>
            </div>
        </div>
      )}
      
      <AnimatePresence>
        {notification.show && <Toast message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, show: false })} />}
      </AnimatePresence>

      <div className="relative z-10 pt-8 pb-6 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
        <p className="text-purple-600 dark:text-purple-200">@{currentProfile.nickname || 'usuario'}</p>
        <p className="text-sm text-gray-500 dark:text-white/60">ID: {currentProfile.profile_id || 'DEMO-USER'}</p>
        <div className="mt-4 max-w-md mx-auto">
            <VanishSearchInput placeholders={['Buscar...', 'Eventos...']} onSubmit={(val) => console.log(val)} />
        </div>
      </div>

      <div className="relative z-10 pb-20 px-2 sm:px-4 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-4">
          
          {/* TARJETA PRINCIPAL */}
          <Card className="bg-white dark:bg-white/10 backdrop-blur-md border-gray-200 dark:border-white/20 shadow-lg dark:shadow-none">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-100 dark:border-purple-500/30 shadow-xl">
                    <SafeImage src={nftImage1} alt="Avatar" className="w-full h-full object-cover" />
                    {SHOW_ONLINE_BADGE && <div className="absolute bottom-2 right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-white/10 dark:text-white border-0 hover:bg-purple-200"><MapPin className="w-3 h-3 mr-1"/> CDMX</Badge> 
                        <Badge variant="outline" className="text-gray-700 border-gray-300 dark:text-white dark:border-white/40 dark:bg-white/5">{displayAge} años</Badge>
                        <Badge variant="outline" className="text-gray-700 border-gray-300 dark:text-white dark:border-white/40 dark:bg-white/5">⚧️ No especificado</Badge>
                        <Badge variant="outline" className="text-gray-700 border-gray-300 dark:text-white dark:border-white/40 dark:bg-white/5">⚤ Bisexual</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                        <Button onClick={() => navigate('/edit-profile-single')} variant="secondary" size="sm" className="bg-gray-100 dark:bg-white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/30 border-none"><Edit className="w-4 h-4 mr-2"/> Editar</Button>
                        <Button onClick={() => navigator.clipboard.writeText(window.location.href)} className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200 border-blue-200 dark:border-blue-400/30 flex items-center gap-2 text-sm px-3 py-2 border"><Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Compartir</span></Button>
                        <TikTokShareButton url={window.location.href} text={`Perfil de ${currentProfile.name}`} hashtags={['ComplicesConecta']} className="bg-black/10 dark:bg-black/40 text-gray-900 dark:text-white border-gray-200 dark:border-white/30" size="sm" />
                        <Button onClick={() => setShowReportDialog(true)} variant="destructive" size="sm" className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200 border-red-200 dark:border-red-500/30 hover:bg-red-200"><Flag className="w-4 h-4 mr-2"/> Reportar</Button>
                        
                        {isOwnProfile && (
                          <Button 
                            onClick={() => { if (window.confirm(isDemoActive ? '¿Salir del modo Demo?' : '¿Cerrar sesión?')) { localStorage.removeItem('demo_authenticated'); localStorage.removeItem('demo_user'); window.location.href = '/'; }}} 
                            className="bg-gray-200 dark:bg-gray-600/50 hover:bg-gray-300 dark:hover:bg-gray-700/80 text-gray-800 dark:text-white flex items-center gap-2 text-sm px-3 py-2 border border-gray-300 dark:border-white/10"
                          >
                            {isDemoActive ? <><Gamepad2 className="w-4 h-4 mr-2" /> Salir Demo</> : <><LogOut className="w-4 h-4 mr-2" /> Salir</>}
                          </Button>
                        )}
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             <Card className="bg-white/80 dark:bg-black/40 border-gray-200 dark:border-white/10 backdrop-blur-sm shadow-sm"><CardContent className="p-3 text-center"><Eye className="w-6 h-6 mx-auto text-blue-500 dark:text-blue-400"/><div className="text-xl font-bold text-gray-900 dark:text-white">{profileStats.totalViews}</div><div className="text-xs text-gray-500 dark:text-gray-300">Visitas</div></CardContent></Card>
             <Card className="bg-white/80 dark:bg-black/40 border-gray-200 dark:border-white/10 backdrop-blur-sm shadow-sm"><CardContent className="p-3 text-center"><Heart className="w-6 h-6 mx-auto text-pink-500 dark:text-pink-400"/><div className="text-xl font-bold text-gray-900 dark:text-white">{profileStats.totalLikes}</div><div className="text-xs text-gray-500 dark:text-gray-300">Likes</div></CardContent></Card>
             <Card className="bg-white/80 dark:bg-black/40 border-gray-200 dark:border-white/10 backdrop-blur-sm shadow-sm"><CardContent className="p-3 text-center"><Users className="w-6 h-6 mx-auto text-purple-600 dark:text-purple-400"/><div className="text-xl font-bold text-gray-900 dark:text-white">{profileStats.totalMatches}</div><div className="text-xs text-gray-500 dark:text-gray-300">Matches</div></CardContent></Card>
             <Card className="bg-white/80 dark:bg-black/40 border-gray-200 dark:border-white/10 backdrop-blur-sm shadow-sm"><CardContent className="p-3 text-center"><TrendingUp className="w-6 h-6 mx-auto text-green-600 dark:text-green-400"/><div className="text-xl font-bold text-gray-900 dark:text-white">{profileStats.profileCompleteness}%</div><div className="text-xs text-gray-500 dark:text-gray-300">Completo</div></CardContent></Card>
          </div>

          {/* WALLET */}
          {isOwnProfile && (
            <Card className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 border-purple-200 dark:border-purple-500/30 shadow-md">
              <CardHeader><CardTitle className="text-purple-900 dark:text-white flex items-center gap-2"><Wallet className="w-5 h-5"/> Wallet & Coleccionables</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/60 dark:bg-black/40 p-3 rounded-lg border border-purple-100 dark:border-white/5"><div className="text-xs text-gray-500 dark:text-gray-400">CMPX</div><div className="font-bold text-yellow-600 dark:text-yellow-400 text-lg">{tokenBalances.cmpx}</div></div>
                    <div className="bg-white/60 dark:bg-black/40 p-3 rounded-lg border border-purple-100 dark:border-white/5"><div className="text-xs text-gray-500 dark:text-gray-400">GTK</div><div className="font-bold text-blue-600 dark:text-blue-400 text-lg">{tokenBalances.gtk}</div></div>
                    <div className="bg-white/60 dark:bg-black/40 p-3 rounded-lg border border-purple-100 dark:border-white/5"><div className="text-xs text-gray-500 dark:text-gray-400">NFTs</div><div className="font-bold text-purple-600 dark:text-purple-400 text-lg">{userNFTs.length}</div></div>
                </div>
                
                <div className="flex gap-3">
                    <Button onClick={handleClaimTokens} disabled={isClaimingTokens} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6">
                        {isClaimingTokens ? <Loader2 className="w-5 h-5 animate-spin"/> : <div className="flex flex-col items-center"><span className="flex items-center"><Gift className="w-4 h-4 mr-2"/> Reclamar</span><span className="text-[10px] opacity-90">1000 CMPX Gratis</span></div>}
                    </Button>
                    <Button onClick={handleMintClick} disabled={isMinting} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-6">
                        {isMinting ? <Loader2 className="w-5 h-5 animate-spin"/> : <div className="flex flex-col items-center"><span className="flex items-center"><Camera className="w-4 h-4 mr-2"/> Mintear NFT</span><span className="text-[10px] opacity-90">Crear Coleccionable</span></div>}
                    </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-white/10 backdrop-blur-md p-1 rounded-xl border border-gray-200 dark:border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-white/20 text-gray-600 dark:text-white">Resumen</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-white/20 text-gray-600 dark:text-white">Actividad</TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-white/20 text-gray-600 dark:text-white">Logros</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-white/20 text-gray-600 dark:text-white">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
                <Card className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-2"><Lock className="w-4 h-4"/> Fotos Privadas</CardTitle>
                        <Button 
                            size="sm" 
                            className={isParentalLocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
                            onClick={isParentalLocked ? () => setShowPinModal(true) : handleLockGallery}
                        >
                            {isParentalLocked ? <><Unlock className="w-3 h-3 mr-1"/> Desbloquear</> : <><Lock className="w-3 h-3 mr-1"/> Bloquear</>}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                            {galleryImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-sm" onClick={() => handleImageClick(idx)}>
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
                
                {/* INTERESES CON GRADIENTE */}
                <Card className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 mt-4">
                    <CardHeader><CardTitle className="text-gray-900 dark:text-white">Mis Intereses</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {['Lifestyle Swinger', 'Fiestas Temáticas', 'Viajes', 'Cenas', 'Cockteles'].map((tag, i) => (
                            <Badge key={i} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1 text-xs hover:opacity-90">{tag}</Badge>
                        ))}
                    </CardContent>
                </Card>

                {/* POSTS GRID */}
                <div className="mt-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 ml-1">Mis Publicaciones</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {recentActivity.filter(a => a.type === 'post').map((post) => (
                            <div key={post.id} className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer" onClick={() => handleCommentPost(post.id)}>
                                <img src={post.image || nftImage1} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Post"/>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
                                    <Heart className="w-4 h-4 fill-white"/> 12
                                    <MessageCircle className="w-4 h-4 fill-white"/> 3
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <ProfileNavTabs isOwnProfile={isOwnProfile} onUploadImage={handleUploadImage} onDeletePost={handleDeletePost} onCommentPost={handleCommentPost} />
            </TabsContent>

            <TabsContent value="activity" className="mt-4 space-y-4">
                {recentActivity.map((a) => (
                    <Card key={a.id} className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white overflow-hidden shadow-sm">
                        <CardContent className="p-0">
                            <div className="flex items-start gap-4 p-4">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                                    {a.type === 'post' ? <Camera className="w-5 h-5 text-purple-600 dark:text-purple-300"/> : <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-300"/>}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{a.description}</p>
                                    <p className="text-xs text-gray-500 dark:text-white/50 mt-1">{a.time}</p>
                                </div>
                                {/* BOTÓN COMENTAR */}
                                <Button variant="ghost" size="sm" className="text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10" onClick={() => {
                                    const c = prompt("Escribe tu comentario:");
                                    if(c) showToast("Comentario enviado", "success");
                                }}>
                                    <MessageCircle className="w-4 h-4 mr-1"/>
                                </Button>
                            </div>
                            {a.image && (
                                <div className="w-full h-64 bg-gray-100 dark:bg-black/50 border-t border-gray-200 dark:border-white/10">
                                    <img src={a.image} alt="Post content" className="w-full h-full object-cover"/>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </TabsContent>

            <TabsContent value="achievements" className="mt-4"><Card className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white"><CardContent className="p-4 grid grid-cols-2 gap-3">{achievements.map((a,i) => <div key={i} className={`p-3 rounded-lg border flex items-start gap-3 ${a.unlocked ? 'bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-500/50' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-60'}`}><div className={`p-2 rounded-full ${a.unlocked ? 'bg-purple-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>{a.icon ? <a.icon className="w-4 h-4"/> : <Award className="w-4 h-4"/>}</div><div><div className="font-bold text-sm">{a.title}</div><div className="text-xs text-gray-500 dark:text-white/60 leading-tight">{a.description}</div></div></div>)}</CardContent></Card></TabsContent>
            <TabsContent value="analytics" className="mt-4"><Card className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5"/> Rendimiento</CardTitle></CardHeader><CardContent className="space-y-6">{[{ label: 'Interacción Semanal', val: 75, color: 'bg-green-500' }, { label: 'Tasa de Respuesta', val: 92, color: 'bg-blue-500' }, { label: 'Visitas al Perfil', val: 45, color: 'bg-purple-500' }].map((stat, i) => (<div key={i}><div className="flex justify-between text-sm mb-1"><span className="text-gray-600 dark:text-white/80">{stat.label}</span><span className="font-bold">{stat.val}%</span></div><div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${stat.color}`} style={{ width: `${stat.val}%` }}></div></div></div>))}</CardContent></Card></TabsContent>
          </Tabs>

        </div>
      </div>

      {showPrivateImageRequest && <PrivateImageRequest isOpen={showPrivateImageRequest} onClose={() => setShowPrivateImageRequest(false)} profileId={profile?.id || ''} profileName={displayName} profileType="single" onRequestSent={() => setShowPrivateImageRequest(false)} />}
      
      {/* MODAL PIN CUSTOM */}
      <AnimatePresence>
        {showPinModal && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
                onClick={() => setShowPinModal(false)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                    className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-purple-500/30 p-6 rounded-3xl w-full max-w-sm shadow-2xl mx-4 text-center backdrop-blur-xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-2 ring-purple-500/20">
                        <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400"/>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seguridad</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Ingresa el PIN <strong className="text-purple-600 dark:text-white">1234</strong> para desbloquear.</p>
                    <input type="password" maxLength={4} value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full bg-gray-100 dark:bg-black/40 border border-gray-300 dark:border-white/20 rounded-xl p-3 text-center text-2xl tracking-widest text-gray-900 dark:text-white mb-6 focus:outline-none focus:border-purple-500" placeholder="••••" />
                    <div className="grid grid-cols-2 gap-4"><Button variant="outline" onClick={() => setShowPinModal(false)} className="border-gray-300 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5">Cancelar</Button><Button className="bg-purple-600 hover:bg-purple-700 text-white border-0" onClick={handlePinSubmit}>Desbloquear</Button></div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL MINTEO NFT */}
      <AnimatePresence>
      {showMintDialog && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
              <div className="bg-white dark:bg-gray-900/90 p-6 rounded-2xl border border-gray-200 dark:border-purple-500/40 text-center max-w-sm m-4 shadow-2xl backdrop-blur-xl">
                  <div className="w-40 h-40 mx-auto mb-6 bg-purple-50 dark:bg-purple-900/50 rounded-xl flex items-center justify-center overflow-hidden border-2 border-purple-200 dark:border-purple-400/50 shadow-lg">
                      <img src={DEMO_ASSETS[Math.floor(Math.random() * DEMO_ASSETS.length)]} alt="Preview" className="w-full h-full object-cover"/>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mintear NFT de Perfil</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-6">Esta acción creará un token único en la red Polygon representando tu identidad digital.</p>
                  <div className="flex gap-3"><Button variant="outline" className="flex-1 border-gray-300 dark:border-white/10 text-gray-700 dark:text-white" onClick={() => setShowMintDialog(false)}>Cancelar</Button><Button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white" onClick={confirmMinting}>Confirmar</Button></div>
              </div>
          </motion.div>
      )}
      </AnimatePresence>

      {/* OVERLAY DE CARGA PARA SUBIDA DE IMAGEN */}
      <AnimatePresence>
        {isUploading && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm"
            >
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                <span className="text-gray-900 dark:text-white text-lg font-medium">Subiendo a IPFS...</span>
            </motion.div>
        )}
      </AnimatePresence>

      <ImageModal isOpen={showImageModal} onClose={() => setShowImageModal(false)} images={galleryImages.map(img => img.url || '')} currentIndex={selectedImageIndex} onNavigate={setSelectedImageIndex} onLike={handleImageLike} onComment={handleAddComment} likes={imageLikes} userLikes={imageUserLikes} isPrivate={true} />
      <ReportDialog profileId={profile?.id || ''} profileName={displayName} isOpen={showReportDialog} onOpenChange={setShowReportDialog} onReport={(r) => console.log(r)} />
    </div>
  );
};

export default ProfileSingle;