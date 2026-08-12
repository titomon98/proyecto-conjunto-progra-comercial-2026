CREATE TABLE pedrotabla (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    dato TEXT
);

INSERT INTO pedrotabla (nombre, dato) 
VALUES ('Pedro López', 'Este es un dato de prueba');