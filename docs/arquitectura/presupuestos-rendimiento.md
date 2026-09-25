# Presupuestos de Rendimiento — Bon Gout SPA

**Fecha:** 2026-09-22
**Herramienta de medición:** Lighthouse CI (`@lhci/cli`) en el pipeline
(paso `Lighthouse` del workflow CI, presupuesto `budget.json` junto al
frontend cuando exista; hasta entonces rige como contrato de diseño).

## Presupuestos (red 4G Moto G4, umbrales mínimos)

| Métrica | Presupuesto | Justificación |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Catálogo visible rápido para Martín en 4G |
| INP (Interaction to Next Paint) | < 200ms | Agregar al carrito sin lag percibido |
| JS total (gzip) | < 200KB | SPA React + Tailwind con code-splitting por ruta |
| Imágenes catálogo | WebP, < 100KB c/u, `loading="lazy"` | El catálogo es el LCP; sin esto el presupuesto cae |

## Regla corregible en CI

Si Lighthouse reporta `lcp > 2.5s` o `js > 200KB`, el run falla y el merge se
bloquea (misma política que el resto del CI: PR rojo = merge prohibido). La
corrección típica es: paginar el catálogo (20 ítems, ver T-05 del threat
model), diferir el checkout con `React.lazy` y comprimir imágenes a WebP.

## Estado actual

~~La SPA aún no existe (DT-02); estos presupuestos son contrato previo (TP5) y se
activan en CI con el primer commit del `frontend/`.~~

Actualización 2026-09-25 (`feature/sprint3-operativo`): la SPA existe
(`frontend/`). Medición de build local (Vite 5, React 18):

| Métrica | Presupuesto | Medido | Estado |
|---|---|---|---|
| JS total (gzip) | < 200KB | 47KB (145KB raw) | ✅ |
| LCP móvil 4G | < 2.5s | pendiente URL pública (Lighthouse CI) | ⚠️ |
| INP | < 200ms | pendiente URL pública (Lighthouse CI) | ⚠️ |

Palancas ya aplicadas: catálogo paginado (`?limit=20`), imágenes con
`loading="lazy"`, SW con caché `GET /api/productos*` + tope implícito,
sin dependencias pesadas (solo `react`/`react-dom`). LCP/INP se miden con
Lighthouse CI contra la URL pública del Sprint 3.
