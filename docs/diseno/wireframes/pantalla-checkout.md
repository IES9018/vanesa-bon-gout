# Wireframe: Pantalla de Checkout

## Objetivo

Permitir al cliente revisar su pedido, seleccionar fecha de entrega, elegir método de pago y confirmar la compra de forma segura y clara.

## Entrada principal

El cliente accede desde el carrito de compras después de agregar productos. Es la pantalla crítica de conversión: si el cliente abandona aquí, no hay venta.

## Wireframe

```
+------------------------------------------------------+
|  BON GOUT          [Catálogo] [Pedidos] [Carrito(3)] |
+------------------------------------------------------+
|                                                      |
|  Tu pedido:                                          |
|  +--------------------------------------------------+|
|  | Torta de chocolate x1         $4.500             ||
|  | Alfajor x12 x1                $2.200             ||
|  | Jugo natural x2               $1.600             ||
|  |--------------------------------------------------||
|  | Subtotal:                     $8.300             ||
|  | Envío:                        $500               ||
|  |--------------------------------------------------||
|  | TOTAL:                        $8.800             ||
|  +--------------------------------------------------+|
|                                                      |
|  Fecha de entrega:                                   |
|  [📅 Seleccionar fecha]  (mínimo 48hs hábiles)       |
|                                                      |
|  Horario: [ Mañana 10-13 ] [ Tarde 16-19 ]          |
|                                                      |
|  Método de pago:                                     |
|  (•) MercadoPago (tarjeta, débito, efectivo)         |
|  ( ) Transferencia bancaria                          |
|  ( ) Efectivo en la pastelería                       |
|                                                      |
|  Notas adicionales:                                  |
|  +--------------------------------------------------+|
|  | Ej: "Torta para cumpleaños de 8 años, color     ||
|  | azul y rosa"                                     ||
|  +--------------------------------------------------+|
|                                                      |
|  [        CONFIRMAR PEDIDO        ]                  |
|                                                      |
|  🔒 Tu pago es seguro mediante MercadoPago           |
|                                                      |
+------------------------------------------------------+
```

## Elementos clave

1. **Resumen del pedido**: Lista de productos con cantidad, precio unitario y subtotal.
2. **Fecha de entrega**: Calendario con restricción de mínimo 48 horas hábiles (la pastelería necesita tiempo de producción).
3. **Horario de entrega**: Dos opciones fijas según la operación del negocio.
4. **Método de pago**: Tres opciones con radio buttons. MercadoPago como opción predeterminada.
5. **Notas adicionales**: Campo opcional para personalización del pedido.
6. **Seguridad**: Indicador de que el pago es seguro (confianza del usuario).
7. **Botón de confirmación**: Acción principal clara y visible.

## Error más probable del usuario

El usuario puede intentar confirmar el pedido sin seleccionar fecha de entrega, o seleccionar una fecha que es feriado/no laborable.

## Cómo la pantalla lo previene

- El botón "Confirmar pedido" está deshabilitado hasta que se complete la fecha y el método de pago.
- El calendario muestra en gris los días no disponibles (feriados, domingos).
- Si se selecciona una fecha menor a 48 horas, se muestra un mensaje: "La fecha mínima de entrega es [fecha]."
- La validación de campos obligatorios se muestra en tiempo real con mensajes de error claros.
