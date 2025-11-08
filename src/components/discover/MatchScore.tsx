import { Heart, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MatchScoreProps {
  score: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  breakdown?: { label: string; score: number }[];
}

export const MatchScore = ({ score, className, showLabel = true, size = 'sm', breakdown }: MatchScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-primary bg-primary/10 border-primary/20";
    if (score >= 80) return "text-accent bg-accent/10 border-accent/20";
    if (score >= 70) return "text-secondary-foreground bg-secondary/10 border-secondary/20";
    if (score >= 60) return "text-muted-foreground bg-muted/10 border-muted/20";
    return "text-muted-foreground bg-muted/5 border-muted/10";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <Zap className="w-3 h-3" />;
    return <Heart className="w-3 h-3" />;
  };

  const getScoreText = (score: number) => {
    if (score >= 95) return "Perfecto";
    if (score >= 90) return "Excelente";
    if (score >= 80) return "Muy bueno";
    if (score >= 70) return "Bueno";
    if (score >= 60) return "Regular";
    return "Bajo";
  };

  const badgeContent = (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1.5 font-medium border",
        getScoreColor(score),
        size === 'sm' ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1",
        className
      )}
    >
      {getScoreIcon(score)}
      <span>{score}%</span>
      {showLabel && (
        <>
          <span>•</span>
          <span>{getScoreText(score)}</span>
        </>
      )}
    </Badge>
  );

  if (breakdown && breakdown.length > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
          <TooltipContent>
            <div className="p-2">
              <h4 className="font-semibold mb-2">Desglose de Match</h4>
              <ul className="space-y-1">
                {breakdown.map((item, index) => (
                  <li key={index} className="flex justify-between text-xs">
                    <span>{item.label}:</span>
                    <span className="font-medium">+{item.score}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeContent;
};