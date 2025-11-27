/**
 * ComplicesConecta Production Server
 * Con New Relic APM integrado
 */

// 1. IMPORTANTE: New Relic debe ser lo primero
/* eslint-disable no-unused-vars, unused-imports/no-unused-imports */
// @ts-ignore - Side-effect import, no se usa directamente
import newrelic from 'newrelic'; // Usado automáticamente por el agente (side-effect import)
/* eslint-enable no-unused-vars, unused-imports/no-unused-imports */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

// Para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression()); // Comprimir respuestas
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Usar console.log aquí es aceptable para logging del servidor
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Servir archivos estáticos del build
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d', // Cache por 1 día
  etag: true,
  lastModified: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '3.4.1',
    newrelic: 'active'
  });
});

// API proxy (opcional, para futuros endpoints)
app.get('/api/status', (req, res) => {
  res.json({
    app: 'ComplicesConecta',
    version: '3.4.1',
    environment: process.env.NODE_ENV || 'production'
  });
});

// SPA fallback - todas las rutas no encontradas van a index.html
app.use((req, res, next) => {
  // Si la ruta no es un archivo estático, servir index.html
  if (!req.path.match(/\.[a-z]+$/i)) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // Usar console.error aquí es aceptable para errores del servidor
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  // Usar console.log aquí es aceptable para logging de inicio del servidor
  console.log('================================================');
  console.log('  ComplicesConecta Server');
  console.log('================================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`✅ New Relic: ${process.env.NEW_RELIC_APP_NAME || 'Not configured'}`);
  console.log('================================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

