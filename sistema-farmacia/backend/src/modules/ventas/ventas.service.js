// backend/src/modules/ventas/ventas.service.js
// Logica de negocio del modulo ventas. No conoce req/res ni Express.
const ventasModel = require('./ventas.model');
// REGLA DEL CONTRATO (Seccion 4): consumir otros modulos solo por su index.js.
const inventarioModule = require('../inventario');

// Inventario todavia no expone descontarStock en su index.js (Fase 3 pendiente).
// Mientras tanto la venta se registra igual y se deja constancia en el log, en vez
// de tumbar el endpoint. Cuando el equipo de Inventario publique la funcion, esta
// guarda deja de aplicar sola.
const descontarStock = async (id_medicamento, cantidad) => {
  if (typeof inventarioModule.descontarStock !== 'function') {
    console.warn(
      `[ventas] Inventario aun no expone descontarStock(); no se descuenta stock del medicamento ${id_medicamento} (cantidad ${cantidad}).`
    );
    return;
  }
  await inventarioModule.descontarStock(id_medicamento, cantidad);
};

const procesarVenta = async ({ id_cliente, id_usuario, productos }) => {
  if (!productos || productos.length === 0) {
    const error = new Error('La venta debe incluir al menos un producto.');
    error.status = 400;
    throw error;
  }

  // 1. Calcular subtotales y total general
  let totalVenta = 0;
  const detallesParaInsertar = [];

  for (const item of productos) {
    if (!item.id_medicamento || item.cantidad == null || item.precio == null) {
      const error = new Error('Cada producto requiere id_medicamento, cantidad y precio.');
      error.status = 400;
      throw error;
    }
    if (item.cantidad <= 0) {
      const error = new Error('La cantidad debe ser mayor que cero.');
      error.status = 400;
      throw error;
    }

    const subtotal = item.precio * item.cantidad;
    totalVenta += subtotal;

    detallesParaInsertar.push({
      id_medicamento: item.id_medicamento,
      cantidad: item.cantidad,
      subtotal,
    });
  }

  // 2. Descontar stock comunicandose con Inventario (Fase 3/4)
  for (const item of productos) {
    await descontarStock(item.id_medicamento, item.cantidad);
  }

  // 3. Registrar la cabecera de la venta
  const nuevaVenta = await ventasModel.crearVenta({
    id_cliente,
    id_usuario,
    total: totalVenta,
  });

  // 4. Asignar el id_venta generado a los detalles y guardarlos
  const detallesConVenta = detallesParaInsertar.map((det) => ({
    ...det,
    id_venta: nuevaVenta.id_venta,
  }));

  await ventasModel.crearDetalleVenta(detallesConVenta);

  return nuevaVenta;
};

const obtenerListaVentas = async (opciones) => ventasModel.listarVentas(opciones);

module.exports = {
  procesarVenta,
  obtenerListaVentas,
};
