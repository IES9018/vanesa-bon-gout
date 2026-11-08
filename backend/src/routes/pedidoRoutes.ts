import { Router, Request, Response } from 'express';
import * as pedidoService from '../services/pedidoService';
import * as testimonioService from '../services/testimonioService';
import * as pagoService from '../services/pagoService';
import { dbObtenerTestimonioPorPedido, dbCrearTestimonio } from '../db/testimonioRepository';
import { dbObtenerPagoVigentePorPedido, dbCrearPago } from '../db/pagoRepository';
import { requireAuth, requireRol } from '../middleware/auth';
import {
  validateBody,
  crearPedidoSchema,
  cambiarEstadoSchema,
  crearTestimonioSchema,
  crearPagoSchema,
  parseId,
} from '../middleware/validate';
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

// RF-04 (CA-09/CA-10): crea el pago del pedido en modo sandbox.
router.post(
  '/:id/pagos',
  requireAuth,
  validateBody(crearPagoSchema),
  (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'id inválido' });
      return;
    }
    const dto = req.body as {
      metodo: 'mercadopago' | 'transferencia';
      referenciaComprobante?: string;
    };

    const pedido = pedidoService.obtenerPedidoPorId(id);
    if (!pedido) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    if (pedido.estado === 'cancelado') {
      res.status(400).json({ error: 'No se puede pagar un pedido cancelado' });
      return;
    }
    if (dto.metodo === 'transferencia' && !dto.referenciaComprobante?.trim()) {
      res.status(400).json({ error: 'La transferencia requiere la referencia del comprobante' });
      return;
    }

    void (async (): Promise<void> => {
      const vigente = await dbObtenerPagoVigentePorPedido(id);
      if (vigente) {
        res.status(400).json({ error: `El pedido ya tiene un pago ${vigente.estado}` });
        return;
      }
      if (vigente === null) {
        // DB no habilitada: se opera sobre el seed en memoria.
        const result = pagoService.crearPago(id, dto);
        if (!result.success) {
          res.status(400).json({ error: result.message });
          return;
        }
        auditLog('pago.creado', { pedidoId: id, pagoId: result.pago?.id, metodo: dto.metodo });
        res.status(201).json(result.pago);
        return;
      }

      const referencia =
        dto.metodo === 'mercadopago'
          ? `MP-SANDBOX-${id}-${Date.now()}`
          : (dto.referenciaComprobante as string).trim();
      const creado = await dbCrearPago(id, dto.metodo, pedido.total, referencia);
      if (!creado) {
        res.status(500).json({ error: 'No se pudo registrar el pago' });
        return;
      }
      auditLog('pago.creado', { pedidoId: id, pagoId: creado.id, metodo: dto.metodo });
      res.status(201).json(creado);
    })();
  }
);

// RF-07 (CA-18..CA-20): testimonio sobre un pedido entregado, 1 por pedido.
router.post(
  '/:id/testimonios',
  requireAuth,
  validateBody(crearTestimonioSchema),
  (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'id inválido' });
      return;
    }
    const dto = req.body as { comentario: string; calificacion: 1 | 2 | 3 | 4 | 5 };

    const pedido = pedidoService.obtenerPedidoPorId(id);
    if (!pedido) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    if (pedido.estado !== 'entregado') {
      res.status(400).json({ error: 'Solo se puede dejar testimonio de un pedido entregado' });
      return;
    }

    void (async (): Promise<void> => {
      const existente = await dbObtenerTestimonioPorPedido(id);
      if (existente === undefined) {
        res.status(400).json({ error: 'Ya existe un testimonio para este pedido' });
        return;
      }
      if (existente === null) {
        // DB no habilitada: se opera sobre el seed en memoria.
        const result = testimonioService.crearTestimonio(id, dto);
        if (!result.success) {
          res.status(400).json({ error: result.message });
          return;
        }
        auditLog('testimonio.creado', { pedidoId: id, testimonioId: result.testimonio?.id });
        res.status(201).json(result.testimonio);
        return;
      }

      const creado = await dbCrearTestimonio(id, pedido.clienteId, dto.comentario, dto.calificacion);
      if (!creado) {
        res.status(500).json({ error: 'No se pudo registrar el testimonio' });
        return;
      }
      auditLog('testimonio.creado', { pedidoId: id, testimonioId: creado.id });
      res.status(201).json(creado);
    })();
  }
);

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
      res.status(result.code === 'not_found' ? 404 : 400).json({ error: result.message });
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
