const medicamentosModel = require('./medicamentos.model')

const listar = async () => medicamentosModel.findAll()

const obtenerPorId = async id => {
  const medicamento = await medicamentosModel.findById(id)
  if (!medicamento) {
    const error = new Error('Medicamento no encontrado')
    error.status = 404
    throw error
  }
  return medicamento
}

const crear = async datos => {
  const { nombre, precio, id_proveedor } = datos
  if (!nombre || precio == null || !id_proveedor) {
    const error = new Error('nombre, precio e id_proveedor son obligatorios')
    error.status = 400
    throw error
  }
  if (precio < 0) {
    const error = new Error('El precio no puede ser negativo')
    error.status = 400
    throw error
  }
  return medicamentosModel.insert(datos)
}

const actualizar = async (id, datos) => {
  await obtenerPorId(id)
  return medicamentosModel.update(id, datos)
}

const eliminar = async id => {
  await obtenerPorId(id)
  return medicamentosModel.remove(id)
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar }
