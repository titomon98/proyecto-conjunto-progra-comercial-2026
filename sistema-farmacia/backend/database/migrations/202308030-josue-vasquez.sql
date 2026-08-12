-- =========================================================
-- Migracion: 202308030-josue-vasquez.sql
-- Estudiante: Josue Vasquez
-- Carnet: 202308030
-- Rama: parcial/josue-vasquez-202308030
--
-- Descripcion: Inserta un usuario propio en la tabla 'usuarios'
-- de la base de datos compartida en Supabase.
--
-- Nota: la tabla 'usuarios' ya existe (CONTRATO.md, Seccion 3).
-- Esta migracion NO modifica la estructura de la base, unicamente
-- agrega un registro.
-- =========================================================

INSERT INTO usuarios (id_usuario, email, password, rol)
VALUES (
    gen_random_uuid(),
    'josue.vasquez@farmacia.test',
    'hash_placeholder_josue',
    'Administrador'
)
ON CONFLICT DO NOTHING;
