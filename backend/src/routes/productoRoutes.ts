import { Router, Request, Response } from 'express';
import * as productoService from '../services/productoService';
import { dbObtenerTodos, dbObtenerPorId, dbBuscar } from '../db/productoRepository';
import { parseId, parsePagination, sanitizeTermino } from '../middleware/validate';

const router = Router();

// Rutas específicas ANTES de /:id (si no, Express las captura como id).
router.get('/categoria/:categoria', (req: Request, res: Response) => {
  const categoria = sanitizeTermino(req.params.categoria, 50);
  if (!categoria) {
    res.status(400).json({ error: 'categoria inválida' });
    return;
  }
  const productos = productoService.obtenerPorCategoria(categoria);
  const { limit, offset } = parsePagination(req.query);
  res.json(productos.slice(offset, offset + limit));
});

router.get('/buscar/:termino', (req: Request, res: Response) => {
  const termino = sanitizeTermino(req.params.termino, 80);
  if (!termino) {
    res.status(400).json({ error: 'termino inválido' });
    return;
  }
  void (async (): Promise<void> => {
    const db = await dbBuscar(termino);
    const productos = db ?? productoService.buscar(termino);
    res.json(productos.slice(0, 20));
  })();
});

// GET /api/productos?limit=&offset= — paginado (T-05), DB real con fallback.
router.get('/', (req: Request, res: Response) => {
  const { limit, offset } = parsePagination(req.query);
  void (async (): Promise<void> => {
    const db = await dbObtenerTodos();
    const base = db ?? productoService.obtenerTodos();
    res.json(base.slice(offset, offset + limit));
  })();
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'id inválido' });
    return;
  }
  void (async (): Promise<void> => {
    const db = await dbObtenerPorId(id);
    const producto = db === null ? productoService.obtenerPorId(id) : db ?? undefined;
    if (!producto) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.json(producto);
  })();
});

export default router;
