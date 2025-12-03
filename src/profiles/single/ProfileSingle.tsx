import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';
import {
  Heart, MessageCircle, Share2, MapPin, Star, Camera, Flag, Lock,
  CheckCircle, Award, Edit, Users, TrendingUp, Wallet, Eye,
  Gift, Unlock, Loader2, Info, BarChart3, ShieldCheck, LogOut, Bell, X, Gamepad2,
  Coins, Zap, Calendar, Images
} from 'lucide-react';
import { TikTokShareButton } from '@/components/sharing/TikTokShareButton';
import Navigation from '@/components/Navigation';
import { ProfileNavTabs } from '@/profiles/shared/ProfileNavTabs';
import { useAuth } from '@/features/auth/useAuth';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { Database } from '@/types/supabase-generated';
import { PrivateImageRequest } from '@/components/profile/PrivateImageRequest';
import { ReportDialog } from '@/components/swipe/ReportDialog';
import { ImageModal } from '@/profiles/shared/ImageModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletService } from '@/services/WalletService';
import { VanishSearchInput } from '@/shared/ui/vanish-search-input';
import { SafeImage } from '@/shared/ui/SafeImage';
import { HoverEffect } from '@/components/ui/card-hover-effect';
import { EventsCarousel } from '@/shared/ui/events-carousel';
import { ComplianceSignupForm } from '@/shared/ui/compliance-signup-form';
import { FileUpload } from '@/shared/ui/file-upload';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground'; // Importar Wrapper
import { cn } from '@/shared/lib/cn';
import { ThemeConfig } from '@/theme/ThemeConfig';

// IMÁGENES LOCALES DEMO
const SINGLE_PROFILE_AVATAR = ThemeConfig.backgrounds.hero; // placeholder avatar path handled elsewhere

const SINGLE_PRIVATE_IMAGES: PrivateImageItem[] = [
  { id: 'pv1',  url: ThemeConfig.backgrounds.modal,  caption: 'Privado 1',  likes: 0, userLiked: false },
  { id: 'pv2',  url: ThemeConfig.backgrounds.modal,  caption: 'Privado 2',  likes: 0, userLiked: false },
  { id: 'pv3',  url: ThemeConfig.backgrounds.modal,  caption: 'Privado 3',  likes: 0, userLiked: false },
  { id: 'pv4',  url: ThemeConfig.backgrounds.modal,  caption: 'Privado 4',  likes: 0, userLiked: false },
  { id: 'pv5',  url: ThemeConfig.backgrounds.modal,  caption: 'Privado 5',  likes: 0, userLiked: false },
  { id: 'pv6',  url: ThemeConfig.backgrounds.modal,  caption: 'Privado 6',  likes: 0, userLiked: false },
  { id: 'pv7',  url: ThemeConfig.backgrounds.modal,  caption: 'Privado 7',  likes: 0, userLiked: false },
  { id: 'pv8',  url: ThemeConfig.backgrounds.modal,  caption: 'Privado 8',  likes: 0, userLiked: false },
  { id: 'pv9',  url: ThemeConfig.backgrounds.modal,  caption: 'Privado 9',  likes: 0, userLiked: false },
  { id: 'pv10', url: ThemeConfig.backgrounds.modal, caption: 'Privado 10', likes: 0, userLiked: false },
  { id: 'pv11', url: ThemeConfig.backgrounds.modal, caption: 'Privado 11', likes: 0, userLiked: false },
];

import nftImage1 from '@/assets/Ntf/imagen1.jpg';
import nftImage2 from '@/assets/Ntf/imagen2.png';
import nftImage3 from '@/assets/Ntf/imagen3.png';
import nftImage4 from '@/assets/Ntf/imagen4.png';
const DEMO_ASSETS = [nftImage1, nftImage2, nftImage3, nftImage4];

// --- TIPOS CORREGIDOS ---
type ProfileRow = Database['public']['Tables']['profiles']['Row'] & {
  nickname?: string | null;
  profile_id?: string | null;
  privateImages?: unknown;
  avatar_url?: string | null; // <--- CORRECCIÓN 1: Agregar propiedad
};

type PrivateImageItem = {
  id?: string;
  url?: string;
  src?: string;
  caption?: string;
  likes?: number;
  userLiked?: boolean;
};

type ConfirmDialogState = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm?: () => void;
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
  const { profile: authProfile, isAuthenticated } = useAuth();
  const hasDataLoaded = useRef(false);

  // --- ESTADOS ---
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrivateImageRequest, setShowPrivateImageRequest] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  
  // UI States
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success'|'error'|'info'}>({ show: false, message: '', type: 'info' });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ open: false, title: '', description: '' });
  const [showTopBanner, setShowTopBanner] = useState(true);

  const [isParentalLocked, setIsParentalLocked] = useState(() => {
    const saved = localStorage.getItem('parentalControlLocked');
    return saved !== null ? JSON.parse(saved) : true; 
  });

  const [privateImageAccess, setPrivateImageAccess] = usePersistedState<'none' | 'pending' | 'approved' | 'denied'>(
    'single_private_access',
    'none',
  );

  const [profileStats, setProfileStats] = useState({
    totalViews: 0, totalLikes: 0, totalMatches: 0, profileCompleteness: 0,
    lastActive: new Date(), joinDate: new Date(), verificationLevel: 0
  });
  
  const [galleryImages, setGalleryImages] = useState<PrivateImageItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  // Likes & Comments
  const [imageLikes, setImageLikes] = useState<{[key: string]: number}>({ '1': 12, '2': 8, '3': 15 });
  const [imageUserLikes, setImageUserLikes] = useState<{[key: string]: boolean}>({});

  // Blockchain State
  const [tokenBalances, setTokenBalances] = useState({ cmpx: '0', gtk: '0', matic: '0' });
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [mintPreview, setMintPreview] = useState<string>(DEMO_ASSETS[0]);

  const isOwnProfile = true; 
  const [demoAuth] = usePersistedState('demo_authenticated', 'false');
  const [demoUser] = usePersistedState<any>('demo_user', null);

  const SHOW_ONLINE_BADGE = true;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  // --- LÓGICA DE CARGA ---
  useEffect(() => {
    if (hasDataLoaded.current) return;

    const loadProfile = async () => {
      try {
        const isDemoActive = (String(demoAuth) === 'true') && demoUser;
        
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
        
        // --- USAR GALERÍA LOCAL ---
        setGalleryImages(SINGLE_PRIVATE_IMAGES);
        
        setTokenBalances({ cmpx: '100', gtk: '50', matic: '0.5' });

        if (isDemoActive) {
           const parsedUser = typeof demoUser === 'string' ? JSON.parse(demoUser) : demoUser;
           const demoProfileData: any = {
             id: parsedUser.id || 'demo-single-1',
             name: parsedUser.name || 'Sofía Demo',
             nickname: '@sofia_demo',
             age: 28,
             avatar_url: SINGLE_PROFILE_AVATAR,
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
    loadProfile();
  }, [authProfile, demoAuth, demoUser]);

  // HANDLERS (Omitidos los cuerpos largos para brevedad, son los mismos de siempre)
  const handleImageLike = (imageIndex: number) => { 
    const id = imageIndex.toString();
    setImageLikes(prev => ({...prev, [id]: (prev[id] || 0) + 1}));
    showToast("¡Te gusta esta foto!", "success");
  };
  const handleAddComment = () => showToast("Comentario agregado", "success");
  const handleImageClick = (index: number) => {
    if (isParentalLocked) { setShowPinModal(true); return; }
    setSelectedImageIndex(index); setShowImageModal(true);
  };
  const handleClaimTokens = () => {
    if (isClaimingTokens) return; setIsClaimingTokens(true);
    setTimeout(() => { setTokenBalances(prev => ({ ...prev, cmpx: (parseFloat(prev.cmpx) + 1000).toString() })); setIsClaimingTokens(false); showToast("¡Has reclamado 1000 CMPX!", "success"); }, 1500);
  };
  const handleMintClick = () => {
    const preview = DEMO_ASSETS[Math.floor(Math.random() * DEMO_ASSETS.length)];
    setMintPreview(preview);
    setShowMintDialog(true);
  };
  const confirmMinting = () => {
    setShowMintDialog(false); setIsMinting(true);
    setTimeout(() => {
        const newNFT = { id: Date.now(), name: `Profile #${userNFTs.length + 1}`, image: mintPreview, description: "Identidad Digital Verificada" };
        setUserNFTs(prev => [newNFT, ...prev]); setIsMinting(false); showToast("¡NFT Minteado!", "success");
    }, 2000);
  };
  const handleUploadImage = () => {
    setIsUploading(true);
    setTimeout(() => {
        const randomImg = DEMO_ASSETS[Math.floor(Math.random() * DEMO_ASSETS.length)];
        const newId = Date.now().toString();
        setRecentActivity(prev => [{ id: newId, type: 'post', description: 'Nuevo post', time: 'Ahora mismo', image: randomImg }, ...prev]);
        setGalleryImages(prev => [{ id: newId, url: randomImg, caption: 'Nueva carga', likes: 0, userLiked: false }, ...prev]);
        setIsUploading(false); showToast("Imagen publicada", "success");
    }, 1500);
  };
  const openConfirmDialog = (config: Omit<ConfirmDialogState, 'open'>) => {
    setConfirmDialog({ open: true, ...config });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false, onConfirm: undefined }));
  };

  const handleDeletePost = (postId: string) => {
    openConfirmDialog({
      title: '¿Eliminar publicación?',
      description: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      onConfirm: () => {
        setRecentActivity(prev => prev.filter(p => p.id !== postId));
        showToast('Post eliminado', 'success');
      },
    });
  };
  const handleCommentPost = (postId: string) => {
    const c = prompt("Escribe...");
    if(c) showToast("Enviado", "success"); };
  const handlePinSubmit = () => {
    if (pinInput === "1234") { setIsParentalLocked(false); localStorage.setItem('parentalControlLocked', 'false'); setShowPinModal(false); setPinInput(""); showToast("Desbloqueado", "success"); } 
    else { showToast("PIN incorrecto (1234)", "error"); setPinInput(""); }
  };
  const handleLockGallery = () => { setIsParentalLocked(true); localStorage.setItem('parentalControlLocked', 'true'); showToast("Bloqueado", "info"); };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Cargando...</div>;
  
  const currentProfile = profile || { name: 'Usuario', nickname: 'usuario', id: 'invitado', age: 25 } as ProfileRow;
  const displayName = currentProfile.display_name || currentProfile.name || 'Usuario';
  const displayAge = currentProfile.age || 25;
  const isDemoActive = (String(demoAuth) === 'true') && demoUser;

  // Background por género: demo mujer usa Background(2).webp, hombre Background(1).webp
  const gender = (currentProfile as any)?.gender as string | undefined;
  const singleBackground = !gender
    ? '/backgrounds/Background(2).webp' // demo actual mujer
    : gender === 'male'
    ? '/backgrounds/Background(1).webp'
    : '/backgrounds/Background(2).webp';

  // --- CONTENIDO DEL RENDERIZADO (versión completa fusionada con respaldo) ---
  const content = (
    <div className="min-h-screen bg-transparent profile-page relative overflow-hidden transition-colors duration-300">
      {/* Background específico para perfil single según género */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="w-full h-full bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url('${singleBackground}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-purple-900/10 to-black/80" />
      </div>

      {!isAuthenticated() && !isDemoActive && <Navigation />}

      {(isAuthenticated() || isDemoActive) && showTopBanner && (
        <div className="relative z-50 bg-white dark:bg-white/5 border-b border-gray-200 dark:border-white/10 px-4 py-2 flex items-center justify-between backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-white/90">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Sistema Online</span>
            <span className="mx-2 text-gray-300 dark:text-white/20">|</span>
            <Gift className="w-3 h-3 text-purple-600 dark:text-yellow-400" />
            <span className="text-purple-700 dark:text-yellow-100">Promo: +50% primera recarga</span>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-gray-500 dark:text-white/70 cursor-pointer hover:text-purple-600 dark:hover:text-white" />
            <X
              className="w-4 h-4 text-gray-400 dark:text-white/50 cursor-pointer hover:text-red-500 dark:hover:text-white"
              onClick={() => setShowTopBanner(false)}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {notification.show && (
          <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ ...notification, show: false })}
          />
        )}
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
          <Card className="bg-white/5 text-white border-white/20 backdrop-blur-2xl shadow-[0_25px_60px_rgba(24,0,62,.45)]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-purple-100 dark:border-purple-500/30 shadow-2xl">
                  <SafeImage
                    src={profile?.avatar_url || SINGLE_PROFILE_AVATAR}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  {SHOW_ONLINE_BADGE && (
                    <div className="absolute bottom-2 right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Badge className="bg-white/15 text-white border border-white/20">
                      <MapPin className="w-3 h-3 mr-1" /> CDMX
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-white border-white/30 bg-white/10"
                    >
                      {displayAge} años
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-gray-700 border-gray-300 dark:text-white dark:border-white/40 dark:bg-white/5"
                    >
                      ⚧️ No especificado
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-gray-700 border-gray-300 dark:text-white dark:border-white/40 dark:bg-white/5"
                    >
                      ⚤ Bisexual
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                    <Button
                      onClick={() => navigate('/edit-profile-single')}
                      variant="secondary"
                      size="sm"
                      className="bg-gray-100 dark:bg:white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/30 border-none"
                    >
                      <Edit className="w-4 h-4 mr-2" /> Editar
                    </Button>
                    <Button
                      onClick={() => navigator.clipboard.writeText(window.location.href)}
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex items-center gap-2 text-sm px-3 py-2"
                    >
                      <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Compartir</span>
                    </Button>
                    <TikTokShareButton
                      url={window.location.href}
                      text={`Perfil de ${currentProfile.name}`}
                      hashtags={['ComplicesConecta']}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-white/30 shadow-[0_10px_25px_rgba(80,0,150,.45)]"
                      size="sm"
                    />
                    <Button
                      onClick={() => setShowReportDialog(true)}
                      variant="destructive"
                      size="sm"
                      className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200 border-red-200 dark:border-red-500/30 hover:bg-red-200"
                    >
                      <Flag className="w-4 h-4 mr-2" /> Reportar
                    </Button>

                    {isOwnProfile && (
                      <Button
                        onClick={() =>
                          openConfirmDialog({
                            title: '¿Salir del modo Demo?',
                            description: 'Perderás la sesión demo actual, pero puedes regresar cuando quieras.',
                            confirmLabel: 'Salir',
                            onConfirm: () => {
                              localStorage.removeItem('demo_authenticated');
                              localStorage.removeItem('demo_user');
                              window.location.href = '/';
                            },
                          })
                        }
                        className="bg-gray-200 dark:bg-gray-600/50 hover:bg-gray-300 dark:hover:bg-gray-700/80 text-gray-800 dark:text-white flex items-center gap-2 text-sm px-3 py-2 border border-gray-300 dark:border-white/10"
                      >
                        {isDemoActive ? (
                          <>
                            <Gamepad2 className="w-4 h-4 mr-2" /> Salir Demo
                          </>
                        ) : (
                          <>
                            <LogOut className="w-4 h-4 mr-2" /> Salir
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas completas con animación */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Eye, label: 'Visitas', value: profileStats.totalViews, color: 'text-blue-400' },
              { icon: Heart, label: 'Likes', value: profileStats.totalLikes, color: 'text-pink-400' },
              { icon: Users, label: 'Matches', value: profileStats.totalMatches, color: 'text-purple-400' },
              { icon: TrendingUp, label: 'Completo', value: `${profileStats.profileCompleteness}%`, color: 'text-green-400' }
            ].map((stat, idx) => (
              <Card key={stat.label} className="bg-white/10 border-white/20 backdrop-blur-xl shadow-[0_20px_40px_rgba(18,0,54,.35)] text-white">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-7 h-7 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/70">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* WALLET & COLECCIONABLES */}
          {isOwnProfile && (
            <Card className="bg-white/5 border-white/20 text-white backdrop-blur-2xl shadow-[0_25px_50px_rgba(15,0,45,.45)]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5" /> Wallet & Coleccionables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/60 dark:bg-black/40 p-3 rounded-lg border border-purple-100 dark:border-white/5">
                    <div className="text-xs text-gray-500 dark:text-gray-400">CMPX</div>
                    <div className="font-bold text-yellow-600 dark:text-yellow-400 text-lg">{tokenBalances.cmpx}</div>
                  </div>
                  <div className="bg-white/60 dark:bg-black/40 p-3 rounded-lg border border-purple-100 dark:border-white/5">
                    <div className="text-xs text-gray-500 dark:text-gray-400">GTK</div>
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">{tokenBalances.gtk}</div>
                  </div>
                  <div className="bg-white/60 dark:bg-black/40 p-3 rounded-lg border border-purple-100 dark:border-white/5">
                    <div className="text-xs text-gray-500 dark:text-gray-400">NFTs</div>
                    <div className="font-bold text-purple-600 dark:text-purple-400 text-lg">{userNFTs.length}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleClaimTokens}
                    disabled={isClaimingTokens}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6"
                  >
                    {isClaimingTokens ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="flex items-center">
                          <Gift className="w-4 h-4 mr-2" /> Reclamar
                        </span>
                        <span className="text-[10px] opacity-90">1000 CMPX Gratis</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    onClick={handleMintClick}
                    disabled={isMinting}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-6"
                  >
                    {isMinting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="flex items-center">
                          <Camera className="w-4 h-4 mr-2" /> Mintear NFT
                        </span>
                        <span className="text-[10px] opacity-90">Crear Coleccionable</span>
                      </div>
                    )}
                  </Button>
                </div>

                {userNFTs.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {userNFTs.map((nft) => (
                      <div key={nft.id} className="bg-white/70 dark:bg-black/40 rounded-xl p-3 border border-white/40 dark:border-white/10 shadow-sm">
                        <div className="aspect-square rounded-lg overflow-hidden mb-2">
                          <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{nft.name}</p>
                        <p className="text-[11px] text-gray-500 dark:text-white/60">{nft.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sección Blockchain avanzada del respaldo */}
          {isOwnProfile && (
            <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-md border-purple-400/30 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-purple-300" /> Blockchain & NFTs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: Coins, label: 'CMPX', value: tokenBalances.cmpx, helper: 'Utility Tokens', color: 'text-yellow-300' },
                    { icon: Zap, label: 'GTK', value: tokenBalances.gtk, helper: 'Governance', color: 'text-blue-300' },
                    { icon: Images, label: 'NFTs', value: userNFTs.length, helper: 'Colección', color: 'text-purple-300' }
                  ].map((item) => (
                    <div key={item.label} className="p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className="text-xl font-bold">{item.value}</div>
                      <div className="text-xs text-white/70">{item.helper}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleClaimTokens}
                    disabled={isClaimingTokens}
                    className="bg-green-500/20 hover:bg-green-600/30 text-green-100 border border-green-400/30 flex items-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    {isClaimingTokens ? 'Reclamando...' : 'Reclamar CMPX' }
                  </Button>
                  <Button
                    onClick={handleMintClick}
                    disabled={isMinting}
                    className="bg-purple-500/20 hover:bg-purple-600/30 text-purple-100 border border-purple-400/30 flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Mintear NFT de Perfil
                  </Button>
                </div>

                {userNFTs.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Images className="w-4 h-4 text-purple-300" /> Mis NFTs ({userNFTs.length})
                        </h4>
                        <p className="text-xs text-white/70">Tokens únicos de tu identidad digital</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/nfts')} className="text-purple-300 text-xs">
                        Saber más →
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {userNFTs.slice(0, 4).map((nft) => (
                        <div key={nft.id} className="p-2 bg-white/5 rounded-lg">
                          <div className="aspect-square rounded mb-2 overflow-hidden relative">
                            <SafeImage src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                            <div className="absolute top-1 right-1 text-[10px] bg-black/70 px-1 rounded">#{nft.id}</div>
                          </div>
                          <p className="text-xs font-semibold truncate">{nft.name}</p>
                          <p className="text-[11px] text-white/70">{nft.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TABS COMPLETOS */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-white/10 backdrop-blur-md p-1 rounded-xl border border-gray-200 dark:border-white/10">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="achievements">Logros</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* GALERÍA PRIVADA */}
              <Card className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Fotos Privadas
                  </CardTitle>
                  <Button
                    size="sm"
                    className={isParentalLocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
                    onClick={isParentalLocked ? () => setShowPinModal(true) : handleLockGallery}
                  >
                    {isParentalLocked ? <><Unlock className="w-3 h-3 mr-1" /> Desbloquear</> : <><Lock className="w-3 h-3 mr-1" /> Bloquear</>}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-sm"
                        onClick={() => handleImageClick(idx)}
                      >
                        <SafeImage
                          src={img.url || ''}
                          className={cn(
                            "w-full h-full object-cover transition-all duration-500",
                            isParentalLocked ? "blur-xl scale-110" : "blur-0 scale-100"
                          )}
                        />
                        {isParentalLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-black/30 z-10 backdrop-blur-[2px]">
                            <div className="bg-white/80 dark:bg-black/50 p-2 rounded-full border border-gray-200 dark:border-white/20">
                              <Lock className="w-5 h-5 text-gray-800 dark:text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* INTERESES */}
              <Card className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 mt-4">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Mis Intereses</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {['Lifestyle Swinger', 'Fiestas Temáticas', 'Viajes', 'Cenas', 'Cockteles'].map((tag, i) => (
                    <Badge
                      key={i}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1 text-xs hover:opacity-90"
                    >
                      {tag}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              {/* POSTS GRID */}
              <div className="mt-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 ml-1">Mis Publicaciones</h3>
                <div className="grid grid-cols-3 gap-2">
                  {recentActivity
                    .filter((a) => a.type === 'post')
                    .map((post) => (
                      <div
                        key={post.id}
                        className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer"
                        onClick={() => handleCommentPost(post.id)}
                      >
                        <img
                          src={post.image || SINGLE_PROFILE_AVATAR}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          alt="Post"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
                          <Heart className="w-4 h-4 fill-white" /> 12
                          <MessageCircle className="w-4 h-4 fill-white" /> 3
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* NAV TABS para acciones */}
              <ProfileNavTabs
                isOwnProfile={isOwnProfile}
                onUploadImage={handleUploadImage}
                onDeletePost={handleDeletePost}
                onCommentPost={handleCommentPost}
              />
            </TabsContent>

            {/* ACTIVITY */}
            <TabsContent value="activity" className="mt-4 space-y-4">
              {recentActivity.map((a) => (
                <Card
                  key={a.id}
                  className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white overflow-hidden shadow-sm"
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 p-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                        {a.type === 'post' ? (
                          <Camera className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                        ) : (
                          <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{a.description}</p>
                        <p className="text-xs text-gray-500 dark:text-white/50 mt-1">{a.time}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10"
                        onClick={() => handleCommentPost(a.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                      </Button>
                    </div>
                    {a.image && (
                      <div className="w-full h-64 bg-gray-100 dark:bg-black/50 border-t border-gray-200 dark:border-white/10">
                        <img src={a.image} alt="Post content" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* ACHIEVEMENTS */}
            <TabsContent value="achievements" className="mt-4">
              <Card className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white">
                <CardContent className="p-4 grid grid-cols-2 gap-3">
                  {achievements.map((a, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border flex items-start gap-3 ${
                        a.unlocked
                          ? 'bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-500/50'
                          : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-60'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          a.unlocked
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {a.icon ? <a.icon className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{a.title}</div>
                        <div className="text-xs text-gray-500 dark:text-white/60 leading-tight">{a.description}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ANALYTICS */}
            <TabsContent value="analytics" className="mt-4">
              <Card className="bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" /> Rendimiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: 'Interacción Semanal', val: 75, color: 'bg-green-500' },
                    { label: 'Tasa de Respuesta', val: 92, color: 'bg-blue-500' },
                    { label: 'Visitas al Perfil', val: 45, color: 'bg-purple-500' },
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-white/80">{stat.label}</span>
                        <span className="font-bold">{stat.val}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2.5">
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

      {showPrivateImageRequest && (
        <PrivateImageRequest
          isOpen={showPrivateImageRequest}
          onClose={() => setShowPrivateImageRequest(false)}
          profileId={profile?.id || ''}
          profileName={profile?.name || ''}
          profileType="single"
          onRequestSent={() => {
            setPrivateImageAccess('pending');
            setShowPrivateImageRequest(false);
          }}
        />
      )}

      {confirmDialog.open && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl bg-[#100220]/95 border border-white/10 text-white shadow-[0_25px_80px_rgba(16,2,32,.65)] p-6 space-y-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div>
                <h3 className="text-2xl font-bold mb-1">{confirmDialog.title}</h3>
                <p className="text-white/70 text-sm">{confirmDialog.description}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 border-white/30 text-white" onClick={closeConfirmDialog}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  onClick={() => {
                    confirmDialog.onConfirm?.();
                    closeConfirmDialog();
                  }}
                >
                  {confirmDialog.confirmLabel || 'Confirmar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* PIN MODAL */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => setShowPinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-purple-500/30 p-6 rounded-3xl w-full max-w-sm shadow-2xl mx-4 text-center backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-2 ring-purple-500/20">
                <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seguridad</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Ingresa el PIN <strong className="text-purple-600 dark:text-white">1234</strong>
              </p>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-gray-100 dark:bg-black/40 border border-gray-300 dark:border-white/20 rounded-xl p-3 text-center text-2xl tracking-widest text-gray-900 dark:text-white mb-6 focus:outline-none focus:border-purple-500"
                placeholder="••••"
              />
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPinModal(false)}
                  className="border-gray-300 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white border-0" onClick={handlePinSubmit}>
                  Desbloquear
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL MINTEO NFT */}
      <AnimatePresence>
        {showMintDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-gray-900/90 rounded-3xl border border-gray-200 dark:border-purple-500/30 shadow-2xl max-w-md w-full p-6 text-center space-y-6"
            >
              <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden border-4 border-purple-200 dark:border-purple-500/40 shadow-lg">
                <img src={mintPreview} alt="NFT Preview" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Mintear NFT de Perfil</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  Crearemos un coleccionable único en Polygon que certifica tu identidad digital.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-white/20 text-gray-700 dark:text-white"
                  onClick={() => setShowMintDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
                  onClick={confirmMinting}
                >
                  Confirmar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY CARGA UPLOAD */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
            <p className="text-white font-medium tracking-wide">Subiendo a IPFS...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALES DE IMAGEN / REPORTES */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        images={galleryImages.map((img) => img.url || '')}
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

  return <ParticlesBackground>{content}</ParticlesBackground>;
};

export default ProfileSingle;