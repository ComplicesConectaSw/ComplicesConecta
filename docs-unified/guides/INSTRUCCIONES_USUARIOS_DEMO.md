# 📋 Instrucciones para Crear Usuarios Demo

## 🚨 IMPORTANTE: Aplicar Migraciones Primero

**ANTES** de crear usuarios demo, debes aplicar las migraciones corregidas:

### Paso 0: Aplicar Migraciones en Orden

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor**

**Ejecutar en este orden:**

1. **Primera**: `supabase/migrations/20250906_05_create_token_system.sql` (corregida)
2. **Segunda**: `supabase/migrations/20250926050559_create_automation_rules_clean.sql` (corregida)  
3. **Tercera**: `supabase/migrations/20250926_fix_user_tokens_referral_code.sql` (corregida)

4. Verifica que no hay errores en cada migración antes de continuar con la siguiente

## ✅ Paso 1: Ejecutar Script SQL

Después de aplicar la migración, ejecuta el archivo `scripts/create-demo-users.sql` en el **Editor SQL de Supabase**.

### Cómo ejecutar:

1. En el mismo **SQL Editor** de Supabase
2. Copia y pega el contenido completo del archivo `scripts/create-demo-users.sql`
3. Haz clic en **Run** para ejecutar

## 🎯 Lo que hace el script:

### Verificación de Integridad
- ✅ Verifica si los usuarios ya existen antes de crearlos
- ✅ Usa UUIDs reales generados por PostgreSQL
- ✅ Respeta las foreign key constraints

### Usuarios que se crearán:
1. **single@outlook.es** (Password: Demo1234!)
   - Perfil: Usuario Demo Single, Mujer, 28 años, account_type: 'single'

2. **pareja@outlook.es** (Password: Demo1234!)
   - Perfil: Usuario Demo Pareja, Hombre, 30 años, account_type: 'couple'

3. **admin@outlook.es** (Password: Demo1234!)
   - Perfil: Administrador Demo, Hombre, 35 años, account_type: 'single'

4. **moderador@outlook.es** (Password: Demo1234!)
   - Perfil: Moderador Demo, No binario, 33 años, account_type: 'single'

### Datos incluidos:
- ✅ Usuarios en `auth.users` con email confirmado
- ✅ Perfiles en `profiles` con todos los campos requeridos
- ✅ Campos JSONB: `personality_traits`, `lifestyle_preferences`, `location_preferences`
- ✅ Valores válidos para `account_type` ('single', 'couple')

## 🔍 Validación Final

Al final del script verás una consulta que muestra:
```sql
SELECT 
    p.user_id,
    u.email,
    p.name,
    p.account_type
FROM profiles p 
JOIN auth.users u ON p.user_id = u.id
WHERE u.email IN ('single@outlook.es', 'pareja@outlook.es', 'admin@outlook.es', 'moderador@outlook.es')
ORDER BY u.email;
```

Esta consulta confirmará que todos los perfiles están correctamente vinculados a usuarios reales.

## 📌 Resultado Esperado

Después de ejecutar el script:
- ✅ 4 usuarios demo en `auth.users`
- ✅ 4 perfiles correspondientes en `profiles`
- ✅ Sin errores de foreign key violation
- ✅ Sistema listo para pruebas de demo

## 🚨 Importante

- **NO uses UUIDs inventados** - El script genera UUIDs reales
- **Ejecuta solo en Supabase Editor** - No uses herramientas externas
- **Verifica la salida** - El script mostrará los UUIDs generados en los mensajes

Una vez ejecutado exitosamente, el archivo `seed.sql` ya no será necesario para usuarios demo, ya que tendrás usuarios reales con integridad de datos garantizada.
