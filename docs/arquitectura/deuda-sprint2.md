# Deuda técnica declarada — Sprint 2 (2026-09-22)

Documento de sinceramiento operativo exigido por el checklist del Sprint 2.
No modifica decisiones de los ADR; registra el estado real y el plan de cierre.

## DT-01: Persistencia en memoria (alta)

- **Estado real:** `productoService.ts` guarda el catálogo en un arreglo en
  memoria y `carritoService.ts`/`pedidoService.ts` usan `Map`/arreglos. Ningún
  servicio importa `pg`, aunque la dependencia existe en `package.json`.
- **Decisión vigente:** ADR-003 ordena PostgreSQL y `database/schema.sql` ya
  define las 6 tablas (productos, clientes, usuarios, pedidos,
  detalle_pedido, inventario).
- **Riesgo:** se pierden datos al reiniciar; no hay concurrencia real.
- **Plan de cierre (Sprint 3):** capa `backend/src/db/` con `Pool` (`pg`)
  configurado por `DATABASE_URL`, repositorios por agregado y migración que
  aplique `schema.sql`. Los contratos OpenAPI (`api-contracts.yaml`) ya quedan
  congelados en el TP4, así que el cambio será interno sin romper la API.

## DT-02: Sin frontend (media)

- **Estado real:** no existe `frontend/`, aunque SPEC, README y ADR-004 lo
  declaran (React + Vite + Tailwind).
- **Plan de cierre:** app mínima (catálogo + checkout, responsive <400px) en el
  Sprint 3 / TP5. El `docker-compose.yml` ya no la referencia hasta que exista
  su `Dockerfile` (antes la referenciaba rota).

## DT-03: Docker reparado en este incremento (cerrada)

- **Estaba:** `docker-compose.yml` referenciaba `../frontend/Dockerfile`
  inexistente y traía secretos hardcodeados (`bongout_secret`,
  `cambio-en-produccion`).
- **Quedó:** servicios `postgres` (con healthcheck) + `backend` (imagen
  multi-etapa `backend/Dockerfile`), secretos por variables de entorno
  (`docker/.env.example` como plantilla, `.env` no versionado).

## DT-04: Seguridad web mínima (media, insumo TP4)

- Sin auth en rutas, sin validación robusta de entradas (solo chequeos de
  presencia), sin rate limiting. El threat model STRIDE y los contratos con
  `securitySchemes` llegan en el TP4; la aplicación de mitigaciones, en el
  Sprint 3.
