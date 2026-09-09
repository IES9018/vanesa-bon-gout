# Personas y User Journeys — Proyecto Bon Gout

## 1. Personas

### Persona 1: Belén — Administradora de la Pastelería

- **Nombre:** Belén
- **Rol:** Administradora y propietaria de Bon Gout
- **Edad:** 35 años
- **Objetivo:** Gestionar el negocio de forma eficiente, controlar pedidos, inventario y obtener métricas de ventas para tomar decisiones.
- **Frustración principal:** Actualmente lleva el control de pedidos en cuadernos y WhatsApp. Se le escapan pedidos, no tiene visibilidad de stock y dedica horas a organizar la producción manualmente.
- **Contexto de uso:** Desde su celular o computadora en la pastelería, entre la preparación de productos. Necesita interfaces simples que le permitan rapidamente ver el estado de los pedidos y el dashboard.

### Persona 2: Martín — Cliente Frecuente

- **Nombre:** Martín
- **Rol:** Cliente que pide tortas y productos de repostería para eventos
- **Edad:** 28 años
- **Objetivo:** Realizar pedidos personalizados de forma rápida, sin llamar por teléfono, y recibir confirmación del pedido.
- **Frustración principal:** Tiene que llamar para pedir, muchas veces no responden, no puede ver precios ni disponibilidad, y no tiene seguimiento del estado de su pedido.
- **Contexto de uso:** Desde su celular en horario laboral, necesita hacer pedidos rápidos para cumpleaños y eventos de empresa. Valora la rapidez y la claridad.

## 2. User Journeys

### Journey 1: Belén — Gestionar pedidos del día

```mermaid
graph TD
    A[Belén ingresa al dashboard] --> B[Ve resumen de pedidos del día]
    B --> C{¿Hay pedidos nuevos?}
    C -->|Sí| D[Abre detalle del pedido]
    D --> E[Verifica stock de ingredientes]
    E -->{¿Hay stock?}
    E -->|Sí| F[Cambia estado a en_produccion]
    E -->|No| G[Notifica al cliente por WhatsApp]
    F --> H[Organiza pedidos por hora de entrega]
    H --> I[Marca pedido como entregado]
    C -->|No| J[Revisa métricas semanales]
    J --> K[Actualiza inventario]
```

**Puntos de abandono:**
- Paso E: Si el stock es insuficiente y no hay forma de notificar al cliente, Belén abandona y resuelve por WhatsApp manualmente. **Mitigación:** Integración con WhatsApp Business API para notificaciones automáticas.
- Paso H: Si la organización por hora de entrega no es clara, Belén pierde tiempo reorganizando. **Mitigación:** Vista de pedidos ordenada por fecha de entrega con colores de estado.

### Journey 2: Martín — Realizar un pedido personalizado

```mermaid
graph TD
    A[Martín ingresa al catálogo] --> B[Navega categorías de productos]
    B --> C[Selecciona un producto]
    C --> D[Personaliza: mensaje, decoración]
    D --> Añade al carrito
    E --> F[Revisa carrito]
    F --> G[Selecciona fecha de entrega]
    G --> H[Elige método de pago]
    H --> I[Confirma pedido]
    I --> J[Recibe confirmación por WhatsApp]
    J --> K[Seguimiento del estado del pedido]
```

**Puntos de abandono:**
- Paso D: Si la personalización no es clara o el formulario es confuso, Martín abandona. **Mitigación:** Formulario de personalización con ejemplos visuales y campos obligatorios marcados.
- Paso H: Si el método de pago no está claro o hay errores, Martín no completa la compra. **Mitigación:** Integración con MercadoPago que muestra opciones de pago de forma clara y segura.
