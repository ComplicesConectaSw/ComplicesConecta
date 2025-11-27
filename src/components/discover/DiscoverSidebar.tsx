import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Heart, Flame, Crown, Filter, RefreshCw } from 'lucide-react';
import { AdvancedFilters, FilterState } from '@/components/discover/AdvancedFilters';

interface DiscoverSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  dailyStats: {
    likes: number;
    superLikes: number;
    matches: number;
  };
}

export const DiscoverSidebar: React.FC<DiscoverSidebarProps> = ({
  filters,
  onFiltersChange,
  onReset,
  dailyStats
}) => {
  return (
    <div className="w-full lg:w-80 space-y-4">
      {/* Daily Stats */}
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="w-5 h-5 text-accent" />
            Estadísticas Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Heart className="w-6 h-6 text-primary mx-auto mb-2" fill="currentColor" />
                            <div className="font-bold text-xl text-primary">{dailyStats?.likes ?? 0}</div>
              <div className="text-xs text-muted-foreground">Likes</div>
            </div>
            <div className="text-center">
              <Flame className="w-6 h-6 text-accent mx-auto mb-2" />
                            <div className="font-bold text-xl text-accent">{dailyStats?.superLikes ?? 0}</div>
              <div className="text-xs text-muted-foreground">Super Likes</div>
            </div>
            <div className="text-center">
              <Crown className="w-6 h-6 text-secondary-foreground mx-auto mb-2" />
                            <div className="font-bold text-xl text-secondary-foreground">{dailyStats?.matches ?? 0}</div>
              <div className="text-xs text-muted-foreground">Matches</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <AdvancedFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            onReset={onReset}
          />
          <div className="mt-4">
            <Button 
              onClick={onReset}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
