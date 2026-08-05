CREATE TABLE medicamentos (
  id_medicamento UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proveedor UUID NOT NULL REFERENCES proveedores(id_proveedor),
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0)
);
