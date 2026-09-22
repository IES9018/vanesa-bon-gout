# Postmortem del cuatrimestre — Bon Gout (TP6)

**Fecha:** 2026-09-22
**Período:** 26/08/2026 (repo vacío) → 22/09/2026 (release v0.1.0).

## Incidente 1 — Repo vacío sin `main`: el PR no tenía base

- **Evidencia:** PR #2 (`feature/tp1-sdd`) falló al crearse porque el repo se
  creó totalmente vacío y no existía la rama `main`.
- **Causa:** se asumió que GitHub crea `main` solo; solo lo hace con README,
  `.gitignore` o licencia inicial.
- **Corrección:** se creó `main` con README base y se reconstruyó la feature
  encima. Desde entonces, toda entrega usa `feature/*` → PR → `main`.
- **Aprendizaje:** inicializar el repo con `main` explícito antes del primer PR.

## Incidente 2 — `npm run lint` rojo desde el día uno

- **Evidencia:** PR #9 (CI): el script `lint` (`eslint src/ --ext .ts`) fallaba
  porque `eslint` no estaba en `devDependencies` y `--ext` está deprecado en
  ESLint 9; además `carritoService.ts` tenía un import sin usar.
- **Causa:** código asistido por IA sin arnés de lint verificado localmente.
- **Corrección:** ESLint 9 + flat config `backend/eslint.config.mjs`, script
  actualizado y fix del import. CI en verde desde entonces.
- **Aprendizaje:** ningún PR de código sin `lint + tests + build` verdes en
  local primero (hoy lo exige el CI).

## Incidente 3 — Docker que nunca pudo levantar

- **Evidencia:** `docker-compose.yml` del Sprint 2 referenciaba
  `../frontend/Dockerfile` inexistente, no existía `backend/Dockerfile` y había
  secretos hardcodeados (`bongout_secret`, `cambio-en-produccion`).
- **Causa:** compose escrito por IA sin validar contra el árbol real del repo.
- **Corrección (PR #10):** compose solo postgres + backend, secretos por
  entorno (`.env.example`), `backend/Dockerfile` multi-etapa y deuda declarada.
- **Aprendizaje:** validar `docker compose config` y cruzar cada `context` con
  archivos existentes; el arnés v3 prohíbe secretos en código.

## Incidente 4 — Persistencia declarada pero no implementada

- **Evidencia:** ADR-003 ordena PostgreSQL y existe `schema.sql`, pero los
  servicios usan arreglos/`Map` en memoria (ningún import de `pg`).
- **Causa:** el MVP priorizó lógica de negocio testeable; la IA no alertó la
  incoherencia SPEC↔código.
- **Corrección:** deuda DT-01 declarada con plan de cierre (repositorios + Pool
  en Sprint 3) en lugar de simular que existe.
- **Aprendizaje:** declarar la deuda explícitamente es mejor que el "casi
  funciona": la auditoría puede verificarla.

## Reflexión (5 líneas)

El arnés (`.opencoderules`) funcionó cuando se lo consultó antes de generar
código, y falló cada vez que se generó primero y se auditó después. La
trazabilidad SPEC→ADR→código→test permitió detectar los 4 incidentes sin
adivinar. El CI convirtió esas lecciones en reglas automáticas. Queda pendiente
aplicar el mismo rigor al frontend cuando exista. El proyecto llega a la
defensa con deuda conocida, medida y planificada, no escondida.
