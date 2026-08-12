CREATE TABLE mariotabla (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    dato TEXT
);


INSERT INTO mariotabla (nombre, dato) 
VALUES ('Mario Guzmán', 'Este es un dato de prueba');