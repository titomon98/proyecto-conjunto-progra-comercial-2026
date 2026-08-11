// Service del modulo clientes.
// Responsabilidad: logica de negocio del modulo. No conoce req/res ni Express;
// se apoya en el model para leer y escribir datos.

const clientesModel = require('./clientes.model');

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const validarDatosCliente = (datos, { parcial = false } = {}) => {
  const errores = [];
  const { nombre, nit } = datos || {};

  if (!parcial || nombre !== undefined) {
    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      errores.push('El campo "nombre" es obligatorio y debe ser texto.');
    }
  }

  if (!parcial || nit !== undefined) {
    if (!nit || typeof nit !== 'string' || !nit.trim()) {
      errores.push('El campo "nit" es obligatorio y debe ser texto.');
    }
  }

  return errores;
};

const listar = async () => {
  return clientesModel.findAll();
};

const obtenerPorId = async (id) => {
  if (!id) throw crearError('El id del cliente es requerido.', 400);

  const cliente = await clientesModel.findById(id);
  if (!cliente) throw crearError('Cliente no encontrado.', 404);

  return cliente;
};

const crear = async (datos) => {
  const errores = validarDatosCliente(datos);
  if (errores.length) throw crearError(errores.join(' '), 400);

  const nuevoCliente = {
    nombre: datos.nombre.trim(),
    nit: datos.nit.trim(),
  };

  return clientesModel.insert(nuevoCliente);
};

const actualizar = async (id, datos) => {
  if (!id) throw crearError('El id del cliente es requerido.', 400);

  const errores = validarDatosCliente(datos, { parcial: true });
  if (errores.length) throw crearError(errores.join(' '), 400);

  // Lanza 404 si no existe, evitando updates "fantasma"
  await obtenerPorId(id);

  const cambios = {};
  if (datos.nombre !== undefined) cambios.nombre = datos.nombre.trim();
  if (datos.nit !== undefined) cambios.nit = datos.nit.trim();

  return clientesModel.update(id, cambios);
};

const eliminar = async (id) => {
  if (!id) throw crearError('El id del cliente es requerido.', 400);

  await obtenerPorId(id);

  return clientesModel.remove(id);
};

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};