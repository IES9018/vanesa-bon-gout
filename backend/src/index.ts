import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = Number(process.env['PORT']) || 3001;

// En Render (y Docker) el proceso debe escuchar en 0.0.0.0, no solo localhost.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Bon Gout corriendo en puerto ${PORT}`);
});
