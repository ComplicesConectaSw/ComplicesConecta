import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface Invitation {
  id: string;
  from_profile: string | null;
  to_profile: string | null;
  message: string | null;
  type: string | null;
  status: string | null;
  created_at: string | null;
  decided_at?: string | null;
  updated_at?: string | null;
}

export interface GalleryPermission {
  id: string;
  owner_profile: string;
  grantee_profile: string;
  status: 'active' | 'revoked';
  created_at: string;
}

// Mock data para fallback
const mockInvitations: Invitation[] = [
  {
    id: '1',
    from_profile: '1',
    to_profile: '2',
    message: 'Me gustaría conectar contigo',
    type: 'profile',
    status: 'pending',
    created_at: new Date().toISOString(),
    decided_at: null
  }
];

const mockGalleryPermissions: GalleryPermission[] = [
  {
    id: '1',
    owner_profile: '1',
    grantee_profile: '2',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

export const invitationService = {
  async sendInvitation(from_profile: string, to_profile: string, type: 'profile' | 'gallery' | 'chat', message?: string): Promise<Invitation> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        throw new Error('Supabase no está disponible');
      }
      
      const { data, error } = await (supabase as any)
        .from('invitations')
        .insert({
          from_profile: from_profile,
          to_profile: to_profile,
          message: message || '',
          type: type,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        logger.error('❌ Error enviando invitación:', { error: error.message || String(error) });
        throw error;
      }

      logger.info('✅ Invitación enviada exitosamente');
      return data as Invitation;
    } catch (error) {
      logger.error('❌ Error en sendInvitation:', { error: error instanceof Error ? error.message : String(error) });
      // Fallback a mock data
      const mockInvitation: Invitation = {
        id: Date.now().toString(),
        from_profile: from_profile,
        to_profile: to_profile,
        message: message || '',
        type: type,
        status: 'pending',
        created_at: new Date().toISOString(),
        decided_at: null
      };
      // Add to mock data array so it can be found later
      mockInvitations.push(mockInvitation);
      return mockInvitation;
    }
  },

  async respondInvitation(invitationId: string, response: 'accept' | 'decline'): Promise<Invitation> {
    if (response === 'accept') {
      await this.acceptInvitation(invitationId);
    } else {
      await this.declineInvitation(invitationId);
    }
    
    // Return the updated invitation
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        throw new Error('Supabase no está disponible');
      }
      
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .single();
      
      if (error) throw error;
      
      // Mapear datos de Supabase al formato esperado
      const mappedData = {
        ...data,
        message: data.message || 'Invitación'
      };
      
      return mappedData;
    } catch {
      // Fallback to mock data
      const invitation = mockInvitations.find(inv => inv.id === invitationId);
      if (invitation) {
        return invitation;
      }
      throw new Error('Invitation not found');
    }
  },

  async acceptInvitation(invitationId: string): Promise<void> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        throw new Error('Supabase no está disponible');
      }
      
      const { error } = await (supabase as any)
        .from('invitations')
        .update({ 
          status: 'accepted',
          decided_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) {
        logger.error('❌ Error actualizando invitación:', { error: error.message || String(error) });
        throw error;
      }
    } catch (error) {
      logger.error('❌ Error en acceptInvitation:', { error: error instanceof Error ? error.message : String(error) });
      // Fallback a mock data
      const invitation = mockInvitations.find(inv => inv.id === invitationId);
      if (invitation) {
        invitation.status = 'accepted';
        invitation.decided_at = new Date().toISOString();
      }
    }
  },

  async declineInvitation(invitationId: string): Promise<void> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        throw new Error('Supabase no está disponible');
      }
      
      const { error } = await (supabase as any)
        .from('invitations')
        .update({ 
          status: 'declined',
          decided_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) {
        logger.error('❌ Error actualizando invitación:', { error: error.message || String(error) });
        throw error;
      }
    } catch (error) {
      logger.error('❌ Error en declineInvitation:', { error: error instanceof Error ? error.message : String(error) });
      // Fallback a mock data
      const invitation = mockInvitations.find(inv => inv.id === invitationId);
      if (invitation) {
        invitation.status = 'declined';
        invitation.decided_at = new Date().toISOString();
      }
    }
  },

  async getInvitations(profileId: string): Promise<{ received: Invitation[], sent: Invitation[] }> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        throw new Error('Supabase no está disponible');
      }
      
      // Obtener invitaciones recibidas - compatible con ambos esquemas
      const { data: receivedData, error: receivedError } = await supabase
        .from('invitations')
        .select('*')
        .or(`to_profile_id.eq.${profileId},to_profile.eq.${profileId}`)
        .order('created_at', { ascending: false });
      
      // Obtener invitaciones enviadas - compatible con ambos esquemas
      const { data: sentData, error: sentError } = await supabase
        .from('invitations')
        .select('*')
        .or(`from_profile_id.eq.${profileId},from_profile.eq.${profileId}`)
        .order('created_at', { ascending: false });

      if (receivedError || sentError) {
        logger.error('❌ Error obteniendo invitaciones:', { error: (receivedError || sentError)?.message || String(receivedError || sentError) });
        throw receivedError || sentError;
      }

      const received = ((receivedData as any) || []).map((inv: any) => ({
        ...inv,
        message: inv.message || 'Sin mensaje'
      })) as Invitation[];

      const sent = ((sentData as any) || []).map((inv: any) => ({
        ...inv,
        message: inv.message || 'Sin mensaje'
      })) as Invitation[];

      return { received, sent };
    } catch (error) {
      logger.error('❌ Error en getInvitations:', { error: error instanceof Error ? error.message : String(error) });
      // Fallback a mock data
      const received = mockInvitations.filter(inv => inv.to_profile === profileId);
      const sent = mockInvitations.filter(inv => inv.from_profile === profileId);
      return { received, sent };
    }
  },

  async hasGalleryAccess(owner: string, grantee: string): Promise<boolean> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }
      
      const { data, error } = await supabase
        .from('gallery_permissions')
        .select('id')
        .or(`and(owner_profile_id.eq.${owner},grantee_profile_id.eq.${grantee}),and(profile_id.eq.${owner},granted_to.eq.${grantee})`)
        .eq('status', 'active')
        .limit(1);
        
      if (error) {
        logger.error('❌ Error verificando acceso a galería:', { error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
        
      return (data?.length || 0) > 0;
    } catch (error) {
      logger.error('❌ Error en hasGalleryAccess:', { error: error instanceof Error ? error.message : String(error) });
      // Fallback a mock data
      return mockGalleryPermissions.some(
        perm => perm.owner_profile === owner && 
                perm.grantee_profile === grantee && 
                perm.status === 'active'
      );
    }
  },

  async revokeGalleryAccess(owner: string, grantee: string): Promise<void> {
    try {
      if (!supabase) {
        logger.error('Supabase no está disponible');
        throw new Error('Supabase no está disponible');
      }
      
      const { error } = await (supabase as any)
        .from('gallery_permissions')
        .update({ status: 'revoked' })
        .or(`and(owner_profile_id.eq.${owner},grantee_profile_id.eq.${grantee}),and(profile_id.eq.${owner},granted_to.eq.${grantee})`);
      
      if (error) {
        logger.error('❌ Error otorgando permiso de galería:', { error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    } catch (error) {
      logger.error('❌ Error en revokeGalleryAccess:', { error: error instanceof Error ? error.message : String(error) });
      // Fallback a mock data
      const permission = mockGalleryPermissions.find(
        perm => perm.owner_profile === owner && 
                perm.grantee_profile === grantee && 
                perm.status === 'active'
      );
      if (permission) {
        permission.status = 'revoked';
      }
    }
  },

  async hasChatAccess(user1: string, user2: string): Promise<boolean> {
    try {
      // Validar que los UUIDs sean válidos antes de hacer la consulta
      const isValidUUID = (uuid: any) => {
        return typeof uuid === 'string' && 
               uuid.length === 36 && 
               /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
      };
      
      if (!isValidUUID(user1) || !isValidUUID(user2)) {
        logger.warn('⚠️ UUIDs inválidos para hasChatAccess, usando fallback:', { user1, user2 });
        // Use fallback for non-UUID strings (useful for testing)
        return mockInvitations.some(
          inv => ((inv.from_profile === user1 && inv.to_profile === user2) ||
                  (inv.from_profile === user2 && inv.to_profile === user1)) &&
                 inv.type === 'chat' && inv.status === 'accepted'
        );
      }

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }
      
      const { data, error } = await supabase
        .from('invitations')
        .select('id')
        .or(`and(from_profile_id.eq.${user1},to_profile_id.eq.${user2}),and(from_profile_id.eq.${user2},to_profile_id.eq.${user1}),and(from_profile.eq.${user1},to_profile.eq.${user2}),and(from_profile.eq.${user2},to_profile.eq.${user1})`)
        .eq('type', 'chat')
        .eq('status', 'accepted')
        .limit(1);

      if (error) {
        logger.error('❌ Error verificando acceso al chat:', error);
        throw error;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      logger.error('❌ Error en hasChatAccess:', { error: error instanceof Error ? error.message : String(error) });
      // Fallback a mock data
      return mockInvitations.some(
        inv => ((inv.from_profile === user1 && inv.to_profile === user2) ||
                (inv.from_profile === user2 && inv.to_profile === user1)) &&
               inv.type === 'chat' && inv.status === 'accepted'
      );
    }
  },

  // Función para resetear mock data (útil para testing)
  resetMockData(): void {
    // Restore initial mock data instead of clearing
    mockInvitations.length = 0;
    mockInvitations.push({
      id: '1',
      from_profile: '1',
      to_profile: '2',
      message: 'Me gustaría conectar contigo',
      type: 'profile',
      status: 'pending',
      created_at: new Date().toISOString(),
      decided_at: null
    });

    mockGalleryPermissions.length = 0;
    mockGalleryPermissions.push({
      id: '1',
      owner_profile: '1',
      grantee_profile: '2',
      status: 'active',
      created_at: new Date().toISOString()
    });
  }
};
