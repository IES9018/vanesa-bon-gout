# ADR-007: Integración de Pagos (MercadoPago sandbox + transferencia)

**Fecha:** 2026-11-08
**Estado:** Aceptada

## Contexto

RF-04 (SPEC v6, §6.4, CA-09..CA-11) pide pagos digitales con MercadoPago y
transferencias bancarias. El issue #16 exige cerrar el RF, pero NG-08 acota el
alcance: no se procesan cobros reales en esta iteración. Restricciones del
arnés: sin secretos hardcodeados (T-01), validación en el borde (T-02) y
contrato OpenAPI antes que código (API-First). El presupuesto de tiempo del
sprint es de cuatro días y no hay credenciales productivas de MercadoPago ni
cuenta bancaria empresarial disponible.

## Decisión

**Adapter de pagos con dos estrategias detrás de una misma interfaz:**

1. `mercadopago-sandbox`: genera una referencia externa simulada
   (`MP-SANDBOX-<pedidoId>-<pagoId>`) y deja el `Pago` en `pendiente`. La
   confirmación llega por `POST /api/pagos/{id}/confirmar` (equivalente al
   webhook de sandbox) y solo la puede ejecutar un admin.
2. `transferencia`: el cliente adjunta una referencia de comprobante
   (`referenciaExterna`); la administradora lo aprueba o rechaza desde el mismo
   endpoint de confirmación.

Ambas estrategias comparten `pagoService`, que aplica las reglas de negocio:
un pago `pendiente` o `aprobado` por pedido, monto tomado del pedido (nunca del
body) y estado `rechazado` que no habilita el pedido (CA-11). Cuando existan
credenciales productivas, el adapter de MercadoPago se reemplaza por la
llamada real a la API de preferencias sin tocar rutas ni contratos.

## Matriz de alternativas

| Criterio | Adapter sandbox + transferencia (elegida) | SDK de MercadoPago real | Pasarela propia (tarjetas) |
|---|---|---|---|
| Alcance del sprint (4 días) | ✅ Cerrado y testeable | ❌ Requiere credenciales y cuenta | ❌ PCI-DSS fuera de alcance |
| Secretos (T-01) | ✅ Ninguno obligatorio | ⚠️ Access token productivo | ❌ Claves de comercio |
| Contrato OpenAPI estable | ✅ Mismo contrato con adapter real | ✅ | ⚠️ Cambia el flujo |
| Verificación en CI | ✅ Sin red externa | ❌ Depende de sandbox remoto | ❌ |
| Deuda registrada | ✅ NG-08 explícito | ⚠️ Riesgo de bloqueo | ❌ |

## Alternativas Descartadas

- **SDK real de MercadoPago:** sin cuenta verificada ni credenciales, el
  circuito no se puede probar en CI y quedaría un RF a medias.
- **Pasarela propia con tarjetas:** exige cumplimiento PCI-DSS y manejo de
  datos sensibles; totalmente fuera del alcance del MVP (NG-08).
- **Pago contra reembolso:** no cubre el requisito de pago digital del RF-04.

## Consecuencias

- Se agrega la tabla `pagos` con `metodo`, `estado`, `monto` y
  `referencia_externa`; el monto se copia del pedido en el servidor.
- El webhook real queda como deuda documentada: al integrar producción solo
  cambia la implementación del adapter, no el contrato.
- Los tests cubren aprobación, rechazo (CA-11), pago duplicado y pedido
  inexistente, sin llamadas de red.
- `POST /api/pagos/{id}/confirmar` exige rol `admin`; el cliente nunca puede
  autoaprobar su pago.
