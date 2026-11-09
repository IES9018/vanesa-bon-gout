import { Notificacion, ResumenProcesamiento } from '../types';

// RF-08 (SPEC v6 §6.8, NG-09): cola de salida simulada.
// No se envía nada real: el "worker" valida el formato del destino y marca
// enviada/fallida. El adapter real (WhatsApp Business API / SMTP) se enchufa
// detrás de `entregar` sin cambiar rutas ni contratos (ADR-008).

const MAX_INTENTOS = 3;

const notificaciones: Notificacion[] = [];
let nextId = 1;

function esDestinoValido(canal: Notificacion['canal'], destino: string): boolean {
  if (destino.toLowerCase().includes('invalid')) return false;
  return canal === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destino) : /^\+\d{8,15}$/.test(destino);
}

export function encolarNotificacion(
  pedidoId: number,
  canal: Notificacion['canal'],
  evento: Notificacion['evento'],
  destino: string
): Notificacion {
  const notificacion: Notificacion = {
    id: nextId++,
    pedidoId,
    canal,
    evento,
    destino,
    estado: 'en_cola',
    intentos: 0,
    creadoEn: new Date(),
  };
  notificaciones.push(notificacion);
  return notificacion;
}

// CA-21: cada evento de pedido encola una notificación por canal.
export function encolarEventoPedido(
  pedidoId: number,
  evento: Notificacion['evento'],
  clienteId: number
): Notificacion[] {
  return [
    encolarNotificacion(pedidoId, 'email', evento, `cliente${clienteId}@example.com`),
    encolarNotificacion(pedidoId, 'whatsapp', evento, `+54911${String(clienteId).padStart(8, '0')}`),
  ];
}

// CA-22/CA-23: procesa la cola; los fallos se reintentan hasta MAX_INTENTOS.
export function procesarCola(): ResumenProcesamiento {
  const pendientes = notificaciones.filter(
    (n) => n.estado === 'en_cola' || (n.estado === 'fallida' && n.intentos < MAX_INTENTOS)
  );

  let enviadas = 0;
  let fallidas = 0;

  for (const notificacion of pendientes) {
    if (esDestinoValido(notificacion.canal, notificacion.destino)) {
      notificacion.estado = 'enviada';
      enviadas += 1;
    } else {
      notificacion.intentos += 1;
      notificacion.estado = 'fallida';
      fallidas += 1;
    }
  }

  return { procesadas: pendientes.length, enviadas, fallidas };
}

export function listarNotificaciones(estado?: Notificacion['estado']): Notificacion[] {
  if (!estado) return notificaciones;
  return notificaciones.filter((n) => n.estado === estado);
}

export function listarPorPedido(pedidoId: number): Notificacion[] {
  return notificaciones.filter((n) => n.pedidoId === pedidoId);
}

// Helper exclusivo de tests.
export function reiniciarEstado(): void {
  notificaciones.length = 0;
  nextId = 1;
}
