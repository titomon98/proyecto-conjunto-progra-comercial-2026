// backend/src/modules/ventas/ventas.service.js
// Logica de negocio del modulo ventas. No conoce req/res ni Express.
const ventasModel = require('./ventas.model');
// REGLA DEL CONTRATO (Seccion 4): consumir otros modulos solo por su index.js.
const inventarioModule = require('../inventario');

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

  // 2. Verificar que TODOS los productos tengan stock antes de descontar ninguno.
  // Sin este paso previo, una venta de varios productos podia descontar los
  // primeros y fallar en el ultimo, dejando el inventario descuadrado.
  for (const item of productos) {
    const inventario = await inventarioModule.consultarStock(item.id_medicamento);
    if (inventario.stock_actual < item.cantidad) {
      const error = new Error(
        `Stock insuficiente para el medicamento ${item.id_medicamento}: hay ${inventario.stock_actual} y se solicitaron ${item.cantidad}.`
      );
      error.status = 409;
      throw error;
    }
  }

  // 3. Descontar stock comunicandose con Inventario por su index.js
  for (const item of productos) {
    await inventarioModule.descontarStock(item.id_medicamento, item.cantidad);
  }

  // 4. Registrar la cabecera de la venta
  const nuevaVenta = await ventasModel.crearVenta({
    id_cliente,
    id_usuario,
    total: totalVenta,
  });

  // 5. Asignar el id_venta generado a los detalles y guardarlos
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
