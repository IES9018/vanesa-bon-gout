import { Router, Request, Response } from 'express';
import * as productoService from '../services/productoService';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const productos = productoService.obtenerTodos();
  res.json(productos);
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const producto = productoService.obtenerPorId(id);
  if (!producto) {
    res.status(404).json({ error: 'Producto no encontrado' });
    return;
  }
  res.json(producto);
});

router.get('/categoria/:categoria', (req: Request, res: Response) => {
  const productos = productoService.obtenerPorCategoria(req.params.categoria);
  res.json(productos);
});

router.get('/buscar/:termino', (req: Request, res: Response) => {
  const productos = productoService.buscar(req.params.termino);
  res.json(productos);
});

export default router;
