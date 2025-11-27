import { ProfileCard } from "@/profiles/shared/MainProfileCard";
import { Button } from "@/shared/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Profile {
  id: number;
  name: string;
  age: number;
  location: string;
  interests: string[];
  image: string;
  rating: number;
  isOnline?: boolean;
}

interface ProfileGridProps {
  profiles: Profile[];
  currentPage: number;
  profilesPerPage: number;
  onPageChange: (page: number) => void;
  showAiCompatibility?: boolean;
}


export const ProfileGrid = ({ 
  profiles, 
  currentPage, 
  profilesPerPage, 
  onPageChange
}: ProfileGridProps) => {
  const totalPages = Math.ceil(profiles.length / profilesPerPage);
  const startIndex = (currentPage - 1) * profilesPerPage;
  const endIndex = startIndex + profilesPerPage;
  const currentProfiles = profiles.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-muted rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No se encontraron perfiles
        </h3>
        <p className="text-muted-foreground">
          Intenta ajustar tus filtros de búsqueda para encontrar más personas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProfiles.map((profile, index) => (
          <div 
            key={profile.id} 
            className="animate-slide-up" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ProfileCard 
              profile={{
                id: profile.id.toString(),
                name: profile.name,
                age: profile.age,
                location: profile.location,
                image: profile.image,
                interests: profile.interests,
                rating: profile.rating,
                isOnline: profile.isOnline
              }}
              onOpenModal={() => {}}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-12">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="w-10 h-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Page Info */}
      <div className="text-center text-muted-foreground text-sm">
        Mostrando {startIndex + 1}-{Math.min(endIndex, profiles.length)} de {profiles.length} perfiles
      </div>
    </div>
  );
};