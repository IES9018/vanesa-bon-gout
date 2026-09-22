# Changelog — Bon Gout

Todos los cambios notables de este proyecto se documentan aquí, siguiendo
[Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [0.1.0] - 2026-09-22

Primera release del MVP: núcleo funcional + calidad + seguridad especificada.

### Agregado

- Backend Express + TypeScript: catálogo, carrito y pedidos con 31 tests
  (21 unitarios + 10 de integración con supertest).
- Contratos OpenAPI 3.0.3 (`docs/arquitectura/api-contracts.yaml`, 5 endpoints
  críticos, errores 400/401/404/500, `bearerAuth`).
- Pipeline CI (lint + tests + build + lint Redocly) en verde.
- Documentación completa: SPEC vFinal, ADR-001 a ADR-006, C4 N1/N2, threat
  model STRIDE, presupuestos de rendimiento, offline-sync, wireframes
  (desktop + móvil), auditorías S1/S2/S3, postmortem e informe final.
- Docker reproducible: imagen multi-etapa del backend + compose
  postgres + backend sin secretos versionados.

### Declarado como deuda (no bloquea la release)

- Persistencia en memoria con plan de migración a PostgreSQL en Sprint 3
  (`docs/arquitectura/deuda-sprint2.md`).
- Frontend SPA/PWA especificado (ADR-005/006) pendiente de implementación.
- Mitigaciones del threat model (auth, zod en borde, rate limiting) a aplicar
  en Sprint 3.
