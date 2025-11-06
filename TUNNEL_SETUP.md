# 🚇 Configuración de Túnel para ComplicesConecta v3.5.1

## ✅ Estado Actual

- ✅ ngrok instalado (versión 3.24.0-msix)
- ✅ Scripts configurados para puerto 8080
- ✅ concurrently instalado
- ⚠️  Authtoken de ngrok pendiente de configurar

## 🚀 Configuración Rápida

### Opción 1: ngrok (Recomendado)

#### Paso 1: Configurar Authtoken

1. Crear cuenta en https://ngrok.com (gratis)
2. Obtener authtoken desde el dashboard: https://dashboard.ngrok.com/get-started/your-authtoken
3. Ejecutar:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### Paso 2: Iniciar Túnel

**Opción A: Solo túnel (en terminal separada)**
```bash
npm run tunnel:ngrok
```

**Opción B: Dev + Túnel simultáneamente**
```bash
npm run dev:tunnel
```

### Opción 2: Cloudflare Tunnel (Gratis, Sin Límites)

#### Paso 1: Instalar cloudflared

```bash
winget install --id Cloudflare.cloudflared
```

#### Paso 2: Iniciar Túnel

```bash
npm run tunnel:cloudflare
```

### Opción 3: localtunnel (Simple)

#### Paso 1: Instalar localtunnel

```bash
npm install -g localtunnel
```

#### Paso 2: Iniciar Túnel

```bash
npm run tunnel:lt
```

### Opción 4: Vercel Dev (Ya configurado)

```bash
npm run tunnel:vercel
```

## 📋 Scripts Disponibles

| Script | Descripción | Puerto |
|--------|-------------|--------|
| `npm run tunnel:ngrok` | Iniciar túnel con ngrok | 8080 |
| `npm run tunnel:cloudflare` | Iniciar túnel con Cloudflare | 8080 |
| `npm run tunnel:lt` | Iniciar túnel con localtunnel | 8080 |
| `npm run tunnel:vercel` | Iniciar túnel con Vercel Dev | 8080 |
| `npm run dev:tunnel` | Iniciar dev + túnel simultáneamente | 8080 |

## 🔧 Configuración Avanzada

### ngrok con Config File

Crear `ngrok.yml` en la raíz del proyecto:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  complices-dev:
    addr: 8080
    proto: http
    bind_tls: true
    inspect: true
```

Luego ejecutar:
```bash
ngrok start complices-dev
```

### Cloudflare Tunnel con Config

1. Crear túnel:
```bash
cloudflared tunnel create complices-dev
```

2. Configurar DNS:
```bash
cloudflared tunnel route dns complices-dev dev.complicesconecta.com
```

3. Ejecutar:
```bash
cloudflared tunnel run complices-dev
```

## 🌐 Variables de Entorno

Agregar a `.env` (opcional):

```env
# Tunnel Configuration
VITE_TUNNEL_URL=https://your-tunnel-url.ngrok-free.app
VITE_TUNNEL_ENABLED=true
```

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

## 🎯 Recomendación

**Para desarrollo rápido:** Usar `localtunnel` (más simple)
**Para producción/testing:** Usar `ngrok` (más estable)
**Para uso gratuito ilimitado:** Usar `cloudflared` (Cloudflare Tunnel)

## 📝 Notas

- El puerto configurado es **8080** (puerto de Vite)
- Todos los scripts están actualizados para usar el puerto correcto
- `concurrently` está instalado para ejecutar dev + túnel simultáneamente

## 🆘 Troubleshooting

### Error: "ngrok: command not found"
```bash
npm install -g ngrok
```

### Error: "authtoken not configured"
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Error: "port already in use"
Verificar que el puerto 8080 no esté en uso:
```bash
netstat -ano | findstr :8080
```

### Error: "concurrently not found"
```bash
npm install --save-dev concurrently
```

