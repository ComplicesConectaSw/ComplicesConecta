# AUDITORÍA COMPLETA v3.6.3 MEJORADA
- Fecha: 09 nov 2025 00:44
- Ruta: C:\Users\conej\Documents\conecta-social-comunidad-main
- Alias configurado: @/ → ./src/

## 1. ESTRUCTURA (excluye: node_modules, .git, build, dist, android, ios, public, .vite, coverage, bck)
- Directorios: 209
- Archivos: 1073

## DIRECTORIOS VACÍOS (0)

## ARCHIVOS DUPLICADOS (1)
- RESUMEN_CORRECCIONES_v3.6.3.md (9510 bytes)
  → \RESUMEN_CORRECCIONES_v3.6.3.md
  → \docs\RESUMEN_CORRECCIONES_v3.6.3.md

## ARCHIVOS GRANDES (>10MB) (1)
- sentry-wizard.exe (82.5 MB) → 

## ARCHIVOS VACÍOS (0)

## ARCHIVOS CORRUPTOS (2)
- \src\components\accessibility\ContrastFixer.tsx
- \src\services\ConsentVerificationService.ts

## ARCHIVOS OBSOLETOS (7)
- \.gitignore.backup
- \docs-unified\legacy-docs-unified\email\SUPABASE_EMAIL_SETUP_OLD.md
- \scripts\consolidar-backup-migraciones.ps1
- \scripts\crear-backup-migraciones.ps1
- \src\lib\backup-system.ts
- \src\profiles\shared\ProfileImagePlaceholder.tsx
- \supabase\backup_info.txt

## ARCHIVOS MAL UBICADOS (1)
- \src\styles\components.css

## ARCHIVOS HUÉRFANOS (142)

## IMPORTS ROTOS (5)
- main.tsx:95 → './styles/global.css'
- Navigation.tsx:5 → '@/components/navigation/NavigationEnhanced'
- index.ts:23 → '@/entities/profile'
- Index.tsx:17 → '@/styles/animations.css'
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

## POSIBLES SECRETOS (9)
- POSIBLE SECRETO: \src\app\(auth)\Auth.tsx
- POSIBLE SECRETO: \src\examples\hcaptcha-example.tsx
- POSIBLE SECRETO: \src\tests\e2e\auth.e2e.test.ts
- POSIBLE SECRETO: \src\tests\integration\send-email.test.ts
- POSIBLE SECRETO: \src\tests\unit\emailService.test.ts
- POSIBLE SECRETO: \src\tests\unit\PushNotificationService.test.ts
- POSIBLE SECRETO: \tests\e2e-playwright\auth-flows\auth-flows-improved.spec.ts
- POSIBLE SECRETO: \tests\e2e-playwright\fixtures\auth-fixtures.ts
- POSIBLE SECRETO: \tests\e2e-playwright\helpers\EnhancedAuthHelper.ts

## VULNERABILIDADES (66)
- ⚠️  Posible SQL Injection: \vite-plugin-react-order.ts
- ⚠️  Posible XSS (innerHTML): \src\main.tsx
- ⚠️  localStorage sin validación: \src\app\(admin)\Admin.tsx
- ⚠️  localStorage sin validación: \src\app\(admin)\AdminProduction.tsx
- ⚠️  localStorage sin validación: \src\app\(auth)\Auth.tsx
- ⚠️  localStorage sin validación: \src\app\(discover)\Discover.tsx
- ⚠️  localStorage sin validación: \src\components\DismissibleBanner.tsx
- ⚠️  Posible SQL Injection: \src\components\HCaptchaWidget.tsx
- ⚠️  localStorage sin validación: \src\components\accessibility\AccessibilityProvider.tsx
- ⚠️  localStorage sin validación: \src\components\admin\AlertConfigPanel.tsx
- ⚠️  localStorage sin validación: \src\components\animations\AnimationProvider.tsx
- ⚠️  localStorage sin validación: \src\components\invitations\InvitationDialog.tsx
- ⚠️  localStorage sin validación: \src\components\premium\PremiumFeatures.tsx
- ⚠️  localStorage sin validación: \src\components\premium\PrivateMatches.tsx
- ⚠️  localStorage sin validación: \src\components\premium\VIPEvents.tsx
- ⚠️  localStorage sin validación: \src\components\premium\VirtualGifts.tsx
- ⚠️  localStorage sin validación: \src\components\profile\EnhancedGallery.tsx
- ⚠️  localStorage sin validación: \src\components\profile\ImageUpload.tsx
- ⚠️  localStorage sin validación: \src\components\security\BiometricAuth.tsx
- ⚠️  Posible XSS (innerHTML): \src\components\security\ProtectedMedia.tsx

## ERRORES DE CÓDIGO (0)
- ✅ No se encontraron errores de código

## USO DE 'as any' O 'null' CON TABLAS (4)
- backup-system.ts:251 → .from(table as any)
- backup-system.ts:301 → .from(tableName as any)
- VirtualEventsService.ts:140 → .from('event_participations' as any)
- VirtualEventsService.ts:164 → .from('event_participations' as any)

## PROBLEMAS ANDROID (0)
- ✅ Configuración Android correcta

## RESUMEN FINAL
- Duración: 02:52
- Archivos escaneados: 1073
- Directorios vacíos: 0
- Duplicados: 1
- Archivos vacíos: 0
- Archivos corruptos: 2
- Archivos obsoletos: 7
- Archivos mal ubicados: 1
- Archivos huérfanos: 142
- Imports rotos: 5
- Deps faltantes: 77
- Posibles secretos: 9
- Vulnerabilidades: 66
- Errores de código: 0
- Uso problemático de tablas: 4
