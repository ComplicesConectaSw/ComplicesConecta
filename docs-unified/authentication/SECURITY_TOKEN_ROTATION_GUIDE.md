# 🔐 Guía de Rotación de Tokens - ComplicesConecta

## **Security Token Rotation Guide v3.0.0**
**Fecha**: 22 de Septiembre, 2025 - 22:39 hrs  
**Estado**: 🔒 PROCEDIMIENTOS DE SEGURIDAD ACTIVOS

---

## 🚨 **ROTACIÓN INMEDIATA REQUERIDA**

### **⚠️ Token GitHub AI Expuesto**
**Token actual**: `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`
**Estado**: 🔴 **COMPROMETIDO** (expuesto en documentación)
**Acción**: ✅ **ROTACIÓN INMEDIATA REQUERIDA**

---

## 🔄 **PROCEDIMIENTO DE ROTACIÓN DE TOKENS**

### **1. Generar Nuevo Token GitHub AI**

#### **Paso 1: Acceder a GitHub Settings**
1. Ve a [GitHub.com](https://github.com) → Settings
2. Developer settings → Personal access tokens → Fine-grained tokens
3. Selecciona "Generate new token"

#### **Paso 2: Configurar Permisos**
```
Token name: ComplicesConecta-AI-Models-v2
Expiration: 90 days (recomendado)
Resource owner: Tu organización
Repository access: Selected repositories → ComplicesConecta

Permissions requeridos:
✅ models:read (CRÍTICO para GitHub AI)
✅ contents:read (para acceso al código)
✅ metadata:read (información básica)
```

#### **Paso 3: Generar y Copiar**
- Generar token
- **COPIAR INMEDIATAMENTE** (solo se muestra una vez)
- Formato: `github_pat_XXXXXXXXXX...`

### **2. Revocar Token Anterior**

#### **Eliminar Token Comprometido**
1. GitHub Settings → Personal access tokens
2. Buscar token que inicia con `github_pat_11BUGPENY0...`
3. Click "Delete" → Confirmar revocación
4. ✅ **Token anterior invalidado**

---

## 🔧 **ACTUALIZAR CONFIGURACIONES**

### **3. Actualizar Variables de Entorno**

#### **Archivo Local (.env.circleci)**
```bash
# NUEVO TOKEN (reemplazar el anterior)
GITHUB_TOKEN=github_pat_NUEVO_TOKEN_AQUI

# Mantener otras variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
AZURE_AI_ENDPOINT=https://models.github.ai/inference
DEEPSEEK_MODEL=deepseek/DeepSeek-V3-0324
```

#### **CircleCI Environment Variables**
1. Ve a CircleCI Dashboard
2. Project Settings → Environment Variables
3. Buscar `GITHUB_TOKEN`
4. Click "Edit" → Reemplazar con nuevo token
5. Save changes

### **4. Verificar Configuración**

#### **Probar Nuevo Token**
```bash
# Ejecutar script de verificación
pnpm ai:setup

# Verificar conexión con GitHub AI
pnpm ai:test

# Resultado esperado: ✅ Conexión exitosa
```

---

## 🔐 **ROTACIÓN DE CREDENCIALES SUPABASE**

### **5. Generar Nuevas Credenciales Supabase**

#### **Si es Necesario Rotar Supabase**
1. **Supabase Dashboard** → Project Settings
2. **API Settings** → Generate new anon key
3. **Database Settings** → Reset database password (si necesario)

#### **Actualizar Variables**
```bash
# Nuevas credenciales Supabase
VITE_SUPABASE_URL=https://NEW-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=NEW_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=NEW_SERVICE_ROLE_KEY
```

---

## ✅ **CHECKLIST DE SEGURIDAD POST-ROTACIÓN**

### **Verificaciones Obligatorias**

- [ ] **Token GitHub AI rotado** y anterior revocado
- [ ] **Variables CircleCI actualizadas** con nuevo token
- [ ] **Archivo .env.circleci actualizado** localmente
- [ ] **Script ai:setup ejecutado** exitosamente
- [ ] **Pipeline CircleCI probado** con nuevo token
- [ ] **Credenciales Supabase rotadas** (si necesario)
- [ ] **Documentación actualizada** sin tokens expuestos

### **Pruebas de Funcionalidad**

```bash
# 1. Verificar GitHub AI
pnpm ai:test
# ✅ Esperado: Conexión exitosa con DeepSeek-V3-0324

# 2. Verificar build local
pnpm build
# ✅ Esperado: Build exitoso sin errores

# 3. Verificar tests
pnpm test --run
# ✅ Esperado: 140/140 tests pasando

# 4. Verificar CircleCI (después de push)
git push origin main
# ✅ Esperado: Pipeline ejecutándose con nuevo token
```

---

## 📋 **CONFIGURACIÓN CIRCLECI SEGURA**

### **Variables de Entorno Requeridas**

| **Variable** | **Valor** | **Descripción** |
|--------------|-----------|-----------------|
| `GITHUB_TOKEN` | `github_pat_NUEVO...` | Token GitHub AI rotado |
| `VITE_SUPABASE_URL` | `https://project.supabase.co` | URL Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Clave anónima Supabase |
| `NODE_ENV` | `production` | Entorno de ejecución |

### **Configuración en CircleCI Dashboard**

#### **Paso a Paso**
1. **Acceder**: [CircleCI.com](https://circleci.com/) → Projects
2. **Seleccionar**: ComplicesConecta project
3. **Configurar**: Project Settings → Environment Variables
4. **Agregar/Editar** cada variable de la tabla anterior
5. **Verificar**: No hardcodear tokens en archivos

---

## 🔍 **MONITOREO CONTINUO**

### **Comandos de Verificación Diaria**

```bash
# Verificar archivos ignorados
git check-ignore .env.production .env.circleci

# Monitorear archivos sensibles
git status --ignored

# Verificar que no hay tokens en commits recientes
git log --oneline -10 | grep -i token

# Verificar configuración AI
pnpm ai:setup
```

### **Alertas de Seguridad**

#### **Configurar Notificaciones**
- **GitHub**: Security alerts habilitadas
- **CircleCI**: Failed builds notifications
- **Supabase**: Unusual activity alerts
- **Monitoreo**: Logs de acceso a tokens

---

## 🚨 **PROCEDIMIENTO DE EMERGENCIA**

### **Si Token es Comprometido**

#### **Acción Inmediata (< 5 minutos)**
1. **Revocar token** en GitHub inmediatamente
2. **Generar nuevo token** con permisos mínimos
3. **Actualizar CircleCI** con nuevo token
4. **Verificar logs** de acceso no autorizado
5. **Notificar al equipo** del incidente

#### **Investigación Post-Incidente**
1. **Revisar commits** que expusieron el token
2. **Verificar accesos** con token comprometido
3. **Actualizar procedimientos** de seguridad
4. **Documentar lecciones** aprendidas

---

## 📊 **CRONOGRAMA DE ROTACIÓN**

### **Rotación Programada**

| **Recurso** | **Frecuencia** | **Próxima Rotación** |
|-------------|----------------|----------------------|
| **GitHub Token** | 90 días | Diciembre 2025 |
| **Supabase Keys** | 180 días | Marzo 2026 |
| **CI/CD Secrets** | 60 días | Noviembre 2025 |

### **Recordatorios Automáticos**
- **Calendar alerts** 7 días antes de expiración
- **GitHub notifications** para tokens próximos a expirar
- **CircleCI monitoring** para fallos de autenticación

---

<div align="center">

## 🛡️ **SEGURIDAD PROACTIVA IMPLEMENTADA** 🛡️

### **ComplicesConecta v3.0.0 - Security First**

**Procedimientos de seguridad establecidos:**
- 🔄 **Rotación de tokens** documentada y programada
- 🔍 **Monitoreo continuo** implementado
- 🚨 **Procedimientos de emergencia** definidos
- 📋 **Checklist de verificación** completo

---

**Token GitHub AI debe ser rotado INMEDIATAMENTE**  
**debido a exposición en documentación**

**© 2025 ComplicesConecta - Security Operations**  
**22 de Septiembre, 2025 - 22:39 hrs**

</div>