const BASE_URL = 'http://localhost:3000/api/medicamentos';

/**
 * Obtiene el listado completo de medicamentos desde el backend.
 */
export const obtenerMedicamentos = async () => {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtener Medicamentos:', error);
    throw error;
  }
};

/**
 * Obtiene la información detallada de un medicamento específico por su UUID.
 */
export const obtenerMedicamentoPorId = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Medicamento no encontrado');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener medicamento ${id}:`, error);
    throw error;
  }
};