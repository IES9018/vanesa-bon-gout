// Emisor de JWT para admin/empleado (sin nuevo endpoint: no rompe los 5
// contratos OpenAPI del TP4). Uso:
//   JWT_SECRET=xxx npm run token -- admin
// Imprime un bearer válido por 12h para probar PATCH /api/pedidos/:id/estado.
import jwt from 'jsonwebtoken';

const rol = (process.argv[2] as string) || 'admin';
const secret = process.env['JWT_SECRET'];
if (!secret) {
  console.error('Definir JWT_SECRET en el entorno (ver docker/.env.example)');
  process.exit(1);
}
if (rol !== 'admin' && rol !== 'empleado') {
  console.error('Rol debe ser admin o empleado');
  process.exit(1);
}
const token = jwt.sign({ sub: 'gestion-bongout', rol }, secret, { expiresIn: '12h' });
console.log(token);
