import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';

// Interfaces actualizadas para coincidir con el schema de Supabase

export interface Interest {
  id: number; // SERIAL en la BD
  name: string;
  category: string;
  description?: string | null;
  is_explicit?: boolean | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UserInterest {
  interest_id: number; // INTEGER en la BD
  interest: Interest;
  created_at: string | null;
}

export const useInterests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los intereses disponibles
  const loadInterests = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        logger.error('Supabase no está disponible');
        setError('Supabase no está disponible');
        return;
      }
      
      const { data, error } = await supabase
        .from('swinger_interests')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setInterests(data || []);
    } catch (error) {
      logger.error('❌ Error loading interests:', { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Error",
        description: "No se pudieron cargar los intereses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Cargar intereses del usuario
  const loadUserInterests = useCallback(async () => {
    if (!user?.id) return;

    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        setError('Supabase no está disponible');
        return;
      }
      
      const { data, error } = await supabase
        .from('user_interests')
        .select(`
          interest_id,
          created_at,
          interest:swinger_interests(id, name, category, description)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserInterests(data || []);
    } catch (error) {
      logger.error('❌ Error updating user interests:', { error: error instanceof Error ? error.message : String(error) });
      setError('Error cargando intereses del usuario');
    }
  }, [user?.id]);

  // Agregar interés al usuario
  const addInterest = useCallback(async (interestId: string | number) => {
    if (!user?.id) return;

    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        toast({
          title: "Error",
          description: "Supabase no está disponible",
          variant: "destructive",
        });
        return;
      }
      
      const numericId = typeof interestId === 'string' ? parseInt(interestId, 10) : interestId;
      
      const { error } = await supabase
        .from('user_interests')
        .insert({
          user_id: user.id,
          interest_id: numericId
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Interés añadido correctamente",
      });

      // Recargar intereses del usuario
      await loadUserInterests();
    } catch (error) {
      logger.error('❌ Error adding user interest:', { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Error",
        description: "No se pudo añadir el interés",
        variant: "destructive",
      });
    }
  }, [user?.id, loadUserInterests, toast]);

  // Remover interés del usuario
  const removeInterest = useCallback(async (interestId: string | number) => {
    if (!user?.id) return;

    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        toast({
          title: "Error",
          description: "Supabase no está disponible",
          variant: "destructive",
        });
        return;
      }
      
      const numericId = typeof interestId === 'string' ? parseInt(interestId, 10) : interestId;
      
      const { error } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id)
        .eq('interest_id', numericId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Interés removido correctamente",
      });

      // Recargar intereses del usuario
      await loadUserInterests();
    } catch (error) {
      logger.error('❌ Error removing user interest:', { error: error instanceof Error ? error.message : String(error) });
      toast({
        title: "Error",
        description: "No se pudo remover el interés",
        variant: "destructive",
      });
    }
  }, [user?.id, loadUserInterests, toast]);

  // Verificar si el usuario tiene un interés específico
  const hasInterest = useCallback((interestId: string | number) => {
    const numericId = typeof interestId === 'string' ? parseInt(interestId, 10) : interestId;
    return userInterests.some(ui => ui.interest_id === numericId);
  }, [userInterests]);

  // Obtener intereses por categoría
  const getInterestsByCategory = useCallback((category: string) => {
    return interests.filter(interest => interest.category === category);
  }, [interests]);

  // Obtener categorías únicas
  const getCategories = useCallback(() => {
    const categories = [...new Set(interests.map(interest => interest.category))];
    return categories.sort();
  }, [interests]);

  // Buscar intereses
  const searchInterests = useCallback((query: string) => {
    if (!query.trim()) return interests;
    
    const lowercaseQuery = query.toLowerCase();
    return interests.filter(interest => 
      interest.name.toLowerCase().includes(lowercaseQuery) ||
      interest.description?.toLowerCase().includes(lowercaseQuery) ||
      interest.category.toLowerCase().includes(lowercaseQuery)
    );
  }, [interests]);

  // Obtener intereses populares (los más comunes o explícitos)
  const getPopularInterests = useCallback(() => {
    // Retornar intereses no explícitos y activos como "populares"
    return interests.filter(interest => 
      interest.is_active !== false && 
      interest.is_explicit !== true
    );
  }, [interests]);

  // Sincronizar intereses del perfil con la tabla interests
  const syncProfileInterests = useCallback(async (profileInterests: string[]) => {
    if (!user?.id) return;

    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return;
      }
      
      // Primero, eliminar todos los intereses actuales del usuario
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id);

      // Luego, agregar los nuevos intereses
      if (profileInterests.length > 0) {
        const interestInserts = profileInterests
          .map(interestName => {
            const interest = interests.find(i => i.name === interestName);
            return interest ? {
              user_id: user.id,
              interest_id: interest.id // Ya es número
            } : null;
          })
          .filter((item): item is { user_id: string; interest_id: number } => item !== null); // Type guard

        if (interestInserts.length > 0) {
          const { error } = await supabase
            .from('user_interests')
            .insert(interestInserts);

          if (error) throw error;
        }
      }

      await loadUserInterests();
    } catch (err) {
      logger.error('Error syncing profile interests:', { error: err instanceof Error ? err.message : String(err) });
    }
  }, [user?.id, interests, loadUserInterests]);

  // Cargar datos iniciales
  useEffect(() => {
    loadInterests();
  }, [loadInterests]);

  useEffect(() => {
    if (user?.id) {
      loadUserInterests();
    }
  }, [user?.id, loadUserInterests]);

  return {
    interests,
    userInterests,
    loading,
    error,
    loadInterests,
    loadUserInterests,
    addInterest,
    removeInterest,
    hasInterest,
    getInterestsByCategory,
    getCategories,
    searchInterests,
    getPopularInterests,
    syncProfileInterests
  };
};
