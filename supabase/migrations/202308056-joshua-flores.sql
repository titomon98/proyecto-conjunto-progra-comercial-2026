-- =========================================================
-- Migración: 202308056-joshua-flores.sql
-- Evaluación parcial: inserción de usuario propio
-- Estudiante: Joshua David Flores Morales
-- Carnet: 202308056
-- Rama: parcial/joshua-flores-202308056
--
-- Inserta un registro propio en la tabla 'usuarios' según la
-- Estructura Base Acordada (CONTRATO.md, Sección 3):
-- usuarios (PK: id_usuario UUID, email, password, rol)
-- =========================================================

INSERT INTO usuarios (id_usuario, email, password, rol)
VALUES (
    gen_random_uuid(),
    'joshuaf14@sistemafarmacia.com',
    'joshuaf14',
    'vendedor'
);
