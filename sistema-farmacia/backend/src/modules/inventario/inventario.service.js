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

module.exports = {
  obtenerInventario,
  obtenerInventarioPorId,
  crearInventario,
  actualizarInventario,
  eliminarInventario,
};