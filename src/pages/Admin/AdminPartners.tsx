import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  MapPin,
  CheckCircle,
  Star,
  Users,
  Calendar,
  Image as ImageIcon,
  Shield,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';
import AdminNav from '@/components/AdminNav';
import { processClubFlyerImageServer } from '@/features/clubs/clubFlyerImageProcessing';
import type { Database } from '@/types/supabase-generated';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Toast fallback implementation
const useToast = () => {
  return {
    toast: (options: { title: string; description?: string; variant?: string }) => {
      console.log(`[Toast] ${options.title}: ${options.description || ''}`);
      if (typeof window !== 'undefined') {
        alert(`${options.title}: ${options.description || ''}`);
      }
    },
  };
};

// Base types from Supabase (narrowed to avoid Json unions in JSX / inserts)
type ClubBase = Database['public']['Tables']['clubs']['Row'];
type ClubVerificationBase = Database['public']['Tables']['club_verifications']['Row'];
type ClubFlyerBase = Database['public']['Tables']['club_flyers']['Row'];

type Club = Omit<
  ClubBase,
  | 'id'
  | 'rating_average'
  | 'rating_count'
  | 'check_in_count'
  | 'city'
  | 'state'
  | 'country'
  | 'name'
  | 'slug'
> & {
  id: string;
  rating_average: number | null;
  rating_count: number | null;
  check_in_count: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  name: string;
  slug: string;
} & {
  verifications?: ClubVerification[];
  flyers?: ClubFlyer[];
};

type ClubVerification = Omit<ClubVerificationBase, 'id' | 'club_id' | 'created_at'> & {
  id: string;
  club_id: string;
  created_at: string | null;
};

type ClubFlyer = Omit<
  ClubFlyerBase,
  | 'id'
  | 'club_id'
  | 'title'
  | 'image_url'
  | 'description'
  | 'event_date'
  | 'event_end_date'
  | 'ai_processing_status'
> & {
  id: string;
  club_id: string;
  title: string;
  image_url: string;
  description: string | null;
  event_date: string | null;
  event_end_date: string | null;
  ai_processing_status: 'pending' | 'processing' | 'completed' | 'failed' | null;
};

type ClubInsert = Database['public']['Tables']['clubs']['Insert'];
type ClubVerificationInsert = Database['public']['Tables']['club_verifications']['Insert'];
type ClubFlyerInsert = Database['public']['Tables']['club_flyers']['Insert'];

// Form-safe values (strings for inputs)
type ClubFormValues = {
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
  phone: string;
  email: string;
  website: string;
  check_in_radius_meters: string;
  is_active: boolean;
  is_featured: boolean;
};

type FlyerFormValues = {
  title: string;
  image_url: string;
  description: string;
  event_date: string;
  event_end_date: string;
  is_active: boolean;
  is_featured: boolean;
};

const createInitialClubForm = (): ClubFormValues => ({
  name: '',
  slug: '',
  description: '',
  address: '',
  city: '',
  state: '',
  country: '',
  latitude: '',
  longitude: '',
  phone: '',
  email: '',
  website: '',
  check_in_radius_meters: '',
  is_active: true,
  is_featured: false,
});

const createInitialFlyerForm = (): FlyerFormValues => {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return {
    title: '',
    image_url: '',
    description: '',
    event_date: today,
    event_end_date: nextMonth,
    is_active: true,
    is_featured: false,
  };
};

const AdminPartners = () => {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();

  const navigate = useNavigate();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [verifications, setVerifications] = useState<ClubVerification[]>([]);
  const [flyers, setFlyers] = useState<ClubFlyer[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showClubDialog, setShowClubDialog] = useState(false);
  const [showFlyerDialog, setShowFlyerDialog] = useState(false);

  const [flyerForm, setFlyerForm] = useState<FlyerFormValues>(createInitialFlyerForm());
  const [clubForm, setClubForm] = useState<ClubFormValues>(createInitialClubForm());

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  const loadData = async () => {
    if (!supabase) return;
    try {
      setIsLoading(true);
      await Promise.all([
        loadClubs(),
        loadVerifications(),
        selectedClub?.id ? loadFlyers(selectedClub.id) : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadClubs = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setClubs((data || []) as Club[]);
  };

  const loadVerifications = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('club_verifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setVerifications((data || []) as ClubVerification[]);
  };

  const loadFlyers = async (clubId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('club_flyers')
        .select('*')
        .eq('club_id', clubId);

      if (error) throw error;
      setFlyers((data || []) as ClubFlyer[]);
    } catch (error) {
      console.error('Error loading flyers:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los flyers',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (selectedClub?.id) {
      loadFlyers(selectedClub.id);
    }
  }, [selectedClub?.id]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const parseNumberOrNull = (value: string) => (value.trim() === '' ? null : Number(value));

  const handleCreateClub = async () => {
    if (!clubForm.name.trim()) {
      toast({ title: 'Error', description: 'El nombre del club es requerido', variant: 'destructive' });
      return;
    }

    try {
      if (!supabase) {
        throw new Error('Supabase client no está disponible');
      }

      const clubData: ClubInsert = {
        name: clubForm.name.trim(),
        slug: clubForm.slug.trim() || generateSlug(clubForm.name),
        address: clubForm.address.trim() || null,
        city: clubForm.city.trim() || null,
        description: clubForm.description.trim() || null,
        state: clubForm.state.trim() || null,
        country: clubForm.country.trim() || null,
        latitude: parseNumberOrNull(clubForm.latitude),
        longitude: parseNumberOrNull(clubForm.longitude),
        phone: clubForm.phone.trim() || null,
        email: clubForm.email.trim() || null,
        website: clubForm.website.trim() || null,
        check_in_radius_meters:
          clubForm.check_in_radius_meters.trim() === ''
            ? 100
            : Number(clubForm.check_in_radius_meters) || 100,
        is_active: clubForm.is_active,
        is_featured: clubForm.is_featured,
      };

      const { data, error } = await (supabase as any)
        .from('clubs')
        .insert(clubData)
        .select()
        .single();

      if (error) throw error;

      setClubs(prevClubs => [...prevClubs, data as Club]);
      setClubForm(createInitialClubForm());
      setShowClubDialog(false);
      toast({ title: 'Éxito', description: 'Club creado correctamente' });
    } catch (error) {
      console.error('Error creating club:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el club',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyClub = async (clubId: string, status: 'approved' | 'rejected') => {
    if (!supabase || !user) {
      toast({ title: 'Error', description: 'No estás autenticado', variant: 'destructive' });
      return;
    }
    try {
      const verificationData = {
        club_id: clubId,
        verified_by: user.id,
        verification_type: 'admin_verification',
        status,
        verified_at: status === 'approved' ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any)
        .from('club_verifications')
        .insert(verificationData);

      if (error) throw error;

      if (status === 'approved') {
        const { error: updateError } = await (supabase as any)
          .from('clubs')
          .update({
            verified_at: new Date().toISOString(),
            is_verified: true,
          })
          .eq('id', clubId);

        if (updateError) throw updateError;
      }

      toast({
        title: `Club ${status === 'approved' ? 'verificado' : 'rechazado'}`,
      });

      const { data: updatedClubs, error: fetchError } = await supabase.from('clubs').select('*');

      if (!fetchError && updatedClubs) {
        setClubs(updatedClubs as Club[]);
      }

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
      if (!selectedClub || !flyerForm.title.trim() || !flyerForm.image_url.trim()) {
        toast({
          title: 'Error',
          description: 'Debes seleccionar un club y completar título e imagen',
          variant: 'destructive',
        });
        return;
      }

      const flyerData = {
        club_id: selectedClub.id,
        image_url: flyerForm.image_url.trim(),
        title: flyerForm.title.trim(),
        description: flyerForm.description.trim() || null,
        event_date: flyerForm.event_date || new Date().toISOString(),
        event_end_date: flyerForm.event_end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: flyerForm.is_active,
        is_featured: flyerForm.is_featured,
        ai_processing_status: 'pending',
      };

      const { data, error } = await (supabase as any)
        .from('club_flyers')
        .insert(flyerData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Flyer creado',
        description: 'El flyer será procesado con watermark y blur automático',
      });

      try {
        await processClubFlyerImageServer(flyerForm.image_url, (data as ClubFlyer).id);
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
      setFlyerForm(createInitialFlyerForm());
      await loadFlyers(selectedClub.id);
    } catch (error: any) {
      logger.error('Error creando flyer:', { error });
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el flyer',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
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
        <p className="text-muted-foreground">Administra clubs verificados, verificaciones y flyers</p>
      </div>

      <Tabs defaultValue="clubs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="clubs">Clubs ({clubs.length})</TabsTrigger>
          <TabsTrigger value="verifications">
            Verificaciones ({verifications.filter(v => v.status === 'pending').length})
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
            {clubs.map(club => (
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
                      <span>
                        {Number(club.rating_average || 0).toFixed(1)} ({Number(club.rating_count || 0)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{Number(club.check_in_count || 0)} check-ins</span>
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
                      <Button size="sm" onClick={() => handleVerifyClub(club.id, 'approved')}>
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
              .filter(v => v.status === 'pending')
              .map(verification => {
                const club = clubs.find(c => c.id === verification.club_id);
                return (
                  <Card key={verification.id}>
                    <CardHeader>
                      <CardTitle>{club?.name || 'Club desconocido'}</CardTitle>
                      <CardDescription>
                        Tipo: {String(verification.verification_type ?? '')} | Creado:{' '}
                        {verification.created_at
                          ? new Date(verification.created_at).toLocaleDateString()
                          : 'N/A'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {verification.notes && (
                        <p className="mb-4">{String(verification.notes)}</p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleVerifyClub(verification.club_id, 'approved')}>
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
            {flyers.map(flyer => {
              const club = clubs.find(c => c.id === flyer.club_id);
              return (
                <Card key={flyer.id}>
                  {flyer.image_url && (
                    <img src={flyer.image_url} alt={flyer.title} className="w-full h-48 object-cover" />
                  )}
                  <CardHeader>
                    <CardTitle>{flyer.title}</CardTitle>
                    <CardDescription>{club?.name || 'Club desconocido'}</CardDescription>
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
                        {flyer.ai_processing_status === 'processing' && (
                          <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                        )}
                        {String(flyer.ai_processing_status ?? 'pending')}
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
                            await loadFlyers(flyer.club_id);
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
      <AlertDialog open={showClubDialog} onOpenChange={setShowClubDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Nuevo Club</AlertDialogTitle>
            <AlertDialogDescription>Completa la información del club</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre *</label>
              <Input
                value={clubForm.name}
                onChange={e => {
                  const newName = e.target.value;
                  setClubForm(prev => ({
                    ...prev,
                    name: newName,
                    slug: prev.slug ? prev.slug : generateSlug(newName),
                  }));
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input value={clubForm.slug} onChange={e => setClubForm({ ...clubForm, slug: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={clubForm.description}
                onChange={e => setClubForm({ ...clubForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Dirección *</label>
                <Input
                  value={clubForm.address}
                  onChange={e => setClubForm({ ...clubForm, address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ciudad *</label>
                <Input value={clubForm.city} onChange={e => setClubForm({ ...clubForm, city: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Latitud</label>
                <Input
                  type="number"
                  step="any"
                  value={clubForm.latitude}
                  onChange={e => setClubForm({ ...clubForm, latitude: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Longitud</label>
                <Input
                  type="number"
                  step="any"
                  value={clubForm.longitude}
                  onChange={e => setClubForm({ ...clubForm, longitude: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Radio (m)</label>
                <Input
                  type="number"
                  value={clubForm.check_in_radius_meters}
                  onChange={e =>
                    setClubForm({
                      ...clubForm,
                      check_in_radius_meters: e.target.value,
                    })
                  }
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
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog crear flyer */}
      <AlertDialog open={showFlyerDialog} onOpenChange={setShowFlyerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nuevo Flyer</AlertDialogTitle>
            <AlertDialogDescription>Club: {selectedClub?.name || 'Sin club seleccionado'}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título *</label>
              <Input value={flyerForm.title} onChange={e => setFlyerForm({ ...flyerForm, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">URL de imagen *</label>
              <Input
                value={flyerForm.image_url}
                onChange={e => setFlyerForm({ ...flyerForm, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={flyerForm.description}
                onChange={e => setFlyerForm({ ...flyerForm, description: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleCreateFlyer}>Crear Flyer</Button>
              <Button variant="outline" onClick={() => setShowFlyerDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPartners;