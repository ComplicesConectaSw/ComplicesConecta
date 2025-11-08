# 🚇 Configuración de Túneles para Desarrollo

## Opciones de Túnel Disponibles

### 1. **ngrok** (Recomendado - Más Popular)

#### Instalación:
```bash
# Windows (con Chocolatey)
choco install ngrok

# O descargar desde: https://ngrok.com/download
# O usar npm
npm install -g ngrok
```

#### Configuración:
```bash
# 1. Crear cuenta en https://ngrok.com (gratis)
# 2. Obtener authtoken desde dashboard
ngrok config add-authtoken YOUR_AUTH_TOKEN

# 3. Iniciar túnel para Vite (puerto 5173)
ngrok http 5173

# 4. O con configuración personalizada
ngrok http 5173 --domain=your-custom-domain.ngrok-free.app
```

#### Uso con Script:
```bash
# Agregar a package.json
"tunnel:ngrok": "ngrok http 5173"
```

---

### 2. **Cloudflare Tunnel (cloudflared)** (Gratis, Sin Límites)

#### Instalación:
```bash
# Windows
winget install --id Cloudflare.cloudflared

# O descargar desde: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

#### Configuración:
```bash
# 1. Iniciar túnel simple (sin cuenta)
cloudflared tunnel --url http://localhost:5173

# 2. O con túnel nombrado (requiere cuenta Cloudflare)
cloudflared tunnel create complices-dev
cloudflared tunnel route dns complices-dev dev.complicesconecta.com
cloudflared tunnel run complices-dev
```

#### Uso con Script:
```bash
# Agregar a package.json
"tunnel:cloudflare": "cloudflared tunnel --url http://localhost:5173"
```

---

### 3. **localtunnel** (Simple, npm package)

#### Instalación:
```bash
npm install -g localtunnel
```

#### Configuración:
```bash
# Iniciar túnel
lt --port 5173

# O con subdominio personalizado
lt --port 5173 --subdomain complices-dev
```

#### Uso con Script:
```bash
# Agregar a package.json
"tunnel:lt": "lt --port 5173"
```

---

### 4. **Vercel Dev** (Si usas Vercel)

#### Configuración:
```bash
# Vercel ya tiene túnel integrado
vercel dev

# Esto automáticamente crea un túnel público
```

---

## 🚀 Configuración Rápida (Recomendada)

### Opción A: ngrok (Más Estable)

1. **Instalar ngrok:**
```bash
npm install -g ngrok
```

2. **Configurar authtoken:**
```bash
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
```

3. **Iniciar túnel:**
```bash
npm run tunnel:ngrok
```

### Opción B: Cloudflare Tunnel (Gratis, Sin Límites)

1. **Instalar cloudflared:**
```bash
winget install --id Cloudflare.cloudflared
```

2. **Iniciar túnel:**
```bash
npm run tunnel:cloudflare
```

---

## 📝 Scripts para package.json

Agregar estos scripts a `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:tunnel": "concurrently \"npm run dev\" \"npm run tunnel:ngrok\"",
    "tunnel:ngrok": "ngrok http 5173",
    "tunnel:cloudflare": "cloudflared tunnel --url http://localhost:5173",
    "tunnel:lt": "lt --port 5173",
    "tunnel:vercel": "vercel dev"
  }
}
```

---

## 🔧 Configuración Avanzada

### ngrok con Config File

Crear `ngrok.yml` en la raíz del proyecto:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  complices-dev:
    addr: 5173
    proto: http
    bind_tls: true
    inspect: true
```

Luego ejecutar:
```bash
ngrok start complices-dev
```

### Cloudflare Tunnel con Config

1. **Crear túnel:**
```bash
cloudflared tunnel create complices-dev
```

2. **Configurar DNS:**
```bash
cloudflared tunnel route dns complices-dev dev.complicesconecta.com
```

3. **Crear config.json:**
```json
{
  "tunnel": "complices-dev",
  "credentials-file": "/path/to/credentials.json"
}
```

4. **Ejecutar:**
```bash
cloudflared tunnel run complices-dev
```

---

## 🌐 Variables de Entorno

Agregar a `.env`:

```env
# Tunnel Configuration
VITE_TUNNEL_URL=https://your-tunnel-url.ngrok-free.app
VITE_TUNNEL_ENABLED=true
```

---

## ✅ Verificación

1. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

2. **Iniciar túnel (en otra terminal):**
```bash
npm run tunnel:ngrok
```

3. **Verificar URL pública:**
- ngrok: https://dashboard.ngrok.com/status/tunnels
- cloudflared: Se muestra en la terminal
- localtunnel: Se muestra en la terminal

---

## 🎯 Recomendación Final

**Para desarrollo rápido:** Usar `localtunnel` (más simple)
**Para producción/testing:** Usar `ngrok` (más estable)
**Para uso gratuito ilimitado:** Usar `cloudflared` (Cloudflare Tunnel)

