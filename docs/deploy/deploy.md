# Despliegue reproducible — Bon Gout

**Fecha:** 2026-09-25 (actualizado Sprint 3 operativo)
**Estrategia (Sprint 3):** artefacto reproducible con Docker Compose
(postgres + backend + frontend). La URL pública queda como paso opcional;
este documento garantiza que cualquier máquina levanta el mismo stack.

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
docker compose ps      # postgres healthy, backend up, frontend up
curl http://localhost:3001/api/health   # {"status":"ok","db":"postgres",...}
```

## Inicializar la base (DT-01)

```bash
cd backend
DATABASE_URL=postgres://bongout:xxx@localhost:5432/bongout npm run db:migrate
```

Aplica `database/schema.sql` + seed del catálogo (idempotente). Sin
`DATABASE_URL` el backend opera con seed en memoria (útil para tests/CI).

## Emitir un JWT de gestión (T-01/T-06)

```bash
cd backend
JWT_SECRET=xxx npm run token -- admin   # imprime bearer 12h (admin|empleado)
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/pedidos
```

No existe endpoint de login para no romper los 5 contratos OpenAPI del TP4;
el token se firma localmente con el mismo `JWT_SECRET` del servidor.

## Verificación

| Chequeo | Comando | Esperado |
|---|---|---|
| Salud API | `curl localhost:3001/api/health` | `{"status":"ok","db":"postgres"}` |
| Catálogo | `curl "localhost:3001/api/productos?limit=20&offset=0"` | Array con 4+ productos |
| Frontend | abrir `http://localhost:5174` | Catálogo + checkout visibles |
| Tests | `cd backend && npm ci && npm test` | 31 passed |
| Lint OpenAPI | `npx @redocly/cli lint docs/arquitectura/api-contracts.yaml` | 0 errores |
| Build frontend | `cd frontend && npm ci && npm run build` | JS gzip ~47KB (<200KB) |

## Notas

- `JWT_SECRET` y `DB_PASSWORD` solo por entorno (arnés v3, T-01 del threat
  model). El compose falla con mensaje explícito si faltan (`:?`).
- Rate limiting (T-05): 200 req/min por IP en memoria; en producción
  horizontal reemplazar por Redis.
- URL pública: desplegar `backend/` + `frontend/dist/` en Render/Railway/Fly
  con las mismas env vars; registrar la URL en el informe final cuando exista.
