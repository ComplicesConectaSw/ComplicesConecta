import { Search, Users, Heart, MessageCircle, Calendar, Crown, BarChart3, Settings, Bell, Shield } from 'lucide-react';
import profile1 from '@/assets/profile-1.jpg';

export const mainNavItems = [
  { title: 'Descubrir', url: '/discover', icon: Search, badge: 'Nuevo' },
  { title: 'Perfiles', url: '/profiles', icon: Users },
  { title: 'Matches', url: '/matches', icon: Heart, badge: '3' },
  { title: 'Chat', url: '/chat', icon: MessageCircle, badge: '5' },
  { title: 'Eventos', url: '/events', icon: Calendar },
];

export const premiumItems = [
  { title: 'Premium', url: '/premium', icon: Crown },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
];

export const settingsItems = [
  { title: 'Configuración', url: '/settings', icon: Settings },
  { title: 'Notificaciones', url: '/notifications', icon: Bell },
  { title: 'Privacidad', url: '/privacy', icon: Shield },
];

export const mockUser = {
  name: 'María González',
  avatar: profile1,
  subscription: 'Premium',
  notifications: 8,
};
