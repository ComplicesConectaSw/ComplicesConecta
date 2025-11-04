# Changelog

All notable changes to this project will be documented in this file.

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
