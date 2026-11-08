import { Router, Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';
import { requireAuth, requireRol } from '../middleware/auth';

const router = Router();

// RF-09 (CA-24 y CA-26): métricas solo para la administradora.
router.get(
  '/metricas',
  requireAuth,
  requireRol('admin'),
  (_req: Request, res: Response) => {
    res.json(dashboardService.obtenerMetricas());
  }
);

export default router;
