import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail,
  Calendar,
  MapPin,
  Eye,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  location?: string;
  bio?: string;
  is_premium?: boolean;
  is_verified?: boolean;
  created_at: string;
  last_seen?: string;
  status: 'active' | 'suspended' | 'banned' | 'pending';
  reports_count?: number;
}

interface UserFilters {
  status: string;
  isPremium: string;
  isVerified: string;
  ageRange: string;
  gender: string;
}

export function UserManagementPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    status: 'all',
    isPremium: 'all',
    isVerified: 'all',
    ageRange: 'all',
    gender: 'all'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, filters]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      if (!supabase) {
        console.error('Supabase no está disponible');
        generateMockUsers();
        return;
      }
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        generateMockUsers();
      } else {
        const processedUsers = (profiles || []).map(profile => ({
          id: profile.id,
          name: profile.name || profile.bio?.split(' ')[0] || 'Usuario sin nombre',
          email: 'email@ejemplo.com', // Mock email
          age: profile.age || undefined,
          gender: profile.gender || undefined,
          location: profile.bio || 'No especificada',
          bio: profile.bio || undefined,
          is_premium: profile.is_premium || false,
          is_verified: false, // Mock verification
          created_at: profile.created_at || new Date().toISOString(),
          last_seen: 'Hace 2 horas', // Mock last seen
          status: 'active' as const,
          reports_count: Math.floor(Math.random() * 3) // Mock reports
        }));
        setUsers(processedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      generateMockUsers();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockUsers = () => {
    const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
      id: `user-${i + 1}`,
      name: `Usuario ${i + 1}`,
      email: `usuario${i + 1}@ejemplo.com`,
      age: Math.floor(Math.random() * 40) + 18,
      gender: ['male', 'female'][Math.floor(Math.random() * 2)],
      location: ['CDMX', 'Guadalajara', 'Monterrey', 'Puebla'][Math.floor(Math.random() * 4)],
      bio: `Biografía del usuario ${i + 1}`,
      is_premium: Math.random() > 0.8,
      is_verified: Math.random() > 0.7,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      last_seen: `Hace ${Math.floor(Math.random() * 24)} horas`,
      status: ['active', 'suspended', 'banned', 'pending'][Math.floor(Math.random() * 4)] as User['status'],
      reports_count: Math.floor(Math.random() * 5)
    }));
    setUsers(mockUsers);
  };

  const applyFilters = () => {
    const filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || user.status === filters.status;
      const matchesPremium = filters.isPremium === 'all' || 
                            (filters.isPremium === 'premium' && user.is_premium) ||
                            (filters.isPremium === 'free' && !user.is_premium);
      const matchesVerified = filters.isVerified === 'all' ||
                             (filters.isVerified === 'verified' && user.is_verified) ||
                             (filters.isVerified === 'unverified' && !user.is_verified);
      const matchesGender = filters.gender === 'all' || user.gender === filters.gender;
      
      let matchesAge = true;
      if (filters.ageRange !== 'all' && user.age) {
        const age = user.age;
        switch (filters.ageRange) {
          case '18-24':
            matchesAge = age >= 18 && age <= 24;
            break;
          case '25-34':
            matchesAge = age >= 25 && age <= 34;
            break;
          case '35-44':
            matchesAge = age >= 35 && age <= 44;
            break;
          case '45+':
            matchesAge = age >= 45;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesPremium && matchesVerified && matchesGender && matchesAge;
    });

    setFilteredUsers(filtered);
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'ban' | 'activate' | 'verify' | 'delete') => {
    try {
      // En una implementación real, esto haría llamadas a la API
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'suspend':
              return { ...user, status: 'suspended' as const };
            case 'ban':
              return { ...user, status: 'banned' as const };
            case 'activate':
              return { ...user, status: 'active' as const };
            case 'verify':
              return { ...user, is_verified: true };
            case 'delete':
              return null;
            default:
              return user;
          }
        }
        return user;
      }).filter(Boolean) as User[];

      setUsers(updatedUsers);
      
      const actionMessages = {
        suspend: 'Usuario suspendido',
        ban: 'Usuario baneado',
        activate: 'Usuario activado',
        verify: 'Usuario verificado',
        delete: 'Usuario eliminado'
      };

      toast({
        title: "Acción completada",
        description: actionMessages[action],
      });
    } catch (error) {
      console.error('Error performing user action:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la acción",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
      suspended: { label: 'Suspendido', className: 'bg-yellow-100 text-yellow-800' },
      banned: { label: 'Baneado', className: 'bg-red-100 text-red-800' },
      pending: { label: 'Pendiente', className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'suspended':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'banned':
        return <Ban className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Gestión de Usuarios
          </h2>
          <p className="text-gray-600">
            Administra usuarios, perfiles y acciones de moderación
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="border px-2 py-1 rounded">
            Total: {users.length}
          </Badge>
          <Badge className="border px-2 py-1 rounded">
            Activos: {users.filter(u => u.status === 'active').length}
          </Badge>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={filters.status} onValueChange={(value: string) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="suspended">Suspendidos</SelectItem>
                  <SelectItem value="banned">Baneados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Suscripción</label>
              <Select value={filters.isPremium} onValueChange={(value: string) => setFilters({...filters, isPremium: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="free">Gratuito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Verificación</label>
              <Select value={filters.isVerified} onValueChange={(value: string) => setFilters({...filters, isVerified: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="verified">Verificados</SelectItem>
                  <SelectItem value="unverified">No verificados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Usuarios</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Usuarios ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando usuarios...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No se encontraron usuarios</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{user.name}</h4>
                            {user.is_verified && (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            )}
                            {user.is_premium && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">Premium</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            {user.age && (
                              <span>{user.age} años</span>
                            )}
                            {user.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {user.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          {getStatusBadge(user.status)}
                        </div>
                        
                        {user.reports_count && user.reports_count > 0 && (
                          <Badge className="border border-red-200 text-red-600">
                            {user.reports_count} reportes
                          </Badge>
                        )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 h-8 px-3 text-sm shadow-md"
                              onClick={() => setSelectedUser(user)}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Acciones para {user.name}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-2">
                              <Button 
                                className="border px-2 py-1 rounded justify-start"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Perfil
                              </Button>
                              
                              {user.status === 'active' && (
                                <>
                                  <Button 
                                    className="border px-2 py-1 rounded justify-start text-yellow-600"
                                    onClick={() => handleUserAction(user.id, 'suspend')}
                                  >
                                    <UserX className="w-4 h-4 mr-2" />
                                    Suspender
                                  </Button>
                                  <Button 
                                    className="border px-2 py-1 rounded justify-start text-red-600"
                                    onClick={() => handleUserAction(user.id, 'ban')}
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Banear
                                  </Button>
                                </>
                              )}
                              
                              {(user.status === 'suspended' || user.status === 'banned') && (
                                <Button 
                                  className="border px-2 py-1 rounded justify-start text-green-600"
                                  onClick={() => handleUserAction(user.id, 'activate')}
                                >
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activar
                                </Button>
                              )}
                              
                              {!user.is_verified && (
                                <Button 
                                  className="border px-2 py-1 rounded justify-start text-blue-600"
                                  onClick={() => handleUserAction(user.id, 'verify')}
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  Verificar
                                </Button>
                              )}
                              
                              <Button 
                                className="border px-2 py-1 rounded justify-start text-red-600"
                                onClick={() => handleUserAction(user.id, 'delete')}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  Registrados en la plataforma
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((users.filter(u => u.status === 'active').length / users.length) * 100).toFixed(1)}% del total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Premium</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {users.filter(u => u.is_premium).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((users.filter(u => u.is_premium).length / users.length) * 100).toFixed(1)}% del total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Verificados</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.is_verified).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((users.filter(u => u.is_verified).length / users.length) * 100).toFixed(1)}% del total
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['active', 'suspended', 'banned', 'pending'].map(status => {
                    const count = users.filter(u => u.status === status).length;
                    const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{status}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              status === 'active' ? 'bg-green-600' :
                              status === 'suspended' ? 'bg-yellow-600' :
                              status === 'banned' ? 'bg-red-600' : 'bg-gray-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Género</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['male', 'female'].map(gender => {
                    const count = users.filter(u => u.gender === gender).length;
                    const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
                    const label = gender === 'male' ? 'Masculino' : 'Femenino';
                    return (
                      <div key={gender}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{label}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              gender === 'male' ? 'bg-blue-600' : 'bg-pink-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalles de usuario */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    {selectedUser.name}
                    {selectedUser.is_verified && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedUser.status)}
                    {selectedUser.is_premium && (
                      <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Información Personal</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Edad:</span>
                      <span>{selectedUser.age || 'No especificada'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Género:</span>
                      <span className="capitalize">{selectedUser.gender || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ubicación:</span>
                      <span>{selectedUser.location || 'No especificada'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Información de Cuenta</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Registro:</span>
                      <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Última actividad:</span>
                      <span>{selectedUser.last_seen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reportes:</span>
                      <span>{selectedUser.reports_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedUser.bio && (
                <div>
                  <h4 className="font-medium mb-2">Biografía</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedUser.bio}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

