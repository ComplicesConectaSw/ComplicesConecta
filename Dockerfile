FROM node:20-alpine AS builder

RUN apk add --no-cache g++ make python3

WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --omit=dev --ignore-scripts

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/newrelic.js ./newrelic.js
COPY --from=builder /app/server.js ./server.js

# ================================
# Configuración New Relic
# ================================
# CRÍTICO: La clave de New Relic debe pasarse como variable de entorno en RUNTIME, no en build
# Esto evita exponer la clave en la imagen Docker
# Ejemplo de uso:
# docker run -e NEW_RELIC_LICENSE_KEY=tu-clave -p 3000:3000 complicesconecta:latest
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_APP_NAME=complicesconecta
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout
ENV NEW_RELIC_AI_MONITORING_ENABLED=true
ENV NEW_RELIC_CUSTOM_INSIGHTS_EVENTS_MAX_SAMPLES_STORED=100000
ENV NEW_RELIC_SPAN_EVENTS_MAX_SAMPLES_STORED=10000
# NOTA: NEW_RELIC_LICENSE_KEY debe pasarse como -e NEW_RELIC_LICENSE_KEY=... en docker run
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]