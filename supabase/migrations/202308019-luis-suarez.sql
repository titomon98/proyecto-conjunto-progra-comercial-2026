-- =========================================================
-- Migración: 202308019-luis-suarez.sql
-- Módulo: Usuarios
-- Responsable: Luis Emmanuel Suárez Menchú 202308019
-- Rama: parcial/luis-suarez-202308019
--
-- Descripción: Migración de práctica para demostrar el flujo del gitjubilao
-- =========================================================

CREATE TABLE usuariosLUIS (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    dato TEXT
);

INSERT INTO usuarios (nombre, dato)
VALUES ('Luis Suarez', 'No deberia dar problema esta migración');