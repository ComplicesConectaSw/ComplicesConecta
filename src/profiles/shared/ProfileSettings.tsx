import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X } from "lucide-react";
import { logger } from '@/lib/logger';
// Removed local import that fails in production

export const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    name: "María González",
    age: 28,
    bio: "Pareja aventurera buscando conexiones auténticas y experiencias compartidas. Abiertos a explorar nuevas dimensiones de intimidad y amistad.",
    profession: "Diseñadora Gráfica",
    education: "Universidad Complutense de Madrid",
    interests: ["Comunicación", "Experiencias Compartidas", "Bienestar", "Conexión Auténtica", "Exploración Personal"],
    lifestyle_preferences: ["Discreción", "Respeto Mutuo", "Límites Claros", "Comunicación Abierta"],
    relationship_status: "En Pareja",
    looking_for: "Parejas y Singles",
    images: ["https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face"]
  });

  const [newInterest, setNewInterest] = useState("");

  const handleAddInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSave = () => {
    // Save profile logic
    logger.info("Saving profile:", profile);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={profile?.name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              placeholder="Cuéntanos sobre ti..."
              value={profile?.bio || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {profile.bio?.length || 0}/500 caracteres
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="profession">Profesión</Label>
              <Input
                id="profession"
                value={profile?.profession || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, profession: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Educación</Label>
              <Input
                id="education"
                value={profile?.education || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Fotos del Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {profile.images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={image} alt={`Profile ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="ghost" size="icon" className="text-white">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {profile.images.length < 6 && (
              <div className="aspect-square rounded-lg bg-muted border-2 border-dashed border-muted-foreground/50 flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                <div className="text-center">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Agregar foto</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Puedes subir hasta 6 fotos. La primera será tu foto principal.
          </p>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Intereses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1"
              >
                {interest}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveInterest(interest)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Agregar nuevo interés..."
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
            />
            <Button onClick={handleAddInterest} disabled={!newInterest.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="love" size="lg" onClick={handleSave}>
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
};