import { useEffect, useState } from 'react';
import { listarProductos, crearPedido, Producto } from './api';

interface Item {
  productoId: number;
  cantidad: number;
}

// Pantallas críticas TP3 adaptadas a móvil <400px (TP5):
// - targets táctiles >=48px, jerarquía simplificada, checkout en 1 columna.
export default function App(): JSX.Element {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<Item[]>([]);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    listarProductos().then(setProductos).catch((e: Error) => setError(e.message));
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  const filtrados = productos.filter(
    (p) =>
      busqueda.trim() === '' ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  function agregar(productoId: number): void {
    setCarrito((prev) => {
      const ex = prev.find((i) => i.productoId === productoId);
      if (ex) return prev.map((i) => (i.productoId === productoId ? { ...i, cantidad: Math.min(i.cantidad + 1, 100) } : i));
      return [...prev, { productoId, cantidad: 1 }];
    });
  }

  const total = carrito.reduce((acc, i) => {
    const p = productos.find((x) => x.id === i.productoId);
    return acc + (p ? p.precioBase * i.cantidad : 0);
  }, 0);

  async function checkout(): Promise<void> {
    setError('');
    setOk('');
    if (carrito.length === 0) {
      setError('El carrito está vacío');
      return;
    }
    try {
      const fecha = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
      await crearPedido({
        clienteId: 1,
        fechaEntrega: fecha,
        metodoPago: 'mercadopago',
        observaciones: '',
        items: carrito.map((i) => ({ ...i, personalizaciones: '' })),
      });
      setOk('Pedido creado. Te contactaremos por WhatsApp para coordinar.');
      setCarrito([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear el pedido');
    }
  }

  return (
    <main className="layout">
      <header className="hero">
        <h1>Bon Gout — Catálogo</h1>
        <p>Pastelería artesanal · Pedidos con 48h de anticipación</p>
        <input
          aria-label="Buscar productos"
          placeholder="Buscar tortas, alfajores…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </header>

      {error !== '' && <p role="alert" className="alerta">{error}</p>}
      {ok !== '' && <p className="exito">{ok}</p>}

      <section className="grid">
        {filtrados.map((p) => (
          <article key={p.id} className="card">
            <img src={p.imagen} alt={p.nombre} loading="lazy" width={400} height={300} />
            <h2>{p.nombre}</h2>
            <p>{p.descripcion}</p>
            <p className="precio">${p.precioBase} · Stock: {p.stock}</p>
            <button type="button" onClick={() => agregar(p.id)} disabled={p.stock < 1}>
              {p.stock < 1 ? 'Sin stock' : 'Agregar'}
            </button>
          </article>
        ))}
      </section>

      <section className="checkout">
        <h2>Checkout ({carrito.length} ítems) — Total ${total}</h2>
        <button type="button" onClick={() => void checkout()}>
          Confirmar pedido
        </button>
      </section>
    </main>
  );
}
