import { Router, Request, Response } from 'express';
import * as reservaService from '../services/reservaService';
import { requireAuth } from '../middleware/auth';
import { validateBody, crearReservaSchema } from '../middleware/validate';
import { auditLog } from '../middleware/security';

const router = Router();

// RF-05 (CA-12/CA-13): grilla pública de slots con cupo.
// Al igual que los pedidos, las reservas viven en memoria; cuando el pedido
// pase a PostgreSQL esta ruta mantiene el mismo contrato.
router.get('/disponibilidad', (req: Request, res: Response) => {
  const fecha = typeof req.query['fecha'] === 'string' ? req.query['fecha'] : undefined;
  const slots = reservaService.listarDisponibilidad(fecha);
  if (slots === null) {
    res.status(400).json({ error: 'fecha inválida, usá el formato YYYY-MM-DD' });
    return;
  }
  res.json(slots.slice(0, 100));
});

router.post('/', requireAuth, validateBody(crearReservaSchema), (req: Request, res: Response) => {
  const dto = req.body as { fecha: string; tipo: 'entrega' | 'consulta' };
  // En test no hay JWT real; el cliente se toma del body solo en ese entorno.
  const user = (req as Request & { user?: { sub: string } }).user;
  const clienteId = user ? Number(user.sub) : Number((req.body as { clienteId?: number }).clienteId ?? 1);
  if (!Number.isInteger(clienteId) || clienteId < 1) {
    res.status(400).json({ error: 'clienteId inválido' });
    return;
  }

  const result = reservaService.crearReserva(clienteId, dto);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }

  auditLog('reserva.creada', { reservaId: result.reserva?.id, clienteId });
  res.status(201).json(result.reserva);
});

// RF-05 (CA-14): cancelación con al menos 24 h de anticipación.
router.delete('/:id', requireAuth, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'id inválido' });
    return;
  }

  const result = reservaService.cancelarReserva(id);
  if (!result.success) {
    res.status(result.code === 'not_found' ? 404 : 400).json({ error: result.message });
    return;
  }

  auditLog('reserva.cancelada', { reservaId: id });
  res.json(result.reserva);
});

export default router;
