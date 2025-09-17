# Sistema de Galería - ComplicesConecta v2.9.0

## 📸 Descripción General

El sistema de galería de ComplicesConecta permite a los usuarios subir, organizar y compartir fotos con control granular de privacidad. Incluye funcionalidades avanzadas como solicitudes de acceso para contenido privado y integración completa con perfiles demo y reales.

## 🎯 Características Principales

### 1. Subida y Gestión de Imágenes
- **Subida de archivos**: Soporte para formatos JPG, PNG, GIF, WEBP
- **Thumbnails automáticos**: Generación de miniaturas para optimización
- **Modo demo**: Simulación completa con datos mock para testing
- **Validación de archivos**: Verificación de tipo y tamaño de imagen

### 2. Sistema de Privacidad Granular
- **Imágenes públicas**: Visibles para todos los usuarios
- **Imágenes privadas**: Solo visibles para el propietario y usuarios autorizados
- **Toggle de privacidad**: Cambio dinámico entre público/privado
- **Badges visuales**: Indicadores claros de estado de privacidad

### 3. Solicitudes de Acceso
- **Botón "Solicitar Acceso"**: Para imágenes privadas de otros usuarios
- **Estados de solicitud**: Pendiente, aprobada, rechazada
- **Notificaciones visuales**: Badges para solicitudes pendientes
- **Gestión de permisos**: Aprobación/rechazo por parte del propietario

### 4. Interfaz de Usuario
- **Grid responsivo**: Adaptación automática a diferentes pantallas
- **Vista modal**: Visualización ampliada con detalles
- **Tabs organizados**: Separación entre fotos públicas y privadas
- **Hover effects**: Controles que aparecen al pasar el mouse

## 🏗️ Arquitectura Técnica

### Componentes Principales

#### `ImageGallery.tsx`
```typescript
interface ImageGalleryProps {
  userId?: string;
  isOwner: boolean;
  isDemo?: boolean;
  viewerUserId?: string;
}
```

**Funcionalidades:**
- Gestión de estado de imágenes
- Control de subida y eliminación
- Manejo de privacidad y solicitudes
- Integración con sistema de toasts

#### `Gallery.tsx` (Página)
```typescript
const Gallery: React.FC = () => {
  const { user, isDemo } = useAuth();
  const isDemoMode = typeof isDemo === 'function' ? Boolean(isDemo()) : Boolean(isDemo);
  // ...
}
```

**Características:**
- Integración con sistema de autenticación
- Manejo de modo demo/real
- Alertas informativas para usuarios

### Tipos de Datos

```typescript
interface ImageData {
  id: string;
  url: string;
  thumbnail?: string;
  title?: string;
  isPrivate: boolean;
  uploadedAt: Date;
  likes?: number;
  comments?: Comment[];
  accessRequests?: AccessRequest[];
}

interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
}
```

## 🔄 Flujos de Usuario

### 1. Subida de Imagen
1. Usuario hace clic en "Subir Foto"
2. Selecciona archivo desde dispositivo
3. Sistema valida formato y tamaño
4. En modo demo: simula subida con datos mock
5. En modo real: sube a Supabase Storage
6. Imagen aparece en galería con estado público por defecto

### 2. Cambio de Privacidad
1. Usuario hace hover sobre imagen propia
2. Aparecen controles de privacidad
3. Clic en botón toggle (Lock/Unlock)
4. Estado cambia y se muestra toast de confirmación
5. Badge de privacidad se actualiza visualmente

### 3. Solicitud de Acceso
1. Usuario ve imagen privada de otro usuario
2. Se muestra placeholder con botón "Solicitar Acceso"
3. Clic envía solicitud al propietario
4. Propietario ve notificación en su galería
5. Puede aprobar/rechazar desde controles de imagen

## 🧪 Testing E2E

### Tests Implementados
- **gallery.spec.ts**: 12 tests completos
- Cobertura de subida, privacidad, solicitudes
- Validación de navegación y modales
- Tests para estados vacíos y errores

### Casos de Prueba Principales
```typescript
// Ejemplo de test de privacidad
test('should toggle image privacy', async ({ page }) => {
  await authHelper.loginWithDemoCredentials('single@demo.com', 'demo123');
  await page.goto('/gallery');
  
  const firstImage = page.locator('[data-testid^="gallery-image-"]').first();
  await firstImage.hover();
  
  const privacyToggle = page.locator('[data-testid^="privacy-toggle-"]').first();
  await privacyToggle.click();
  
  await expect(page.locator('.group').first().locator('text=Privada')).toBeVisible();
});
```

## 🔗 Integración con Perfiles

### ProfileSingle.tsx
- Botón "Mi Galería" en acciones principales
- Navegación directa a `/gallery`
- Icono de cámara para identificación visual

### ProfileCouple.tsx
- Botón "Nuestra Galería" para parejas
- Mismo flujo de navegación
- Contexto específico para perfiles de pareja

### Navigation.tsx
- Enlace "Galería" en navegación principal
- Icono Camera de Lucide React
- Posición entre Descubrir y Chat

## 📱 Responsive Design

### Breakpoints
- **Mobile**: Grid 1-2 columnas, controles táctiles
- **Tablet**: Grid 2-3 columnas, hover adaptado
- **Desktop**: Grid 3-4 columnas, hover completo

### Optimizaciones
- Lazy loading de imágenes
- Thumbnails para performance
- Compresión automática en subida
- Cache de imágenes frecuentes

## 🔒 Seguridad y Privacidad

### Controles de Acceso
- Verificación de propietario en todas las operaciones
- Validación de permisos en solicitudes de acceso
- Sanitización de datos de entrada
- Rate limiting en subidas

### Privacidad por Defecto
- Imágenes públicas por defecto (configurable)
- Logs de acceso para auditoría
- Eliminación segura de archivos
- Encriptación de metadatos sensibles

## 🚀 Futuras Mejoras

### Funcionalidades Planificadas
- [ ] Álbumes organizados por categorías
- [ ] Comentarios en imágenes
- [ ] Reacciones y likes
- [ ] Compartir en redes sociales
- [ ] Filtros y efectos de imagen
- [ ] Backup automático en la nube

### Optimizaciones Técnicas
- [ ] CDN para distribución global
- [ ] Compresión avanzada WebP/AVIF
- [ ] Carga progresiva de imágenes
- [ ] Sincronización offline
- [ ] Analytics de uso de galería

## 📊 Métricas y Analytics

### KPIs Principales
- Número de imágenes subidas por usuario
- Ratio de imágenes públicas vs privadas
- Solicitudes de acceso procesadas
- Tiempo promedio de carga de galería

### Eventos Trackeados
- `gallery_image_upload`
- `gallery_privacy_toggle`
- `gallery_access_request`
- `gallery_image_view`
- `gallery_image_delete`

---

**Versión**: 2.9.0  
**Fecha**: 17 de septiembre de 2025  
**Autor**: ComplicesConecta Development Team
