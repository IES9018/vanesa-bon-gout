# Evidencia Lighthouse — URL pública (Sprint 3)

Mediciones LCP/INP contra el frontend desplegado en Render. Se completan
después del deploy (`docs/deploy/deploy.md`, sección Render).

## URLs (completar tras el Apply del Blueprint)

- Frontend: `https://bongout-frontend.onrender.com` _(ajustar al subdominio real)_
- Backend: `https://bongout-backend.onrender.com`

## Procedimiento (Chrome DevTools, 3 corridas)

1. Abrir el frontend en incógnito (2.º load, para excluir el cold start del
   free tier; registrar también el 1.er load como referencia).
2. DevTools → Lighthouse → Mobile, 4G simulado → solo Performance.
3. Guardar en esta carpeta: `lcp-1.png`, `lcp-2.png`, `lcp-3.png` + tabla:

| Corrida | LCP | INP | JS gzip | Load | Estado |
|---|---|---|---|---|---|
| 1 (cold) | _._s | _ms | 47KB | 1.er | referencia |
| 2 | _._s | _ms | 47KB | 2.º | vs presupuesto |
| 3 | _._s | _ms | 47KB | 2.º | vs presupuesto |

Presupuestos: LCP < 2.5s, INP < 200ms, JS < 200KB
(`docs/arquitectura/presupuestos-rendimiento.md`).

## Estado

⚠️ Pendiente de URL pública. JS ya medido (47KB gzip OK).
Tras pegar la tabla, actualizar `presupuestos-rendimiento.md` y el addendum
de `auditoria-sprint3.md`, y referenciar desde el informe final.
