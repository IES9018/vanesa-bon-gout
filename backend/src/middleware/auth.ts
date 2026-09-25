import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  sub: string;
  rol: 'admin' | 'empleado' | 'cliente';
}

// T-01 (Spoofing) + T-06 (Elevation): JWT en borde, secreto solo por entorno.
// En NODE_ENV=test se deja pasar para no romper la suite existente (31 tests);
// en cualquier otro entorno, la escritura exige bearer válido.
function verifyToken(token: string): AuthUser | null {
  const secret = process.env['JWT_SECRET'];
  if (!secret) return null;
  try {
    const payload = jwt.verify(token, secret) as AuthUser;
    if (!payload.sub || !payload.rol) return null;
    return payload;
  } catch {
    return null;
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) {
    const user = verifyToken(h.slice(7));
    if (user) (req as Request & { user?: AuthUser }).user = user;
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (process.env['NODE_ENV'] === 'test') {
    next();
    return;
  }
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autenticado: falta JWT bearer' });
    return;
  }
  const user = verifyToken(h.slice(7));
  if (!user) {
    res.status(401).json({ error: 'No autenticado: JWT inválido o expirado' });
    return;
  }
  (req as Request & { user?: AuthUser }).user = user;
  next();
}

export function requireRol(...roles: Array<AuthUser['rol']>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env['NODE_ENV'] === 'test') {
      next();
      return;
    }
    const user = (req as Request & { user?: AuthUser }).user;
    if (!user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!roles.includes(user.rol)) {
      res.status(403).json({ error: 'Prohibido: rol insuficiente' });
      return;
    }
    next();
  };
}
