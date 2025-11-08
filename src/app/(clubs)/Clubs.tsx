import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/shared/ui/Input';
import { MapPin, Star, Users, CheckCircle, FileText, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/supabase';

type ClubRow = Database['public']['Tables']['clubs']['Row'];

interface Club extends Omit<ClubRow, 'cover_image_url' | 'is_featured' | 'rating_average' | 'rating_count' | 'description' | 'logo_url' | 'review_count' | 'phone' | 'check_in_count' | 'state' | 'verified_at' | 'website'> {
  description: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  verified_at: string | null;
  is_featured: boolean;
  rating_average: number;
  rating_count: number;
  review_count: number;
  check_in_count: number;
  check_in_radius_meters: number | null;
}

const Clubs = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    loadClubs();
    requestUserLocation();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [clubs, searchQuery, selectedCity]);

  const requestUserLocation = async () => {
    if (!navigator.geolocation) {
      logger.warn('Geolocation no disponible');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        logger.warn('Error obteniendo ubicación:', error);
      }
    );
  };

  const loadClubs = async () => {
    try {
      setLoading(true);
      if (!supabase) {
        throw new Error('Supabase no está disponible');
      }
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating_average', { ascending: false })
        .order('check_in_count', { ascending: false });

      if (error) throw error;

      // Mapear y normalizar los datos para asegurar tipos correctos
      const normalizedClubs: Club[] = (data || []).map((club) => ({
        ...club,
        is_featured: club.is_featured ?? false,
        cover_image_url: club.cover_image_url ?? null,
        rating_average: club.rating_average ?? 0,
        rating_count: club.rating_count ?? 0,
        description: club.description ?? null,
        logo_url: club.logo_url ?? null,
        review_count: club.review_count ?? 0,
        phone: club.phone ?? null,
        check_in_count: club.check_in_count ?? 0,
        state: club.state ?? null,
        verified_at: club.verified_at ?? null,
        website: club.website ?? null,
      }));

      setClubs(normalizedClubs);
      setFilteredClubs(normalizedClubs);
    } catch (error) {
      logger.error('Error cargando clubs:', { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clubs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterClubs = () => {
    let filtered = [...clubs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (club) =>
          club.name.toLowerCase().includes(query) ||
          club.description?.toLowerCase().includes(query) ||
          club.city.toLowerCase().includes(query) ||
          club.address.toLowerCase().includes(query)
      );
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter((club) => club.city === selectedCity);
    }

    setFilteredClubs(filtered);
  };

  const handleCheckIn = async (clubId: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para hacer check-in',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!userLocation) {
      toast({
        title: 'Ubicación requerida',
        description: 'Activa la ubicación para hacer check-in',
        variant: 'destructive',
      });
      requestUserLocation();
      return;
    }

    try {
      setCheckingIn(clubId);

      if (!supabase) {
        throw new Error('Supabase no está disponible');
      }

      // Verificar distancia usando función SQL
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('latitude, longitude, check_in_radius_meters, name')
        .eq('id', clubId)
        .single();

      if (clubError || !clubData) throw new Error('Club no encontrado');

      const checkInRadius = clubData.check_in_radius_meters ?? 50; // Default 50m

      // Calcular distancia usando función SQL
      const { error: distanceError } = await supabase.rpc(
        'verify_checkin_distance',
        {
          p_club_id: clubId,
          p_latitude: userLocation.lat,
          p_longitude: userLocation.lng,
        }
      );

      if (distanceError) {
        // Fallback: calcular distancia manualmente
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          clubData.latitude,
          clubData.longitude
        );

        if (distance > checkInRadius) {
          throw new Error(
            `Estás a ${Math.round(distance)}m del club. Debes estar a menos de ${checkInRadius}m`
          );
        }
      }

      // Crear check-in
      const { error: checkinError } = await supabase
        .from('club_checkins')
        .insert({
          club_id: clubId,
          user_id: user.id,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          distance_meters: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            clubData.latitude,
            clubData.longitude
          ),
          is_verified: true,
          verified_at: new Date().toISOString(),
        })
        .single();

      if (checkinError) {
        // Si ya existe check-in hoy (violación de índice único), actualizar
        if (checkinError.code === '23505' || checkinError.message?.includes('unique')) {
          // Buscar el check-in de hoy
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const { data: existingCheckin, error: findError } = await supabase
            .from('club_checkins')
            .select('id')
            .eq('club_id', clubId)
            .eq('user_id', user.id)
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString())
            .single();

          if (findError || !existingCheckin) {
            throw new Error('No se pudo encontrar el check-in existente');
          }

          const { error: updateError } = await supabase
            .from('club_checkins')
            .update({
              latitude: userLocation.lat,
              longitude: userLocation.lng,
              distance_meters: calculateDistance(
                userLocation.lat,
                userLocation.lng,
                clubData.latitude,
                clubData.longitude
              ),
              is_verified: true,
              verified_at: new Date().toISOString(),
            })
            .eq('id', existingCheckin.id);

          if (updateError) throw updateError;
        } else {
          throw checkinError;
        }
      }

      toast({
        title: 'Check-in exitoso',
        description: `Check-in realizado en ${clubData.name}`,
      });

      loadClubs();
    } catch (error: any) {
      logger.error('Error en check-in:', error);
      toast({
        title: 'Error en check-in',
        description: error.message || 'No se pudo realizar el check-in',
        variant: 'destructive',
      });
    } finally {
      setCheckingIn(null);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const cities = Array.from(new Set(clubs.map((club) => club.city))).sort();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando clubs...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Clubs Verificados</h1>
        <p className="text-muted-foreground">
          Descubre clubs verificados cerca de ti y haz check-in para desbloquear reseñas
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
          placeholder="Buscar por nombre, ciudad o dirección..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <select
          value={selectedCity}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCity(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">Todas las ciudades</option>
          {cities.map((city: string) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de clubs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club: Club) => (
          <Card key={club.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {club.cover_image_url && (
              <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-600 relative">
                <img
                  src={club.cover_image_url}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
                {club.is_featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500" variant="default">Destacado</Badge>
                )}
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{club.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    {club.address}, {club.city}
                  </CardDescription>
                </div>
                {club.logo_url && (
                  <img src={club.logo_url} alt={club.name} className="w-16 h-16 rounded-lg object-cover" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {club.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{club.description}</p>
              )}

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{(club.rating_average || 0).toFixed(1)}</span>
                  <span className="text-muted-foreground">({club.rating_count || 0})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{club.check_in_count || 0} check-ins</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/clubs/${club.slug}`)}
                  variant="outline"
                  className="flex-1"
                >
                  Ver detalles
                </Button>
                <Button
                  onClick={() => handleCheckIn(club.id)}
                  disabled={checkingIn === club.id}
                  className="flex-1"
                >
                  {checkingIn === club.id ? (
                    'Verificando...'
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Check-in
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClubs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron clubs</p>
        </div>
      )}

      {/* Sección Legal */}
      <div className="mt-12 border-t pt-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Información Legal</h2>
          <p className="text-muted-foreground mb-6">
            ComplicesConecta opera bajo estricto cumplimiento del marco legal mexicano e internacional. 
            Consulta nuestra documentación legal para más información.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => navigate('/legal')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Marco Legal Completo
            </Button>
            <Button
              onClick={() => navigate('/terms')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Términos de Servicio
            </Button>
            <Button
              onClick={() => navigate('/privacy')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Política de Privacidad
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clubs;

