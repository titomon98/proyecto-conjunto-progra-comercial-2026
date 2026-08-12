CREATE TABLE marcotable (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    dato TEXT
);


INSERT INTO marcotable (nombre, dato) 
VALUES ('Marco Bolaños', 'El mas grande sigue siendo Municipal');