// frontend/src/modules/ventas/ventas.api.js
// Unico lugar del modulo que habla con el backend.
// Base URL configurable con VITE_API_URL en frontend/.env

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Error ${res.status} al llamar ${path}`);
  }

  return json.data ?? json;
}

/* ---------- Endpoints propios del modulo ventas ---------- */

// GET /api/ventas
export const obtenerVentas = () => request('/ventas');

// POST /api/ventas
// venta = { id_cliente, id_usuario, productos: [{ id_medicamento, cantidad, precio }] }
export const registrarVenta = (venta) =>
  request('/ventas', { method: 'POST', body: JSON.stringify(venta) });

/* ---------- Catalogos de otros modulos ----------
   Se consumen por sus endpoints publicos. El stock no viene con el medicamento:
   vive en la tabla inventario, asi que hay que pedir las dos cosas y cruzarlas. */

export const obtenerClientes = () => request('/clientes');
export const obtenerMedicamentos = () => request('/medicamentos');
export const obtenerInventario = () => request('/inventario');

// Devuelve los medicamentos con su stock_actual incorporado. Un medicamento sin
// fila en inventario queda con stock 0: no se puede vender lo que no esta dado
// de alta en bodega.
export async function obtenerMedicamentosConStock() {
  const [medicamentos, inventario] = await Promise.all([
    obtenerMedicamentos(),
    obtenerInventario(),
  ]);

  const stockPorMedicamento = new Map(
    (inventario ?? []).map((i) => [i.id_medicamento, i.stock_actual])
  );

  return (medicamentos ?? []).map((m) => ({
    ...m,
    stock_actual: stockPorMedicamento.get(m.id_medicamento) ?? 0,
  }));
}
