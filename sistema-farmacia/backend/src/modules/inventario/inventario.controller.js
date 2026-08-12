const InventarioService = require("./inventario.service");

const getAll = async (req, res) => {
  try {
    const inventario = await InventarioService.obtenerInventario();

    return res.status(200).json(inventario);
  } catch (error) {
    return res.status(error.status || 500).json({
      mensaje: error.message || "Error al obtener el inventario.",
    });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        mensaje: "El id es obligatorio.",
      });
    }

    const inventario =
      await InventarioService.obtenerInventarioPorId(id);

    return res.status(200).json(inventario);
  } catch (error) {
    return res.status(error.status || 500).json({
      mensaje: error.message || "Error al obtener el registro.",
    });
  }
};

const create = async (req, res) => {
  try {
    const inventario =
      await InventarioService.crearInventario(req.body);

    return res.status(201).json(inventario);
  } catch (error) {
    return res.status(error.status || 500).json({
      mensaje: error.message || "Error al crear el registro.",
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        mensaje: "El id es obligatorio.",
      });
    }

    const inventario =
      await InventarioService.actualizarInventario(
        id,
        req.body
      );

    return res.status(200).json(inventario);
  } catch (error) {
    return res.status(error.status || 500).json({
      mensaje: error.message || "Error al actualizar el registro.",
    });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        mensaje: "El id es obligatorio.",
      });
    }

    const resultado =
      await InventarioService.eliminarInventario(id);

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(error.status || 500).json({
      mensaje: error.message || "Error al eliminar el registro.",
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};