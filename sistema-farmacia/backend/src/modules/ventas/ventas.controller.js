// backend/src/modules/ventas/ventas.controller.js
import * as ventasService from './ventas.service.js';

export const registrarVenta = async (req, res) => {
  try {
    const { id_cliente, id_usuario, productos } = req.body;

    if (!id_cliente || !id_usuario || !productos) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios (id_cliente, id_usuario, productos)' 
      });
    }

    const nuevaVenta = await ventasService.procesarVenta({ id_cliente, id_usuario, productos });

    return res.status(201).json({
      success: true,
      message: 'Venta realizada con éxito',
      data: nuevaVenta
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error interno al procesar la venta'
    });
  }
};

export const obtenerVentas = async (req, res) => {
  try {
    const ventas = await ventasService.obtenerListaVentas();
    return res.status(200).json({
      success: true,
      data: ventas
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener ventas'
    });
  }
};