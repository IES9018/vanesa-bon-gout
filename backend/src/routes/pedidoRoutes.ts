import { Router, Request, Response } from 'express';
import * as pedidoService from '../services/pedidoService';
import { CrearPedidoDTO } from '../types';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const pedidos = pedidoService.obtenerPedidos();
  res.json(pedidos);
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const pedido = pedidoService.obtenerPedidoPorId(id);
  if (!pedido) {
    res.status(404).json({ error: 'Pedido no encontrado' });
    return;
  }
  res.json(pedido);
});

router.get('/cliente/:clienteId', (req: Request, res: Response) => {
  const clienteId = parseInt(req.params.clienteId, 10);
  const pedidos = pedidoService.obtenerPedidosPorCliente(clienteId);
  res.json(pedidos);
});

router.post('/', (req: Request, res: Response) => {
  const dto: CrearPedidoDTO = req.body;

  if (!dto.clienteId || !dto.fechaEntrega || !dto.metodoPago || !dto.items) {
    res.status(400).json({ error: 'clienteId, fechaEntrega, metodoPago e items son requeridos' });
    return;
  }

  const result = pedidoService.crearPedido(dto);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }

  res.status(201).json(result.pedido);
});

router.patch('/:id/estado', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { estado } = req.body;

  if (!estado) {
    res.status(400).json({ error: 'estado es requerido' });
    return;
  }

  const result = pedidoService.cambiarEstado(id, estado);
  if (!result.success) {
    res.status(404).json({ error: result.message });
    return;
  }

  res.json({ message: result.message });
});

export default router;
