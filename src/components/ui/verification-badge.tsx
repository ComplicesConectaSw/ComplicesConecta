import { CheckCircle, Shield, Star, Crown } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface VerificationBadgeProps {
  type: "verified" | "premium" | "vip" | "trusted";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const VerificationBadge = ({ 
  type, 
  size = "md", 
  showLabel = false, 
  className 
}: VerificationBadgeProps) => {
  const config = {
    verified: {
      icon: CheckCircle,
      label: "Verificado",
      className: "text-blue-500 bg-blue-50 border-blue-200",
      iconClassName: "text-blue-500"
    },
    premium: {
      icon: Crown,
      label: "Premium",
      className: "text-yellow-600 bg-yellow-50 border-yellow-200",
      iconClassName: "text-yellow-600"
    },
    vip: {
      icon: Star,
      label: "VIP",
      className: "text-purple-600 bg-purple-50 border-purple-200",
      iconClassName: "text-purple-600"
    },
    trusted: {
      icon: Shield,
      label: "Confiable",
      className: "text-green-600 bg-green-50 border-green-200",
      iconClassName: "text-green-600"
    }
  };

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const badgeSizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-3 py-1.5 text-base"
  };

  const { icon: Icon, label, className: typeClassName, iconClassName } = config[type];

  if (!showLabel) {
    return (
      <Icon 
        className={cn(
          sizeClasses[size], 
          iconClassName,
          className
        )} 
      />
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1 rounded-full border font-medium",
      typeClassName,
      badgeSizeClasses[size],
      className
    )}>
      <Icon className={sizeClasses[size]} />
      <span>{label}</span>
    </div>
  );
};