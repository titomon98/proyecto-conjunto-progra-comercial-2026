// Middleware de autenticacion / autorizacion.
// Responsabilidad: validar el token de la peticion antes de llegar al controller.
// PLACEHOLDER: por ahora deja pasar todas las peticiones.

// TODO (equipo usuarios): validar el token y adjuntar el usuario a req.usuario.
const verificarToken = (req, res, next) => {
  next();
};

// TODO (equipo usuarios): validar el rol del usuario autenticado.
const verificarRol = (...roles) => (req, res, next) => {
  next();
};

module.exports = {
  verificarToken,
  verificarRol,
};
