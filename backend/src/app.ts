import express from 'express';
import cors from 'cors';
import productoRoutes from './routes/productoRoutes';
import carritoRoutes from './routes/carritoRoutes';
import pedidoRoutes from './routes/pedidoRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/productos', productoRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/pedidos', pedidoRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
