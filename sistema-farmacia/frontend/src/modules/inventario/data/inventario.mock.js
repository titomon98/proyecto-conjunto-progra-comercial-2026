// Datos de prueba (mock) para el módulo Inventario.
// Cuando el backend esté listo, este archivo deja de usarse: inventario.service.js
// solo tiene que apuntar a fetch('/api/inventario') en vez de leer estos arrays.
//
// Esquema según CONTRATO.md sección 3:
//   inventario (PK: id_inventario UUID, FK: id_medicamento, stock_actual, stock_minimo)
// Nota: el CONTRATO.md tiene el nombre del último campo vacío (`` ``), se asume
// "stock_minimo" porque es lo que necesitamos para las alertas de la sección 7.4.
// Confirmar con el equipo de Medicamentos/Inventario si el campo real es otro.

export const MEDICAMENTOS_MOCK = [
  { id_medicamento: "med-001", nombre: "Paracetamol 500mg" },
  { id_medicamento: "med-002", nombre: "Ibuprofeno 400mg" },
  { id_medicamento: "med-003", nombre: "Amoxicilina 500mg" },
  { id_medicamento: "med-004", nombre: "Loratadina 10mg" },
  { id_medicamento: "med-005", nombre: "Omeprazol 20mg" },
  { id_medicamento: "med-006", nombre: "Suero Oral 500ml" },
];

export const INVENTARIO_MOCK = [
  {
    id_inventario: "inv-001",
    id_medicamento: "med-001",
    stock_actual: 120,
    stock_minimo: 30,
  },
  {
    id_inventario: "inv-002",
    id_medicamento: "med-002",
    stock_actual: 18,
    stock_minimo: 20,
  },
  {
    id_inventario: "inv-003",
    id_medicamento: "med-003",
    stock_actual: 0,
    stock_minimo: 15,
  },
  {
    id_inventario: "inv-004",
    id_medicamento: "med-004",
    stock_actual: 64,
    stock_minimo: 25,
  },
  {
    id_inventario: "inv-005",
    id_medicamento: "med-005",
    stock_actual: 9,
    stock_minimo: 10,
  },
  {
    id_inventario: "inv-006",
    id_medicamento: "med-006",
    stock_actual: 200,
    stock_minimo: 50,
  },
];
