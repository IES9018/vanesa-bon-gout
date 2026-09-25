import { Router, Request, Response } from 'express';
import * as pedidoService from '../services/pedidoService';
import { requireAuth, requireRol } from '../middleware/auth';
import { validateBody, crearPedidoSchema, cambiarEstadoSchema, parseId } from '../middleware/validate';
import { auditLog } from '../middleware/security';

const router = Router();

// T-04: el listado global exige gestión; el cliente usa /cliente/:clienteId.
router.get('/', requireAuth, requireRol('admin', 'empleado'), (_req: Request, res: Response) => {
  const pedidos = pedidoService.obtenerPedidos();
  res.json(pedidos.slice(0, 50));
});

router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'id inválido' });
    return;
  }
  const pedido = pedidoService.obtenerPedidoPorId(id);
  if (!pedido) {
    res.status(404).json({ error: 'Pedido no encontrado' });
    return;
  }
  res.json(pedido);
});

router.get('/cliente/:clienteId', requireAuth, (req: Request, res: Response) => {
  const clienteId = parseId(req.params.clienteId);
  if (clienteId === null) {
    res.status(400).json({ error: 'clienteId inválido' });
    return;
  }
  const pedidos = pedidoService.obtenerPedidosPorCliente(clienteId);
  res.json(pedidos.slice(0, 50));
});

// T-02: checkout validado con zod antes de la lógica de negocio.
router.post('/', requireAuth, validateBody(crearPedidoSchema), (req: Request, res: Response) => {
  const dto = req.body as {
    clienteId: number;
    fechaEntrega: string;
    metodoPago: 'mercadopago' | 'transferencia' | 'efectivo';
    observaciones: string;
    items: Array<{ productoId: number; cantidad: number; personalizaciones: string }>;
  };

  const result = pedidoService.crearPedido(dto);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }

  res.status(201).json(result.pedido);
});

// T-01 + T-06: solo admin/empleado con JWT. T-03: auditoría del cambio.
router.patch(
  '/:id/estado',
  requireAuth,
  requireRol('admin', 'empleado'),
  validateBody(cambiarEstadoSchema),
  (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'id inválido' });
      return;
    }
    const { estado } = req.body as { estado: 'pendiente' | 'en_produccion' | 'en_entrega' | 'entregado' | 'cancelado' };
    const anterior = pedidoService.obtenerPedidoPorId(id)?.estado;

    const result = pedidoService.cambiarEstado(id, estado);
    if (!result.success) {
      res.status(404).json({ error: result.message });
      return;
    }

    auditLog('pedido.estado', {
      pedidoId: id,
      anterior: anterior ?? 'desconocido',
      nuevo: estado,
      usuario: (req as Request & { user?: { sub: string; rol: string } }).user?.sub ?? 'test',
    });
    res.json({ message: result.message });
  }
);

export default router;
