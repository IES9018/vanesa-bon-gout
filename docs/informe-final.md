# Informe final — Bon Gout (cierre 2026-09-22)

## Qué se construyó

Sistema Digital Integral para la pastelería Bon Gout (Malargüe): API REST
Express + TypeScript (catálogo, carrito, pedidos con regla 48h y control de
stock), 31 tests verdes, contratos OpenAPI, Docker reproducible y
documentación trazable SPEC→ADR→código→test.

## Cómo se trabajó

Spec-Driven Development con arnés de IA (`.opencoderules` vFinal): cada
entrega en rama `feature/*` con PR y CI verde (lint + tests + build + Redocly).
13 PRs mergeados, Issue #1 cerrado con evidencia, deuda declarada en lugar de
oculta (`deuda-sprint2.md`, postmortem con 4 incidentes).

## Estado por entrega

| Entrega | Estado |
|---|---|
| TP1 SDD + arnés | ✅ PR #2 |
| Sprint 1 | ✅ PR #4 |
| TP2 C4 + ADR-002/003 | ✅ PR #5 |
| README | ✅ PR #6 |
| TP3 HCI + ADR-004 | ✅ PR #7 (validez anticipada a confirmar) |
| Sprint 2 núcleo | ✅ PR #8, reparado PR #10 |
| CI | ✅ PR #9, verde en `main` |
| TP4 API + ADR-005 + STRIDE | ✅ PR #11 |
| TP5 mobile + ADR-006 | ✅ PR #12 |
| TP6 + cierre + release v0.1.0 | ✅ PR #13 (este) |

## Deuda conocida y plan

1. PostgreSQL real (DT-01): repositorios + Pool en Sprint 3 operativo.
2. Frontend SPA/PWA (DT-02): catálogo + checkout responsive.
3. Mitigaciones STRIDE en código (T-01 a T-06): auth, zod, auditoría,
   paginación, rate limiting, roles.

## Demo (5 min)

1. `docker compose up` + `curl /api/health` y `/api/productos`.
2. Crear pedido válido (201) y mostrar rechazo <48h (400).
3. Mostrar CI verde + contrato OpenAPI + regla de negocio en SPEC (CA-08).
4. Non-Goal declarado: app nativa (NG-07) — se cubre con PWA.
