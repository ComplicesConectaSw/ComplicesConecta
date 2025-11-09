import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { safeGetItem } from '@/utils/safeLocalStorage';

// Interfaces para datos de Supabase
interface InvitationRow {
  id: string;
  from_profile: string;
  to_profile: string;
  type: string;
  status: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface GalleryPermissionRow {
  id: string;
  profile_id?: string;
  granted_by: string;
  granted_to: string;
  permission_type: string;
  created_at: string;
}

interface InvitationTemplateRow {
  id: string;
  template_name?: string;
  name?: string;
  template_content?: string;
  content?: string;
  invitation_type?: string;
  type?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InvitationStatusRow {
  status: string;
}

export interface Invitation {
  id: string;
  inviter_id: string;
  invitee_email: string;
  invitation_type?: string;
  type: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at?: string;
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
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
    const demoUser = safeGetItem<unknown>('demo_user', { validate: false, defaultValue: null });
    if (demoUser) {
      try {
        const user = typeof demoUser === 'string' ? JSON.parse(demoUser) : (demoUser as { id?: string } | null);
        if (user && typeof user === 'object' && 'id' in user) {
          return user.id || 'demo-user-id';
        }
        return 'demo-user-id';
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

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }

      const userId = this.getCurrentUserId();

      let query = supabase
        .from('invitations')
        .select(`
          id,
          from_profile,
          to_profile,
          type,
          status,
          metadata,
          created_at,
          updated_at
        `)
        .eq('from_profile', userId)
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
      const invitations: Invitation[] = (data || []).map((invitation: InvitationRow) => ({
        id: invitation.id,
        inviter_id: invitation.from_profile,
        invitee_email: invitation.to_profile, // Usar to_profile como ID
        invitation_type: undefined, // No existe en la tabla
        type: invitation.type || 'connection',
        status: invitation.status || 'pending',
        expires_at: undefined, // No existe en la tabla
        metadata: invitation.metadata || {},
        created_at: invitation.created_at || '',
        updated_at: invitation.updated_at || '',
        inviter: {
          id: invitation.from_profile,
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

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return null;
      }

      const userId = this.getCurrentUserId();

      const { data, error } = await supabase
        .from('invitations')
        .insert({
          from_profile: userId,
          to_profile: invitationData.invitee_email,
          type: invitationData.type || 'connection',
          status: 'pending'
        })
        .select(`
          id,
          from_profile,
          to_profile,
          type,
          status,
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
        inviter_id: data.from_profile || '',
        invitee_email: data.to_profile || '',
        invitation_type: undefined,
        type: data.type || 'connection',
        status: data.status as 'pending' | 'accepted' | 'declined' | 'expired',
        expires_at: undefined,
        metadata: invitationData.metadata || {},
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

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }

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

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }

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

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }

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
      
      // Mapear a GalleryPermission con campos requeridos
      return (data || []).map((perm: GalleryPermissionRow) => ({
        id: perm.id,
        gallery_owner_id: perm.profile_id || perm.granted_by || '',
        granted_by: perm.granted_by || '',
        granted_to: perm.granted_to || '',
        permission_type: perm.permission_type as 'view' | 'comment' | 'share',
        status: 'active' as 'active' | 'revoked' | 'expired',
        expires_at: undefined,
        created_at: perm.created_at || '',
        updated_at: perm.created_at || ''
      }));
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

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return null;
      }

      const userId = this.getCurrentUserId();

      const { data, error} = await supabase
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
      
      // Mapear a GalleryPermission con campos requeridos
      return {
        id: data.id,
        gallery_owner_id: permissionData.gallery_owner_id,
        granted_by: data.granted_by || userId,
        granted_to: permissionData.granted_to,
        permission_type: permissionData.permission_type,
        status: 'active',
        expires_at: permissionData.expires_at,
        created_at: data.created_at || '',
        updated_at: data.created_at || ''
      };
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

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return false;
      }

      // Actualizar permiso eliminándolo en lugar de cambiarlo
      const { error } = await supabase
        .from('gallery_permissions')
        .delete()
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

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return [];
      }

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
      
      // Mapear a InvitationTemplate con campo template_type
      return (data || []).map((template: InvitationTemplateRow) => ({
        id: template.id,
        template_name: template.template_name || template.name || '',
        template_content: template.template_content || template.content || '',
        template_type: template.invitation_type || template.type || 'default',
        is_active: template.is_active !== false,
        created_at: template.created_at || '',
        updated_at: template.updated_at || ''
      }));
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

      if (!supabase) {
        logger.error('Supabase no está disponible');
        return {
          totalInvitations: 0,
          pendingInvitations: 0,
          acceptedInvitations: 0,
          declinedInvitations: 0,
          expiredInvitations: 0,
          acceptanceRate: 0
        };
      }

      const userId = this.getCurrentUserId();

      // Obtener todas las invitaciones del usuario
      const { data, error } = await supabase
        .from('invitations')
        .select('status')
        .eq('from_profile', userId);

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

      const invitations: InvitationStatusRow[] = data || [];
      const totalInvitations = invitations.length;
      const pendingInvitations = invitations.filter((i: InvitationStatusRow) => i.status === 'pending').length;
      const acceptedInvitations = invitations.filter((i: InvitationStatusRow) => i.status === 'accepted').length;
      const declinedInvitations = invitations.filter((i: InvitationStatusRow) => i.status === 'declined').length;
      const expiredInvitations = invitations.filter((i: InvitationStatusRow) => i.status === 'expired').length;
      const acceptanceRate = totalInvitations > 0 ? (acceptedInvitations / totalInvitations) * 100 : 0;

      const stats = {
        totalInvitations,
        pendingInvitations,
        acceptedInvitations,
        declinedInvitations,
        expiredInvitations,
        acceptanceRate
      };

      // Registrar estadísticas en invitation_statistics (async, no bloquea)
      this.logInvitationStatistics(userId, stats).catch(err => 
        logger.debug('Failed to log invitation statistics:', { error: String(err) })
      );

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

  /**
   * Registra estadísticas de invitaciones en la base de datos
   * @private
   */
  private async logInvitationStatistics(
    userId: string,
    stats: {
      totalInvitations: number;
      pendingInvitations: number;
      acceptedInvitations: number;
      declinedInvitations: number;
      expiredInvitations: number;
      acceptanceRate: number;
    }
  ): Promise<void> {
    try {
      if (!supabase) return;

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      await supabase
        .from('invitation_statistics')
        .insert({
          user_id: userId,
          period_start: periodStart,
          period_end: periodEnd,
          total_invitations: stats.totalInvitations,
          pending_invitations: stats.pendingInvitations,
          accepted_invitations: stats.acceptedInvitations,
          declined_invitations: stats.declinedInvitations,
          expired_invitations: stats.expiredInvitations,
          acceptance_rate: stats.acceptanceRate,
        });
    } catch (error) {
      logger.debug('Failed to log invitation statistics:', { error: String(error) });
    }
  }
}

export const invitationsService = new InvitationsService();
export default invitationsService;
