// Controller del modulo usuarios.
// Responsabilidad: leer la peticion (req), validar la entrada, llamar al service
// y devolver la respuesta (res). No debe contener logica de negocio.

const usuariosService = require('./usuarios.service');

const listar = async (req, res) => {
  try {
    const usuarios = await usuariosService.listar();
    res.json(usuarios);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.mensaje || 'Error interno' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const usuario = await usuariosService.obtenerPorId(req.params.id);
    res.json(usuario);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.mensaje || 'Error interno' });
  }
};

const crear = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'nombre, email y password son obligatorios' });
    }
    const usuario = await usuariosService.crear({ nombre, email, password });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.mensaje || 'Error interno' });
  }
};

const actualizar = async (req, res) => {
  try {
    const usuario = await usuariosService.actualizar(req.params.id, req.body);
    res.json(usuario);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.mensaje || 'Error interno' });
  }
};

const eliminar = async (req, res) => {
  try {
    await usuariosService.eliminar(req.params.id);
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.mensaje || 'Error interno' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son obligatorios' });
    }
    const resultado = await usuariosService.login(email, password);
    res.json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.mensaje || 'Error interno' });
  }
};

const registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'nombre, email y password son obligatorios' });
    }
    const resultado = await usuariosService.registro({ nombre, email, password });
    res.status(201).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.mensaje || 'Error interno' });
  }
};

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  login,
  registro,
};
