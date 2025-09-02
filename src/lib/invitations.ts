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

// Mock data para invitaciones
export const mockInvitations: Invitation[] = [
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

// Mock data para permisos de galería
export const mockGalleryPermissions: GalleryPermission[] = [
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

// Servicios mock para invitaciones
export const invitationService = {
  async sendInvitation(invitation: Omit<Invitation, 'id' | 'created_at' | 'status'>): Promise<Invitation> {
    const newInvitation: Invitation = {
      ...invitation,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    
    mockInvitations.push(newInvitation);
    return newInvitation;
  },

  async respondInvitation(invitationId: string, action: 'accept' | 'decline'): Promise<Invitation> {
    const invitation = mockInvitations.find(inv => inv.id === invitationId);
    if (!invitation) throw new Error('Invitación no encontrada');
    
    invitation.status = action === 'accept' ? 'accepted' : 'declined';
    invitation.decided_at = new Date().toISOString();
    
    // Si se acepta una invitación de galería, crear permiso
    if (action === 'accept' && invitation.type === 'gallery') {
      const permission: GalleryPermission = {
        id: Math.random().toString(36).substr(2, 9),
        owner_profile: invitation.to_profile,
        grantee_profile: invitation.from_profile,
        scope: 'private_gallery',
        source_invitation: invitation.id,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      mockGalleryPermissions.push(permission);
    }
    
    return invitation;
  },

  async getInvitations(profileId: string): Promise<{ received: Invitation[], sent: Invitation[] }> {
    const received = mockInvitations.filter(inv => inv.to_profile === profileId);
    const sent = mockInvitations.filter(inv => inv.from_profile === profileId);
    return { received, sent };
  },

  async hasGalleryAccess(owner: string, grantee: string): Promise<boolean> {
    return mockGalleryPermissions.some(
      perm => perm.owner_profile === owner && 
              perm.grantee_profile === grantee && 
              perm.status === 'active'
    );
  },

  async revokeGalleryAccess(owner: string, grantee: string): Promise<void> {
    const permission = mockGalleryPermissions.find(
      perm => perm.owner_profile === owner && 
              perm.grantee_profile === grantee && 
              perm.status === 'active'
    );
    if (permission) {
      permission.status = 'revoked';
    }
  },

  async hasChatAccess(user1: string, user2: string): Promise<boolean> {
    // Verificar si hay invitación de chat aceptada entre los usuarios
    return mockInvitations.some(
      inv => ((inv.from_profile === user1 && inv.to_profile === user2) ||
              (inv.from_profile === user2 && inv.to_profile === user1)) &&
             inv.type === 'chat' && 
             inv.status === 'accepted'
    );
  }
};
