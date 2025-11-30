import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, MessageCircle, Share2, MapPin, Calendar, Star, Camera, Flag, Lock,   
  CheckCircle, Award, Edit, Images, Eye, Users, TrendingUp, Wallet, 
  Coins, Zap, Gift, Unlock, Loader2, X, Info, ExternalLink, BarChart3, ShieldCheck
} from 'lucide-react';
import { TikTokShareButton } from '@/components/sharing/TikTokShareButton';
import Navigation from '@/components/Navigation';
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

// Array de imágenes para simular posts y NFTs
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

// --- COMPONENTE TOAST (Notificaciones bonitas) ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
    className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
      type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' : 
      type === 'error' ? 'bg-red-900/90 border-red-500 text-red-100' :
      'bg-blue-900/90 border-blue-500 text-blue-100'
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
  // ... otros estados ...
  const [showImageModal, setShowImageModal] = useState(false);
  
  // --- PEGA ESTAS 3 LÍNEAS AQUÍ DEBAJO ---
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLikes, setImageLikes] = useState<{[key: string]: number}>({ '1': 12, '2': 8, '3': 15 });
  const [imageUserLikes, setImageUserLikes] = useState<{[key: string]: boolean}>({});
  // ----------------------------------------

  const [_imageComments, setImageComments] = useState<{[key: string]: string[]}>({});
  const [activeTab, setActiveTab] = useState('overview');
  // Estado del bloqueo parental (TRUE por defecto = IMAGEN BORROSA AL INICIO)
  const [isParentalLocked, setIsParentalLocked] = useState(() => {
    const saved = localStorage.getItem('parentalControlLocked');
    // Si no hay nada guardado, por defecto es TRUE (Bloqueado)
    return saved !== null ? JSON.parse(saved) : true; 
  });

  // DATOS SIMULADOS INICIALES (Para que no salgan vacíos)
  const [profileStats, setProfileStats] = useState({
    totalViews: 0, totalLikes: 0, totalMatches: 0, profileCompleteness: 0,
    lastActive: new Date(), joinDate: new Date(), verificationLevel: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  // Blockchain State
  const [tokenBalances, setTokenBalances] = useState({ cmpx: '0', gtk: '0', matic: '0' });
  const [testnetInfo, setTestnetInfo] = useState<any>({ canClaim: true, remaining: 1000 });
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [isDemoMode] = useState(WalletService.isDemoMode());

  const isOwnProfile = true; // En esta vista siempre asumimos control total para la demo
  const [demoAuth] = usePersistedState('demo_authenticated', 'false');
  const [demoUser] = usePersistedState<any>('demo_user', null);

  const SHOW_ONLINE_BADGE = true;
  const SHOW_BIO_SECTION = true;

  // --- NOTIFICACIONES ---
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
        
        // Carga de datos simulados robustos
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

        setProfileStats(demoStats);
        setRecentActivity(demoActivity);
        setAchievements(demoAchievements);
        setTokenBalances({ cmpx: '100', gtk: '50', matic: '0.5' });

        // Si hay usuario demo en localstorage
        if (isDemoActive) {
           const parsedUser = typeof demoUser === 'string' ? JSON.parse(demoUser) : demoUser;
           const demoProfileData: any = {
             id: parsedUser.id || 'demo-single-1',
             name: parsedUser.name || 'Sofía Demo',
             nickname: '@sofia_demo',
             // ... resto de campos
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
  const privateImages: PrivateImageItem[] = [
    { id: '1', url: '/assets/people/male/privado/0CD28qq-editado.jpg', caption: 'Foto artística', likes: 12, userLiked: false },
    { id: '2', url: '/assets/people/male/privado/45Xas2E.jpg', caption: 'Sesión profesional', likes: 8, userLiked: false },
    { id: '3', url: '/assets/people/male/privado/4Jyc0cr-editado.jpg', caption: 'Momento íntimo', likes: 15, userLiked: false }
  ];
  const galleryImages = (profile?.privateImages as PrivateImageItem[]) || privateImages;

  const handleImageLike = (imageIndex: number) => { /* Lógica */ };
  const handleAddComment = (imageIndex: number) => { /* Lógica */ };
  
  const handleImageClick = (index: number) => {
    // Si está bloqueado, pedir PIN
    if (isParentalLocked) {
      setShowPinModal(true);
      return;
    }
    // Si no, abrir modal
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
            name: `Profile NFT #${userNFTs.length + 1}`,
            image: randomImage,
            description: "Identidad Digital Verificada • Polygon Network"
        };
        setUserNFTs(prev => [newNFT, ...prev]);
        setIsMinting(false);
        showToast("¡NFT Minteado exitosamente!", "success");
    }, 2000);
  };

  // --- SUBIDA DE IMAGEN DEMO (REALISTA) ---
  const handleUploadImage = () => {
    // Seleccionar imagen aleatoria
    const randomImg = DEMO_ASSETS[Math.floor(Math.random() * DEMO_ASSETS.length)];
    
    // Agregar al feed de actividad
    setRecentActivity(prev => [
        { 
            id: Date.now(), 
            type: 'post', 
            description: 'Acabas de compartir un nuevo momento ✨', 
            time: 'Ahora mismo', 
            image: randomImg // Se mostrará en el feed
        }, 
        ...prev
    ]);
    showToast("Imagen subida al feed", "success");
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

  if (isLoading) return <div className="flex items-center justify-center min-h-screen text-white">Cargando...</div>;
  
  const currentProfile = profile || { name: 'Usuario', nickname: 'usuario', id: 'invitado', age: 25 } as ProfileRow;
  const displayName = currentProfile.display_name || currentProfile.name || 'Usuario';
  const displayAge = typeof currentProfile.age === 'number' && currentProfile.age > 0 ? currentProfile.age : 28;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 profile-page relative overflow-hidden">
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 opacity-90"></div>
      <Navigation />
      
      <AnimatePresence>
        {notification.show && <Toast message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, show: false })} />}
      </AnimatePresence>

      <div className="relative z-10 pt-20 pb-6 px-4 text-center">
        <h1 className="profile-header-title">{displayName}</h1>
        <p className="profile-header-username">@{currentProfile.nickname || 'usuario'}</p>
        <VanishSearchInput placeholders={['Buscar...', 'Eventos...']} onSubmit={(val) => console.log(val)} />
      </div>

      <div className="relative z-10 pb-20 px-2 sm:px-4 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-4">
          
          {/* TARJETA PRINCIPAL */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30">
                    <SafeImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`} alt="Avatar" className="w-full h-full" fallbackType="avatar" />
                    {SHOW_ONLINE_BADGE && <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                    <h2 className="text-xl font-bold">{displayName}</h2>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <Badge className="bg-white/10 text-white border-white/20">CDMX</Badge> 
                        {/* EDAD EN BLANCO PARA QUE SE VEA */}
                        <Badge variant="outline" className="text-white border-white/40">{displayAge} años</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                        <Button onClick={() => navigate('/edit-profile-single')} variant="secondary" size="sm"><Edit className="w-4 h-4 mr-2"/> Editar</Button>
                        <Button onClick={() => navigator.clipboard.writeText(window.location.href)} className="bg-blue-500/20 hover:bg-blue-600/30 text-blue-200 border-blue-400/30 flex items-center gap-2 text-sm px-3 py-2 border"><Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Compartir</span></Button>
                        <TikTokShareButton url={window.location.href} text={`Perfil de ${currentProfile.name}`} hashtags={['ComplicesConecta']} className="bg-black/20 hover:bg-black/30 text-white border-white/30 flex items-center gap-2 text-sm px-3 py-2" variant="outline" size="default" />
                        <Button onClick={() => setShowReportDialog(true)} variant="destructive" size="sm"><Flag className="w-4 h-4 mr-2"/> Reportar</Button>
                        {/* BOTÓN SALIR DEMO */}
                        <Button onClick={() => { if (window.confirm('¿Salir del modo Demo?')) { localStorage.removeItem('demo_authenticated'); localStorage.removeItem('demo_user'); window.location.href = '/'; }}} className="bg-gray-600/80 hover:bg-gray-700/80 text-white flex items-center gap-2 text-sm px-3 py-2"><Lock className="w-4 h-4" /> Salir Demo</Button>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ESTADÍSTICAS (FONDO OSCURO PARA VISIBILIDAD) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             <Card className="bg-black/40 border-white/10 backdrop-blur-sm"><CardContent className="p-3 text-center"><Eye className="w-6 h-6 mx-auto text-blue-400"/><div className="text-xl font-bold text-white">{profileStats.totalViews}</div><div className="text-xs text-gray-300">Visitas</div></CardContent></Card>
             <Card className="bg-black/40 border-white/10 backdrop-blur-sm"><CardContent className="p-3 text-center"><Heart className="w-6 h-6 mx-auto text-pink-400"/><div className="text-xl font-bold text-white">{profileStats.totalLikes}</div><div className="text-xs text-gray-300">Likes</div></CardContent></Card>
             <Card className="bg-black/40 border-white/10 backdrop-blur-sm"><CardContent className="p-3 text-center"><Users className="w-6 h-6 mx-auto text-purple-400"/><div className="text-xl font-bold text-white">{profileStats.totalMatches}</div><div className="text-xs text-gray-300">Matches</div></CardContent></Card>
             <Card className="bg-black/40 border-white/10 backdrop-blur-sm"><CardContent className="p-3 text-center"><TrendingUp className="w-6 h-6 mx-auto text-green-400"/><div className="text-xl font-bold text-white">{profileStats.profileCompleteness}%</div><div className="text-xs text-gray-300">Completo</div></CardContent></Card>
          </div>

          {/* SECCIÓN WALLET & NFT MEJORADA */}
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Wallet className="w-5 h-5"/> Wallet & Coleccionables</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {/* Saldos */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-black/40 p-3 rounded-lg"><div className="text-xs text-gray-400">CMPX</div><div className="font-bold text-yellow-400 text-lg">{tokenBalances.cmpx}</div></div>
                    <div className="bg-black/40 p-3 rounded-lg"><div className="text-xs text-gray-400">GTK</div><div className="font-bold text-blue-400 text-lg">{tokenBalances.gtk}</div></div>
                    <div className="bg-black/40 p-3 rounded-lg"><div className="text-xs text-gray-400">NFTs</div><div className="font-bold text-purple-400 text-lg">{userNFTs.length}</div></div>
                </div>
                
                {/* NFTs GRANDES Y VISIBLES */}
                <div className="bg-purple-900/20 border border-purple-500/20 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-purple-300" />
                            <span className="text-sm font-medium text-purple-200">Tu Colección NFT</span>
                        </div>
                        {userNFTs.length > 0 && <span className="text-xs text-purple-400">{userNFTs.length} items</span>}
                    </div>
                    
                    {userNFTs.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto py-2 pb-4 scrollbar-hide">
                            {userNFTs.map((nft, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    key={i} 
                                    className="min-w-[160px] w-40 bg-black/40 rounded-xl overflow-hidden border border-purple-500/50 shadow-xl flex-shrink-0"
                                >
                                    <div className="h-40 w-full overflow-hidden">
                                        <img src={nft.image} alt="NFT" className="w-full h-full object-cover transition-transform hover:scale-110" />
                                    </div>
                                    <div className="p-3">
                                        <div className="text-sm font-bold text-white truncate">{nft.name}</div>
                                        <div className="text-[10px] text-gray-400 mt-1 truncate">{nft.description}</div>
                                        <Button size="sm" variant="ghost" className="w-full mt-2 h-6 text-[10px] text-purple-300 hover:text-white hover:bg-purple-500/20">
                                            Ver en Market <ExternalLink className="w-3 h-3 ml-1"/>
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 border-2 border-dashed border-purple-500/20 rounded-lg">
                            <p className="text-sm text-white/60 mb-2">Tu bóveda está vacía</p>
                            <p className="text-xs text-white/40">Mintea tu primer NFT gratis para empezar.</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <Button onClick={handleClaimTokens} disabled={isClaimingTokens} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6">
                        {isClaimingTokens ? <Loader2 className="w-5 h-5 animate-spin"/> : <div className="flex flex-col items-center"><span className="flex items-center"><Gift className="w-4 h-4 mr-2"/> Reclamar</span><span className="text-[10px] opacity-70">1000 CMPX Gratis</span></div>}
                    </Button>
                    <Button onClick={handleMintClick} disabled={isMinting} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-6">
                        {isMinting ? <Loader2 className="w-5 h-5 animate-spin"/> : <div className="flex flex-col items-center"><span className="flex items-center"><Camera className="w-4 h-4 mr-2"/> Mintear NFT</span><span className="text-[10px] opacity-70">Crear Coleccionable</span></div>}
                    </Button>
                </div>
              </CardContent>
            </Card>
          )

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="achievements">Logros</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
                <Card className="bg-white/10 border-white/20">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-white text-lg flex items-center gap-2"><Lock className="w-4 h-4"/> Fotos Privadas</CardTitle>
                        <Button 
                            size="sm" 
                            // LÓGICA CORREGIDA: Si está bloqueado (True) -> Muestra "Desbloquear"
                            className={isParentalLocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
                            onClick={isParentalLocked ? () => setShowPinModal(true) : handleLockGallery}
                        >
                            {isParentalLocked ? <><Unlock className="w-3 h-3 mr-1"/> Desbloquear</> : <><Lock className="w-3 h-3 mr-1"/> Bloquear</>}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                            {galleryImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => handleImageClick(idx)}>
                                    <SafeImage src={img.url || ''} className={cn("w-full h-full object-cover transition-all duration-500", isParentalLocked ? "blur-xl scale-110" : "blur-0 scale-100")} />
                                    {isParentalLocked && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-10 backdrop-blur-[2px]">
                                            <div className="bg-black/50 p-2 rounded-full border border-white/20"><Lock className="w-5 h-5 text-white"/></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <ProfileNavTabs isOwnProfile={isOwnProfile} onUploadImage={handleUploadImage} onDeletePost={() => showToast("Post eliminado", "success")} onCommentPost={() => {}} />
            </TabsContent>

            {/* ACTIVIDAD CON FOTOS */}
            <TabsContent value="activity" className="mt-4 space-y-4">
                {recentActivity.map((a) => (
                    <Card key={a.id} className="bg-white/10 border-white/20 text-white overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-start gap-4 p-4">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    {a.type === 'post' ? <Camera className="w-5 h-5 text-purple-300"/> : <MessageCircle className="w-5 h-5 text-blue-300"/>}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{a.description}</p>
                                    <p className="text-xs text-white/50 mt-1">{a.time}</p>
                                </div>
                            </div>
                            {a.image && (
                                <div className="w-full h-64 bg-black/50 border-t border-white/10">
                                    <img src={a.image} alt="Post content" className="w-full h-full object-cover"/>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </TabsContent>

            {/* LOGROS VISIBLES */}
            <TabsContent value="achievements" className="mt-4">
                <Card className="bg-white/10 border-white/20 text-white">
                    <CardContent className="p-4 grid grid-cols-2 gap-3">
                        {achievements.map((a,i) => (
                            <div key={i} className={`p-3 rounded-lg border flex items-start gap-3 ${a.unlocked ? 'bg-purple-900/40 border-purple-500/50' : 'bg-white/5 border-white/10 opacity-60'}`}>
                                <div className={`p-2 rounded-full ${a.unlocked ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                    {a.icon ? <a.icon className="w-4 h-4"/> : <Award className="w-4 h-4"/>}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-white">{a.title}</div>
                                    <div className="text-xs text-white/60 leading-tight">{a.description}</div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* ANALYTICS VISUALES (BARRAS) */}
            <TabsContent value="analytics" className="mt-4">
                <Card className="bg-white/10 border-white/20 text-white">
                    <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5"/> Rendimiento</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {[
                            { label: 'Interacción Semanal', val: 75, color: 'bg-green-500' },
                            { label: 'Tasa de Respuesta', val: 92, color: 'bg-blue-500' },
                            { label: 'Visitas al Perfil', val: 45, color: 'bg-purple-500' }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-white/80">{stat.label}</span>
                                    <span className="font-bold">{stat.val}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2.5">
                                    <div className={`h-2.5 rounded-full ${stat.color}`} style={{ width: `${stat.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>

      {/* MODAL PIN (Glassmorphism) */}
      <AnimatePresence>
        {showPinModal && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
                onClick={() => setShowPinModal(false)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                    className="bg-gray-900/80 border border-purple-500/30 p-6 rounded-3xl w-full max-w-sm shadow-2xl mx-4 text-center backdrop-blur-xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-2 ring-purple-500/20">
                        <Lock className="w-8 h-8 text-purple-400"/>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Seguridad</h3>
                    <p className="text-gray-400 text-sm mb-6">Ingresa el PIN <strong className="text-white">1234</strong> para desbloquear.</p>
                    
                    <input 
                      type="password" 
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-center text-2xl tracking-widest text-white mb-6 focus:outline-none focus:border-purple-500"
                      placeholder="••••"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => setShowPinModal(false)} className="border-white/10 hover:bg-white/5">Cancelar</Button>
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0" onClick={handlePinSubmit}>Desbloquear</Button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL MINTEO (Glassmorphism) */}
      <AnimatePresence>
      {showMintDialog && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
              <div className="bg-gray-900/90 p-6 rounded-2xl border border-purple-500/40 text-center max-w-sm m-4 shadow-2xl backdrop-blur-xl">
                  <div className="w-40 h-40 mx-auto mb-6 bg-purple-900/50 rounded-xl flex items-center justify-center overflow-hidden border-2 border-purple-400/50 shadow-lg shadow-purple-500/20">
                      <img src={DEMO_ASSETS[Math.floor(Math.random() * DEMO_ASSETS.length)]} alt="Preview" className="w-full h-full object-cover"/>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Mintear NFT de Perfil</h3>
                  <p className="text-gray-400 text-xs mb-6">Esta acción creará un token único en la red Polygon representando tu identidad digital.</p>
                  <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 border-white/10" onClick={() => setShowMintDialog(false)}>Cancelar</Button>
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white" onClick={confirmMinting}>Confirmar</Button>
                  </div>
              </div>
          </motion.div>
      )}
      </AnimatePresence>

      <ImageModal 
        isOpen={showImageModal} 
        onClose={() => setShowImageModal(false)} 
        images={galleryImages.map(img => img.url || '')} 
        currentIndex={selectedImageIndex} 
        onNavigate={setSelectedImageIndex} 
        onLike={handleImageLike} 
        onComment={handleAddComment} 
        likes={imageLikes} 
        userLikes={imageUserLikes} 
        isPrivate={true} 
      />
      <ReportDialog 
        profileId={profile?.id || ''} 
        profileName={displayName} 
        isOpen={showReportDialog} 
        onOpenChange={setShowReportDialog} 
        onReport={(r) => console.log(r)} 
      />
    </div>
  );
};

export default ProfileSingle;