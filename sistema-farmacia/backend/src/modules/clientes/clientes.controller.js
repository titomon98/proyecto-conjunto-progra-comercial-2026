// Controller del modulo clientes.
// Responsabilidad: leer la peticion (req), validar la entrada, llamar al service
// y devolver la respuesta (res). No debe contener logica de negocio.

const clientesService = require('./clientes.service');

const listar = async (req, res) => {
  try {
    const clientes = await clientesService.listar();
    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar clientes.', error: error.message });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const cliente = await clientesService.obtenerPorId(req.params.id);
    res.status(200).json(cliente);
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const nuevoCliente = await clientesService.crear(req.body);
    res.status(201).json(nuevoCliente);
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const clienteActualizado = await clientesService.actualizar(req.params.id, req.body);
    res.status(200).json(clienteActualizado);
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    await clientesService.eliminar(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
};

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};