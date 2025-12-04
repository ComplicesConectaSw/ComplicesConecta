import { Heart, MessageCircle, Users, MapPin, Calendar, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface GroupCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  memberCount: number;
  category: string;
  location: string;
  nextEvent?: {
    title: string;
    date: string;
  };
  members: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  isJoined?: boolean;
}

export const GroupCard = ({ 
  id: _id, 
  name, 
  description, 
  image, 
  memberCount, 
  category, 
  location, 
  nextEvent,
  members,
  isJoined = false 
}: GroupCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-primary transition-all duration-300 hover:scale-105">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={image} 
            alt={name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Button size="icon" variant="ghost" className="bg-background/80 hover:bg-background">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-background/90"
          >
            {category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{memberCount} miembros</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          </div>

          {nextEvent && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">{nextEvent.title}</p>
                  <p className="text-muted-foreground">{nextEvent.date}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Miembros:</span>
            <div className="flex -space-x-2">
              {(members ?? []).slice(0, 4).map((member) => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">{member?.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
              ))}
              {memberCount > 4 && (
                <div className="h-6 w-6 bg-muted border-2 border-background rounded-full flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{memberCount - 4}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button 
          variant={isJoined ? "outline" : "default"} 
          className="flex-1"
        >
          {isJoined ? "Unirse" : "Unido"}
        </Button>
        <Button variant="outline" size="icon">
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Heart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
