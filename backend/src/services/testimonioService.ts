import { Testimonio, CrearTestimonioDTO } from '../types';
import { obtenerPedidoPorId } from './pedidoService';

// RF-07 (SPEC v6 §6.7): testimonios de clientes con moderación previa.
// Mismo patrón que inventario: seed en memoria para tests/CI y repositorio
// PostgreSQL cuando DATABASE_URL está disponible.

const testimonios: Testimonio[] = [];
let nextId = 1;

export function crearTestimonio(
  pedidoId: number,
  dto: CrearTestimonioDTO
): { success: boolean; message: string; testimonio?: Testimonio } {
  const pedido = obtenerPedidoPorId(pedidoId);
  if (!pedido) {
    return { success: false, message: 'Pedido no encontrado' };
  }

  // CA-18: solo se opina sobre pedidos efectivamente entregados.
  if (pedido.estado !== 'entregado') {
    return {
      success: false,
      message: 'Solo se puede dejar testimonio de un pedido entregado',
    };
  }

  // CA-20: un testimonio por pedido.
  if (testimonios.some((t) => t.pedidoId === pedidoId)) {
    return { success: false, message: 'Ya existe un testimonio para este pedido' };
  }

  const testimonio: Testimonio = {
    id: nextId++,
    clienteId: pedido.clienteId,
    pedidoId,
    comentario: dto.comentario,
    calificacion: dto.calificacion,
    estado: 'pendiente',
    creadoEn: new Date(),
  };
  testimonios.push(testimonio);

  return { success: true, message: 'Testimonio creado, pendiente de moderación', testimonio };
}

export function moderarTestimonio(
  id: number,
  estado: 'aprobado' | 'rechazado'
): { success: boolean; message: string; testimonio?: Testimonio } {
  const testimonio = testimonios.find((t) => t.id === id);
  if (!testimonio) {
    return { success: false, message: 'Testimonio no encontrado' };
  }
  if (testimonio.estado !== 'pendiente') {
    return { success: false, message: `El testimonio ya está ${testimonio.estado}` };
  }

  testimonio.estado = estado;
  return { success: true, message: `Testimonio ${estado}`, testimonio };
}

export function listarAprobados(): Testimonio[] {
  return testimonios.filter((t) => t.estado === 'aprobado');
}

export function listarPendientes(): Testimonio[] {
  return testimonios.filter((t) => t.estado === 'pendiente');
}

export function listarTodos(): Testimonio[] {
  return testimonios;
}

export function obtenerPorPedido(pedidoId: number): Testimonio | undefined {
  return testimonios.find((t) => t.pedidoId === pedidoId);
}

// Helper exclusivo de tests.
export function reiniciarEstado(): void {
  testimonios.length = 0;
  nextId = 1;
}
