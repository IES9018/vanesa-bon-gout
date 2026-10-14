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

---

## Despliegue en Render (URL pública, Sprint 3)

**Fecha:** 2026-10-14 (`feature/deploy-render`)
**Blueprint:** `render.yaml` en la raíz (postgres + backend Node + frontend
estático). Sin secretos versionados.

### Qué crea el Blueprint

| Servicio | Tipo | Config |
|---|---|---|
| `bongout-db` | PostgreSQL free (1GB) | `databaseName: bongout`, `user: bongout` |
| `bongout-backend` | Web Node (`rootDir: backend`) | build `npm ci && npm run build`, start `node dist/index.js`, `preDeployCommand: npm run db:migrate`, healthcheck `/api/health` |
| `bongout-frontend` | Static (`rootDir: frontend`) | build `npm ci && npm run build`, publish `dist`, rewrite `/* → /index.html` |

Variables cableadas por el Blueprint (no copiar a mano):
`DATABASE_URL` (backend ← base), `JWT_SECRET` (generado), `CORS_ORIGIN`
(backend ← host frontend), `VITE_API_URL` (frontend ← host backend, horneado
en el build de Vite).

### Cambios de código que lo hacen funcionar en Render

- `backend/src/db/pool.ts`: SSL (`rejectUnauthorized: false`) solo si la
  URL es remota (`render.com` / `sslmode=require` / `PGSSL=require`); en
  local sigue sin SSL y los tests/CI no cambian.
- `backend/src/app.ts`: `CORS_ORIGIN` restringe orígenes (acepta host pelado
  o URL, lista con comas); vacío = abierto (local/dev).
- `backend/src/index.ts`: escucha en `0.0.0.0` + `PORT` numérico (Render
  inyecta `PORT=10000`).
- `frontend/src/api.ts`: normaliza `VITE_API_URL` pelado a `https://`
  (Render entrega host sin esquema).
- `frontend/nginx.conf`: fallback SPA + cache de `/assets/*` (solo compose
  local; en Render el rewrite vive en `render.yaml`).

### Pasos en el dashboard (manual, 10 min)

1. Crear cuenta en <https://render.com> y conectar GitHub (org `IES9018`).
2. New → Blueprint → repo `IES9018/vanesa-bon-gout`, rama `main`,
   confirmar 3 recursos (`bongout-db`, `bongout-backend`, `bongout-frontend`).
3. Apply. Esperar: base `available` → backend deploy con `preDeploy`
   (`Migración OK`) → frontend `Live`.
4. Anotar URLs: `https://bongout-backend.onrender.com`,
   `https://bongout-frontend.onrender.com` (el subdominio real lo asigna
   Render; si difiere, actualizar esta sección y `presupuestos`).

### Verificación contra la URL pública

```bash
curl https://bongout-backend.onrender.com/api/health
# {"status":"ok","db":"postgres",...}
curl "https://bongout-backend.onrender.com/api/productos?limit=20&offset=0"
# Array con 5 productos (seed de migrate.ts)
```

Abrir el frontend: catálogo visible + checkout funcional. Primer load puede
tardar ~50s si el free tier estaba dormido (sleep tras 15 min inactivo).

### Límites del free tier (declarados para la defensa)

- Web free duerme tras 15 min sin tráfico; el primer request despierta.
- PostgreSQL free expira a los 30 días; para la defensa alcanza, para uso
  real migrar a plan pago o VPS.
- Si LCP sale alto por el cold start, medir el 2.º load y registrar ambas
  cifras (ver `docs/arquitectura/presupuestos-rendimiento.md`).
