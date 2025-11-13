# 🚀 Configuración de Branch de Producción en Vercel

**Versión:** 3.6.3  
**Fecha:** 09 de Noviembre, 2025  
**Estado:** ✅ Configuración de Producción

---

## 📋 IMPORTANTE: Branch de Producción

### ⚠️ **Vercel debe desplegarse desde `master`**

Vercel está configurado para desplegar a producción desde la rama **`master`**, no desde `feature/desarrollo-actual`.

---

## 🔧 Configuración en Vercel Dashboard

### 1. **Configurar Branch de Producción**

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **ComplicesConecta**
3. Ve a **Settings** → **Git**
4. En la sección **Production Branch**, asegúrate de que esté configurado como **`master`**
5. Guarda los cambios

### 2. **Verificar Configuración de Deploy**

1. Ve a **Settings** → **Deployments**
2. Verifica que **Production Branch** esté configurado como **`master`**
3. Verifica que **Automatic Deployments** esté habilitado solo para `master`

---

## 📝 Proceso de Deploy Correcto

### ✅ **Deploy desde `master`**

```bash
# 1. Asegúrate de estar en master
git checkout master

# 2. Asegúrate de tener los últimos cambios
git pull origin master

# 3. Merge de feature/desarrollo-actual a master (si es necesario)
git merge feature/desarrollo-actual

# 4. Push a master
git push origin master

# 5. Deploy a Vercel
vercel --prod
```

### ⚠️ **NO desplegar desde `feature/desarrollo-actual`**

El branch `feature/desarrollo-actual` es para desarrollo y no debe usarse para producción.

---

## 🔄 Script de Deploy Automatizado

El script `build-and-deploy.ps1` ahora verifica automáticamente que estés en `master` antes de desplegar:

```powershell
# El script verifica el branch actual
# Si no estás en 'master', te pregunta si deseas cambiar
# Solo despliega a producción desde 'master'
.\build-and-deploy.ps1
```

---

## 🚨 Solución de Problemas

### Problema: Vercel está desplegando desde `feature/desarrollo-actual`

**Solución:**

1. **En Vercel Dashboard:**
   - Ve a **Settings** → **Git**
   - Cambia **Production Branch** a **`master`**
   - Guarda los cambios

2. **Desactivar deploys automáticos desde `feature/desarrollo-actual`:**
   - Ve a **Settings** → **Git**
   - En **Ignored Build Step**, agrega:
     ```bash
     git rev-parse --abbrev-ref HEAD | grep -E '^(master|main)$'
     ```
   - Esto solo permitirá deploys desde `master` o `main`

3. **Forzar deploy desde `master`:**
   ```bash
   git checkout master
   git pull origin master
   vercel --prod --force
   ```

---

## 📊 Verificación de Deploy

### ✅ **Verificar que el deploy es desde `master`**

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Deployments**
4. Verifica que el deployment de producción muestre:
   - **Branch:** `master`
   - **Status:** `Ready`
   - **Environment:** `Production`

### ⚠️ **Si ves `feature/desarrollo-actual` en producción:**

1. **Promover deployment desde `master`:**
   - Ve a **Deployments**
   - Busca un deployment desde `master`
   - Haz clic en **"..."** → **"Promote to Production"**

2. **O crear nuevo deployment desde `master`:**
   ```bash
   git checkout master
   git pull origin master
   vercel --prod --force
   ```

---

## 🔐 Configuración de Branches

### **Branches Configurados:**

- **`master`** → Producción (Vercel Production)
- **`feature/desarrollo-actual`** → Desarrollo (Vercel Preview)

### **Flujo de Trabajo:**

```
feature/desarrollo-actual (desarrollo)
    ↓
    merge
    ↓
master (producción)
    ↓
    deploy automático
    ↓
Vercel Production
```

---

## 📞 Contacto

Si tienes problemas con la configuración de Vercel:

1. Verifica la configuración en [Vercel Dashboard](https://vercel.com/dashboard)
2. Consulta la [documentación de Vercel](https://vercel.com/docs)
3. Revisa los logs de deploy en Vercel Dashboard

---

**© 2025 ComplicesConecta - Todos los derechos reservados**  
**Última actualización:** 09 de Noviembre, 2025  
**Versión:** 3.6.3

