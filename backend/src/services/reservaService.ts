import { Reserva, CrearReservaDTO, SlotDisponibilidad } from '../types';

// RF-05 (SPEC v6 §6.5): reservas de entregas y consultas presenciales.
// Los slots se derivan de una grilla fija (5 turnos por día, 7 días visibles)
// para que el cálculo de cupo sea determinista y testeable sin DB.

const HORARIOS = [10, 12, 14, 16, 18];
const CUPO_POR_SLOT = 2;
const DIAS_VISIBLES = 7;
const HORAS_MINIMAS_CANCELACION = 24;

const reservas: Reserva[] = [];
let nextId = 1;

function inicioDelDia(base: Date): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate());
}

// Grilla de slots desde mañana hasta DIAS_VISIBLES días.
function generarSlots(desde: Date = new Date()): Date[] {
  const slots: Date[] = [];
  const base = inicioDelDia(desde);
  for (let dia = 1; dia <= DIAS_VISIBLES; dia += 1) {
    for (const hora of HORARIOS) {
      slots.push(
        new Date(base.getFullYear(), base.getMonth(), base.getDate() + dia, hora, 0, 0, 0)
      );
    }
  }
  return slots;
}

function confirmadasEnSlot(fecha: Date): number {
  return reservas.filter(
    (r) => r.estado === 'confirmada' && r.fecha.getTime() === fecha.getTime()
  ).length;
}

function mismoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function listarDisponibilidad(fecha?: string): SlotDisponibilidad[] | null {
  const slots = generarSlots();
  let filtrados = slots;

  if (fecha) {
    const parsed = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return null;
    filtrados = slots.filter((s) => mismoDia(s, parsed));
  }

  return filtrados.map((slot) => {
    const ocupados = confirmadasEnSlot(slot);
    return {
      fecha: slot,
      cupoTotal: CUPO_POR_SLOT,
      cupoDisponible: Math.max(0, CUPO_POR_SLOT - ocupados),
    };
  });
}

export function crearReserva(
  clienteId: number,
  dto: CrearReservaDTO
): { success: boolean; message: string; reserva?: Reserva } {
  const fecha = new Date(dto.fecha);
  if (Number.isNaN(fecha.getTime())) {
    return { success: false, message: 'Fecha inválida' };
  }
  if (fecha.getTime() <= Date.now()) {
    return { success: false, message: 'La fecha de la reserva debe ser futura' };
  }

  // CA-13: solo se aceptan slots publicados por la grilla.
  const slot = generarSlots().find((s) => s.getTime() === fecha.getTime());
  if (!slot) {
    return {
      success: false,
      message: 'El horario solicitado no está disponible. Consultá /api/reservas/disponibilidad',
    };
  }

  if (confirmadasEnSlot(fecha) >= CUPO_POR_SLOT) {
    return { success: false, message: 'El slot no tiene cupo disponible' };
  }

  const reserva: Reserva = {
    id: nextId++,
    clienteId,
    fecha,
    tipo: dto.tipo,
    estado: 'confirmada',
  };
  reservas.push(reserva);

  return { success: true, message: 'Reserva confirmada', reserva };
}

export function cancelarReserva(
  id: number,
  ahora: Date = new Date()
): { success: boolean; message: string; reserva?: Reserva; code?: 'not_found' } {
  const reserva = reservas.find((r) => r.id === id);
  if (!reserva) {
    return { success: false, message: 'Reserva no encontrada', code: 'not_found' };
  }
  if (reserva.estado !== 'confirmada') {
    return { success: false, message: `La reserva ya está ${reserva.estado}` };
  }

  // CA-14: se puede cancelar hasta 24 h antes del turno.
  const horas = (reserva.fecha.getTime() - ahora.getTime()) / (60 * 60 * 1000);
  if (horas < HORAS_MINIMAS_CANCELACION) {
    return {
      success: false,
      message: 'Solo se puede cancelar con al menos 24 h de anticipación',
    };
  }

  reserva.estado = 'cancelada';
  return { success: true, message: 'Reserva cancelada', reserva };
}

export function obtenerReservaPorId(id: number): Reserva | undefined {
  return reservas.find((r) => r.id === id);
}

export function listarReservas(clienteId?: number): Reserva[] {
  if (clienteId === undefined) return reservas;
  return reservas.filter((r) => r.clienteId === clienteId);
}

// Helper exclusivo de tests.
export function reiniciarEstado(): void {
  reservas.length = 0;
  nextId = 1;
}
