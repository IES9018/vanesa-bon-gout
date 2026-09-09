# C4 Nivel 2 - Contenedores del Sistema Bon Gout

## Diagrama de Contenedores

```mermaid
C4Container
    title Diagrama de Contenedores - Sistema Digital Bon Gout

    Person(cliente, "Cliente", "Navega y compra online")
    Person(admin, "Administradora", "Gestiona el negocio")
    Person(empleado, "Empleado", "Consulta pedidos")

    System_Boundary(bongout, "Sistema Digital Bon Gout") {
        Container(frontend, "Frontend Web", "React + TypeScript", "Interfaz de usuario responsive, catalogo, carrito, checkout")
        Container(backend, "Backend API", "Node.js + Express", "Logica de negocio, autenticacion JWT, endpoints REST")
        ContainerDb(postgres, "Base de Datos", "PostgreSQL", "Persistencia de productos, pedidos, clientes, inventario")
    }

    System_Ext(mercadopago, "MercadoPago API", "Procesamiento de pagos")
    System_Ext(whatsapp, "WhatsApp Business API", "Notificaciones")
    System_Ext(email, "Servicio de Email", "Notificaciones por correo")

    Rel(cliente, frontend, "Usa", "HTTPS")
    Rel(admin, frontend, "Gestiona", "HTTPS")
    Rel(empleado, frontend, "Consulta", "HTTPS")

    Rel(frontend, backend, "Consume API", "HTTPS/REST")
    Rel(backend, postgres, "Lee y escribe datos", "TCP/5432")

    Rel(backend, mercadopago, "Procesa pagos", "HTTPS/REST")
    Rel(backend, whatsapp, "Envia mensajes", "HTTPS/REST")
    Rel(backend, email, "Envia emails", "SMTP")
```

## Descripcion

El sistema se compone de tres contenedores principales:

1. Frontend Web (React + TypeScript): Interfaz responsive que expone el catalogo,
   carrito de compras y panel de administracion. Construido con Vite.

2. Backend API (Node.js + Express): Capa de logica de negocio con endpoints REST.
   Maneja autenticacion JWT, validacion de datos y orquestacion de servicios externos.

3. Base de Datos (PostgreSQL): Persistencia relacional ACID para productos, pedidos,
   clientes, inventario y usuarios.

Los contenedores se comunican entre si mediante HTTPS/REST (frontend-backend) y
TCP puerto 5432 (backend-postgreSQL). El backend se conecta con servicios externos
(MercadoPago, WhatsApp, Email) mediante HTTPS/REST y SMTP.
