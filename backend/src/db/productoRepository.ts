import { getPool, isDbEnabled } from './pool';
import { Producto } from '../types';

function mapRow(row: {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: string | number;
  categoria: string;
  imagen: string | null;
  activo: boolean;
  stock: number;
}): Producto {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? '',
    precioBase: Number(row.precio_base),
    categoria: row.categoria,
    imagen: row.imagen ?? '',
    activo: row.activo,
    stock: row.stock,
  };
}

// Repositorio async sobre postgres. Devuelve null cuando la DB no está
// habilitada para que las rutas hagan fallback al seed en memoria
// (productoService). Mantiene los contratos OpenAPI sin cambios.
export async function dbObtenerTodos(): Promise<Producto[] | null> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = await pool.query(
      'SELECT id, nombre, descripcion, precio_base, categoria, imagen, activo, stock FROM productos WHERE activo = true ORDER BY id LIMIT 100'
    );
    return r.rows.map(mapRow);
  } catch {
    return null;
  }
}

export async function dbObtenerPorId(id: number): Promise<Producto | null | undefined> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  try {
    const r = await pool.query(
      'SELECT id, nombre, descripcion, precio_base, categoria, imagen, activo, stock FROM productos WHERE id = $1 AND activo = true',
      [id]
    );
    if (r.rows.length === 0) return undefined;
    return mapRow(r.rows[0]);
  } catch {
    return null;
  }
}

export async function dbBuscar(termino: string): Promise<Producto[] | null> {
  if (!isDbEnabled()) return null;
  const pool = getPool();
  if (!pool) return null;
  const q = `%${termino.slice(0, 80)}%`;
  try {
    const r = await pool.query(
      `SELECT id, nombre, descripcion, precio_base, categoria, imagen, activo, stock
       FROM productos WHERE activo = true AND (nombre ILIKE $1 OR descripcion ILIKE $1)
       ORDER BY id LIMIT 20`,
      [q]
    );
    return r.rows.map(mapRow);
  } catch {
    return null;
  }
}
