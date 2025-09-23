# 📱 Sistema de Historias Efímeras - ComplicesConecta

## 🎯 Descripción General

El sistema de historias permite a los usuarios compartir contenido visual temporal que desaparece automáticamente después de 24 horas. Incluye funcionalidades sociales completas como likes, comentarios y compartir, con soporte tanto para modo demo como producción.

## ✨ Características Principales

### 🔧 Creación de Historias
- **Subida de imágenes**: Soporte para JPEG, PNG, GIF
- **Descripción opcional**: Hasta 280 caracteres
- **Control de visibilidad**: Público o privado
- **Ubicación opcional**: Campo de texto libre
- **Expiración automática**: 24 horas desde la creación

### 👥 Funciones Sociales
- **Likes**: Sistema de me gusta con contador
- **Comentarios**: Comentarios con avatar y nombre
- **Compartir**: Generación de enlaces para compartir
- **Visualizaciones**: Contador de vistas

### 🛡️ Control de Acceso
- **Usuarios registrados**: Acceso completo a historias públicas
- **Propietarios**: Control total sobre sus historias
- **Historias privadas**: Solo visible para seguidores/aprobados
- **Usuarios no registrados**: Vista previa explicativa

## 🏗️ Arquitectura del Sistema

### 📁 Estructura de Componentes
```
src/components/stories/
├── StoryTypes.ts          # Interfaces y tipos TypeScript
├── StoryService.ts        # Lógica de negocio y API calls
├── CreateStory.tsx        # Modal de creación de historias
├── StoryViewer.tsx        # Visualizador de historias individual
└── StoriesContainer.tsx   # Contenedor principal
```

### 🔄 Flujo de Datos

#### Demo Mode
- **Almacenamiento**: localStorage (`demo_stories`)
- **Datos mock**: Historias predefinidas con imágenes de ejemplo
- **Persistencia**: Solo durante la sesión del navegador
- **Interacciones**: Simuladas localmente

#### Producción
- **Base de datos**: Supabase/PostgreSQL
- **Almacenamiento**: Tablas relacionales con RLS
- **API**: Endpoints RESTful para CRUD
- **Tiempo real**: Actualizaciones en vivo

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### `stories`
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- content_url (TEXT)
- content_type (VARCHAR: image|video|text)
- description (TEXT, opcional)
- visibility (VARCHAR: public|private)
- location (TEXT, opcional)
- created_at (TIMESTAMPTZ)
- expires_at (TIMESTAMPTZ, +24h)
- views_count (INTEGER)
```

#### `story_likes`
```sql
- id (UUID, PK)
- story_id (UUID, FK)
- user_id (UUID, FK)
- created_at (TIMESTAMPTZ)
- UNIQUE(story_id, user_id)
```

#### `story_comments`
```sql
- id (UUID, PK)
- story_id (UUID, FK)
- user_id (UUID, FK)
- comment (TEXT)
- created_at (TIMESTAMPTZ)
```

#### `story_views`
```sql
- id (UUID, PK)
- story_id (UUID, FK)
- user_id (UUID, FK)
- viewed_at (TIMESTAMPTZ)
- UNIQUE(story_id, user_id)
```

## 🔐 Seguridad y Permisos

### Row Level Security (RLS)
- **Historias públicas**: Visibles para todos los usuarios registrados
- **Historias privadas**: Solo propietario y seguidores aprobados
- **Comentarios**: Solo en historias visibles para el usuario
- **Eliminación**: Solo propietario puede eliminar sus historias/comentarios

### Validaciones
- **Tipos de archivo**: Solo imágenes permitidas
- **Tamaño de descripción**: Máximo 280 caracteres
- **Expiración**: Automática a las 24 horas
- **Autenticación**: Requerida para todas las acciones

## 🎨 Interfaz de Usuario

### Diseño Visual
- **Glassmorphism**: Efectos de vidrio esmerilado
- **Gradientes**: Colores purple-to-pink
- **Animaciones**: Transiciones suaves y hover effects
- **Responsive**: Adaptable a móvil y desktop

### Componentes UI
- **Cards**: Contenedores con backdrop-blur
- **Badges**: Indicadores de tiempo y visibilidad
- **Buttons**: Estilo gradient con iconos Lucide
- **Modal**: Overlay completo para crear/ver historias

## 📱 Experiencia de Usuario

### Flujo de Creación
1. Click en "Crear Historia"
2. Subir imagen (drag & drop o selector)
3. Agregar descripción opcional
4. Seleccionar ubicación opcional
5. Elegir visibilidad (público/privado)
6. Confirmar creación

### Flujo de Visualización
1. Click en historia en la lista
2. Modal de pantalla completa
3. Barra de progreso automática (15s)
4. Interacciones disponibles (like, comentar, compartir)
5. Cierre automático o manual

### Estados de la Historia
- **Activa**: Dentro de las 24 horas
- **Vista**: Marcada como visualizada
- **No vista**: Borde destacado
- **Expirada**: Eliminada automáticamente

## 🔧 Integración con Perfiles

### Actualización de Foto de Perfil
- Opción para "Publicar también en Stories"
- Sincronización automática con galería
- Notificación a seguidores

### Estadísticas
- Contador de historias creadas
- Total de visualizaciones
- Interacciones recibidas

## 🧪 Modo Demo vs Producción

### Demo Mode
```javascript
// Detección
const isDemoMode = localStorage.getItem('demo_authenticated') === 'true';

// Características
- Datos simulados en localStorage
- Interacciones locales
- Sin persistencia real
- Aviso visual de modo demo
```

### Producción
```javascript
// Características
- Base de datos real
- API calls a Supabase
- Persistencia permanente
- Notificaciones en tiempo real
```

## 📊 Métricas y Analytics

### Métricas Disponibles
- **Historias activas**: Número actual de historias no expiradas
- **Visualizaciones totales**: Suma de todas las vistas
- **Interacciones**: Likes + comentarios + shares
- **Engagement rate**: Interacciones / visualizaciones

### Dashboard
- Grid de 3 columnas con estadísticas
- Actualización en tiempo real
- Comparación con períodos anteriores

## 🚀 Funcionalidades Futuras

### Próximas Versiones
- **Stories de video**: Soporte para contenido de video
- **Filtros y efectos**: Edición básica de imágenes
- **Stories destacadas**: Historias que no expiran
- **Reacciones**: Más tipos de interacciones
- **Notificaciones push**: Alertas de nuevas historias

### Mejoras Técnicas
- **Caché inteligente**: Optimización de carga
- **Compresión de imágenes**: Reducción automática de tamaño
- **CDN**: Distribución global de contenido
- **Analytics avanzados**: Métricas detalladas

## 🛠️ Mantenimiento

### Limpieza Automática
```sql
-- Función para limpiar historias expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
BEGIN
    DELETE FROM stories WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

### Cron Jobs Recomendados
- **Cada hora**: Limpieza de historias expiradas
- **Diario**: Optimización de índices
- **Semanal**: Backup de métricas

## 📝 Notas de Implementación

### Consideraciones Técnicas
- **Compatibilidad**: Unificada con interfaz Story existente en `data.ts`
- **TypeScript**: Tipado estricto para todas las interfaces
- **Error Handling**: Manejo robusto de errores de red/storage
- **Performance**: Lazy loading y paginación para grandes volúmenes

### Dependencias
- **React**: Hooks y componentes funcionales
- **Lucide React**: Iconografía consistente
- **Tailwind CSS**: Estilos utilitarios
- **Supabase**: Backend y base de datos
- **localStorage**: Persistencia local para demo

---

*Última actualización: 2025-01-23*
*Versión: 3.0.0*
