import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

// T-02 (Tampering): validación/saneamiento en el borde con zod.
// Todo body que entra se valida antes de tocar servicios.
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: `Solicitud inválida: ${parsed.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ')}`,
      });
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export const agregarItemSchema = z.object({
  productoId: z.number().int().min(1).max(1000000),
  cantidad: z.number().int().min(1).max(100),
  personalizaciones: z.string().max(280).optional().default(''),
});

export const crearPedidoSchema = z.object({
  clienteId: z.number().int().min(1),
  fechaEntrega: z.string().datetime({ offset: true }),
  metodoPago: z.enum(['mercadopago', 'transferencia', 'efectivo']),
  observaciones: z.string().max(500).optional().default(''),
  items: z
    .array(
      z.object({
        productoId: z.number().int().min(1),
        cantidad: z.number().int().min(1).max(100),
        personalizaciones: z.string().max(280).optional().default(''),
      })
    )
    .min(1)
    .max(50),
});

export const cambiarEstadoSchema = z.object({
  estado: z.enum(['pendiente', 'en_produccion', 'en_entrega', 'entregado', 'cancelado']),
});

export function parseId(value: unknown): number | null {
  const n = typeof value === 'string' ? parseInt(value, 10) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > 1000000) return null;
  return n;
}

// T-05 (DoS): paginación por defecto + topes (listados máx 50, búsqueda máx 20).
export function parsePagination(query: unknown): { limit: number; offset: number } {
  const q = query as Record<string, unknown>;
  let limit = typeof q['limit'] === 'string' ? parseInt(q['limit'], 10) : 20;
  let offset = typeof q['offset'] === 'string' ? parseInt(q['offset'], 10) : 0;
  if (!Number.isInteger(limit) || limit < 1) limit = 20;
  if (!Number.isInteger(offset) || offset < 0) offset = 0;
  limit = Math.min(limit, 50);
  offset = Math.min(offset, 10000);
  return { limit, offset };
}

export function sanitizeTermino(value: unknown, max = 80): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim().slice(0, max);
  if (t.length === 0 || t.length > max) return null;
  return t;
}
