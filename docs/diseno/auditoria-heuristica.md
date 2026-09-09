# Auditoría Heurística — Wireframes Bon Gout

## Metodología

Aplicación de las 10 Heurísticas de Nielsen sobre los 2 wireframes del proyecto:
1. Pantalla de Catálogo de Productos
2. Pantalla de Checkout

Escala: ✅ Cumple parcialmente | ❌ No cumple | ✅ Cumple

---

## Heurística 1: Visibilidad del estado del sistema

| Heurística | ¿Cumple? | Evidencia | Corrección propuesta |
|---|---|---|---|
| El sistema debe mantener informado al usuario sobre lo que está pasando | ✅ | El carrito muestra cantidad de productos en la barra de navegación. El checkout muestra el resumen del pedido. | Agregar indicador de carga durante la búsqueda en el catálogo. |

## Heurística 2: Correspondencia entre el sistema y el mundo real

| Heurística | ¿Cumple? | Evidencia | Corrección propuesta |
|---|---|---|---|
| El sistema debe hablar el lenguaje del usuario | ✅ | Se usan términos del dominio: "torta", "alfajor", "carrito", "pedido". Los precios están en pesos argentinos. | Sin corrección necesaria. |

## Heurística 3: Control y libertad del usuario

| Heurística | ¿Cumple? | Evidencia | Corrección propuesta |
|---|---|---|---|
| El usuario necesita una salida de emergencia clara | ❌ | No hay botón para volver atrás en el checkout sin perder el pedido. No hay confirmación antes de eliminar un producto del carrito. | Agregar botón "Volver al carrito" en el checkout. Agregar confirmación "¿Eliminar este producto?" antes de borrar. |

## Heurística 4: Consistencia y estándares

| Heurística | ¿Cumple? | Evidencia | Corrección propuesta |
|---|---|---|---|
| El sistema debe seguir convenciones | ✅ | La barra de navegación es consistente en ambas pantallas. El botón de acción principal siempre está abajo. | Sin corrección necesaria. |

## Heurística 5: Prevención de errores

| Heurística | ¿Cumple? | Evidencia | Corrección propuesta |
|---|---|---|---|
| El diseño debe prevenir errores antes de que ocurran | ❌ | No hay validación de fecha mínima de entrega en el wireframe. No se muestra si un producto tiene stock antes de agregar al carrito. | Agregar validación visual de stock en la card del producto. Agregar restricción de fecha mínima en el calendario del checkout. |

## Heurística 6: Reconocimiento en lugar de memoria

| Heurística | ¿Cumple? | Evidencia | Corrección propuesta |
|---|---|---|---|
| El usuario no debe recordar información de una pantalla a otra | ✅ | El resumen del pedido en el checkout muestra todo lo que se agregó en el catálogo. | Sin corrección necesaria. |

## Heurística 7: Flexibilidad y eficiencia de uso

| Heurística | ¿Cumple? | Evidencia | Corrección propuesta |
|---|---|---|---|
| El sistema debe ser usable por usuarios novatos y expertos | ✅ | La búsqueda permite encontrar productos rápidamente. Los filtros de categoría agilizan la navegación. | Agregar atajo de teclado para búsqueda (Ctrl+K) para usuarios frecuentes. |

## Heurística 8: Estética y diseño minimalista

| Heurística | ¿Cumple? | Evidencia | Corrección propuesta |
|---|---|---|---|
| Mostrar solo información relevante | ✅ | Las cards muestran imagen, nombre y precio. El checkout muestra solo los campos necesarios. | Sin corrección necesaria. |

## Heurística 9: Ayudar a reconocer, diagnosticar y recuperarse de errores

| Heurística | ¿Cumple? | Evidencia | Corrección propuesta |
|---|---|---|---|
| Los mensajes de error deben ser claros y sugerir soluciones | ❌ | No hay mensajes de error definidos en los wireframes para campos obligatorios faltantes. | Agregar mensajes de error inline: "Seleccioná una fecha de entrega", "Elegí un método de pago". |

## Heurística 10: Ayuda y documentación

| Heurística | ¿Cumple? | Evidencia | Corrección propuesta |
|---|---|---|---|
| Es mejor que el sistema sea usable sin documentación | ✅ | La interfaz es intuitiva: catálogo → carrito → checkout. Los botones tienen etiquetas claras. | Agregar tooltip en el ícono de personalización: "Escribí el mensaje que querés en el producto". |

---

## Resumen de hallazgos

| # | Hallazgo | Gravedad | Corrección aplicada |
|---|---|---|---|
| 1 | No hay salida de emergencia en el checkout (Heurística 3) | Alta | Agregar botón "Volver al carrito" y confirmación antes de eliminar |
| 2 | No hay validación de stock en el catálogo (Heurística 5) | Alta | Mostrar indicador de stock en la card del producto |
| 3 | No hay mensajes de error en el checkout (Heurística 9) | Media | Agregar mensajes inline para campos obligatorios |

## Correcciones aplicadas a los wireframes

Las correcciones se aplicarán en la implementación del frontend:
1. Botón "Volver al carrito" en la pantalla de checkout.
2. Confirmación "¿Eliminar este producto?" antes de borrar del carrito.
3. Indicador de stock agotado en las cards del catálogo.
4. Mensajes de error inline en el checkout para campos obligatorios.
5. Restricción de fecha mínima de 48 horas en el calendario.
