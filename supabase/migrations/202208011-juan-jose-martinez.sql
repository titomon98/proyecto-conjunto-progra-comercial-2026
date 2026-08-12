-- Migración de usuario
-- Juan José Martínez
-- Carnet: 202208011

INSERT INTO usuarios (
    id_usuario,
    email,
    password,
    rol,
    created_at
)
VALUES (
    gen_random_uuid(),
    'juan.martinez@farmacia.test',
    'hash_placeholder_6',
    'Vendedor',
    now()
);