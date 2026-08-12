-- =========================================================
-- Migración: crear tabla emerson_table + datos iniciales
-- Responsable: Emerson Tahay
--
-- Ejecutar en el SQL Editor de Supabase.
-- =========================================================

CREATE TABLE IF NOT EXISTS emerson_table (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    rol         VARCHAR(50)  NOT NULL DEFAULT 'Vendedor',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Seed: usuario administrador
INSERT INTO emerson_table (email, password, rol)
VALUES ('ebtahay05@gmail.com', 'admin123', 'Administrador')
ON CONFLICT (email) DO NOTHING;
