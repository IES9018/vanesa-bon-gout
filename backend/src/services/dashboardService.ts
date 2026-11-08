import { Pedido } from '../types';
import { obtenerPedidos } from './pedidoService';
import * as inventarioService from './inventarioService';

// RF-09 (SPEC v6 §6.9): métricas del negocio para el dashboard de la
// administradora. Se calculan sobre los pedidos en memoria; cuando el
// pedidoService persista en PostgreSQL, esta capa no cambia su contrato.

export interface MetricasDashboard {
  ventas: {
    dia: number;
    semana: number;
    mes: number;
  };
  pedidosPorEstado: Record<Pedido['estado'], number>;
  alertasInventario: Array<{
    id: number;
    nombreIngrediente: string;
    cantidadDisponible: number;
    unidadMedida: string;
    puntoReorden: number;
  }>;
  totalPedidos: number;
}

function inicioDelDia(ahora: Date): Date {
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

export function obtenerMetricas(ahora: Date = new Date()): MetricasDashboard {
  const pedidos = obtenerPedidos();
  const inicioDia = inicioDelDia(ahora);
  const inicioSemana = new Date(inicioDia);
  inicioSemana.setDate(inicioDia.getDate() - 6); // últimos 7 días
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  // Los pedidos cancelados no cuentan como venta.
  const vendidos = pedidos.filter((p) => p.estado !== 'cancelado');

  const sumarDesde = (desde: Date): number =>
    vendidos
      .filter((p) => new Date(p.fechaPedido).getTime() >= desde.getTime())
      .reduce((acc, p) => acc + p.total, 0);

  const pedidosPorEstado: Record<Pedido['estado'], number> = {
    pendiente: 0,
    en_produccion: 0,
    en_entrega: 0,
    entregado: 0,
    cancelado: 0,
  };
  for (const pedido of pedidos) {
    pedidosPorEstado[pedido.estado] += 1;
  }

  const alertasInventario = inventarioService.listar(true).map((i) => ({
    id: i.id,
    nombreIngrediente: i.nombreIngrediente,
    cantidadDisponible: i.cantidadDisponible,
    unidadMedida: i.unidadMedida,
    puntoReorden: i.puntoReorden,
  }));

  return {
    ventas: {
      dia: sumarDesde(inicioDia),
      semana: sumarDesde(inicioSemana),
      mes: sumarDesde(inicioMes),
    },
    pedidosPorEstado,
    alertasInventario,
    totalPedidos: pedidos.length,
  };
}
