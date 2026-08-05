// backend/src/modules/ventas/ventas.service.js
import * as ventasModel from './ventas.model.js';
// REGLA DEL CONTRATO: Consumir el módulo de Inventario a través de su index.js
import inventarioModule from '../inventario/index.js';

export const procesarVenta = async ({ id_cliente, id_usuario, productos }) => {
  if (!productos || productos.length === 0) {
    throw new Error('La venta debe incluir al menos un producto.');
  }

  // 1. Calcular subtotales y total general
  let totalVenta = 0;
  const detallesParaInsertar = [];

  for (const item of productos) {
    const subtotal = item.precio * item.cantidad;
    totalVenta += subtotal;

    detallesParaInsertar.push({
      id_medicamento: item.id_medicamento,
      cantidad: item.cantidad,
      subtotal
    });
  }

  // 2. Descontar stock comunicándose con Inventario (Fase 3/4)
  for (const item of productos) {
    await inventarioModule.descontarStock(item.id_medicamento, item.cantidad);
  }

  // 3. Registrar la cabecera de la Venta a través del Modelo
  const nuevaVenta = await ventasModel.crearVentaDB({
    id_cliente,
    id_usuario,
    total: totalVenta
  });

  // 4. Asignar el id_venta generado a los detalles y guardarlos
  const detallesConVenta = detallesParaInsertar.map(det => ({
    ...det,
    id_venta: nuevaVenta.id_venta
  }));

  await ventasModel.crearDetallesDB(detallesConVenta);

  return nuevaVenta;
};

export const obtenerListaVentas = async () => {
  return await ventasModel.obtenerVentasDB();
};