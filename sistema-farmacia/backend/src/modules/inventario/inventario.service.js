// Service del modulo inventario.
// Responsabilidad: logica de negocio del modulo. No conoce req/res ni Express;
// se apoya en el model para leer y escribir datos.

// TODO (equipo inventario): implementar la logica de negocio del modulo.
const listar = async () => {};

const obtenerPorId = async (id) => {};

const crear = async (datos) => {};

const actualizar = async (id, datos) => {};

const eliminar = async (id) => {};



module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
/*
const descontarStock = async (id_medicamento, cantidad) => {
  // 1. Validar parámetros de entrada
  if (!id_medicamento || typeof cantidad !== 'number' || cantidad <= 0) {
    throw new Error('La cantidad a descontar debe ser un número mayor a 0');
  }

  const item = await inventarioModel.findByMedicamentoId(id_medicamento);
  if (!item) throw new Error('El medicamento no existe en el inventario');
  
  if (item.stock_actual < cantidad) {
    throw new Error(`Stock insuficiente. Disponible: ${item.stock_actual}, Solicitado: ${cantidad}`);
  }

  const nuevoStock = item.stock_actual - cantidad;
  return await inventarioModel.update(item.id_inventario, { stock_actual: nuevoStock });
};
*/