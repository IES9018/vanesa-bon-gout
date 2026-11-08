export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precioBase: number;
  categoria: string;
  imagen: string;
  activo: boolean;
  stock: number;
}

export interface Pedido {
  id: number;
  clienteId: number;
  fechaPedido: Date;
  fechaEntrega: Date;
  estado: 'pendiente' | 'en_produccion' | 'en_entrega' | 'entregado' | 'cancelado';
  total: number;
  observaciones: string;
}

export interface DetallePedido {
  id: number;
  pedidoId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  personalizaciones: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaRegistro: Date;
  puntosFidelidad: number;
}

export interface CarritoItem {
  productoId: number;
  cantidad: number;
  personalizaciones: string;
}

export interface CrearPedidoDTO {
  clienteId: number;
  fechaEntrega: string;
  metodoPago: 'mercadopago' | 'transferencia' | 'efectivo';
  observaciones: string;
  items: CarritoItem[];
}

// --- RF-06 Inventario (SPEC v6) ---

export interface Inventario {
  id: number;
  nombreIngrediente: string;
  cantidadDisponible: number;
  unidadMedida: string;
  puntoReorden: number;
  requiereReposicion: boolean;
}

export interface MovimientoInventario {
  id: number;
  inventarioId: number;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo: string;
  pedidoId: number | null;
  creadoEn: Date;
}

export interface CrearMovimientoDTO {
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo: string;
  pedidoId?: number | null;
}
