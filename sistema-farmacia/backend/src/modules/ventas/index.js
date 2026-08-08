// backend/src/modules/ventas/index.js
import { obtenerListaVentas } from './ventas.service.js';

export default {
  obtenerVentasParaReportes: obtenerListaVentas
};