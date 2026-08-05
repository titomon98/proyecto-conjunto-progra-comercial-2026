// Service del modulo proveedores.
// Responsabilidad: logica de negocio del modulo. No conoce req/res ni Express;
// se apoya en el model para leer y escribir datos.

const model = require('./proveedores.model');

const listar = async (query = {}) => {
  const { pagina = 1, limite = 20, busqueda, activo } = query;
  const datos = await model.findAll({ pagina, limite, busqueda, activo });
  return datos;
};

const obtenerPorId = async (id) => {
  const proveedor = await model.findById(id);
  if (!proveedor) {
    const error = new Error('El proveedor no existe');
    error.statusCode = 404;
    throw error;
  }
  return proveedor;
};

const crear = async (datos) => {
  // Regla de negocio: no permitir dos proveedores activos con el mismo nombre
  const existentes = await model.findAll({ busqueda: datos.nombre, activo: true });
  const duplicado = (existentes || []).some(
    (p) => p.nombre?.toLowerCase() === datos.nombre?.toLowerCase()
  );
  if (duplicado) {
    const error = new Error('Ya existe un proveedor activo con ese nombre');
    error.statusCode = 409;
    throw error;
  }
  return model.insert(datos);
};

const actualizar = async (id, datos) => {
  const actualizado = await model.update(id, datos);
  if (!actualizado) {
    const error = new Error('El proveedor no existe');
    error.statusCode = 404;
    throw error;
  }
  return actualizado;
};

const eliminar = async (id) => {
  // Borrado logico: el model debe internamente hacer UPDATE activo=false, no DELETE
  const ok = await model.remove(id);
  if (!ok) {
    const error = new Error('El proveedor no existe');
    error.statusCode = 404;
    throw error;
  }
  return ok;
};

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};