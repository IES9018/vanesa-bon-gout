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

const BASE = import.meta.env.VITE_API_URL || '';

export async function listarProductos(): Promise<Producto[]> {
  // Paginado en servidor (T-05): 20 ítems por defecto.
  const res = await fetch(`${BASE}/api/productos?limit=20&offset=0`);
  if (!res.ok) throw new Error(`Catálogo: HTTP ${res.status}`);
  return (await res.json()) as Producto[];
}

export async function crearPedido(body: {
  clienteId: number;
  fechaEntrega: string;
  metodoPago: 'mercadopago' | 'transferencia' | 'efectivo';
  observaciones: string;
  items: Array<{ productoId: number; cantidad: number; personalizaciones: string }>;
  token?: string;
}): Promise<unknown> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (body.token) headers['Authorization'] = `Bearer ${body.token}`;
  const res = await fetch(`${BASE}/api/pedidos`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `Pedido: HTTP ${res.status}`);
  }
  return await res.json();
}
