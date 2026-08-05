// backend/src/modules/proveedores/proveedores.controller.js
// Dueña: Integrante B — Capa HTTP (routes → controller → service)
//
// Regla inviolable del README: "El controller nunca habla con el model."
// Aquí solo se llama al service y se traduce el resultado a HTTP.
// Cero lógica de negocio, cero acceso a base de datos.
//
// Los errores NO se resuelven aquí con try/catch que responde directo:
// se pasan con next(error) al manejador de errores del módulo (de D).
//
// Mientras C no entregue proveedores.service.js, usa el stub incluido en
// proveedores.service.stub.js (ver ese archivo para instrucciones).

const service = require('./proveedores.service');

async function crear(req, res, next) {
  try {
    const proveedor = await service.crearProveedor(req.body);
    res.status(201).json({
      ok: true,
      mensaje: 'Proveedor creado correctamente',
      datos: proveedor,
    });
  } catch (error) {
    next(error);
  }
}

async function listar(req, res, next) {
  try {
    const { pagina, limite, busqueda, activo } = req.query;

    const query = {
      pagina: pagina !== undefined ? Number(pagina) : undefined,
      limite: limite !== undefined ? Number(limite) : undefined,
      busqueda,
      activo: activo !== undefined ? activo === 'true' : undefined,
    };

    const resultado = await service.listarProveedores(query);

    res.status(200).json({
      ok: true,
      mensaje: 'Proveedores obtenidos correctamente',
      datos: resultado,
    });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const proveedor = await service.obtenerProveedor(req.params.id);
    res.status(200).json({
      ok: true,
      mensaje: 'Proveedor obtenido correctamente',
      datos: proveedor,
    });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const proveedor = await service.actualizarProveedor(req.params.id, req.body);
    res.status(200).json({
      ok: true,
      mensaje: 'Proveedor actualizado correctamente',
      datos: proveedor,
    });
  } catch (error) {
    next(error);
  }
}

async function desactivar(req, res, next) {
  try {
    await service.desactivarProveedor(req.params.id);
    res.status(200).json({
      ok: true,
      mensaje: 'Proveedor desactivado correctamente',
      datos: null,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  actualizar,
  desactivar,
};