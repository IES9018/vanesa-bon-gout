import { Producto } from '../types';

const productos: Producto[] = [
  {
    id: 1,
    nombre: 'Torta de chocolate',
    descripcion: 'Torta artesanal de chocolate amargo con ganache',
    precioBase: 4500,
    categoria: 'Tortas',
    imagen: '/img/torta-chocolate.jpg',
    activo: true,
    stock: 5,
  },
  {
    id: 2,
    nombre: 'Tarta de frutas',
    descripcion: 'Tarta de frutas frescas de temporada',
    precioBase: 3800,
    categoria: 'Tortas',
    imagen: '/img/tarta-frutas.jpg',
    activo: true,
    stock: 3,
  },
  {
    id: 3,
    nombre: 'Alfajor x12',
    descripcion: 'Docena de alfajores artesanales de maicena',
    precioBase: 2200,
    categoria: 'Alfajores',
    imagen: '/img/alfajor-x12.jpg',
    activo: true,
    stock: 20,
  },
  {
    id: 4,
    nombre: 'Jugo natural',
    descripcion: 'Jugo natural de temporada 500ml',
    precioBase: 800,
    categoria: 'Bebidas',
    imagen: '/img/jugo-natural.jpg',
    activo: true,
    stock: 15,
  },
  {
    id: 5,
    nombre: 'Facturas x6',
    descripcion: 'Docena de facturas surtidas',
    precioBase: 1800,
    categoria: 'Facturas',
    imagen: '/img/facturas-x6.jpg',
    activo: true,
    stock: 0,
  },
];

export function obtenerTodos(): Producto[] {
  return productos.filter((p) => p.activo);
}

export function obtenerPorId(id: number): Producto | undefined {
  return productos.find((p) => p.id === id && p.activo);
}

export function obtenerPorCategoria(categoria: string): Producto[] {
  return productos.filter((p) => p.activo && p.categoria === categoria);
}

export function buscar(termino: string): Producto[] {
  const lower = termino.toLowerCase();
  return productos.filter(
    (p) =>
      p.activo &&
      (p.nombre.toLowerCase().includes(lower) ||
        p.descripcion.toLowerCase().includes(lower))
  );
}

export function verificarStock(id: number, cantidad: number): boolean {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return false;
  return producto.stock >= cantidad;
}
