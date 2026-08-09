const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.mensaje ?? body.message ?? 'No se pudo completar la solicitud.');
  }

  if (response.status === 204) return null;
  return response.json();
}

export const inventarioService = {
  listar: () => request('/inventario'),
  obtener: (idInventario) => request(`/inventario/${idInventario}`),
  crear: ({ id_medicamento, stock_actual }) => request('/inventario', {
    method: 'POST',
    body: JSON.stringify({ id_medicamento, stock_actual }),
  }),
  actualizar: (idInventario, { id_medicamento, stock_actual }) => request(`/inventario/${idInventario}`, {
    method: 'PUT',
    body: JSON.stringify({ id_medicamento, stock_actual }),
  }),
  eliminar: (idInventario) => request(`/inventario/${idInventario}`, {
    method: 'DELETE',
  }),
};
