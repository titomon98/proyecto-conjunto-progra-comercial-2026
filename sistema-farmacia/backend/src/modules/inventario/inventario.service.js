const Inventario = require("./inventario.model");

const obtenerInventario = async () => {
  return await Inventario.obtenerTodos();
};

const obtenerInventarioPorId = async (id) => {
  const inventario = await Inventario.obtenerPorId(id);

  if (!inventario) {
    const error = new Error("Inventario no encontrado.");
    error.status = 404;
    throw error;
  }

  return inventario;
};

const crearInventario = async ({ id_medicamento, stock_actual }) => {
  if (!id_medicamento) {
    const error = new Error("El id del medicamento es obligatorio.");
    error.status = 400;
    throw error;
  }

  if (stock_actual === undefined || stock_actual === null) {
    const error = new Error("El stock es obligatorio.");
    error.status = 400;
    throw error;
  }

  if (stock_actual < 0) {
    const error = new Error("El stock no puede ser negativo.");
    error.status = 400;
    throw error;
  }

  return await Inventario.crear({
    id_medicamento,
    stock_actual,
  });
};

const actualizarInventario = async (id, datos) => {
  const inventario = await Inventario.obtenerPorId(id);

  if (!inventario) {
    const error = new Error("Inventario no encontrado.");
    error.status = 404;
    throw error;
  }

  if (!datos.id_medicamento) {
    const error = new Error("El id del medicamento es obligatorio.");
    error.status = 400;
    throw error;
  }

  if (
    datos.stock_actual === undefined ||
    datos.stock_actual === null
  ) {
    const error = new Error("El stock es obligatorio.");
    error.status = 400;
    throw error;
  }

  if (datos.stock_actual < 0) {
    const error = new Error("El stock no puede ser negativo.");
    error.status = 400;
    throw error;
  }

  return await Inventario.actualizar(id, {
    id_medicamento: datos.id_medicamento,
    stock_actual: datos.stock_actual,
  });
};

const eliminarInventario = async (id) => {
  const inventario = await Inventario.obtenerPorId(id);

  if (!inventario) {
    const error = new Error("Inventario no encontrado.");
    error.status = 404;
    throw error;
  }

  await Inventario.eliminar(id);

  return {
    mensaje: "Inventario eliminado correctamente.",
  };
};

// ---------- Funciones que este modulo expone a los demas ----------
// Se publican en index.js. Ventas las consume al registrar una venta
// (CONTRATO.md seccion 4: la integracion pasa por el index del modulo).

const consultarStock = async (idMedicamento) => {
  if (!idMedicamento) {
    const error = new Error("El id del medicamento es obligatorio.");
    error.status = 400;
    throw error;
  }

  const inventario = await Inventario.obtenerPorMedicamento(idMedicamento);

  if (!inventario) {
    const error = new Error(
      `El medicamento ${idMedicamento} no tiene registro de inventario.`
    );
    error.status = 404;
    throw error;
  }

  return inventario;
};

const descontarStock = async (idMedicamento, cantidad) => {
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    const error = new Error("La cantidad a descontar debe ser mayor que cero.");
    error.status = 400;
    throw error;
  }

  const inventario = await consultarStock(idMedicamento);

  if (inventario.stock_actual < cantidad) {
    const error = new Error(
      `Stock insuficiente: hay ${inventario.stock_actual} unidades y se solicitaron ${cantidad}.`
    );
    error.status = 409;
    throw error;
  }

  return await Inventario.actualizar(inventario.id_inventario, {
    stock_actual: inventario.stock_actual - cantidad,
  });
};

module.exports = {
  obtenerInventario,
  obtenerInventarioPorId,
  crearInventario,
  actualizarInventario,
  eliminarInventario,
  consultarStock,
  descontarStock,
};