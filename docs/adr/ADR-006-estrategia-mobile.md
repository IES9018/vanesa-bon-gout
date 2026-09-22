# ADR-006: Estrategia Mobile del Sistema Bon Gout

**Fecha:** 2026-09-22
**Estado:** Aceptada

## Contexto

El TP5 exige una estrategia mobile medible. Personas de referencia
(`docs/diseno/usuarios.md`): Belén (administradora, gestiona desde el local con
wifi) y Martín (cliente, compra desde el celular con 4G inestable). Criterios:
1 persona objetivo, offline, hardware y tiempos de entrega.

## Decisión

**Responsive web + PWA instalable** sobre la SPA definida en ADR-005. Sin app
nativa ni híbrida en el MVP.

## Matriz de alternativas

| Criterio | Responsive + PWA (elegida) | Nativa (iOS/Android) | Híbrida (Capacitor/RN) |
|---|---|---|---|
| 1 persona (Martín compra en 4G) | ✅ Rápida, sin instalación | ⚠️ Fricción de store | ⚠️ Descarga pesada |
| Offline (ver catálogo sin señal) | ✅ Service Worker + caché (ver `offline-sync.md`) | ✅ Total | ✅ Parcial |
| Hardware (cámara/GPS) | N/A: no se requiere | ✅ Full | ✅ Vía plugins |
| Tiempos (equipo mínimo, vence 10/11) | ✅ Un solo código (ADR-004/005) | ❌ Dos códigos + stores | ❌ Toolchain extra |
| Costo despliegue | ✅ Mismo compose/Nginx | ❌ Cuentas developer + revisión | ⚠️ Build nativo igual |

## Alternativas Descartadas

- **Nativa:** sobredimensionada (sin hardware especial), duplica código y exige
  publicar en stores fuera del alcance del cuatrimestre.
- **Híbrida:** aporta poco sobre la PWA (no hay hardware) y suma toolchain
  nativo que el equipo no domina.
- **Solo-desktop:** incumple CA-06 (usable desde móviles) y deja fuera a Martín.

## Consecuencias

- La SPA suma manifiesto PWA + Service Worker (caché de catálogo e imágenes).
- Presupuestos medibles en `docs/arquitectura/presupuestos-rendimiento.md`
  (LCP <2.5s en 4G, INP <200ms, JS <200KB gzip), verificables en CI.
- Wireframes adaptativos <400px en `docs/diseno/wireframes/pantalla-movil.md`.
