# Análisis de Conflictos CSS y Referencias Pink/Orange

## Fecha: 2025-11-02

## Estado: ✅ Correcciones aplicadas

### Archivos CSS Importados (Orden de Prioridad)

El orden de importación en `src/main.tsx` es:
1. `index.css` (base)
2. `consolidated-styles.css` (principal)
3. `ui-fixes-contraste.css`
4. `info-text-visibility.css`

### Conflictos Potenciales Identificados

#### 1. Body Background Gradient
- **Archivo**: `index.css` línea 299
- **Problema**: `#f093fb` (pink) en gradient
- **Estado**: ✅ CORREGIDO → `#6366f1` (indigo)

#### 2. Consolidated Styles
- **Archivo**: `consolidated-styles.css`
- **Estado**: ✅ CORREGIDO
  - Body gradient: `#f093fb` → `#6366f1`
  - Accent gradient: pink/red → purple/indigo
  - Scrollbar: pink → purple/blue

#### 3. Archivos con Referencias Pink/Orange Restantes

##### Componentes Críticos (Corregidos):
- ✅ `HeaderNav.tsx` - hover colors y badge
- ✅ `Auth.tsx` - background gradient y iconos
- ✅ `Index.tsx` - textos y botones
- ✅ `MatchCard.tsx` - botón Like y gradientes

##### Componentes con Orange (Intencional - Super Likes):
- `SuperLikesModal.tsx` - Orange es intencional para Super Likes
- `CompatibilityModal.tsx` - Orange para scores medios (60-79%)
- `PremiumModal.tsx` - Yellow/Orange para premium (intencional)

##### Páginas con Pink (Pendientes de Revisión):
- `Chat.tsx` - Múltiples referencias pink en backgrounds
- `Info.tsx` - Textos y botones pink
- `Matches.tsx` - Iconos y botones pink
- `VirtualGifts.tsx` - Iconos pink
- `Events.tsx` - Badges pink
- `VIPEvents.tsx` - Gradientes pink
- `Tokens.tsx` - Varios elementos pink
- `Support.tsx` - Iconos pink

### Recomendación

**Opción 1**: Cambiar todos los pink a purple/blue sistemáticamente
**Opción 2**: Mantener pink solo en elementos específicos (ej: botones de Like en MatchCard)

**Decisión**: Cambiar todos los pink a purple/blue excepto donde sea funcionalmente necesario mantener diferencias visuales (ej: Super Likes con orange es aceptable).

### Archivos CSS con Posibles Duplicados

1. **`force-visibility.css`** - Usa `!important` agresivo que puede sobrescribir otros estilos
2. **`consolidated-styles.css`** - Contiene muchos estilos globales
3. **`info-text-visibility.css`** - Específico para textos en cards purple

**Recomendación**: Revisar si `force-visibility.css` está siendo usado (no aparece en main.tsx).

### Siguiente Paso

Corregir referencias pink en páginas principales:
1. Chat.tsx
2. Info.tsx  
3. Matches.tsx
4. VirtualGifts.tsx
5. Events.tsx

