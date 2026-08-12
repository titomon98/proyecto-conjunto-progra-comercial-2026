-- Migracion parcial: insertar usuario propio
-- Angel Ovalle - 202308014

INSERT INTO usuarios (id_usuario, email, password, rol)
VALUES (
    gen_random_uuid(),
    'angel.ovalle.202308014@ejemplo.com',
    'parcial2026',
    'Vendedor'
);
