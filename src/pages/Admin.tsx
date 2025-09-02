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
  ArrowLeft
} from 'lucide-react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

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
  const { isAdminSync, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState<AppStats>({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalMatches: 0,
    apkDownloads: 0,
    dailyVisits: 0
  });
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general' });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth');
      return;
    }
    
    if (!isAdminSync()) {
      toast({
        title: "Acceso Denegado",
        description: "No tienes permisos de administrador",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    loadAdminData();
  }, [isAuthenticated, isAdminSync]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProfiles(),
        loadStats(),
        loadFAQ()
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match Profile interface
      const transformedProfiles = (data || []).map((profile: any) => ({
        id: profile.id,
        display_name: profile.display_name ?? profile.first_name ?? 'Usuario',
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        age: profile.age ?? null,
        location: profile.location ?? 'No especificado',
        email: profile.email ?? `${profile.id}@complicesconecta.com`,
        is_verified: profile.is_verified ?? false,
        is_premium: profile.is_premium ?? false,
        created_at: profile.created_at,
        last_seen: profile.last_seen ?? profile.updated_at ?? profile.created_at,
        avatar_url: profile.avatar_url ?? null,
        bio: profile.bio ?? ''
      }));
      
      setProfiles(transformedProfiles);
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
        dailyVisits: 567
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuarios Totales</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Premium</p>
                  <p className="text-2xl font-bold text-accent">{stats.premiumUsers}</p>
                </div>
                <Crown className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Matches</p>
                  <p className="text-2xl font-bold text-secondary-foreground">{stats.totalMatches}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-secondary-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Descargas APK</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.apkDownloads}</p>
                </div>
                <Download className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Visitas Hoy</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.dailyVisits}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profiles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/80 backdrop-blur-sm">
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Perfiles
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Estadísticas
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
                          <h3 className="font-semibold text-foreground">{profile.display_name || profile.first_name || 'Usuario'}</h3>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
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
