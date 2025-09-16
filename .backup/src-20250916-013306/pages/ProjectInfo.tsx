import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, GitBranch, Smartphone, Code, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectInfo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'readme' | 'releases'>('readme');

  const readmeContent = `# 🚀 ComplicesConecta - Red Social para Lifestyle Swinger

**Versión:** 1.5.1 (Beta)  
**Plataforma:** Android APK + Web App  
**Stack:** React + TypeScript + TailwindCSS + Supabase

---

## 🎯 **Descripción del Proyecto**

ComplicesConecta es una plataforma social innovadora diseñada específicamente para la comunidad lifestyle swinger en México. Combina funciones de red social, sistema de citas y comunidad con un enfoque en la privacidad, seguridad y experiencia premium.

### 🌟 **Características Principales**

#### 🔐 **Sistema de Autenticación Seguro**
- Registro con email y verificación
- Perfiles Single y Pareja con datos específicos
- Verificación de identidad opcional
- Privacidad granular por usuario

#### 👥 **Perfiles Inteligentes**
- **Perfiles Single**: Información personal, intereses, fotos
- **Perfiles Pareja**: Datos de ambos partners, dinámicas de pareja
- **Galería Privada**: Control de acceso por invitaciones
- **Verificación**: Badges de verificación para autenticidad

#### 🎪 **Funciones Sociales**
- **Feed Social**: Posts, fotos, interacciones
- **Discover**: Algoritmo de recomendaciones inteligente
- **Chat**: Mensajería privada y grupos públicos
- **Matches**: Sistema de compatibilidad avanzado
- **Eventos**: Creación y participación en eventos lifestyle

#### 🪙 **Sistema de Tokens CMPX/GTK**
- **Tokens CMPX**: Sistema interno para fase beta (sin valor monetario real)
- **Recompensas por Referidos**: 50 CMPX para invitador + 50 CMPX para invitado
- **Límite Mensual**: Máximo 500 CMPX por usuario por mes
- **Acceso Premium**: Usar CMPX para desbloquear funciones premium durante la beta
- **Migración Futura**: Los CMPX se convertirán a GTK en la versión de producción

#### 🎨 **Diseño y UX**
- **UI Moderna**: Gradientes vibrantes, glassmorphism
- **Responsive**: Optimizado para móvil y desktop
- **Animaciones**: Transiciones suaves y micro-interacciones
- **Accesibilidad**: Diseño inclusivo y navegación intuitiva

---

## 🛠️ **Stack Tecnológico**

### **Frontend**
- **React 18** con TypeScript
- **Vite** para build y desarrollo
- **TailwindCSS** para estilos
- **Lucide React** para iconografía
- **React Router** para navegación

### **Backend**
- **Supabase** como BaaS
- **PostgreSQL** base de datos
- **Edge Functions** para lógica de negocio
- **Row Level Security** para privacidad

### **Mobile**
- **Capacitor** para APK Android
- **PWA** para instalación web

---

## 🪙 Sistema de Tokens CMPX/GTK

ComplicesConecta implementa un sistema dual de tokens:

- **CMPX**: Tokens internos para la fase beta (sin valor monetario real)
- **GTK**: Tokens blockchain ERC20 para la versión de producción

### Funciones del Sistema de Tokens

- **Recompensas por Referidos**: 50 CMPX para el invitador + 50 CMPX para el invitado
- **Límite Mensual**: Máximo 500 CMPX por usuario por mes
- **Acceso Premium**: Usar CMPX para desbloquear funciones premium durante la beta
- **Migración Futura**: Los CMPX se convertirán a GTK en la versión de producción

### Estado Actual - Fase Beta

- ✅ Sistema de tokens CMPX implementado
- ✅ Recompensas por referidos activas
- ✅ Funciones premium habilitadas con tokens (sin pagos Stripe)
- ✅ Páginas legales completas (términos, privacidad, responsabilidad legal)
- ✅ Sistema de compras premium basado en tokens
- ⏳ Tokens GTK blockchain (pendiente para producción)
- ⏳ Integración con Stripe (deshabilitada durante beta)

---

## 🚀 **Estado del Proyecto**

### ✅ **Completado**
- Sistema de autenticación completo
- Perfiles Single y Pareja funcionales
- Feed social con interacciones
- Chat público y privado
- Sistema de matches y descubrimiento
- Galería privada con permisos
- Sistema de tokens CMPX/GTK
- Funciones premium habilitadas
- Páginas legales completas
- APK Android funcional

### 🔄 **En Desarrollo**
- Optimizaciones de rendimiento
- Nuevas funciones premium
- Integración blockchain GTK
- Sistema de notificaciones push

### 📋 **Roadmap**
- Lanzamiento de producción con GTK
- Integración con Stripe
- App iOS nativa
- Funciones de comunidad avanzadas

---

## 📱 **Instalación y Uso**

### **Web App**
1. Visita [complicesconecta.com](https://complicesconecta.com)
2. Regístrate con email
3. Completa tu perfil
4. ¡Comienza a conectar!

### **Android APK**
1. Descarga la APK desde GitHub Releases
2. Habilita "Fuentes desconocidas" en Android
3. Instala la aplicación
4. Abre y regístrate

---

## 🔒 **Privacidad y Seguridad**

- **Encriptación**: Datos sensibles encriptados
- **Verificación**: Sistema de verificación de identidad
- **Control de Acceso**: Permisos granulares por usuario
- **Moderación**: Sistema de reportes y moderación
- **GDPR Compliant**: Cumplimiento con regulaciones de privacidad

---

## 📞 **Soporte y Contacto**

- **Email**: soporte@complicesconecta.com
- **Chat**: Disponible 24/7 en la app
- **Legal**: legal@complicesconecta.com
- **Tokens**: tokens@complicesconecta.com

---

## 📄 **Licencia**

© 2025 ComplicesConecta. Todos los derechos reservados.

---

*Última actualización: 3 de septiembre, 2025*`;

  const releasesContent = `# 🚀 ComplicesConecta - Notas de Lanzamiento

## Version 1.5.1 - Sistema de Tokens Completo con Páginas Legales (3 de septiembre, 2025)

### 🪙 **Sistema de Tokens CMPX/GTK - Implementación Final**

#### Sistema de Tokens Completo
- **Tokens CMPX**: Sistema interno para fase beta sin valor monetario real
- **Recompensas por Referidos**: 50 CMPX para invitador + 50 CMPX para invitado
- **Límites Mensuales**: Máximo 500 CMPX por usuario por mes
- **Componente TokenBalance**: Interfaz completa para gestión de tokens
- **Backend Supabase**: Edge Function para procesar recompensas de referidos
- **Base de Datos**: Tablas y triggers para gestión transaccional de tokens

#### Funciones Premium Totalmente Habilitadas
- **Acceso Basado en Tokens**: Sistema completo usando CMPX para funciones premium
- **Compras Mock**: Sistema de compras simuladas sin pagos reales durante beta
- **Stripe Deshabilitado**: Pagos reales desactivados hasta versión de producción
- **Feature Flags Actualizados**: Premium features siempre habilitadas en beta

#### Páginas Legales Completas
- **TokensInfo**: Página informativa con FAQ, beneficios y explicaciones detalladas
- **TokensPrivacy**: Política de privacidad específica para el sistema de tokens
- **TokensTerms**: Términos y condiciones completos del programa de tokens
- **TokensLegal**: Página de responsabilidad legal y consideraciones regulatorias
- **Navegación Integrada**: Enlaces cruzados entre todas las páginas legales

### 🔧 **Mejoras Técnicas Finales**

#### Sistema de Rutas Completo
- **4 Nuevas Rutas**: \`/tokens-info\`, \`/tokens-privacy\`, \`/tokens-terms\`, \`/tokens-legal\`
- **Navegación Legal**: Enlaces desde TokensInfo a todas las páginas legales
- **UI Consistente**: Diseño uniforme con gradientes y animaciones profesionales

#### Backend y Seguridad
- **Validación Robusta**: Anti-fraude y límites automáticos
- **Transacciones Atómicas**: Prevención de duplicados y errores
- **Cumplimiento Legal**: Marco regulatorio mexicano implementado
- **Protección de Datos**: Políticas GDPR-compliant para tokens

### 📚 **Documentación Final Actualizada**
- **README.md**: Información completa y actualizada del sistema
- **RELEASE_NOTES.md**: Historial completo de versiones
- **Rutas Legales**: Todas las páginas legales documentadas y enlazadas

### 🚀 **Estado de Preparación para Producción**
- **Sistema Beta Completo**: Todas las funciones premium y legales implementadas
- **Tokens GTK**: Contratos ERC20 preparados para blockchain
- **Migración Planificada**: CMPX → GTK lista para activación
- **Stripe Integration**: Preparada para activar post-beta
- **Marco Legal**: Completo y listo para auditoría legal

---

## Version 1.5.0 - Sistema de Tokens CMPX/GTK (3 de septiembre, 2025)

### 🪙 **Nuevas Funcionalidades - Sistema de Tokens**

#### Sistema de Tokens CMPX/GTK Implementado
- **Tokens CMPX**: Sistema interno para fase beta sin valor monetario real
- **Recompensas por Referidos**: 50 CMPX para invitador + 50 CMPX para invitado
- **Límites Mensuales**: Máximo 500 CMPX por usuario por mes
- **Componente TokenBalance**: Interfaz completa para gestión de tokens
- **Backend Supabase**: Edge Function para procesar recompensas de referidos
- **Base de Datos**: Tablas y triggers para gestión transaccional de tokens

#### Funciones Premium Habilitadas (Beta)
- **Acceso Basado en Tokens**: Usar CMPX para desbloquear funciones premium
- **Sistema Mock**: Compras simuladas sin pagos reales durante beta
- **Stripe Deshabilitado**: Pagos reales desactivados hasta versión de producción
- **Feature Flags**: Control granular de funciones por fase de desarrollo

#### Páginas Informativas y Legales
- **TokensInfo**: Página completa con FAQ, beneficios y explicaciones
- **Navegación Integrada**: Enlaces desde modales de funciones a información detallada
- **Animaciones Profesionales**: UI consistente con branding de la aplicación

### 🔧 **Mejoras Técnicas**

#### Backend y Base de Datos
- **Supabase Edge Functions**: Procesamiento seguro de recompensas
- **PostgreSQL**: Tablas optimizadas con índices y triggers
- **Transacciones Atómicas**: Prevención de duplicados y fraudes
- **Validación Robusta**: Anti-fraude y límites automáticos

#### Frontend y UI/UX
- **React Components**: Componentes reutilizables para tokens
- **TypeScript**: Tipado completo para sistema de tokens
- **CSS Animations**: Animaciones suaves y profesionales
- **Responsive Design**: Optimizado para móvil y desktop

---

## Version 1.4.2 - Mejoras de Texto y Navegación (3 de septiembre, 2025)

### 🎨 **Mejoras de UI/UX**
- **Texto Blanco Global**: Cambiado texto gris a blanco en toda la aplicación para mejor contraste
- **Chat Demo Libre**: Eliminada restricción de autenticación para acceso al chat
- **Navegación Mejorada**: Enlaces de navegación con texto blanco sólido
- **Responsividad Verificada**: Grid layouts optimizados para desktop, tablet y móvil

### 📚 **Documentación**
- **Documentación Organizada**: Carpeta docs/ creada con todos los reportes de auditoría
- **README Actualizado**: Información completa del estado del proyecto
- **Release Notes**: Historial detallado de cambios

---

## Version 1.4.0 - Optimizaciones APK (2 de septiembre, 2025)

### 📱 **Optimizaciones para APK Instalada**
- **Header Inteligente**: Se oculta al hacer scroll y se minimiza en el top
- **Detección de WebView Precisa**: Distingue entre navegador móvil Android y APK instalada
- **Botón de Descarga Contextual**: Solo visible en navegadores web, oculto cuando se ejecuta desde APK
- **Navegación Adaptativa**: Menú completo en web, minimizado en APK durante scroll
- **Transiciones Suaves**: Animaciones de 300ms para cambios de estado del header
- **Logo Responsivo**: Tamaño adaptable según estado (h-8 → h-6 en modo minimizado)
- **Modal de Instalación Mejorado**: Botón de descarga directa desde GitHub releases

---

*Última actualización: 3 de septiembre, 2025 - 22:15 hrs*`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Regresar
            </Button>
            
            <h1 className="text-xl font-bold text-white">Información del Proyecto</h1>
            
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
            <Info className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            ComplicesConecta
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Información del Proyecto
            </span>
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Documentación técnica, notas de lanzamiento y estado actual del desarrollo.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button
            onClick={() => setActiveTab('readme')}
            variant={activeTab === 'readme' ? 'default' : 'outline'}
            className={activeTab === 'readme' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
              : 'border-white/20 text-white hover:bg-white/10'
            }
          >
            <FileText className="h-4 w-4 mr-2" />
            README
          </Button>
          <Button
            onClick={() => setActiveTab('releases')}
            variant={activeTab === 'releases' ? 'default' : 'outline'}
            className={activeTab === 'releases' 
              ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' 
              : 'border-white/20 text-white hover:bg-white/10'
            }
          >
            <GitBranch className="h-4 w-4 mr-2" />
            Notas de Lanzamiento
          </Button>
        </div>

        {/* Content */}
        <Card className="bg-card/80 backdrop-blur-sm border border-primary/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {activeTab === 'readme' ? (
                <>
                  <FileText className="h-6 w-6 text-blue-400" />
                  Documentación del Proyecto (README.md)
                </>
              ) : (
                <>
                  <GitBranch className="h-6 w-6 text-green-400" />
                  Notas de Lanzamiento (RELEASE_NOTES.md)
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900/50 rounded-lg p-6 max-h-[70vh] overflow-y-auto">
              <pre className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {activeTab === 'readme' ? readmeContent : releasesContent}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-sm border border-blue-400/30">
            <CardContent className="p-6 text-center">
              <Code className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Código Fuente</h3>
              <p className="text-blue-200 text-sm mb-4">
                Accede al repositorio completo en GitHub
              </p>
              <Button
                onClick={() => window.open('https://github.com/complicesconecta/conecta-social-comunidad', '_blank')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ver en GitHub
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-900/80 to-blue-900/80 backdrop-blur-sm border border-green-400/30">
            <CardContent className="p-6 text-center">
              <Smartphone className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">APK Android</h3>
              <p className="text-green-200 text-sm mb-4">
                Descarga la aplicación para Android
              </p>
              <Button
                onClick={() => window.open('https://github.com/complicesconecta/conecta-social-comunidad/releases', '_blank')}
                className="bg-green-600 hover:bg-green-700"
              >
                Descargar v1.3.3 (beta)
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-900/80 to-pink-900/80 backdrop-blur-sm border border-purple-400/30">
            <CardContent className="p-6 text-center">
              <Info className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Soporte</h3>
              <p className="text-purple-200 text-sm mb-4">
                Obtén ayuda y reporta problemas
              </p>
              <Button
                onClick={() => navigate('/support')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Contactar Soporte
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Version Info */}
        <Card className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-sm border border-indigo-400/30">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Estado Actual del Proyecto</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-400">v1.5.1</div>
                <div className="text-indigo-200 text-sm">Versión Actual</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">Beta</div>
                <div className="text-green-200 text-sm">Fase de Desarrollo</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">95%</div>
                <div className="text-yellow-200 text-sm">Completado</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">2025</div>
                <div className="text-purple-200 text-sm">Lanzamiento</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
