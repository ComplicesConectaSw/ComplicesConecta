import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/features/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import AdminNav from '@/components/AdminNav';
import { safeGetItem } from '@/utils/safeLocalStorage';
import {
  Users,
  Shield,
  BarChart3,
  Plus,
  Trash2,
  Settings,
  Crown
} from 'lucide-react';

// Types
interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  is_verified?: boolean;
  is_premium?: boolean;
  created_at: string;
  last_seen?: string;
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

interface Invitation {
  id: string;
  from_profile: string;
  to_profile: string;
  type: 'profile' | 'gallery' | 'chat';
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'revoked';
  created_at: string;
  decided_at?: string;
}

interface AuditReport {
  summary: {
    totalFiles: number;
    duplicates: number;
    brokenImports: number;
    emptyFolders: number;
    largeFiles: number;
  };
  details: {
    duplicateFiles: string[];
    brokenImports: string[];
    emptyFolders: string[];
    largeFiles: Array<{ path: string; size: string }>;
  };
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
  const { isAdmin, isAuthenticated, user: _user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [_profiles, setProfiles] = useState<Profile[]>([]);
  const [_stats, setStats] = useState<AppStats>({
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
  const [_faqs, _setFaqs] = useState<FAQItem[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [_loading, setLoading] = useState(true);
  const [_selectedProfile, _setSelectedProfile] = useState<Profile | null>(null);
  const [_error, _setError] = useState<string | null>(null);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general' });
  const [auditReport, setAuditReport] = useState<any>(null);

  useEffect(() => {
    // Check for demo authentication first
    const demoAuth = safeGetItem<string>('demo_authenticated', { validate: true, defaultValue: 'false' });
    const demoUser = safeGetItem<unknown>('demo_user', { validate: false, defaultValue: null });
    
    if (demoAuth === 'true' && demoUser) {
      // Parse user safely
      let user: { accountType?: string; role?: string } | null = null;
      try {
        if (typeof demoUser === 'string') {
          user = JSON.parse(demoUser);
        } else if (typeof demoUser === 'object' && demoUser !== null) {
          user = demoUser as { accountType?: string; role?: string };
        }
      } catch (error) {
        logger.error('Error parsing demo user:', { error: String(error) });
        user = null;
      }
      
      if (user && (user.accountType === 'admin' || user.role === 'admin')) {
        // Redirect admin users to production admin panel
        navigate('/admin-production');
        return;
      } else if (user) {
        toast({
          title: "Acceso Denegado",
          description: "No tienes permisos de administrador",
          variant: "destructive"
        });
        navigate('/discover');
        return;
      }
    }
    
    // Check for real authentication
    if (!isAuthenticated()) {
      navigate('/auth');
      return;
    }
    
    // Check admin permissions for real users
    if (!isAdmin()) {
      toast({
        title: "Acceso Denegado",
        description: "No tienes permisos de administrador",
        variant: "destructive"
      });
      navigate('/discover');
      return;
    }
    
    // Load admin data for authenticated admin users
    loadAdminData();
  }, [navigate, toast, isAuthenticated, isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProfiles(),
        _loadStats(),
        _loadFAQs(),
        _loadInvitations()
      ]);
    } catch (error) {
      logger.error('Error loading admin data:', { error: String(error) });
      toast({
        title: "Error",
        description: "Error al cargar datos del panel de administracin",
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
          email: 'demo@complicesconecta.com',
          is_verified: true,
          is_premium: false,
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          avatar_url: undefined,
          bio: 'Perfil de demostracin'
        }
      ];
      
      setProfiles(mockProfiles);
    } catch (_error) {
      logger.error('Error loading profiles:', { error: String(_error) });
    } finally {
      setLoading(false);
    }
  };

  const _loadStats = async () => {
    try {
      // Mock stats for now - replace with actual queries
      const mockStats: AppStats = {
        totalUsers: 1250,
        activeUsers: 890,
        premiumUsers: 156,
        totalMatches: 3420,
        apkDownloads: 2100,
        dailyVisits: 450,
        totalTokens: 1000000,
        stakedTokens: 250000,
        worldIdVerified: 89,
        rewardsDistributed: 15000
      };
      
      setStats(mockStats);
    } catch (_error) {
      logger.error('Error loading stats:', { error: String(_error) });
    } finally {
      setLoading(false);
    }
  };

  const _loadFAQs = async () => {
    try {
      // Mock FAQs for now
      const mockFAQs: FAQItem[] = [
        {
          id: '1',
          question: 'Cmo funciona la verificacin?',
          answer: 'La verificacin se realiza mediante WorldID y documentos oficiales.',
          category: 'general',
          priority: 1,
          created_at: new Date().toISOString()
        }
      ];
      _setFaqs(mockFAQs);
    } catch (_error) {
      logger.error('Error loading FAQs:', { error: String(_error) });
    }
  };

  const _loadInvitations = async () => {
    try {
      // Mock invitations for now
      const mockInvitations: Invitation[] = [
        {
          id: '1',
          from_profile: 'user1@example.com',
          to_profile: 'user2@example.com',
          type: 'profile',
          message: 'Me gustara conectar contigo',
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ];
      setInvitations(mockInvitations);
    } catch (_error) {
      logger.error('Error loading invitations:', { error: String(_error) });
    }
  };

  const _handleDeleteProfile = async (profileId: string) => {
    try {
      if (!supabase) {
        logger.error('Supabase no est disponible');
        toast({
          title: "Error",
          description: "Supabase no est disponible",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(_profiles.filter((p: any) => p.id !== profileId));
      toast({
        title: "Perfil Eliminado",
        description: "El perfil ha sido eliminado exitosamente"
      });
    } catch (_error) {
      logger.error('Error deleting profile:', { error: String(_error) });
      toast({
        title: "Error",
        description: "Error al eliminar el perfil",
        variant: "destructive"
      });
    }
  };

  const _handleToggleVerification = async (profileId: string, currentStatus: boolean) => {
    try {
      if (!supabase) {
        logger.error('Supabase no est disponible');
        toast({
          title: "Error",
          description: "Supabase no est disponible",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          bio: `${_profiles.find((p) => p.id === profileId)?.bio || ''} [verified:${!currentStatus}]`
        })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(_profiles.map(p => 
        p.id === profileId ? { ...p, is_verified: !currentStatus } : p
      ));

      toast({
        title: currentStatus ? "Verificacin Removida" : "Perfil Verificado",
        description: `El perfil ha sido ${currentStatus ? 'desverificado' : 'verificado'} exitosamente`
      });
    } catch (_error) {
      logger.error('Error updating verification:', { error: String(_error) });
      toast({
        title: "Error",
        description: "Error al actualizar verificacin",
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
        priority: _faqs.length + 1,
        created_at: new Date().toISOString()
      };

      _setFaqs([..._faqs, faqItem]);
      setNewFaq({ question: '', answer: '', category: 'general' });

      toast({
        title: "FAQ Agregado",
        description: "La pregunta frecuente ha sido agregada exitosamente"
      });
    } catch (_error) {
      logger.error('Error adding FAQ:', { error: String(_error) });
      toast({
        title: "Error",
        description: "Error al agregar FAQ",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFAQ = (faqId: string) => {
    const updatedFaqs = _faqs.filter((faq: any) => faq.id !== faqId);
    _setFaqs(updatedFaqs);
    toast({
      title: "FAQ Eliminado",
      description: "La pregunta frecuente ha sido eliminada"
    });
  };

  const _handleRevokeInvitation = async (invitationId: string) => {
    try {
      setInvitations(invitations.map(inv => 
        inv.id === invitationId ? { ...inv, status: 'revoked' as const } : inv
      ));
      toast({
        title: "Invitacin Revocada",
        description: "La invitacin ha sido revocada exitosamente"
      });
    } catch (_error) {
      logger.error('Error revoking invitation:', { error: String(_error) });
    }
  };

  const _generateAuditReport = async () => {
    try {
      const mockReport: AuditReport = {
        summary: {
          totalFiles: 245,
          duplicates: 3,
          brokenImports: 1,
          emptyFolders: 2,
          largeFiles: 5
        },
        details: {
          duplicateFiles: ['component1.tsx', 'component2.tsx'],
          brokenImports: ['missing-import.ts'],
          emptyFolders: ['empty-folder1', 'empty-folder2'],
          largeFiles: [
            { path: 'large-file1.js', size: '2.5MB' },
            { path: 'large-file2.ts', size: '1.8MB' }
          ]
        }
      };
      setAuditReport(mockReport);
    } catch (_error) {
      logger.error('Error generating audit report:', { error: String(_error) });
    }
  };

  const _downloadAuditReport = () => {
    if (!auditReport) return;
    
    const dataStr = JSON.stringify(auditReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a') as HTMLAnchorElement;
    link.href = url;
    link.download = 'audit-report.json';
    link.click();
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="w-16 h-16 mx-auto text-red-500" />
              <h2 className="text-2xl font-bold text-foreground">Acceso Denegado</h2>
              <p className="text-muted-foreground">
                No tienes permisos para acceder al panel de administracin.
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (_loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Settings className="w-16 h-16 mx-auto text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Cargando...</h2>
              <p className="text-muted-foreground">
                Por favor, espera un momento mientras se cargan los datos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <AdminNav userRole="admin" />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Administracin</h1>
          <p className="text-muted-foreground">Gestiona usuarios, estadsticas y configuraciones del sistema</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="invitations">Invitaciones</TabsTrigger>
            <TabsTrigger value="stats">Estadsticas</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">{_stats.totalUsers}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{_stats.activeUsers}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Premium</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-600">{_stats.premiumUsers}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{_stats.totalMatches}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestin de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {_profiles.map((profile: any) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{profile.display_name || profile.first_name || 'Usuario'}</h3>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={profile.is_verified ? "default" : "secondary"}>
                          {profile.is_verified ? 'Verificado' : 'Sin verificar'}
                        </Badge>
                        {profile.is_premium && (
                          <Badge variant="outline">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Gestin de Invitaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">De: {invitation.from_profile} ? Para: {invitation.to_profile}</h3>
                        <p className="text-sm text-muted-foreground">{invitation.message}</p>
                      </div>
                      <Badge variant={invitation.status === 'pending' ? 'secondary' : 'default'}>
                        {invitation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Estadsticas Detalladas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Tokens</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total en circulacin:</span>
                        <span className="font-bold">{_stats.totalTokens.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total bloqueado:</span>
                        <span className="font-bold">{_stats.stakedTokens.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Verificacin</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>WorldID verificados:</span>
                        <span className="font-bold">{_stats.worldIdVerified.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recompensas distribuidas:</span>
                        <span className="font-bold">{_stats.rewardsDistributed.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Gestin de FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Pregunta"
                      value={newFaq.question}
                      onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                    />
                    <Input
                      placeholder="Categora"
                      value={newFaq.category}
                      onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                    />
                  </div>
                  <Textarea
                    placeholder="Respuesta"
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  />
                  <Button onClick={handleAddFAQ}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar FAQ
                  </Button>
                </div>

                <div className="space-y-4">
                  {_faqs.map((faq: any) => (
                    <div key={faq.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{faq.question}</h3>
                            <Badge variant="outline">{faq.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

