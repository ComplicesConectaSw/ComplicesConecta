# README DEV - ComplicesConecta v2.0.0

## 🚀 Guía de Desarrollo y QA

### Configuración del Entorno

#### Requisitos Previos
- Node.js 18+ 
- npm 9+
- Git
- Editor con soporte TypeScript (VS Code recomendado)

#### Instalación
```bash
# Clonar repositorio
git clone <repository-url>
cd conecta-social-comunidad-main

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase y Sentry
```

#### Variables de Entorno Requeridas
```env
# Supabase
VITE_SUPABASE_URL=https://axtvqnozatbmllvwzuim.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key

# Modo de aplicación
VITE_APP_MODE=production  # o 'demo' para modo demo

# Sentry (opcional)
VITE_SENTRY_DSN=tu_sentry_dsn
```

### Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Testing**: Vitest (unit) + Playwright (e2e)
- **CI/CD**: GitHub Actions + GitLab CI
- **Monitoreo**: Sentry + Supabase Logs
- **Deployment**: Vercel

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm run preview         # Preview del build

# Testing
npm run test            # Tests unitarios con Vitest
npm run test:ui         # UI de tests unitarios
npm run test:e2e        # Tests e2e con Playwright
npm run test:e2e:ui     # UI de tests e2e

# Calidad de código
npm run lint            # ESLint
npm run type-check      # TypeScript check
npm run format          # Prettier

# Base de datos
npm run db:types        # Generar tipos de Supabase
```

### Estructura del Proyecto

```
src/
├── components/         # Componentes React reutilizables
│   ├── auth/          # Componentes de autenticación
│   ├── chat/          # Sistema de chat
│   ├── profile/       # Gestión de perfiles
│   └── ui/            # Componentes UI base
├── hooks/             # Custom hooks
├── integrations/      # Integraciones externas
│   └── supabase/     # Cliente y tipos de Supabase
├── lib/              # Utilidades y configuraciones
│   ├── sentry.ts     # Configuración de Sentry
│   └── supabase-logger.ts # Logger de Supabase
├── pages/            # Páginas de la aplicación
└── types/            # Definiciones de tipos TypeScript

tests/
├── unit/             # Tests unitarios
└── e2e/              # Tests end-to-end

.github/workflows/    # GitHub Actions CI/CD
```

## 🧪 Testing

### Tests Unitarios (Vitest)

Los tests unitarios cubren:
- **useAuth**: Hook de autenticación y gestión de sesión
- **Profiles**: Generación y validación de perfiles
- **Roles**: Sistema de roles y permisos

```bash
# Ejecutar tests unitarios
npm run test

# Con coverage
npm run test -- --coverage

# Modo watch
npm run test -- --watch
```

### Tests E2E (Playwright)

Los tests e2e cubren:
- **Registration**: Flujo de registro de usuarios
- **Admin Login**: Panel de administración
- **Requests**: Sistema de solicitudes de conexión
- **Images**: Gestión de galería de imágenes

```bash
# Ejecutar tests e2e
npm run test:e2e

# Con UI interactiva
npm run test:e2e:ui

# Solo un archivo específico
npx playwright test registration.spec.ts
```

### Configuración de Tests

#### Playwright Config
- Navegadores: Chromium, Firefox, WebKit
- Modo headless por defecto
- Screenshots en fallos
- Videos en CI

#### Vitest Config
- Entorno jsdom
- Mocks automáticos de Supabase
- Coverage con c8

## 🔄 CI/CD Pipeline

### GitHub Actions (.github/workflows/ci.yml)

El pipeline ejecuta automáticamente:

1. **Lint & Type Check**: ESLint + TypeScript
2. **Build**: Compilación del proyecto
3. **Unit Tests**: Tests unitarios con coverage
4. **E2E Tests**: Tests end-to-end
5. **Security Audit**: npm audit + CodeQL
6. **Deploy**: Despliegue automático a Vercel (branch main)

### GitLab CI (.gitlab-ci.yml)

Pipeline opcional con stages:
- `lint`: Análisis de código
- `build`: Compilación
- `test`: Tests unitarios y e2e
- `security`: Auditoría de seguridad
- `deploy-staging`: Deploy a staging (develop branch)
- `deploy-production`: Deploy a producción (main branch)

### Triggers
- **Push**: Cualquier branch ejecuta lint, build y tests
- **Pull Request**: Pipeline completo + análisis de seguridad
- **Main Branch**: Pipeline completo + deploy a producción

## 📊 Monitoreo y Logging

### Sentry Integration

Configuración en `src/lib/sentry.ts`:
- Captura automática de errores
- Tracking de performance
- Filtrado de errores no críticos
- Contexto de usuario automático

```typescript
// Uso básico
import { logError, logMessage, setUserContext } from '@/lib/sentry';

// Log de errores
logError(error, { context: 'additional info' });

// Log de mensajes
logMessage('User action completed', 'info', { userId: '123' });

// Contexto de usuario
setUserContext({ id: user.id, email: user.email, role: user.role });
```

### Supabase Logging

Sistema de logging en `src/lib/supabase-logger.ts`:
- Log de queries SQL con duración
- Detección de queries lentas
- Log de errores RLS
- Tracking de conexiones

```typescript
// Uso del logger
import { supabaseLogger, withSupabaseLogging } from '@/lib/supabase-logger';

// Wrapper automático
const getProfiles = withSupabaseLogging(
  () => supabase.from('profiles').select('*'),
  'getProfiles'
);

// Log manual
supabaseLogger.logRLSError('profiles', 'SELECT', userId, error);
```

## 🔒 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS estrictas:
- **profiles**: Solo el propietario puede editar
- **invitations**: Creador y destinatario pueden ver
- **messages**: Solo participantes del chat
- **user_roles**: Solo admins pueden modificar

### Autenticación

- Email + contraseña obligatorios
- Verificación de email en producción
- Roles: `admin`, `user`
- Separación demo/producción

### Variables de Entorno

- Nunca commitear archivos `.env`
- Usar `.env.example` como plantilla
- Rotar keys regularmente en producción

## 🚀 Deployment

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático desde main branch

### Variables de Entorno en Vercel
```
VITE_SUPABASE_URL=https://axtvqnozatbmllvwzuim.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_APP_MODE=production
VITE_SENTRY_DSN=tu_sentry_dsn
```

### Build Commands
```bash
# Build command
npm run build

# Output directory
dist

# Install command
npm install
```

## 🐛 Debugging

### Desarrollo Local

```bash
# Logs detallados
VITE_APP_MODE=development npm run dev

# Debug de Supabase
# Habilitar logs en browser console

# Debug de tests
npm run test -- --reporter=verbose
```

### Herramientas Útiles

- **React DevTools**: Inspección de componentes
- **Supabase Dashboard**: Queries y logs en tiempo real
- **Sentry Dashboard**: Errores y performance
- **Playwright Inspector**: Debug de tests e2e

## 📝 Convenciones de Código

### TypeScript
- Tipado estricto habilitado
- No usar `any` (usar `unknown` si es necesario)
- Interfaces para objetos, types para uniones
- Exportar tipos junto con implementaciones

### React
- Functional components con hooks
- Props interfaces exportadas
- Custom hooks para lógica reutilizable
- Error boundaries para manejo de errores

### Naming
- camelCase para variables y funciones
- PascalCase para componentes y tipos
- kebab-case para archivos
- UPPER_SNAKE_CASE para constantes

### Git
- Commits descriptivos en español
- Branches: `feature/`, `fix/`, `hotfix/`
- PR templates con checklist
- Squash merge para features

## 🔧 Troubleshooting

### Problemas Comunes

**Error de tipos de Supabase**
```bash
npm run db:types
```

**Tests e2e fallan**
```bash
npx playwright install
npm run test:e2e -- --headed
```

**Build falla por lint**
```bash
npm run lint -- --fix
npm run format
```

**Variables de entorno no cargan**
- Verificar nombres con prefijo `VITE_`
- Reiniciar servidor de desarrollo
- Verificar archivo `.env` existe

### Performance

**Bundle size grande**
- Usar dynamic imports para code splitting
- Lazy loading de componentes pesados
- Optimizar imágenes y assets

**Queries lentas**
- Revisar logs de Supabase
- Añadir índices en BD
- Usar select específicos, no `*`

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de React + TypeScript](https://react-typescript-cheatsheet.netlify.app/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Vitest Documentation](https://vitest.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## 🤝 Contribución

1. Fork del repositorio
2. Crear branch feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Añadir nueva funcionalidad'`
4. Push branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Checklist PR
- [ ] Tests unitarios añadidos/actualizados
- [ ] Tests e2e añadidos si es necesario
- [ ] Lint y type-check pasan
- [ ] Build exitoso
- [ ] Documentación actualizada
- [ ] Variables de entorno documentadas si aplica
