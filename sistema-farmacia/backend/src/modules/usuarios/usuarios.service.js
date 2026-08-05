// Service del modulo usuarios.
// Responsabilidad: logica de negocio del modulo. No conoce req/res ni Express;
// se apoya en el model para leer y escribir datos.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usuariosModel = require("./usuarios.model");

const JWT_SECRET = process.env.JWT_SECRET || "cambiar-este-valor";
const SALT_ROUNDS = 10;

// ---------- helpers ----------

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: "8h" },
  );
};

// ---------- CRUD ----------

const listar = async () => {
  return await usuariosModel.findAll();
};

const obtenerPorId = async (id) => {
  const usuario = await usuariosModel.findById(id);
  if (!usuario) throw { status: 404, mensaje: "Usuario no encontrado" };
  return usuario;
};

const crear = async (datos) => {
  const existe = await usuariosModel.findByEmail(datos.email);
  if (existe) throw { status: 409, mensaje: "El email ya esta registrado" };

  const hash = await bcrypt.hash(datos.password, SALT_ROUNDS);

  const nuevoUsuario = {
    nombre: datos.nombre,
    email: datos.email,
    password_hash: hash,
    rol: "admin",
    activo: true,
  };

  return await usuariosModel.insert(nuevoUsuario);
};

const actualizar = async (id, datos) => {
  if (datos.password) {
    datos.password_hash = await bcrypt.hash(datos.password, SALT_ROUNDS);
    delete datos.password;
  }

  const usuario = await usuariosModel.update(id, datos);
  if (!usuario) throw { status: 404, mensaje: "Usuario no encontrado" };
  return usuario;
};

const eliminar = async (id) => {
  const usuario = await usuariosModel.remove(id);
  if (!usuario) throw { status: 404, mensaje: "Usuario no encontrado" };
  return usuario;
};

// ---------- AUTH ----------

const login = async (email, password) => {
  const usuario = await usuariosModel.findByEmail(email);
  if (!usuario) throw { status: 401, mensaje: "Credenciales invalidas" };

  const coincide = await bcrypt.compare(password, usuario.password_hash);
  if (!coincide) throw { status: 401, mensaje: "Credenciales invalidas" };

  if (!usuario.activo) throw { status: 403, mensaje: "Usuario desactivado" };

  const token = generarToken(usuario);
  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  };
};

const registro = async (datos) => {
  const usuario = await crear(datos);
  const token = generarToken(usuario);
  return { token, usuario };
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
