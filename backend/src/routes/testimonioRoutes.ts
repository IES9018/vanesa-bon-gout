import { Router, Request, Response } from 'express';
import * as testimonioService from '../services/testimonioService';
import {
  dbListarTestimonios,
  dbModerarTestimonio,
} from '../db/testimonioRepository';
import { requireAuth, requireRol } from '../middleware/auth';
import { validateBody, moderarTestimonioSchema, parseId } from '../middleware/validate';
import { auditLog } from '../middleware/security';

const router = Router();

// RF-07 (CA-19): el catálogo solo muestra testimonios aprobados.
router.get('/', (_req: Request, res: Response) => {
  void (async (): Promise<void> => {
    const db = await dbListarTestimonios('aprobado');
    const base = db ?? testimonioService.listarAprobados();
    res.json(base.slice(0, 50));
  })();
});

// RF-07 (CA-19): la administradora aprueba o rechaza.
router.patch(
  '/:id',
  requireAuth,
  requireRol('admin'),
  validateBody(moderarTestimonioSchema),
  (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'id inválido' });
      return;
    }
    const { estado } = req.body as { estado: 'aprobado' | 'rechazado' };

    void (async (): Promise<void> => {
      const dbResult = await dbModerarTestimonio(id, estado);
      if (dbResult === null) {
        const result = testimonioService.moderarTestimonio(id, estado);
        if (!result.success) {
          const status = result.message === 'Testimonio no encontrado' ? 404 : 400;
          res.status(status).json({ error: result.message });
          return;
        }
        auditLog('testimonio.moderado', { testimonioId: id, estado });
        res.json(result.testimonio);
        return;
      }

      if (dbResult === undefined) {
        res.status(404).json({ error: 'Testimonio no encontrado o ya moderado' });
        return;
      }

      auditLog('testimonio.moderado', { testimonioId: id, estado });
      res.json(dbResult);
    })();
  }
);

export default router;
