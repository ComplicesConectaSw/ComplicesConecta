/**
 * Skeleton Loading Components - Sistema de carga con esqueletos
 * Implementa componentes de carga para mejorar la UX
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = true,
  animate = true
}) => {
  return (
    <div
      className={cn(
        'bg-gray-300 dark:bg-gray-700',
        rounded && 'rounded-lg',
        animate && 'animate-pulse',
        className
      )}
      style={{
        width: width || '100%',
        height: height || '1rem'
      }}
    />
  );
};

export const ProfileCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 border rounded-lg', className)}>
    {/* Imagen del perfil */}
    <Skeleton height={200} className="mb-4" />
    
    {/* Información del perfil */}
    <div className="space-y-2">
      <Skeleton height={20} width="60%" />
      <Skeleton height={16} width="40%" />
      <Skeleton height={16} width="80%" />
    </div>
    
    {/* Botones de acción */}
    <div className="flex gap-2 mt-4">
      <Skeleton height={40} width="50%" />
      <Skeleton height={40} width="50%" />
    </div>
  </div>
);

export const ChatMessageSkeleton: React.FC<{ isOwn?: boolean }> = ({ isOwn = false }) => (
  <div className={cn('flex gap-2 mb-4', isOwn && 'flex-row-reverse')}>
    {/* Avatar */}
    <Skeleton width={40} height={40} className="rounded-full flex-shrink-0" />
    
    {/* Mensaje */}
    <div className={cn('flex flex-col', isOwn && 'items-end')}>
      <Skeleton height={16} width={200} className="mb-1" />
      <Skeleton height={12} width={100} />
    </div>
  </div>
);

export const ChatListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex gap-3 p-3 border rounded-lg">
        <Skeleton width={50} height={50} className="rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="80%" />
        </div>
        <Skeleton height={12} width={60} />
      </div>
    ))}
  </div>
);

export const DiscoverGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <ProfileCardSkeleton key={i} />
    ))}
  </div>
);

export const AdminDashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <Skeleton height={20} width="60%" className="mb-2" />
          <Skeleton height={32} width="40%" />
        </div>
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-4 border rounded-lg">
        <Skeleton height={20} width="40%" className="mb-4" />
        <Skeleton height={200} />
      </div>
      <div className="p-4 border rounded-lg">
        <Skeleton height={20} width="40%" className="mb-4" />
        <Skeleton height={200} />
      </div>
    </div>
    
    {/* Table */}
    <div className="p-4 border rounded-lg">
      <Skeleton height={20} width="30%" className="mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton height={16} width="20%" />
            <Skeleton height={16} width="30%" />
            <Skeleton height={16} width="25%" />
            <Skeleton height={16} width="25%" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const CoupleProfileSkeleton: React.FC = () => (
  <div className="p-4 border rounded-lg">
    {/* Fotos de pareja */}
    <div className="grid grid-cols-2 gap-4 mb-4">
      <Skeleton height={150} />
      <Skeleton height={150} />
    </div>
    
    {/* Información */}
    <div className="space-y-2">
      <Skeleton height={20} width="70%" />
      <Skeleton height={16} width="50%" />
      <Skeleton height={16} width="80%" />
    </div>
    
    {/* Botones */}
    <div className="flex gap-2 mt-4">
      <Skeleton height={40} width="50%" />
      <Skeleton height={40} width="50%" />
    </div>
  </div>
);

export const NotificationSkeleton: React.FC = () => (
  <div className="flex gap-3 p-3 border rounded-lg">
    <Skeleton width={40} height={40} className="rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-1">
      <Skeleton height={16} width="80%" />
      <Skeleton height={12} width="60%" />
    </div>
    <Skeleton height={12} width={60} />
  </div>
);

export const NotificationListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <NotificationSkeleton key={i} />
    ))}
  </div>
);

export const TokenDashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Balance card */}
    <div className="p-6 border rounded-lg">
      <Skeleton height={24} width="40%" className="mb-4" />
      <Skeleton height={48} width="60%" />
    </div>
    
    {/* Actions */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg text-center">
          <Skeleton height={20} width="60%" className="mx-auto mb-2" />
          <Skeleton height={16} width="80%" className="mx-auto" />
        </div>
      ))}
    </div>
    
    {/* History */}
    <div className="p-4 border rounded-lg">
      <Skeleton height={20} width="30%" className="mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton height={16} width="40%" />
            <Skeleton height={16} width="20%" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', sizeClasses[size])} />
  );
};

export const LoadingOverlay: React.FC<{ children: React.ReactNode; loading: boolean }> = ({ 
  children, 
  loading 
}) => (
  <div className="relative">
    {children}
    {loading && (
      <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-50">
        <LoadingSpinner size="lg" />
      </div>
    )}
  </div>
);

export default {
  Skeleton,
  ProfileCardSkeleton,
  ChatMessageSkeleton,
  ChatListSkeleton,
  DiscoverGridSkeleton,
  AdminDashboardSkeleton,
  CoupleProfileSkeleton,
  NotificationSkeleton,
  NotificationListSkeleton,
  TokenDashboardSkeleton,
  LoadingSpinner,
  LoadingOverlay
};
