import * as testimonioService from '../services/testimonioService';
import * as pedidoService from '../services/pedidoService';
import * as carritoService from '../services/carritoService';

// RF-07 (SPEC v6 §6.7): testimonios con moderación previa.
describe('TestimonioService', () => {
  const clienteIdTest = 6666;

  function crearPedidoEntregado(): number {
    carritoService.limpiarCarrito(clienteIdTest);
    carritoService.agregarItem(clienteIdTest, 1, 1, '');
    const creado = pedidoService.crearPedido({
      clienteId: clienteIdTest,
      fechaEntrega: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      metodoPago: 'mercadopago',
      observaciones: '',
      items: [{ productoId: 1, cantidad: 1, personalizaciones: '' }],
    });
    const id = creado.pedido!.id;
    pedidoService.cambiarEstado(id, 'en_produccion');
    pedidoService.cambiarEstado(id, 'en_entrega');
    pedidoService.cambiarEstado(id, 'entregado');
    return id;
  }

  beforeEach(() => {
    carritoService.limpiarCarrito(clienteIdTest);
    pedidoService.reiniciarEstado();
    testimonioService.reiniciarEstado();
  });

  test('crea un testimonio pendiente sobre un pedido entregado (CA-18)', () => {
    const pedidoId = crearPedidoEntregado();
    const result = testimonioService.crearTestimonio(pedidoId, {
      comentario: 'La torta estaba espectacular',
      calificacion: 5,
    });
    expect(result.success).toBe(true);
    expect(result.testimonio?.estado).toBe('pendiente');
    expect(result.testimonio?.clienteId).toBe(clienteIdTest);
    expect(testimonioService.listarAprobados().length).toBe(0);
  });

  test('rechaza el testimonio si el pedido no está entregado', () => {
    carritoService.agregarItem(clienteIdTest, 1, 1, '');
    const creado = pedidoService.crearPedido({
      clienteId: clienteIdTest,
      fechaEntrega: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      metodoPago: 'mercadopago',
      observaciones: '',
      items: [{ productoId: 1, cantidad: 1, personalizaciones: '' }],
    });
    const result = testimonioService.crearTestimonio(creado.pedido!.id, {
      comentario: 'Muy rico todo',
      calificacion: 4,
    });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/entregado/i);
  });

  test('rechaza el testimonio si el pedido no existe', () => {
    const result = testimonioService.crearTestimonio(9999, {
      comentario: 'Comentario de prueba',
      calificacion: 3,
    });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/no encontrado/i);
  });

  test('no permite más de un testimonio por pedido (CA-20)', () => {
    const pedidoId = crearPedidoEntregado();
    testimonioService.crearTestimonio(pedidoId, { comentario: 'Primero', calificacion: 5 });
    const segundo = testimonioService.crearTestimonio(pedidoId, {
      comentario: 'Segundo intento',
      calificacion: 4,
    });
    expect(segundo.success).toBe(false);
    expect(segundo.message).toMatch(/ya existe/i);
  });

  test('aprobar un testimonio lo publica en el catálogo (CA-19)', () => {
    const pedidoId = crearPedidoEntregado();
    const creado = testimonioService.crearTestimonio(pedidoId, {
      comentario: 'Excelente atención',
      calificacion: 5,
    });
    const moderado = testimonioService.moderarTestimonio(creado.testimonio!.id, 'aprobado');
    expect(moderado.success).toBe(true);
    expect(testimonioService.listarAprobados().length).toBe(1);
    expect(testimonioService.listarPendientes().length).toBe(0);
  });

  test('rechazar un testimonio lo excluye del catálogo', () => {
    const pedidoId = crearPedidoEntregado();
    const creado = testimonioService.crearTestimonio(pedidoId, {
      comentario: 'No me gustó',
      calificacion: 1,
    });
    testimonioService.moderarTestimonio(creado.testimonio!.id, 'rechazado');
    expect(testimonioService.listarAprobados().length).toBe(0);
    expect(testimonioService.obtenerPorPedido(pedidoId)?.estado).toBe('rechazado');
  });

  test('no se puede moderar dos veces el mismo testimonio', () => {
    const pedidoId = crearPedidoEntregado();
    const creado = testimonioService.crearTestimonio(pedidoId, {
      comentario: 'Comentario válido',
      calificacion: 4,
    });
    testimonioService.moderarTestimonio(creado.testimonio!.id, 'aprobado');
    const segundo = testimonioService.moderarTestimonio(creado.testimonio!.id, 'rechazado');
    expect(segundo.success).toBe(false);
    expect(segundo.message).toMatch(/ya está/i);
  });

  test('moderar un testimonio inexistente devuelve error', () => {
    const result = testimonioService.moderarTestimonio(9999, 'aprobado');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/no encontrado/i);
  });
});
