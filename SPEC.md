# SPEC-001: Sistema Digital Integral para la Pastelería Bon Gout (vFinal — congelada v0.1.0)

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
- [ ] **RF-04:** Gestión de pagos digitales mediante integración con MercadoPago y transferencias bancarias.
- [ ] **RF-05:** Sistema de reservas/citas para programación de entregas y consultas presenciales.
- [ ] **RF-06:** Gestión de inventario con control de stock de ingredientes y productos terminados.
- [ ] **RF-07:** Sistema de testimonios con gestión de comentarios y calificaciones de clientes.
- [ ] **RF-08:** Notificaciones automáticas por WhatsApp y email para confirmaciones y recordatorios.
- [ ] **RF-09:** Dashboard administrativo con métricas y gestión del negocio.
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
