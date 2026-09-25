import { Request, Response, NextFunction } from 'express';

// T-05 (DoS): rate limiting en memoria (ventana fija por IP).
// Sin dependencias nuevas: suficiente para MVP; en producción horizontal
// se reemplazaría por Redis (documentado en threat-model).
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxPerMinute = 100) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // No limitar tests para no falsear la suite.
    if (process.env['NODE_ENV'] === 'test') {
      next();
      return;
    }
    const ip = (req.ip || req.socket.remoteAddress || 'unknown').toString();
    const now = Date.now();
    const entry = hits.get(ip);
    if (!entry || now > entry.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + 60000 });
      next();
      return;
    }
    entry.count += 1;
    if (entry.count > maxPerMinute) {
      res.status(429).json({ error: 'Demasiadas solicitudes, reintente en un minuto' });
      return;
    }
    next();
  };
}

// T-03 (Repudiation): auditoría estructurada de cambios de estado.
export function auditLog(evento: string, detalle: Record<string, unknown>): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    evento,
    ...detalle,
  });
  console.log(`[auditoria] ${line}`);
}

// Cabeceras mínimas de seguridad sin dependencias (complemento de helmet
// cuando se instale en producción).
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
}
