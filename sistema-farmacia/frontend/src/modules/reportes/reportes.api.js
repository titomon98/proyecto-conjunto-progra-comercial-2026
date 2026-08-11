const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request(path) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Error ${res.status} al llamar ${path}`);
  }

  return json.data ?? json;
}

function construirQuery({ fechaInicio, fechaFin } = {}) {
  const params = new URLSearchParams();
  if (fechaInicio) params.set('fechaInicio', fechaInicio);
  if (fechaFin) params.set('fechaFin', fechaFin);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const obtenerMedicamentosMasVendidos = (filtros) =>
  request(`/reportes/medicamentos-mas-vendidos${construirQuery(filtros)}`);

export const obtenerVentasDiarias = (filtros) =>
  request(`/reportes/ventas-diarias${construirQuery(filtros)}`);