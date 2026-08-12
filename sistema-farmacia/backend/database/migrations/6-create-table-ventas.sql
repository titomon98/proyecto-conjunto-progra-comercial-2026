-- =========================================================
-- Migración: 6-create-table-ventas.sql
-- Módulo: Ventas
-- Responsable: Pedro López
-- Rama: feature/ventas-db-model
--
-- Descripción: Crea las tablas 'ventas' y 'detalle_ventas' según la
-- Estructura Base Acordada (CONTRATO.md, Sección 3).
--
-- Requisito de orden de integración (CONTRATO.md, Sección 6 - Fase 4):
-- Esta migración asume que las tablas 'clientes', 'usuarios' y
-- 'medicamentos' YA existen en la base de datos compartida
-- (Fases 1 y 2 ya integradas a 'develop').
-- =========================================================

-- Extensión para generar UUIDs automáticamente (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- Tabla: ventas
-- PK: id_venta | FK: id_cliente -> clientes, id_usuario -> usuarios
-- =========================================================
CREATE TABLE IF NOT EXISTS ventas (
    id_venta    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_cliente  UUID NOT NULL REFERENCES clientes(id_cliente),
    id_usuario  UUID NOT NULL REFERENCES usuarios(id_usuario),
    fecha       TIMESTAMPTZ NOT NULL DEFAULT now(),
    total       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0)
);

-- =========================================================
-- Tabla: detalle_ventas
-- PK: id_detalle | FK: id_venta -> ventas, id_medicamento -> medicamentos
-- =========================================================
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id_detalle      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_venta        UUID NOT NULL REFERENCES ventas(id_venta) ON DELETE CASCADE,
    id_medicamento  UUID NOT NULL REFERENCES medicamentos(id_medicamento),
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    subtotal        NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- =========================================================
-- Índices de apoyo (consultas frecuentes de Ventas y Reportes)
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_ventas_id_cliente          ON ventas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_ventas_id_usuario           ON ventas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha                ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_id_venta       ON detalle_ventas(id_venta);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_id_medicamento ON detalle_ventas(id_medicamento);
