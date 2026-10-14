import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productoRoutes from './routes/productoRoutes';
import carritoRoutes from './routes/carritoRoutes';
import pedidoRoutes from './routes/pedidoRoutes';
import { securityHeaders, rateLimit } from './middleware/security';
import { dbHealth } from './db/pool';

dotenv.config();

const app = express();

app.use(securityHeaders);
// CORS restringible por entorno (Render: CORS_ORIGIN = host del frontend).
// Acepta URL completa o host pelado (se normaliza a https://) y lista
// separada por comas. Sin CORS_ORIGIN se mantiene abierto (local/dev).
const rawOrigin = (process.env['CORS_ORIGIN'] || '').trim();
const allowedOrigins = rawOrigin
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean)
  .map((s) => (/^https?:\/\//i.test(s) ? s : `https://${s}`));
app.use(
  allowedOrigins.length > 0 ? cors({ origin: allowedOrigins }) : cors()
);
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit(200));

app.use('/api/productos', productoRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/pedidos', pedidoRoutes);

app.get('/api/health', (_req, res) => {
  void dbHealth().then((db) => {
    res.json({ status: 'ok', db, timestamp: new Date().toISOString() });
  });
});

export default app;
