import { getPool, isDbEnabled } from './pool';
import { Testimonio } from '../types';

// Repositorio async de testimonios (RF-07) sobre PostgreSQL.
// Devuelve null cuando la DB no está habilitada para que las rutas hagan
// fallback al seed en memoria (testimonioService).

function mapRow(row: {
  id: number;
  cliente_id: number;
  pedido_id: number;
  comentario: string;
  calificacion: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  creado_en: Date;
}): Testimonio {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    pedidoId: row.pedido_id,
    comentario: row.comentario,
    calificacion: row.calificacion as Testimonio['calificacion'],
    estado: row.estado,
    creadoEn: row.creado_en,
  };
}

export async function dbListarTestimonios(
  estado?: 'aprobado' | 'pendiente'
): Promise<Testimonio[] | null> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = estado
      ? await pool.query(
          `SELECT id, cliente_id, pedido_id, comentario, calificacion, estado, creado_en
           FROM testimonios WHERE estado = $1 ORDER BY creado_en DESC LIMIT 50`,
          [estado]
        )
      : await pool.query(
          `SELECT id, cliente_id, pedido_id, comentario, calificacion, estado, creado_en
           FROM testimonios ORDER BY creado_en DESC LIMIT 50`
        );
    return r.rows.map(mapRow);
  } catch {
    return null;
  }
}

export async function dbObtenerTestimonioPorPedido(
  pedidoId: number
): Promise<Testimonio | null | undefined> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = await pool.query(
      `SELECT id, cliente_id, pedido_id, comentario, calificacion, estado, creado_en
       FROM testimonios WHERE pedido_id = $1`,
      [pedidoId]
    );
    if (r.rows.length === 0) return undefined;
    return mapRow(r.rows[0]);
  } catch {
    return null;
  }
}

export async function dbCrearTestimonio(
  pedidoId: number,
  clienteId: number,
  comentario: string,
  calificacion: number
): Promise<Testimonio | null> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = await pool.query(
      `INSERT INTO testimonios (pedido_id, cliente_id, comentario, calificacion)
       VALUES ($1, $2, $3, $4)
       RETURNING id, cliente_id, pedido_id, comentario, calificacion, estado, creado_en`,
      [pedidoId, clienteId, comentario, calificacion]
    );
    return mapRow(r.rows[0]);
  } catch {
    return null;
  }
}

export async function dbModerarTestimonio(
  id: number,
  estado: 'aprobado' | 'rechazado'
): Promise<Testimonio | null | undefined> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = await pool.query(
      `UPDATE testimonios SET estado = $1
       WHERE id = $2 AND estado = 'pendiente'
       RETURNING id, cliente_id, pedido_id, comentario, calificacion, estado, creado_en`,
      [estado, id]
    );
    if (r.rows.length === 0) return undefined;
    return mapRow(r.rows[0]);
  } catch {
    return null;
  }
}
