import { Inventario, MovimientoInventario, CrearMovimientoDTO } from '../types';

// RF-06 (SPEC v6): control de stock de ingredientes y productos terminados.
// Mismo patrón que productoService: seed en memoria para tests/CI y
// persistencia real en PostgreSQL vía inventarioRepository cuando hay DB.

const inventario: Inventario[] = [
  { id: 1, nombreIngrediente: 'Harina 0000', cantidadDisponible: 25, unidadMedida: 'kg', puntoReorden: 10, requiereReposicion: false },
  { id: 2, nombreIngrediente: 'Azúcar', cantidadDisponible: 18, unidadMedida: 'kg', puntoReorden: 8, requiereReposicion: false },
  { id: 3, nombreIngrediente: 'Chocolate amargo', cantidadDisponible: 4, unidadMedida: 'kg', puntoReorden: 5, requiereReposicion: true },
  { id: 4, nombreIngrediente: 'Manteca', cantidadDisponible: 6, unidadMedida: 'kg', puntoReorden: 4, requiereReposicion: false },
  { id: 5, nombreIngrediente: 'Huevos', cantidadDisponible: 30, unidadMedida: 'unidades', puntoReorden: 24, requiereReposicion: false },
  { id: 6, nombreIngrediente: 'Crema de leche', cantidadDisponible: 2, unidadMedida: 'litros', puntoReorden: 3, requiereReposicion: true },
];

const movimientos: MovimientoInventario[] = [];
let nextMovimientoId = 1;

function calcularRequiereReposicion(item: Omit<Inventario, 'requiereReposicion'>): boolean {
  return item.cantidadDisponible <= item.puntoReorden;
}

export function listar(soloAlertas = false): Inventario[] {
  return inventario.filter((i) => !soloAlertas || i.requiereReposicion);
}

export function obtenerPorId(id: number): Inventario | undefined {
  return inventario.find((i) => i.id === id);
}

export function listarMovimientos(inventarioId?: number): MovimientoInventario[] {
  if (inventarioId === undefined) return movimientos;
  return movimientos.filter((m) => m.inventarioId === inventarioId);
}

// Aplica el movimiento sobre el stock y deja el registro auditable.
// Reglas de negocio (SPEC §6.6):
//  - entrada: suma cantidad.
//  - salida: resta cantidad; rechaza si no hay stock suficiente (CA-16).
//  - ajuste: fija la cantidad absoluta contada (inventario físico).
export function registrarMovimiento(
  inventarioId: number,
  dto: CrearMovimientoDTO
): { success: boolean; message: string; movimiento?: MovimientoInventario } {
  const item = inventario.find((i) => i.id === inventarioId);
  if (!item) {
    return { success: false, message: 'Ingrediente no encontrado' };
  }

  let nuevaCantidad: number;
  switch (dto.tipo) {
    case 'entrada':
      nuevaCantidad = item.cantidadDisponible + dto.cantidad;
      break;
    case 'salida':
      if (dto.cantidad > item.cantidadDisponible) {
        return {
          success: false,
          message: `Stock insuficiente de ${item.nombreIngrediente}. Disponible: ${item.cantidadDisponible} ${item.unidadMedida}`,
        };
      }
      nuevaCantidad = item.cantidadDisponible - dto.cantidad;
      break;
    case 'ajuste':
      nuevaCantidad = dto.cantidad;
      break;
    default:
      return { success: false, message: 'Tipo de movimiento inválido' };
  }

  item.cantidadDisponible = nuevaCantidad;
  item.requiereReposicion = calcularRequiereReposicion(item);

  const movimiento: MovimientoInventario = {
    id: nextMovimientoId++,
    inventarioId,
    tipo: dto.tipo,
    cantidad: dto.cantidad,
    motivo: dto.motivo,
    pedidoId: dto.pedidoId ?? null,
    creadoEn: new Date(),
  };
  movimientos.push(movimiento);

  return {
    success: true,
    message: `Movimiento de ${dto.tipo} registrado. Stock actual: ${nuevaCantidad} ${item.unidadMedida}`,
    movimiento,
  };
}

// Helper exclusivo de tests: devuelve el seed a su estado inicial para que
// los casos no dependan del orden de ejecución de Jest.
export function reiniciarEstado(): void {
  inventario[0].cantidadDisponible = 25;
  inventario[1].cantidadDisponible = 18;
  inventario[2].cantidadDisponible = 4;
  inventario[3].cantidadDisponible = 6;
  inventario[4].cantidadDisponible = 30;
  inventario[5].cantidadDisponible = 2;
  for (const item of inventario) {
    item.requiereReposicion = calcularRequiereReposicion(item);
  }
  movimientos.length = 0;
  nextMovimientoId = 1;
}
