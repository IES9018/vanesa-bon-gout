import * as pedidoService from '../services/pedidoService';
import * as carritoService from '../services/carritoService';

describe('PedidoService', () => {
  const clienteIdTest = 8888;

  beforeEach(() => {
    carritoService.limpiarCarrito(clienteIdTest);
  });

  test('crearPedido falla si el carrito esta vacio', () => {
    const result = pedidoService.crearPedido({
      clienteId: clienteIdTest,
      fechaEntrega: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      metodoPago: 'mercadopago',
      observaciones: '',
      items: [],
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain('vacío');
  });

  test('crearPedido falla si la fecha es menor a 48 horas', () => {
    carritoService.agregarItem(clienteIdTest, 1, 1, '');
    const result = pedidoService.crearPedido({
      clienteId: clienteIdTest,
      fechaEntrega: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      metodoPago: 'mercadopago',
      observaciones: '',
      items: [{ productoId: 1, cantidad: 1, personalizaciones: '' }],
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain('48 horas');
  });

  test('crearPedido exitoso con fecha valida', () => {
    carritoService.agregarItem(clienteIdTest, 1, 1, 'Feliz cumple');
    const result = pedidoService.crearPedido({
      clienteId: clienteIdTest,
      fechaEntrega: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      metodoPago: 'transferencia',
      observaciones: 'Entregar antes de las 12',
      items: [{ productoId: 1, cantidad: 1, personalizaciones: 'Feliz cumple' }],
    });
    expect(result.success).toBe(true);
    expect(result.pedido).toBeDefined();
    expect(result.pedido?.estado).toBe('pendiente');
  });

  test('cambiarEstado actualiza el estado del pedido', () => {
    carritoService.agregarItem(clienteIdTest, 3, 1, '');
    const result = pedidoService.crearPedido({
      clienteId: clienteIdTest,
      fechaEntrega: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      metodoPago: 'efectivo',
      observaciones: '',
      items: [{ productoId: 3, cantidad: 1, personalizaciones: '' }],
    });
    const pedidoId = result.pedido?.id;
    expect(pedidoId).toBeDefined();

    const cambio = pedidoService.cambiarEstado(pedidoId!, 'en_produccion');
    expect(cambio.success).toBe(true);

    const pedido = pedidoService.obtenerPedidoPorId(pedidoId!);
    expect(pedido?.estado).toBe('en_produccion');
  });
});
