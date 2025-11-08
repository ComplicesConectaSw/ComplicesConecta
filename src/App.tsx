import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// CRÃTICO: Importar QueryClient de forma segura - verificar que React estÃ© disponible
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// CRÃTICO: Verificar que React estÃ© disponible antes de usar QueryClient
if (typeof window !== 'undefined') {
  // Esperar a que React estÃ© disponible antes de crear QueryClient
  const checkReact = () => {
    const hasReact = (window as any).React || (window as any).__REACT_STUB__;
    if (!hasReact) {
      // Si React no estÃ¡ disponible, esperar un poco y reintentar
      setTimeout(checkReact, 10);
    }
  };
  checkReact();
}
import { CrossBrowserOptimizer } from '@/components/ui/CrossBrowserOptimizer';
import { AccessibilityEnhancer } from '@/components/ui/AccessibilityEnhancer';
import { MobileOptimizer } from '@/components/ui/MobileOptimizer';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { Suspense, lazy } from "react";
import { AnimationProvider } from "@/components/animations/AnimationProvider";
import { PageTransitionWrapper } from "@/components/animations/PageTransitions";
import { NotificationProvider } from "@/components/animations/NotificationSystem";
import { AnimationSettingsButton } from "@/components/animations/AnimationSettings";
import AdminRoute from '@/components/auth/AdminRoute';
import ModeratorRoute from '@/components/auth/ModeratorRoute';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AppFactory } from '@/demo/AppFactory';

// ============================================================================
// ESTRATEGIA DE CARGA DE PÃGINAS
// ============================================================================
// 
// PÃGINAS CRÃTICAS (Carga Inmediata):
// - Index: PÃ¡gina principal, debe cargar instantÃ¡neamente
// - Auth: AutenticaciÃ³n, crÃ­tica para el flujo de usuario
// - NotFound: PÃ¡gina de error, debe estar siempre disponible
// - Events: PÃ¡gina principal de eventos
// - Discover: PÃ¡gina principal de descubrimiento
//
// PÃGINAS CORE (Lazy Loading):
// - Profiles, ProfileDetail: Funcionalidades principales
// - Chat, ChatInfo: Sistema de chat
// - Matches: Sistema de matches
//
// PÃGINAS ADMIN (Lazy Loading):
// - Admin*, Moderator*: Panel administrativo
//
// PÃGINAS SECUNDARIAS (Lazy Loading):
// - About, Terms, Privacy, etc.: PÃ¡ginas informativas
// ============================================================================

// Critical pages - loaded immediately
import Index from "@/pages/Index";
import Auth from "@/app/(auth)/Auth";
import NotFound from "@/pages/NotFound";
import Events from "@/pages/Events";
import Discover from "@/app/(discover)/Discover";

// Lazy loaded pages for performance optimization - Core features
const Profiles = lazy(() => import("@/profiles/shared/Profiles"));
const ProfileDetail = lazy(() => import("@/profiles/shared/ProfileDetail"));
const Chat = lazy(() => import("@/pages/Chat"));
const ChatInfo = lazy(() => import("@/pages/ChatInfo"));
const Matches = lazy(() => import("@/pages/Matches"));
const Requests = lazy(() => import("@/pages/Requests"));
const Settings = lazy(() => import("@/pages/Settings"));
const Premium = lazy(() => import("@/pages/Premium"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));

// Secondary pages - loaded on demand
const FAQ = lazy(() => import("@/pages/FAQ"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Support = lazy(() => import("@/pages/Support"));
const ProjectInfo = lazy(() => import("@/pages/ProjectInfo"));
const Security = lazy(() => import("@/pages/Security"));
const Guidelines = lazy(() => import("@/pages/Guidelines"));
const Legal = lazy(() => import("@/pages/Legal"));

// Token system - separate chunk
const Tokens = lazy(() => import("@/pages/Tokens"));
const TokensInfo = lazy(() => import("@/pages/TokensInfo"));
const TokensPrivacy = lazy(() => import("@/pages/TokensPrivacy"));
const TokensTerms = lazy(() => import("@/pages/TokensTerms"));
const TokensLegal = lazy(() => import("@/pages/TokensLegal"));

// Admin pages - separate chunk
const Admin = lazy(() => import("@/app/(admin)/Admin"));
const AdminProduction = lazy(() => import("@/app/(admin)/AdminProduction"));
const AdminPartners = lazy(() => import("@/app/(admin)/AdminPartners"));

// Clubs system
const Clubs = lazy(() => import("@/app/(clubs)/Clubs"));

// Shop CMPX tokens
const Shop = lazy(() => import("@/pages/Shop"));

// Stories info pages
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
const AdminCareerApplications = lazy(() => import("@/app/(admin)/AdminCareerApplications"));
const AdminModerators = lazy(() => import("@/app/(admin)/AdminModerators"));
const AdminAnalytics = lazy(() => import("@/app/(admin)/AdminAnalytics"));
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

// Loading component for Suspense - Optimizado
const PageLoader = () => (
  <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-white text-lg">Cargando...</p>
    </div>
  </div>
);

// Loading component especÃ­fico para diferentes tipos de pÃ¡ginas
const _AdminPageLoader = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
      <p className="text-white text-lg">Cargando panel administrativo...</p>
    </div>
  </div>
);

const _ProfilePageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
      <p className="text-white text-lg">Cargando perfil...</p>
    </div>
  </div>
);

// CRÃTICO: Crear QueryClient fuera del componente para evitar recreaciÃ³n en cada render
// ConfiguraciÃ³n optimizada para producciÃ³n
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <CrossBrowserOptimizer>
          <AccessibilityEnhancer>
            <MobileOptimizer>
              <AnimationProvider>
                <NotificationProvider>
                  <AppFactory>
                    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 relative overflow-hidden">
                      {/* AnimatedBackground disabled to prevent ghost elements */}
                      {/* <AnimatedBackground /> */}
                      {/* FloatingParticles disabled to prevent ghost elements */}
                      {/* <FloatingParticles count={15} /> */}
                      <AnimationSettingsButton />
                      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <PageTransitionWrapper>
                          <Suspense fallback={<PageLoader />}>
                            <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={
                    <ProtectedRoute requireAuth={false}>
                      <Auth />
                    </ProtectedRoute>
                  } />
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
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/chat-info" element={<ChatInfo />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="/requests" element={<Requests />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/stories" element={<Stories />} />
                  <Route path="/stories/info" element={<StoriesInfo />} />
                  <Route path="/stories/features" element={<StoriesInfo />} />
                  <Route path="/stories/benefits" element={<StoriesInfo />} />
                  <Route path="/tokens" element={<Tokens />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/premium" element={<Premium />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
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
                  <Route path="/admin/career-applications" element={
                    <AdminRoute>
                      <AdminCareerApplications />
                    </AdminRoute>
                  } />
                  <Route path="/admin/moderators" element={
                    <AdminRoute>
                      <AdminModerators />
                    </AdminRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <AdminRoute>
                      <AdminAnalytics />
                    </AdminRoute>
                  } />
                  <Route path="/admin/partners" element={
                    <AdminRoute>
                      <AdminPartners />
                    </AdminRoute>
                  } />
                  <Route path="/clubs" element={<Clubs />} />
                  <Route path="/clubs/:slug" element={<Clubs />} />
                  <Route path="/moderators/dashboard" element={
                    <ModeratorRoute>
                      <ModeratorDashboard />
                    </ModeratorRoute>
                  } />
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
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                            </Routes>
                          </Suspense>
                        </PageTransitionWrapper>
                      </Router>
                      <Toaster />
                    </div>
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

export default App;
