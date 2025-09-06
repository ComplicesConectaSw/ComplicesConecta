import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profiles from "./pages/Profiles";
import ProfileDetail from "./pages/ProfileDetail";
import Events from "./pages/Events";
import Chat from "./pages/Chat";
import Matches from "./pages/Matches";
import Requests from "./pages/Requests";
import Settings from "./pages/Settings";
import Discover from "./pages/Discover";
import Premium from './pages/Premium';
import Dashboard from './pages/Dashboard';
import FAQ from "./pages/FAQ";
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Support from './pages/Support';
import TokensInfo from './pages/TokensInfo';
import TokensPrivacy from './pages/TokensPrivacy';
import TokensTerms from './pages/TokensTerms';
import TokensLegal from './pages/TokensLegal';
import ProjectInfo from './pages/ProjectInfo';
import Security from './pages/Security';
import Guidelines from './pages/Guidelines';
import Admin from '@/pages/Admin';
import AdminProduction from '@/pages/AdminProduction';
import NotFound from "./pages/NotFound";
import ProfileSingle from "./pages/ProfileSingle";
import ProfileCouple from "./pages/ProfileCouple";
import EditProfileSingle from "./pages/EditProfileSingle";
import EditProfileCouple from "./pages/EditProfileCouple";
import Feed from "./pages/Feed";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import ChatAuthenticated from "./pages/ChatAuthenticated";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-hero-gradient">
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/profile/:id" element={<ProfileDetail />} />
            <Route path="/profile" element={<ProfileSingle />} />
            <Route path="/profile-single" element={<ProfileSingle />} />
            <Route path="/profile-couple" element={<ProfileCouple />} />
            <Route path="/edit-profile-single" element={<EditProfileSingle />} />
            <Route path="/edit-profile-couple" element={<EditProfileCouple />} />
            <Route path="/events" element={<Events />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/dashboard" element={<Dashboard />} />
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
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/chat-authenticated" element={<ChatAuthenticated />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
