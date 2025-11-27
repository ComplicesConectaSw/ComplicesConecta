import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Heart, Sparkles, Users, User } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { ProfileCard } from '@/profiles/shared/ProfileCard';
import { Gender, Theme } from '@/features/profile/useProfileTheme';

interface ThemeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'single' | 'couple';
  gender: Gender;
  partnerGender?: Gender;
}

export const ThemeInfoModal: React.FC<ThemeInfoModalProps> = ({
  isOpen,
  onClose,
  userType,
  gender,
  partnerGender
}) => {
  // Variables para futura implementación de temas personalizados
  // const _profileType: ProfileType = userType;
  // const _genders: Gender[] = userType === 'couple' && partnerGender 
  //   ? [gender, partnerGender] 
  //   : [gender];

  const demoProfileProps = {
    id: 'demo-theme',
    name: userType === 'single' ? 'Tu Perfil' : 'Vuestro Perfil',
    age: userType === 'single' ? 28 : undefined,
    location: 'Ciudad de México',
    distance: 0,
    images: ['/compliceslogo.png'],
    bio: 'Descubre cómo se verá tu perfil con diferentes temas visuales.',
    interests: ['Música', 'Viajes', 'Gastronomía'],
    accountType: userType,
    isOnline: true,
    compatibility: 95,
    verified: true,
    avatar: '/compliceslogo.png'
  };

  const themes: { theme: Theme | undefined; name: string; description: string; icon: React.ReactNode }[] = [
    {
      theme: undefined,
      name: 'Automático',
      description: 'Tema personalizado según tu género y tipo de perfil',
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      theme: 'elegant',
      name: 'Elegante',
      description: 'Diseño sofisticado con fondos oscuros y tipografía refinada',
      icon: <Heart className="w-5 h-5" />
    },
    {
      theme: 'modern',
      name: 'Moderno',
      description: 'Gradientes vibrantes con estilo contemporáneo y dinámico',
      icon: <Palette className="w-5 h-5" />
    },
    {
      theme: 'vibrant',
      name: 'Vibrante',
      description: 'Colores intensos y energéticos para personalidades extrovertidas',
      icon: <Sparkles className="w-5 h-5" />
    }
  ];

  const getGenderDescription = () => {
    if (userType === 'single') {
      return gender === 'male' 
        ? 'Como perfil masculino, tu tema automático usa tonos azules profundos y grises metálicos que transmiten confianza y elegancia.'
        : 'Como perfil femenino, tu tema automático usa tonos púrpuras y rosas suaves que evocan calidez y sofisticación.';
    } else {
      if (gender === 'male' && partnerGender === 'female') {
        return 'Como pareja mixta, vuestro tema automático combina gradientes púrpura-azul que representan equilibrio y complementariedad.';
      } else if (gender === 'male' && partnerGender === 'male') {
        return 'Como pareja masculina, vuestro tema automático usa fondos sobrios azul-gris con un diseño fuerte y minimalista.';
      } else if (gender === 'female' && partnerGender === 'female') {
        return 'Como pareja femenina, vuestro tema automático usa colores vibrantes púrpura-fucsia con un estilo armónico y elegante.';
      }
    }
    return 'Tu perfil tendrá un tema visual personalizado automáticamente.';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      🎨 Personalización Visual
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Tu perfil se adaptará automáticamente a tu estilo
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Explicación del sistema */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {userType === 'single' ? (
                    <User className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Users className="w-5 h-5 text-purple-500" />
                  )}
                  {userType === 'single' ? 'Perfil Individual' : 'Perfil de Pareja'}
                </div>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  {getGenderDescription()}
                </p>
              </div>

              {/* Vista previa de temas */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                  Opciones de Temas Disponibles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {themes.map(({ theme, name, description, icon }) => (
                    <motion.div
                      key={theme || 'auto'}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: themes.indexOf(themes.find(t => t.theme === theme)!) * 0.1 }}
                      className="space-y-4"
                    >
                      {/* Información del tema */}
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          {icon}
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {name}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {description}
                        </p>
                      </div>

                      {/* Preview del perfil con el tema */}
                      <div className="flex justify-center">
                        <div className="w-full max-w-sm">
                          <ProfileCard
                            profile={demoProfileProps}
                            onOpenModal={() => {}}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  ¿Sabías que...?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Puedes cambiar tu tema en cualquier momento desde tu perfil</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Los temas están diseñados con psicología del color para mayor atractivo</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Todos los temas cumplen estándares de accesibilidad WCAG 2.1 AA</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>El tema automático se basa en tu género y tipo de perfil</span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  ¡Perfecto! Continuar con el registro
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-300 dark:border-gray-600 px-6 py-3"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeInfoModal;
