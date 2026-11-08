-- Schema inicial del sistema Bon Gout

CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_base DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    imagen VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    puntos_fidelidad INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'empleado')),
    email VARCHAR(100) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_produccion', 'en_entrega', 'entregado', 'cancelado')),
    total DECIMAL(10,2) NOT NULL,
    observaciones TEXT
);

CREATE TABLE IF NOT EXISTS detalle_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    personalizaciones TEXT
);

CREATE TABLE IF NOT EXISTS inventario (
    id SERIAL PRIMARY KEY,
    nombre_ingrediente VARCHAR(100) NOT NULL,
    cantidad_disponible DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    punto_reorden DECIMAL(10,2) DEFAULT 0
);

-- RF-06: movimientos auditables de inventario (entrada / salida / ajuste).
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id SERIAL PRIMARY KEY,
    inventario_id INTEGER REFERENCES inventario(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
    cantidad DECIMAL(10,2) NOT NULL,
    motivo VARCHAR(200) NOT NULL,
    pedido_id INTEGER REFERENCES pedidos(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RF-07: testimonios con moderación previa (1 por pedido).
CREATE TABLE IF NOT EXISTS testimonios (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER UNIQUE REFERENCES pedidos(id) ON DELETE CASCADE,
    cliente_id INTEGER REFERENCES clientes(id),
    comentario TEXT NOT NULL,
    calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    estado VARCHAR(10) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RF-04: pagos en modo sandbox (MercadoPago simulado o transferencia).
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    metodo VARCHAR(20) NOT NULL CHECK (metodo IN ('mercadopago', 'transferencia')),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'reembolsado')),
    monto DECIMAL(10,2) NOT NULL,
    referencia_externa VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RF-05: reservas de entregas y consultas (cupo por slot en la capa de servicio).
CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    fecha TIMESTAMP NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrega', 'consulta')),
    estado VARCHAR(10) DEFAULT 'confirmada' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RF-08: cola de salida simulada (email / WhatsApp), sin envío real (NG-09).
CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    canal VARCHAR(10) NOT NULL CHECK (canal IN ('email', 'whatsapp')),
    evento VARCHAR(30) NOT NULL CHECK (evento IN ('pedido_creado', 'estado_cambiado', 'recordatorio_entrega')),
    destino VARCHAR(120) NOT NULL,
    estado VARCHAR(10) DEFAULT 'en_cola' CHECK (estado IN ('en_cola', 'enviada', 'fallida')),
    intentos INTEGER DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
