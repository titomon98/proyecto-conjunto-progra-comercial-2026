// Service del modulo usuarios.
// Responsabilidad: logica de negocio del modulo. No conoce req/res ni Express;
// se apoya en el model para leer y escribir datos.
//
// Nota sobre las contrasenas: se guardan y comparan en TEXTO PLANO, tal como
// estan sembradas en la tabla usuarios de la base compartida. Es una decision
// consciente del grupo para este proyecto de curso; si alguna vez esto sale de
// localhost, hay que pasar a bcrypt y re-sembrar las filas existentes.

const jwt = require('jsonwebtoken');
const usuariosModel = require('./usuarios.model');

const JWT_SECRET = process.env.JWT_SECRET || 'cambiar-este-valor';

// Rol por defecto de quien se registra solo. Debe ser uno de los valores que ya
// usa la tabla: Administrador, Vendedor, Bodega, Supervisor.
const ROL_POR_DEFECTO = 'Vendedor';

// ---------- helpers ----------

const generarToken = (usuario) => {
  return jwt.sign(
    { id_usuario: usuario.id_usuario, email: usuario.email, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// Quita la password de una fila antes de devolverla hacia el controller.
const sinPassword = (usuario) => {
  const { password, ...resto } = usuario;
  return resto;
};

// ---------- CRUD ----------

const listar = async () => {
  return await usuariosModel.findAll();
};

const obtenerPorId = async (id) => {
  const usuario = await usuariosModel.findById(id);
  if (!usuario) throw { status: 404, mensaje: 'Usuario no encontrado' };
  return usuario;
};

const crear = async (datos) => {
  const existe = await usuariosModel.findByEmail(datos.email);
  if (existe) throw { status: 409, mensaje: 'El email ya esta registrado' };

  const nuevoUsuario = {
    email: datos.email,
    password: datos.password,
    rol: datos.rol || ROL_POR_DEFECTO,
  };

  return await usuariosModel.insert(nuevoUsuario);
};

const actualizar = async (id, datos) => {
  // Solo se dejan pasar las columnas que existen en la tabla.
  const cambios = {};
  if (datos.email !== undefined) cambios.email = datos.email;
  if (datos.rol !== undefined) cambios.rol = datos.rol;
  if (datos.password) cambios.password = datos.password;

  const usuario = await usuariosModel.update(id, cambios);
  if (!usuario) throw { status: 404, mensaje: 'Usuario no encontrado' };
  return usuario;
};

const eliminar = async (id) => {
  const usuario = await usuariosModel.remove(id);
  if (!usuario) throw { status: 404, mensaje: 'Usuario no encontrado' };
  return usuario;
};

// ---------- AUTH ----------

const login = async (email, password) => {
  const usuario = await usuariosModel.findByEmail(email);
  if (!usuario) throw { status: 401, mensaje: 'Credenciales invalidas' };

  if (usuario.password !== password) {
    throw { status: 401, mensaje: 'Credenciales invalidas' };
  }

  return {
    token: generarToken(usuario),
    usuario: sinPassword(usuario),
  };
};

const registro = async (datos) => {
  const usuario = await crear(datos);
  return { token: generarToken(usuario), usuario };
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
