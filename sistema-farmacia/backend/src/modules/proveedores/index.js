// Punto de entrada publico del modulo proveedores.
// Exporta UNICAMENTE lo que este modulo expone hacia el resto del sistema.
// Los demas archivos del modulo son internos: no deben importarse desde fuera.

const router = require('./proveedores.routes');
const proveedoresService = require('./proveedores.service');

// Uso interno para otros modulos (ej. Medicamentos valida su FK id_proveedor)
const obtenerPorId = async (id) => {
  try {
    return await proveedoresService.obtenerPorId(id);
  } catch {
    return null; // otros modulos esperan null si no existe, no un throw
  }
};

const existeProveedor = async (id) => {
  const proveedor = await obtenerPorId(id);
  return proveedor !== null;
};

const listarActivos = async () => {
  return proveedoresService.listar({ activo: true, limite: 1000 });
};

module.exports = {
  router,
  obtenerPorId,
  existeProveedor,
  listarActivos,
};