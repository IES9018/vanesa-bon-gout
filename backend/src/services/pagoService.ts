import { Pago, CrearPagoDTO } from '../types';
import { obtenerPedidoPorId } from './pedidoService';

// RF-04 (SPEC v6 §6.4, NG-08): pagos en modo sandbox.
// No se llama a la API real de MercadoPago: el adapter simula la preferencia
// y la confirmación llega por el endpoint de webhook/confirmación del admin.
// Cuando existan credenciales productivas solo cambia este módulo (ADR-007).

const pagos: Pago[] = [];
let nextId = 1;

function generarReferenciaSandbox(pedidoId: number, pagoId: number): string {
  return `MP-SANDBOX-${pedidoId}-${pagoId}`;
}

export function crearPago(
  pedidoId: number,
  dto: CrearPagoDTO
): { success: boolean; message: string; pago?: Pago } {
  const pedido = obtenerPedidoPorId(pedidoId);
  if (!pedido) {
    return { success: false, message: 'Pedido no encontrado' };
  }
  if (pedido.estado === 'cancelado') {
    return { success: false, message: 'No se puede pagar un pedido cancelado' };
  }

  // Un pedido no puede tener dos pagos vigentes (pendiente o aprobado).
  const vigente = pagos.find(
    (p) => p.pedidoId === pedidoId && (p.estado === 'pendiente' || p.estado === 'aprobado')
  );
  if (vigente) {
    return {
      success: false,
      message: `El pedido ya tiene un pago ${vigente.estado}`,
    };
  }

  if (dto.metodo === 'transferencia' && !dto.referenciaComprobante?.trim()) {
    return {
      success: false,
      message: 'La transferencia requiere la referencia del comprobante',
    };
  }

  const id = nextId++;
  const pago: Pago = {
    id,
    pedidoId,
    metodo: dto.metodo,
    estado: 'pendiente',
    // El monto SIEMPRE se toma del pedido, nunca del body (T-02).
    monto: pedido.total,
    referenciaExterna:
      dto.metodo === 'mercadopago'
        ? generarReferenciaSandbox(pedidoId, id)
        : (dto.referenciaComprobante as string).trim(),
    creadoEn: new Date(),
  };
  pagos.push(pago);

  return {
    success: true,
    message:
      dto.metodo === 'mercadopago'
        ? 'Pago creado en sandbox. Confirmá el pago simulado para aprobarlo.'
        : 'Transferencia registrada, pendiente de aprobación de la administradora.',
    pago,
  };
}

// CA-09 y CA-10: la confirmación (webhook de sandbox o revisión manual de la
// transferencia) aprueba o rechaza el pago. CA-11: un pago rechazado no
// habilita el pedido, que permanece en su estado actual.
export function confirmarPago(
  id: number,
  aprobado: boolean,
  motivo?: string
): { success: boolean; message: string; pago?: Pago } {
  const pago = pagos.find((p) => p.id === id);
  if (!pago) {
    return { success: false, message: 'Pago no encontrado' };
  }
  if (pago.estado !== 'pendiente') {
    return { success: false, message: `El pago ya está ${pago.estado}` };
  }

  pago.estado = aprobado ? 'aprobado' : 'rechazado';
  const detalle = motivo ? `: ${motivo}` : '';
  return {
    success: true,
    message: aprobado ? 'Pago aprobado' : `Pago rechazado${detalle}`,
    pago,
  };
}

export function obtenerPagoPorId(id: number): Pago | undefined {
  return pagos.find((p) => p.id === id);
}

export function listarPagos(pedidoId?: number): Pago[] {
  if (pedidoId === undefined) return pagos;
  return pagos.filter((p) => p.pedidoId === pedidoId);
}

// Helper exclusivo de tests.
export function reiniciarEstado(): void {
  pagos.length = 0;
  nextId = 1;
}
