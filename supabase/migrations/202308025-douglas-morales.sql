CREATE TABLE IF NOT EXISTS tabla_douglas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    dato TEXT
);

INSERT INTO tabla_douglas (nombre, dato)
VALUES ('Douglas Morales', 'Dato de prueba de Douglas 202308025');