// frontend/src/modules/reportes/reportes.api.js
// Unico lugar del modulo que habla con el backend.

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

export const obtenerReporteVentas = ({ fechaInicio, fechaFin }) => {
  const params = new URLSearchParams({ fechaInicio, fechaFin });
  return request(`/reportes/ventas?${params.toString()}`);
};

export const obtenerReporteVentasPorCliente = ({ fechaInicio, fechaFin } = {}) => {
  const params = new URLSearchParams();
  if (fechaInicio) params.set('fechaInicio', fechaInicio);
  if (fechaFin) params.set('fechaFin', fechaFin);

  const query = params.toString();
  return request(`/reportes/ventas-clientes${query ? `?${query}` : ''}`);
};

export const obtenerReporteMedicamentosMasVendidos = ({ fechaInicio, fechaFin } = {}) => {
  const params = new URLSearchParams();
  if (fechaInicio) params.set('fechaInicio', fechaInicio);
  if (fechaFin) params.set('fechaFin', fechaFin);

  const query = params.toString();
  return request(`/reportes/medicamentos-mas-vendidos${query ? `?${query}` : ''}`);
};

export const obtenerReporteVentasDiarias = ({ fechaInicio, fechaFin }) => {
  const params = new URLSearchParams({ fechaInicio, fechaFin });
  return request(`/reportes/ventas-diarias?${params.toString()}`);
};