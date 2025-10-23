# Intereses Swinger y Tablas SQL Requeridas

## Intereses para Registro (Concepto Swinger)

Los siguientes intereses están directamente relacionados con el lifestyle swinger del proyecto:

### Encuentros Swinger
- Intercambio de parejas
- Soft swap
- Full swap
- Encuentros grupales
- Tríos
- Fiestas swinger
- Clubs swinger
- Eventos lifestyle

### Dinámicas de Pareja
- Hotwife
- Cuckold
- Stag/Vixen
- Parejas abiertas
- Relaciones libres
- Poliamor
- Swinging ocasional
- Lifestyle comprometido

### Preferencias Sexuales
- Voyeurismo
- Exhibicionismo
- BDSM ligero
- Juegos de rol
- Fantasías compartidas
- Experiencias nuevas
- Mentalidad abierta
- Sin tabúes

### Comunidad Swinger
- Networking swinger
- Amistad con beneficios
- Comunidad lifestyle
- Eventos temáticos
- Fiestas privadas
- Encuentros discretos
- Conexiones auténticas

## Preferencias Explícitas para Perfil (Mínimo 6 requeridas)

Una vez dentro del perfil privado, se pueden mostrar opciones más específicas del lifestyle swinger:

### Modalidades de Intercambio
- Intercambio de parejas (full swap)
- Intercambio suave (soft swap)
- Encuentros grupales (orgías)
- Tríos con otra mujer (FFM)
- Tríos con otro hombre (MFM)
- Parejas con singles
- Solo observar (voyeurismo)
- Solo ser observados (exhibicionismo)
- Juegos preliminares grupales
- Fiestas swinger privadas
- Clubs swinger establecidos
- Eventos temáticos exclusivos

### Dinámicas y Roles Específicos
- Hotwife/Cornudo consentido
- Stag/Vixen (pareja orgullosa)
- Cuckquean (mujer cornuda)
- Bull/Semental para parejas
- Unicornio (mujer single)
- Pareja dominante
- Pareja sumisa
- Switch (intercambio de roles)
- Poliamoroso establecido
- Relación abierta negociada
- Swinging ocasional
- Lifestyle comprometido

### Prácticas y Fetiches
- BDSM ligero en grupo
- Bondage suave
- Juegos de dominación
- Fetiche de pies
- Lencería y disfraces
- Juguetes eróticos compartidos
- Fotografía erótica amateur
- Videos caseros consensuados
- Masajes eróticos grupales
- Juegos con comida
- Wax play (juegos con cera)
- Sensory play (juegos sensoriales)

## Tablas SQL Requeridas

### 1. Tabla de Intereses Generales (user_interests)

```sql
CREATE TABLE user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, interest_name)
);

-- Índices para optimización
CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX idx_user_interests_category ON user_interests(category);
```

### 2. Tabla de Preferencias Explícitas (user_explicit_preferences)

```sql
CREATE TABLE user_explicit_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_name VARCHAR(100) NOT NULL,
  preference_category VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  privacy_level VARCHAR(20) DEFAULT 'private', -- 'private', 'friends', 'public'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_name)
);

-- Índices para optimización
CREATE INDEX idx_user_explicit_preferences_user_id ON user_explicit_preferences(user_id);
CREATE INDEX idx_user_explicit_preferences_category ON user_explicit_preferences(preference_category);
CREATE INDEX idx_user_explicit_preferences_privacy ON user_explicit_preferences(privacy_level);
```

### 3. Tabla de Compatibilidad de Intereses (interest_compatibility)

```sql
CREATE TABLE interest_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest_1 VARCHAR(100) NOT NULL,
  interest_2 VARCHAR(100) NOT NULL,
  compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(interest_1, interest_2)
);

-- Índice para búsquedas de compatibilidad
CREATE INDEX idx_interest_compatibility_lookup ON interest_compatibility(interest_1, interest_2);
```

### 4. Extensión de la tabla profiles para nuevos campos

```sql
-- Agregar nuevos campos a la tabla profiles existente
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  lifestyle_preferences JSONB DEFAULT '{}',
  location_preferences JSONB DEFAULT '{}',
  personality_traits JSONB DEFAULT '{}',
  explicit_preferences_count INTEGER DEFAULT 0,
  interests_count INTEGER DEFAULT 0,
  profile_completion_percentage INTEGER DEFAULT 0;

-- Índices para los nuevos campos JSONB
CREATE INDEX IF NOT EXISTS idx_profiles_lifestyle_preferences 
  ON profiles USING GIN (lifestyle_preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_location_preferences 
  ON profiles USING GIN (location_preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_personality_traits 
  ON profiles USING GIN (personality_traits);
```

### 5. Función para calcular compatibilidad

```sql
CREATE OR REPLACE FUNCTION calculate_user_compatibility(
  user1_id UUID,
  user2_id UUID
) RETURNS INTEGER AS $$
DECLARE
  common_interests INTEGER := 0;
  total_interests INTEGER := 0;
  compatibility_percentage INTEGER := 0;
BEGIN
  -- Contar intereses comunes
  SELECT COUNT(*)
  INTO common_interests
  FROM user_interests ui1
  INNER JOIN user_interests ui2 ON ui1.interest_name = ui2.interest_name
  WHERE ui1.user_id = user1_id AND ui2.user_id = user2_id;
  
  -- Contar total de intereses únicos entre ambos usuarios
  SELECT COUNT(DISTINCT interest_name)
  INTO total_interests
  FROM user_interests
  WHERE user_id IN (user1_id, user2_id);
  
  -- Calcular porcentaje de compatibilidad
  IF total_interests > 0 THEN
    compatibility_percentage := (common_interests * 100) / total_interests;
  END IF;
  
  RETURN compatibility_percentage;
END;
$$ LANGUAGE plpgsql;
```

### 6. RLS Policies para seguridad

```sql
-- Política para user_interests
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own interests" ON user_interests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' interests for matching" ON user_interests
  FOR SELECT USING (true);

-- Política para user_explicit_preferences
ALTER TABLE user_explicit_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own explicit preferences" ON user_explicit_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' public explicit preferences" ON user_explicit_preferences
  FOR SELECT USING (
    privacy_level = 'public' OR 
    (privacy_level = 'friends' AND EXISTS (
      SELECT 1 FROM matches 
      WHERE (user1_id = auth.uid() AND user2_id = user_id) 
         OR (user2_id = auth.uid() AND user1_id = user_id)
    )) OR
    auth.uid() = user_id
  );
```

## Implementación en el Frontend

### Validación Mínima de Intereses
- **Registro público**: Mínimo 6 intereses discretos seleccionados
- **Perfil privado**: Mínimo 6 preferencias explícitas del lifestyle
- Contador visual de selecciones en tiempo real
- Feedback inmediato sobre el progreso de completado
- Categorización clara y organizada por secciones
- Tooltips explicativos para términos específicos del ambiente

### Flujo de Usuario Mexicano
1. **Registro Inicial**: Seleccionar intereses discretos apropiados para registro público
2. **Verificación**: Confirmar email y teléfono celular mexicano
3. **Perfil Privado**: Completar preferencias explícitas del lifestyle swinger (mínimo 6)
4. **Matching Inteligente**: Algoritmo que combina intereses discretos + preferencias explícitas
5. **Configuración de Privacidad**: Control granular de visibilidad por categoría

### Características Específicas para México
- **Validación de teléfono**: Formato mexicano (+52) con LADA
- **Ubicaciones**: Estados y ciudades principales de México
- **Cultura local**: Terminología y referencias culturales mexicanas
- **Horarios**: Zona horaria de México (UTC-6/-5/-7/-8)
- **Moneda**: Precios en pesos mexicanos (MXN)

## Consideraciones de Privacidad y Seguridad

### Niveles de Privacidad Configurables
- **Público**: Visible para todos los usuarios verificados
- **Amigos**: Solo para conexiones mutuas confirmadas
- **Privado**: Solo para el usuario y parejas vinculadas
- **Oculto**: No visible en búsquedas ni matching

### Protección de Datos Sensibles
- Encriptación end-to-end para preferencias explícitas
- Auditoría completa de accesos a información sensible
- Anonimización de datos para análisis estadísticos
- Cumplimiento con LFPDPPP (Ley Federal de Protección de Datos México)
- Derecho al olvido y portabilidad de datos
- Verificación de edad obligatoria (18+ años)

### Seguridad del Ambiente Swinger
- Verificación de identidad con INE/IFE mexicana
- Sistema de reportes y moderación 24/7
- Bloqueo automático de perfiles sospechosos
- Protección contra screenshots y grabaciones
- Modo incógnito para navegación discreta
- Alertas de seguridad para encuentros presenciales
