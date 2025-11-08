import { Button } from "@/shared/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, MessageCircle, Users } from "lucide-react";

interface MatchFiltersProps {
  currentFilter: 'all' | 'new' | 'recent' | 'unread';
  onFilterChange: (filter: 'all' | 'new' | 'recent' | 'unread') => void;
  counts?: {
    all: number;
    new: number;
    recent: number;
    unread: number;
  };
}

export const MatchFilters = ({ currentFilter, onFilterChange, counts }: MatchFiltersProps) => {
  const filters = [
    { key: 'all', label: 'Todos', icon: Users },
    { key: 'new', label: 'Nuevos', icon: Heart },
    { key: 'recent', label: 'Recientes', icon: Clock },
    { key: 'unread', label: 'Sin leer', icon: MessageCircle }
  ] as const;

  return (
    <div className="flex flex-wrap gap-3 mb-8 justify-center">
      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Button
            key={filter.key}
            variant={currentFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.key)}
            className="flex items-center gap-2 text-white border-white/30 hover:bg-white/20"
          >
            <Icon className="h-4 w-4" />
            <span className="text-white">{filter.label}</span>
            {counts && counts[filter.key] > 0 && (
              <Badge variant="secondary" className="ml-2">
                {counts[filter.key]}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};