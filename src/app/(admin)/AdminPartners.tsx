import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/Modal';
import { 
  Plus, 
  MapPin, 
  CheckCircle, 
  Star, 
  Users, 
  Calendar,
  Image as ImageIcon,
  Shield,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';
import AdminNav from '@/components/AdminNav';
import { processClubFlyerImageServer } from '@/features/clubs/clubFlyerImageProcessing';
import type { Database } from '@/types/supabase-generated';

type ClubRow = Database['public']['Tables']['clubs']['Row'];
type ClubVerificationRow = Database['public']['Tables']['club_verifications']['Row'];
type ClubFlyerRow = Database['public']['Tables']['club_flyers']['Row'];

interface Club extends ClubRow {}

interface ClubVerification extends Omit<ClubVerificationRow, 'documents'> {
  documents?: Database['public']['Tables']['club_verifications']['Row']['documents'] | null;
}

interface ClubFlyer extends ClubFlyerRow {}

const AdminPartners = () => {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [verifications, setVerifications] = useState<ClubVerification[]>([]);
  const [flyers, setFlyers] = useState<ClubFlyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showClubDialog, setShowClubDialog] = useState(false);
  const [showFlyerDialog, setShowFlyerDialog] = useState(false);

  // Formulario club
  const [clubForm, setClubForm] = useState<Partial<Club>>({
    name: '',
    slug: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'México',
    latitude: 0,
    longitude: 0,
    phone: '',
    email: '',
    website: '',
    check_in_radius_meters: 50,
    is_active: true,
    is_featured: false,
  });

  // Formulario flyer
  const [flyerForm, setFlyerForm] = useState<Partial<ClubFlyer>>({
    title: '',
    description: '',
    image_url: '',
    event_date: '',
    event_end_date: '',
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  const loadData = async () => {
    if (!supabase) {
      toast({
        title: 'Error',
        description: 'No se pudo conectar a la base de datos',
        variant: 'destructive',
      });
      return;
    }
    try {
      setLoading(true);
      await Promise.all([loadClubs(), loadVerifications(), loadFlyers()]);
    } catch (error) {
      logger.error('Error cargando datos:', { error });
    } finally {
      setLoading(false);
    }
  };

  const loadClubs = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setClubs(data || []);
  };

  const loadVerifications = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('club_verifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setVerifications(data || []);
  };

  const loadFlyers = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('club_flyers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setFlyers(data || []);
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateClub = async () => {
    if (!supabase) {
      toast({
        title: 'Error',
        description: 'No se pudo conectar a la base de datos',
        variant: 'destructive',
      });
      return;
    }
    try {
      if (!clubForm.name || !clubForm.address || !clubForm.city) {
        toast({
          title: 'Error',
          description: 'Completa los campos requeridos',
          variant: 'destructive',
        });
        return;
      }

      const slug = clubForm.slug || generateSlug(clubForm.name);

      const { data, error } = await supabase
        .from('clubs')
        .insert({
          name: clubForm.name!,
          slug,
          address: clubForm.address!,
          city: clubForm.city!,
          description: clubForm.description || null,
          state: clubForm.state || null,
          country: clubForm.country || 'México',
          latitude: clubForm.latitude || 0,
          longitude: clubForm.longitude || 0,
          phone: clubForm.phone || null,
          email: clubForm.email || null,
          website: clubForm.website || null,
          check_in_radius_meters: clubForm.check_in_radius_meters || 50,
          is_active: clubForm.is_active ?? true,
          is_featured: clubForm.is_featured ?? false,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Club creado',
        description: `Club ${data.name} creado exitosamente`,
      });

      setShowClubDialog(false);
      setClubForm({
        name: '',
        slug: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: 'México',
        latitude: 0,
        longitude: 0,
        phone: '',
        email: '',
        website: '',
        check_in_radius_meters: 50,
        is_active: true,
        is_featured: false,
      });
      loadClubs();
    } catch (error: any) {
      logger.error('Error creando club:', { error });
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el club',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyClub = async (clubId: string, status: 'approved' | 'rejected') => {
    if (!supabase || !user) {
      toast({
        title: 'Error',
        description: 'No se pudo conectar a la base de datos o no hay usuario',
        variant: 'destructive',
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('club_verifications')
        .insert({
          club_id: clubId,
          verified_by: user.id,
          verification_type: 'admin',
          status,
          verified_at: status === 'approved' ? new Date().toISOString() : null,
        });

      if (error) throw error;

      if (status === 'approved' && supabase) {
        const { error: updateError } = await supabase
          .from('clubs')
          .update({
            verified_at: new Date().toISOString(),
          })
          .eq('id', clubId);

        if (updateError) throw updateError;
      }

      toast({
        title: `Club ${status === 'approved' ? 'verificado' : 'rechazado'}`,
      });

      loadData();
    } catch (error: any) {
      logger.error('Error verificando club:', { error });
      toast({
        title: 'Error',
        description: error.message || 'No se pudo verificar el club',
        variant: 'destructive',
      });
    }
  };

  const handleCreateFlyer = async () => {
    if (!supabase) {
      toast({
        title: 'Error',
        description: 'No se pudo conectar a la base de datos',
        variant: 'destructive',
      });
      return;
    }
    try {
      if (!selectedClub || !flyerForm.title || !flyerForm.image_url) {
        toast({
          title: 'Error',
          description: 'Completa los campos requeridos',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('club_flyers')
        .insert({
          club_id: selectedClub.id,
          title: flyerForm.title,
          description: flyerForm.description || null,
          image_url: flyerForm.image_url!,
          event_date: flyerForm.event_date || null,
          event_end_date: flyerForm.event_end_date || null,
          is_active: flyerForm.is_active ?? true,
          is_featured: flyerForm.is_featured ?? false,
          ai_processing_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Flyer creado',
        description: 'El flyer será procesado con watermark y blur automático',
      });

      // Procesar imagen automáticamente
      try {
        await processClubFlyerImageServer(flyerForm.image_url!, data.id);
        toast({
          title: 'Procesamiento iniciado',
          description: 'La imagen está siendo procesada con IA',
        });
      } catch (processError) {
        logger.error('Error procesando imagen:', { error: processError });
        toast({
          title: 'Advertencia',
          description: 'El flyer se creó pero el procesamiento falló. Se reintentará automáticamente.',
          variant: 'destructive',
        });
      }

      setShowFlyerDialog(false);
      setFlyerForm({
        title: '',
        description: '',
        image_url: '',
        event_date: '',
        event_end_date: '',
        is_active: true,
        is_featured: false,
      });
      loadFlyers();
    } catch (error: any) {
      logger.error('Error creando flyer:', { error });
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el flyer',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNav />
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Gestión de Partners (Clubs)</h1>
        <p className="text-muted-foreground">
          Administra clubs verificados, verificaciones y flyers
        </p>
      </div>

      <Tabs defaultValue="clubs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="clubs">Clubs ({clubs.length})</TabsTrigger>
          <TabsTrigger value="verifications">
            Verificaciones ({verifications.filter((v) => v.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="flyers">Flyers ({flyers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="clubs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Clubs</h2>
            <Button onClick={() => setShowClubDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Club
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club) => (
              <Card key={club.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{club.name}</CardTitle>
                    <div className="flex gap-2">
                      {club.verified_at ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verificado
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500">Pendiente</Badge>
                      )}
                      {club.is_featured && <Badge>Destacado</Badge>}
                    </div>
                  </div>
                  <CardDescription>
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {club.city}, {club.state || club.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{(club.rating_average || 0).toFixed(1)} ({club.rating_count || 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{club.check_in_count || 0} check-ins</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedClub(club);
                        navigate(`/clubs/${club.slug}`);
                      }}
                    >
                      Ver
                    </Button>
                    {!club.verified_at && (
                      <Button
                        size="sm"
                        onClick={() => handleVerifyClub(club.id, 'approved')}
                      >
                        Verificar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="verifications" className="space-y-4">
          <h2 className="text-2xl font-semibold">Verificaciones Pendientes</h2>
          <div className="space-y-4">
            {verifications
              .filter((v) => v.status === 'pending')
              .map((verification) => {
                const club = clubs.find((c) => c.id === verification.club_id);
                return (
                  <Card key={verification.id}>
                    <CardHeader>
                      <CardTitle>{club?.name || 'Club desconocido'}</CardTitle>
                      <CardDescription>
                        Tipo: {verification.verification_type} | Creado: {verification.created_at ? new Date(verification.created_at).toLocaleDateString() : 'N/A'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {verification.notes && <p className="mb-4">{verification.notes}</p>}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleVerifyClub(verification.club_id, 'approved')}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleVerifyClub(verification.club_id, 'rejected')}
                        >
                          Rechazar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="flyers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Flyers</h2>
            <Button
              onClick={() => {
                if (!selectedClub) {
                  toast({
                    title: 'Selecciona un club',
                    description: 'Primero selecciona un club para crear un flyer',
                    variant: 'destructive',
                  });
                  return;
                }
                setShowFlyerDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Flyer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flyers.map((flyer) => {
              const club = clubs.find((c) => c.id === flyer.club_id);
              return (
                <Card key={flyer.id}>
                  {flyer.image_url && (
                    <img
                      src={flyer.image_url}
                      alt={flyer.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle>{flyer.title}</CardTitle>
                    <CardDescription>{club?.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge
                        className={
                          flyer.ai_processing_status === 'completed'
                            ? 'bg-green-500'
                            : flyer.ai_processing_status === 'failed'
                            ? 'bg-red-500'
                            : flyer.ai_processing_status === 'processing'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }
                      >
                        {flyer.ai_processing_status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {flyer.ai_processing_status === 'processing' && <Sparkles className="w-3 h-3 mr-1 animate-spin" />}
                        {flyer.ai_processing_status || 'pending'}
                      </Badge>
                      {flyer.watermark_applied && (
                        <Badge className="bg-blue-500">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Watermark
                        </Badge>
                      )}
                      {flyer.blur_applied && (
                        <Badge className="bg-purple-500">
                          <Shield className="w-3 h-3 mr-1" />
                          Blur
                        </Badge>
                      )}
                    </div>
                    {flyer.event_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(flyer.event_date).toLocaleDateString()}
                      </div>
                    )}
                    {(flyer.ai_processing_status === 'pending' || !flyer.ai_processing_status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={async () => {
                          try {
                            await processClubFlyerImageServer(flyer.image_url, flyer.id);
                            toast({
                              title: 'Procesamiento iniciado',
                              description: 'La imagen está siendo procesada',
                            });
                            loadFlyers();
                          } catch {
                            toast({
                              title: 'Error',
                              description: 'No se pudo procesar la imagen',
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Procesar ahora
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog crear club */}
      <Dialog open={showClubDialog} onOpenChange={setShowClubDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Club</DialogTitle>
            <DialogDescription>Completa la información del club</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre *</label>
              <Input
                value={clubForm.name}
                onChange={(e) => {
                  setClubForm({ ...clubForm, name: e.target.value });
                  if (!clubForm.slug) {
                    setClubForm({ ...clubForm, name: e.target.value, slug: generateSlug(e.target.value) });
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={clubForm.slug}
                onChange={(e) => setClubForm({ ...clubForm, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={clubForm.description || ''}
                onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Dirección *</label>
                <Input
                  value={clubForm.address}
                  onChange={(e) => setClubForm({ ...clubForm, address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ciudad *</label>
                <Input
                  value={clubForm.city}
                  onChange={(e) => setClubForm({ ...clubForm, city: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Latitud</label>
                <Input
                  type="number"
                  step="any"
                  value={clubForm.latitude || 0}
                  onChange={(e) => setClubForm({ ...clubForm, latitude: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Longitud</label>
                <Input
                  type="number"
                  step="any"
                  value={clubForm.longitude}
                  onChange={(e) => setClubForm({ ...clubForm, longitude: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Radio (m)</label>
                <Input
                  type="number"
                  value={clubForm.check_in_radius_meters || 50}
                  onChange={(e) => setClubForm({ ...clubForm, check_in_radius_meters: parseInt(e.target.value) || 50 })}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleCreateClub}>Crear Club</Button>
              <Button variant="outline" onClick={() => setShowClubDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog crear flyer */}
      <Dialog open={showFlyerDialog} onOpenChange={setShowFlyerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Flyer</DialogTitle>
            <DialogDescription>Club: {selectedClub?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título *</label>
              <Input
                value={flyerForm.title}
                onChange={(e) => setFlyerForm({ ...flyerForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL de imagen *</label>
              <Input
                value={flyerForm.image_url}
                onChange={(e) => setFlyerForm({ ...flyerForm, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={flyerForm.description || ''}
                onChange={(e) => setFlyerForm({ ...flyerForm, description: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleCreateFlyer}>Crear Flyer</Button>
              <Button variant="outline" onClick={() => setShowFlyerDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPartners;

