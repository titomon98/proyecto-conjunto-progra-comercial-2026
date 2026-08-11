// Configurable con VITE_API_URL en frontend/.env (ver .env.example).
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const BASE_URL = `${API_URL}/medicamentos`;

/**
 * Obtiene el listado completo de medicamentos.
 */
export const obtenerMedicamentos = async () => {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error HTTP: ${response.status}`);
  }
  return await response.json();
};

/**
 * Obtiene un medicamento por su ID (UUID).
 */
export const obtenerMedicamentoPorId = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Medicamento no encontrado');
  }
  return await response.json();
};

export const crearMedicamento = async (datos) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al registrar el medicamento');
  return data;
};


export const actualizarMedicamento = async (id, datos) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al actualizar el medicamento');
  return data;
};


export const eliminarMedicamento = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error al eliminar el medicamento');
  }
  return true;
};