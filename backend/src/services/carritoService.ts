import { CarritoItem, Producto } from '../types';
import { obtenerPorId, verificarStock } from './productoService';

export interface Carrito {
  items: CarritoItem[];
}

const carritos: Map<number, Carrito> = new Map();

export function obtenerCarrito(clienteId: number): Carrito {
  if (!carritos.has(clienteId)) {
    carritos.set(clienteId, { items: [] });
  }
  return carritos.get(clienteId)!;
}

export function agregarItem(
  clienteId: number,
  productoId: number,
  cantidad: number,
  personalizaciones: string
): { success: boolean; message: string } {
  const producto = obtenerPorId(productoId);
  if (!producto) {
    return { success: false, message: 'Producto no encontrado' };
  }

  if (!verificarStock(productoId, cantidad)) {
    return {
      success: false,
      message: `Stock insuficiente. Disponible: ${producto.stock}`,
    };
  }

  const carrito = obtenerCarrito(clienteId);
  const existente = carrito.items.find((i) => i.productoId === productoId);

  if (existente) {
    const nuevaCantidad = existente.cantidad + cantidad;
    if (!verificarStock(productoId, nuevaCantidad)) {
      return {
        success: false,
        message: `Stock insuficiente. Disponible: ${producto.stock}`,
      };
    }
    existente.cantidad = nuevaCantidad;
    existente.personalizaciones = personalizaciones;
  } else {
    carrito.items.push({ productoId, cantidad, personalizaciones });
  }

  return { success: true, message: 'Producto agregado al carrito' };
}

export function eliminarItem(
  clienteId: number,
  productoId: number
): { success: boolean; message: string } {
  const carrito = obtenerCarrito(clienteId);
  const index = carrito.items.findIndex((i) => i.productoId === productoId);

  if (index === -1) {
    return { success: false, message: 'Producto no encontrado en el carrito' };
  }

  carrito.items.splice(index, 1);
  return { success: true, message: 'Producto eliminado del carrito' };
}

export function actualizarCantidad(
  clienteId: number,
  productoId: number,
  cantidad: number
): { success: boolean; message: string } {
  if (cantidad < 1) {
    return eliminarItem(clienteId, productoId);
  }

  if (!verificarStock(productoId, cantidad)) {
    const producto = obtenerPorId(productoId);
    return {
      success: false,
      message: `Stock insuficiente. Disponible: ${producto?.stock ?? 0}`,
    };
  }

  const carrito = obtenerCarrito(clienteId);
  const item = carrito.items.find((i) => i.productoId === productoId);

  if (!item) {
    return { success: false, message: 'Producto no encontrado en el carrito' };
  }

  item.cantidad = cantidad;
  return { success: true, message: 'Cantidad actualizada' };
}

export function calcularTotal(clienteId: number): number {
  const carrito = obtenerCarrito(clienteId);
  return carrito.items.reduce((total, item) => {
    const producto = obtenerPorId(item.productoId);
    return total + (producto ? producto.precioBase * item.cantidad : 0);
  }, 0);
}

export function limpiarCarrito(clienteId: number): void {
  carritos.set(clienteId, { items: [] });
}
