// backend/src/modules/ventas/ventas.routes.js
import { Router } from 'express';
import { registrarVenta, obtenerVentas } from './ventas.controller.js';

const router = Router();

// POST http://localhost:3000/api/ventas -> Crear Venta
router.post('/', registrarVenta);

// GET http://localhost:3000/api/ventas -> Listar Ventas
router.get('/', obtenerVentas);

export default router;