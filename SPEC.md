# SPEC-001: Sistema Digital Integral para la Pastelería Bon Gout

## 1. Contexto y Propósito

Bon Gout es una pastelería artesanal ubicada en Malargüe, Mendoza, que desde 2018 se dedica a la elaboración de productos de repostería de alta calidad. En la actualidad, el negocio opera casi por completo de forma manual: los pedidos se toman por teléfono o WhatsApp, el inventario se controla de forma empírica y no existe un canal de venta online.

Esta especificación define el **primer incremento (MVP)** de un sistema digital integral que digitalice los procesos comerciales y operativos de la pastelería, manteniendo la esencia artesanal de la marca.

El objetivo general del proyecto es proveer una plataforma de **e-commerce y gestión** que permita:

* A los **clientes**: ver el catálogo, personalizar su pedido y comprar online de forma segura.
* A la **administradora (Belén)**: gestionar pedidos, inventario, promociones y obtener métricas del negocio mediante un dashboard.
* A los **empleados**: una lista clara de pedidos organizada por fecha de entrega para planificar la producción.

## 2. Requerimientos Funcionales

- [ ] **RF-01:** Sistema de catálogo de productos con imágenes, descripciones, precios y opciones de personalización.
- [ ] **RF-02:** Carrito de compras para agregar, modificar y eliminar productos.
- [ ] **RF-03:** Sistema de pedidos online, desde la selección hasta la confirmación del pedido.
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

- [ ] **CA-01:** El cliente puede recorrer el catálogo completo, personalizar un producto (Ej. mensaje "Feliz Cumpleaños") y completar un pedido end-to-end (TC001).
- [ ] **CA-02:** El sistema impide la venta de un producto sin stock disponible y notifica su agotamiento (TC002).
- [ ] **CA-03:** La administradora puede ver en el dashboard las ventas diarias, semanales y mensuales.
- [ ] **CA-04:** El tiempo de carga de las páginas es menor a 3 segundos en el 95% de las solicitudes.
- [ ] **CA-05:** El sistema soporta al menos 100 usuarios simultáneos sin degradación.
- [ ] **CA-06:** Toda la funcionalidad es accesible y usable desde dispositivos móviles (responsive).
