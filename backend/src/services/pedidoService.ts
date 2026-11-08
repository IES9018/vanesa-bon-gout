import { Pedido, CrearPedidoDTO } from '../types';
import { verificarStock, obtenerPorId } from './productoService';
import { calcularTotal, limpiarCarrito, obtenerCarrito } from './carritoService';

const pedidos: Pedido[] = [];
let nextId = 1;

// RF-09 (CA-25): transiciones permitidas del ciclo de vida del pedido.
const TRANSICIONES: Record<Pedido['estado'], Pedido['estado'][]> = {
  pendiente: ['en_produccion', 'cancelado'],
  en_produccion: ['en_entrega', 'cancelado'],
  en_entrega: ['entregado', 'cancelado'],
  entregado: [],
  cancelado: [],
};

export function crearPedido(dto: CrearPedidoDTO): { success: boolean; message: string; pedido?: Pedido } {
  const carrito = obtenerCarrito(dto.clienteId);

  if (carrito.items.length === 0) {
    return { success: false, message: 'El carrito está vacío' };
  }

  for (const item of carrito.items) {
    if (!verificarStock(item.productoId, item.cantidad)) {
      const producto = obtenerPorId(item.productoId);
      return {
        success: false,
        message: `Stock insuficiente para ${producto?.nombre ?? 'producto'}. Disponible: ${producto?.stock ?? 0}`,
      };
    }
  }

  const fechaEntrega = new Date(dto.fechaEntrega);
  const ahora = new Date();
  const diffHoras = (fechaEntrega.getTime() - ahora.getTime()) / (1000 * 60 * 60);
  if (diffHoras < 48) {
    return {
      success: false,
      message: 'La fecha de entrega debe ser al menos 48 horas hábiles',
    };
  }

  const total = calcularTotal(dto.clienteId);

  const pedido: Pedido = {
    id: nextId++,
    clienteId: dto.clienteId,
    fechaPedido: new Date(),
    fechaEntrega: fechaEntrega,
    estado: 'pendiente',
    total: total,
    observaciones: dto.observaciones,
  };

  pedidos.push(pedido);
  limpiarCarrito(dto.clienteId);

  return { success: true, message: 'Pedido creado exitosamente', pedido };
}

export function obtenerPedidos(): Pedido[] {
  return pedidos;
}

// Helper exclusivo de tests: vacía el estado en memoria para que los casos
// no dependan del orden de ejecución de Jest.
export function reiniciarEstado(): void {
  pedidos.length = 0;
  nextId = 1;
}

export function obtenerPedidoPorId(id: number): Pedido | undefined {
  return pedidos.find((p) => p.id === id);
}

export function obtenerPedidosPorCliente(clienteId: number): Pedido[] {
  return pedidos.filter((p) => p.clienteId === clienteId);
}

export function cambiarEstado(
  id: number,
  nuevoEstado: Pedido['estado']
): { success: boolean; message: string; code?: 'not_found' | 'transicion_invalida' } {
  const pedido = pedidos.find((p) => p.id === id);
  if (!pedido) {
    return { success: false, message: 'Pedido no encontrado', code: 'not_found' };
  }

  // RF-09 (CA-25): ciclo de vida controlado. No se puede saltear etapas ni
  // revivir un pedido entregado o cancelado.
  if (!TRANSICIONES[pedido.estado].includes(nuevoEstado)) {
    return {
      success: false,
      message: `Transición inválida: ${pedido.estado} → ${nuevoEstado}`,
      code: 'transicion_invalida',
    };
  }

  pedido.estado = nuevoEstado;
  return { success: true, message: `Estado actualizado a ${nuevoEstado}` };
}
