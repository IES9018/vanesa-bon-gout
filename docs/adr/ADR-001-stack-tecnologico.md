# ADR-001: Stack Tecnológico del Sistema Bon Gout

**Fecha:** 2026-08-31
**Estado:** Propuesto

## Contexto

Bon Gout es una pastelería artesanal de Malargüe que necesita digitalizar sus operaciones mediante una plataforma de e-commerce y gestión. La decisión del **stack tecnológico** es fundacional: condiciona el desarrollo, la mantenibilidad, la escalabilidad y el costo del MVP.

Los requisitos a satisfacer son:

- Aplicación web **responsive** con catálogo, carrito y checkout.
- API REST para la gestión de pedidos, inventario y dashboard.
- Persistencia relacional con integridad de datos (pagos, stock, pedidos).
- Autenticación segura de administradora y empleados.
- Integración con servicios externos: MercadoPago y WhatsApp Business API.
- Despliegue mediante contenedores (Docker).

## Decisión

Se adopta el siguiente stack tecnológico:

| Componente | Tecnología | Rol |
|---|---|---|
| Frontend | **React.js + TypeScript** | Interfaz de usuario responsive |
| Backend | **Node.js + Express.js** | API REST y lógica de negocio |
| Base de datos | **PostgreSQL** | Persistencia relacional ACID |
| Autenticación | **JWT + bcrypt** | Sesiones y hash de contraseñas |
| Pagos | **MercadoPago API** | Pagos digitales |
| Notificaciones | **WhatsApp Business API** | Confirmaciones y recordatorios |
| Despliegue | **Docker / docker-compose** | Orquestación de contenedores |
| Versiones | **Git + GitHub** | Control de versiones y flujo PR |

Esta elección mantiene **un único lenguaje (JavaScript/TypeScript)** en frontend y backend, lo que reduce la curva de aprendizaje y el tamaño del equipo técnico del MVP.

## Alternativas Descartadas

- **Opción A — Frontend Vue.js o Angular** en lugar de React: ambos son frameworks maduros, pero React posee el ecosistema más amplio, mayor comunidad y una integración natural con TypeScript. Angular impone una estructura más rígida y una curva de aprendizaje mayor para un MVP; Vue es sólido pero hay menos material y contratación en el mercado local.

- **Opción B — Backend Django (Python), Laravel (PHP) o FastAPI** en lugar de Node.js: estas alternativas son potentes, pero implican manejar **dos lenguajes distintos** en el proyecto (Python/PHP para backend y JS para frontend). Node.js + Express unifica el lenguaje, acelera el desarrollo de una API REST y permite compartir tipos de datos entre frontend y backend.

- **Opción C — MySQL o MongoDB** en lugar de PostgreSQL: MySQL cumple con ACID pero PostgreSQL ofrece funciones avanzadas gratuitas (JSONB, tipos y extensiones) con el mismo nivel de robustez. MongoDB (NoSQL) fue descartado porque el dominio de Bon Gout es altamente relacional (pedidos, detalle de pedidos, productos, pagos, inventario) donde las transacciones y la integridad referencial son críticas.

## Consecuencias

- **Positivas:**
  - Un único lenguaje (JS/TS) de punta a punta → menor complejidad y mantenimiento.
  - Stack maduro y ampliamente documentado, con gran disponibilidad de talento.
  - PostgreSQL garantiza integridad transaccional para pagos y stock.
  - Docker habilita un despliegue reproducible y multi-ambiente.
  - MercadoPago es el líder local y se integra de forma directa en Argentina.

- **Negativas / Riesgos:**
  - La arquitectura monolítica N-capas deberá migrar a microservicios si el negocio crece fuertemente (riesgo futuro, contemplado).
  - La integración con WhatsApp Business API está sujeta a los términos y verificación de Meta.
  - Dependencia de la disponibilidad y reglas de MercadoPago para los pagos.
  - Express es minimalista: requiere disciplinar la estructura (controladores, modelos, servicios, middleware) para no degradar la mantenibilidad.
