# Verificación de Campos en Perfiles de Pareja

## Campos Existentes en la Tabla `couple_profiles`

### Campos Básicos (Originales)
- `id`: Identificador único
- `couple_name`: Nombre de la pareja
- `couple_bio`: Biografía de la pareja
- `relationship_type`: Tipo de relación (man-woman, man-man, woman-woman)
- `partner1_id`: ID del primer miembro de la pareja
- `partner2_id`: ID del segundo miembro de la pareja
- `couple_images`: Array de URLs de imágenes
- `is_verified`: Si la pareja está verificada
- `is_premium`: Si tiene suscripción premium
- `preferences`: Configuraciones en formato JSON
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

### Campos Agregados para Funcionalidades Swinger
- `looking_for`: Qué está buscando la pareja (friendship, dating, casual, serious, swinger, threesome, group)
- `experience_level`: Nivel de experiencia general en la plataforma (beginner, intermediate, advanced, expert)
- `swinger_experience`: Nivel de experiencia específico en el lifestyle swinger (beginner, intermediate, advanced, expert)
- `interested_in`: Tipo de personas que les interesan (singles, couples, both, groups)
- `couple_interests`: Array de intereses específicos de la pareja

## Campos Pendientes por Agregar

### Campos de Ubicación
- `latitude`: Latitud de ubicación de la pareja
- `longitude`: Longitud de ubicación de la pareja
- `city`: Ciudad
- `state`: Estado/Provincia
- `country`: País
- `location`: Ubicación completa como string

### Campos de Personalización
- `display_name`: Nombre para mostrar de la pareja
- `preferred_theme`: Tema preferido (light, dark, auto)
- `is_public`: Si el perfil es público o privado
- `privacy_settings`: Configuraciones de privacidad en JSON

### Campos de Seguridad y Verificación
- `is_demo`: Si es un perfil de demostración
- `verification_level`: Nivel de verificación (0-3)
- `last_active`: Última actividad
- `profile_completed_at`: Fecha de completado del perfil

### Campos de Estadísticas
- `total_views`: Total de visitas
- `total_likes`: Total de likes
- `total_matches`: Total de matches
- `profile_completeness`: Porcentaje de completitud del perfil

### Campos de Preferencias Específicas
- `activities_interested`: Actividades que les interesan
- `event_types`: Tipos de eventos que prefieren
- `communication_preference`: Preferencia de comunicación (both, male_only, female_only)
- `couple_age_range`: Rango de edad de la pareja
- `couple_height_range`: Rango de altura de la pareja
- `couple_body_type`: Tipo de cuerpo de la pareja
- `couple_lifestyle`: Estilo de vida de la pareja
- `couple_availability`: Disponibilidad de la pareja

## Estado Actual

✅ **Campos Básicos**: Todos presentes y funcionando
✅ **Campos Swinger Principales**: Agregados y funcionando
- `looking_for`
- `experience_level`
- `swinger_experience`
- `interested_in`
- `couple_interests`

⏳ **Campos Adicionales**: Pendientes de agregar
- Campos de ubicación
- Campos de personalización
- Campos de seguridad
- Campos de estadísticas
- Campos de preferencias específicas

## Próximos Pasos

1. **Agregar campos de ubicación** para funcionalidades de proximidad
2. **Agregar campos de personalización** para mejor UX
3. **Agregar campos de seguridad** para verificación avanzada
4. **Agregar campos de estadísticas** para analytics
5. **Agregar campos de preferencias específicas** para matching avanzado

## Servicios Actualizados

✅ **CoupleProfilesService.ts**: Actualizado con nuevos campos
- Interfaz `CoupleProfile` expandida
- Interfaz `CreateCoupleProfileData` expandida
- Método `createCoupleProfile` actualizado

## Base de Datos

✅ **Tabla `couple_profiles`**: Campos principales agregados
⏳ **Vista `couple_profiles_complete`**: Pendiente de crear
⏳ **Índices adicionales**: Pendientes de crear para optimización

## Recomendaciones

1. **Priorizar campos de ubicación** para funcionalidades de matching por proximidad
2. **Implementar campos de estadísticas** para analytics y insights
3. **Agregar campos de preferencias específicas** para matching más preciso
4. **Crear vistas optimizadas** para consultas frecuentes
5. **Implementar índices** para mejorar performance de consultas
