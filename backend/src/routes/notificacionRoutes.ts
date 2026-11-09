import { Router, Request, Response } from 'express';
import * as notificacionService from '../services/notificacionService';
import { requireAuth, requireRol } from '../middleware/auth';
import { auditLog } from '../middleware/security';

const router = Router();

const ESTADOS = ['en_cola', 'enviada', 'fallida'] as const;
type EstadoNotificacion = (typeof ESTADOS)[number];

// RF-08 (CA-21): la administradora audita la cola.
router.get('/', requireAuth, requireRol('admin'), (req: Request, res: Response) => {
  const estado = req.query['estado'];
  if (estado !== undefined && !ESTADOS.includes(estado as EstadoNotificacion)) {
    res.status(400).json({ error: 'estado inválido' });
    return;
  }
  const lista = notificacionService.listarNotificaciones(estado as EstadoNotificacion | undefined);
  res.json(lista.slice(0, 100));
});

// RF-08 (CA-22/CA-23): worker simulado. En producción lo dispara un cron/cola.
router.post('/procesar', requireAuth, requireRol('admin'), (_req: Request, res: Response) => {
  const resumen = notificacionService.procesarCola();
  auditLog('notificaciones.procesadas', { ...resumen });
  res.json(resumen);
});

export default router;
