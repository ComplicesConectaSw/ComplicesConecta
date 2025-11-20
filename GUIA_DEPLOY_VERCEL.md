# 🚀 GUÍA DE DEPLOY A VERCEL

**Versión:** v3.6.6  
**Fecha:** 19 de Noviembre, 2025  
**Prioridad:** 🔴 CRÍTICO PARA DEMO

---

## 📋 **PRE-REQUISITOS**

### **1. Cuenta de Vercel**
- [ ] Cuenta creada en https://vercel.com
- [ ] GitHub conectado a Vercel
- [ ] Repositorio ComplicesConecta sincronizado

### **2. Variables de Entorno**
- [ ] Archivo `.env` configurado localmente
- [ ] Lista de variables críticas preparada

---

## 🔑 **VARIABLES DE ENTORNO CRÍTICAS**

### **Archivo: `.env.production`**

```env
# ===================================
# SUPABASE
# ===================================
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# ===================================
# API KEYS
# ===================================
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# ===================================
# APP CONFIG
# ===================================
VITE_APP_NAME=ComplicesConecta
VITE_APP_VERSION=3.6.6
VITE_APP_ENV=production

# ===================================
# SEGURIDAD
# ===================================
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_SCREENSHOTS=false
VITE_ENABLE_DOWNLOADS=false

# ===================================
# LEY OLIMPIA
# ===================================
VITE_CONTENT_PROTECTION_ENABLED=true
VITE_WATERMARK_ENABLED=true

# ===================================
# FEATURES FLAGS
# ===================================
VITE_ENABLE_CHAT=true
VITE_ENABLE_VOICE_MESSAGES=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_REACTIONS=true
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_ANALYTICS=true
```

---

## 🚀 **MÉTODO 1: DEPLOY DESDE VERCEL DASHBOARD (RECOMENDADO)**

### **Paso 1: Conectar Repositorio**
```
1. Ir a: https://vercel.com/dashboard
2. Click: "Add New Project"
3. Seleccionar: "Import Git Repository"
4. Buscar: "ComplicesConecta"
5. Click: "Import"
```

### **Paso 2: Configurar Proyecto**
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 20.x
```

### **Paso 3: Agregar Variables de Entorno**
```
1. En página de configuración del proyecto
2. Click: "Environment Variables"
3. Agregar TODAS las variables del archivo .env.production
4. Importante: 
   - Name: VITE_SUPABASE_URL
   - Value: https://your_project.supabase.co
   - Environment: Production ✅
5. Repetir para cada variable
```

### **Paso 4: Deploy**
```
1. Click: "Deploy"
2. Esperar proceso (2-5 minutos)
3. Vercel mostrará logs en tiempo real
4. Esperar mensaje: "✓ Build Completed"
5. Click en URL generada
```

---

## 🖥️ **MÉTODO 2: DEPLOY DESDE CLI (AVANZADO)**

### **Instalar Vercel CLI**
```bash
npm install -g vercel
```

### **Login**
```bash
vercel login
```

### **Deploy**
```bash
# Desde la raíz del proyecto
cd c:\Users\conej\Documents\conecta-social-comunidad-main

# Deploy a producción
vercel --prod

# Responder preguntas:
# Set up and deploy? Y
# Which scope? Tu cuenta
# Link to existing project? N (primera vez) / Y (re-deploy)
# What's your project's name? complicesconecta
# In which directory is your code located? ./
# Want to modify settings? N
```

---

## ✅ **VERIFICACIÓN POST-DEPLOY**

### **1. Verificar Build**
```
[ ] Build completado sin errores
[ ] No hay warnings críticos
[ ] Assets generados correctamente
[ ] Tamaño del bundle < 2 MB gzip
```

### **2. Verificar Variables de Entorno**
```bash
# En la app deployada, abre consola del navegador:
console.log(import.meta.env.VITE_APP_VERSION); // Debe mostrar: "3.6.6"
console.log(import.meta.env.VITE_CONTENT_PROTECTION_ENABLED); // Debe mostrar: "true"
```

### **3. Verificar Features Críticas**
```
[ ] Ley Olimpia activa (intenta screenshot)
[ ] IDs únicos visibles en perfiles
[ ] Sistema de reportes funcional
[ ] Chat cargando correctamente
[ ] Imágenes cargando desde Supabase
[ ] Onboarding aparece para nuevos usuarios
```

### **4. Verificar Performance**
```
[ ] Lighthouse Score > 80
[ ] Time to Interactive < 3s
[ ] First Contentful Paint < 1.5s
[ ] No errores en consola
```

---

## 🔧 **CONFIGURACIÓN AVANZADA**

### **vercel.json** (Configuración personalizada)

Crea archivo `vercel.json` en la raíz:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "env": {
    "NODE_VERSION": "20"
  }
}
```

---

## 🌐 **DOMINIO PERSONALIZADO (OPCIONAL)**

### **Método 1: Dominio de Vercel**
```
Tu app estará disponible en:
https://complicesconecta.vercel.app
```

### **Método 2: Dominio Custom**
```
1. Ve a: Project Settings > Domains
2. Click: "Add Domain"
3. Ingresa: complicesconecta.com
4. Vercel te dará registros DNS:
   - Type: A
   - Name: @
   - Value: 76.76.21.21
   
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com
5. Agrega estos registros en tu proveedor DNS
6. Espera propagación (1-48 horas)
```

---

## 🔒 **SEGURIDAD POST-DEPLOY**

### **Headers de Seguridad**
Ya configurados en `vercel.json`:
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin

### **HTTPS**
- ✅ Vercel proporciona SSL automático
- ✅ Certificado Let's Encrypt gratuito
- ✅ Renovación automática

### **Variables de Entorno**
- ✅ Nunca commitear `.env` al repo
- ✅ Usar solo variables con prefijo `VITE_`
- ✅ No exponer API keys privadas

---

## 📊 **MONITOREO POST-DEPLOY**

### **1. Vercel Analytics**
```
1. Ve a: Project > Analytics
2. Activa: Web Vitals
3. Monitorea:
   - Page Views
   - Unique Visitors
   - Core Web Vitals (LCP, FID, CLS)
```

### **2. Error Tracking**
```
1. Integrar Sentry (opcional):
   npm install @sentry/react @sentry/vite-plugin

2. Configurar en main.tsx:
   import * as Sentry from "@sentry/react";
   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     environment: "production"
   });
```

### **3. Logs**
```
# Ver logs en tiempo real:
vercel logs complicesconecta --follow

# Ver logs específicos:
vercel logs complicesconecta --since 1h
```

---

## 🐛 **TROUBLESHOOTING**

### **Error: Build Failed**
```bash
# Verificar build local primero:
npm run build

# Si falla localmente:
npm run clean
npm install
npm run build

# Si pasa localmente pero falla en Vercel:
# Verificar versión de Node en vercel.json
```

### **Error: Environment Variables Not Found**
```
Solución:
1. Ve a: Project Settings > Environment Variables
2. Verifica que TODAS las variables estén agregadas
3. Verifica que el prefijo sea VITE_ (no REACT_APP_)
4. Re-deploy el proyecto
```

### **Error: 404 en Rutas**
```
Solución:
Agregar en vercel.json:
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### **Error: Assets No Cargan**
```
Solución:
1. Verificar que dist/ tenga todos los assets
2. Verificar rutas en vite.config.ts:
   base: '/'
3. Verificar headers de cache en vercel.json
```

### **Error: Supabase Connection Failed**
```
Solución:
1. Verificar VITE_SUPABASE_URL correcta
2. Verificar VITE_SUPABASE_ANON_KEY correcta
3. Verificar whitelist de dominios en Supabase:
   - Dashboard > Settings > API
   - Agregar: https://complicesconecta.vercel.app
```

---

## 🎯 **CHECKLIST FINAL**

```
PRE-DEPLOY:
[ ] Build local exitoso
[ ] Testing local completo
[ ] Variables de entorno preparadas
[ ] GitHub sincronizado (git push)
[ ] Backup de base de datos

DURANTE DEPLOY:
[ ] Proyecto conectado en Vercel
[ ] Variables de entorno agregadas
[ ] Build settings correctos
[ ] Deploy iniciado

POST-DEPLOY:
[ ] Build completado sin errores
[ ] URL accesible
[ ] Ley Olimpia funcionando
[ ] IDs únicos visibles
[ ] Chat funcional
[ ] Imágenes cargando
[ ] Performance > 80 (Lighthouse)
[ ] No errores en consola
[ ] SSL activo (https://)
[ ] Dominio configurado (opcional)

VERIFICACIÓN FINAL:
[ ] Probar desde móvil
[ ] Probar desde diferentes navegadores
[ ] Compartir URL con equipo
[ ] Documentar URL en README
```

---

## 📱 **URLS IMPORTANTES**

```
Producción:
https://complicesconecta.vercel.app

Preview (staging):
https://complicesconecta-git-develop.vercel.app

Dashboard Vercel:
https://vercel.com/tu-usuario/complicesconecta

GitHub Repo:
https://github.com/ComplicesConectaSw/ComplicesConecta
```

---

## 🚀 **DEPLOY AUTOMÁTICO (CI/CD)**

Vercel se integra automáticamente con GitHub:

### **Triggers Automáticos:**
```
git push origin master
→ Deploy a Production automático

git push origin develop
→ Deploy a Preview (staging) automático

Pull Request creado
→ Deploy de Preview único para testing
```

### **Configurar Branches:**
```
1. Ve a: Project Settings > Git
2. Production Branch: master
3. Preview Branches: develop, staging
4. Automatic Deploy: ON
```

---

## 💡 **TIPS PRO**

### **1. Deploy Rápido**
```bash
# Alias útil:
vercel --prod --yes --token=YOUR_TOKEN
```

### **2. Rollback Rápido**
```
1. Ve a: Project > Deployments
2. Click en deployment anterior exitoso
3. Click: "Promote to Production"
```

### **3. Preview URLs**
```
Cada commit tiene su propia URL de preview:
https://complicesconecta-git-[branch]-[hash].vercel.app

Útil para testing antes de merge a master
```

### **4. Environment por Branch**
```
Production Branch (master):
- Variables de producción
- Supabase production
- Analytics ON

Preview Branches (develop):
- Variables de staging
- Supabase staging
- Analytics OFF
```

---

## 📞 **SOPORTE**

**Documentación Vercel:**
https://vercel.com/docs

**Soporte Vercel:**
https://vercel.com/support

**Comunidad:**
https://github.com/vercel/vercel/discussions

---

## ✅ **SIGUIENTE PASO: DEMO SCRIPT**

Una vez deployado exitosamente, procede con:
```bash
# Ver siguiente documento:
SCRIPT_DEMO_INVERSOR.md
```

---

**Tiempo Estimado:** 15-30 minutos  
**Dificultad:** Media  
**Prioridad:** 🔴 CRÍTICO

---

**Fin de Guía de Deploy a Vercel**
