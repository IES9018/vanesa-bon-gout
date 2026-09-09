# Reporte de Pruebas — Sprint 2

Estudiante: Vanessa (Anmonte)
Proyecto: Sistema Digital Bon Gout
Periodo: Sprint 2 (21 septiembre - 16 octubre 2026)

## Resumen

- Total de tests: 21
- Tests pasando: 21
- Tests fallando: 0
- Suites de test: 3
- Cobertura: servicios de negocio (producto, carrito, pedido)

## Suites de Test

### 1. ProductoService (9 tests)

| Test | Descripcion | Estado |
|---|---|---|
| obtenerTodos devuelve solo productos activos | Verifica que no se devuelvan productos inactivos | PASA |
| obtenerPorId retorna producto existente | Busqueda por ID valido | PASA |
| obtenerPorId retorna undefined para id inexistente | Busqueda por ID inexistente | PASA |
| obtenerPorCategoria filtra correctamente | Filtrado por categoria | PASA |
| busca encuentra productos por nombre | Busqueda por termino | PASA |
| busca retorna vacio si no hay coincidencias | Busqueda sin resultados | PASA |
| verificarStock retorna true cuando hay stock suficiente | Validacion de stock | PASA |
| verificarStock retorna false cuando no hay stock | Validacion de stock agotado | PASA |
| verificarStock retorna false para producto inexistente | Validacion con ID inexistente | PASA |

### 2. CarritoService (8 tests)

| Test | Descripcion | Estado |
|---|---|---|
| obtenerCarrito retorna carrito vacio para cliente nuevo | Inicializacion de carrito | PASA |
| agregarItem agrega producto al carrito | Agregar item | PASA |
| agregarItem rechaza producto sin stock | Validacion de stock al agregar | PASA |
| agregarItem rechaza producto inexistente | Validacion de producto | PASA |
| eliminarItem remueve producto del carrito | Eliminar item | PASA |
| eliminarItem falla si producto no esta en carrito | Eliminar item inexistente | PASA |
| actualizarCantidad modifica cantidad correctamente | Modificar cantidad | PASA |
| calcularTotal suma correctamente los precios | Calculo de total | PASA |

### 3. PedidoService (4 tests)

| Test | Descripcion | Estado |
|---|---|---|
| crearPedido falla si el carrito esta vacio | Validacion de carrito vacio | PASA |
| crearPedido falla si la fecha es menor a 48 horas | Validacion de fecha minima | PASA |
| crearPedido exitoso con fecha valida | Creacion de pedido | PASA |
| cambiarEstado actualiza el estado del pedido | Cambio de estado | PASA |

## Lo que cubre cada test

- ProductoService: CRUD de productos, busqueda, filtrado por categoria, validacion de stock.
- CarritoService: Agregar, eliminar, actualizar items, calcular total, validacion de stock.
- PedidoService: Crear pedido con validaciones (carrito vacio, fecha minima), cambio de estado.

## Non-Goals de testing (que NO se testea en este sprint)

- Tests de integracion con base de datos real (requiere PostgreSQL levantado).
- Tests de endpoints HTTP (supertest se usara en el Sprint 3).
- Tests de autenticacion JWT (se implementa en el Sprint 3).
- Tests de frontend (React components).
- Tests de MercadoPago y WhatsApp API (servicios externos).
- Tests de rendimiento y carga.
