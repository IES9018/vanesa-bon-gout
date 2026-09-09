# vanesa-bon-gout

Repositorio de trabajo del proyecto **Bon Gout** — Sistema Digital Integral para la Pasteleria Artesanal Bon Gout (Malargue, Mendoza).

Materia: Arquitectura y Diseno de Interfaces · IES 9-018 · Ciclo 2026
Estudiante: **Vanessa** (usuario GitHub: `Anmonte`)

## Descripcion

Bon Gout es una pasteleria artesanal que desde 2018 elabora productos de reposteria de alta calidad. Este proyecto busca digitalizar los procesos comerciales y operativos del negocio mediante una plataforma de e-commerce y gestion.

## Stack Tecnologico

- Frontend: React.js + TypeScript (Vite)
- Backend: Node.js + Express.js (API REST)
- Base de datos: PostgreSQL
- Autenticacion: JWT + bcrypt
- Pagos: MercadoPago API
- Notificaciones: WhatsApp Business API
- Despliegue: Docker (docker-compose)

## Estructura del Repositorio

```
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md   Plantilla oficial de PR
├── .gitignore                     Archivos excluidos del versionado
├── .opencoderules                 Arnés de IA (reglas del agente)
├── INSTRUCCIONES.md               Instrucciones extendidas del agente
├── README.md                      Este archivo
├── SPEC.md                        Especificacion del MVP (v2)
└── docs/
    ├── adr/
    │   ├── ADR-001-stack-tecnologico.md
    │   ├── ADR-002-estilo-arquitectonico.md
    │   └── ADR-003-persistencia.md
    ├── arquitectura/
    │   ├── C4-contexto.md         Diagrama C4 Nivel 1 (Contexto)
    │   └── C4-contenedores.md     Diagrama C4 Nivel 2 (Contenedores)
    └── auditoria/
        └── auditoria-sprint1.md   Informe de auditoria Sprint 1
```

## Decisiones Arquitectonicas

| ID | Decision | Archivo |
|---|---|---|
| ADR-001 | Stack tecnologico | docs/adr/ADR-001-stack-tecnologico.md |
| ADR-002 | Estilo arquitectonico (monolitico modular) | docs/adr/ADR-002-estilo-arquitectonico.md |
| ADR-003 | Persistencia (PostgreSQL) | docs/adr/ADR-003-persistencia.md |

## Diagramas C4

- [Diagrama de Contexto (Nivel 1)](docs/arquitectura/C4-contexto.md)
- [Diagrama de Contenedores (Nivel 2)](docs/arquitectura/C4-contenedores.md)

## Estado de Entregas

| Entrega | Estado | PR |
|---|---|---|
| TP1 - SDD y Arnes | Completado | #2 merged |
| Sprint 1 - Cierre | Completado | #4 merged |
| TP2 - Arquitectura Visible | Completado | #5 merged |

## Flujo de Trabajo

1. Crear rama `feature/<tema>` desde `main`
2. Desarrollar y commitear con convenciones (`feat:`, `fix:`, `docs:`)
3. Abrir Pull Request hacia `main`
4. Completar checklist del PR
5. Hacer merge (self-merge)
6. El docente audita despues del merge

## Enlaces

- Organizacion: [IES9018](https://github.com/IES9018)
- Consignas: [proyecto-adi-2026](https://github.com/IES9018/proyecto-adi-2026)
- PP3: [proyecto-pp3-2026](https://github.com/IES9018/proyecto-pp3-2026)
