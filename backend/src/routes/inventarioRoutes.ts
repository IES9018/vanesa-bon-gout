import { Router, Request, Response } from 'express';
import * as inventarioService from '../services/inventarioService';
import {
  dbListarInventario,
  dbObtenerInventarioPorId,
  dbRegistrarMovimiento,
} from '../db/inventarioRepository';
import { requireAuth, requireRol } from '../middleware/auth';
import {
  validateBody,
  movimientoInventarioSchema,
  parseId,
} from '../middleware/validate';
import { auditLog } from '../middleware/security';

const router = Router();

// RF-06 (SPEC v6 §6.6): la gestión de inventario es interna (T-04).
// GET /api/inventario?soloAlertas=true — lista con fallback a memoria.
router.get('/', requireAuth, requireRol('admin', 'empleado'), (req: Request, res: Response) => {
  const soloAlertas = String(req.query['soloAlertas'] ?? 'false') === 'true';
  void (async (): Promise<void> => {
    const db = await dbListarInventario(soloAlertas);
    const base = db ?? inventarioService.listar(soloAlertas);
    res.json(base.slice(0, 100));
  })();
});

// POST /api/inventario/:id/movimientos — entrada | salida | ajuste (CA-15..CA-17).
router.post(
  '/:id/movimientos',
  requireAuth,
  requireRol('admin', 'empleado'),
  validateBody(movimientoInventarioSchema),
  (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'id inválido' });
      return;
    }
    const dto = req.body as {
      tipo: 'entrada' | 'salida' | 'ajuste';
      cantidad: number;
      motivo: string;
      pedidoId?: number | null;
    };

    void (async (): Promise<void> => {
      const existente = await dbObtenerInventarioPorId(id);
      if (existente === undefined) {
        res.status(404).json({ error: 'Ingrediente no encontrado' });
        return;
      }

      const dbResult = await dbRegistrarMovimiento(
        id,
        dto.tipo,
        dto.cantidad,
        dto.motivo,
        dto.pedidoId ?? null
      );

      if (dbResult === null) {
        // DB no habilitada: se opera sobre el seed en memoria.
        const result = inventarioService.registrarMovimiento(id, dto);
        if (!result.success) {
          const status = result.message === 'Ingrediente no encontrado' ? 404 : 400;
          res.status(status).json({ error: result.message });
          return;
        }
        auditLog('inventario.movimiento', {
          inventarioId: id,
          tipo: dto.tipo,
          cantidad: dto.cantidad,
          usuario: (req as Request & { user?: { sub: string } }).user?.sub ?? 'test',
        });
        res.status(201).json(result.movimiento);
        return;
      }

      if (!dbResult.ok) {
        res.status(dbResult.reason === 'not_found' ? 404 : 400).json({
          error: dbResult.message,
        });
        return;
      }

      auditLog('inventario.movimiento', {
        inventarioId: id,
        tipo: dto.tipo,
        cantidad: dto.cantidad,
        usuario: (req as Request & { user?: { sub: string } }).user?.sub ?? 'test',
      });
      res.status(201).json(dbResult.movimiento);
    })();
  }
);

export default router;
