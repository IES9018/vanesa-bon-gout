import * as productoService from '../services/productoService';

describe('ProductoService', () => {
  test('obtenerTodos devuelve solo productos activos', () => {
    const productos = productoService.obtenerTodos();
    expect(productos.length).toBeGreaterThan(0);
    expect(productos.every((p) => p.activo)).toBe(true);
  });

  test('obtenerPorId retorna producto existente', () => {
    const producto = productoService.obtenerPorId(1);
    expect(producto).toBeDefined();
    expect(producto?.nombre).toBe('Torta de chocolate');
  });

  test('obtenerPorId retorna undefined para id inexistente', () => {
    const producto = productoService.obtenerPorId(999);
    expect(producto).toBeUndefined();
  });

  test('obtenerPorCategoria filtra correctamente', () => {
    const tortas = productoService.obtenerPorCategoria('Tortas');
    expect(tortas.length).toBe(2);
    expect(tortas.every((p) => p.categoria === 'Tortas')).toBe(true);
  });

  test('buscar encuentra productos por nombre', () => {
    const resultados = productoService.buscar('chocolate');
    expect(resultados.length).toBe(1);
    expect(resultados[0].nombre).toBe('Torta de chocolate');
  });

  test('buscar retorna vacio si no hay coincidencias', () => {
    const resultados = productoService.buscar('xyz123');
    expect(resultados.length).toBe(0);
  });

  test('verificarStock retorna true cuando hay stock suficiente', () => {
    const tieneStock = productoService.verificarStock(1, 2);
    expect(tieneStock).toBe(true);
  });

  test('verificarStock retorna false cuando no hay stock', () => {
    const tieneStock = productoService.verificarStock(5, 1);
    expect(tieneStock).toBe(false);
  });

  test('verificarStock retorna false para producto inexistente', () => {
    const tieneStock = productoService.verificarStock(999, 1);
    expect(tieneStock).toBe(false);
  });
});
