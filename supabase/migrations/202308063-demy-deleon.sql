CREATE TABLE demytabla (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    dato TEXT
);

INSERT INTO demytabla (nombre, dato) 
VALUES ('Demy de Leon', 'Este es un dato de prueba');