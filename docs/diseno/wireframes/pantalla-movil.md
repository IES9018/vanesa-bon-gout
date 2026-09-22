# Wireframe adaptativo <400px — Catálogo y checkout móvil

**Fecha:** 2026-09-22
**Objetivo:** versión móvil (<400px) de las pantallas críticas del TP3 para la
persona Martín (compra con una mano, 4G). Targets táctiles ≥48px, jerarquía
lineal, sin tablas.

## Entrada

- Ruta `/` en viewport 360px; catálogo precargado del caché PWA si no hay red.

## Errores prevenidos

- Botón "Agregar" ≥48px evita toques erróneos (AC-03 focus visible incluido).
- Precio y stock siempre visibles antes del botón: impide agregar agotados
  (CA-02 del SPEC).
- Checkout en un solo paso vertical con resumen fijo abajo: evita abandono por
  scroll lateral o modales.

## Wireframe baja fidelidad (móvil 360px)

```
┌──────────────────────┐
│ ☰ Bon Gout    🛒(2)  │  <- header 56px, iconos 48px
├──────────────────────┤
│ [ Buscar...        ] │  <- input 48px, label asociado (AC-04)
├──────────────────────┤
│ ┌──────────────────┐ │
│ │ [img torta]      │ │
│ │ Torta chocolate  │ │
│ │ $4.500 · stock 5 │ │
│ │ [ (+) Agregar  ] │ │  <- botón 48px ancho completo
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ [img tarta]      │ │
│ │ Tarta de frutas  │ │
│ │ $3.800 · stock 3 │ │
│ │ [ (+) Agregar  ] │ │
│ └──────────────────┘ │
├──────────────────────┤
│ Total $8.300         │  <- barra fija inferior 64px
│ [ Ir al checkout ]   │
└──────────────────────┘

CHECKOUT (scroll vertical):
1. Resumen (2 ítems, total)
2. Fecha entrega [date] (ayuda: mínimo 48h)
3. Pago ( ) MercadoPago ( ) Transferencia
4. [ Confirmar pedido ] (48px)
```

Desktop (≥1024px) conserva la grilla de 3 columnas del TP3; diferencias
móvil: 1 columna, barra de total fija, sin sidebar de filtros (filtros en
`<details>` colapsable arriba).
