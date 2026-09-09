# ADR-002: Estilo Arquitectonico del Sistema Bon Gout

**Fecha:** 2026-09-09
**Estado:** Aceptado

## Contexto

Bon Gout es un sistema de e-commerce y gestion para una pasteleria artesanal.
El equipo de desarrollo es una sola persona (estudiante de 3er ano). El plazo
de entrega del MVP es el cierre del cuatrimestre 2026. Se necesita una
arquitectura que permita desarrollo rapido, mantenibilidad sencilla y despliegue
sencillo.

Los requisitos que condicionan la decision son:

- Equipo reducido (1 persona).
- Plazo ajustado (materia anual, entregas por sprints).
- Necesidad de desplegar con Docker de forma reproduccible.
- Futura posibilidad de escalar si el negocio crece.

## Decision

Se adopta una **arquitectura monolitica modular en capas** (layered monolith).

La estructura sera:

```
frontend/       -> React + TypeScript (Vite)
backend/        -> Node.js + Express (API REST)
database/       -> PostgreSQL (esquema relacional)
docs/           -> ADRs, diagramas, auditorias
docker/         -> docker-compose.yml
```

El backend se organiza en capas:

- **Rutas** (routes/): Definicion de endpoints REST.
- **Controladores** (controllers/): Validacion de entrada y orquestacion.
- **Servicios** (services/): Logica de negocio.
- **Repositorios** (repositories/): Acceso a datos.
- **Modelos** (models/): Definicion de tipos e interfaces.

## Alternativas Descartadas

- **Opcion A - Microservicios:** Separar catalogo, pedidos, pagos e inventario
  en servicios independientes. Descartado porque: el equipo es 1 persona, la
  complejidad operativa (Docker Compose, redes, descubrimiento) es desproporcionada
  para el tamano del proyecto, y el plazo no permite aprender orquestacion
  (Kubernetes o ECS).

- **Opcion B - Serverless (AWS Lambda / Vercel Functions):** Ejecutar la logica
  en funciones disparadas por eventos. Descartado porque: genera dependencia con
  un proveedor cloud especifico, dificulta el despliegue local con Docker, y
  el modelo de ejecucion por frio agrega latencia impredecible al checkout.

- **Opcion C - Arquitectura basada en eventos (Event Sourcing):** Registrar
  todas las acciones como una secuencia de eventos inmutables. Descartado porque:
  la complejidad de implementacion es alta, el equipo no tiene experiencia con
  el patron, y no se justifica para un MVP con volumen bajo de transacciones.

## Consecuencias

- **Positivas:**
  - Desarrollo rapido: todo el codigo vive en un solo repo, un solo proceso.
  - Despliegue sencillo: docker-compose levanta frontend, backend y base de datos.
  - Depuracion sencilla: un solo breakpoint cubre todo el flujo.
  - Mantenibilidad: la estructura en capas es predecible y facil de explicar.

- **Negativas / Riesgos:**
  - Si el negocio crece significativamente, habra que separar en microservicios.
  - Todos los modulos comparten el mismo proceso (un error puede afectar todo).
  - No permite escalado independiente por modulo.
