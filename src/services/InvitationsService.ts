import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface Invitation {
  id: string;
  inviter_id: string;
  invitee_email: string;
  invitation_type?: string;
  type: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Datos del invitador
  inviter?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface GalleryPermission {
  id: string;
  gallery_owner_id: string;
  granted_by: string;
  granted_to: string;
  permission_type: 'view' | 'comment' | 'share';
  status: 'active' | 'revoked' | 'expired';
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InvitationTemplate {
  id: string;
  template_name: string;
  template_content: string;
  template_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationData {
  invitee_email: string;
  invitation_type?: string;
  type: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface CreateGalleryPermissionData {
  gallery_owner_id: string;
  granted_to: string;
  permission_type: 'view' | 'comment' | 'share';
  expires_at?: string;
}

class InvitationsService {
  constructor() {
    logger.info('InvitationsService initialized');
  }

  /**
   * Obtener ID del usuario actual
   */
  private getCurrentUserId(): string {
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser);
        return user.id || 'demo-user-id';
      } catch {
        return 'demo-user-id';
      }
    }
    throw new Error('No authenticated user found');
  }

  /**
   * Obtener invitaciones del usuario usando datos reales de Supabase
   */
  async getUserInvitations(
    page = 0,
    limit = 20,
    status?: 'pending' | 'accepted' | 'declined' | 'expired'
  ): Promise<Invitation[]> {
    try {
      logger.info('Getting user invitations from Supabase', { page, limit, status });

      const userId = this.getCurrentUserId();

      let query = supabase
        .from('invitations')
        .select(`
          id,
          inviter_id,
          invited_user_id,
          invitation_type,
          type,
          status,
          expires_at,
          metadata,
          created_at,
          updated_at
        `)
        .eq('inviter_id', userId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error getting invitations from Supabase:', error);
        return [];
      }

      // Mapear datos de Supabase al formato esperado
      const invitations: Invitation[] = (data || []).map((invitation: any) => ({
        id: invitation.id,
        inviter_id: invitation.inviter_id,
        invitee_email: invitation.invitee_email,
        invitation_type: invitation.invitation_type,
        type: invitation.type,
        status: invitation.status || 'pending',
        expires_at: invitation.expires_at,
        metadata: invitation.metadata || {},
        created_at: invitation.created_at,
        updated_at: invitation.updated_at,
        inviter: {
          id: invitation.inviter_id,
          first_name: 'Usuario',
          last_name: 'Anónimo',
          avatar_url: undefined
        }
      }));

      logger.info('✅ Invitations loaded successfully from Supabase', { count: invitations.length });
      return invitations;
    } catch (error) {
      logger.error('Error in getUserInvitations:', { error: String(error) });
      return [];
    }
  }

  /**
   * Crear invitación usando datos reales de Supabase
   */
  async createInvitation(invitationData: CreateInvitationData): Promise<Invitation | null> {
    try {
      logger.info('Creating invitation in Supabase', { invitationData });

      const userId = this.getCurrentUserId();

      const { data, error } = await supabase
        .from('invitations')
        .insert({
          inviter_id: userId,
          invited_user_id: invitationData.invitee_email, // Usar invited_user_id en lugar de invitee_email
          invitation_type: invitationData.invitation_type,
          type: invitationData.type,
          status: 'pending',
          expires_at: invitationData.expires_at,
          metadata: invitationData.metadata || {}
        })
        .select(`
          id,
          inviter_id,
          invited_user_id,
          invitation_type,
          type,
          status,
          expires_at,
          metadata,
          created_at,
          updated_at
        `)
        .single();

      if (error) {
        logger.error('Error creating invitation in Supabase:', error);
        return null;
      }

      const newInvitation: Invitation = {
        id: data.id,
        inviter_id: data.inviter_id,
        invitee_email: data.invited_user_id, // Usar invited_user_id como email
        invitation_type: data.invitation_type || undefined,
        type: data.type,
        status: data.status as 'pending' | 'accepted' | 'declined' | 'expired',
        expires_at: data.expires_at || undefined,
        metadata: data.metadata as Record<string, any> || {},
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };

      logger.info('✅ Invitation created successfully in Supabase', { invitationId: newInvitation.id });
      return newInvitation;
    } catch (error) {
      logger.error('Error in createInvitation:', { error: String(error) });
      return null;
    }
  }

  /**
   * Aceptar invitación usando datos reales de Supabase
   */
  async acceptInvitation(invitationId: string): Promise<boolean> {
    try {
      logger.info('Accepting invitation in Supabase', { invitationId });

      const { error } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) {
        logger.error('Error accepting invitation:', error);
        return false;
      }

      logger.info('✅ Invitation accepted successfully', { invitationId });
      return true;
    } catch (error) {
      logger.error('Error in acceptInvitation:', { error: String(error) });
      return false;
    }
  }

  /**
   * Declinar invitación usando datos reales de Supabase
   */
  async declineInvitation(invitationId: string): Promise<boolean> {
    try {
      logger.info('Declining invitation in Supabase', { invitationId });

      const { error } = await supabase
        .from('invitations')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) {
        logger.error('Error declining invitation:', error);
        return false;
      }

      logger.info('✅ Invitation declined successfully', { invitationId });
      return true;
    } catch (error) {
      logger.error('Error in declineInvitation:', { error: String(error) });
      return false;
    }
  }

  /**
   * Obtener permisos de galería del usuario usando datos reales de Supabase
   */
  async getUserGalleryPermissions(
    page = 0,
    limit = 20,
    status?: 'active' | 'revoked' | 'expired'
  ): Promise<GalleryPermission[]> {
    try {
      logger.info('Getting user gallery permissions from Supabase', { page, limit, status });

      const userId = this.getCurrentUserId();

      let query = supabase
        .from('gallery_permissions')
        .select('*')
        .eq('granted_to', userId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error getting gallery permissions from Supabase:', error);
        return [];
      }

      logger.info('✅ Gallery permissions loaded successfully from Supabase', { count: data?.length || 0 });
      return (data || []) as GalleryPermission[];
    } catch (error) {
      logger.error('Error in getUserGalleryPermissions:', { error: String(error) });
      return [];
    }
  }

  /**
   * Crear permiso de galería usando datos reales de Supabase
   */
  async createGalleryPermission(permissionData: CreateGalleryPermissionData): Promise<GalleryPermission | null> {
    try {
      logger.info('Creating gallery permission in Supabase', { permissionData });

      const userId = this.getCurrentUserId();

      const { data, error } = await supabase
        .from('gallery_permissions')
        .insert({
          gallery_owner_id: permissionData.gallery_owner_id,
          granted_by: userId,
          granted_to: permissionData.granted_to,
          permission_type: permissionData.permission_type,
          status: 'active',
          expires_at: permissionData.expires_at
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating gallery permission in Supabase:', error);
        return null;
      }

      logger.info('✅ Gallery permission created successfully in Supabase', { permissionId: data.id });
      return data as GalleryPermission;
    } catch (error) {
      logger.error('Error in createGalleryPermission:', { error: String(error) });
      return null;
    }
  }

  /**
   * Revocar permiso de galería usando datos reales de Supabase
   */
  async revokeGalleryPermission(permissionId: string): Promise<boolean> {
    try {
      logger.info('Revoking gallery permission in Supabase', { permissionId });

      const { error } = await supabase
        .from('gallery_permissions')
        .update({
          status: 'revoked',
          updated_at: new Date().toISOString()
        })
        .eq('id', permissionId);

      if (error) {
        logger.error('Error revoking gallery permission:', error);
        return false;
      }

      logger.info('✅ Gallery permission revoked successfully', { permissionId });
      return true;
    } catch (error) {
      logger.error('Error in revokeGalleryPermission:', { error: String(error) });
      return false;
    }
  }

  /**
   * Obtener plantillas de invitación usando datos reales de Supabase
   */
  async getInvitationTemplates(): Promise<InvitationTemplate[]> {
    try {
      logger.info('Getting invitation templates from Supabase');

      const { data, error } = await supabase
        .from('invitation_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error getting invitation templates from Supabase:', error);
        return [];
      }

      logger.info('✅ Invitation templates loaded successfully from Supabase', { count: data?.length || 0 });
      return (data || []) as InvitationTemplate[];
    } catch (error) {
      logger.error('Error in getInvitationTemplates:', { error: String(error) });
      return [];
    }
  }

  /**
   * Obtener estadísticas de invitaciones usando datos reales de Supabase
   */
  async getInvitationStatistics(): Promise<{
    totalInvitations: number;
    pendingInvitations: number;
    acceptedInvitations: number;
    declinedInvitations: number;
    expiredInvitations: number;
    acceptanceRate: number;
  }> {
    try {
      logger.info('Getting invitation statistics from Supabase');

      const { data, error } = await supabase
        .from('invitation_statistics')
        .select('*')
        .single();

      if (error) {
        logger.error('Error getting invitation statistics from Supabase:', error);
        return {
          totalInvitations: 0,
          pendingInvitations: 0,
          acceptedInvitations: 0,
          declinedInvitations: 0,
          expiredInvitations: 0,
          acceptanceRate: 0
        };
      }

      const stats = {
        totalInvitations: data?.total_invitations || 0,
        pendingInvitations: data?.pending_invitations || 0,
        acceptedInvitations: data?.accepted_invitations || 0,
        declinedInvitations: data?.declined_invitations || 0,
        expiredInvitations: data?.expired_invitations || 0,
        acceptanceRate: data?.acceptance_rate || 0
      };

      logger.info('✅ Invitation statistics loaded successfully', stats);
      return stats;
    } catch (error) {
      logger.error('Error in getInvitationStatistics:', { error: String(error) });
      return {
        totalInvitations: 0,
        pendingInvitations: 0,
        acceptedInvitations: 0,
        declinedInvitations: 0,
        expiredInvitations: 0,
        acceptanceRate: 0
      };
    }
  }
}

export const invitationsService = new InvitationsService();
export default invitationsService;
