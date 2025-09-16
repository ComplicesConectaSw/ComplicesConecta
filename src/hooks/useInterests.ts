import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

// Tipos temporales hasta que se actualice el schema de Supabase

export interface Interest {
  id: string;
  name: string;
  category: string;
  description?: string;
  is_popular?: boolean;
}

export interface UserInterest {
  interest_id: string;
  interest: Interest;
  created_at: string;
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
      const { data, error } = await (supabase as any)
        .from('interests')
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
      const { data, error } = await (supabase as any)
        .from('user_interests')
        .select(`
          interest_id,
          interest:interests(id, name, category)
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
  const addInterest = useCallback(async (interestId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await (supabase as any)
        .from('user_interests')
        .insert({
          user_id: user.id,
          interest_id: interestId
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
  const removeInterest = useCallback(async (interestId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await (supabase as any)
        .from('user_interests')
        .delete()
        .eq('user_id', user.id)
        .eq('interest_id', interestId);

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
  const hasInterest = useCallback((interestId: string) => {
    return userInterests.some(ui => ui.interest_id === interestId);
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

  // Obtener intereses populares
  const getPopularInterests = useCallback(() => {
    return interests.filter(interest => interest.is_popular);
  }, [interests]);

  // Sincronizar intereses del perfil con la tabla interests
  const syncProfileInterests = useCallback(async (profileInterests: string[]) => {
    if (!user?.id) return;

    try {
      // Primero, eliminar todos los intereses actuales del usuario
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id);

      // Luego, agregar los nuevos intereses
      if (profileInterests.length > 0) {
        const interestInserts = profileInterests.map(interestName => ({
          user_id: user.id,
          interest_id: interests.find(i => i.name === interestName)?.id
        })).filter(item => item.interest_id); // Solo incluir intereses válidos

        if (interestInserts.length > 0) {
          const { error } = await (supabase as any)
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
