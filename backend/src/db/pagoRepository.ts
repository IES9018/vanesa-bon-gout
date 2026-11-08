import { getPool, isDbEnabled } from './pool';
import { Pago } from '../types';

// Repositorio async de pagos (RF-04) sobre PostgreSQL.
// Devuelve null cuando la DB no está habilitada para que las rutas hagan
// fallback al seed en memoria (pagoService), igual que los demás repositorios.

function mapRow(row: {
  id: number;
  pedido_id: number;
  metodo: 'mercadopago' | 'transferencia';
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado';
  monto: string | number;
  referencia_externa: string | null;
  creado_en: Date;
}): Pago {
  return {
    id: row.id,
    pedidoId: row.pedido_id,
    metodo: row.metodo,
    estado: row.estado,
    monto: Number(row.monto),
    referenciaExterna: row.referencia_externa,
    creadoEn: row.creado_en,
  };
}

export async function dbListarPagos(pedidoId?: number): Promise<Pago[] | null> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = pedidoId
      ? await pool.query(
          `SELECT id, pedido_id, metodo, estado, monto, referencia_externa, creado_en
           FROM pagos WHERE pedido_id = $1 ORDER BY id DESC LIMIT 50`,
          [pedidoId]
        )
      : await pool.query(
          `SELECT id, pedido_id, metodo, estado, monto, referencia_externa, creado_en
           FROM pagos ORDER BY id DESC LIMIT 50`
        );
    return r.rows.map(mapRow);
  } catch {
    return null;
  }
}

export async function dbObtenerPagoPorId(id: number): Promise<Pago | null | undefined> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = await pool.query(
      `SELECT id, pedido_id, metodo, estado, monto, referencia_externa, creado_en
       FROM pagos WHERE id = $1`,
      [id]
    );
    if (r.rows.length === 0) return undefined;
    return mapRow(r.rows[0]);
  } catch {
    return null;
  }
}

// Busca un pago vigente (pendiente o aprobado) para evitar duplicados.
export async function dbObtenerPagoVigentePorPedido(
  pedidoId: number
): Promise<Pago | null | undefined> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = await pool.query(
      `SELECT id, pedido_id, metodo, estado, monto, referencia_externa, creado_en
       FROM pagos WHERE pedido_id = $1 AND estado IN ('pendiente', 'aprobado')
       ORDER BY id DESC LIMIT 1`,
      [pedidoId]
    );
    if (r.rows.length === 0) return undefined;
    return mapRow(r.rows[0]);
  } catch {
    return null;
  }
}

export async function dbCrearPago(
  pedidoId: number,
  metodo: 'mercadopago' | 'transferencia',
  monto: number,
  referenciaExterna: string
): Promise<Pago | null> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = await pool.query(
      `INSERT INTO pagos (pedido_id, metodo, estado, monto, referencia_externa)
       VALUES ($1, $2, 'pendiente', $3, $4)
       RETURNING id, pedido_id, metodo, estado, monto, referencia_externa, creado_en`,
      [pedidoId, metodo, monto, referenciaExterna]
    );
    return mapRow(r.rows[0]);
  } catch {
    return null;
  }
}

export async function dbConfirmarPago(
  id: number,
  aprobado: boolean
): Promise<Pago | null | undefined> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = await pool.query(
      `UPDATE pagos SET estado = $1
       WHERE id = $2 AND estado = 'pendiente'
       RETURNING id, pedido_id, metodo, estado, monto, referencia_externa, creado_en`,
      [aprobado ? 'aprobado' : 'rechazado', id]
    );
    if (r.rows.length === 0) return undefined;
    return mapRow(r.rows[0]);
  } catch {
    return null;
  }
}
