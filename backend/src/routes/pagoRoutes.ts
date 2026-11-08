import { Router, Request, Response } from 'express';
import * as pagoService from '../services/pagoService';
import { dbConfirmarPago } from '../db/pagoRepository';
import { requireAuth, requireRol } from '../middleware/auth';
import { validateBody, confirmarPagoSchema, parseId } from '../middleware/validate';
import { auditLog } from '../middleware/security';

const router = Router();

// RF-04 (CA-09/CA-10): confirmación del pago. En sandbox representa el webhook
// de MercadoPago; para transferencias es la aprobación manual de la
// administradora. Nunca lo puede hacer el cliente (T-06).
router.post(
  '/:id/confirmar',
  requireAuth,
  requireRol('admin'),
  validateBody(confirmarPagoSchema),
  (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'id inválido' });
      return;
    }
    const { aprobado, motivo } = req.body as { aprobado: boolean; motivo?: string };

    void (async (): Promise<void> => {
      const dbResult = await dbConfirmarPago(id, aprobado);
      if (dbResult === null) {
        const result = pagoService.confirmarPago(id, aprobado, motivo);
        if (!result.success) {
          const status = result.message === 'Pago no encontrado' ? 404 : 400;
          res.status(status).json({ error: result.message });
          return;
        }
        auditLog('pago.confirmado', {
          pagoId: id,
          aprobado,
          usuario: (req as Request & { user?: { sub: string } }).user?.sub ?? 'test',
        });
        res.json(result.pago);
        return;
      }

      if (dbResult === undefined) {
        res.status(404).json({ error: 'Pago no encontrado o ya confirmado' });
        return;
      }

      auditLog('pago.confirmado', {
        pagoId: id,
        aprobado,
        usuario: (req as Request & { user?: { sub: string } }).user?.sub ?? 'test',
      });
      res.json(dbResult);
    })();
  }
);

export default router;
