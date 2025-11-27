import React from 'react';
import { Badge } from "@/components/ui/badge";
import { appConfig } from '@/lib/app-config';

interface ModeIndicatorProps {
  className?: string;
}

export const ModeIndicator: React.FC<ModeIndicatorProps> = ({ className = "" }) => {
  if (!appConfig.ui.showDemoIndicator) {
    return null;
  }

  return (
    <Badge 
      className={`bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 px-2 py-1 rounded ${className}`}
    >
      {appConfig.ui.demoLabel}
    </Badge>
  );
};
