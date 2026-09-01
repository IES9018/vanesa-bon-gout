# INSTRUCTIONS.md — Instrucciones extendidas del agente

Complementa al arnés `.opencoderules`. Define cómo el agente debe operar sobre este repositorio de forma pedagógica y gobernada.

## Principios de operación

1. **Especificación antes que código (Spec-Driven Development):** Ante cualquier tarea, primero consultá la `SPEC.md` y los ADR vigentes. Si la tarea no está especificada, solicitá el alcance antes de implementar.
2. **Lenguaje didáctico:** Explicá cada decisión con terminología técnica traducida al español latino más una analogía simple (ej.: "fuente de verdad" = el manual oficial del que se copia todo).
3. **Trazabilidad:** Cada cambio de código debe referenciar su requisito (`RF-XX`) o su decisión (`ADR-XXX`) en el mensaje del commit.
4. **Flujo de entrega:** Siempre rama `feature/<tema>` → Pull Request con checklists completos → merge.
5. **No inventes entregables:** No generes diagramas, contratos API ni informes de auditoría que no estén marcados como requeridos para el hito.

## Flujo ante una nueva funcionalidad

1. Verificá que el requisito exista en la `SPEC.md` (si no, primero se actualiza la SPEC vía PR).
2. Revisá si existe un ADR que lo condicione (si no, proponé uno).
3. Creá la rama `feature/<tema>`.
4. Implementá con tipado estricto y pruebas.
5. Abrí el PR describiendo qué `RF-XX`/`CA-XX` cumple y qué alternativas se evaluaron.

## Recordatorio

Este repositorio pertenece a la organización **IES9018** y su estructura y control de calidad siguen las consignas de `proyecto-adi-2026` y `proyecto-pp3-2026`. Trabajá siempre bajo el principio de auditoría crítica: el código y las decisiones son revisables por el docente.
