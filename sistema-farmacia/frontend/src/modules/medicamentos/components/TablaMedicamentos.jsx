import React from 'react';

export function TablaMedicamentos({ medicamentos, onEditar, onEliminar }) {
  if (!medicamentos || medicamentos.length === 0) {
    return (
      <tr>
        <td colSpan="5" className="text-center py-12 text-gray-500">
          No se encontraron medicamentos registrados.
        </td>
      </tr>
    );
  }

  return (
    <>
      {medicamentos.map((med) => {
        // Soporta tanto 'id' como 'id_medicamento' según la respuesta de la API
        const idMedicamento = med.id_medicamento || med.id;

        return (
          <tr key={idMedicamento} className="border-b border-gray-200 hover:bg-gray-50/50">
            <td className="px-6 py-4 text-sm text-gray-800 font-medium">{med.nombre}</td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {med.descripcion || <em className="text-gray-400">Sin descripción</em>}
            </td>
            <td className="px-6 py-4 text-sm text-gray-800">
              Q {parseFloat(med.precio || 0).toFixed(2)}
            </td>
            <td className="px-6 py-4 text-xs text-gray-500 font-mono">
              {med.id_proveedor}
            </td>
            <td className="px-6 py-4 text-sm text-right space-x-3">
              <button
                onClick={() => onEditar && onEditar(med)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Editar
              </button>
              <button
                onClick={() => onEliminar && onEliminar(idMedicamento)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Eliminar
              </button>
            </td>
          </tr>
        );
      })}
    </>
  );
}
