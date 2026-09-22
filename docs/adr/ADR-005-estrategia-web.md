# ADR-005: Estrategia Web del Sistema Bon Gout

**Fecha:** 2026-09-22
**Estado:** Aceptada

## Contexto

El TP4 exige decidir la estrategia web antes de escalar el frontend (hoy
inexistente, ver `docs/arquitectura/deuda-sprint2.md` DT-02). La API Express ya
opera con 5 endpoints críticos (`docs/arquitectura/api-contracts.yaml`) y el
stack de UI está fijado en Tailwind + Headless UI (ADR-004). Hay que elegir cómo
se consume y despliega la web: SPA, SSR, MPA o solo-API.

## Decisión

Se adopta **SPA (React + Vite) consumiendo la API REST existente**, con
renderizado 100% en cliente y despliegue como estático detrás del mismo
`docker-compose` (servicio `frontend` con Nginx).

## Alternativas Descartadas

- **Opción A — SSR (Next.js):** mejora SEO y primer render, pero duplica la
  superficie (servidor Node de render + API Express), exige Node en producción
  para el frontend y complica el compose. Descartada: el catálogo no necesita
  SEO agresivo (venta por WhatsApp/redes) y el equipo es mínimo.
- **Opción B — MPA clásica (vistas en servidor):** rompería ADR-001 (React) y
  ADR-004 (Tailwind + Headless), obligaría a reescribir la API en vistas y
  perdería el contrato OpenAPI como fuente de verdad. Descartada.
- **Opción C — Solo-API sin web propia:** minimiza trabajo, pero incumple
  RF-01/RF-02/RF-03 (catálogo, carrito y checkout online) y deja al negocio sin
  canal de venta. Descartada: solo sería válida como Non-Goal temporal, no como
  estrategia final.

## Consecuencias

- El frontend vive en `frontend/` (Vite + React + TS estricto) y se sirve como
  estático; la API sigue siendo la única fuente de verdad (contratos YAML).
- Los presupuestos de rendimiento del TP5 aplican al bundle SPA (JS <200KB
  gzip, LCP <2.5s en 4G).
- La autenticación web usa el mismo `bearerAuth` JWT de los contratos; el token
  se guarda en memoria de la SPA (no en `localStorage`) según el threat model.
