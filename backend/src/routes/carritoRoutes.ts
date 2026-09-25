import { Router, Request, Response } from 'express';
import * as carritoService from '../services/carritoService';
import { validateBody, agregarItemSchema, parseId } from '../middleware/validate';

const router = Router();

router.get('/:clienteId', (req: Request, res: Response) => {
  const clienteId = parseId(req.params.clienteId);
  if (clienteId === null) {
    res.status(400).json({ error: 'clienteId inválido' });
    return;
  }
  const carrito = carritoService.obtenerCarrito(clienteId);
  res.json(carrito);
});

// T-02: body validado con zod (cantidad 1..100, personalizaciones ≤280).
router.post('/:clienteId/agregar', validateBody(agregarItemSchema), (req: Request, res: Response) => {
  const clienteId = parseId(req.params.clienteId);
  if (clienteId === null) {
    res.status(400).json({ error: 'clienteId inválido' });
    return;
  }
  const { productoId, cantidad, personalizaciones } = req.body as {
    productoId: number;
    cantidad: number;
    personalizaciones: string;
  };

  const result = carritoService.agregarItem(clienteId, productoId, cantidad, personalizaciones || '');

  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }

  res.json({ message: result.message, carrito: carritoService.obtenerCarrito(clienteId) });
});

router.delete('/:clienteId/eliminar/:productoId', (req: Request, res: Response) => {
  const clienteId = parseId(req.params.clienteId);
  const productoId = parseId(req.params.productoId);
  if (clienteId === null || productoId === null) {
    res.status(400).json({ error: 'ids inválidos' });
    return;
  }

  const result = carritoService.eliminarItem(clienteId, productoId);
  if (!result.success) {
    res.status(404).json({ error: result.message });
    return;
  }

  res.json({ message: result.message });
});

router.put('/:clienteId/actualizar', validateBody(agregarItemSchema.pick({ productoId: true, cantidad: true })), (req: Request, res: Response) => {
  const clienteId = parseId(req.params.clienteId);
  if (clienteId === null) {
    res.status(400).json({ error: 'clienteId inválido' });
    return;
  }
  const { productoId, cantidad } = req.body as { productoId: number; cantidad: number };

  const result = carritoService.actualizarCantidad(clienteId, productoId, cantidad);
  if (!result.success) {
    const code = result.message.includes('no encontrado') ? 404 : 400;
    res.status(code).json({ error: result.message });
    return;
  }

  res.json({ message: result.message });
});

router.get('/:clienteId/total', (req: Request, res: Response) => {
  const clienteId = parseId(req.params.clienteId);
  if (clienteId === null) {
    res.status(400).json({ error: 'clienteId inválido' });
    return;
  }
  const total = carritoService.calcularTotal(clienteId);
  res.json({ total });
});

export default router;
