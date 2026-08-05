const medicamentosService = require('./medicamentos.service')

const manejarError = (res, error) => res.status(error.status || 500).json({ error: error.message })

const listar = async (req, res) => {
  try {
    res.json(await medicamentosService.listar())
  } catch (error) {
    manejarError(res, error)
  }
}

const obtenerPorId = async (req, res) => {
  try {
    res.json(await medicamentosService.obtenerPorId(req.params.id))
  } catch (error) {
    manejarError(res, error)
  }
}

const crear = async (req, res) => {
  try {
    res.status(201).json(await medicamentosService.crear(req.body))
  } catch (error) {
    manejarError(res, error)
  }
}

const actualizar = async (req, res) => {
  try {
    res.json(await medicamentosService.actualizar(req.params.id, req.body))
  } catch (error) {
    manejarError(res, error)
  }
}

const eliminar = async (req, res) => {
  try {
    await medicamentosService.eliminar(req.params.id)
    res.status(204).send()
  } catch (error) {
    manejarError(res, error)
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar }
