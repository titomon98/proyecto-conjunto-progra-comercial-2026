const BASE_URL = 'http://localhost:3000/api/medicamentos';

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