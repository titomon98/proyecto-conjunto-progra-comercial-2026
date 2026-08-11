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
   Clientes y Medicamentos son de otros equipos (Fases 1 y 2). Mientras no esten
   integrados en develop, estas llamadas fallan: devolvemos null y la pantalla
   entra en modo demo con datos locales, sin romperse. */

export const obtenerClientes = () => request('/clientes').catch(() => null);
export const obtenerMedicamentos = () => request('/medicamentos').catch(() => null);
