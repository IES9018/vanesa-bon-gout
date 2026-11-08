import * as inventarioService from '../services/inventarioService';

// RF-06 (SPEC v6 §6.6): pruebas unitarias del control de inventario.
describe('InventarioService', () => {
  beforeEach(() => {
    inventarioService.reiniciarEstado();
  });

  test('listar devuelve el seed de ingredientes', () => {
    const items = inventarioService.listar();
    expect(items.length).toBe(6);
    expect(items[0].nombreIngrediente).toBe('Harina 0000');
  });

  test('listar con soloAlertas devuelve solo los que requieren reposición', () => {
    const alertas = inventarioService.listar(true);
    expect(alertas.length).toBe(2);
    expect(alertas.every((i) => i.cantidadDisponible <= i.puntoReorden)).toBe(true);
  });

  test('obtenerPorId retorna el ingrediente existente', () => {
    const item = inventarioService.obtenerPorId(1);
    expect(item?.nombreIngrediente).toBe('Harina 0000');
    expect(item?.requiereReposicion).toBe(false);
  });

  test('obtenerPorId retorna undefined para id inexistente', () => {
    expect(inventarioService.obtenerPorId(999)).toBeUndefined();
  });

  test('entrada suma stock y registra el movimiento', () => {
    const result = inventarioService.registrarMovimiento(3, {
      tipo: 'entrada',
      cantidad: 6,
      motivo: 'Compra a proveedor',
    });
    expect(result.success).toBe(true);
    expect(result.movimiento?.tipo).toBe('entrada');
    const item = inventarioService.obtenerPorId(3);
    expect(item?.cantidadDisponible).toBe(10);
    expect(item?.requiereReposicion).toBe(false);
  });

  test('salida resta stock y deja el ingrediente en alerta si baja del punto de reorden', () => {
    const result = inventarioService.registrarMovimiento(1, {
      tipo: 'salida',
      cantidad: 20,
      motivo: 'Producción de tortas',
    });
    expect(result.success).toBe(true);
    const item = inventarioService.obtenerPorId(1);
    expect(item?.cantidadDisponible).toBe(5);
    expect(item?.requiereReposicion).toBe(true);
  });

  test('salida rechaza cantidad mayor al stock disponible (CA-16)', () => {
    const result = inventarioService.registrarMovimiento(6, {
      tipo: 'salida',
      cantidad: 10,
      motivo: 'Producción',
    });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/stock insuficiente/i);
    expect(inventarioService.obtenerPorId(6)?.cantidadDisponible).toBe(2);
  });

  test('ajuste fija la cantidad contada en inventario físico', () => {
    const result = inventarioService.registrarMovimiento(2, {
      tipo: 'ajuste',
      cantidad: 12,
      motivo: 'Conteo físico mensual',
    });
    expect(result.success).toBe(true);
    expect(inventarioService.obtenerPorId(2)?.cantidadDisponible).toBe(12);
  });

  test('movimiento sobre ingrediente inexistente devuelve error', () => {
    const result = inventarioService.registrarMovimiento(999, {
      tipo: 'entrada',
      cantidad: 1,
      motivo: 'Compra',
    });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/no encontrado/i);
  });

  test('listarMovimientos filtra por ingrediente', () => {
    inventarioService.registrarMovimiento(1, {
      tipo: 'entrada',
      cantidad: 5,
      motivo: 'Compra',
    });
    inventarioService.registrarMovimiento(2, {
      tipo: 'entrada',
      cantidad: 5,
      motivo: 'Compra',
    });
    expect(inventarioService.listarMovimientos().length).toBe(2);
    expect(inventarioService.listarMovimientos(1).length).toBe(1);
  });
});
