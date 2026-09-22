# Threat Model Lite — Bon Gout (STRIDE)

**Fecha:** 2026-09-22
**Alcance:** API Express (`backend/src/routes/`) + despliegue `docker-compose`.
Cada amenaza indica su mitigación y dónde se ubica en el repo.

| # | STRIDE | Amenaza concreta | Mitigación (ubicación) |
|---|---|---|---|
| T-01 | Spoofing | Uso de JWT ajeno o ausente en `PATCH /api/pedidos/:id/estado` (hoy sin auth: cualquiera cambia estados). | Exigir `bearerAuth` en endpoints de escritura; guardar secreto solo en `JWT_SECRET` por entorno (ya en `docker/.env.example`, nunca en código). Aplica en Sprint 3: middleware `auth` en `backend/src/`. |
| T-02 | Tampering | `cantidad` negativa o gigante en carrito altera totales (`actualizarCantidad` acepta cualquier número ≥1 tras `eliminarItem` solo si <1). | Validar/sanear en borde con `zod` (ya dependencia): schemas de `productoId`/`cantidad`/DTOs antes de llamar servicios. Contratos en `api-contracts.yaml` fijan `minimum: 1` y `maxLength`. |
| T-03 | Repudiation | Sin logs de quién cambió un estado de pedido: imposible auditar. | Middleware de auditoría que registra `usuario, endpoint, pedidoId, estadoAnterior/Nuevo` (Sprint 3, `backend/src/middleware/auditoria.ts`). |
| T-04 | Information Disclosure | `GET /api/pedidos` expone todos los pedidos sin filtro por cliente ni auth. | Paginación + filtro por `clienteId` autenticado; nunca devolver `passwordHash` (schema `usuarios` no se expone en ningún contrato). |
| T-05 | Denial of Service | `GET /api/productos/buscar/:termino` y listados sin límite permiten respuestas pesadas y abuso. | Paginación por defecto (20 ítems), `maxLength` en parámetros y rate limiting (`express-rate-limit`) en Sprint 3. |
| T-06 | Elevation of Privilege | `rol` (`admin`/`empleado`) existe en el schema pero ninguna ruta lo verifica: un cliente podría invocar rutas de gestión. | Middleware `requireRol('admin'|'empleado')` en rutas de gestión + `securitySchemes` ya declarados en `api-contracts.yaml`. |

## Reglas que ya rigen (arnés v3)

1. Prohibido hardcodear secretos (JWT, DB, MercadoPago) — solo variables de entorno.
2. Toda entrada se valida/sanea en el borde (rutas) antes de la lógica de negocio.
3. Todo endpoint nuevo se especifica primero en `api-contracts.yaml`.
