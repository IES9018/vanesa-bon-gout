import * as carritoService from '../services/carritoService';

describe('CarritoService', () => {
  const clienteIdTest = 9999;

  beforeEach(() => {
    carritoService.limpiarCarrito(clienteIdTest);
  });

  test('obtenerCarrito retorna carrito vacio para cliente nuevo', () => {
    const carrito = carritoService.obtenerCarrito(clienteIdTest);
    expect(carrito.items.length).toBe(0);
  });

  test('agregarItem agrega producto al carrito', () => {
    const result = carritoService.agregarItem(clienteIdTest, 1, 2, 'Sin frutas');
    expect(result.success).toBe(true);

    const carrito = carritoService.obtenerCarrito(clienteIdTest);
    expect(carrito.items.length).toBe(1);
    expect(carrito.items[0].productoId).toBe(1);
    expect(carrito.items[0].cantidad).toBe(2);
  });

  test('agregarItem rechaza producto sin stock', () => {
    const result = carritoService.agregarItem(clienteIdTest, 5, 1, '');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Stock insuficiente');
  });

  test('agregarItem rechaza producto inexistente', () => {
    const result = carritoService.agregarItem(clienteIdTest, 999, 1, '');
    expect(result.success).toBe(false);
    expect(result.message).toContain('no encontrado');
  });

  test('eliminarItem remueve producto del carrito', () => {
    carritoService.agregarItem(clienteIdTest, 1, 1, '');
    const result = carritoService.eliminarItem(clienteIdTest, 1);
    expect(result.success).toBe(true);

    const carrito = carritoService.obtenerCarrito(clienteIdTest);
    expect(carrito.items.length).toBe(0);
  });

  test('eliminarItem falla si producto no esta en carrito', () => {
    const result = carritoService.eliminarItem(clienteIdTest, 1);
    expect(result.success).toBe(false);
  });

  test('actualizarCantidad modifica cantidad correctamente', () => {
    carritoService.agregarItem(clienteIdTest, 1, 1, '');
    const result = carritoService.actualizarCantidad(clienteIdTest, 1, 3);
    expect(result.success).toBe(true);

    const carrito = carritoService.obtenerCarrito(clienteIdTest);
    expect(carrito.items[0].cantidad).toBe(3);
  });

  test('calcularTotal suma correctamente los precios', () => {
    carritoService.agregarItem(clienteIdTest, 1, 1, '');
    carritoService.agregarItem(clienteIdTest, 3, 2, '');
    const total = carritoService.calcularTotal(clienteIdTest);
    expect(total).toBe(4500 + 2200 * 2);
  });
});
