import request from 'supertest';
import app from '../app';

// Suite de integración HTTP (supertest sobre la app Express sin levantar puerto).
// Cubre el flujo crítico: salud, catálogo, carrito y creación de pedido.
describe('API Bon Gout (integración)', () => {
  it('GET /api/health responde ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/productos lista el catálogo', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/productos/:id devuelve 404 si no existe', async () => {
    const res = await request(app).get('/api/productos/9999');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no encontrado/i);
  });

  it('POST /api/carrito/:clienteId/agregar exige productoId y cantidad', async () => {
    const res = await request(app).post('/api/carrito/100/agregar').send({});
    expect(res.status).toBe(400);
  });

  it('flujo carrito: agregar item y calcular total', async () => {
    const add = await request(app)
      .post('/api/carrito/101/agregar')
      .send({ productoId: 1, cantidad: 2, personalizaciones: 'Feliz Cumpleaños' });
    expect(add.status).toBe(200);

    const total = await request(app).get('/api/carrito/101/total');
    expect(total.status).toBe(200);
    expect(total.body.total).toBe(9000); // 4500 x 2
  });

  it('POST /api/pedidos exige campos requeridos', async () => {
    const res = await request(app).post('/api/pedidos').send({ clienteId: 101 });
    expect(res.status).toBe(400);
  });

  it('POST /api/pedidos rechaza carrito vacío', async () => {
    const res = await request(app).post('/api/pedidos').send({
      clienteId: 999,
      fechaEntrega: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      metodoPago: 'mercadopago',
      observaciones: '',
      items: [{ productoId: 1, cantidad: 1, personalizaciones: '' }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/vacío/i);
  });

  it('POST /api/pedidos rechaza entrega con menos de 48h', async () => {
    await request(app)
      .post('/api/carrito/102/agregar')
      .send({ productoId: 2, cantidad: 1 });
    const res = await request(app).post('/api/pedidos').send({
      clienteId: 102,
      fechaEntrega: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      metodoPago: 'transferencia',
      observaciones: '',
      items: [{ productoId: 2, cantidad: 1, personalizaciones: '' }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/48 horas/i);
  });

  it('POST /api/pedidos crea pedido válido (201)', async () => {
    await request(app)
      .post('/api/carrito/103/agregar')
      .send({ productoId: 3, cantidad: 1 });
    const res = await request(app).post('/api/pedidos').send({
      clienteId: 103,
      fechaEntrega: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      metodoPago: 'mercadopago',
      observaciones: 'Sin nueces',
      items: [{ productoId: 3, cantidad: 1, personalizaciones: '' }],
    });
    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('pendiente');
    expect(res.body.total).toBe(2200);
  });

  it('PATCH /api/pedidos/:id/estado devuelve 404 si no existe', async () => {
    const res = await request(app)
      .patch('/api/pedidos/9999/estado')
      .send({ estado: 'en_produccion' });
    expect(res.status).toBe(404);
  });
});
