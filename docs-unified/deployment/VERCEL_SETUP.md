# Configuración de Variables de Entorno en Vercel

## ✅ BUILD EXITOSO - Ahora configurar variables de entorno

El deployment de Vercel funcionó correctamente, pero la aplicación no carga porque faltan las variables de entorno de Supabase.

## 🔧 Configurar en Vercel Dashboard

1. **Ve a tu proyecto en Vercel**: https://vercel.com/dashboard
2. **Selecciona tu proyecto**: `complicesconectasw`
3. **Ve a Settings > Environment Variables**
4. **Agrega estas variables:**

### Variables Requeridas:

```
VITE_SUPABASE_URL=https://axtvqnozatbmllvwzuim.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZxbm96YXRibWxsdnd6dWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODQ5MDYsImV4cCI6MjA2MTY2MDkwNn0.yzrgK-Z-DR7lsUqftnVUA0GMsWQuf62zSAmDNxZKG9Y
```

### Variables Opcionales (para funcionalidades completas):

```
VITE_APP_ENV=production
VITE_APP_URL=https://complicesconectasw.vercel.app
VITE_API_URL=https://complicesconectasw.vercel.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51S1karC9tJdg35c1i2FYePo2XSa7Xogqf2J2z2DeZvaXB5ZsX8TO1UMmPQ9rZs1xybIvkKvuvxABlhkFi441lF8C00pkxfgx7a
```

## 🚀 Pasos:

1. **Copia las variables** de arriba
2. **Pégalas en Vercel** una por una
3. **Selecciona "Production"** para cada variable
4. **Redeploy** tu aplicación

## 📝 Notas:

- Las variables `VITE_*` son públicas y se incluyen en el bundle
- Después de agregar las variables, haz un nuevo deployment
- La aplicación debería cargar correctamente

## 🔍 Verificar:

Una vez configuradas las variables, la aplicación debería:
- ✅ Cargar el landing page
- ✅ Conectar con Supabase
- ✅ Mostrar contenido sin errores de consola
