import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CrossBrowserOptimizer } from '@/components/ui/CrossBrowserOptimizer';
import { AccessibilityEnhancer } from '@/components/ui/AccessibilityEnhancer';
import { MobileOptimizer } from '@/components/ui/MobileOptimizer';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { Suspense, lazy, useEffect, useState } from "react";
import { AnimationProvider } from "@/components/animations/AnimationProvider";
import { PageTransitionWrapper } from "@/components/animations/PageTransitions";
import { NotificationProvider } from "@/components/animations/NotificationSystem";
import { AnimationSettingsButton } from "@/components/animations/AnimationSettings";
import AdminRoute from '@/components/auth/AdminRoute';
import ModeratorRoute from '@/components/auth/ModeratorRoute';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AppFactory } from '@/demo/AppFactory';
import { useAuth } from '@/features/auth/useAuth';
import Navigation from '@/components/Navigation';
import HeaderNav from '@/components/HeaderNav';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';

// Pages Imports
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Events from "@/pages/Events";
import Discover from "@/pages/Discover";
import Demo from "@/pages/Demo";

// Lazy Imports
const Profiles = lazy(() => import("@/profiles/shared/Profiles"));
const ProfileDetail = lazy(() => import("@/profiles/shared/ProfileDetail"));
const _Chat = lazy(() => import("@/pages/Chat"));
const _ChatInfo = lazy(() => import("@/pages/ChatInfo"));
const _Matches = lazy(() => import("@/pages/Matches"));
const _Requests = lazy(() => import("@/pages/Requests"));
const Settings = lazy(() => import("@/pages/Settings"));
const Premium = lazy(() => import("@/pages/Premium"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Support = lazy(() => import("@/pages/Support"));
const ProjectInfo = lazy(() => import("@/pages/ProjectInfo"));
const Security = lazy(() => import("@/pages/Security"));
const Guidelines = lazy(() => import("@/pages/Guidelines"));
const Legal = lazy(() => import("@/pages/Legal"));
const Tokens = lazy(() => import("@/pages/Tokens"));
const TokensInfo = lazy(() => import("@/pages/TokensInfo"));
const TokensPrivacy = lazy(() => import("@/pages/TokensPrivacy"));
const TokensTerms = lazy(() => import("@/pages/TokensTerms"));
const TokensLegal = lazy(() => import("@/pages/TokensLegal"));
const Admin = lazy(() => import("@/pages/Admin/Admin"));
const AdminProduction = lazy(() => import("@/pages/Admin/AdminProduction"));
const AdminPartners = lazy(() => import("@/pages/Admin/AdminPartners"));
const Clubs = lazy(() => import("@/pages/Clubs"));
const Shop = lazy(() => import("@/pages/Shop"));
const StoriesInfo = lazy(() => import("@/pages/StoriesInfo"));
const ProfileSingle = lazy(() => import("@/profiles/single/ProfileSingle"));
const Stories = lazy(() => import("@/pages/Stories"));
const ProfileCouple = lazy(() => import("@/profiles/couple/ProfileCouple"));
const EditProfileSingle = lazy(() => import("@/profiles/single/EditProfileSingle"));
const EditProfileCouple = lazy(() => import("@/profiles/couple/EditProfileCouple"));
const Feed = lazy(() => import("@/pages/Feed"));
const VideoChat = lazy(() => import("@/pages/VideoChat"));
const VIPEvents = lazy(() => import("@/pages/VIPEvents"));
const VirtualGifts = lazy(() => import("@/pages/VirtualGifts"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const Info = lazy(() => import("@/pages/Info"));
const About = lazy(() => import("@/pages/About"));
const Careers = lazy(() => import("@/pages/Careers"));
const AdminCareerApplications = lazy(() => import("@/pages/Admin/AdminCareerApplications"));
const AdminModerators = lazy(() => import("@/pages/Admin/AdminModerators"));
const AdminAnalytics = lazy(() => import("@/pages/Admin/AdminAnalytics"));
const ModeratorDashboard = lazy(() => import("@/pages/ModeratorDashboard"));
const ModeratorRequest = lazy(() => import("@/pages/ModeratorRequest"));
const Moderators = lazy(() => import("@/pages/Moderators"));
const Blog = lazy(() => import("@/pages/Blog"));
const ChatAuthenticated = lazy(() => import("@/pages/ChatAuthenticated"));
const Donations = lazy(() => import("@/pages/Donations"));
const Invest = lazy(() => import("@/pages/Invest"));
const TemplateDemo = lazy(() => import("@/pages/TemplateDemo"));
const News = lazy(() => import("@/pages/News"));
const Investors = lazy(() => import("@/pages/Investors"));
const NFTs = lazy(() => import("@/pages/NFTs"));

// --- LOADER CORREGIDO (Centrado y proporciones correctas) ---
const PageLoader = () => (
  <div className="fixed inset-0 z-[200] bg-black">
    <img
      src="/backgrounds/cargando.webp"
      alt="Cargando..."
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="relative z-10 h-full w-full flex flex-col items-center justify-center bg-black/60">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 shadow-[0_0_25px_#a855f7]" />
        <p className="text-white text-sm font-bold tracking-[0.4em] uppercase">Cargando...</p>
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
    mutations: { retry: 1 },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('cc_splash_shown');
  });
  const [logoReady, setLogoReady] = useState(false);

  useEffect(() => {
    if (!showSplash) return;
    const logo = new Image();
    logo.src = '/backgrounds/logo-animated.webp';
    logo.onload = () => setLogoReady(true);

    const timer = setTimeout(() => {
      sessionStorage.setItem('cc_splash_shown', '1');
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [showSplash]);

  const { isAuthenticated, user } = useAuth();
  const isAuthFn = typeof isAuthenticated === 'function' ? isAuthenticated() : Boolean(isAuthenticated);
  const [demoSessionActive, setDemoSessionActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('demo_authenticated') === 'true';
  });

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'demo_authenticated') {
        setDemoSessionActive(event.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const hasSession = Boolean(user) || isAuthFn || demoSessionActive;
  const showProfileNavigation = hasSession;

  // --- SPLASH CORREGIDO (Proporciones correctas) ---
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="w-full max-w-2xl px-4">
          {logoReady ? (
            <img 
              src="/backgrounds/logo-animated.webp" 
              alt="Bienvenido" 
              className="w-full h-auto object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400" />
              <p className="text-sm tracking-[0.4em] uppercase">Cargando...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <CrossBrowserOptimizer>
            <AccessibilityEnhancer>
              <MobileOptimizer>
                <AnimationProvider>
                  <NotificationProvider>
                    <AppFactory>
                      <ParticlesBackground className="bg-transparent">
                        <Router>
                            {!hasSession && <HeaderNav />}
                            
                            {/* Contenido centrado */}
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
                              <PageTransitionWrapper>
                                <Suspense fallback={<PageLoader />}>
                                  <Routes>
                                    <Route path="/" element={<Index />} />
                                    <Route path="/auth" element={<ProtectedRoute requireAuth={false}><Auth /></ProtectedRoute>} />
                                    <Route path="/demo" element={<Demo />} />
                                    <Route path="/faq" element={<FAQ />} />
                                    <Route path="/feed" element={<Feed />} />
                                    <Route path="/profiles" element={<Profiles />} />
                                    <Route path="/profile/:id" element={<ProfileDetail />} />
                                    <Route path="/profile" element={<ProfileSingle />} />
                                    <Route path="/profile-single" element={<ProfileSingle />} />
                                    <Route path="/profile-couple" element={<ProfileCouple />} />
                                    <Route path="/edit-profile-single" element={<EditProfileSingle />} />
                                    <Route path="/edit-profile-couple" element={<EditProfileCouple />} />
                                    <Route path="/events" element={<Events />} />
                                    <Route path="/chat" element={<_Chat />} />
                                    <Route path="/chat-info" element={<_ChatInfo />} />
                                    <Route path="/matches" element={<_Matches />} />
                                    <Route path="/requests" element={<_Requests />} />
                                    <Route path="/discover" element={<Discover />} />
                                    <Route path="/stories" element={<Stories />} />
                                    <Route path="/stories/info" element={<StoriesInfo />} />
                                    <Route path="/stories/features" element={<StoriesInfo />} />
                                    <Route path="/stories/benefits" element={<StoriesInfo />} />
                                    <Route path="/tokens" element={<Tokens />} />
                                    <Route path="/settings" element={<Settings />} />
                                    <Route path="/premium" element={<Premium />} />
                                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                                    <Route path="/support" element={<Support />} />
                                    <Route path="/terms" element={<Terms />} />
                                    <Route path="/privacy" element={<Privacy />} />
                                    <Route path="/tokens-info" element={<TokensInfo />} />
                                    <Route path="/tokens-privacy" element={<TokensPrivacy />} />
                                    <Route path="/tokens-terms" element={<TokensTerms />} />
                                    <Route path="/tokens-legal" element={<TokensLegal />} />
                                    <Route path="/shop" element={<Shop />} />
                                    <Route path="/project-info" element={<ProjectInfo />} />
                                    <Route path="/admin" element={<Admin />} />
                                    <Route path="/admin-production" element={<AdminProduction />} />
                                    <Route path="/security" element={<Security />} />
                                    <Route path="/guidelines" element={<Guidelines />} />
                                    <Route path="/legal" element={<Legal />} />
                                    <Route path="/video-chat" element={<VideoChat />} />
                                    <Route path="/vip-events" element={<VIPEvents />} />
                                    <Route path="/virtual-gifts" element={<VirtualGifts />} />
                                    <Route path="/marketplace" element={<Marketplace />} />
                                    <Route path="/info" element={<Info />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/careers" element={<Careers />} />
                                    <Route path="/admin/career-applications" element={<AdminRoute><AdminCareerApplications /></AdminRoute>} />
                                    <Route path="/admin/moderators" element={<AdminRoute><AdminModerators /></AdminRoute>} />
                                    <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
                                    <Route path="/admin/partners" element={<AdminRoute><AdminPartners /></AdminRoute>} />
                                    <Route path="/clubs" element={<Clubs />} />
                                    <Route path="/clubs/:slug" element={<Clubs />} />
                                    <Route path="/moderators/dashboard" element={<ModeratorRoute><ModeratorDashboard /></ModeratorRoute>} />
                                    <Route path="/moderators" element={<Moderators />} />
                                    <Route path="/moderator-request" element={<ModeratorRequest />} />
                                    <Route path="/blog" element={<Blog />} />
                                    <Route path="/chat-authenticated" element={<ChatAuthenticated />} />
                                    <Route path="/donations" element={<Donations />} />
                                    <Route path="/invest" element={<Invest />} />
                                    <Route path="/template-demo" element={<TemplateDemo />} />
                                    <Route path="/news" element={<News />} />
                                    <Route path="/investors" element={<Investors />} />
                                    <Route path="/nfts" element={<NFTs />} />
                                    <Route path="*" element={<NotFound />} />
                                  </Routes>
                                </Suspense>
                              </PageTransitionWrapper>
                            </div>
                            
                            {hasSession && showProfileNavigation && (
                              <div className="fixed bottom-0 left-0 right-0 z-50">
                                <Navigation />
                              </div>
                            )}
                        </Router>
                        <Toaster />
                        <AnimationSettingsButton />
                      </ParticlesBackground>
                    </AppFactory>
                  </NotificationProvider>
                </AnimationProvider>
              </MobileOptimizer>
            </AccessibilityEnhancer>
          </CrossBrowserOptimizer>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
