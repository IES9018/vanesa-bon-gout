# C4 Nivel 1 - Contexto del Sistema Bon Gout

## Diagrama de Contexto

```mermaid
C4Context
    title Diagrama de Contexto - Sistema Digital Bon Gout

    Person(cliente, "Cliente", "Consulta el catalogo, realiza pedidos y paga online")
    Person(admin, "Administradora", "Belén - gestiona pedidos, inventario y metricas")
    Person(empleado, "Empleado", "Consulta pedidos para planificar produccion")

    System(bongout, "Sistema Digital Bon Gout", "Plataforma de e-commerce y gestion para la pasteleria artesanal")

    System_Ext(mercadopago, "MercadoPago API", "Procesamiento de pagos digitales")
    System_Ext(whatsapp, "WhatsApp Business API", "Notificaciones y confirmaciones por WhatsApp")
    System_Ext(email, "Servicio de Email", "Notificaciones por correo electronico")

    Rel(cliente, bongout, "Navega catalogo, crea pedidos, paga")
    Rel(admin, bongout, "Gestiona pedidos, inventario, metricas")
    Rel(empleado, bongout, "Consulta pedidos del dia")

    Rel(bongout, mercadopago, "Procesa pagos", "HTTPS/REST")
    Rel(bongout, whatsapp, "Envia confirmaciones y recordatorios", "HTTPS/REST")
    Rel(bongout, email, "Envia notificaciones", "SMTP")
```

## Descripcion

El sistema Bon Gout se presenta como una caja negra que interactua con tres actores
humanos (cliente, administradora y empleado) y tres sistemas externos (MercadoPago,
WhatsApp Business y un servicio de email). El cliente utiliza la plataforma para
navegar el catalogo, personalizar productos y realizar pagos. La administradora
gestiona el negocio desde un dashboard. El empleado consulta la lista de pedidos
para planificar la produccion diaria.
