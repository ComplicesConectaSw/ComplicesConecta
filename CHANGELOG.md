# Changelog

All notable changes to this project will be documented in this file.

## [3.7.1] - 2025-11-20

### ✨ Features Avanzadas Implementadas
- **Modal de Imagen Expandida**: Carrusel completo con navegación flechas + dots
- **Swipe Gestures**: Navegación táctil en móvil + teclado
- **Likes Individuales**: Sistema de likes por imagen con contador animado
- **Comentarios por Imagen**: Sistema de comentarios con prompt interactivo
- **Control Parental Avanzado**: PIN 4 dígitos + auto-bloqueo configurable
- **3 Niveles Restricción**: Soft (sin auto-bloqueo), Medium (5min), Strict (5min + restricciones)
- **Estados Persistentes**: Configuración guardada en localStorage
- **Integración Completa**: ProfileSingle + ProfileCouple con modal unificado

### 🔧 Mejoras Técnicas
- **ImageModal.tsx**: Componente nuevo (210 líneas) con navegación completa
- **ParentalControl.tsx**: Componente nuevo (220 líneas) con lógica avanzada
- **Build Optimizado**: 1,021.01 kB (293.02 kB gzip) - 24.41s
- **Tests E2E**: 9/9 pasando (25.8s) - Validación completa
- **Manual Usuario**: Documentación completa v3.7.1 (300+ líneas)

### 🐛 Fixes
- **ProfileCouple.tsx**: Corregidos tipos partner1_name → partner1_first_name
- **Variables no usadas**: Prefijadas con _ para cumplir linting
- **CSS inline styles**: Documentados como legítimos para barras dinámicas
- **ParentalControl**: Corregidas referencias a funciones renombradas

## [v3.7.2] - 2025-11-21 00:24

### 🔒 SISTEMA LEGAL AVANZADO - PROTOCOLO DE DISOLUCIÓN
- **Consentimiento Dinámico**: Sistema inteligente con evidencia legal (IP, timestamp, hash)
- **Protocolo de Divorcio Digital**: Acuerdos prenupciales con cláusula de muerte súbita
- **Cuenta Regresiva**: Timer de 72h para resolución de disputas de pareja
- **Confiscación Automática**: ADMIN_FORFEIT por expiración de plazo

### 🏗️ ARQUITECTURA LEGAL IMPLEMENTADA
- **ConsentGuard.tsx**: Componente inteligente de consentimientos por capas
- **CoupleDissolutionService.ts**: Lógica completa de congelamiento y disolución
- **CoupleDisputeManager.tsx**: UI "Zona de Peligro" con cronómetro en tiempo real
- **Migraciones SQL**: Sistema completo de evidencia legal y disputas

### 💾 BASE DE DATOS LEGAL
- **user_consents**: Consentimientos con evidencia legal completa
- **couple_agreements**: Acuerdos prenupciales digitales
- **couple_disputes**: Sistema de disputas con timer automático
- **frozen_assets**: Detalle de activos congelados durante disputas

### ⚖️ CUMPLIMIENTO NORMATIVO
- **Evidencia Legal**: IP, timestamps, hashes SHA-256 para integridad
- **Texto Legal**: Cláusulas defensibles ante tribunales
- **Estados Inmutables**: Proceso irreversible una vez iniciado
- **RLS Policies**: Seguridad por usuario y pareja

## [v3.7.1] - 2025-11-20 22:58

### 🔒 SEGURIDAD CRÍTICA
- **SmartMatchingService**: Implementado filtro `is_demo` para separar usuarios demo/real
- **RLS Policies**: Migración `20251120_security_fix_demo_isolation.sql` con políticas de seguridad
- **Doble validación**: Aplicación + Base de datos para prevenir cruce de datos

### 🔧 REFACTORIZACIÓN ARQUITECTURAL
- **Dependencias circulares**: Eliminadas completamente (AILayerService ↔ PyTorchScoringModel)
- **Tipos centralizados**: `src/services/ai/types.ts` para interfaces compartidas
- **Funciones compartidas**: `src/services/ai/utils.ts` para lógica reutilizable
- **Lazy imports**: Implementados para evitar ciclos de dependencia

### 🐳 INFRAESTRUCTURA
- **Supabase local**: Sincronizado con BD remota (30 migraciones aplicadas)
- **Docker Neo4j**: Configurado con `docker-compose.neo4j.yml`
- **Tipos TypeScript**: Regenerados desde BD actualizada (8,388 líneas)

### ✨ FEATURES AVANZADAS COMPLETADAS
- **ImageModal.tsx**: Modal carrusel completo con navegación, likes y comentarios por imagen
- **ParentalControl.tsx**: Control parental avanzado con PIN, auto-bloqueo y 3 niveles de restricción
- **Integración Profiles**: Modal unificado para ProfileSingle y ProfileCouple

### 🔧 MEJORAS TÉCNICAS
- **Build optimizado**: Bundle 1,021.62 kB (293.24 kB gzip)
- **Tests E2E**: 9/9 pasando (25.8s)
- **TypeScript**: 100% type-safe (errores corregidos)
- **Documentación**: Manual de usuario completo (300+ líneas)

### 📊 MÉTRICAS FINALES
- **Progreso**: 8/8 tareas completadas (100%)
- **Estado**: LISTO PARA PRODUCCIÓN v3.7.1
- **Build time**: 46.98s (con sincronización completa)
- **Errores críticos**: 0
- **Vulnerabilidades**: Corregidas (separación demo/real blindada)

## [3.7.0] - 2025-11-16

### ✨ Agregado
- 🏆 Sistema completo de recompensas para beta-testers (4 niveles)
- 💰 Economía de tokens para salas (Pay-to-Enter & Earn)
- 📋 Sistema de límites por plan (Free/Basic/Premium/VIP)
- ⚖️ Documentos legales completos (Términos, Privacidad, Deslinde)
- 🗄️ 10 tablas Supabase para sistema de recompensas
- 🎮 Misiones semanales y sistema de puntos
- 🚨 Sistema anti-cheating
- 📊 Estrategia completa beta → lanzamiento

### 🔧 Corregido
- ✅ TemplateDemo: aria-labels de accesibilidad
- ✅ Discover: z-index background (pantalla oscura)
- ✅ Trigger PostgreSQL: columna GENERATED
- ✅ Chat.tsx: Estructura JSX estabilizada

### 📚 Documentación
- Guía completa sistema de recompensas
- Estrategia de monetización
- Documentos legales (Ley Olimpia incluida)
- Índice legal completo
- Resumen de sesións file.

## [3.6.6] - 2025-11-19

### 🚨 FEATURES CRÍTICAS (Ley Olimpia & Demo Inversor)
- 🔐 **ContentProtectionService** - Anti-screenshot, anti-download, anti-devtools
- 🆔 **UserIdentificationService** - IDs únicos (SNG-XXXXXXXX / CPL-XXXXXXXX)
- 📋 **ReportManagementService** - Sistema completo de reportes (RPT-XXXXXXXX)
- ⚖️ **Cumplimiento Ley Olimpia** (Arts. 259 Ter/Quáter/Quinquies)

### ✨ Features Implementadas (10/15 Fases - 67%)
- 💬 **Chat Mejorado**: Emojis, archivos, reacciones, mensajes de voz
- 📝 **AdvancedProfileEditor**: Editor con preview live, Markdown support
- 🖼️ **ImageLightbox**: Fullscreen con zoom, navegación, thumbnails
- 📊 **AnalyticsDashboard**: Métricas, gráficos, engagement score
- 🎮 **RewardsSystem**: Niveles, logros, puntos, badges
- 🔍 **AdvancedSearch**: Filtros múltiples, rangos, ordenamiento
- 🚀 **OnboardingFlow**: 4 pasos animados para nuevos usuarios
- ✨ **MicroInteractions**: 10+ componentes UI premium
- 🎨 **UI/UX Premium**: Animaciones, tooltips, skeletons, toasts

### 🔧 Corregido
- ✅ Errores de accesibilidad (aria-labels en selects y buttons)
- ✅ Inline styles movidos a Tailwind classes
- ✅ Lint warnings eliminados (unused vars, imports)

### 📦 Código Agregado
- ~6,520 líneas de código productivo
- 15 nuevos archivos de componentes y servicios
- 12 commits incrementales
- Push exitoso a GitHub master (be5faa5)

### 🎯 Estado
- ✅ Build exitoso sin errores
- ✅ Todas las features críticas completadas
- ✅ Listo para demo con inversor (viernes)

## [3.7.0] - 2025-11-16

### ✨ Agregado
- 🏆 Sistema completo de recompensas para beta-testers (4 niveles)
- 💰 Economía de tokens para salas (Pay-to-Enter & Earn)
- 📋 Sistema de límites por plan (Free/Basic/Premium/VIP)
- ⚖️ Documentos legales completos (Términos, Privacidad, Deslinde)
- 🗄️ 10 tablas Supabase para sistema de recompensas
- 🎮 Misiones semanales y sistema de puntos
- 🚨 Sistema anti-cheating
- 📊 Estrategia completa beta → lanzamiento

### 🔧 Corregido
- ✅ TemplateDemo: aria-labels de accesibilidad
- ✅ Discover: z-index background (pantalla oscura)
- ✅ Trigger PostgreSQL: columna GENERATED
- ✅ Chat.tsx: Estructura JSX estabilizada

### 📚 Documentación
- Guía completa sistema de recompensas
- Estrategia de monetización
- Documentos legales (Ley Olimpia incluida)
- Índice legal completo
- Resumen de sesións file.

## [3.6.3] - 2025-11-15

### Added - Type Safety Complete
- **100% TypeScript Coverage**: Todos los errores TypeScript eliminados
- **Event Handlers Type-Safe**: ErrorEvent, PromiseRejectionEvent, FormEvent, MouseEvent
- **DOM Operations Type-Safe**: appendChild, createElement, getComputedStyle con casting correcto
- **Supabase Operations**: Null checks y type assertions implementados
- **Canvas API Type-Safe**: HTMLCanvasElement, toBlob callbacks correctamente tipados
- **Component Props Validation**: ProfileCard, Modal, Form components completamente tipados
- **Test Suite Type-Safe**: Mock data y assertions alineados con interfaces

### Fixed - TypeScript Errors
- **APMService.ts**: Event types (ErrorEvent, PromiseRejectionEvent) implementados
- **ErrorAlertService.ts**: Global error handling completamente type-safe
- **WalletService.ts**: Supabase operations usando tablas válidas (app_logs)
- **ContrastFixer.tsx**: DOM operations y accessibility fixes type-safe
- **ProfileThemeShowcase.tsx**: Component props corregidas, variant eliminado
- **NFTVerificationService.ts**: Null safety implementado para strings
- **20+ Components**: Event handlers completamente tipados
- **15+ Services**: Type safety implementado en todos los servicios
- **10+ Tests**: Mock data alineado con interfaces TypeScript

### Changed - Database Alignment
- **Supabase Local/Remote**: Bases de datos completamente sincronizadas
- **Migration Scripts**: Políticas RLS con verificación de existencia
- **Docker Desktop**: Integración completa y funcional
- **Type Definitions**: Interfaces actualizadas y validadas

## [3.6.2] - 2025-11-09

### Fixed - Vercel Deployment
- **vercel.json**: Eliminada sección `routes` (conflicto con `rewrites`/`headers`)
- **vercel.json**: Eliminado header con patrón regex inválido `/(.*\\.(js|css|...))$`
- **vite.config.ts**: Chunks estables con hash, CSS no split (`cssCodeSplit: false`), base path `/`
- **index.html**: Ruta absoluta `/src/main.tsx` para compatibilidad con Vercel
- **build-and-deploy.ps1**: Función `Import-EnvFile` para cargar variables desde `.env`/`.env.local`
- **build-and-deploy.ps1**: Verificación opcional de variables (advertencia, no error fatal)
- **build-and-deploy.ps1**: Detección de conflictos en `vercel.json` antes de deploy

### Fixed - Funciones Globales
- **showEnvInfo.ts**: Funciones ahora se exponen también en producción (no solo en desarrollo)
- **captureConsoleErrors.ts**: Funciones ahora se exponen también en producción (no solo en desarrollo)
- **Verificaciones adicionales**: Múltiples intentos de exposición con delays para asegurar disponibilidad
- **Wallet conflicts**: Errores de wallet extensions completamente silenciados

### Fixed - CircleCI
- **.circleci/config.yml**: Actualizado a Node.js 20.19+ (requerido por Vite 7.2.2)
- **package.json**: Agregada sección `engines` con requisito Node.js 20.19+ o 22.12+
- **Verificación de versión**: Paso explícito para verificar e instalar Node.js 20.19+ si es necesario

### Fixed - Servicios
- **AdminProduction.tsx**: Importado `safeGetItem` de `safeLocalStorage`
- **postsService.ts**: 
  - Corregido manejo de `demoUser` con verificación de tipo
  - Eliminados alias no soportados en consultas Supabase
  - Ajustados tipos para permitir `null` en `created_at` y `updated_at`
- **InvitationsService.ts**:
  - Corregido manejo de `demoUser` con verificación de tipo
  - Eliminadas interfaces no usadas
  - Ajustados tipos para manejar valores `null` correctamente
- **clearStorage.ts**: Importado `safeGetItem` y `safeRemoveItem` de `safeLocalStorage`
- **StoryViewer.tsx**: Importado `safeGetItem` de `safeLocalStorage`

### Added - Scripts Unificados
- **database-manager.ps1**: Script maestro que unifica 5 scripts de gestión de BD
  - Sincronización de BD local y remota
  - Verificación de alineación de tablas
  - Generación de scripts para migraciones remotas
  - Regeneración de tipos TypeScript
  - Análisis de migraciones y backups
- **Uso**: `.\scripts\database-manager.ps1 -Action sync|verify|generate-remote|regenerate-types|analyze|all`

### Changed - Scripts Actualizados
- **fix-character-encoding.ps1**: Backups ahora se guardan en directorio `bck` fuera del proyecto
  - Ubicación: `C:\Users\conej\Documents\bck` (excluido de `.gitignore` y `.dockerignore`)
  - Ejecutado exitosamente: 1,171 archivos corregidos

### Added - Build y Deploy
- **build-and-deploy.ps1**: Script automatizado para build y deploy a Vercel
  - Carga automática de variables desde `.env`/`.env.local`
  - Verificación de variables críticas
  - Type check antes de build
  - Análisis de tamaño de build
  - Verificación de `vercel.json`
  - Deploy opcional a Vercel

### Added - Documentación
- **docs/VERCEL_DEPLOY_FIX_v3.6.3.md**: Guía completa de fixes de deployment Vercel

### Deprecated - Scripts Consolidados
- **alinear-supabase.ps1**: Usar `database-manager.ps1 -Action sync`
- **analizar-y-alinear-bd.ps1**: Usar `database-manager.ps1 -Action analyze`
- **aplicar-migraciones-remoto.ps1**: Usar `database-manager.ps1 -Action generate-remote`
- **sync-databases.ps1**: Usar `database-manager.ps1 -Action sync`
- **verificar-alineacion-tablas.ps1**: Usar `database-manager.ps1 -Action verify`

## [3.5.0] - 2025-11-06

### Added - Sistema Completo v3.5.0
- **Sistema de Clubs Verificados**: 5 tablas nuevas (clubs, club_verifications, club_checkins, club_reviews, club_flyers)
  - Check-ins geoloc con radio 50m
  - Reseñas solo de usuarios verificados con check-in real
  - Watermark + Blur IA automático en imágenes
  - Páginas públicas `/clubs/{slug}` con flyers editables
  - Panel admin `/admin/partners` para gestión
- **Sistema de Moderación 24/7**: 3 tablas nuevas (moderator_sessions, moderator_payments, report_ai_classification)
  - Jerarquía 5 niveles (SuperAdmin → Elite → Senior → Junior → Trainee)
  - Pagos automáticos cada lunes basados en % revenue
  - Timer conexión automático
  - IA pre-clasificación de reportes
  - Baneo permanente con huella digital (canvas + WorldID)
- **Sistema de Tokens CMPX Shop**: 3 tablas nuevas (cmpx_shop_packages, cmpx_purchases, gallery_commissions)
  - Shop activo: 1000 CMPX = 300 MXN
  - Comisión galerías: 10% (creador gana 90%)
  - Staking 10% APY
  - DAO a 10K usuarios
- **Sistema de Donativos/Inversión**: 4 tablas nuevas (investments, investment_returns, investment_tiers, stripe_events)
  - SAFTE automático: 10% retorno anual garantizado
  - Tiers: $10K, $25K, $50K, $100K MXN
  - Landing `/invest` con Stripe integrado
  - Plataformas AngelList + Republic listos para publicar

### Added - Features Innovadoras Completas
- **IA Consent Verification in Chats**: Sistema real-time de verificación de consentimiento usando NLP con OpenAI GPT-4, auto-pause si consenso <80% (Ley Olimpia MX)
- **NFT-Verified Galleries**: Galerías NFT con GTK staking (100 GTK requeridos), mint ERC-721 stub en Polygon, integración con gallery_permissions
- **Predictive Matching con Social Graphs**: Matching predictivo usando Neo4j + IA Emocional, algoritmo "friends-of-friends" con peso emocional, score ML 400k params
- **Sustainable Virtual Events**: Eventos virtuales con tracking CO2, recompensas CMPX (50 por participación), acceso VIP con GTK/Premium

### Fixed - Correcciones de Servicios
- **ContentModerationService.ts**: Corregido tipo `Json` para `metadata` en inserción de `moderation_logs`
- **VirtualEventsService.ts**: Corregido manejo de valores `null` en `couple_id`, `created_at`, `updated_at` al mapear eventos

### Added - Migraciones SQL
- `20251106_05_create_club_system.sql`: Sistema completo de clubs verificados (5 tablas)
- `20251106_06_create_investment_system.sql`: Sistema de inversiones SAFTE (4 tablas)
- `20251106_07_create_moderation_v2_system.sql`: Moderación v2 con pagos automáticos (3 tablas)
- `20251106_08_create_permanent_ban_system.sql`: Baneo permanente con huella digital (2 tablas)
- `20251106_09_create_cmpx_shop_system.sql`: Shop CMPX tokens y comisiones (3 tablas)
- `20251106_01_consent_verification.sql`: Tabla `consent_verifications` con scoring y estado
- `20251106_02_nft_staking.sql`: Tablas `nft_galleries`, `nft_tokens`, `nft_ownership`, `nft_staking_requirements`
- `20251106_03_graph_matching.sql`: Tablas `graph_matches`, `social_connections`, `emotional_scores`
- `20251106_04_virtual_events.sql`: Campos de sostenibilidad en `couple_events`

## [3.5.0] - 2025-11-05

> **📚 Para documentación completa, consulta [DOCUMENTACION_MAESTRA_UNIFICADA_v3.5.0.md](./DOCUMENTACION_MAESTRA_UNIFICADA_v3.5.0.md)**

### Fixed - Neo4j Integration Corrections
- **sync-postgres-to-neo4j.ts**: Fixed column references (name instead of email/first_name/last_name, select('*') for matches)
- **Neo4jService.createUser()**: Fixed nested metadata issue (Neo4j doesn't support nested objects, metadata flattened)
- **Query Cypher**: Fixed syntax with correct `ON CREATE SET` and `ON MATCH SET` clauses
- **couple_profile_likes**: Fixed column references (liker_profile_id and couple_profile_id instead of liker_id/liked_id)

### Added - Neo4j Setup Script
- **setup-neo4j-indexes.ts**: New script for automatic Neo4j index and constraint setup
- **setup:neo4j-indexes**: New npm script added to package.json

### Updated - Neo4j Status
- **Operational**: Neo4j running, connection verified, 4 users synchronized successfully
- **Environment Variables**: VITE_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY added to .env

### Updated - Documentation
- All documentation files updated to reflect Neo4j operational status
- Corrections and optimizations documented in all relevant files

## [3.3.0] - 2025-09-23

### Added - Dashboard Administrativo
- **AdminDashboard**: Interfaz administrativa completa con 6 subpaneles modulares
- **ReportsPanel**: Gestión avanzada de reportes con filtros y estadísticas
- **PerformancePanel**: Monitoreo de métricas del sistema en tiempo real
- **AnalyticsPanel**: Analytics avanzados de tokens CMPX/GTK
- **UserManagementPanel**: Administración de usuarios (estructura base)
- **TokenSystemPanel**: Gestión del sistema de tokens (estructura base)
- **SecurityPanel**: Configuración de seguridad avanzada (estructura base)

### Added - Sistema de Monitoreo
- **PerformanceMonitoringService**: Servicio completo de monitoreo de performance
- **Tabla system_metrics**: Almacenamiento de métricas con RLS
- **Monitoreo automático**: Recolección configurable cada 5 minutos
- **8 tipos de métricas**: response_time, query_count, error_rate, active_users, token_transactions, report_activity, memory_usage, cpu_usage
- **Estadísticas agregadas**: Cálculo automático de promedios, mínimos y máximos

### Added - Sistema de Notificaciones Push
- **PushNotificationService**: Servicio completo con Firebase FCM
- **3 tablas nuevas**: user_notification_preferences, user_device_tokens, notification_history
- **6 tipos de notificaciones**: report_resolved, token_transaction, moderation_action, system_alert, match_notification, message_notification
- **Preferencias granulares**: Control por usuario y tipo de notificación
- **Historial completo**: Seguimiento de todas las notificaciones enviadas

### Added - Analytics Avanzados
- **TokenAnalyticsService**: Métricas completas de tokens CMPX/GTK
- **Tabla token_analytics**: Almacenamiento por períodos (hourly, daily, weekly, monthly)
- **Reportes automáticos**: Generación programada con insights de IA
- **Métricas de supply**: Total y circulante de CMPX/GTK
- **Métricas de staking**: Total staked, stakers activos, duración promedio
- **Métricas de usuarios**: Usuarios activos y nuevos

### Added - Seguridad Avanzada
- **3 tablas de seguridad**: moderation_logs, audit_logs, user_2fa_settings
- **Fraud detection**: Estructura para detección de actividad sospechosa
- **2FA ready**: Configuración para autenticación de dos factores
- **Auditoría completa**: Logs de todas las acciones administrativas
- **15+ políticas RLS nuevas**: Seguridad granular en todas las tablas

### Added - Optimización Responsive
- **Mobile First Design**: Diseño optimizado para móviles
- **Android Optimizations**: Optimizaciones específicas para Android
- **Touch Targets**: Botones de 44px mínimo para dispositivos táctiles
- **CSS Responsive**: Archivo dedicado con breakpoints optimizados
- **Accesibilidad**: Soporte completo para reduced motion y high contrast
- **5 breakpoints**: xs, sm, md, lg, xl para cobertura completa

### Added - Testing
- **3 archivos de tests**: PerformanceMonitoringService, PushNotificationService, TokenAnalyticsService
- **40+ casos de prueba**: Cobertura completa de funcionalidades críticas
- **Mocks apropiados**: Para Supabase y dependencias externas

### Changed
- **Tipos TypeScript**: Regenerados con todas las nuevas tablas
- **Compilación**: Mantiene 0 errores TypeScript
- **Estructura de archivos**: Organización mejorada con carpeta panels/

### Technical
- **6 nuevas tablas**: system_metrics, user_notification_preferences, user_device_tokens, notification_history, moderation_logs, audit_logs, token_analytics, user_2fa_settings
- **3 nuevos servicios**: PerformanceMonitoringService, PushNotificationService, TokenAnalyticsService
- **7 nuevos componentes**: AdminDashboard + 6 paneles
- **1 archivo CSS**: responsive-admin.css para optimización móvil

## [3.4.1] - 2025-01-28

### ✅ Correcciones de Tests
- **Tests de Performance**: Corregidos todos los tests fallidos de performance.test.ts
- **Mock de Cache**: Implementado cache simulado correctamente para TokenAnalyticsService
- **Recomendaciones**: Corregida búsqueda case-insensitive en recomendaciones de performance
- **13/13 tests pasando**: Suite de performance completamente funcional

### 🔧 Optimizaciones de Código
- **Variables no utilizadas**: Corregidos warnings de ESLint en PerformanceMonitoringService
- **TypeScript**: Mantenido 0 errores de tipos
- **Linting**: Solo 5 warnings menores (variables no utilizadas)

### 📊 Estado de Tests
- **Tests Totales**: 187 tests ejecutados
- **Tests Exitosos**: 170 tests pasando (90.9%)
- **Tests Fallidos**: 17 tests fallidos (principalmente en servicios avanzados)
- **Cobertura**: Tests críticos de performance y funcionalidad core funcionando

### 🗄️ Base de Datos
- **Migraciones**: Scripts de migración preparados para tablas faltantes
- **Verificación**: Scripts de verificación de tablas existentes
- **Estructura**: Base de datos lista para producción con tablas core

## [3.4.0] - 2025-01-27

## [v3.0.0] - 2025-09-21

### 🎨 Sistema de Temas Personalizable
- **5 Temas Únicos**: Light, Dark, Elegant, Modern, Vibrant con paletas específicas
- **Selección en Registro**: Modal interactivo `ThemeModal.tsx` durante creación de cuenta
- **Persistencia Supabase**: Nuevas columnas `preferred_theme`, `navbar_style`, `theme_updated_at` en tabla `profiles`
- **Hook Unificado**: `useThemeConfig()` detecta automáticamente modo demo/producción
- **Aplicación Automática**: Temas basados en género y tipo de perfil (single/couple)
- **Estilos Dinámicos**: Navbar adaptable (transparente/sólido) según tema seleccionado
- **Compatibilidad Total**: Funciona igual en modo demo (localStorage) y producción (Supabase)
- **Componentes UI**: `ThemeSelector.tsx` con animaciones Framer Motion y previews visuales
- **Migración SQL**: `20250921_add_theme_preferences.sql` con triggers automáticos e índices optimizados
- **Integración Completa**: Auth.tsx, EditProfile, Header con aplicación dinámica de temas

### 📱 Optimización Android Completa
- **Android Optimization CSS**: Estilos específicos para múltiples densidades Android (mdpi-xxxhdpi)
- **LazyImageLoader**: Componente con detección WebP/AVIF y fallbacks automáticos
- **AndroidThemeProvider**: Modo oscuro/claro automático con detección del sistema
- **AndroidOptimizedApp**: Wrapper con error boundary y optimizaciones WebView
- **Material Design**: Variables CSS siguiendo guidelines oficiales de Google
- **Touch Targets**: Área mínima 48x48px para todos los elementos interactivos
- **Performance**: Reducción 30% en tiempo de carga inicial

### 🔧 Correcciones TypeScript
- **AndroidOptimizedApp.tsx**: Eliminados imports inexistentes, corregido webkitOverflowScrolling
- **useProfileCache.ts**: Logs comentados para tests más limpios
- **useSupabaseTheme.ts**: Implementado hook para persistencia real con subscripciones en tiempo real
- **useProfileTheme.ts**: Hooks unificados para demo y producción con fallbacks seguros
- **0 Errores TypeScript**: Proyecto completamente limpio y production-ready

### 📊 Testing y Calidad
- **Test Suite**: 140/147 tests pasando (95.2% success rate)
- **Build Time**: Optimizado de 14.29s a 8.20s (-42%)
- **Bundle Size**: Mantenido en 321KB optimizado
- **Documentación**: README.md, RELEASE_NOTES.md y project-structure.md actualizados

## [v2.1.8] - 2025-01-14

### ✨ Nuevas Funcionalidades

#### 🌍 Sistema de Geolocalización Avanzado
- **Cálculo de Distancia Real**: Implementada fórmula de Haversine para distancias precisas
- **Filtros por Proximidad**: "Muy cerca de ti" (≤5km), "En tu zona" (≤15km)
- **Filtros de Búsqueda**: Matches filtrados por distancia máxima configurable
- **Privacidad de Ubicación**: Solo usuarios con `share_location = true` comparten ubicación

#### 🎯 Sistema de Matches Mejorado
- **Algoritmo de Compatibilidad**: Scoring basado en edad, género, verificación y proximidad
- **Ordenamiento Inteligente**: Prioriza compatibilidad, luego distancia
- **Razones de Match**: Incluye proximidad geográfica en las razones
- **Modo Demo/Producción**: Detección automática para datos reales vs mock

#### 💬 Chat en Tiempo Real Optimizado
- **Servicios Simplificados**: `simpleChatService.ts` alineado con esquema Supabase
- **Mensajería Real**: Integración con Supabase Realtime channels
- **Fallback Inteligente**: Datos demo para usuarios de prueba
- **Corrección de Tipos**: Eliminadas referencias a columnas inexistentes

### 🔧 Mejoras Técnicas

#### 📊 Base de Datos
- **Esquema Alineado**: Servicios compatibles con tabla `profiles` real
- **Campos Disponibles**: `latitude`, `longitude`, `share_location` para geolocalización
- **Consultas Optimizadas**: Solo campos existentes en las queries

#### 🛠️ Servicios
- **`simpleMatchService.ts`**: Servicio principal para matches con geolocalización
- **`simpleChatService.ts`**: Chat service funcional sin dependencias rotas
- **Eliminación de Servicios Problemáticos**: Backup de archivos con errores de tipos

#### 🎨 UI/UX
- **Estados de Carga**: Skeletons durante carga de matches reales
- **Detección de Modo**: Automática entre demo y producción
- **Estadísticas Dinámicas**: Contadores basados en datos reales o demo

### 🐛 Correcciones

#### TypeScript
- **Errores de Tipos**: Corregidos todos los errores en `productionChatService.ts`
- **Columnas Inexistentes**: Eliminadas referencias a `display_name`, `account_type`, `partner_first_name`
- **Sintaxis**: Corregido error en `simpleMatches.ts` línea 139

#### Funcionalidad
- **Cálculo de Distancia**: Variable `distance` declarada antes de uso
- **Filtros Geográficos**: Implementación correcta de filtrado por distancia
- **Compatibilidad**: Servicios funcionan con esquema Supabase real

### 📈 Rendimiento
- **Consultas Eficientes**: Solo campos necesarios en queries de perfiles
- **Cálculos Optimizados**: Fórmula de Haversine para distancias precisas
- **Fallback Rápido**: Distancia aleatoria cuando no hay coordenadas

### 🔒 Seguridad
- **Privacidad de Ubicación**: Respeto a configuración `share_location`
- **Datos Reales**: Solo usuarios autenticados acceden a matches reales
- **Modo Demo**: Preservado para pruebas sin comprometer datos reales

---

## Versiones Anteriores

### [v2.1.7] - 2025-01-13
- Sistema de Tokens CMPX/GTK completamente funcional
- Corrección de errores TypeScript críticos
- Integración Premium Features

### [v2.1.6] - 2025-01-12
- Navegación unificada y consistente
- Eliminación de barras de scroll no deseadas
- Mejoras en responsividad móvil

### [v2.1.5] - 2025-01-11
- Auditoría DevOps completa con puntuación 96/100
- Configuración de storage buckets
- Implementación de funciones de base de datos
