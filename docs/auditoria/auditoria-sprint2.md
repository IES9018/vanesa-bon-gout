# Auditoria Critica Sprint 2

Estudiante: Vanessa (Anmonte)
Proyecto: Sistema Digital Integral Bon Gout
Periodo: Sprint 2 (21 septiembre - 16 octubre 2026)

## 1. Resumen del Sprint 2

El Sprint 2 se enfoco en el nucleo funcional del sistema y la calidad local.
Se implementaron los servicios de negocio (producto, carrito, pedido), se
completo el TP3 (interfaces HCI con personas, journeys, wireframes y
auditoria heuristica), y se configuro la suite de pruebas unitarias.

## 2. Entregables del Sprint 2

| Entregable | Estado | Ubicacion |
|---|---|---|
| Estructura backend (Express + TypeScript) | Completado | backend/ |
| Servicio de productos (RF-01) | Completado | backend/src/services/productoService.ts |
| Servicio de carrito (RF-02) | Completado | backend/src/services/carritoService.ts |
| Servicio de pedidos (RF-03) | Completado | backend/src/services/pedidoService.ts |
| Rutas API REST | Completado | backend/src/routes/ |
| Suite de pruebas (21 tests) | Completado | backend/src/__tests__/ |
| Reporte de pruebas | Completado | docs/pruebas/reporte-sprint2.md |
| Diagramas C4 | Completado | docs/arquitectura/ |
| TP3: Personas y journeys | Completado | docs/diseno/usuarios.md |
| TP3: Wireframes | Completado | docs/diseno/wireframes/ |
| TP3: Auditoria heuristica | Completado | docs/diseno/auditoria-heuristica.md |
| ADR-004 (Stack UI) | Completado | docs/adr/ADR-004-stack-ui.md |
| SPEC v3 | Completado | SPEC.md |
| Schema de base de datos | Completado | database/schema.sql |
| Docker Compose | Completado | docker/docker-compose.yml |

## 3. Errores detectados en codigo asistido por IA y correcciones

### 3.1 Validacion de fecha minima en pedidos

- Error: El servicio de pedidos no validaba que la fecha de entrega fuera
  mayor a 48 horas desde la fecha actual.
- Correccion: Se agrego validacion en crearPedido() que calcula la diferencia
  en horas y rechaza fechas menores a 48 horas.
- Evidencia: Test "crearPedido falla si la fecha es menor a 48 horas" en
  pedido.test.ts.

### 3.2 Stock negativo en carrito

- Error: El servicio de carrito permitia agregar cantidades que excedian el
  stock disponible cuando se modificaba la cantidad de un item existente.
- Correccion: Se agrego validacion de stock en actualizarCantidad() que
  verifica la cantidad contra el stock disponible.
- Evidencia: Test "actualizarCantidad modifica cantidad correctamente" en
  carrito.test.ts.

### 3.3 Calculo de total del carrito

- Error: El calculo del total no consideraba la cantidad de cada item,
  solo sumaba el precio base.
- Correccion: Se multiplica precioBase * cantidad en el reduce de
  calcularTotal().
- Evidencia: Test "calcularTotal suma correctamente los precios" en
  carrito.test.ts.

## 4. Estado de calidad

### 4.1 Suite de pruebas

- 21 tests unitarios pasando en 3 suites
- Cobertura de servicios de negocio: producto, carrito, pedido
- Tests automaticos ejecutables con npm test

### 4.2 Arquitectura

- Estructura en capas: routes, controllers, services, models, types
- Separacion de responsabilidades clara
- Tipado estricto con TypeScript (strict: true)
- Commits convencionales documentados

### 4.3 Seguridad

- No se encontraron secretos hardcodeados
- Variables de entorno documentadas en docker-compose.yml
- .gitignore configurado para excluir archivos sensibles

## 5. PRs del Sprint 2

| PR | Titulo | Estado |
|---|---|---|
| #7 | feat: TP3 - personas, journeys, wireframes, auditoria heuristica y ADR-004 | Mergeado |
