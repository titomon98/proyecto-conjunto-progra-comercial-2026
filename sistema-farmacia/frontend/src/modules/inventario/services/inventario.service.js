// Capa de acceso a datos del módulo Inventario, del lado del frontend.
//
// Hoy: lee/escribe sobre el arreglo mock en memoria.
// Mañana: cada función solo cambia su cuerpo para hacer fetch() al backend real
// (backend/src/modules/inventario/inventario.routes.js), sin tocar los componentes
// ni el hook useInventario, que ya consumen esta misma interfaz.
//
// Endpoints REST esperados del lado backend (a definir junto al equipo backend):
//   GET    /api/inventario
//   POST   /api/inventario
//   PUT    /api/inventario/:id_inventario
//   POST   /api/inventario/:id_medicamento/descontar   -> descontarStock()

import { INVENTARIO_MOCK, MEDICAMENTOS_MOCK } from "../data/inventario.mock";

// Simula latencia de red para que la UI de loading tenga sentido desde ya.
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Copia mutable en memoria para simular un backend real durante el desarrollo.
let inventarioDB = [...INVENTARIO_MOCK];

function conNombreMedicamento(registro) {
  const medicamento = MEDICAMENTOS_MOCK.find(
    (m) => m.id_medicamento === registro.id_medicamento
  );
  return {
    ...registro,
    nombre_medicamento: medicamento ? medicamento.nombre : "Medicamento no encontrado",
  };
}

export async function getInventario() {
  await delay();
  return inventarioDB.map(conNombreMedicamento);
}

export async function getMedicamentosDisponibles() {
  await delay(150);
  return MEDICAMENTOS_MOCK;
}

export async function crearRegistroInventario({ id_medicamento, stock_actual, stock_minimo }) {
  await delay();
  const nuevo = {
    id_inventario: `inv-${crypto.randomUUID().slice(0, 8)}`,
    id_medicamento,
    stock_actual: Number(stock_actual),
    stock_minimo: Number(stock_minimo),
  };
  inventarioDB = [...inventarioDB, nuevo];
  return conNombreMedicamento(nuevo);
}

export async function actualizarRegistroInventario(id_inventario, cambios) {
  await delay();
  inventarioDB = inventarioDB.map((registro) =>
    registro.id_inventario === id_inventario
      ? { ...registro, ...cambios }
      : registro
  );
  const actualizado = inventarioDB.find((r) => r.id_inventario === id_inventario);
  return conNombreMedicamento(actualizado);
}

// Ejemplo directo de la sección 4 del CONTRATO.md:
// "Si el módulo de Ventas necesita descontar stock tras una compra, debe invocar
// la función exportada por el módulo de Inventario: descontarStock(id_medicamento, cantidad)"
// Se deja implementada aquí del lado frontend para pruebas locales del propio módulo;
// la versión que consumirá el módulo de Ventas vivirá en el backend, expuesta por
// backend/src/modules/inventario/index.js.
export async function descontarStock(id_medicamento, cantidad) {
  await delay();
  const registro = inventarioDB.find((r) => r.id_medicamento === id_medicamento);
  if (!registro) {
    throw new Error(`No existe inventario para el medicamento ${id_medicamento}`);
  }
  if (registro.stock_actual < cantidad) {
    throw new Error("Stock insuficiente para descontar esa cantidad");
  }
  return actualizarRegistroInventario(registro.id_inventario, {
    stock_actual: registro.stock_actual - cantidad,
  });
}
