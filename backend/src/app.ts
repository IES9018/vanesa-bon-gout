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
app.use(cors());
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
