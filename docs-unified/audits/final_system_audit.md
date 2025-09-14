Actúa como un **auditor experto en Supabase, PostgreSQL, TypeScript y sistemas de tiempo real**.  
Tu tarea es **recrear desde cero la auditoría integral completa** de **ComplicesConecta v2.1.1** y confirmar que la base de datos ya está funcional, identificando qué ya se implementó, qué está pendiente y qué falta.

---

## 📌 Alcance de la auditoría

### 1. Base de Datos
- Validar que las 14 tablas críticas existen:
  `profiles`, `user_roles`, `invitations`, `gallery_permissions`,  
  `images`, `image_permissions`, `gallery_access_requests`,  
  `chat_rooms`, `chat_members`, `messages`, `chat_invitations`,  
  `user_likes`, `matches`, `match_interactions`.
- Confirmar columnas críticas en `profiles`: `interests`, `looking_for`, `swinger_experience`, `age_range_min`, `age_range_max`, `max_distance`.
- Revisar **foreign keys, cascadas y constraints únicos**.
- Validar que **índices críticos** están creados.
- Confirmar que funciones existen y están activas:
  - `has_role`
  - `handle_new_user`
  - `update_updated_at_column`
  - `exec_sql`
  - `detect_mutual_match`
  - `comprehensive_system_audit`
- Validar triggers automáticos (`updated_at`, `on_auth_user_created`, etc.).

### 2. Seguridad
- Confirmar que todas las tablas críticas tienen **RLS habilitado**.
- Listar políticas de acceso y verificar que cumplen:
  - Lectura solo por dueño o miembros autorizados.
  - Inserción segura (solo usuarios válidos).
  - Actualización restringida.
  - Acceso granular en chat, galería y matching.
- Confirmar que los **buckets de Storage** existen (`profile-images`, `gallery-images`, `chat-media`) y tienen políticas correctas.

### 3. Sistemas Críticos
- **Matching**: Validar lógica, tablas y funciones (`calculateCompatibility`, `getRecommendedMatches`, etc.).
- **Chat Real-Time**: Confirmar salas públicas/privadas, invitaciones, multimedia, Supabase Realtime.
- **Galería**: Confirmar permisos granulares, solicitudes de acceso y buckets.
- **Roles y Perfiles**: Validar sistema de roles (`user_roles`) y perfiles completos.

### 4. Calidad de Código
- Confirmar:
  - Sin `@ts-nocheck`.
  - Tipos `any` mínimos y justificados.
  - `useEffect` corregidos con dependencias correctas.
  - Arquitectura limpia y separada.
- Validar integración con `src/types/supabase.ts`.

### 5. Testing
- Confirmar que están configurados:
  - **Vitest** para unitarios.
  - **Playwright** para E2E.
- Revisar dependencias (`jsdom`, `@testing-library`, etc.).
- Confirmar mocks en `src/test/setup.ts`.
- Reportar cobertura y si tests críticos faltan.

---

## 📊 Formato del reporte

1. **Resumen Ejecutivo**
   - Estado general ✅/⚠️/❌
   - Puntuación general (0-100)
   - Nivel de riesgo (Bajo / Medio / Alto)

2. **Auditoría de Tablas**
   - Tabla por tabla con columnas, RLS y estado.

3. **Funciones y Triggers**
   - Lista con estado ✅/❌.

4. **Sistemas Críticos**
   - Matching, Chat, Galería → Implementado / Pendiente / Falta.

5. **Seguridad**
   - Listado de políticas activas.
   - Validación granular.

6. **Testing**
   - Unitarios: % implementado.
   - E2E: % implementado.
   - Dependencias instaladas.

7. **Calidad de Código**
   - Duplicados eliminados, tipos, buenas prácticas.

8. **Checklist Final** ✅/❌.

9. **Recomendaciones**
   - Acciones inmediatas.
   - Acciones de mediano plazo.
   - Mejoras futuras.

---

## 🔒 Reglas
- Usa ✅ para implementado, ⚠️ para pendiente, ❌ para faltante.
- No dupliques migraciones.
- Marca claramente lo que ya está funcionando.
- Si algo no está implementado, sugiere **acción inmediata**.

---

## 📦 Entregables
1. **Reporte integral** en formato Markdown (`reports/final_system_audit.md`).
2. **Comandos CLI** para validar estado (reset, push, gen types, tests).
3. **Checklist final** para confirmar producción.

---

🎯 Objetivo final: Entregar una **auditoría ejecutiva y técnica completa**, que confirme que la base de datos ya está funcional, qué está listo, qué falta y qué acciones tomar.
