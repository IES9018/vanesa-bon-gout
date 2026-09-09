# Wireframe: Pantalla de Catálogo de Productos

## Objetivo

Permitir al cliente navegar el catálogo completo de productos de Bon Gout, ver precios, descripciones y opciones de personalización, y agregar productos al carrito de compras.

## Entrada principal

El cliente accede desde la página principal o el menú de navegación. Esta es la pantalla más visitada del sistema.

## Wireframe

```
+------------------------------------------------------+
|  BON GOUT          [Catálogo] [Pedidos] [Carrito(0)] |
+------------------------------------------------------+
|                                                      |
|  Buscar: [________________________] [🔍]             |
|                                                      |
|  Categorías:                                         |
|  [Todas] [Tortas] [Facturas] [Alfajores] [Bebidas]  |
|                                                      |
+------------------------------------------------------+
|                                                      |
|  +------------------+  +------------------+          |
|  |   [Imagen]       |  |   [Imagen]       |          |
|  |                  |  |                  |          |
|  +------------------+  +------------------+          |
|  Torta de chocolate |  | Tarta de frutas  |          |
|  $4.500             |  | $3.800           |          |
|  Personalizable ✏️  |  |                  |          |
|  [Agregar al carrito]  [Agregar al carrito]          |
|                                                      |
|  +------------------+  +------------------+          |
|  |   [Imagen]       |  |   [Imagen]       |          |
|  |                  |  |                  |          |
|  +------------------+  +------------------+          |
|  Alfajor x12        |  | Jugo natural     |          |
|  $2.200             |  | $800             |          |
|  [Agregar al carrito]  [Agregar al carrito]          |
|                                                      |
+------------------------------------------------------+
|  ← Anterior    Página 1 de 3    Siguiente →          |
+------------------------------------------------------+
```

## Elementos clave

1. **Barra de búsqueda**: Permite filtrar productos por nombre en tiempo real.
2. **Filtros de categoría**: Tabs horizontales para filtrar por tipo de producto.
3. **Cards de producto**: Cada card muestra imagen, nombre, precio y botón de agregar.
4. **Indicador de personalización**: Si el producto admite personalización (mensaje, decoración), se muestra un ícono de edición.
5. **Paginación**: Navegación entre páginas del catálogo.
6. **Carrito**: Indicador de cantidad de productos en el carrito.

## Error más probable del usuario

El usuario puede no encontrar un producto específico porque no sabe en qué categoría está o no escribe el nombre completo en la búsqueda.

## Cómo la pantalla lo previene

- La barra de búsqueda filtra en tiempo real mientras se escribe, mostrando resultados parciales.
- El filtro "Todas" muestra todos los productos sin importar la categoría.
- Si no hay resultados, se muestra un mensaje: "No se encontraron productos. Intentá con otro término."
