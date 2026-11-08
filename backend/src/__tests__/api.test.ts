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

  // --- RF-06 Inventario (SPEC v6) ---
  it('GET /api/inventario lista los ingredientes', async () => {
    const res = await request(app).get('/api/inventario');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/inventario?soloAlertas=true filtra los que requieren reposición', async () => {
    const res = await request(app).get('/api/inventario?soloAlertas=true');
    expect(res.status).toBe(200);
    expect(res.body.every((i: { requiereReposicion: boolean }) => i.requiereReposicion)).toBe(true);
  });

  it('POST /api/inventario/:id/movimientos valida el body', async () => {
    const res = await request(app).post('/api/inventario/1/movimientos').send({ tipo: 'salida' });
    expect(res.status).toBe(400);
  });

  it('POST /api/inventario/:id/movimientos registra una entrada (201)', async () => {
    const res = await request(app)
      .post('/api/inventario/1/movimientos')
      .send({ tipo: 'entrada', cantidad: 2, motivo: 'Compra de prueba' });
    expect(res.status).toBe(201);
    expect(res.body.tipo).toBe('entrada');
  });

  it('POST /api/inventario/:id/movimientos rechaza salida sin stock', async () => {
    const res = await request(app)
      .post('/api/inventario/6/movimientos')
      .send({ tipo: 'salida', cantidad: 999, motivo: 'Producción' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/stock insuficiente/i);
  });

  it('POST /api/inventario/:id/movimientos devuelve 404 si el ingrediente no existe', async () => {
    const res = await request(app)
      .post('/api/inventario/9999/movimientos')
      .send({ tipo: 'entrada', cantidad: 1, motivo: 'Compra' });
    expect(res.status).toBe(404);
  });

  // --- RF-09 Dashboard (SPEC v6) ---
  it('GET /api/dashboard/metricas devuelve ventas, estados y alertas', async () => {
    const res = await request(app).get('/api/dashboard/metricas');
    expect(res.status).toBe(200);
    expect(res.body.ventas).toBeDefined();
    expect(res.body.pedidosPorEstado).toBeDefined();
    expect(Array.isArray(res.body.alertasInventario)).toBe(true);
    expect(typeof res.body.totalPedidos).toBe('number');
  });

  it('PATCH /api/pedidos/:id/estado rechaza transiciones inválidas (CA-25)', async () => {
    await request(app)
      .post('/api/carrito/104/agregar')
      .send({ productoId: 1, cantidad: 1 });
    const creado = await request(app).post('/api/pedidos').send({
      clienteId: 104,
      fechaEntrega: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      metodoPago: 'mercadopago',
      observaciones: '',
      items: [{ productoId: 1, cantidad: 1, personalizaciones: '' }],
    });
    expect(creado.status).toBe(201);

    const salto = await request(app)
      .patch(`/api/pedidos/${creado.body.id}/estado`)
      .send({ estado: 'entregado' });
    expect(salto.status).toBe(400);
    expect(salto.body.error).toMatch(/transición inválida/i);
  });

  // --- RF-07 Testimonios (SPEC v6) ---
  async function crearPedidoEntregadoHttp(clienteId: number): Promise<number> {
    await request(app)
      .post(`/api/carrito/${clienteId}/agregar`)
      .send({ productoId: 1, cantidad: 1 });
    const creado = await request(app).post('/api/pedidos').send({
      clienteId,
      fechaEntrega: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      metodoPago: 'mercadopago',
      observaciones: '',
      items: [{ productoId: 1, cantidad: 1, personalizaciones: '' }],
    });
    expect(creado.status).toBe(201);
    const id = creado.body.id as number;
    for (const estado of ['en_produccion', 'en_entrega', 'entregado']) {
      const r = await request(app).patch(`/api/pedidos/${id}/estado`).send({ estado });
      expect(r.status).toBe(200);
    }
    return id;
  }

  it('GET /api/testimonios devuelve solo los aprobados', async () => {
    const res = await request(app).get('/api/testimonios');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every((t: { estado: string }) => t.estado === 'aprobado')).toBe(true);
  });

  it('POST /api/pedidos/:id/testimonios valida el body', async () => {
    const pedidoId = await crearPedidoEntregadoHttp(105);
    const res = await request(app)
      .post(`/api/pedidos/${pedidoId}/testimonios`)
      .send({ comentario: 'ok', calificacion: 9 });
    expect(res.status).toBe(400);
  });

  it('POST /api/pedidos/:id/testimonios rechaza pedidos no entregados (CA-18)', async () => {
    await request(app)
      .post('/api/carrito/106/agregar')
      .send({ productoId: 1, cantidad: 1 });
    const creado = await request(app).post('/api/pedidos').send({
      clienteId: 106,
      fechaEntrega: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      metodoPago: 'mercadopago',
      observaciones: '',
      items: [{ productoId: 1, cantidad: 1, personalizaciones: '' }],
    });
    const res = await request(app)
      .post(`/api/pedidos/${creado.body.id}/testimonios`)
      .send({ comentario: 'Todavía no lo recibí', calificacion: 3 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/entregado/i);
  });

  it('POST /api/pedidos/:id/testimonios crea el testimonio (201) y no admite duplicados (CA-20)', async () => {
    const pedidoId = await crearPedidoEntregadoHttp(107);
    const primero = await request(app)
      .post(`/api/pedidos/${pedidoId}/testimonios`)
      .send({ comentario: 'La torta estaba espectacular', calificacion: 5 });
    expect(primero.status).toBe(201);
    expect(primero.body.estado).toBe('pendiente');

    const segundo = await request(app)
      .post(`/api/pedidos/${pedidoId}/testimonios`)
      .send({ comentario: 'Otro comentario distinto', calificacion: 4 });
    expect(segundo.status).toBe(400);
    expect(segundo.body.error).toMatch(/ya existe/i);
  });

  it('PATCH /api/testimonios/:id modera el testimonio (CA-19)', async () => {
    const pedidoId = await crearPedidoEntregadoHttp(108);
    const creado = await request(app)
      .post(`/api/pedidos/${pedidoId}/testimonios`)
      .send({ comentario: 'Excelente atención y sabor', calificacion: 5 });
    expect(creado.status).toBe(201);

    const moderado = await request(app)
      .patch(`/api/testimonios/${creado.body.id}`)
      .send({ estado: 'aprobado' });
    expect(moderado.status).toBe(200);
    expect(moderado.body.estado).toBe('aprobado');
  });

  it('PATCH /api/testimonios/:id devuelve 404 si no existe', async () => {
    const res = await request(app)
      .patch('/api/testimonios/9999')
      .send({ estado: 'aprobado' });
    expect(res.status).toBe(404);
  });
});
