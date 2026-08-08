/**
 * Renderiza la tabla de medicamentos dentro del contenedor HTML especificado.
 */
export function renderizarTablaMedicamentos(medicamentos, contenedor, onEditar, onEliminar) {
  if (!medicamentos || medicamentos.length === 0) {
    contenedor.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 1rem;">
          No se encontraron medicamentos registrados.
        </td>
      </tr>
    `;
    return;
  }

  contenedor.innerHTML = medicamentos.map(med => `
    <tr data-id="${med.id_medicamento}">
      <td><strong>${med.nombre}</strong></td>
      <td>${med.descripcion ? med.descripcion : '<em>Sin descripción</em>'}</td>
      <td>Q ${parseFloat(med.precio).toFixed(2)}</td>
      <td><small>${med.id_proveedor}</small></td>
      <td>
        <button class="btn-editar" data-id="${med.id_medicamento}">Editar</button>
        <button class="btn-eliminar" data-id="${med.id_medicamento}">Eliminar</button>
      </td>
    </tr>
  `).join('');

  // Delegar eventos de edición y eliminación al Integrante 2 cuando integren
  contenedor.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => onEditar && onEditar(btn.dataset.id));
  });

  contenedor.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => onEliminar && onEliminar(btn.dataset.id));
  });
}

/**
 * Filtra la lista en memoria según el término ingresado en el buscador.
 */
export function filtrarMedicamentos(listaCompleta, termino) {
  if (!termino) return listaCompleta;
  const busqueda = termino.toLowerCase();
  return listaCompleta.filter(med => 
    med.nombre.toLowerCase().includes(busqueda) ||
    (med.descripcion && med.descripcion.toLowerCase().includes(busqueda))
  );
}