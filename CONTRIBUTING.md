# 🤝 Guía de Contribución - ComplicesConecta v3.8.x

**Última Actualización:** 06 de Diciembre, 2025  
**Versión:** 3.8.x  
**Estado:** ✅ ACTUALIZADO - Funciones Globales Fixed - CircleCI Fixed - Control Parental Global Ley Olimpia

¡Gracias por tu interés en contribuir a ComplicesConecta! Esta guía te ayudará a entender cómo puedes participar en el desarrollo de la plataforma swinger más exclusiva de México.

---

## 📋 Tabla de Contenidos

- [🎯 Código de Conducta](#-código-de-conducta)
- [🚀 Cómo Empezar](#-cómo-empezar)
- [🔧 Configuración del Entorno](#-configuración-del-entorno)
- [📝 Tipos de Contribuciones](#-tipos-de-contribuciones)
- [🌟 Proceso de Desarrollo](#-proceso-de-desarrollo)
- [✅ Estándares de Código](#-estándares-de-código)
- [🧪 Testing](#-testing)
- [📚 Documentación](#-documentación)
- [🐛 Reporte de Bugs](#-reporte-de-bugs)
- [💡 Solicitud de Features](#-solicitud-de-features)
- [🔒 Consideraciones de Seguridad](#-consideraciones-de-seguridad)

---

## 🎯 Código de Conducta

### **Nuestros Valores**
ComplicesConecta es una plataforma para adultos que promueve:
- **Respeto mutuo** entre todos los contribuidores
- **Inclusividad** sin discriminación por orientación, género o experiencia
- **Profesionalismo** en todas las interacciones
- **Privacidad y discreción** como pilares fundamentales
- **Calidad técnica** en cada línea de código

### **Comportamientos Esperados**
- ✅ Usar lenguaje inclusivo y respetuoso
- ✅ Respetar diferentes puntos de vista y experiencias
- ✅ Aceptar críticas constructivas de manera profesional
- ✅ Enfocarse en lo mejor para la comunidad
- ✅ Mostrar empatía hacia otros miembros

### **Comportamientos Inaceptables**
- ❌ Lenguaje o imágenes sexualizadas fuera del contexto del proyecto
- ❌ Comentarios despectivos, insultos o ataques personales
- ❌ Acoso público o privado
- ❌ Publicar información privada sin consentimiento
- ❌ Cualquier conducta inapropiada en un entorno profesional

---

## 🚀 Cómo Empezar

### **1. Fork del Repositorio**
```bash
# Hacer fork en GitHub y luego clonar
git clone https://github.com/TU-USERNAME/ComplicesConecta.git
cd ComplicesConecta
```

### **2. Configurar Remotes**
```bash
# Agregar el repositorio original como upstream
git remote add upstream https://github.com/ComplicesConectaSw/ComplicesConecta.git
git remote -v
```

### **3. Crear Rama de Feature**
```bash
# Crear rama desde develop
git checkout develop
git pull upstream develop
git checkout -b feature/nombre-descriptivo
```

---

## 🔧 Configuración del Entorno

### **📋 Prerrequisitos**
- **Node.js** 18+ (recomendado: 20.x)
- **Bun** (preferido) o npm/pnpm/yarn
- **Git** con configuración de usuario
- **Android Studio** (para desarrollo móvil)
- **Supabase CLI** (para backend)

### **⚡ Instalación Rápida**
> **📚 Para guía completa de instalación y configuración, consulta [INSTALACION_SETUP_v3.5.0.md](./INSTALACION_SETUP_v3.5.0.md)**

```bash
# 1. Instalar dependencias
bun install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 3. Iniciar desarrollo
bun run dev

# 4. Ejecutar tests
bun run test
```

### **🗄️ Base de Datos Local**
```bash
# Inicializar Supabase local
supabase start

# Aplicar migraciones
supabase db reset

# Generar tipos TypeScript
supabase gen types typescript --local > src/types/supabase.ts
```

---

## 📝 Tipos de Contribuciones

### **🐛 Bug Fixes**
- Corrección de errores en funcionalidades existentes
- Mejoras de performance
- Correcciones de UI/UX
- Fixes de compatibilidad móvil

### **✨ Nuevas Features**
- Funcionalidades de matching y descubrimiento
- Mejoras en chat y mensajería
- Nuevos tipos de eventos VIP
- Integraciones con APIs externas

### **🎨 Mejoras de UI/UX**
- Nuevos componentes de interfaz
- Mejoras en responsividad
- Animaciones y transiciones
- Temas y personalización visual

### **🔒 Seguridad**
- Implementación de medidas de seguridad
- Auditorías de código
- Mejoras en autenticación
- Protección de datos sensibles

### **📚 Documentación**
- Guías de usuario
- Documentación técnica
- Comentarios en código
- Ejemplos y tutoriales

### **🧪 Testing**
- Tests unitarios
- Tests de integración
- Tests E2E
- Tests de performance

---

## 🌟 Proceso de Desarrollo

### **1. Planificación**
```bash
# Crear issue describiendo la feature/bug
# Discutir el enfoque con el equipo
# Asignar labels apropiados: feature, bug, enhancement, etc.
```

### **2. Desarrollo**
```bash
# Crear rama de feature
git checkout -b feature/descripcion-clara

# Desarrollo iterativo con commits frecuentes
git add .
git commit -m "feat: descripción clara del cambio"

# Push regular para backup
git push origin feature/descripcion-clara
```

### **3. Testing**
```bash
# Ejecutar tests unitarios
bun run test

# Ejecutar tests E2E
bun run test:e2e

# Verificar linting
bun run lint

# Verificar tipos TypeScript
bun run type-check
```

### **4. Pull Request**
```markdown
## 📋 Descripción
Descripción clara de los cambios realizados.

## 🎯 Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Mejora de documentación

## ✅ Checklist
- [ ] Tests pasando
- [ ] Código linted
- [ ] Documentación actualizada
- [ ] Screenshots (si aplica)

## 📸 Screenshots
(Si aplica, incluir capturas de pantalla)
```

### **5. Code Review**
- Al menos 1 reviewer requerido
- Todos los comentarios deben ser resueltos
- Tests CI/CD deben pasar
- Aprobación explícita requerida

### **6. Merge**
```bash
# Squash and merge preferido
# Mensaje de commit descriptivo
# Eliminar rama después del merge
```

---

## ✅ Estándares de Código

### **🎨 Estilo de Código**
```typescript
// ✅ Buenas prácticas
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
}

const ProfileCard: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const { firstName, lastName, isVerified } = profile;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold">
        {firstName} {lastName}
        {isVerified && <VerifiedBadge />}
      </h3>
    </div>
  );
};
```

### **📁 Estructura de Archivos**
```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes base (Button, Input, etc.)
│   ├── forms/           # Formularios específicos
│   └── layout/          # Componentes de layout
├── pages/               # Páginas de la aplicación
├── hooks/               # Custom React hooks
├── utils/               # Utilidades y helpers
├── types/               # Definiciones de tipos TypeScript
└── lib/                 # Configuraciones y servicios
```

### **🏷️ Convenciones de Naming**
```typescript
// Componentes: PascalCase
const ProfileCard = () => {};

// Hooks: camelCase con prefijo 'use'
const useUserProfile = () => {};

// Constantes: UPPER_SNAKE_CASE
const API_ENDPOINTS = {};

// Variables y funciones: camelCase
const userName = 'john_doe';
const getUserProfile = () => {};
```

### **📝 Comentarios y Documentación**
```typescript
/**
 * Hook para manejar el perfil del usuario autenticado
 * @returns {Object} Estado del perfil y funciones de actualización
 */
const useUserProfile = () => {
  // Lógica del hook...
};

// TODO: Implementar cache de perfiles
// FIXME: Corregir validación de edad para parejas
// NOTE: Esta función será deprecada en v4.0.0
```

---

## 🧪 Testing

### **🔬 Tests Unitarios**
```typescript
// ProfileCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProfileCard } from './ProfileCard';

describe('ProfileCard', () => {
  const mockProfile = {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    isVerified: true
  };

  it('renders profile information correctly', () => {
    render(<ProfileCard profile={mockProfile} />);
    
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByTestId('verified-badge')).toBeInTheDocument();
  });
});
```

### **🔗 Tests de Integración**
```typescript
// auth.integration.test.ts
describe('Authentication Flow', () => {
  it('should login user and redirect to profile', async () => {
    // Setup
    const user = await createTestUser();
    
    // Action
    await loginUser(user.email, user.password);
    
    // Assert
    expect(getCurrentUser()).toBe(user);
    expect(getCurrentPath()).toBe('/profile');
  });
});
```

### **🎭 Tests E2E**
```typescript
// login.e2e.spec.ts
import { test, expect } from '@playwright/test';

test('user can login and access profile', async ({ page }) => {
  await page.goto('/auth');
  
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL('/profile');
  await expect(page.locator('h1')).toContainText('Mi Perfil');
});
```

### **📊 Cobertura de Tests**
- **Objetivo**: >90% de cobertura de código
- **Crítico**: 100% en funciones de autenticación y seguridad
- **Reportes**: Generados automáticamente en CI/CD

---

## 📚 Documentación

### **📖 Documentación de Código**
```typescript
/**
 * Servicio para gestionar matches entre usuarios
 * 
 * @example
 * ```typescript
 * const matchService = new MatchingService();
 * const matches = await matchService.getMatches(userId);
 * ```
 */
class MatchingService {
  /**
   * Obtiene los matches de un usuario
   * @param userId - ID del usuario
   * @param filters - Filtros opcionales
   * @returns Promise con array de matches
   */
  async getMatches(userId: string, filters?: MatchFilters): Promise<Match[]> {
    // Implementación...
  }
}
```

### **📝 README de Componentes**
```markdown
# ProfileCard Component

## Props
- `profile: UserProfile` - Datos del perfil a mostrar
- `onClick?: () => void` - Callback al hacer click
- `showActions?: boolean` - Mostrar botones de acción

## Usage
```tsx
<ProfileCard 
  profile={userProfile} 
  onClick={() => navigate(`/profile/${profile.id}`)}
  showActions={true}
/>
```

## Styling
Usa clases de Tailwind CSS. Personalizable via props `className`.
```

---

## 🐛 Reporte de Bugs

### **📋 Template de Bug Report**
```markdown
**🐛 Descripción del Bug**
Descripción clara y concisa del problema.

**🔄 Pasos para Reproducir**
1. Ir a '...'
2. Hacer click en '...'
3. Scroll hasta '...'
4. Ver error

**✅ Comportamiento Esperado**
Descripción de lo que debería pasar.

**📸 Screenshots**
Si aplica, agregar screenshots del problema.

**🖥️ Información del Sistema**
- OS: [e.g. Windows 11, macOS 12.0]
- Browser: [e.g. Chrome 95, Firefox 94]
- Versión: [e.g. v3.0.0]
- Dispositivo: [e.g. iPhone 13, Samsung Galaxy S21]

**📝 Contexto Adicional**
Cualquier información adicional relevante.
```

### **🏷️ Labels para Issues**
- `bug` - Error en funcionalidad existente
- `critical` - Bug que rompe funcionalidad core
- `ui/ux` - Problemas de interfaz de usuario
- `mobile` - Específico para dispositivos móviles
- `security` - Relacionado con seguridad
- `performance` - Problemas de rendimiento

---

## 💡 Solicitud de Features

### **📋 Template de Feature Request**
```markdown
**🚀 Feature Request**

**📝 Descripción**
Descripción clara de la feature solicitada.

**🎯 Problema que Resuelve**
¿Qué problema específico resuelve esta feature?

**💡 Solución Propuesta**
Descripción detallada de cómo debería funcionar.

**🔄 Alternativas Consideradas**
Otras soluciones que se han considerado.

**📊 Impacto Esperado**
- Usuarios beneficiados: [e.g. todos, premium, parejas]
- Prioridad: [alta, media, baja]
- Esfuerzo estimado: [alto, medio, bajo]

**📸 Mockups/Wireframes**
Si aplica, incluir diseños visuales.
```

### **🎯 Criterios de Aceptación**
- Feature debe alinearse con la visión del producto
- Debe tener casos de uso claros
- No debe comprometer la seguridad o privacidad
- Debe ser técnicamente factible
- Debe tener valor para los usuarios

---

## 🔒 Consideraciones de Seguridad

### **🛡️ Principios de Seguridad**
1. **Privacy by Design**: Privacidad desde el diseño
2. **Data Minimization**: Recopilar solo datos necesarios
3. **Encryption**: Encriptar datos sensibles
4. **Access Control**: Control de acceso granular
5. **Audit Trail**: Registro de acciones críticas

### **🚨 Reporte de Vulnerabilidades**
```markdown
**⚠️ NO crear issues públicos para vulnerabilidades de seguridad**

Contactar directamente:
- Email: security@complicesconecta.com
- PGP Key: [Descargar](./security/pgp-key.asc)
- Response Time: 24-48 horas
```

### **🔐 Checklist de Seguridad**
- [ ] ¿Los datos sensibles están encriptados?
- [ ] ¿Se validan todos los inputs del usuario?
- [ ] ¿Se implementan controles de acceso apropiados?
- [ ] ¿Se registran las acciones críticas?
- [ ] ¿Se siguen las mejores prácticas OWASP?

---

## 🎉 Reconocimientos

### **🌟 Tipos de Contribuciones Reconocidas**
- **💻 Código**: Desarrollo de features y bug fixes
- **🎨 Diseño**: UI/UX y assets visuales
- **📚 Documentación**: Guías y documentación técnica
- **🐛 Testing**: Tests y QA
- **🔒 Seguridad**: Auditorías y mejoras de seguridad
- **💡 Ideas**: Propuestas y feedback valioso

### **🏆 Hall of Fame**
Los contribuidores destacados serán reconocidos en:
- README principal del proyecto
- Página de créditos en la aplicación
- Redes sociales oficiales
- Eventos de la comunidad

---

## 📞 Contacto y Soporte

### **💬 Canales de Comunicación**
- **GitHub Issues**: Para bugs y feature requests
- **GitHub Discussions**: Para preguntas generales
- **Email**: dev@complicesconecta.com
- **Discord**: [Servidor de la comunidad](https://discord.gg/complicesconecta)

### **⏰ Tiempos de Respuesta**
- **Issues críticos**: 24-48 horas
- **Pull requests**: 2-5 días laborales
- **Feature requests**: 1-2 semanas
- **Preguntas generales**: 3-7 días

---

## 📜 Licencia

Al contribuir a ComplicesConecta, aceptas que tus contribuciones serán licenciadas bajo la misma [Licencia MIT](./LICENSE) del proyecto.

---

<div align="center">

### 🤝 # 🤝 CONTRIBUTING - ComplicesConecta v3.6.3

**Última Actualización:** 08 de Noviembre, 2025  
**Versión:** 3.6.3  
**Estado:** ✅ **PRODUCTION READY ENHANCED** + **NEO4J INTEGRATION** + **CORRECCIONES DE TIPOS COMPLETADAS**

**[Crear Issue](https://github.com/ComplicesConectaSw/ComplicesConecta/issues/new)** | **[Fork Proyecto](https://github.com/ComplicesConectaSw/ComplicesConecta/fork)** | **[Ver Documentación](./docs-unified/)**

</div>
