# Auditoría Sprint 3 — Bon Gout (2026-09-22, cierre anticipado)

Auditoría crítica del tercer incremento (seguridad especificada, despliegue
reproducible y evidencia medible), en el mismo formato que S1/S2.

## 1. Resumen

El Sprint 3 concentra seguridad (15% de la ponderación) y evidencia. Estado:
contratos OpenAPI congelados y lint en CI, threat model STRIDE con 6 amenazas,
presupuestos de rendimiento como contrato, deploy reproducible documentado y
release v0.1.0. La aplicación de mitigaciones en código (auth, zod en borde,
rate limiting, PG real) queda planificada como deuda explícita, no como
incumplimiento oculto.

## 2. Errores detectados en código/documentación asistida por IA

1. **Redocly no verificable en local:** `npx @redocly/cli` excedió el tiempo de
   descarga en la máquina de desarrollo. **Corrección:** validación estructural
   del YAML (5 paths, status 400/401/404/500, `bearerAuth`) + lint oficial en
   CI, donde la red lo permite. Evidencia: runs en verde con paso Lint OpenAPI.
2. **Compose con `version:` obsoleta y secretos:** heredado del Sprint 2.
   **Corrección:** PR #10 (sin `version`, sin secretos, con healthcheck).
3. **SPEC con doble sección 7** (Accesibilidad y Restricciones comparten número)
   y checkboxes RF sin tildar pese a estar implementados. **Corrección:**
   se renumera en SPEC vFinal (7 accesibilidad, 8 restricciones, 9 contratos,
   10 RNF) y se tildan RF-01/02/03 + RNF verificables.

## 3. Estado de calidad

| Eje | Estado |
|---|---|
| Git Flow | 5 PRs (`#9`–`#13`) `feature/*` → `main`, CI verde en cada uno, merge solo con CI en verde |
| Código | ESLint 9 limpio, `tsc` estricto, 31/31 tests (21 unit + 10 integración) |
| Seguridad | Especificada (contratos + STRIDE + arnés v3); aplicación en código: pendiente Sprint 3 operativo (deuda declarada) |
| Docs | SPEC vFinal, 6 ADRs, C4, OpenAPI, deploy, postmortem, CHANGELOG, informe final |

## 4. Entregables del sprint

| ID | Entregable | Estado |
|---|---|---|
| DEL-S3-01 | `api-contracts.yaml` implementada, linter limpio | ✅ Contrato + lint CI verde |
| DEL-S3-02 | Threat model + mitigaciones aplicadas | ⚠️ Modelo ✅, aplicación en código pendiente (deuda) |
| DEL-S3-03 | Presupuestos medidos con evidencia | ⚠️ Contrato ✅, medición activa con primer frontend |
| DEL-S3-04 | URL pública o artefacto reproducible | ✅ Artefacto reproducible (`docs/deploy/deploy.md`) |
| DEL-S3-05 | Auditoría Sprint 3 | ✅ Este documento |
