# Threat Model Lite — Bon Gout (STRIDE)

**Fecha:** 2026-09-22
**Alcance:** API Express (`backend/src/routes/`) + despliegue `docker-compose`.
Cada amenaza indica su mitigación y dónde se ubica en el repo.

| # | STRIDE | Amenaza concreta | Mitigación (ubicación) |
|---|---|---|---|
| T-01 | Spoofing | Uso de JWT ajeno o ausente en `PATCH /api/pedidos/:id/estado` (hoy sin auth: cualquiera cambia estados). | ✅ Aplicada: `requireAuth` + `requireRol('admin','empleado')` en `backend/src/routes/pedidoRoutes.ts`; secreto solo en `JWT_SECRET` (`docker/.env.example`); emisión sin endpoint nuevo en `backend/src/auth/emitToken.ts` (`npm run token`). En `NODE_ENV=test` se relaja para la suite (31 tests). |
| T-02 | Tampering | `cantidad` negativa o gigante en carrito altera totales (`actualizarCantidad` acepta cualquier número ≥1 tras `eliminarItem` solo si <1). | ✅ Aplicada: `validateBody` con `zod` en `backend/src/middleware/validate.ts` (`agregarItemSchema`: cantidad 1..100, `personalizaciones` ≤280; `crearPedidoSchema` con `items` 1..50; `cambiarEstadoSchema` con enum) cableado en `carritoRoutes.ts` y `pedidoRoutes.ts`. Contratos en `api-contracts.yaml` fijan `minimum: 1` y `maxLength`. |
| T-03 | Repudiation | Sin logs de quién cambió un estado de pedido: imposible auditar. | ✅ Aplicada: `auditLog('pedido.estado', …)` en `backend/src/middleware/security.ts`, invocado en `PATCH /:id/estado` (`pedidoRoutes.ts`) con `pedidoId, anterior, nuevo, usuario`. |
| T-04 | Information Disclosure | `GET /api/pedidos` expone todos los pedidos sin filtro por cliente ni auth. | ✅ Aplicada: `GET /` y `GET /cliente/:clienteId` exigen `requireAuth`; `GET /` además `requireRol('admin','empleado')`; listados topados a 50 (`pedidoRoutes.ts`). `passwordHash` nunca se expone (sin schema en contratos). |
| T-05 | Denial of Service | `GET /api/productos/buscar/:termino` y listados sin límite permiten respuestas pesadas y abuso. | ✅ Aplicada: `parsePagination` (defecto 20, máx 50) + `sanitizeTermino` (≤80) en `middleware/validate.ts`; `rateLimit(200/min)` en `backend/src/app.ts` (`middleware/security.ts`, en memoria; Redis documentado para horizontal). Frontend pide `?limit=20`. |
| T-06 | Elevation of Privilege | `rol` (`admin`/`empleado`) existe en el schema pero ninguna ruta lo verifica: un cliente podría invocar rutas de gestión. | ✅ Aplicada: `requireRol('admin'\|'empleado')` en `GET /api/pedidos` y `PATCH /:id/estado` (`pedidoRoutes.ts`); `securitySchemes` ya declarados en `api-contracts.yaml`. |

## Reglas que ya rigen (arnés v3)

1. Prohibido hardcodear secretos (JWT, DB, MercadoPago) — solo variables de entorno.
2. Toda entrada se valida/sanea en el borde (rutas) antes de la lógica de negocio.
3. Todo endpoint nuevo se especifica primero en `api-contracts.yaml`.
