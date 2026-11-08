import * as reservaService from '../services/reservaService';

// RF-05 (SPEC v6 §6.5): reservas de entregas y consultas.
describe('ReservaService', () => {
  function primerSlotLibre(): Date {
    const slots = reservaService.listarDisponibilidad();
    expect(slots).not.toBeNull();
    return slots![0].fecha;
  }

  beforeEach(() => {
    reservaService.reiniciarEstado();
  });

  test('la grilla publica 7 días x 5 turnos con cupo 2', () => {
    const slots = reservaService.listarDisponibilidad();
    expect(slots).not.toBeNull();
    expect(slots!.length).toBe(35);
    expect(slots!.every((s) => s.cupoTotal === 2 && s.cupoDisponible === 2)).toBe(true);
  });

  test('filtrar por fecha devuelve solo ese día', () => {
    const slot = primerSlotLibre();
    const iso = `${slot.getFullYear()}-${String(slot.getMonth() + 1).padStart(2, '0')}-${String(
      slot.getDate()
    ).padStart(2, '0')}`;
    const slots = reservaService.listarDisponibilidad(iso);
    expect(slots).not.toBeNull();
    expect(slots!.length).toBe(5);
    expect(slots!.every((s) => s.fecha.getDate() === slot.getDate())).toBe(true);
  });

  test('una fecha con formato inválido devuelve null', () => {
    expect(reservaService.listarDisponibilidad('no-es-fecha')).toBeNull();
  });

  test('crea la reserva confirmada en un slot válido (CA-12)', () => {
    const result = reservaService.crearReserva(1, {
      fecha: primerSlotLibre().toISOString(),
      tipo: 'entrega',
    });
    expect(result.success).toBe(true);
    expect(result.reserva?.estado).toBe('confirmada');
    expect(reservaService.listarReservas(1).length).toBe(1);
  });

  test('rechaza una fecha pasada (CA-13)', () => {
    const result = reservaService.crearReserva(1, {
      fecha: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      tipo: 'consulta',
    });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/futura/i);
  });

  test('rechaza un horario que no pertenece a la grilla (CA-13)', () => {
    const fueraDeGrilla = new Date();
    fueraDeGrilla.setDate(fueraDeGrilla.getDate() + 2);
    fueraDeGrilla.setHours(3, 30, 0, 0);
    const result = reservaService.crearReserva(1, {
      fecha: fueraDeGrilla.toISOString(),
      tipo: 'entrega',
    });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/no está disponible/i);
  });

  test('rechaza una fecha inválida', () => {
    const result = reservaService.crearReserva(1, { fecha: 'x', tipo: 'entrega' });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/inválida/i);
  });

  test('no permite superar el cupo del slot (CA-13)', () => {
    const slot = primerSlotLibre().toISOString();
    expect(reservaService.crearReserva(1, { fecha: slot, tipo: 'entrega' }).success).toBe(true);
    expect(reservaService.crearReserva(2, { fecha: slot, tipo: 'entrega' }).success).toBe(true);
    const tercera = reservaService.crearReserva(3, { fecha: slot, tipo: 'consulta' });
    expect(tercera.success).toBe(false);
    expect(tercera.message).toMatch(/cupo/i);
  });

  test('cancelar libera el cupo (CA-14)', () => {
    const slot = primerSlotLibre();
    const creada = reservaService.crearReserva(1, {
      fecha: slot.toISOString(),
      tipo: 'entrega',
    });
    const cancelada = reservaService.cancelarReserva(creada.reserva!.id);
    expect(cancelada.success).toBe(true);
    expect(cancelada.reserva?.estado).toBe('cancelada');

    const disponibles = reservaService
      .listarDisponibilidad()!
      .find((s) => s.fecha.getTime() === slot.getTime());
    expect(disponibles?.cupoDisponible).toBe(2);
  });

  test('no se puede cancelar con menos de 24 h de anticipación (CA-14)', () => {
    const slot = primerSlotLibre();
    const creada = reservaService.crearReserva(1, { fecha: slot.toISOString(), tipo: 'entrega' });
    const casiEnElTurno = new Date(slot.getTime() - 2 * 60 * 60 * 1000);
    const result = reservaService.cancelarReserva(creada.reserva!.id, casiEnElTurno);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/24 h/i);
  });

  test('cancelar una reserva inexistente devuelve not_found', () => {
    const result = reservaService.cancelarReserva(9999);
    expect(result.success).toBe(false);
    expect(result.code).toBe('not_found');
  });

  test('no se puede cancelar dos veces', () => {
    const creada = reservaService.crearReserva(1, {
      fecha: primerSlotLibre().toISOString(),
      tipo: 'entrega',
    });
    reservaService.cancelarReserva(creada.reserva!.id);
    const segunda = reservaService.cancelarReserva(creada.reserva!.id);
    expect(segunda.success).toBe(false);
    expect(segunda.message).toMatch(/ya está/i);
  });
});
