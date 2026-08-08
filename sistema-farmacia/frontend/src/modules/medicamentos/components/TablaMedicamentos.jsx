import React from 'react';

export function TablaMedicamentos({ medicamentos, onEditar, onEliminar }) {
  if (!medicamentos || medicamentos.length === 0) {
    return (
      <tr>
        <td colSpan="5" className="text-center py-4 text-gray-500">
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
          <tr key={idMedicamento} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
            <td className="px-4 py-3 font-semibold text-gray-800">{med.nombre}</td>
            <td className="px-4 py-3 text-gray-600">
              {med.descripcion || <em className="text-gray-400">Sin descripción</em>}
            </td>
            <td className="px-4 py-3 font-medium text-gray-700">
              Q {parseFloat(med.precio || 0).toFixed(2)}
            </td>
            <td className="px-4 py-3 text-xs text-gray-500 font-mono">
              {med.id_proveedor}
            </td>
            <td className="px-4 py-3 space-x-2">
              <button
                onClick={() => onEditar && onEditar(med)}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded font-medium transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => onEliminar && onEliminar(idMedicamento)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium transition-colors"
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