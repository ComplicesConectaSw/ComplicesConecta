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
import Settings from "./pages/Settings";
import Discover from "./pages/Discover";
import Premium from "./pages/Premium";
import Dashboard from "./pages/Dashboard";
import FAQ from "./pages/FAQ";
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Support from './pages/Support';
import Security from './pages/Security';
import Guidelines from './pages/Guidelines';
import Admin from './pages/Admin';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-hero-gradient">
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/profile/:id" element={<ProfileDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/support" element={<Support />} />
            <Route path="/security" element={<Security />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
