# AUDITORÍA COMPLETA v3.6.3 MEJORADA
- Fecha: 12 nov 2025 22:43
- Ruta: C:\Users\conej\Documents\conecta-social-comunidad-main
- Alias configurado: @/ → ./src/

## 1. ESTRUCTURA (excluye: node_modules, .git, build, dist, android, ios, public, .vite, coverage, bck)
- Directorios: 212
- Archivos: 1145

## DIRECTORIOS VACÍOS (1)
- \docs\tests

## ARCHIVOS DUPLICADOS (17)
- AILayerService.test.ts (13408 bytes)
  → \src\tests\AILayerService.test.ts
  → \src\tests\unit\AILayerService.test.ts
- auth.e2e.test.ts (4939 bytes)
  → \src\tests\auth.e2e.test.ts
  → \src\tests\e2e\auth.e2e.test.ts
- biometric-auth.test.ts (19971 bytes)
  → \src\tests\biometric-auth.test.ts
  → \src\tests\security\biometric-auth.test.ts
- emailService.test.ts (4770 bytes)
  → \src\tests\emailService.test.ts
  → \src\tests\unit\emailService.test.ts
- Investors.tsx (45455 bytes)
  → \docs-unified\Investors.tsx
  → \src\pages\Investors.tsx
- invitations.test.ts (5604 bytes)
  → \src\tests\invitations.test.ts
  → \src\tests\unit\invitations.test.ts
- localStorage-migration.test.ts (9383 bytes)
  → \src\tests\localStorage-migration.test.ts
  → \src\tests\unit\localStorage-migration.test.ts
- matching.test.ts (4515 bytes)
  → \src\tests\matching.test.ts
  → \src\tests\unit\matching.test.ts
- PerformanceMonitoringService.test.ts (3746 bytes)
  → \src\tests\PerformanceMonitoringService.test.ts
  → \src\tests\unit\PerformanceMonitoringService.test.ts
- PushNotificationService.test.ts (7009 bytes)
  → \src\tests\PushNotificationService.test.ts
  → \src\tests\unit\PushNotificationService.test.ts
- PyTorchScoringModel.test.ts (11264 bytes)
  → \src\tests\PyTorchScoringModel.test.ts
  → \src\tests\unit\PyTorchScoringModel.test.ts
- rls-policies.test.ts (5173 bytes)
  → \src\tests\rls-policies.test.ts
  → \src\tests\integration\rls-policies.test.ts
- roles.test.ts (12994 bytes)
  → \src\tests\roles.test.ts
  → \src\tests\unit\roles.test.ts
- send-email.test.ts (6842 bytes)
  → \src\tests\send-email.test.ts
  → \src\tests\integration\send-email.test.ts
- supabase-integration.test.ts (9777 bytes)
  → \src\tests\supabase-integration.test.ts
  → \src\tests\integration\supabase-integration.test.ts
- TokenDashboard.test.tsx (5796 bytes)
  → \src\tests\TokenDashboard.test.tsx
  → \src\tests\components\TokenDashboard.test.tsx
- zod-validation.test.ts (9295 bytes)
  → \src\tests\zod-validation.test.ts
  → \src\tests\unit\zod-validation.test.ts

## ARCHIVOS GRANDES (>10MB) (0)

## ARCHIVOS VACÍOS (1)
- \src\pages\LegalNew.tsx

## ARCHIVOS CORRUPTOS (2)
- \src\components\accessibility\ContrastFixer.tsx
- \src\services\ConsentVerificationService.ts

## ARCHIVOS OBSOLETOS (6)
- \docs\legal\Política de Backups.mc
- \docs-unified\supabase-backup-info.txt
- \docs-unified\legacy-docs-unified\email\SUPABASE_EMAIL_SETUP_OLD.md
- \scripts\consolidar-backup-migraciones.ps1
- \scripts\crear-backup-migraciones.ps1
- \src\lib\backup-system.ts

## ARCHIVOS MAL UBICADOS (0)

## ARCHIVOS HUÉRFANOS (147)
- src/app/(admin)/AdminDashboard.tsx
- src/components/accessibility/AccessibilityAudit.tsx
- src/components/accessibility/AccessibilityProvider.tsx
- src/components/admin/AdvancedModerationPanel.tsx
- src/components/admin/ReportsManagement.tsx
- src/components/admin/SecurityDashboard.tsx
- src/components/ai/ContentModerationModal.tsx
- src/components/ai/SmartMatchingModal.tsx
- src/components/analytics/AdvancedAnalyticsDashboard.tsx
- src/components/android/AndroidOptimizedApp.tsx
- src/components/android/LazyImageLoader.tsx
- src/components/animations/EnhancedComponents.tsx
- src/components/animations/GlobalAnimations.tsx
- src/components/auth/EmailValidation.tsx
- src/components/auth/EmailVerification.tsx
- src/components/auth/ThemeInfoModal.tsx
- src/components/auth/WorldIDButton.tsx
- src/components/cache/CacheDashboard.tsx
- src/components/chat/ChatContainer.tsx
- src/components/chat/ChatList.tsx

## IMPORTS ROTOS (12)
- main.tsx:109 → './styles/global.css'
- Index.tsx:17 → '@/styles/animations.css'
- auth.test.ts:4 → '../setup/test-utils'
- mobile.test.ts:14 → '../../utils/mobile'
- performance.test.ts:7 → '../../services/postsService'
- performance.test.ts:8 → '../../services/PerformanceMonitoringService'
- performance.test.ts:9 → '../../services/TokenAnalyticsService'
- performance.test.ts:10 → '../../tests/mocks/performance'
- system-integration.test.ts:4 → '@/lib/ml-matching'
- TokenAnalyticsService.test.ts:6 → '../../services/TokenAnalyticsService'
- webVitals.test.ts:7 → '../../utils/webVitals'
- system-integration.test.ts:4 → '@/lib/ml-matching'

## DEPENDENCIAS FALTANTES (77)
@capacitor/android
@capacitor/app
@capacitor/browser
@capacitor/camera
@capacitor/cli
@capacitor/clipboard
@capacitor/core
@capacitor/device
@capacitor/filesystem
@capacitor/geolocation
@capacitor/haptics
@capacitor/ios
@capacitor/keyboard
@capacitor/local-notifications
@capacitor/network
@capacitor/push-notifications
@capacitor/share
@capacitor/splash-screen
@capacitor/status-bar
@capacitor/toast
@datadog/browser-logs
@datadog/browser-rum
@heroicons/react
@hookform/resolvers
@huggingface/inference
@huggingface/transformers
@radix-ui/react-accordion
@radix-ui/react-alert-dialog
@radix-ui/react-aspect-ratio
@radix-ui/react-avatar
@radix-ui/react-checkbox
@radix-ui/react-collapsible
@radix-ui/react-context-menu
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-hover-card
@radix-ui/react-label
@radix-ui/react-menubar
@radix-ui/react-navigation-menu
@radix-ui/react-popover
@radix-ui/react-progress
@radix-ui/react-radio-group
@radix-ui/react-scroll-area
@radix-ui/react-select
@radix-ui/react-separator
@radix-ui/react-slider
@radix-ui/react-slot
@radix-ui/react-switch
@radix-ui/react-tabs
@radix-ui/react-toast
@radix-ui/react-toggle
@radix-ui/react-toggle-group
@radix-ui/react-tooltip
@rollup/wasm-node
@sentry/react
@sentry/vite-plugin
@solana/web3.js
@supabase/supabase-js
@tailwindcss/postcss
@tanstack/react-query
@tensorflow/tfjs
@types/qrcode
@types/speakeasy
@types/uuid
@vitejs/plugin-react
@worldcoin/idkit
@eslint/js
@playwright/test
@tailwindcss/typography
@testing-library/dom
@testing-library/jest-dom
@testing-library/react
@testing-library/user-event
@types/node
@types/react
@types/react-dom
@vitest/coverage-v8

## POSIBLES SECRETOS (13)
- POSIBLE SECRETO: \src\app\(auth)\Auth.tsx
- POSIBLE SECRETO: \src\examples\hcaptcha-example.tsx
- POSIBLE SECRETO: \src\tests\auth.e2e.test.ts
- POSIBLE SECRETO: \src\tests\emailService.test.ts
- POSIBLE SECRETO: \src\tests\PushNotificationService.test.ts
- POSIBLE SECRETO: \src\tests\send-email.test.ts
- POSIBLE SECRETO: \src\tests\e2e\auth.e2e.test.ts
- POSIBLE SECRETO: \src\tests\integration\send-email.test.ts
- POSIBLE SECRETO: \src\tests\unit\emailService.test.ts
- POSIBLE SECRETO: \src\tests\unit\PushNotificationService.test.ts
- POSIBLE SECRETO: \tests\e2e-playwright\auth-flows\auth-flows-improved.spec.ts
- POSIBLE SECRETO: \tests\e2e-playwright\fixtures\auth-fixtures.ts
- POSIBLE SECRETO: \tests\e2e-playwright\helpers\EnhancedAuthHelper.ts

## VULNERABILIDADES (44)
- ⚠️  Posible SQL Injection: \vite-plugin-react-order.ts
- ⚠️  Posible XSS (innerHTML): \src\main.tsx
- ⚠️  localStorage sin validación: \src\app\(admin)\AdminProduction.tsx
- ⚠️  Posible SQL Injection: \src\components\HCaptchaWidget.tsx
- ⚠️  localStorage sin validación: \src\components\stories\StoryViewer.tsx
- ⚠️  Posible XSS (innerHTML): \src\components\ui\chart.tsx
- ⚠️  localStorage sin validación: \src\features\profile\useProfileTheme.ts
- ⚠️  Posible SQL Injection: \src\hooks\useGeolocation.ts
- ⚠️  localStorage sin validación: \src\hooks\usePersistedState.ts
- ⚠️  localStorage sin validación: \src\hooks\usePushNotifications.ts
- ⚠️  Posible XSS (innerHTML): \src\hooks\useScreenshotProtection.ts
- ⚠️  localStorage sin validación: \src\integrations\supabase\client.ts
- ⚠️  localStorage sin validación: \src\lib\app-config.ts
- ⚠️  localStorage sin validación: \src\lib\intelligentAutomation.ts
- ⚠️  localStorage sin validación: \src\lib\redis-cache.ts
- ⚠️  localStorage sin validación: \src\lib\security\dataEncryption.ts
- ⚠️  localStorage sin validación: \src\lib\security\rateLimiter.ts
- ⚠️  localStorage sin validación: \src\pages\Dashboard.tsx
- ⚠️  localStorage sin validación: \src\pages\Index.tsx
- ⚠️  Posible SQL Injection: \src\pages\TemplateDemo.tsx

## ERRORES DE CÓDIGO (3)
- ESLint: C:\Users\conej\Documents\conecta-social-comunidad-main\src\utils\walletProtection.ts: line 97, col 12, Warning - 'e' is defined but never used. (unused-imports/no-unused-vars)
- Lint:   97:12  warning  'e' is defined but never used  unused-imports/no-unused-vars
- Lint: Ô£û 1 problem (0 errors, 1 warning)

## USO DE 'as any' O 'null' CON TABLAS (0)
- ✅ No se encontraron usos problemáticos de 'as any' o 'null' con tablas

## PROBLEMAS ANDROID (0)
- ✅ Configuración Android correcta

## RESUMEN FINAL
- Duración: 02:46
- Archivos escaneados: 1145
- Directorios vacíos: 1
- Duplicados: 17
- Archivos vacíos: 1
- Archivos corruptos: 2
- Archivos obsoletos: 6
- Archivos mal ubicados: 0
- Archivos huérfanos: 147
- Imports rotos: 12
- Deps faltantes: 77
- Posibles secretos: 13
- Vulnerabilidades: 44
- Errores de código: 3
- Uso problemático de tablas: 0
