import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { 
  Shield, 
  Users, 
  BarChart3, 
  Settings, 
  FileText, 
  UserCheck,
  LogOut,
  Menu,
  X,
  Home,
  Briefcase,
  AlertTriangle,
  Activity
} from 'lucide-react';

interface AdminNavProps {
  className?: string;
  userRole?: 'admin' | 'moderator';
}

export const AdminNav: React.FC<AdminNavProps> = ({ 
  className = '', 
  userRole = 'admin' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Limpiar sesión y redirigir
    localStorage.removeItem('admin_session');
    localStorage.removeItem('moderator_session');
    navigate('/auth');
  };

  // Items de navegación según el rol
  const getNavItems = () => {
    if (userRole === 'moderator') {
      return [
        { id: 'dashboard', label: 'Panel', path: '/moderators/dashboard', icon: BarChart3 },
        { id: 'reports', label: 'Reportes', path: '/moderator-request', icon: AlertTriangle },
        { id: 'profile', label: 'Mi Perfil', path: '/profile', icon: UserCheck },
        { id: 'settings', label: 'Configuración', path: '/settings', icon: Settings },
      ];
    }

    // Admin items
    return [
      { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: BarChart3 },
      { id: 'analytics', label: 'Analytics', path: '/admin/analytics', icon: Activity },
      { id: 'users', label: 'Usuarios', path: '/admin-production', icon: Users },
      { id: 'moderators', label: 'Moderadores', path: '/admin/moderators', icon: Shield },
      { id: 'careers', label: 'Empleos', path: '/admin/career-applications', icon: Briefcase },
      { id: 'reports', label: 'Reportes', path: '/admin-production', icon: FileText },
      { id: 'settings', label: 'Configuración', path: '/settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Header Principal */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        'bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-800/95 backdrop-blur-sm border-b border-slate-500/40'
      } ${className}`}>
        
        {/* Contenedor Principal */}
        <div className="w-full">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            
            {/* Logo - Izquierda */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={() => handleNavigation('/')}
                className="flex items-center space-x-3 group transition-all duration-300 hover:scale-110"
              >
                <div className="relative">
                  <Shield className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" fill="currentColor" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-white font-black text-xl lg:text-2xl hidden sm:block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {userRole === 'moderator' ? 'Moderación' : 'Admin Panel'}
                </span>
              </button>
            </div>

            {/* Navegación Central - Desktop */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl mx-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-600/80 text-white shadow-lg shadow-blue-500/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Acciones de Usuario - Derecha */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                onClick={() => handleNavigation('/')}
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 px-3 py-2"
              >
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Inicio</span>
              </Button>
              
              <Button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-4 py-2 rounded-lg shadow-lg shadow-red-500/30 transition-all duration-300 hover:shadow-red-500/50 hover:scale-105"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>

              {/* Botón Menú Móvil */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-white/80 hover:text-white p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Móvil */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-800/95 backdrop-blur-md border-t border-slate-500/20">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-600/80 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              
              <div className="pt-4 border-t border-white/20">
                <button
                  onClick={() => handleNavigation('/')}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Volver al Inicio</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-600/80 text-white hover:bg-red-700/80 transition-all duration-300 mt-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default AdminNav;

