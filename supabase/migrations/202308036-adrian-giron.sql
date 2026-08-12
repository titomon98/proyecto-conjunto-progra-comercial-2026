CREATE TABLE TablaFranco (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    dato TEXT
);

INSERT INTO TablaFranco (nombre, dato) 
VALUES ('Adrian Giron', 'Dato de prueba de Adrian 202308036');