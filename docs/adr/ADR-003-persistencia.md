# ADR-003: Estrategia de Persistencia

**Fecha:** 2026-09-09
**Estado:** Aceptado

## Contexto

El sistema Bon Gout requiere persistir datos de productos, pedidos, clientes,
inventario y usuarios. El modelo de datos del SPEC incluye relaciones 1:N
(pedido a detalle de pedido), integridad referencial (productos con categorias,
pedidos con clientes), y operaciones transaccionales (registro de pedido con
descuento de stock).

Los criterios de seleccion son:

- Integridad referencial (ACID) para pagos y stock.
- Consultas complejas para el dashboard (ventas diarias, semanales, mensuales).
- Compatibilidad con Docker y despliegue local.
- Curva de aprendizaje razonable para un estudiante de 3er ano.

## Decision

Se adopta **PostgreSQL** como sistema de base de datos relacional.

PostgreSQL cubre los requisitos de integridad referencial, soporta transacciones
ACID, permite consultas analiticas para el dashboard, y tiene excelente
compatibilidad con Docker mediante la imagen oficial. Ademas, el ecosistema de
herramientas (migraciones, clientes SQL) es maduro y bien documentado.

## Alternativas Descartadas

- **Opcion A - MongoDB (NoSQL):** Base de datos documental. Descartada porque:
  el modelo de datos del SPEC es relacional (relaciones 1:N, integridad
  referencial). MongoDB no garantiza atomicidad cross-document de forma nativa,
  lo que complica la transaccion de pedido + descuento de stock. Las consultas
  analiticas para el dashboard requieren agregaciones complejas menos naturales
  que en SQL.

- **Opcion B - SQLite (embebida):** Base de datos embebida en el archivo.
  Descartada porque: no soporta concurrencia de escritura (un solo escritor a
  la vez), lo que limita el uso real. No tiene usuario/contraseña por defecto,
  lo que dificulta la separacion backend-database en Docker. No escala si el
  negocio crece.

- **Opcion C - MySQL:** Similar a PostgreSQL pero con menos funcionalidades
  avanzadas (CTEs, JSON nativo, tipos enum). Descartada porque: PostgreSQL es
  mas completo para consultas analiticas, tiene mejor soporte de tipos
  nativos, y la comunidad academica lo recomienda para proyectos nuevos.

## Consecuencias

- **Positivas:**
  - Integridad referencial garantizada (ACID).
  - Consultas analiticas potentes para el dashboard.
  - Excelente compatibilidad con Docker (imagen oficial postgres:16).
  - Migraciones versionadas con herramientas como Knex.js o TypeORM.

- **Negativas / Riesgos:**
  - Requiere conocimientos de SQL (no es obstacle para el equipo).
  - El esquema relacional es mas rigido que un esquema documental.
  - Si se cambia a NoSQL en el futuro, habra que migrar datos.
