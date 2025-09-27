import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CrossBrowserOptimizer } from '@/components/ui/CrossBrowserOptimizer';
import { AccessibilityEnhancer } from '@/components/ui/AccessibilityEnhancer';
import { MobileOptimizer } from '@/components/ui/MobileOptimizer';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { Suspense } from "react";
import { AnimationProvider } from "@/components/animations/AnimationProvider";
import { PageTransitionWrapper } from "@/components/animations/PageTransitions";
import { AnimatedBackground, FloatingParticles } from "@/components/animations/GlobalAnimations";
import { NotificationProvider } from "@/components/animations/NotificationSystem";
import { AnimationSettingsButton } from "@/components/animations/AnimationSettings";
import AdminRoute from '@/components/auth/AdminRoute';
import ModeratorRoute from '@/components/auth/ModeratorRoute';
import ProtectedRoute from '@/components/ProtectedRoute';

// Critical pages - loaded immediately
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Events from "@/pages/Events";

// Import optimized lazy components
import { LazyComponents } from '@/utils/lazyComponents';

// Destructure for cleaner usage
const {
  // Core features
  Profiles, ProfileDetail, Chat, ChatInfo, Matches, Requests, Settings, 
  Discover, Premium, Dashboard,
  
  // Info/Legal pages
  FAQ, Terms, Privacy, Support, ProjectInfo, Security, Guidelines, Legal, About,
  
  // Token system
  Tokens, TokensInfo, TokensPrivacy, TokensTerms, TokensLegal,
  
  // Admin pages
  Admin, AdminProduction, AdminCareerApplications, AdminModerators, ModeratorDashboard,
  
  // Stories and content
  StoriesInfo, Stories, Feed, Blog,
  
  // Profile pages
  ProfileSingle, ProfileCouple, EditProfileSingle, EditProfileCouple,
  
  // Other pages
  Careers, ModeratorRequest, ChatAuthenticated, Donations, TemplateDemo
} = LazyComponents;

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-white text-lg">Cargando...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <CrossBrowserOptimizer>
          <AccessibilityEnhancer>
            <MobileOptimizer>
              <AnimationProvider>
                <NotificationProvider>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 relative overflow-hidden">
            <AnimatedBackground />
            <FloatingParticles count={15} />
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
                  <Route path="/project-info" element={<ProjectInfo />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin-production" element={<AdminProduction />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="/guidelines" element={<Guidelines />} />
                  <Route path="/legal" element={<Legal />} />
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
                  <Route path="/moderators/dashboard" element={
                    <ModeratorRoute>
                      <ModeratorDashboard />
                    </ModeratorRoute>
                  } />
                  <Route path="/moderator-request" element={<ModeratorRequest />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/chat-authenticated" element={<ChatAuthenticated />} />
                  <Route path="/donations" element={<Donations />} />
                  <Route path="/template-demo" element={<TemplateDemo />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </PageTransitionWrapper>
          </Router>
            <Toaster />
          </div>
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
