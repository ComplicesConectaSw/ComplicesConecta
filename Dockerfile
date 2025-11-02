# ================================
# ComplicesConecta - Dockerfile
# New Relic APM Monitoring Enabled
# ================================

FROM node:20-alpine AS builder

# Instalar dependencias necesarias
RUN apk add --no-cache python3 make g++

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (con legacy-peer-deps para resolver conflictos)
RUN npm ci --legacy-peer-deps --omit=dev

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# ================================
# Imagen de producción
# ================================
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/newrelic.js ./newrelic.js
COPY --from=builder /app/server.js ./server.js

# ================================
# New Relic Configuration
# ================================
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_LICENSE_KEY=6f647c9c6eaa46100c049ab77e900462FFFFNRAL
ENV NEW_RELIC_APP_NAME=complicesconecta
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout
ENV NEW_RELIC_AI_MONITORING_ENABLED=true
ENV NEW_RELIC_CUSTOM_INSIGHTS_EVENTS_MAX_SAMPLES_STORED=100000
ENV NEW_RELIC_SPAN_EVENTS_MAX_SAMPLES_STORED=10000

# Variables de entorno para runtime
ENV NODE_ENV=production
ENV PORT=3000

# Exponer puerto
EXPOSE 3000

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio (newrelic ya está requerido en server.js)
CMD ["node", "server.js"]

