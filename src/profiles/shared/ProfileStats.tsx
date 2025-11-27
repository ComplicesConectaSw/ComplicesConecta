import { Heart, Eye, Users } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/Card";

interface ProfileStatsProps {
  stats: {
    likes: number;
    matches: number;
    visits: number;
  };
}

const ProfileStats = ({ stats }: ProfileStatsProps) => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center space-y-1">
            <Heart className="h-5 w-5 text-pink-400" />
            <span className="text-lg font-bold text-white">{stats.likes}</span>
            <span className="text-xs text-white/70">Likes</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Users className="h-5 w-5 text-purple-400" />
            <span className="text-lg font-bold text-white">{stats.matches}</span>
            <span className="text-xs text-white/70">Matches</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Eye className="h-5 w-5 text-blue-400" />
            <span className="text-lg font-bold text-white">{stats.visits}</span>
            <span className="text-xs text-white/70">Visitas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStats;
