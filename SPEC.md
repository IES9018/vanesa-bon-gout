# SPEC-001: Sistema Digital Integral para la Pastelería Bon Gout (v6 — descongelada para RF-04..RF-09)

> **Estado:** v6 descongelada el 2026-11-08 por el issue #16 (auditoría docente del 26/10).
> La vFinal queda como línea base de `v0.1.0`; esta versión abre el alcance de RF-04 a
> RF-09 con criterios de aceptación verificables. RF-10 (fidelización) sigue fuera del
> alcance de esta iteración.

## 1. Contexto y Propósito

Bon Gout es una pastelería artesanal ubicada en Malargüe, Mendoza, que desde 2018 se dedica a la elaboración de productos de repostería de alta calidad. En la actualidad, el negocio opera casi por completo de forma manual: los pedidos se toman por teléfono o WhatsApp, el inventario se controla de forma empírica y no existe un canal de venta online.

Esta especificación define el **primer incremento (MVP)** de un sistema digital integral que digitalice los procesos comerciales y operativos de la pastelería, manteniendo la esencia artesanal de la marca.

El objetivo general del proyecto es proveer una plataforma de **e-commerce y gestión** que permita:

* A los **clientes**: ver el catálogo, personalizar su pedido y comprar online de forma segura.
* A la **administradora (Belén)**: gestionar pedidos, inventario, promociones y obtener métricas del negocio mediante un dashboard.
* A los **empleados**: una lista clara de pedidos organizada por fecha de entrega para planificar la producción.

## 2. Requerimientos Funcionales

- [x] **RF-01:** Sistema de catálogo de productos con imágenes, descripciones, precios y opciones de personalización. *(Implementado: `productoRoutes` + 9 tests + 3 de integración.)*
- [x] **RF-02:** Carrito de compras para agregar, modificar y eliminar productos. *(Implementado: `carritoRoutes` + 8 tests + 2 de integración.)*
- [x] **RF-03:** Sistema de pedidos online, desde la selección hasta la confirmación del pedido. *(Implementado: `pedidoRoutes` + 4 tests + 5 de integración.)*
- [ ] **RF-04:** Gestión de pagos digitales mediante integración con MercadoPago y transferencias bancarias. *(Criterios en §6.4 — pago en sandbox/mock, ver NG-08.)*
- [ ] **RF-05:** Sistema de reservas/citas para programación de entregas y consultas presenciales. *(Criterios en §6.5.)*
- [ ] **RF-06:** Gestión de inventario con control de stock de ingredientes y productos terminados. *(Criterios en §6.6.)*
- [ ] **RF-07:** Sistema de testimonios con gestión de comentarios y calificaciones de clientes. *(Criterios en §6.7.)*
- [ ] **RF-08:** Notificaciones automáticas por WhatsApp y email para confirmaciones y recordatorios. *(Criterios en §6.8 — adapter con cola simulada, ver NG-09.)*
- [ ] **RF-09:** Dashboard administrativo con métricas y gestión del negocio. *(Criterios en §6.9.)*
- [ ] **RF-10:** Programa de fidelización de puntos y recompensas para clientes frecuentes.

## 3. Non-Goals (Límites del Alcance)

*Lo que explícitamente NO se construirá en este MVP:*

- **NG-01:** No se implementará una arquitectura de microservicios; se parte de una arquitectura monolítica de N-capas (evaluada para una futura evolución).
- **NG-02:** No se construirá un marketplace local ni la inclusión de otros emprendimientos culinarios.
- **NG-03:** No se implementará un sistema de suscripciones de cajas mensuales.
- **NG-04:** No se desarrollará una academia virtual de cursos de repostería.
- **NG-05:** No se licenciará la plataforma a otras pastelerías (modelo de franquicias digitales).
- **NG-06:** No se implementará el módulo B2B de provisión a restaurantes y hoteles.
- **NG-07:** El recomendador personalizado basado en filtrado colaborativo queda fuera del MVP, así como la aplicación móvil nativa.
- **NG-08:** No se procesarán pagos reales en esta iteración. RF-04 se implementa como **adapter** con MercadoPago en modo *sandbox* y transferencia bancaria con comprobante; el cobro real requiere credenciales productivas y un ADR nuevo.
- **NG-09:** No se enviarán mensajes reales por WhatsApp Business API ni email transaccional. RF-08 se implementa con una **cola de salida (outbox) simulada** y un adapter intercambiable; el envío real requiere cuenta verificada de Meta y proveedor SMTP, fuera del alcance del MVP.

## 4. Stack Tecnológico y Restricciones

- **Frontend:** React.js + TypeScript (build con Vite).
- **Backend:** Node.js + Express.js (API REST).
- **Base de datos:** PostgreSQL.
- **Autenticación:** JWT + bcrypt.
- **Pagos:** MercadoPago API.
- **Notificaciones:** WhatsApp Business API.
- **Orquestación (despliegue):** Docker (docker-compose).
- **Control de versiones:** Git + GitHub.

## 5. Contratos de Datos / Tipos

```typescript
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precioBase: number;
  categoria: Categoria;
  imagen: string;
  activo: boolean;
}

interface Pedido {
  id: number;
  cliente: Cliente;
  fechaPedido: Date;
  fechaEntrega: Date;
  estado: 'pendiente' | 'en_produccion' | 'en_entrega' | 'entregado' | 'cancelado';
  total: number;
  observaciones: string;
  detalle: DetallePedido[]; // pedido: 1:N detalle
}

interface DetallePedido {
  id: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  personalizaciones: string;
}

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaRegistro: Date;
  puntosFidelidad: number;
}

interface Usuario {
  id: number;
  username: string;
  passwordHash: string;
  rol: 'admin' | 'empleado';
  email: string;
  activo: boolean;
}

interface Inventario {
  id: number;
  nombreIngrediente: string;
  cantidadDisponible: number;
  unidadMedida: string;
  puntoReorden: number;
}

// --- v6: contratos de los RF-04..RF-09 ---

interface Pago {
  id: number;
  pedidoId: number;
  metodo: 'mercadopago' | 'transferencia';
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado';
  monto: number;
  referenciaExterna: string | null; // id de preferencia MP o n.º de comprobante
  creadoEn: Date;
}

interface Reserva {
  id: number;
  clienteId: number;
  fecha: Date;          // fecha/hora del slot
  tipo: 'entrega' | 'consulta';
  estado: 'pendiente' | 'confirmada' | 'cancelada';
}

interface MovimientoInventario {
  id: number;
  inventarioId: number;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo: string;
  pedidoId: number | null;
  creadoEn: Date;
}

interface Testimonio {
  id: number;
  clienteId: number;
  pedidoId: number;
  comentario: string;
  calificacion: 1 | 2 | 3 | 4 | 5;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  creadoEn: Date;
}

interface Notificacion {
  id: number;
  pedidoId: number;
  canal: 'email' | 'whatsapp';
  evento: 'pedido_creado' | 'estado_cambiado' | 'recordatorio_entrega';
  destino: string;
  estado: 'en_cola' | 'enviada' | 'fallida';
  intentos: number;
  creadoEn: Date;
}
```

## 6. Criterios de Aceptación

### RF-01: Catálogo de productos

- **CA-01:** El cliente puede recorrer el catálogo completo, personalizar un producto (Ej. mensaje "Feliz Cumpleaños") y completar un pedido end-to-end (TC001).
  - **Given** que el cliente está en la página principal,
  - **When** hace clic en "Catálogo" y navega los productos,
  - **Then** ve la lista de productos con imagen, nombre y precio.
  - **When** selecciona un producto y escribe un mensaje de personalización,
  - **Then** el sistema guarda la personalización y muestra el producto en el carrito con el mensaje adjunto.

- **CA-02:** El sistema impide la venta de un producto sin stock disponible y notifica su agotamiento (TC002).
  - **Given** que un producto tiene stock = 0,
  - **When** el cliente intenta agregarlo al carrito,
  - **Then** el sistema muestra "Producto agotado" y el botón está deshabilitado.

### RF-02: Carrito de compras

- **CA-07:** El cliente puede agregar, modificar cantidad y eliminar productos del carrito.
  - **Given** que el cliente tiene productos en el carrito,
  - **When** modifica la cantidad de un producto,
  - **Then** el sistema actualiza el subtotal y el total del carrito.
  - **When** elimina un producto,
  - **Then** el sistema muestra confirmación y actualiza el total.

### RF-03: Pedidos online

- **CA-08:** El cliente puede confirmar un pedido seleccionando fecha de entrega y método de pago.
  - **Given** que el cliente tiene productos en el carrito,
  - **When** selecciona fecha de entrega (mínimo 48hs hábiles) y método de pago,
  - **Then** el sistema crea el pedido con estado "pendiente" y muestra confirmación.

### RF-04: Pagos digitales (sandbox)

- **CA-09:** El cliente puede pagar un pedido con MercadoPago en modo sandbox.
  - **Given** que el cliente confirmó un pedido con estado "pendiente",
  - **When** elige "MercadoPago" como método de pago,
  - **Then** el sistema crea un `Pago` con estado "pendiente" y devuelve una referencia externa de sandbox.
  - **When** el webhook de sandbox confirma el pago,
  - **Then** el `Pago` pasa a "aprobado" y el pedido queda habilitado para producción.
- **CA-10:** El cliente puede pagar por transferencia bancaria adjuntando comprobante.
  - **Given** que el cliente eligió "Transferencia",
  - **When** adjunta una referencia de comprobante,
  - **Then** el `Pago` queda "pendiente" y la administradora puede aprobarlo o rechazarlo desde el dashboard.
- **CA-11:** Un pago rechazado no habilita el pedido.
  - **Given** un `Pago` en estado "rechazado",
  - **When** el sistema evalúa el pedido,
  - **Then** el pedido permanece "pendiente" y se informa el motivo al cliente.

### RF-05: Reservas y citas

- **CA-12:** El cliente reserva un slot de entrega disponible.
  - **Given** que existe un slot con cupo disponible,
  - **When** el cliente solicita la reserva con fecha/hora válida,
  - **Then** el sistema crea la `Reserva` en estado "confirmada" y descuenta el cupo.
- **CA-13:** El sistema rechaza reservas en slots completos o fechas pasadas.
  - **Given** un slot sin cupo o una fecha anterior a hoy,
  - **When** el cliente intenta reservar,
  - **Then** el sistema responde `400` con el motivo y no crea la reserva.
- **CA-14:** El cliente puede cancelar su reserva.
  - **Given** una `Reserva` "confirmada" con al menos 24 h de anticipación,
  - **When** el cliente la cancela,
  - **Then** la reserva pasa a "cancelada" y el cupo se libera.

### RF-06: Inventario

- **CA-15:** El sistema descuenta stock al confirmar un pedido.
  - **Given** un ingrediente con stock suficiente,
  - **When** se confirma un pedido que lo consume,
  - **Then** se registra un `MovimientoInventario` de tipo "salida" y baja la cantidad disponible.
- **CA-16:** El sistema bloquea pedidos sin stock.
  - **Given** un producto cuyo stock de ingredientes es insuficiente,
  - **When** el cliente intenta agregarlo o confirmar el pedido,
  - **Then** el sistema responde `400` "Stock insuficiente" y no descuenta nada.
- **CA-17:** La administradora ve alertas de reposición.
  - **Given** un ingrediente por debajo de su `puntoReorden`,
  - **When** la administradora consulta el inventario,
  - **Then** el sistema lo marca como "reponer" y lo incluye en las métricas del dashboard.

### RF-07: Testimonios

- **CA-18:** El cliente publica un testimonio sobre un pedido entregado.
  - **Given** un pedido en estado "entregado" del cliente,
  - **When** envía comentario y calificación entre 1 y 5,
  - **Then** se crea un `Testimonio` en estado "pendiente" (moderación previa).
- **CA-19:** La administradora modera los testimonios.
  - **Given** un testimonio "pendiente",
  - **When** la administradora lo aprueba o rechaza,
  - **Then** cambia de estado y solo los "aprobado" se muestran en el catálogo.
- **CA-20:** No se permite más de un testimonio por pedido.
  - **Given** un pedido que ya tiene testimonio,
  - **When** el cliente intenta enviar otro,
  - **Then** el sistema responde `400` "Ya existe un testimonio para este pedido".

### RF-08: Notificaciones (cola simulada)

- **CA-21:** Cada evento de pedido encola una notificación.
  - **Given** un pedido creado o un cambio de estado,
  - **When** ocurre el evento,
  - **Then** se crea una `Notificacion` en estado "en_cola" con canal, destino y evento.
- **CA-22:** El worker procesa la cola y registra el resultado.
  - **Given** notificaciones "en_cola",
  - **When** corre el procesador (simulado en local),
  - **Then** pasan a "enviada" o "fallida" con contador de intentos.
- **CA-23:** Los fallos se reintentan hasta un máximo.
  - **Given** una notificación "fallida" con intentos < 3,
  - **When** vuelve a procesarse,
  - **Then** incrementa `intentos`; al llegar a 3 queda "fallida" definitiva y se alerta en el dashboard.

### RF-09: Dashboard administrativo

- **CA-24:** La administradora ve métricas del negocio.
  - **Given** una sesión con rol "admin",
  - **When** abre el dashboard,
  - **Then** ve ventas del día, semana y mes, pedidos por estado y alertas de inventario.
- **CA-25:** La administradora gestiona el ciclo de vida del pedido.
  - **Given** un pedido "pendiente",
  - **When** la administradora lo avanza,
  - **Then** solo se permiten las transiciones `pendiente → en_produccion → en_entrega → entregado` (y `cancelado` desde cualquier estado previo a "entregado").
- **CA-26:** El dashboard está protegido por rol.
  - **Given** una sesión sin rol "admin",
  - **When** intenta acceder a `/api/dashboard/*`,
  - **Then** el sistema responde `403`.

### Criterios generales

- **CA-03:** La administradora puede ver en el dashboard las ventas diarias, semanales y mensuales.
- **CA-04:** El tiempo de carga de las páginas es menor a 3 segundos en el 95% de las solicitudes.
- **CA-05:** El sistema soporta al menos 100 usuarios simultáneos sin degradación.
- **CA-06:** Toda la funcionalidad es accesible y usable desde dispositivos móviles (responsive).

## 7. Requisitos de Accesibilidad

Las 2 pantallas críticas (catálogo y checkout) deben cumplir:

- **AC-01:** Navegación completa por teclado (Tab, Shift+Tab, Enter, Escape).
- **AC-02:** Contraste de texto mínimo AA (4.5:1 para texto normal, 3:1 para texto grande).
- **AC-03:** Todos los elementos interactivos tienen focus visible.
- **AC-04:** Los formularios tienen labels asociados (htmlFor / aria-label).
- **AC-05:** Los mensajes de error se asocian a campos mediante aria-describedby.

## 8. Restricciones Arquitectónicas

Las decisiones arquitectónicas del sistema están documentadas en la carpeta `docs/adr/`:

| ID | Decisión | Archivo |
|---|---|---|
| ADR-001 | Stack tecnológico (React + Node.js + PostgreSQL) | `docs/adr/ADR-001-stack-tecnologico.md` |
| ADR-002 | Estilo arquitectónico (monolítico modular en capas) | `docs/adr/ADR-002-estilo-arquitectonico.md` |
| ADR-003 | Estrategia de persistencia (PostgreSQL) | `docs/adr/ADR-003-persistencia.md` |
| ADR-004 | Stack de UI (Tailwind CSS + Headless UI) | `docs/adr/ADR-004-stack-ui.md` |
| ADR-005 | Estrategia web (SPA React + Vite contra API REST) | `docs/adr/ADR-005-estrategia-web.md` |
| ADR-006 | Estrategia mobile (responsive + PWA) | `docs/adr/ADR-006-estrategia-mobile.md` |
| ADR-007 | Integración de pagos (adapter MercadoPago sandbox + transferencia) | `docs/adr/ADR-007-integracion-pagos.md` *(a crear en RF-04)* |
| ADR-008 | Notificaciones (outbox + adapter email/WhatsApp) | `docs/adr/ADR-008-notificaciones.md` *(a crear en RF-08)* |

Restricciones derivadas de estas decisiones:

- No se pueden introducir frameworks, bases de datos o servicios externos que no estén declarados en un ADR aprobado.
- La arquitectura es monolítica modular en capas: rutas, controladores, servicios, repositorios, modelos.
- Toda la persistencia se realiza en PostgreSQL; no se permiten bases de datos adicionales sin un ADR nuevo.
- El despliegue se realiza mediante Docker Compose con los servicios: frontend, backend, postgres.

## 9. Contratos API (TP4)

Los 5 endpoints críticos están congelados en `docs/arquitectura/api-contracts.yaml`
(OpenAPI 3.0.3, fuente de verdad API-First):

| Método | Ruta | Operación | Auth |
|---|---|---|---|
| GET | `/api/productos` | `listarProductos` | pública |
| POST | `/api/carrito/{clienteId}/agregar` | `agregarAlCarrito` | pública |
| POST | `/api/pedidos` | `crearPedido` | JWT |
| GET | `/api/pedidos/{id}` | `obtenerPedido` | JWT |
| PATCH | `/api/pedidos/{id}/estado` | `cambiarEstadoPedido` | JWT + rol |

### 9.1 Endpoints planificados para RF-04..RF-09 (v6)

Por la regla API-First del arnés, cada endpoint se agrega a
`docs/arquitectura/api-contracts.yaml` **antes** de implementarse, en el PR de su RF.

| RF | Método | Ruta | Operación | Auth |
|---|---|---|---|---|
| RF-04 | POST | `/api/pedidos/{id}/pagos` | `crearPago` | JWT |
| RF-04 | POST | `/api/pagos/{id}/confirmar` | `confirmarPago` | JWT + rol admin (transferencia) |
| RF-05 | GET | `/api/reservas/disponibilidad` | `consultarDisponibilidad` | pública |
| RF-05 | POST | `/api/reservas` | `crearReserva` | JWT |
| RF-05 | DELETE | `/api/reservas/{id}` | `cancelarReserva` | JWT |
| RF-06 | GET | `/api/inventario` | `listarInventario` | JWT + rol admin |
| RF-06 | POST | `/api/inventario/{id}/movimientos` | `registrarMovimiento` | JWT + rol admin |
| RF-07 | POST | `/api/pedidos/{id}/testimonios` | `crearTestimonio` | JWT |
| RF-07 | PATCH | `/api/testimonios/{id}` | `moderarTestimonio` | JWT + rol admin |
| RF-08 | GET | `/api/notificaciones` | `listarNotificaciones` | JWT + rol admin |
| RF-09 | GET | `/api/dashboard/metricas` | `obtenerMetricas` | JWT + rol admin |

Respuestas de error normalizadas: `400` (validación/stock/fecha <48h), `401`
(JWT ausente/inválido), `404` (recurso inexistente), `500` (interno). Los
schemas (`Producto`, `Pedido`, `CrearPedido`, `CarritoItem`) son los de la
sección 5. Las amenazas y mitigaciones viven en
`docs/seguridad/threat-model-lite.md` (STRIDE, T-01 a T-06).

## 10. Requisitos No Funcionales medibles (TP5)

| ID | Requisito | Presupuesto | Verificación |
|---|---|---|---|
| RNF-01 | Catálogo móvil rápido en 4G | LCP < 2.5s | Lighthouse CI en pipeline |
| RNF-02 | Interacción sin lag | INP < 200ms | Lighthouse CI en pipeline |
| RNF-03 | Bundle liviano | JS < 200KB gzip | Presupuesto CI (falla el run si excede) |
| RNF-04 | Catálogo offline | Abre sin red desde caché PWA | Service Worker + outbox (ver `offline-sync.md`) |
| RNF-05 | Táctil accesible | Targets ≥ 48px en <400px | Wireframe `pantalla-movil.md` + AC-01..AC-05 |

## Changelog

| Versión | Fecha | Motivo |
|---|---|---|
| v1 → v2 | 2026-09-09 | Se agregó sección Restricciones Arquitectónicas citando ADR-001/002/003. Se incorporaron los diagramas C4 de contexto y contenedores. |
| v2 → v3 | 2026-09-09 | Se agregaron criterios de aceptación estilo Given/When/Then para RF-01, RF-02, RF-03. Se agregó sección 7: Requisitos de Accesibilidad (AC-01 a AC-05). Se agregó ADR-004 (Stack de UI). |
| v3 → v4 | 2026-09-22 | TP4: sección 8 Contratos API (5 endpoints OpenAPI + errores 400/401/404/500). ADR-005 (SPA). Threat model STRIDE (T-01 a T-06). Arnés v3 (no secrets, validación en borde, API-First). |
| v4 → v5 | 2026-09-22 | TP5: sección 9 RNF medibles (LCP/INP/JS/offline/48px). ADR-006 (responsive+PWA). Presupuestos de rendimiento, offline-sync y wireframe móvil <400px. |
| v5 → vFinal | 2026-09-22 | TP6: SPEC congelada para v0.1.0. Renumeración (7 accesibilidad, 8 restricciones, 9 contratos, 10 RNF). RF-01/02/03 tildados con evidencia de implementación. Arnés consolidado vFinal. |
| vFinal → v6 | 2026-11-08 | **Descongelada por issue #16 (auditoría docente 26/10).** Se desagregan RF-04..RF-09 en criterios de aceptación CA-09..CA-26 estilo Given/When/Then; se agregan los contratos de datos `Pago`, `Reserva`, `MovimientoInventario`, `Testimonio` y `Notificacion`; se declaran NG-08 (pagos reales) y NG-09 (envío real de notificaciones); se planifican ADR-007 (pagos) y ADR-008 (notificaciones); se listan los endpoints §9.1 que se incorporarán a `api-contracts.yaml` en cada PR. |
