/**
 * Exporta el arreglo de medicamentos filtrados a un archivo CSV.
 */
export function exportarMedicamentosCSV(medicamentos) {
  if (!medicamentos || medicamentos.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const encabezados = ['ID Medicamento', 'Nombre', 'Descripción', 'Precio (Q)', 'ID Proveedor'];
  
  const filas = medicamentos.map(med => [
    `"${med.id_medicamento || ''}"`,
    `"${med.nombre || ''}"`,
    `"${(med.descripcion || '').replace(/"/g, '""')}"`,
    med.precio,
    `"${med.id_proveedor || ''}"`
  ]);

  const contenidoCSV = 'data:text/csv;charset=utf-8,' 
    + [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');

  const encodedUri = encodeURI(contenidoCSV);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `reporte_medicamentos_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}