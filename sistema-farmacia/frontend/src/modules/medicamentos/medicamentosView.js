import { obtenerMedicamentos } from './services/medicamentosApi.js';
import { renderizarTablaMedicamentos, filtrarMedicamentos } from './components/TablaMedicamentos.js';

let listaMedicamentosCache = [];

export async function inicializarModuloMedicamentos() {
  const tablaBody = document.querySelector('#tabla-medicamentos-body');
  const inputBuscador = document.querySelector('#buscar-medicamento');
  const loader = document.querySelector('#loader-medicamentos');

  try {
    if (loader) loader.style.display = 'block';

    // 1. Obtener datos del backend
    listaMedicamentosCache = await obtenerMedicamentos();

    // 2. Renderizar tabla con los datos obtenidos
    renderizarTablaMedicamentos(
      listaMedicamentosCache, 
      tablaBody,
      (id) => console.log('Editar ID:', id),   // Pendiente de conectar con Integrante 2
      (id) => console.log('Eliminar ID:', id)  // Pendiente de conectar con Integrante 2
    );

    // 3. Listener para el buscador en tiempo real
    if (inputBuscador) {
      inputBuscador.addEventListener('input', (e) => {
        const resultadosFiltrados = filtrarMedicamentos(listaMedicamentosCache, e.target.value);
        renderizarTablaMedicamentos(resultadosFiltrados, tablaBody);
      });
    }

  } catch (error) {
    if (tablaBody) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="5" style="color: red; text-align: center;">
            Error al cargar medicamentos: ${error.message}
          </td>
        </tr>
      `;
    }
  } finally {
    if (loader) loader.style.display = 'none';
  }
}