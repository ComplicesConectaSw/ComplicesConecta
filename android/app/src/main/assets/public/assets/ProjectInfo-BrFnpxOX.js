import{c as d,u as m,r as p,j as e,B as s,A as u,ar as r,al as c,C as i,a as g,b,d as o,ac as x}from"./index-1rAgi2Qg.js";import{C as h}from"./code-DaZCchls.js";/**
 * @license lucide-react v0.451.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=d("GitBranch",[["line",{x1:"6",x2:"6",y1:"3",y2:"15",key:"17qcm7"}],["circle",{cx:"18",cy:"6",r:"3",key:"1h7g24"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["path",{d:"M18 9a9 9 0 0 1-9 9",key:"n2h4wq"}]]);function y(){const n=m(),[a,t]=p.useState("readme");return e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900",children:[e.jsx("div",{className:"sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10",children:e.jsx("div",{className:"container mx-auto px-4 py-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs(s,{variant:"ghost",onClick:()=>n(-1),className:"text-white hover:bg-white/10",children:[e.jsx(u,{className:"h-4 w-4 mr-2"}),"Regresar"]}),e.jsx("h1",{className:"text-xl font-bold text-white",children:"Información del Proyecto"}),e.jsx("div",{className:"w-20"})]})})}),e.jsxs("div",{className:"container mx-auto px-4 py-8 space-y-8",children:[e.jsxs("div",{className:"text-center space-y-4",children:[e.jsx("div",{className:"inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4",children:e.jsx(r,{className:"h-8 w-8 text-white"})}),e.jsxs("h1",{className:"text-3xl md:text-4xl font-bold text-white",children:["ComplicesConecta",e.jsx("span",{className:"block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400",children:"Información del Proyecto"})]}),e.jsx("p",{className:"text-white/80 max-w-2xl mx-auto",children:"Documentación técnica, notas de lanzamiento y estado actual del desarrollo."})]}),e.jsxs("div",{className:"flex justify-center space-x-4 mb-8",children:[e.jsxs(s,{onClick:()=>t("readme"),variant:a==="readme"?"default":"outline",className:a==="readme"?"bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700":"border-white/20 text-white hover:bg-white/10",children:[e.jsx(c,{className:"h-4 w-4 mr-2"}),"README"]}),e.jsxs(s,{onClick:()=>t("releases"),variant:a==="releases"?"default":"outline",className:a==="releases"?"bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700":"border-white/20 text-white hover:bg-white/10",children:[e.jsx(l,{className:"h-4 w-4 mr-2"}),"Notas de Lanzamiento"]})]}),e.jsxs(i,{className:"bg-card/80 backdrop-blur-sm border border-primary/10",children:[e.jsx(g,{children:e.jsx(b,{className:"text-white flex items-center gap-2",children:a==="readme"?e.jsxs(e.Fragment,{children:[e.jsx(c,{className:"h-6 w-6 text-blue-400"}),"Documentación del Proyecto (README.md)"]}):e.jsxs(e.Fragment,{children:[e.jsx(l,{className:"h-6 w-6 text-green-400"}),"Notas de Lanzamiento (RELEASE_NOTES.md)"]})})}),e.jsx(o,{children:e.jsx("div",{className:"bg-gray-900/50 rounded-lg p-6 max-h-[70vh] overflow-y-auto",children:e.jsx("pre",{className:"text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-mono",children:a==="readme"?`# 🚀 ComplicesConecta - Red Social para Lifestyle Swinger

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

*Última actualización: 3 de septiembre, 2025*`:`# 🚀 ComplicesConecta - Notas de Lanzamiento

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

*Última actualización: 3 de septiembre, 2025 - 22:15 hrs*`})})})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsx(i,{className:"bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-sm border border-blue-400/30",children:e.jsxs(o,{className:"p-6 text-center",children:[e.jsx(h,{className:"h-8 w-8 text-blue-400 mx-auto mb-3"}),e.jsx("h3",{className:"text-lg font-semibold text-white mb-2",children:"Código Fuente"}),e.jsx("p",{className:"text-blue-200 text-sm mb-4",children:"Accede al repositorio completo en GitHub"}),e.jsx(s,{onClick:()=>window.open("https://github.com/complicesconecta/conecta-social-comunidad","_blank"),className:"bg-blue-600 hover:bg-blue-700",children:"Ver en GitHub"})]})}),e.jsx(i,{className:"bg-gradient-to-r from-green-900/80 to-blue-900/80 backdrop-blur-sm border border-green-400/30",children:e.jsxs(o,{className:"p-6 text-center",children:[e.jsx(x,{className:"h-8 w-8 text-green-400 mx-auto mb-3"}),e.jsx("h3",{className:"text-lg font-semibold text-white mb-2",children:"APK Android"}),e.jsx("p",{className:"text-green-200 text-sm mb-4",children:"Descarga la aplicación para Android"}),e.jsx(s,{onClick:()=>window.open("https://github.com/complicesconecta/conecta-social-comunidad/releases","_blank"),className:"bg-green-600 hover:bg-green-700",children:"Descargar v1.3.3 (beta)"})]})}),e.jsx(i,{className:"bg-gradient-to-r from-purple-900/80 to-pink-900/80 backdrop-blur-sm border border-purple-400/30",children:e.jsxs(o,{className:"p-6 text-center",children:[e.jsx(r,{className:"h-8 w-8 text-purple-400 mx-auto mb-3"}),e.jsx("h3",{className:"text-lg font-semibold text-white mb-2",children:"Soporte"}),e.jsx("p",{className:"text-purple-200 text-sm mb-4",children:"Obtén ayuda y reporta problemas"}),e.jsx(s,{onClick:()=>n("/support"),className:"bg-purple-600 hover:bg-purple-700",children:"Contactar Soporte"})]})})]}),e.jsx(i,{className:"bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-sm border border-indigo-400/30",children:e.jsxs(o,{className:"p-6 text-center",children:[e.jsx("h3",{className:"text-xl font-bold text-white mb-4",children:"Estado Actual del Proyecto"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4 text-center",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-2xl font-bold text-indigo-400",children:"v1.5.1"}),e.jsx("div",{className:"text-indigo-200 text-sm",children:"Versión Actual"})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-2xl font-bold text-green-400",children:"Beta"}),e.jsx("div",{className:"text-green-200 text-sm",children:"Fase de Desarrollo"})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-2xl font-bold text-yellow-400",children:"95%"}),e.jsx("div",{className:"text-yellow-200 text-sm",children:"Completado"})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-2xl font-bold text-purple-400",children:"2025"}),e.jsx("div",{className:"text-purple-200 text-sm",children:"Lanzamiento"})]})]})]})})]})]})}export{y as default};
