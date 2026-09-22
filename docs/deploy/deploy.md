# Despliegue reproducible — Bon Gout

**Fecha:** 2026-09-22
**Estrategia (Sprint 3):** artefacto reproducible con Docker Compose
(postgres + backend). La URL pública queda para el Sprint 3 cuando exista el
frontend; este documento garantiza que cualquier máquina levanta el mismo
stack.

## Requisitos

- Docker Engine 24+ con plugin Compose v2, 2GB RAM libres.
- Archivo `docker/.env` creado desde `docker/.env.example` con secretos reales
  (nunca commitear el `.env`).

## Pasos

```bash
cd docker
cp .env.example .env   # completar DB_PASSWORD y JWT_SECRET
docker compose build
docker compose up -d
docker compose ps      # postgres healthy, backend up
curl http://localhost:3001/api/health   # {"status":"ok",...}
```

## Verificación

| Chequeo | Comando | Esperado |
|---|---|---|
| Salud API | `curl localhost:3001/api/health` | `{"status":"ok"}` |
| Catálogo | `curl localhost:3001/api/productos` | Array con 4+ productos |
| Tests | `cd backend && npm ci && npm test` | 31 passed |
| Lint OpenAPI | `npx @redocly/cli lint docs/arquitectura/api-contracts.yaml` | 0 errores |

## Notas

- `JWT_SECRET` y `DB_PASSWORD` solo por entorno (arnés v3, T-01 del threat
  model). El compose falla con mensaje explícito si faltan (`:?`).
- La base se inicializa aplicando `database/schema.sql` contra postgres cuando
  se complete DT-01 (hoy el backend opera en memoria).
