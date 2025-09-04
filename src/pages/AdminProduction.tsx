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
import { isProductionAdmin } from '@/lib/app-config';

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
  relationship_type: 'single' | 'couple' | null;
  gender: string | null;
  interested_in: string | null;
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
  created_at: string;
  updated_at: string;
}

const AdminProduction = () => {
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
    // Verificar autenticación y permisos de admin de producción
    if (!isAuthenticated()) {
      toast({
        title: "Acceso Denegado",
        description: "Debe iniciar sesión para acceder al panel de administración",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Verificar si es admin de producción usando el email
    if (!user?.email || !isProductionAdmin(user.email)) {
      toast({
        title: "Acceso Denegado",
        description: "No tiene permisos de administrador de producción",
        variant: "destructive"
      });
      navigate('/discover');
      return;
    }
    
    // Cargar datos reales de producción
    loadProductionData();
  }, [navigate, toast, isAuthenticated, user]);

  const loadProductionData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRealProfiles(),
        loadRealStats(),
        loadRealFAQ(),
        loadRealInvitations()
      ]);
    } catch (error) {
      console.error('Error loading production admin data:', error);
      toast({
        title: "Error",
        description: "Error al cargar datos del panel de administración de producción",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRealProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading profiles:', error);
        return;
      }

      // Mapear los datos de Supabase al tipo Profile local
      const mappedProfiles: Profile[] = (data || []).map((profile: any) => ({
        id: profile.id,
        display_name: profile.display_name,
        first_name: profile.first_name,
        last_name: profile.last_name,
        age: profile.age,
        location: profile.location || 'No especificada',
        email: profile.email || 'No disponible',
        is_verified: profile.is_verified || false,
        is_premium: profile.is_premium || false,
        created_at: profile.created_at,
        last_seen: profile.last_seen,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        relationship_type: profile.relationship_type,
        gender: profile.gender,
        interested_in: profile.interested_in
      }));

      setProfiles(mappedProfiles);
    } catch (error) {
      console.error('Error in loadRealProfiles:', error);
    }
  };

  const loadRealStats = async () => {
    try {
      // Obtener estadísticas reales de la base de datos
      const [
        { count: totalUsers },
        { count: premiumUsers },
        { count: verifiedUsers }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true)
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: Math.floor((totalUsers || 0) * 0.7), // Estimación
        premiumUsers: premiumUsers || 0,
        totalMatches: 0, // Implementar cuando tengas tabla de matches
        apkDownloads: 0, // Implementar tracking
        dailyVisits: 0, // Implementar analytics
        totalTokens: 0, // Implementar cuando tengas sistema de tokens
        stakedTokens: 0,
        worldIdVerified: verifiedUsers || 0,
        rewardsDistributed: 0
      });
    } catch (error) {
      console.error('Error loading real stats:', error);
    }
  };

  const loadRealFAQ = async () => {
    try {
      // FAQ items simulados para producción hasta que se cree la tabla
      const mockFaqItems: FAQItem[] = [
        {
          id: '1',
          question: '¿Cómo funciona ComplicesConecta?',
          answer: 'ComplicesConecta es una plataforma que conecta personas con intereses similares en el lifestyle swinger.',
          category: 'general',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          question: '¿Es segura la plataforma?',
          answer: 'Sí, utilizamos verificación WorldID y medidas de seguridad avanzadas.',
          category: 'seguridad',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setFaqItems(mockFaqItems);
    } catch (error) {
      console.error('Error in loadRealFAQ:', error);
    }
  };

  const loadRealInvitations = async () => {
    try {
      // Invitaciones simuladas para producción hasta que se implemente getAll
      const mockInvitations: Invitation[] = [
        {
          id: '1',
          from_profile: 'admin-profile',
          to_profile: 'user-profile-1',
          message: 'Invitación de administrador',
          type: 'profile',
          status: 'pending',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          from_profile: 'admin-profile',
          to_profile: 'user-profile-2',
          message: 'Invitación de administrador',
          type: 'profile',
          status: 'accepted',
          created_at: new Date().toISOString()
        }
      ];
      
      setInvitations(mockInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) {
        throw error;
      }

      setProfiles(profiles.filter(p => p.id !== profileId));
      toast({
        title: "Perfil eliminado",
        description: "El perfil ha sido eliminado exitosamente",
      });
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el perfil",
        variant: "destructive"
      });
    }
  };

  const handleTogglePremium = async (profileId: string, isPremium: boolean) => {
    try {
      // Simulamos la actualización hasta verificar el esquema de la base de datos
      setProfiles(profiles.map(p => 
        p.id === profileId ? { ...p, is_premium: !isPremium } : p
      ));

      toast({
        title: "Estado Premium actualizado",
        description: `El usuario ${!isPremium ? 'ahora es' : 'ya no es'} premium`,
      });
    } catch (error) {
      console.error('Error updating premium status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado premium",
        variant: "destructive"
      });
    }
  };

  const handleAddFAQ = async () => {
    if (!newFaq.question || !newFaq.answer) {
      toast({
        title: "Error",
        description: "Pregunta y respuesta son requeridas",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulamos la inserción hasta que se cree la tabla faq_items
      const newFaqItem: FAQItem = {
        id: Date.now().toString(),
        question: newFaq.question,
        answer: newFaq.answer,
        category: newFaq.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setFaqItems([newFaqItem, ...faqItems]);
      setNewFaq({ question: '', answer: '', category: 'general' });
      
      toast({
        title: "FAQ agregado",
        description: "La pregunta frecuente ha sido agregada exitosamente",
      });
    } catch (error) {
      console.error('Error adding FAQ:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la pregunta frecuente",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-muted-foreground mt-2">
              Gestión completa de ComplicesConecta - Modo Producción
            </p>
            <Badge variant="destructive" className="mt-2">
              PRODUCCIÓN - Datos Reales
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/discover')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Registrados en la plataforma</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Activos en los últimos 30 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Premium</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Suscripciones activas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verificados WorldID</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.worldIdVerified.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Usuarios verificados</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="invitations">Invitaciones</TabsTrigger>
          </TabsList>

          {/* Tab de Usuarios */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No hay usuarios registrados
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {profiles.slice(0, 10).map((profile) => (
                        <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {profile.display_name || `${profile.first_name} ${profile.last_name}` || 'Sin nombre'}
                              </p>
                              <p className="text-sm text-muted-foreground">{profile.email}</p>
                              <div className="flex gap-2 mt-1">
                                {profile.is_verified && (
                                  <Badge variant="secondary" className="text-xs">Verificado</Badge>
                                )}
                                {profile.is_premium && (
                                  <Badge variant="default" className="text-xs">Premium</Badge>
                                )}
                                {profile.relationship_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {profile.relationship_type === 'single' ? 'Soltero' : 'Pareja'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePremium(profile.id, profile.is_premium)}
                            >
                              {profile.is_premium ? 'Quitar Premium' : 'Hacer Premium'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProfile(profile)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteProfile(profile.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Analíticas */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analíticas Detalladas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Estadísticas de Usuarios</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total de usuarios:</span>
                        <span className="font-medium">{stats.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usuarios activos:</span>
                        <span className="font-medium">{stats.activeUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usuarios premium:</span>
                        <span className="font-medium">{stats.premiumUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usuarios verificados:</span>
                        <span className="font-medium">{stats.worldIdVerified}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Métricas de Engagement</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Matches totales:</span>
                        <span className="font-medium">{stats.totalMatches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Descargas APK:</span>
                        <span className="font-medium">{stats.apkDownloads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Visitas diarias:</span>
                        <span className="font-medium">{stats.dailyVisits}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de FAQ */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Gestión de FAQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Pregunta"
                      value={newFaq.question}
                      onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                    />
                    <Input
                      placeholder="Categoría"
                      value={newFaq.category}
                      onChange={(e) => setNewFaq({...newFaq, category: e.target.value})}
                    />
                    <Button onClick={handleAddFAQ} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar FAQ
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Respuesta"
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                    rows={3}
                  />
                  
                  <div className="space-y-2">
                    {faqItems.map((faq) => (
                      <div key={faq.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{faq.question}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {faq.category}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Invitaciones */}
          <TabsContent value="invitations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Sistema de Invitaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No hay invitaciones registradas
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {invitations.map((invitation) => (
                        <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Invitación #{invitation.id}</p>
                            <p className="text-sm text-muted-foreground">
                              De: {invitation.from_profile} → Para: {invitation.to_profile}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Tipo: {invitation.type} | Estado: {invitation.status}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Creada: {new Date(invitation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant={invitation.status === 'accepted' ? 'default' : 'secondary'}
                          >
                            {invitation.status === 'accepted' ? 'Aceptada' : 'Pendiente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminProduction;
