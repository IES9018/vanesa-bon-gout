import { Router, Request, Response } from 'express';
import * as carritoService from '../services/carritoService';

const router = Router();

router.get('/:clienteId', (req: Request, res: Response) => {
  const clienteId = parseInt(req.params.clienteId, 10);
  const carrito = carritoService.obtenerCarrito(clienteId);
  res.json(carrito);
});

router.post('/:clienteId/agregar', (req: Request, res: Response) => {
  const clienteId = parseInt(req.params.clienteId, 10);
  const { productoId, cantidad, personalizaciones } = req.body;

  if (!productoId || !cantidad) {
    res.status(400).json({ error: 'productoId y cantidad son requeridos' });
    return;
  }

  const result = carritoService.agregarItem(
    clienteId,
    productoId,
    cantidad,
    personalizaciones || ''
  );

  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }

  res.json({ message: result.message, carrito: carritoService.obtenerCarrito(clienteId) });
});

router.delete('/:clienteId/eliminar/:productoId', (req: Request, res: Response) => {
  const clienteId = parseInt(req.params.clienteId, 10);
  const productoId = parseInt(req.params.productoId, 10);

  const result = carritoService.eliminarItem(clienteId, productoId);
  if (!result.success) {
    res.status(404).json({ error: result.message });
    return;
  }

  res.json({ message: result.message });
});

router.put('/:clienteId/actualizar', (req: Request, res: Response) => {
  const clienteId = parseInt(req.params.clienteId, 10);
  const { productoId, cantidad } = req.body;

  if (!productoId || cantidad === undefined) {
    res.status(400).json({ error: 'productoId y cantidad son requeridos' });
    return;
  }

  const result = carritoService.actualizarCantidad(clienteId, productoId, cantidad);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }

  res.json({ message: result.message });
});

router.get('/:clienteId/total', (req: Request, res: Response) => {
  const clienteId = parseInt(req.params.clienteId, 10);
  const total = carritoService.calcularTotal(clienteId);
  res.json({ total });
});

export default router;
