import * as dashboardService from '../services/dashboardService';
import * as pedidoService from '../services/pedidoService';
import * as carritoService from '../services/carritoService';

// RF-09 (SPEC v6 §6.9): métricas y ciclo de vida del pedido.
describe('DashboardService', () => {
  const clienteIdTest = 7777;

  function crearPedidoDePrueba(productoId: number, cantidad: number) {
    carritoService.limpiarCarrito(clienteIdTest);
    carritoService.agregarItem(clienteIdTest, productoId, cantidad, '');
    return pedidoService.crearPedido({
      clienteId: clienteIdTest,
      fechaEntrega: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      metodoPago: 'mercadopago',
      observaciones: '',
      items: [{ productoId, cantidad, personalizaciones: '' }],
    });
  }

  beforeEach(() => {
    carritoService.limpiarCarrito(clienteIdTest);
    pedidoService.reiniciarEstado();
  });

  test('sin pedidos las métricas están en cero', () => {
    const metricas = dashboardService.obtenerMetricas();
    expect(metricas.ventas.dia).toBe(0);
    expect(metricas.ventas.semana).toBe(0);
    expect(metricas.ventas.mes).toBe(0);
  });

  test('las ventas suman los pedidos no cancelados', () => {
    crearPedidoDePrueba(1, 1); // 4500
    crearPedidoDePrueba(3, 2); // 2200 x 2 = 4400
    const metricas = dashboardService.obtenerMetricas();
    expect(metricas.ventas.dia).toBe(8900);
    expect(metricas.ventas.semana).toBe(8900);
    expect(metricas.ventas.mes).toBe(8900);
    expect(metricas.totalPedidos).toBe(2);
  });

  test('un pedido cancelado no cuenta como venta', () => {
    const result = crearPedidoDePrueba(1, 1);
    pedidoService.cambiarEstado(result.pedido!.id, 'cancelado');

    const metricas = dashboardService.obtenerMetricas();
    expect(metricas.ventas.dia).toBe(0);
    expect(metricas.pedidosPorEstado.cancelado).toBe(1);
  });

  test('pedidosPorEstado cuenta cada estado', () => {
    crearPedidoDePrueba(1, 1);
    const metricas = dashboardService.obtenerMetricas();
    expect(metricas.pedidosPorEstado.pendiente).toBe(1);
    expect(metricas.pedidosPorEstado.entregado).toBe(0);
  });

  test('incluye las alertas de inventario bajo el punto de reorden', () => {
    const metricas = dashboardService.obtenerMetricas();
    expect(metricas.alertasInventario.length).toBe(2);
    expect(metricas.alertasInventario.map((a) => a.nombreIngrediente)).toEqual(
      expect.arrayContaining(['Chocolate amargo', 'Crema de leche'])
    );
  });

  test('rechaza una transición que saltea etapas (CA-25)', () => {
    const result = crearPedidoDePrueba(1, 1);
    const cambio = pedidoService.cambiarEstado(result.pedido!.id, 'entregado');
    expect(cambio.success).toBe(false);
    expect(cambio.code).toBe('transicion_invalida');
    expect(pedidoService.obtenerPedidoPorId(result.pedido!.id)?.estado).toBe('pendiente');
  });

  test('permite el ciclo completo pendiente → en_produccion → en_entrega → entregado', () => {
    const result = crearPedidoDePrueba(1, 1);
    const id = result.pedido!.id;
    expect(pedidoService.cambiarEstado(id, 'en_produccion').success).toBe(true);
    expect(pedidoService.cambiarEstado(id, 'en_entrega').success).toBe(true);
    expect(pedidoService.cambiarEstado(id, 'entregado').success).toBe(true);
    expect(pedidoService.cambiarEstado(id, 'en_produccion').success).toBe(false);
  });
});
