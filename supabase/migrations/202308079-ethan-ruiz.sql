-- =========================================================
-- Migración: 202308079-ethan-ruiz.sql
-- Módulo: Usuarios
-- Responsable: Ethan Ruiz (202308079)
--
-- Descripción: Inserta el usuario propio en la tabla de usuarios.
-- =========================================================

CREATE TABLE ethantabla (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL
);

INSERT INTO ethantabla (email, password, rol)
VALUES ('ethan.ruiz@farmacia.com', 'ethan202308079', 'Administrador');
