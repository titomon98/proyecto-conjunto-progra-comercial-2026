// Rutas del modulo usuarios.
// Responsabilidad: mapear cada endpoint HTTP con su funcion del controller.
const { Router } = require("express");
const usuariosController = require("./usuarios.controller");
const { verificarToken } = require("../../middlewares/auth.middleware");

const router = Router();

// --- Rutas publicas (no requieren token) ---
router.post("/login", usuariosController.login);
router.post("/registro", usuariosController.registro);

// --- Rutas protegidas (requieren token) ---
router.get("/", verificarToken, usuariosController.listar);
router.get("/:id", verificarToken, usuariosController.obtenerPorId);
router.post("/", verificarToken, usuariosController.crear);
router.put("/:id", verificarToken, usuariosController.actualizar);
router.delete("/:id", verificarToken, usuariosController.eliminar);

module.exports = router;
