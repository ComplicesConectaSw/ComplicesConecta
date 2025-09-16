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
      variant="outline" 
      className={`bg-yellow-500/10 text-yellow-600 border-yellow-500/30 ${className}`}
    >
      {appConfig.ui.demoLabel}
    </Badge>
  );
};
