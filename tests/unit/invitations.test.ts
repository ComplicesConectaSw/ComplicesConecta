import { describe, it, expect, beforeEach } from 'vitest';
import { 
  invitationService,
  Invitation,
  GalleryPermission 
} from '../../src/lib/invitations';

describe('Invitations System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset the invitation service mock data
    invitationService.resetMockData();
  });

  describe('sendInvitation', () => {
    it('should send a gallery invitation successfully', async () => {
      const invitation = await invitationService.sendInvitation({
        from_profile: 'user1',
        to_profile: 'user2',
        message: 'Test message',
        type: 'gallery'
      });
      
      expect(invitation).toBeDefined();
      expect(invitation.type).toBe('gallery');
      expect(invitation.from_profile).toBe('user1');
      expect(invitation.to_profile).toBe('user2');
      expect(invitation.status).toBe('pending');
    });

    it('should send a chat invitation successfully', async () => {
      const invitation = await invitationService.sendInvitation({
        from_profile: 'user1',
        to_profile: 'user2',
        message: 'Test chat',
        type: 'chat'
      });
      
      expect(invitation.type).toBe('chat');
    });
  });

  describe('respondInvitation', () => {
    it('should accept an invitation successfully', async () => {
      const invitation = await invitationService.sendInvitation({
        from_profile: 'user1',
        to_profile: 'user2',
        message: 'Test',
        type: 'gallery'
      });
      
      const result = await invitationService.respondInvitation(invitation.id, 'accept');
      
      expect(result.status).toBe('accepted');
    });

    it('should reject an invitation successfully', async () => {
      const invitation = await invitationService.sendInvitation({
        from_profile: 'user1',
        to_profile: 'user2',
        message: 'Test',
        type: 'chat'
      });
      
      const result = await invitationService.respondInvitation(invitation.id, 'decline');
      
      expect(result.status).toBe('declined');
    });
  });

  describe('hasGalleryAccess', () => {
    it('should return false when no access granted', async () => {
      const hasAccess = await invitationService.hasGalleryAccess('user1', 'user2');
      expect(hasAccess).toBe(false);
    });

    it('should return true after accepting gallery invitation', async () => {
      const invitation = await invitationService.sendInvitation({
        from_profile: 'user1',
        to_profile: 'user2',
        message: 'Test',
        type: 'gallery'
      });
      await invitationService.respondInvitation(invitation.id, 'accept');
      
      const hasAccess = await invitationService.hasGalleryAccess('user2', 'user1');
      expect(hasAccess).toBe(true);
    });
  });

  describe('hasChatAccess', () => {
    it('should return false when no access granted', async () => {
      const hasAccess = await invitationService.hasChatAccess('user1', 'user2');
      expect(hasAccess).toBe(false);
    });

    it('should return true after accepting chat invitation', async () => {
      const invitation = await invitationService.sendInvitation({
        from_profile: 'user1',
        to_profile: 'user2',
        message: 'Test',
        type: 'chat'
      });
      await invitationService.respondInvitation(invitation.id, 'accept');
      
      const hasAccess = await invitationService.hasChatAccess('user2', 'user1');
      expect(hasAccess).toBe(true);
    });
  });

  describe('getInvitations', () => {
    it('should return empty arrays for new user', async () => {
      const result = await invitationService.getInvitations('user1');
      
      expect(result.received).toEqual([]);
      expect(result.sent).toEqual([]);
    });

    it('should return received invitations', async () => {
      await invitationService.sendInvitation({
        from_profile: 'user1',
        to_profile: 'user2',
        message: 'Test',
        type: 'gallery'
      });
      await invitationService.sendInvitation({
        from_profile: 'user3',
        to_profile: 'user2',
        message: 'Test',
        type: 'chat'
      });
      
      const result = await invitationService.getInvitations('user2');
      
      expect(result.received).toHaveLength(2);
      expect(result.received[0].to_profile).toBe('user2');
      expect(result.received[1].to_profile).toBe('user2');
    });

    it('should return sent invitations', async () => {
      await invitationService.sendInvitation({
        from_profile: 'user1',
        to_profile: 'user2',
        message: 'Test',
        type: 'gallery'
      });
      await invitationService.sendInvitation({
        from_profile: 'user1',
        to_profile: 'user3',
        message: 'Test',
        type: 'chat'
      });
      
      const result = await invitationService.getInvitations('user1');
      
      expect(result.sent).toHaveLength(2);
      expect(result.sent[0].from_profile).toBe('user1');
      expect(result.sent[1].from_profile).toBe('user1');
    });
  });
});
