import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, MapPin, Verified, Crown, Share2, Lock, Flag, 
  Wallet, Users, MessageCircle, Eye, TrendingUp, 
  Award, CheckCircle, Edit, Camera, Gift, LogOut, X, Info, Loader2, 
  Gamepad2, Unlock, BarChart3 
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
import { VanishSearchInput } from '@/shared/ui/vanish-search-input';
import { WalletService } from '@/services/WalletService';
import { SafeImage } from '@/shared/ui/SafeImage';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase-generated';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground'; // IMPORTAR

// IMÁGENES LOCALES
import nftImage1 from '@/assets/Ntf/imagen1.jpg';
import nftImage2 from '@/assets/Ntf/imagen2.png';
import nftImage3 from '@/assets/Ntf/imagen3.png';
import nftImage4 from '@/assets/Ntf/imagen4.png';

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
  const [pinInput, setPinInput] = useState("");
  const [isParentalLocked, setIsParentalLocked] = useState(() => {
    const saved = localStorage.getItem('parentalControlLocked');
    return saved !== null ? JSON.parse(saved) : true;
  });
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
  const handlePinSubmit = () => { if (pinInput === "1234") { setIsParentalLocked(false); localStorage.setItem('parentalControlLocked', 'false'); setShowPinModal(false); setPinInput(""); showToast("Desbloqueado", "success"); } else { showToast("Error PIN", "error"); setPinInput(""); } };
  const handleLockGallery = () => { setIsParentalLocked(true); localStorage.setItem('parentalControlLocked', 'true'); showToast("Bloqueado", "info"); };
  const handleImageClick = (index: number) => { if (isParentalLocked) { setShowPinModal(true); return; } setSelectedImageIndex(index); setShowImageModal(true); };
  const handleClaimTokens = () => { if (isClaimingTokens) return; setIsClaimingTokens(true); setTimeout(() => { setTokenBalances(prev => ({ ...prev, cmpx: (parseFloat(prev.cmpx) + 2000).toString() })); setIsClaimingTokens(false); showToast("¡2000 CMPX reclamados!", "success"); }, 1500); };
  const handleMintClick = () => setShowMintDialog(true);
  const confirmMinting = () => { setShowMintDialog(false); setIsMinting(true); setTimeout(() => { const r = DEMO_COUPLE_ASSETS[0]; setCoupleNFTs(prev => [{ id: Date.now(), name: `Couple NFT #${coupleNFTs.length + 1}`, image: r }, ...prev]); setIsMinting(false); showToast("NFT creado", "success"); }, 2000); };
  const handleImageLike = (idx: number) => showToast("Te gusta", "success");
  const handleAddComment = () => showToast("Comentado", "success");
  const handleDeletePost = (id: string) => { if(window.confirm("¿Borrar?")) setRecentActivity(prev => prev.filter(p => p.id !== id)); };
  const handleCommentPost = () => showToast("Comentar...", "info");

  if (isLoading || !profile) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><Loader2 className="w-10 h-10 text-purple-500 animate-spin"/></div>;

  const isDemoActive = (String(demoAuth) === 'true') && demoUser;

  const content = (
    <div className="min-h-screen bg-transparent profile-page relative overflow-hidden transition-colors duration-300">
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 opacity-90 hidden dark:block"></div>
      
      {!isAuthenticated() && !isDemoActive && <Navigation />}
      
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
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{profile.partner1_first_name} & {profile.partner2_first_name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-white/10 dark:text-white"><MapPin className="w-3 h-3 mr-1"/> CDMX</Badge>
                      <Badge variant="outline" className="text-gray-600 dark:text-white border-gray-300 dark:border-white/40">{profile.partner1_age} y {profile.partner2_age} años</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/90 mt-3 text-center sm:text-left italic">"Una pareja aventurera buscando nuevas experiencias y conexiones auténticas."</p>
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

            {/* TABS */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-white/10 backdrop-blur-md p-1 rounded-xl border border-gray-200 dark:border-white/10">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
                <TabsTrigger value="achievements">Logros</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-6 space-y-6">
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
              {/* Resto de Tabs Content (Activity, Achievements, etc) */}
            </Tabs>
          </div>
      </div>
      {showPrivateImageRequest && <PrivateImageRequest isOpen={showPrivateImageRequest} onClose={() => setShowPrivateImageRequest(false)} profileId={profile.id} profileName={profile.couple_name} profileType="couple" onRequestSent={() => setShowPrivateImageRequest(false)} />}
      <ParentalControl isLocked={isParentalLocked} onToggle={() => {}} onUnlock={() => {}} />
      <AnimatePresence>{showPinModal && (<motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowPinModal(false)}><motion.div className="bg-white dark:bg-gray-900 p-6 rounded-3xl" onClick={e => e.stopPropagation()}><input type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} /><Button onClick={handlePinSubmit}>Desbloquear</Button></motion.div></motion.div>)}</AnimatePresence>
      <ImageModal isOpen={showImageModal} onClose={() => setShowImageModal(false)} images={galleryImages.map(img => img.url || '')} currentIndex={selectedImageIndex} onNavigate={setSelectedImageIndex} onLike={handleImageLike} onComment={handleAddComment} likes={imageLikes} userLikes={imageUserLikes} isPrivate={true} />
      <ReportDialog profileId={profile?.id || ''} profileName={profile.couple_name} isOpen={showReportDialog} onOpenChange={setShowReportDialog} onReport={(r) => console.log(r)} />
    </div>
  );

  return <ParticlesBackground>{content}</ParticlesBackground>;
};

export default ProfileCouple;