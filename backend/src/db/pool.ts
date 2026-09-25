import { Pool } from 'pg';

// Capa de conexión PostgreSQL (ADR-003, DT-01).
// Diseño: el backend opera con seed en memoria por defecto (tests y CI sin
// postgres) y usa postgres real cuando DATABASE_URL está definido y
// USE_DB !== 'false' y NODE_ENV !== 'test'. Así los 31 tests existentes
// siguen verdes sin servicio externo, y en docker/producción hay persistencia
// real con concurrencia. Ningún secreto se hardcodea (arnés v3, T-01).
let pool: Pool | null = null;

export function isDbEnabled(): boolean {
  if (process.env['NODE_ENV'] === 'test') return false;
  if (process.env['USE_DB'] === 'false') return false;
  return Boolean(process.env['DATABASE_URL']);
}

export function getPool(): Pool | null {
  if (!isDbEnabled()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env['DATABASE_URL'],
      max: 10,
      idleTimeoutMillis: 30000,
    });
    pool.on('error', (err) => {
      // No tumbar el proceso: se loguea y se sigue con fallback en memoria.
      console.error('[db] pool error (fallback a memoria):', err.message);
    });
  }
  return pool;
}

export async function dbHealth(): Promise<'postgres' | 'memoria'> {
  const p = getPool();
  if (!p) return 'memoria';
  try {
    await p.query('SELECT 1');
    return 'postgres';
  } catch {
    return 'memoria';
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
