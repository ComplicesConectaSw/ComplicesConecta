import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, MapPin, Verified, Crown, Share2, Lock, Flag, 
  Wallet, Users, MessageCircle, Eye, TrendingUp, 
  Award, CheckCircle, Edit, Camera, Gift, LogOut, X, Info, Loader2, 
  Gamepad2, Unlock, BarChart3, ShieldCheck 
} from "lucide-react";
import { TikTokShareButton } from '@/components/sharing/TikTokShareButton';
import Navigation from "@/components/Navigation";
import { generateMockCoupleProfiles, type CoupleProfileWithPartners } from "@/features/profile/coupleProfiles";
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';
import { usePersistedState } from '@/hooks/usePersistedState';
import { PrivateImageRequest } from '@/profiles/shared/PrivateImageRequest';
import { ReportDialog } from '@/components/swipe/ReportDialog';
import { ProfileNavTabs } from '@/profiles/shared/ProfileNavTabs';
import { ImageModal } from '@/profiles/shared/ImageModal';
import { ParentalControl } from '@/profiles/shared/ParentalControl';
import { VanishSearchInput } from '@/components/ui/vanish-search-input';
import { WalletService } from '@/services/WalletService';
import { SafeImage } from '@/components/ui/SafeImage';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase-generated';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground'; // IMPORTAR

// IMÁGENES LOCALES
import nftImage1 from '@/assets/Ntf/imagen1.jpg';
import nftImage2 from '@/assets/Ntf/imagen2.png';
import nftImage3 from '@/assets/Ntf/imagen3.jpg';
import nftImage4 from '@/assets/Ntf/imagen4.jpg';

const DEMO_COUPLE_ASSETS = [nftImage1, nftImage2, nftImage3, nftImage4];

// --- NUEVA GALERÍA PRIVADA LOCAL DE PAREJA ---
const COUPLE_PRIVATE_IMAGES: PrivateImageItem[] = [
  { id: '1', url: '/assets/people/couple/privado/privadicouple.jpg', caption: 'Momento privado 1', likes: 45, userLiked: false },
  { id: '2', url: '/assets/people/couple/privado/privadicouple2.jpg', caption: 'Momento privado 2', likes: 32, userLiked: false },
  { id: '3', url: '/assets/people/couple/privado/privadicouple3.jpg', caption: 'Momento privado 3', likes: 89, userLiked: false },
  { id: '4', url: '/assets/people/couple/privado/privadicouple4.jpg', caption: 'Momento privado 4', likes: 60, userLiked: false },
];

type CoupleProfileRow = Database['public']['Tables']['couple_profiles']['Row'];

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

const ProfileCouple: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const hasDataLoaded = useRef(false);
  const checkAuth = () => typeof isAuthenticated === 'function' ? isAuthenticated() : !!isAuthenticated;

  // --- ESTADOS ---
  const [profile, setProfile] = useState<CoupleProfileWithPartners | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPrivateImageRequest, setShowPrivateImageRequest] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isParentalLocked, setIsParentalLocked] = useState(() => {
    const saved = localStorage.getItem('parentalControlLocked');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [privateImageAccess, setPrivateImageAccess] = usePersistedState<'none' | 'pending' | 'approved' | 'denied'>('couple_private_access', 'none');
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success'|'error'|'info'}>({ show: false, message: '', type: 'info' });
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<PrivateImageItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [imageLikes, setImageLikes] = useState<{[key: string]: number}>({ '1': 45, '2': 32, '3': 89 });
  const [imageUserLikes, setImageUserLikes] = useState<{[key: string]: boolean}>({});
  const [tokenBalances, setTokenBalances] = useState({ cmpx: '0', gtk: '0', matic: '0' });
  const [coupleNFTs, setCoupleNFTs] = useState<any[]>([]);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [mintPreview, setMintPreview] = useState<string>(DEMO_COUPLE_ASSETS[0]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    description: '',
  });
  const [demoAuth] = usePersistedState('demo_authenticated', 'false');
  const [demoUser] = usePersistedState<any>('demo_user', null);
  const isOwnProfile = true; 

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  const [profileStats, setProfileStats] = useState({
    totalViews: 2500, totalLikes: 890, totalMatches: 120, profileCompleteness: 95,
    lastActive: new Date(), joinDate: new Date("2023-11-15"), verificationLevel: 3
  });

  // ------------------------------------------------------------------
  // 3. LÓGICA DE CARGA
  // ------------------------------------------------------------------
  useEffect(() => {
    if (hasDataLoaded.current) return;

    const loadProfile = async () => {
      try {
        const demoActivity = [
            { id: 1, type: 'match', description: '¡Match con Pareja Ana & Luis!', time: 'Hace 2 horas' },
            { id: 2, type: 'view', description: 'Tu perfil está siendo tendencia hoy', time: 'Hace 5 horas' },
        ];
        const demoAchievements = [
            { id: 1, title: 'Doble Verificación', description: 'Ambos verificados', icon: Verified, unlocked: true },
            { id: 2, title: 'Pareja Popular', description: '+500 likes', icon: Heart, unlocked: true },
        ];

        setRecentActivity(demoActivity);
        setAchievements(demoAchievements);
        
        // --- USAR GALERÍA LOCAL PAREJAS ---
        setGalleryImages(COUPLE_PRIVATE_IMAGES);
        
        setTokenBalances({ cmpx: '2500', gtk: '150', matic: '1.2' });

        if (demoAuth === 'true' && demoUser) {
          const mockProfiles = generateMockCoupleProfiles();
          setProfile(mockProfiles[0]);
          hasDataLoaded.current = true;
          setIsLoading(false);
          return;
        }

        if (!checkAuth() || !user?.id) {
           const mockProfiles = generateMockCoupleProfiles();
           setProfile(mockProfiles[0]);
           setIsLoading(false);
           return;
        }

        if (user?.id) {
           const { data: coupleRow } = await supabase?.from('couple_profiles')
             .select('*')
             .eq('user_id', user.id)
             .maybeSingle<CoupleProfileRow>() || { data: null };
           
           if (coupleRow) {
             const realProfile: CoupleProfileWithPartners = {
                id: coupleRow.id,
                couple_name: coupleRow.display_name || 'Pareja Anónima',
                partner1_first_name: 'Partner 1', partner2_first_name: 'Partner 2',
                partner1_age: 25, partner2_age: 28, relationship_type: 'man-woman', isOnline: true
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

  // HANDLERS
  const handleUploadImage = () => {
    setIsUploading(true);
    setTimeout(() => {
        const randomImg = DEMO_COUPLE_ASSETS[Math.floor(Math.random() * DEMO_COUPLE_ASSETS.length)];
        const newId = Date.now().toString();
        setRecentActivity(prev => [{ id: newId, type: 'post', description: 'Nuevo momento', time: 'Ahora mismo', image: randomImg }, ...prev]);
        setGalleryImages(prev => [{ id: newId, url: randomImg, caption: 'Nueva carga', likes: 0, userLiked: false }, ...prev]);
        setIsUploading(false); showToast("Imagen publicada", "success");
    }, 1500);
  };
  const handlePinSubmit = () => {
    // Lógica espejo de ProfileSingle: PIN 1234, actualizar estado y localStorage
    if (pinInput === '1234') {
      setIsParentalLocked(false);
      localStorage.setItem('parentalControlLocked', 'false');
      setShowPinModal(false);
      setPinInput('');
      showToast('Galería desbloqueada', 'success');
    } else {
      showToast('PIN incorrecto (1234)', 'error');
      setPinInput('');
    }
  };

  const handleLockGallery = () => {
    // Lógica espejo de ProfileSingle: bloquear y reflejar en localStorage
    setIsParentalLocked(true);
    localStorage.setItem('parentalControlLocked', 'true');
    showToast('Galería bloqueada', 'info');
  };
  const handleImageClick = (index: number) => {
    if (isParentalLocked) {
      setShowPinModal(true);
      return;
    }
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };
  const handleClaimTokens = () => { if (isClaimingTokens) return; setIsClaimingTokens(true); setTimeout(() => { setTokenBalances(prev => ({ ...prev, cmpx: (parseFloat(prev.cmpx) + 2000).toString() })); setIsClaimingTokens(false); showToast("¡2000 CMPX reclamados!", "success"); }, 1500); };
  const handleMintClick = () => {
    const preview = DEMO_COUPLE_ASSETS[Math.floor(Math.random() * DEMO_COUPLE_ASSETS.length)];
    setMintPreview(preview);
    setShowMintDialog(true);
  };
  const confirmMinting = () => {
    setShowMintDialog(false);
    setIsMinting(true);
    setTimeout(() => {
      const id = Date.now();
      const baseIndex = coupleNFTs.length + 1;
      const priceMatic = (0.10 + (baseIndex % 5) * 0.02).toFixed(3);
      const priceCmpx = 180 + (baseIndex % 5) * 40;

      const newNFT = {
        id,
        name: `CMPX Couple Genesis #${baseIndex}`,
        image: mintPreview,
        description: 'Coleccionable demo que representa su conexión como pareja dentro del ecosistema CMPX.',
        price: `${priceMatic} MATIC · ${priceCmpx} CMPX`,
      };

      setCoupleNFTs(prev => [newNFT, ...prev]);
      setIsMinting(false);
      showToast("NFT demo de pareja creado", "success");
    }, 2000);
  };
  const handleImageLike = (idx: number) => showToast("Te gusta", "success");
  const handleAddComment = () => showToast("Comentado", "success");
  const openConfirmDialog = (config: Omit<ConfirmDialogState, 'open'>) => {
    setConfirmDialog({ open: true, ...config });
  };

  const closeConfirmDialog = () => setConfirmDialog((prev) => ({ ...prev, open: false, onConfirm: undefined }));

  const handleDeletePost = (id: string) => {
    setConfirmDialog({
      open: true,
      title: '¿Eliminar publicación?',
      description: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      onConfirm: () => setRecentActivity(prev => prev.filter(p => p.id !== id)),
    });
  };
  const handleCommentPost = () => showToast("Comentar...", "info");

  if (isLoading || !profile) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><Loader2 className="w-10 h-10 text-purple-500 animate-spin"/></div>;

  const isDemoActive = (String(demoAuth) === 'true') && demoUser;

  // Background de pareja según tipo de relación
  const relationshipType = (profile as any)?.relationship_type as string | undefined;
  const coupleBackgroundIndex = String(profile.id ?? '').length % 2;
  const coupleBackground = !relationshipType
    ? ['/backgrounds/Background(3).webp', '/backgrounds/Background(4).webp'][coupleBackgroundIndex]
    : relationshipType === 'man-woman'
    ? '/backgrounds/Background(3).webp'
    : '/backgrounds/Background(4).webp';

  const content = (
    <div className="min-h-screen bg-transparent profile-page relative overflow-hidden transition-colors duration-300">
      {/* Background específico para perfil de pareja según relationship_type */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="w-full h-full bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url('${coupleBackground}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-purple-900/20 to-black/80" />
      </div>
      
      {!isAuthenticated() && !isDemoActive && <Navigation />}
      
      {(isAuthenticated() || isDemoActive) && showTopBanner && (
        <div className="relative z-50 bg-white/10 text-white border-b border-white/15 px-4 py-2 flex items-center justify-between backdrop-blur-lg shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                <span className="text-white/80">Pareja Verificada</span>
                <span className="mx-2 text-white/30">|</span>
                <Heart className="w-3 h-3 text-pink-300"/>
                <span className="text-pink-200">Aniversario: 15 Nov</span>
            </div>
            <X className="w-4 h-4 text-white/60 cursor-pointer hover:text-red-400" onClick={() => setShowTopBanner(false)}/>
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

            {/* WALLET & COLECCIONABLES - espejo de single */}
            {isOwnProfile && (
              <Card className="bg-white/5 text-white border-white/20 backdrop-blur-2xl shadow-[0_25px_60px_rgba(24,0,62,.45)]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5" /> Wallet & Coleccionables
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/10 p-3 rounded-lg border border-white/15">
                      <div className="text-xs text-white/70">CMPX</div>
                      <div className="font-bold text-yellow-300 text-lg">{tokenBalances.cmpx}</div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg border border-white/15">
                      <div className="text-xs text-white/70">GTK</div>
                      <div className="font-bold text-blue-300 text-lg">{tokenBalances.gtk}</div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg border border-white/15">
                      <div className="text-xs text-white/70">NFTs</div>
                      <div className="font-bold text-purple-300 text-lg">{coupleNFTs.length}</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleClaimTokens}
                      disabled={isClaimingTokens}
                      className="flex-1 bg-green-500/30 hover:bg-green-500/50 text-white border border-green-300/40 py-6"
                    >
                      {isClaimingTokens ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="flex items-center">
                            <Gift className="w-4 h-4 mr-2" /> Reclamar
                          </span>
                          <span className="text-[10px] opacity-90">2000 CMPX Gratis</span>
                        </div>
                      )}
                    </Button>
                    <Button
                      onClick={handleMintClick}
                      disabled={isMinting}
                      className="flex-1 bg-purple-500/30 hover:bg-purple-500/50 text-white border border-purple-300/40 py-6"
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

                  {coupleNFTs.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {coupleNFTs.map((nft) => (
                        <div key={nft.id} className="bg-white/10 rounded-xl p-3 border border-white/20 shadow-sm">
                          <div className="aspect-square rounded-lg overflow-hidden mb-2">
                            <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs font-semibold text-white truncate">{nft.name}</p>
                          <p className="text-[11px] text-white/60">{nft.description || 'Coleccionable'}</p>
                          {nft.price && (
                            <p className="text-[10px] text-emerald-200 mt-1 font-semibold">{nft.price}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Arquitectura de Seguridad de la Wallet (ilustrativo) */}
            {isOwnProfile && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-xl text-white shadow-[0_20px_40px_rgba(10,0,40,.4)]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Arquitectura de Seguridad de la Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-white/80">
                  <p>
                    En esta demo mostramos cómo funciona la capa de seguridad cuando una pareja interactúa con tokens
                    y NFTs: canal cifrado, firma desde la wallet y contratos que resguardan sus activos.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/40 rounded-xl border border-white/20 overflow-hidden">
                      <img src="/assets/security/ssl-diagram.webp" alt="Diagrama SSL" className="w-full h-40 object-cover" />
                      <div className="px-3 py-2 text-[11px] text-white/70">Protección contra espionaje y robo de datos durante las sesiones.</div>
                    </div>
                    <div className="bg-black/40 rounded-xl border border-white/20 overflow-hidden">
                      <img src="/assets/security/wallet-sequence.webp" alt="Flujo de firma con wallet" className="w-full h-40 object-cover" />
                      <div className="px-3 py-2 text-[11px] text-white/70">Cada operación se firma en la wallet de la pareja, nunca en nuestros servidores.</div>
                    </div>
                    <div className="bg-black/40 rounded-xl border border-white/20 overflow-hidden">
                      <img src="/assets/security/wallet-flow.webp" alt="Flujo de tokens" className="w-full h-40 object-cover" />
                      <div className="px-3 py-2 text-[11px] text-white/70">Ruta visual de CMPX/GTK hacia staking, recompensas y utilidades en la app.</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    Demo educativa: estos diagramas ayudan a usuarios nuevos a entender el ecosistema Web3 sin exponer
                    datos sensibles.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* TARJETA PRINCIPAL PAREJA */}
            <Card className="bg-white/5 text-white border-white/15 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,.5)]">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
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
                  <div className="flex flex-col items-center sm:items-start justify-start flex-1 w-full">
                    <h2 className="text-xl font-bold text-white text-center sm:text-left">{profile.partner1_first_name} & {profile.partner2_first_name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                      <Badge className="bg-transparent border border-white/40 text-white"><MapPin className="w-3 h-3 mr-1"/> CDMX</Badge>
                      <Badge className="bg-transparent border border-white/30 text-white/90">{profile.partner1_age} y {profile.partner2_age} años</Badge>
                    </div>
                    <p className="text-sm text-white/80 mt-3 text-center sm:text-left italic">"Una pareja aventurera buscando nuevas experiencias y conexiones auténticas."</p>
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start mt-4 w-full">
                      <Button onClick={() => navigate('/edit-profile-couple')} variant="secondary" size="sm" className="bg-white/15 text-white border-white/20 hover:bg-white/25"><Edit className="w-4 h-4 mr-2"/> Editar</Button>
                      <Button onClick={() => setShowReportDialog(true)} variant="destructive" size="sm" className="bg-red-500/30 text-white border border-red-300/30 hover:bg-red-500/50"><Flag className="w-4 h-4 mr-2"/> Reportar</Button>
                      <TikTokShareButton url={window.location.href} text={`Mira el perfil de ${profile.couple_name}`} hashtags={['Parejas']} className="bg-white/10 text-white border-white/20" size="sm" />
                      {isOwnProfile && (
                        <Button
                          onClick={() =>
                            openConfirmDialog({
                              title: isDemoActive ? '¿Salir del modo Demo?' : '¿Cerrar sesión?',
                              description: 'Perderás la sesión actual, pero podrás regresar cuando quieras.',
                              confirmLabel: isDemoActive ? 'Salir Demo' : 'Cerrar sesión',
                              onConfirm: () => {
                                localStorage.removeItem('demo_authenticated');
                                localStorage.removeItem('demo_user');
                                window.location.href = '/';
                              },
                            })
                          }
                          className="bg-white/10 text-white border border-white/20 hover:bg-white/20 flex items-center gap-2 text-sm px-3 py-2"
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

            {/* TABS COMPLETOS (sin eliminar la lógica actual) */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-4 bg-white/10 text-white backdrop-blur-lg p-1 rounded-2xl border border-white/15">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
                <TabsTrigger value="achievements">Logros</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

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
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Mintear NFT de Pareja</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          Crearemos un coleccionable dual en Polygon que certifica su conexión.
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
                    <p className="text-white font-medium tracking-wide">Subiendo recuerdos...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TAB RESUMEN */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* GALERÍA PRIVADA */}
                <Card className="bg-white/5 border-white/15 backdrop-blur-xl text-white">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Lock className="w-4 h-4"/> Fotos Privadas
                    </CardTitle>
                    <Button
                      size="sm"
                      className={isParentalLocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
                      onClick={isParentalLocked ? () => setShowPinModal(true) : handleLockGallery}
                    >
                      {isParentalLocked ? <><Unlock className="w-3 h-3 mr-1"/> Desbloquear</> : <><Lock className="w-3 h-3 mr-1"/> Bloquear</>}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {galleryImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video rounded-lg overflow-hidden cursor-pointer shadow-sm"
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
                                <Lock className="w-5 h-5 text-gray-800 dark:text-white"/>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* INTERESES PAREJA (del respaldo) */}
                <Card className="bg-white/5 border-white/15 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Intereses Compartidos</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {['Intercambio Parejas', 'Viajes', 'Cenas', 'Fiestas Temáticas', 'Swinger Lifestyle'].map((tag, i) => (
                      <Badge
                        key={i}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 px-3 py-1 text-xs hover:opacity-90"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>

                {/* NAV TABS (posts, uploads, etc.) */}
                <ProfileNavTabs
                  isOwnProfile={isOwnProfile}
                  onUploadImage={handleUploadImage}
                  onDeletePost={handleDeletePost}
                  onCommentPost={handleCommentPost}
                />
              </TabsContent>

              {/* TAB ACTIVIDAD COMPLETA */}
              <TabsContent value="activity" className="mt-4 space-y-4">
                {recentActivity.map((a) => (
                  <Card
                    key={a.id}
                    className="bg-white/5 border-white/15 text-white overflow-hidden shadow-sm"
                  >
                    <CardContent className="p-0">
                      <div className="flex items-start gap-4 p-4">
                        <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">
                          {a.type === 'post' ? (
                            <Camera className="w-5 h-5 text-pink-600 dark:text-pink-300" />
                          ) : (
                            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{a.description}</p>
                          <p className="text-xs text-gray-500 dark:text-white/50 mt-1">{a.time}</p>
                        </div>
                      </div>
                      {a.image && (
                        <div className="w-full h-64 bg-gray-100 dark:bg-black/50 border-t border-gray-200 dark:border-white/10">
                          <img src={a.image} alt="Post" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* TAB LOGROS */}
              <TabsContent value="achievements" className="mt-4">
                <Card className="bg-white/5 border-white/15 text-white">
                  <CardContent className="p-4 grid grid-cols-2 gap-3">
                    {achievements.map((a, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border flex items-start gap-3 ${
                          a.unlocked
                            ? 'bg-pink-50 dark:bg-pink-900/40 border-pink-200 dark:border-pink-500/50'
                            : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-60'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-full ${
                            a.unlocked
                              ? 'bg-pink-500 text-white'
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

              {/* TAB ANALYTICS SIMPLE */}
              <TabsContent value="analytics" className="mt-4">
                <Card className="bg-white/5 border-white/15 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" /> Rendimiento Pareja
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-gray-600 dark:text-white/70">
                    <p>Gráficos de rendimiento simulados para la demo. Aquí se mostrarán métricas reales en producción.</p>
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
          profileId={profile.id}
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
          localStorage.setItem('parentalControlLocked', String(locked));
          setPrivateImageAccess(locked ? 'none' : 'approved');
        }}
        onUnlock={() => setPrivateImageAccess('approved')}
      />
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setShowPinModal(false)}
          >
            <motion.div className="bg-white dark:bg-gray-900 p-6 rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full mb-4 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent px-4 py-3 text-lg"
                placeholder="Ingresa PIN (1234)"
              />
              <Button onClick={handlePinSubmit} className="w-full">
                Desbloquear
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ImageModal isOpen={showImageModal} onClose={() => setShowImageModal(false)} images={galleryImages.map(img => img.url || '')} currentIndex={selectedImageIndex} onNavigate={setSelectedImageIndex} onLike={handleImageLike} onComment={handleAddComment} likes={imageLikes} userLikes={imageUserLikes} isPrivate={true} />
      <ReportDialog profileId={profile?.id || ''} profileName={profile.couple_name} isOpen={showReportDialog} onOpenChange={setShowReportDialog} onReport={(r) => console.log(r)} />
    </div>
  );

  return <ParticlesBackground>{content}</ParticlesBackground>;
};

export default ProfileCouple;
