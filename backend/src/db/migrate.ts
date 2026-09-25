// Script de migración: aplica database/schema.sql + seed mínimo.
// Uso: npm run db:migrate (requiere DATABASE_URL). Idempotente.
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

async function main(): Promise<void> {
  const url = process.env['DATABASE_URL'];
  if (!url) {
    console.error('DATABASE_URL no definido. Ver docker/.env.example');
    process.exit(1);
  }
  const schemaPath = path.resolve(__dirname, '..', '..', '..', 'database', 'schema.sql');
  // Cuando corre compilado (dist/db/migrate.js) el schema está en ../../database
  const altPath = path.resolve(process.cwd(), '..', 'database', 'schema.sql');
  const file = fs.existsSync(schemaPath) ? schemaPath : altPath;
  const sql = fs.readFileSync(file, 'utf8');
  const pool = new Pool({ connectionString: url });
  try {
    await pool.query(sql);
    // Seed mínimo si la tabla está vacía (mismo catálogo que el seed en memoria).
    const count = await pool.query('SELECT COUNT(*)::int AS n FROM productos');
    if (count.rows[0].n === 0) {
      await pool.query(
        `INSERT INTO productos (nombre, descripcion, precio_base, categoria, imagen, activo, stock) VALUES
        ('Torta de chocolate','Torta artesanal de chocolate amargo con ganache',4500,'Tortas','/img/torta-chocolate.jpg',true,5),
        ('Tarta de frutas','Tarta de frutas frescas de temporada',3800,'Tortas','/img/tarta-frutas.jpg',true,3),
        ('Alfajor x12','Docena de alfajores artesanales de maicena',2200,'Alfajores','/img/alfajor-x12.jpg',true,20),
        ('Jugo natural','Jugo natural de temporada 500ml',800,'Bebidas','/img/jugo-natural.jpg',true,15),
        ('Facturas x6','Media docena de facturas surtidas',1800,'Facturas','/img/facturas-x6.jpg',false,0)`
      );
    }
    console.log('Migración OK: schema aplicado + seed verificado');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migración fallida:', err.message);
  process.exit(1);
});
