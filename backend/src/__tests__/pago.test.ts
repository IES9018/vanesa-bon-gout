import * as pagoService from '../services/pagoService';
import * as pedidoService from '../services/pedidoService';
import * as carritoService from '../services/carritoService';

// RF-04 (SPEC v6 §6.4, NG-08): pagos en sandbox, sin llamadas de red.
describe('PagoService', () => {
  const clienteIdTest = 5555;

  function crearPedido(): { id: number; total: number } {
    carritoService.limpiarCarrito(clienteIdTest);
    carritoService.agregarItem(clienteIdTest, 1, 1, '');
    const creado = pedidoService.crearPedido({
      clienteId: clienteIdTest,
      fechaEntrega: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      metodoPago: 'mercadopago',
      observaciones: '',
      items: [{ productoId: 1, cantidad: 1, personalizaciones: '' }],
    });
    return { id: creado.pedido!.id, total: creado.pedido!.total };
  }

  beforeEach(() => {
    carritoService.limpiarCarrito(clienteIdTest);
    pedidoService.reiniciarEstado();
    pagoService.reiniciarEstado();
  });

  test('crea un pago de MercadoPago en sandbox con el monto del pedido (CA-09)', () => {
    const pedido = crearPedido();
    const result = pagoService.crearPago(pedido.id, { metodo: 'mercadopago' });
    expect(result.success).toBe(true);
    expect(result.pago?.estado).toBe('pendiente');
    expect(result.pago?.monto).toBe(pedido.total);
    expect(result.pago?.referenciaExterna).toMatch(/^MP-SANDBOX-/);
  });

  test('la transferencia exige la referencia del comprobante', () => {
    const pedido = crearPedido();
    const result = pagoService.crearPago(pedido.id, { metodo: 'transferencia' });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/comprobante/i);
  });

  test('la transferencia con comprobante queda pendiente de aprobación (CA-10)', () => {
    const pedido = crearPedido();
    const result = pagoService.crearPago(pedido.id, {
      metodo: 'transferencia',
      referenciaComprobante: 'TRF-000123',
    });
    expect(result.success).toBe(true);
    expect(result.pago?.estado).toBe('pendiente');
    expect(result.pago?.referenciaExterna).toBe('TRF-000123');
  });

  test('rechaza el pago de un pedido inexistente', () => {
    const result = pagoService.crearPago(9999, { metodo: 'mercadopago' });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/no encontrado/i);
  });

  test('no permite dos pagos vigentes para el mismo pedido', () => {
    const pedido = crearPedido();
    pagoService.crearPago(pedido.id, { metodo: 'mercadopago' });
    const segundo = pagoService.crearPago(pedido.id, { metodo: 'transferencia', referenciaComprobante: 'TRF-1' });
    expect(segundo.success).toBe(false);
    expect(segundo.message).toMatch(/ya tiene un pago/i);
  });

  test('confirmar aprobado deja el pago aprobado (CA-09)', () => {
    const pedido = crearPedido();
    const creado = pagoService.crearPago(pedido.id, { metodo: 'mercadopago' });
    const confirmado = pagoService.confirmarPago(creado.pago!.id, true);
    expect(confirmado.success).toBe(true);
    expect(confirmado.pago?.estado).toBe('aprobado');
  });

  test('un pago rechazado no habilita el pedido (CA-11)', () => {
    const pedido = crearPedido();
    const creado = pagoService.crearPago(pedido.id, { metodo: 'transferencia', referenciaComprobante: 'TRF-2' });
    const confirmado = pagoService.confirmarPago(creado.pago!.id, false, 'Comprobante ilegible');
    expect(confirmado.pago?.estado).toBe('rechazado');
    expect(confirmado.message).toMatch(/comprobante ilegible/i);
    expect(pedidoService.obtenerPedidoPorId(pedido.id)?.estado).toBe('pendiente');
  });

  test('no se puede confirmar dos veces el mismo pago', () => {
    const pedido = crearPedido();
    const creado = pagoService.crearPago(pedido.id, { metodo: 'mercadopago' });
    pagoService.confirmarPago(creado.pago!.id, true);
    const segundo = pagoService.confirmarPago(creado.pago!.id, false);
    expect(segundo.success).toBe(false);
    expect(segundo.message).toMatch(/ya está/i);
  });

  test('confirmar un pago inexistente devuelve error', () => {
    const result = pagoService.confirmarPago(9999, true);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/no encontrado/i);
  });

  test('listarPagos filtra por pedido', () => {
    const pedido = crearPedido();
    pagoService.crearPago(pedido.id, { metodo: 'mercadopago' });
    expect(pagoService.listarPagos().length).toBe(1);
    expect(pagoService.listarPagos(pedido.id).length).toBe(1);
    expect(pagoService.listarPagos(9999).length).toBe(0);
  });
});
