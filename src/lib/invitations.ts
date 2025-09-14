import { supabase } from '@/integrations/supabase/client';

export interface Invitation {
  id: string;
  from_profile: string;
  to_profile: string;
  message: string;
  type: 'profile' | 'gallery' | 'chat';
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  created_at: string;
  decided_at?: string;
}

export interface GalleryPermission {
  id: string;
  owner_profile: string;
  grantee_profile: string;
  scope: 'private_gallery' | 'album';
  source_invitation: string;
  status: 'active' | 'revoked';
  created_at: string;
}

// Mock data para invitaciones - using let for test reset capability
let mockInvitations: Invitation[] = [
  {
    id: '1',
    from_profile: '2',
    to_profile: '1',
    message: 'Hola, me encantaría conocerte mejor y ver tu galería privada.',
    type: 'gallery',
    status: 'pending',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
  },
  {
    id: '2',
    from_profile: '3',
    to_profile: '1',
    message: '¡Hola! ¿Te gustaría chatear en privado?',
    type: 'chat',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
  },
  {
    id: '3',
    from_profile: '1',
    to_profile: '4',
    message: 'Me pareces muy interesante, ¿podríamos conectar?',
    type: 'profile',
    status: 'accepted',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
    decided_at: new Date(Date.now() - 86400000).toISOString(),
  }
];

// Mock data para permisos de galería - using let for test reset capability
let mockGalleryPermissions: GalleryPermission[] = [
  {
    id: '1',
    owner_profile: '4',
    grantee_profile: '1',
    scope: 'private_gallery',
    source_invitation: '3',
    status: 'active',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  }
];

// Servicios reales para invitaciones usando Supabase
export const invitationService = {
  async sendInvitation(invitation: Omit<Invitation, 'id' | 'created_at' | 'status'>): Promise<Invitation> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          from_profile: invitation.from_profile,
          to_profile: invitation.to_profile,
          message: invitation.message,
          type: invitation.type,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error enviando invitación:', error);
        throw error;
      }
      
      return {
        id: data.id,
        from_profile: data.from_profile,
        to_profile: data.to_profile,
        message: data.message || '',
        type: data.type as 'profile' | 'gallery' | 'chat',
        status: data.status as 'pending' | 'accepted' | 'declined' | 'revoked',
        created_at: data.created_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error en sendInvitation:', error);
      // Fallback a mock data para desarrollo
      const newInvitation: Invitation = {
        ...invitation,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      mockInvitations.push(newInvitation);
      return newInvitation;
    }
  },

  async respondInvitation(invitationId: string, action: 'accept' | 'decline'): Promise<Invitation> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .update({
          status: action === 'accept' ? 'accepted' : 'declined',
          decided_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error respondiendo invitación:', error);
        throw error;
      }
      
      const invitation: Invitation = {
        id: data.id,
        from_profile: data.from_profile,
        to_profile: data.to_profile,
        message: data.message || '',
        type: data.type as 'profile' | 'gallery' | 'chat',
        status: data.status as 'pending' | 'accepted' | 'declined' | 'revoked',
        created_at: data.created_at || new Date().toISOString(),
        decided_at: data.decided_at || undefined
      };
      
      // Si se acepta una invitación de galería, crear permiso
      if (action === 'accept' && invitation.type === 'gallery') {
        await supabase
          .from('gallery_permissions')
          .insert({
            owner_profile: invitation.to_profile,
            grantee_profile: invitation.from_profile,
            scope: 'private_gallery',
            source_invitation: invitation.id,
            status: 'active'
          });
      }
      
      return invitation;
    } catch (error) {
      console.error('❌ Error en respondInvitation:', error);
      // Fallback a mock data
      const invitation = mockInvitations.find(inv => inv.id === invitationId);
      if (!invitation) throw new Error('Invitación no encontrada');
      
      invitation.status = action === 'accept' ? 'accepted' : 'declined';
      invitation.decided_at = new Date().toISOString();
      return invitation;
    }
  },

  async getInvitations(profileId: string): Promise<{ received: Invitation[], sent: Invitation[] }> {
    try {
      // Obtener invitaciones recibidas
      const { data: receivedData, error: receivedError } = await supabase
        .from('invitations')
        .select(`
          id,
          from_profile,
          to_profile,
          message,
          type,
          status,
          created_at,
          decided_at,
          from_profile:profiles!invitations_from_profile_fkey(first_name, last_name)
        `)
        .eq('to_profile', profileId)
        .order('created_at', { ascending: false });
      
      // Obtener invitaciones enviadas
      const { data: sentData, error: sentError } = await supabase
        .from('invitations')
        .select(`
          id,
          from_profile_id,
          to_profile_id,
          message,
          type,
          status,
          created_at,
          decided_at,
          to_profile:profiles!invitations_to_profile_fkey(first_name, last_name)
        `)
        .eq('from_profile', profileId)
        .order('created_at', { ascending: false });
      
      if (receivedError || sentError) {
        console.error('❌ Error obteniendo invitaciones:', receivedError || sentError);
        throw receivedError || sentError;
      }
      
      const received: Invitation[] = (receivedData || []).map(item => ({
        id: item.id,
        from_profile: `${item.from_profile?.first_name || 'Usuario'} ${item.from_profile?.last_name || ''}`.trim(),
        to_profile: profileId,
        message: item.message,
        type: item.type,
        status: item.status,
        created_at: item.created_at,
        decided_at: item.decided_at
      }));
      
      const sent: Invitation[] = (sentData || []).map(item => ({
        id: item.id,
        from_profile: profileId,
        to_profile: `${item.to_profile?.first_name || 'Usuario'} ${item.to_profile?.last_name || ''}`.trim(),
        message: item.message,
        type: item.type,
        status: item.status,
        created_at: item.created_at,
        decided_at: item.decided_at
      }));
      
      return { received, sent };
    } catch (error) {
      console.error('❌ Error en getInvitations:', error);
      // Fallback a mock data
      const received = mockInvitations.filter(inv => inv.to_profile === profileId);
      const sent = mockInvitations.filter(inv => inv.from_profile === profileId);
      return { received, sent };
    }
  },

  async hasGalleryAccess(owner: string, grantee: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('gallery_permissions')
        .select('id')
        .eq('owner_profile_id', owner)
        .eq('grantee_profile_id', grantee)
        .eq('status', 'active')
        .limit(1);
      
      if (error) {
        console.error('❌ Error verificando acceso a galería:', error);
        return false;
      }
      
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('❌ Error en hasGalleryAccess:', error);
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
      const { error } = await supabase
        .from('gallery_permissions')
        .update({ status: 'revoked' })
        .eq('owner_profile_id', owner)
        .eq('grantee_profile_id', grantee)
        .eq('status', 'active');
      
      if (error) {
        console.error('❌ Error revocando acceso a galería:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ Error en revokeGalleryAccess:', error);
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
      const { data, error } = await supabase
        .from('invitations')
        .select('id')
        .or(`and(from_profile.eq.${user1},to_profile.eq.${user2}),and(from_profile.eq.${user2},to_profile.eq.${user1})`)
        .eq('type', 'chat')
        .eq('status', 'accepted')
        .limit(1);
      
      if (error) {
        console.error('❌ Error verificando acceso al chat:', error);
        return false;
      }
      
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('❌ Error en hasChatAccess:', error);
      // Fallback a mock data
      return mockInvitations.some(
        inv => ((inv.from_profile === user1 && inv.to_profile === user2) ||
                (inv.from_profile === user2 && inv.to_profile === user1)) &&
               inv.type === 'chat' && 
               inv.status === 'accepted'
      );
    }
  },

  resetMockData(): void {
    mockInvitations.length = 0;
    mockGalleryPermissions.length = 0;
  }
};
