# ADR-004: Stack de UI y Design System

**Fecha:** 2026-09-09
**Estado:** Aceptado

## Contexto

El sistema Bon Gout requiere una interfaz web responsive que funcione en desktop y mobile. Las pantallas críticas son el catálogo de productos y el checkout. Se necesita un stack de UI que permita:

- Desarrollo rápido con componentes reutilizables.
- Accesibilidad básica (navegación por teclado, contraste AA).
- Compatibilidad con React + TypeScript (ya decidido en ADR-001).
- Personalización visual sin dependencia de un diseñador gráfico.

El equipo es una sola persona, por lo que la curva de aprendizaje y la documentación son factores críticos.

## Decision

Se adopta **Tailwind CSS** como framework de utilidades CSS para el estilizado de la interfaz.

Tailwind permite construir interfaces personalizadas sin depender de un design system predefinido, utilizando clases utilitarias directamente en el HTML/JSX. Esto es ideal para un MVP donde el diseño puede cambiar frecuentemente.

Complementos:
- **Tailwind CSS v3** para utilidades de diseño responsive.
- **Headless UI** para componentes accesibles (modals, dropdowns, tabs) sin estilos predefinidos.
- **Lucide React** para íconos ligeros y consistentes.

## Alternativas Descartadas

- **Opción A — Material UI (MUI):** Framework de componentes completo con design system de Google. Descartado porque: impone un estilo visual que no se adapta a la estética artesanal de Bon Gout, genera bundles grandes, y la personalización profunda requiere aprender el sistema de temas de MUI.

- **Opción B — Bootstrap / React-Bootstrap:** Framework de componentes con grid system. Descartado porque: el diseño es genérico y recognoscible, la personalización requiere sobreescribir estilos, y no está optimizado para React moderno (componentes functionales con hooks).

- **Opción C — Styled Components / CSS-in-JS:** Estilizado con CSS dentro de JavaScript. Descartado porque: agrega complejidad de runtime, los estilos no son versionables como archivos CSS puros, y la comunidad está migrando hacia soluciones de build-time (Tailwind, CSS Modules).

## Consecuencias

- **Positivas:**
  - Desarrollo rápido: las clases utilitarias permiten prototipar sin salir del JSX.
  - Personalización total: sin imposición de estilos predefinidos.
  - Accesibilidad: Headless UI maneja ARIA labels y focus management.
  - Bundle ligero: solo se incluyen las clases utilizadas (purging en build).
  - Comunidad activa y documentación excelente.

- **Negativas / Riesgos:**
  - Las clases utilitarias pueden hacer el JSX verboso.
  - No hay componentes predefinidos (botones, cards): hay que construirlos.
  - Requiere disciplina para mantener consistencia visual sin design system.
