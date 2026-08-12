-- Migración para insertar usuario propio
INSERT INTO usuarios (id_usuario, email, password, rol)
VALUES (
    gen_random_uuid(),
    '202308032@farmacia.test',
    'hash_placeholder_1',
    'Administrador'
);