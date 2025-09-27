// src/imports/index.ts
// ==================================================
// 📦 CENTRAL IMPORT HUB – ComplicesConecta v3.x.x
// ==================================================
// ⚠️ Este archivo centraliza TODOS los imports del proyecto
// ⚠️ No modificar lógica, solo reexportar para unificar.
// ⚠️ Categorías separadas para mejor organización.
// ==================================================

// =======================
// COMPONENTS - CORE
// =======================
export { default as App } from "@/App";
export { AppLayout } from "@/components/AppLayout";
export { AppSidebar } from "@/components/AppSidebar";
export { BetaBanner } from "@/components/BetaBanner";
export { DismissibleBanner } from "@/components/DismissibleBanner";
export { ErrorBoundary } from "@/components/ErrorBoundary";
export { Footer } from "@/components/Footer";
export { HCaptchaWidget } from "@/components/HCaptchaWidget";
export { Header } from "@/components/Header";
export { HeaderNav } from "@/components/HeaderNav";
export { HeroSection } from "@/components/HeroSection";
export { LoadingScreen } from "@/components/LoadingScreen";
export { LoginLoadingScreen } from "@/components/LoginLoadingScreen";
export { ModeIndicator } from "@/components/ModeIndicator";
export { Navigation } from "@/components/Navigation";
export { NavigationEnhanced } from "@/components/NavigationEnhanced";
export { ProfileFilters } from "@/components/ProfileFilters";
export { ProfileGrid } from "@/components/ProfileGrid";
export { ProfileLoadingScreen } from "@/components/ProfileLoadingScreen";
export { ProtectedRoute } from "@/components/ProtectedRoute";
export { RequestCard } from "@/components/RequestCard";
export { ResponsiveContainer } from "@/components/ResponsiveContainer";
export { SendRequestDialog } from "@/components/SendRequestDialog";
export { ThemeModal } from "@/components/ThemeModal";
export { ThemeSelector } from "@/components/ThemeSelector";
export { WelcomeModal } from "@/components/WelcomeModal";

// ⚠️ NOTA: Los siguientes componentes no existen - marcados para reporte
// export { Button } from "@/components/Button";
// export { useTheme } from "@/hooks/useTheme";
// export { logger } from "@/utils/logger";

// =======================
// COMPONENTS - ACCESSIBILITY
// =======================
export { AccessibilityAudit } from "@/components/accessibility/AccessibilityAudit";
export { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
export { ContrastFixer } from "@/components/accessibility/ContrastFixer";

// =======================
// COMPONENTS - ADMIN
// =======================
export { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
export { PerformancePanel } from "@/components/admin/PerformancePanel";
export { ProfileReportsPanel } from "@/components/admin/ProfileReportsPanel";
export { ReportsManagement } from "@/components/admin/ReportsManagement";
export { SecurityPanel } from "@/components/admin/SecurityPanel";
export { TokenSystemPanel } from "@/components/admin/TokenSystemPanel";
export { UserManagementPanel } from "@/components/admin/UserManagementPanel";

// =======================
// COMPONENTS - AI
// =======================
export { ContentModerationModal } from "@/components/ai/ContentModerationModal";
export { SmartMatchingModal } from "@/components/ai/SmartMatchingModal";

// =======================
// COMPONENTS - ANALYTICS
// =======================
export { ProfileAnalytics } from "@/components/analytics/ProfileAnalytics";

// =======================
// COMPONENTS - AUTH
// =======================
export { TermsModal } from "@/components/auth/TermsModal";
export { ThemeInfoModal } from "@/components/auth/ThemeInfoModal";
// ⚠️ NOTA: Los siguientes componentes auth no existen - marcados para reporte
// export { AuthProvider } from "@/components/auth/AuthProvider";
// export { BiometricAuth } from "@/components/auth/BiometricAuth";
// export { LoginForm } from "@/components/auth/LoginForm";

// =======================
// COMPONENTS - DISCOVER
// =======================
export { AdvancedFilters } from "@/components/discover/AdvancedFilters";
export { DiscoverProfileCard } from "@/components/discover/DiscoverProfileCard";
export { DiscoverSidebar } from "@/components/discover/DiscoverSidebar";
export { LocationSelector } from "@/components/discover/LocationSelector";
export { MatchScore } from "@/components/discover/MatchScore";
export { PreferenceSearch } from "@/components/discover/PreferenceSearch";

// =======================
// COMPONENTS - EVENTS
// =======================
export { EventCard } from "@/components/social/EventCard";
export { default as VIPEvents } from "@/components/premium/VIPEvents";
// ⚠️ NOTA: EventCard también disponible en @/components/ui/EventCard

// =======================
// COMPONENTS - LIFESTYLE
// =======================
// ⚠️ NOTA: Componentes lifestyle no encontrados - marcados para reporte

// =======================
// COMPONENTS - MODALS
// =======================
export { ActionButtonsModal } from "@/components/modals/ActionButtonsModal";
export { ComingSoonModal } from "@/components/modals/ComingSoonModal";
export { CompatibilityModal } from "@/components/modals/CompatibilityModal";
export { ContentModerationModal as ModalsContentModerationModal } from "@/components/modals/ContentModerationModal";
export { EventsModal } from "@/components/modals/EventsModal";
export { FeatureModal } from "@/components/modals/FeatureModal";
export { InstallAppModal } from "@/components/modals/InstallAppModal";
export { PremiumModal } from "@/components/modals/PremiumModal";
export { SmartMatchingModal as ModalsSmartMatchingModal } from "@/components/modals/SmartMatchingModal";
export { SuperLikesModal } from "@/components/modals/SuperLikesModal";

// =======================
// COMPONENTS - PROFILE
// =======================
export { CoupleCard } from "@/components/profile/CoupleCard";
export { CoupleImageGallery } from "@/components/profile/CoupleImageGallery";
export { CoupleImageUpload } from "@/components/profile/CoupleImageUpload";
export { CouplePhotoSection } from "@/components/profile/CouplePhotoSection";
export { CoupleProfileCard } from "@/components/profile/CoupleProfileCard";
export { CoupleProfileHeader } from "@/components/profile/CoupleProfileHeader";
export { Gallery } from "@/components/profile/Gallery";
export { ImageUpload } from "@/components/profile/ImageUpload";
export { MainProfileCard } from "@/components/profile/MainProfileCard";
export { PrivateImageGallery } from "@/components/profile/PrivateImageGallery";
export { PrivateImageRequest } from "@/components/profile/PrivateImageRequest";
export { ProfileNavTabs } from "@/components/profile/ProfileNavTabs";
export { ProfileNavigation } from "@/components/profile/ProfileNavigation";
export { ProfileStats } from "@/components/profile/ProfileStats";
export { ProfileTabs } from "@/components/profile/ProfileTabs";
export { ProfileThemeDemo } from "@/components/profile/ProfileThemeDemo";
export { SingleCard } from "@/components/profile/SingleCard";
// ⚠️ NOTA: ProfileCard disponible como MainProfileCard

// =======================
// COMPONENTS - REPORTS
// =======================
export { ProfileReportModal } from "@/components/reports/ProfileReportModal";

// =======================
// COMPONENTS - STORIES
// =======================
export { CreateStory } from "@/components/stories/CreateStory";
export { default as StoriesContainer } from "@/components/stories/StoriesContainer";
export { StoryReportDialog } from "@/components/stories/StoryReportDialog";
export { StoryViewer } from "@/components/stories/StoryViewer";

// =======================
// COMPONENTS - TOKENS
// =======================
export { StakingModal } from "@/components/tokens/StakingModal";
export { TokenBalance } from "@/components/tokens/TokenBalance";
export { TokenChatBot } from "@/components/tokens/TokenChatBot";
export { TokenDashboard } from "@/components/tokens/TokenDashboard";

// =======================
// COMPONENTS - UI
// =======================
export { Button } from "@/components/ui/button";
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export { Badge } from "@/components/ui/badge";
export { Input } from "@/components/ui/input";
export { Label } from "@/components/ui/label";
export { Slider } from "@/components/ui/slider";
export { Switch } from "@/components/ui/switch";
export { DialogContent } from "@/components/ui/dialog";
export { DialogDescription } from "@/components/ui/dialog";
export { DialogHeader } from "@/components/ui/dialog";
export { DialogTitle } from "@/components/ui/dialog";
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export { Sidebar, SidebarContent, SidebarTrigger, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
export { Textarea } from "@/components/ui/textarea";
export { Progress } from "@/components/ui/progress";
export { Checkbox } from "@/components/ui/checkbox";
export { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export { Separator } from "@/components/ui/separator";
export { ScrollArea } from "@/components/ui/scroll-area";
export { Alert, AlertDescription } from "@/components/ui/alert";
export { TermsModal as UITermsModal } from "@/components/ui/TermsModal";
export { UnifiedModal } from "@/components/ui/UnifiedModal";

// =======================
// HOOKS
// =======================
export { useToast } from "@/hooks/use-toast";
export { useAuth } from "@/hooks/useAuth";
export { useAuthMode } from "@/hooks/useAuthMode";
export { useBiometricAuth } from "@/hooks/useBiometricAuth";
export { useCouplePhotos } from "@/hooks/useCouplePhotos";
export { useCoupleProfile } from "@/hooks/useCoupleProfile";
export { useGeolocation } from "@/hooks/useGeolocation";
export { useInterests } from "@/hooks/useInterests";
export { useOnlineStatus, useUserOnlineStatus } from "@/hooks/useOnlineStatus";
export { usePersistedState } from "@/hooks/usePersistedState";
export { useProfileCache } from "@/hooks/useProfileCache";
export { useProfileQuery } from "@/hooks/useProfileQuery";
export { useProfileTheme } from "@/hooks/useProfileTheme";
export { usePushNotifications } from "@/hooks/usePushNotifications";
export { useRealtimeChat } from "@/hooks/useRealtimeChat";
export { useScreenshotProtection } from "@/hooks/useScreenshotProtection";
export { useScrollHide } from "@/hooks/useScrollHide";
export { useSupabaseTheme } from "@/hooks/useSupabaseTheme";
export { useTokens } from "@/hooks/useTokens";
export { useVideoChat } from "@/hooks/useVideoChat";
export { useWorldID } from "@/hooks/useWorldID";

// =======================
// SERVICES
// =======================
export { ContentModerationService } from "@/services/ContentModerationService";
export { PerformanceMonitoringService } from "@/services/PerformanceMonitoringService";
export { ProfileReportService } from "@/services/ProfileReportService";
export { PushNotificationService } from "@/services/PushNotificationService";
export { ReportService } from "@/services/ReportService";
// export { SecurityService } from "@/services/SecurityService"; // ⚠️ NOTA: Export no encontrado
export { SmartMatchingService } from "@/services/SmartMatchingService";
export { TokenAnalyticsService } from "@/services/TokenAnalyticsService";
export { postsService } from "@/services/postsService";

// =======================
// UTILS & LIB
// =======================
export { LazyComponents } from "@/utils/lazyComponents";
export { cn } from "@/lib/utils";
// ⚠️ NOTA: supabase se importa desde integrations, no desde lib
// export { supabase } from "@/lib/supabase";
export { useContentModeration } from "@/lib/ai/contentModeration";
export { useSmartMatching } from "@/lib/ai/smartMatching";
export { storage } from "@/lib/storage";
export { features } from "@/lib/features";
export { data } from "@/lib/data";
export { matching } from "@/lib/matching";
export { chat } from "@/lib/chat";
export { notifications } from "@/lib/notifications";
export { images } from "@/lib/images";
export { media } from "@/lib/media";
export { roles } from "@/lib/roles";
export { requests } from "@/lib/requests";
export { invitations } from "@/lib/invitations";
export { tokens } from "@/lib/tokens";
export { tokenPremium } from "@/lib/tokenPremium";
export { advancedFeatures } from "@/lib/advancedFeatures";
export { intelligentAutomation } from "@/lib/intelligentAutomation";
export { multimediaSecurity } from "@/lib/multimediaSecurity";
export { secureMediaService } from "@/lib/secureMediaService";
export { visualValidation } from "@/lib/visual-validation";
export { zodSchemas } from "@/lib/zod-schemas";
export { zodSchemasExtended } from "@/lib/zod-schemas-extended";
export { lifestyleInterests } from "@/lib/lifestyle-interests";
export { generateFilterDemoCards, type FilterDemoCard, type InfoCard } from "@/lib/infoCards";
export { coupleProfiles } from "@/lib/coupleProfiles";
export { coupleProfilesCompatibility } from "@/lib/coupleProfilesCompatibility";
export { distanceUtils } from "@/lib/distance-utils";
export { analyticsMetrics } from "@/lib/analytics-metrics";
export { backupSystem } from "@/lib/backup-system";
export { sessionStorage } from "@/lib/session-storage";
export { storageManager } from "@/lib/storage-manager";
export { redisCache } from "@/lib/redis-cache";
// =======================
// LIB - ADDITIONAL EXPORTS
// =======================
export { mainNavItems, premiumItems, settingsItems, mockUser } from "@/lib/data";
export { RequestsService } from "@/lib/requests";
export { Theme } from "@/hooks/useProfileTheme";
export { UserProfile } from "@/components/sidebar/UserProfile";
export { CollapsedUserProfile } from "@/components/sidebar/CollapsedUserProfile";
export { NavGroup } from "@/components/sidebar/NavGroup";
export { QuickActions } from "@/components/sidebar/QuickActions";
export { ProfileCard } from "@/components/profile/MainProfileCard";
// export { ThemeToggle } from "@/components/theme/ThemeToggle"; // No existe
// export { ReportDialog } from "@/components/reports/ReportDialog"; // No existe

// ⚠️ NOTA: Los siguientes módulos no existen - marcados para reporte
// export { performanceOptimization } from "@/lib/performance-optimization";
// export { premiumFeatures } from "@/lib/premium-features";
// export { profileAnalytics } from "@/lib/profile-analytics";
// export { profileCompatibility } from "@/lib/profile-compatibility";
// export { profileData } from "@/lib/profile-data";
// export { profileUtils } from "@/lib/profile-utils";
// export { profileValidation } from "@/lib/profile-validation";
// export { realTimeFeatures } from "@/lib/real-time-features";
// export { reportingSystem } from "@/lib/reporting-system";
// export { securityFeatures } from "@/lib/security-features";
// export { socialFeatures } from "@/lib/social-features";
// export { storiesData } from "@/lib/stories-data";
// export { superLikes } from "@/lib/super-likes";
// export { tokenSystem } from "@/lib/token-system";
// export { videoChat } from "@/lib/video-chat";
// export { worldidIntegration } from "@/lib/worldid-integration";

// =======================
// LUCIDE REACT ICONS
// =======================
export { 
  AlertTriangle,
  ArrowLeft, 
  ArrowRight, 
  BarChart3,
  Bell, 
  Bookmark,
  Brain,
  Calendar, 
  Camera, 
  Check, 
  CheckCircle,
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  Chrome,
  Clock,
  Crown,
  Download,
  Edit, 
  Eye, 
  EyeOff, 
  Filter, 
  Fingerprint,
  Gift,
  Globe,
  Heart,
  Home, 
  Info, 
  Loader,
  Loader2,
  Lock, 
  LogOut, 
  Mail, 
  MapPin, 
  Menu, 
  MessageCircle, 
  Moon, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Settings, 
  Shield,
  Smartphone,
  Sparkles,
  Star, 
  Sun, 
  Target,
  Trash2, 
  Upload, 
  User, 
  UserPlus,
  Users, 
  X,
  XCircle,
  Zap
} from "lucide-react";

// =======================
// PAGES
// =======================
export { default as About } from "@/pages/About";
export { default as Admin } from "@/pages/Admin";
export { default as Auth } from "@/pages/Auth";
export { default as Blog } from "@/pages/Blog";
export { default as Careers } from "@/pages/Careers";
export { default as Chat } from "@/pages/Chat";
export { default as ChatInfo } from "@/pages/ChatInfo";
export { default as Dashboard } from "@/pages/Dashboard";
export { default as Discover } from "@/pages/Discover";
export { default as EditProfileCouple } from "@/pages/EditProfileCouple";
export { default as EditProfileSingle } from "@/pages/EditProfileSingle";
export { default as Events } from "@/pages/Events";
export { default as FAQ } from "@/pages/FAQ";
export { default as Feed } from "@/pages/Feed";
export { default as Guidelines } from "@/pages/Guidelines";
export { default as Index } from "@/pages/Index";
export { default as Legal } from "@/pages/Legal";
export { default as Matches } from "@/pages/Matches";
export { default as News } from "@/pages/News";
export { default as NotFound } from "@/pages/NotFound";
export { default as Premium } from "@/pages/Premium";
export { default as Privacy } from "@/pages/Privacy";
export { default as ProfileCouple } from "@/pages/ProfileCouple";
export { default as ProfileSingle } from "@/pages/ProfileSingle";
export { default as Profiles } from "@/pages/Profiles";
export { default as Requests } from "@/pages/Requests";
export { default as Security } from "@/pages/Security";
export { default as Settings } from "@/pages/Settings";
export { default as Stories } from "@/pages/Stories";
export { default as Support } from "@/pages/Support";
export { default as Terms } from "@/pages/Terms";
export { default as Tokens } from "@/pages/Tokens";
export { default as TokensInfo } from "@/pages/TokensInfo";
// ⚠️ NOTA: Páginas no encontradas - marcadas para reporte
// export { default as Lifestyle } from "@/pages/Lifestyle";
// export { default as Login } from "@/pages/Login";
// export { default as Notifications } from "@/pages/Notifications";

// =======================
// LIB EXPORTS
// =======================
export { logger } from "@/lib/logger";
export { BiometricAuthService, type BiometricAuthResult } from "@/lib/multimediaSecurity";

// =======================
// INTEGRATIONS
// =======================
export { supabase } from "@/integrations/supabase/client";
export type * from "@/integrations/supabase/types";

// =======================
// DEMO & CONFIG
// =======================
export { AppFactory } from "@/demo/AppFactory";
export { DemoProvider } from "@/demo/DemoProvider";
export { RealProvider } from "@/demo/RealProvider";
export { demoData } from "@/demo/demoData";
export { demoProduction } from "@/config/demo-production";

// =======================
// STORIES TYPES & SERVICE
// =======================
export { StoryService } from "@/components/stories/StoryService";
export type * from "@/components/stories/StoryTypes";
