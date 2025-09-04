import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BarChart3, 
  Download, 
  MessageSquare, 
  Settings, 
  Shield, 
  Trash2, 
  Edit, 
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Crown,
  Activity,
  HelpCircle,
  ArrowLeft,
  UserPlus,
  FileText,
  Search
} from 'lucide-react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { invitationService, type Invitation } from '@/lib/invitations';

interface Profile {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  location: string | null;
  email: string;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
  last_seen: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface AppStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalMatches: number;
  apkDownloads: number;
  dailyVisits: number;
  totalTokens: number;
  stakedTokens: number;
  worldIdVerified: number;
  rewardsDistributed: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: number;
  created_at: string;
}

const Admin = () => {
  const { isAdmin, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState<AppStats>({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalMatches: 0,
    apkDownloads: 0,
    dailyVisits: 0,
    totalTokens: 0,
    stakedTokens: 0,
    worldIdVerified: 0,
    rewardsDistributed: 0
  });
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general' });
  const [auditReport, setAuditReport] = useState<any>(null);

  useEffect(() => {
    // Check for demo authentication first
    const demoAuth = localStorage.getItem('demo_authenticated');
    const demoUser = localStorage.getItem('demo_user');
    
    if (demoAuth === 'true' && demoUser) {
      const user = JSON.parse(demoUser);
      if (user.accountType === 'admin') {
        loadAdminData();
        return;
      } else {
        toast({
          title: "Acceso Denegado",
          description: "No tienes permisos de administrador",
          variant: "destructive"
        });
        navigate('/discover');
        return;
      }
    }
    
    // If not demo mode, redirect to auth
    navigate('/auth');
  }, [navigate, toast]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProfiles(),
        loadStats(),
        loadFAQ(),
        loadInvitations()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Error al cargar datos del panel de administración",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      // Use mock data for demo mode to avoid infinite loops
      const mockProfiles: Profile[] = [
        {
          id: 'demo-1',
          display_name: 'Usuario Demo',
          first_name: 'Usuario',
          last_name: 'Demo',
          age: 25,
          location: 'Ciudad Demo',
          email: 'demo@complicesconecta.com',
          is_verified: true,
          is_premium: false,
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          avatar_url: null,
          bio: 'Perfil de demostración'
        }
      ];
      
      setProfiles(mockProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Simulated stats - replace with real queries
      const mockStats: AppStats = {
        totalUsers: 1247,
        activeUsers: 342,
        premiumUsers: 89,
        totalMatches: 2156,
        apkDownloads: 3421,
        dailyVisits: 567,
        totalTokens: 125000,
        stakedTokens: 45000,
        worldIdVerified: 89,
        rewardsDistributed: 12500
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadFAQ = async () => {
    try {
      // Simulated FAQ data - replace with real queries
      const mockFAQ: FAQItem[] = [
        {
          id: '1',
          question: '¿Cómo verificar mi perfil?',
          answer: 'Para verificar tu perfil, sube una foto clara de tu identificación oficial.',
          category: 'verificacion',
          priority: 1,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          question: 'Problemas con el chat',
          answer: 'Si tienes problemas con el chat, verifica tu conexión a internet y reinicia la aplicación.',
          category: 'tecnico',
          priority: 2,
          created_at: new Date().toISOString()
        }
      ];
      setFaqItems(mockFAQ);
    } catch (error) {
      console.error('Error loading FAQ:', error);
    }
  };

  const loadInvitations = async () => {
    try {
      // Load all invitations for admin review
      const allInvitations: Invitation[] = [
        {
          id: '1',
          from_profile: '2',
          to_profile: '1',
          message: 'Hola, me encantaría conocerte mejor.',
          type: 'gallery',
          status: 'pending',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          from_profile: '3',
          to_profile: '1',
          message: '¿Te gustaría chatear en privado?',
          type: 'chat',
          status: 'accepted',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          decided_at: new Date(Date.now() - 1800000).toISOString(),
        }
      ];
      setInvitations(allInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('¿Estás seguro de eliminar este perfil?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(profiles.filter(p => p.id !== profileId));
      toast({
        title: "Perfil Eliminado",
        description: "El perfil ha sido eliminado exitosamente"
      });
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el perfil",
        variant: "destructive"
      });
    }
  };

  const handleToggleVerification = async (profileId: string, currentStatus: boolean) => {
    try {
      // Note: Using a custom field for verification status since is_verified might not exist in schema
      const { error } = await supabase
        .from('profiles')
        .update({ 
          // Use existing field or create custom metadata
          user_preferences: { verified: !currentStatus }
        })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(profiles.map(p => 
        p.id === profileId ? { ...p, is_verified: !currentStatus } : p
      ));

      toast({
        title: currentStatus ? "Verificación Removida" : "Perfil Verificado",
        description: `El perfil ha sido ${currentStatus ? 'desverificado' : 'verificado'} exitosamente`
      });
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Error al actualizar verificación",
        variant: "destructive"
      });
    }
  };

  const handleAddFAQ = async () => {
    if (!newFaq.question || !newFaq.answer) {
      toast({
        title: "Campos Requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    try {
      const faqItem: FAQItem = {
        id: Date.now().toString(),
        ...newFaq,
        priority: faqItems.length + 1,
        created_at: new Date().toISOString()
      };

      setFaqItems([...faqItems, faqItem]);
      setNewFaq({ question: '', answer: '', category: 'general' });

      toast({
        title: "FAQ Agregado",
        description: "La pregunta frecuente ha sido agregada exitosamente"
      });
    } catch (error) {
      console.error('Error adding FAQ:', error);
      toast({
        title: "Error",
        description: "Error al agregar FAQ",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFAQ = (faqId: string) => {
    setFaqItems(faqItems.filter(f => f.id !== faqId));
    toast({
      title: "FAQ Eliminado",
      description: "La pregunta frecuente ha sido eliminada"
    });
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm('¿Estás seguro de revocar esta invitación?')) return;

    try {
      setInvitations(invitations.map(inv => 
        inv.id === invitationId ? { ...inv, status: 'revoked' as const } : inv
      ));
      
      toast({
        title: "Invitación Revocada",
        description: "La invitación ha sido revocada exitosamente"
      });
    } catch (error) {
      console.error('Error revoking invitation:', error);
      toast({
        title: "Error",
        description: "Error al revocar la invitación",
        variant: "destructive"
      });
    }
  };

  const generateAuditReport = async () => {
    try {
      // Simulated audit report generation
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalFiles: 1247,
          duplicates: 12,
          brokenImports: 3,
          emptyFolders: 2,
          largeFiles: 5
        },
        details: {
          duplicates: [
            { file1: 'src/assets/profile-1.jpg', file2: 'src/assets/people/profile-1.jpg', size: '2.3MB' },
            { file1: 'src/components/Button.tsx', file2: 'src/components/ui/Button.tsx', size: '1.2KB' }
          ],
          brokenImports: [
            { file: 'src/pages/Profile.tsx', line: 15, import: './NonExistentComponent' }
          ],
          largeFiles: [
            { file: 'src/assets/hero-bg.jpg', size: '15.2MB' }
          ]
        }
      };
      
      setAuditReport(report);
      
      toast({
        title: "Reporte Generado",
        description: "El reporte de auditoría ha sido generado exitosamente"
      });
    } catch (error) {
      console.error('Error generating audit report:', error);
      toast({
        title: "Error",
        description: "Error al generar el reporte de auditoría",
        variant: "destructive"
      });
    }
  };

  const downloadAuditReport = () => {
    if (!auditReport) return;
    
    const dataStr = JSON.stringify(auditReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="bg-card/80 backdrop-blur-sm border-primary/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-8 h-8 text-primary" />
                Panel de Administración
              </h1>
              <p className="text-muted-foreground">Gestión completa de ComplicesConecta</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Crown className="w-4 h-4 mr-1" />
            Administrador
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Usuarios Totales</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Usuarios Activos</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Premium</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.premiumUsers}</p>
              </div>
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Matches</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalMatches}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          {/* Tokens CMPX */}
          <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Tokens CMPX</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalTokens || 125000}</p>
                <p className="text-xs text-orange-300">En circulación</p>
              </div>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">₡</div>
            </div>
          </Card>

          {/* Tokens en Staking */}
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">En Staking</p>
                <p className="text-3xl font-bold text-cyan-600">{stats.stakedTokens || 45000}</p>
                <p className="text-xs text-cyan-300">GTK bloqueados</p>
              </div>
              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">🔒</div>
            </div>
          </Card>

          {/* World ID Verificados */}
          <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">World ID</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.worldIdVerified || 89}</p>
                <p className="text-xs text-emerald-300">Verificados</p>
              </div>
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">🌍</div>
            </div>
          </Card>

          {/* Recompensas Distribuidas */}
          <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Recompensas</p>
                <p className="text-3xl font-bold text-pink-600">{stats.rewardsDistributed || 12500}</p>
                <p className="text-xs text-pink-300">CMPX distribuidos</p>
              </div>
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">🎁</div>
            </div>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/10 cursor-pointer hover:bg-card/90 transition-colors" onClick={() => {
            const link = document.createElement('a');
            link.href = '/app-release.apk';
            link.download = 'app-release.apk';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Descargar APK</p>
                  <p className="text-lg font-bold text-blue-400">v1.3.3 (beta)</p>
                  <p className="text-xs text-white/80">Haz clic para descargar</p>
                </div>
                <Download className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Visitas Hoy</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.dailyVisits}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profiles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-card/80 backdrop-blur-sm">
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Perfiles
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">₡</div>
              Tokens
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Invitaciones
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Auditoría
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          {/* Tokens Management */}
          <TabsContent value="tokens">
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">₡</div>
                    Métricas del Sistema de Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* CMPX Tokens */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-orange-400">Tokens CMPX</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total en circulación:</span>
                          <span className="font-bold text-orange-400">{stats.totalTokens.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Distribuidos hoy:</span>
                          <span className="font-bold">2,450</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Por referidos:</span>
                          <span className="font-bold text-green-400">8,750</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Por verificación:</span>
                          <span className="font-bold text-blue-400">3,750</span>
                        </div>
                      </div>
                    </div>

                    {/* GTK Staking */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-cyan-400">GTK Staking</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total bloqueado:</span>
                          <span className="font-bold text-cyan-400">{stats.stakedTokens.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>APY promedio:</span>
                          <span className="font-bold text-green-400">12.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Usuarios staking:</span>
                          <span className="font-bold">156</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recompensas pagadas:</span>
                          <span className="font-bold text-purple-400">1,250</span>
                        </div>
                      </div>
                    </div>

                    {/* World ID */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-emerald-400">World ID</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Verificados:</span>
                          <span className="font-bold text-emerald-400">{stats.worldIdVerified}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recompensa por verificación:</span>
                          <span className="font-bold text-orange-400">100 CMPX</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tasa de verificación:</span>
                          <span className="font-bold text-green-400">7.1%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Verificaciones hoy:</span>
                          <span className="font-bold">12</span>
                        </div>
                      </div>
                    </div>

                    {/* Distribución */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-pink-400">Distribución</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total distribuido:</span>
                          <span className="font-bold text-pink-400">{stats.rewardsDistributed.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>% del supply:</span>
                          <span className="font-bold text-blue-400">10%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Usuarios con tokens:</span>
                          <span className="font-bold text-green-400">892</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Promedio por usuario:</span>
                          <span className="font-bold">140 CMPX</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Token Distribution Chart Placeholder */}
                  <div className="mt-8 p-6 border border-primary/10 rounded-lg bg-background/30">
                    <h3 className="text-lg font-semibold mb-4">Distribución de Tokens por Categoría</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <div className="text-2xl font-bold text-orange-400">40%</div>
                        <div className="text-sm text-orange-300">Referidos</div>
                      </div>
                      <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <div className="text-2xl font-bold text-emerald-400">30%</div>
                        <div className="text-sm text-emerald-300">World ID</div>
                      </div>
                      <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <div className="text-2xl font-bold text-purple-400">20%</div>
                        <div className="text-sm text-purple-300">Premium</div>
                      </div>
                      <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-400">10%</div>
                        <div className="text-sm text-blue-300">Eventos</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profiles Management */}
          <TabsContent value="profiles">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestión de Perfiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border border-primary/10 rounded-lg bg-background/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                          {profile.display_name?.charAt(0) || profile.first_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{profile.display_name || profile.first_name || 'Usuario'}</h3>
                          <p className="text-sm text-gray-300">{profile.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={profile.is_verified ? "default" : "secondary"}>
                              {profile.is_verified ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                              {profile.is_verified ? 'Verificado' : 'Sin verificar'}
                            </Badge>
                            {profile.is_premium && (
                              <Badge variant="outline" className="border-accent text-accent">
                                <Crown className="w-3 h-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleVerification(profile.id, profile.is_verified)}
                        >
                          {profile.is_verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProfile(profile)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProfile(profile.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invitations Management */}
          <TabsContent value="invitations">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Gestión de Invitaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border border-primary/10 rounded-lg bg-background/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">De: {invitation.from_profile} → Para: {invitation.to_profile}</h3>
                          <Badge variant={invitation.status === 'pending' ? 'secondary' : invitation.status === 'accepted' ? 'default' : 'destructive'}>
                            {invitation.status === 'pending' ? 'Pendiente' : invitation.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                          </Badge>
                          <Badge variant="outline">
                            {invitation.type === 'gallery' ? 'Galería' : invitation.type === 'chat' ? 'Chat' : 'Perfil'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-1">{invitation.message}</p>
                        <p className="text-xs text-gray-400">Creada: {new Date(invitation.created_at).toLocaleString()}</p>
                        {invitation.decided_at && (
                          <p className="text-xs text-gray-400">Decidida: {new Date(invitation.decided_at).toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {invitation.status !== 'revoked' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeInvitation(invitation.id)}
                          >
                            <XCircle className="w-4 h-4" />
                            Revocar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics */}
          <TabsContent value="stats">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estadísticas Detalladas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Usuarios</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Registros hoy:</span>
                        <span className="font-bold">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Registros esta semana:</span>
                        <span className="font-bold">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tasa de retención:</span>
                        <span className="font-bold text-green-600">78%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Actividad</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Matches hoy:</span>
                        <span className="font-bold">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mensajes enviados:</span>
                        <span className="font-bold">1,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tiempo promedio en app:</span>
                        <span className="font-bold">24 min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Report */}
          <TabsContent value="audit">
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Auditoría del Repositorio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button onClick={generateAuditReport} className="flex-1">
                      <Search className="w-4 h-4 mr-2" />
                      Generar Reporte de Auditoría
                    </Button>
                    {auditReport && (
                      <Button onClick={downloadAuditReport} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar JSON
                      </Button>
                    )}
                  </div>
                  
                  {auditReport && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{auditReport.summary.totalFiles}</p>
                            <p className="text-sm text-muted-foreground">Archivos Total</p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{auditReport.summary.duplicates}</p>
                            <p className="text-sm text-muted-foreground">Duplicados</p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{auditReport.summary.brokenImports}</p>
                            <p className="text-sm text-muted-foreground">Imports Rotos</p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-600">{auditReport.summary.emptyFolders}</p>
                            <p className="text-sm text-muted-foreground">Carpetas Vacías</p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{auditReport.summary.largeFiles}</p>
                            <p className="text-sm text-muted-foreground">Archivos Grandes</p>
                          </div>
                        </Card>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2 text-foreground">Archivos Duplicados</h3>
                          <div className="space-y-2">
                            {auditReport.details.duplicates.map((dup: any, index: number) => (
                              <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-800">
                                <p className="text-gray-800"><strong>Archivo 1:</strong> {dup.file1}</p>
                                <p className="text-gray-800"><strong>Archivo 2:</strong> {dup.file2}</p>
                                <p className="text-gray-800"><strong>Tamaño:</strong> {dup.size}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-2 text-foreground">Imports Rotos</h3>
                          <div className="space-y-2">
                            {auditReport.details.brokenImports.map((broken: any, index: number) => (
                              <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-gray-800">
                                <p className="text-gray-800"><strong>Archivo:</strong> {broken.file}</p>
                                <p className="text-gray-800"><strong>Línea:</strong> {broken.line}</p>
                                <p className="text-gray-800"><strong>Import:</strong> {broken.import}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAQ Management */}
          <TabsContent value="faq">
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Agregar Nueva FAQ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Pregunta</label>
                    <Input
                      value={newFaq.question}
                      onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                      placeholder="¿Cuál es tu pregunta?"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Respuesta</label>
                    <Textarea
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                      placeholder="Escribe la respuesta detallada..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                      value={newFaq.category}
                      onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                      className="w-full p-2 border border-input rounded-md bg-background"
                      title="Seleccionar categoría de FAQ"
                    >
                      <option value="general">General</option>
                      <option value="verificacion">Verificación</option>
                      <option value="tecnico">Técnico</option>
                      <option value="premium">Premium</option>
                      <option value="seguridad">Seguridad</option>
                    </select>
                  </div>
                  <Button onClick={handleAddFAQ} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar FAQ
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    FAQ Existentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqItems.map((faq) => (
                      <div key={faq.id} className="p-4 border border-primary/10 rounded-lg bg-background/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{faq.question}</h3>
                              <Badge variant="outline">{faq.category}</Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">{faq.answer}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteFAQ(faq.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Chat Configuration */}
          <TabsContent value="chat">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Configuración del Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Límite de mensajes por día (usuarios gratuitos)</label>
                      <Input type="number" defaultValue="50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Límite de mensajes por día (usuarios premium)</label>
                      <Input type="number" defaultValue="unlimited" disabled />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Palabras prohibidas (separadas por comas)</label>
                    <Textarea 
                      placeholder="palabra1, palabra2, palabra3..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Moderación automática activada</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Notificaciones push activadas</span>
                    </label>
                  </div>
                  
                  <Button className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Guardar Configuración
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
