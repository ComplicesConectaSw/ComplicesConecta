import { lazy } from 'react';

// Lazy loading para componentes de UI pesados que existen
export const HCaptchaWidget = lazy(() => import('@/components/HCaptchaWidget').then(module => ({ default: module.HCaptchaWidget })));
export const WelcomeModal = lazy(() => import('@/components/WelcomeModal').then(module => ({ default: module.WelcomeModal })));
export const SendRequestDialog = lazy(() => import('@/components/SendRequestDialog').then(module => ({ default: module.SendRequestDialog })));
export const ProfileGrid = lazy(() => import('@/components/ProfileGrid').then(module => ({ default: module.ProfileGrid })));
export const ProfileFilters = lazy(() => import('@/components/ProfileFilters').then(module => ({ default: module.ProfileFilters })));
