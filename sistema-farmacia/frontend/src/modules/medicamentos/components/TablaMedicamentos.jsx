import React from 'react';

export function TablaMedicamentos({ medicamentos, onEditar, onEliminar }) {
  if (!medicamentos || medicamentos.length === 0) {
    return (
      <tr>
        <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>
          No se encontraron medicamentos registrados.
        </td>
      </tr>
    );
  }

  return (
    <>
      {medicamentos.map((med) => (
        <tr key={med.id_medicamento}>
          <td><strong>{med.nombre}</strong></td>
          <td>{med.descripcion || <em>Sin descripción</em>}</td>
          <td>Q {parseFloat(med.precio).toFixed(2)}</td>
          <td><small>{med.id_proveedor}</small></td>
          <td>
            <button onClick={() => onEditar && onEditar(med.id_medicamento)}>
              Editar
            </button>
            <button onClick={() => onEliminar && onEliminar(med.id_medicamento)}>
              Eliminar
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}