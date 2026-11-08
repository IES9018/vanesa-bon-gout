import { getPool, isDbEnabled } from './pool';
import { Inventario, MovimientoInventario } from '../types';

// Repositorio async de inventario (RF-06) sobre PostgreSQL.
// Devuelve null cuando la DB no está habilitada para que las rutas hagan
// fallback al seed en memoria (inventarioService), igual que productoRepository.

function mapInventario(row: {
  id: number;
  nombre_ingrediente: string;
  cantidad_disponible: string | number;
  unidad_medida: string;
  punto_reorden: string | number;
}): Inventario {
  const cantidadDisponible = Number(row.cantidad_disponible);
  const puntoReorden = Number(row.punto_reorden);
  return {
    id: row.id,
    nombreIngrediente: row.nombre_ingrediente,
    cantidadDisponible,
    unidadMedida: row.unidad_medida,
    puntoReorden,
    requiereReposicion: cantidadDisponible <= puntoReorden,
  };
}

function mapMovimiento(row: {
  id: number;
  inventario_id: number;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: string | number;
  motivo: string;
  pedido_id: number | null;
  creado_en: Date;
}): MovimientoInventario {
  return {
    id: row.id,
    inventarioId: row.inventario_id,
    tipo: row.tipo,
    cantidad: Number(row.cantidad),
    motivo: row.motivo,
    pedidoId: row.pedido_id,
    creadoEn: row.creado_en,
  };
}

export async function dbListarInventario(soloAlertas = false): Promise<Inventario[] | null> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = await pool.query(
      `SELECT id, nombre_ingrediente, cantidad_disponible, unidad_medida, punto_reorden
       FROM inventario
       ${soloAlertas ? 'WHERE cantidad_disponible <= punto_reorden' : ''}
       ORDER BY id`
    );
    return r.rows.map(mapInventario);
  } catch {
    return null;
  }
}

export async function dbObtenerInventarioPorId(
  id: number
): Promise<Inventario | null | undefined> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = await pool.query(
      `SELECT id, nombre_ingrediente, cantidad_disponible, unidad_medida, punto_reorden
       FROM inventario WHERE id = $1`,
      [id]
    );
    if (r.rows.length === 0) return undefined;
    return mapInventario(r.rows[0]);
  } catch {
    return null;
  }
}

// Transacción: bloquea la fila, valida stock, actualiza y registra el
// movimiento. Devuelve null si la DB no está disponible (fallback memoria).
export async function dbRegistrarMovimiento(
  inventarioId: number,
  tipo: 'entrada' | 'salida' | 'ajuste',
  cantidad: number,
  motivo: string,
  pedidoId: number | null
): Promise<
  | { ok: true; movimiento: MovimientoInventario; stock: number }
  | { ok: false; reason: 'not_found' | 'sin_stock'; message: string }
  | null
> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const actual = await client.query(
      `SELECT id, nombre_ingrediente, cantidad_disponible, unidad_medida, punto_reorden
       FROM inventario WHERE id = $1 FOR UPDATE`,
      [inventarioId]
    );
    if (actual.rows.length === 0) {
      await client.query('ROLLBACK');
      return { ok: false, reason: 'not_found', message: 'Ingrediente no encontrado' };
    }

    const item = mapInventario(actual.rows[0]);
    let nuevaCantidad: number;
    if (tipo === 'entrada') {
      nuevaCantidad = item.cantidadDisponible + cantidad;
    } else if (tipo === 'salida') {
      if (cantidad > item.cantidadDisponible) {
        await client.query('ROLLBACK');
        return {
          ok: false,
          reason: 'sin_stock',
          message: `Stock insuficiente de ${item.nombreIngrediente}. Disponible: ${item.cantidadDisponible} ${item.unidadMedida}`,
        };
      }
      nuevaCantidad = item.cantidadDisponible - cantidad;
    } else {
      nuevaCantidad = cantidad;
    }

    await client.query('UPDATE inventario SET cantidad_disponible = $1 WHERE id = $2', [
      nuevaCantidad,
      inventarioId,
    ]);

    const mov = await client.query(
      `INSERT INTO movimientos_inventario (inventario_id, tipo, cantidad, motivo, pedido_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, inventario_id, tipo, cantidad, motivo, pedido_id, creado_en`,
      [inventarioId, tipo, cantidad, motivo, pedidoId]
    );

    await client.query('COMMIT');
    return { ok: true, movimiento: mapMovimiento(mov.rows[0]), stock: nuevaCantidad };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
