import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { ProfileReportModal } from './ProfileReportModal';
import { profileReportService } from '@/features/profile/ProfileReportService';
import { toast } from 'sonner';

interface ProfileReportButtonProps {
  reportedUserId: string;
  reportedUserName: string;
  className?: string;
  variant?: 'icon' | 'button' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

export const ProfileReportButton: React.FC<ProfileReportButtonProps> = ({
  reportedUserId,
  reportedUserName,
  className = '',
  variant = 'button',
  size = 'md'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canReport, setCanReport] = useState(true);
  const [checkingPermissions, setCheckingPermissions] = useState(false);

  const handleClick = async () => {
    setCheckingPermissions(true);
    try {
      const result = await profileReportService.canUserReport();

      if (result.success && result.canReport) {
        setIsModalOpen(true);
      } else {
        toast.error(result.reason || 'No puedes reportar en este momento');
        setCanReport(false);
      }
    } catch {
      toast.error('Error al verificar permisos');
    } finally {
      setCheckingPermissions(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-base px-6 py-3';
      default: return 'text-sm px-4 py-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'lg': return 'w-6 h-6';
      default: return 'w-4 h-4';
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={!canReport || checkingPermissions}
          className={`
            p-2 rounded-full transition-all duration-200
            hover:bg-red-50 dark:hover:bg-red-900/20
            disabled:opacity-50 disabled:cursor-not-allowed
            group ${className}
          `}
          title="Reportar perfil"
        >
          {checkingPermissions ? (
            <div className={`${getIconSize()} border-2 border-red-500 border-t-transparent rounded-full animate-spin`} />
          ) : (
            <Flag className={`${getIconSize()} text-gray-500 group-hover:text-red-500 transition-colors`} />
          )}
        </button>

        <ProfileReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          reportedUserId={reportedUserId}
          reportedUserName={reportedUserName}
        />
      </>
    );
  }

  if (variant === 'text') {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={!canReport || checkingPermissions}
          className={`
            text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300
            hover:underline transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${getSizeClasses()} ${className}
          `}
        >
          {checkingPermissions ? 'Verificando...' : 'Reportar perfil'}
        </button>

        <ProfileReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          reportedUserId={reportedUserId}
          reportedUserName={reportedUserName}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!canReport || checkingPermissions}
        className={`
          inline-flex items-center space-x-2 
          border border-red-300 dark:border-red-600
          text-red-700 dark:text-red-300
          hover:bg-red-50 dark:hover:bg-red-900/20
          hover:border-red-400 dark:hover:border-red-500
          disabled:opacity-50 disabled:cursor-not-allowed
          rounded-lg transition-all duration-200
          ${getSizeClasses()} ${className}
        `}
      >
        {checkingPermissions ? (
          <div className={`${getIconSize()} border-2 border-red-500 border-t-transparent rounded-full animate-spin`} />
        ) : (
          <Flag className={getIconSize()} />
        )}
        <span>{checkingPermissions ? 'Verificando...' : 'Reportar'}</span>
      </button>

      <ProfileReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reportedUserId={reportedUserId}
        reportedUserName={reportedUserName}
      />
    </>
  );
};
