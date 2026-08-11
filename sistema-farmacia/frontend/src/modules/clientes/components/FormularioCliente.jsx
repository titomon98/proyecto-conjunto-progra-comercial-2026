// frontend/src/modules/clientes/components/FormularioCliente.jsx
// Modal de crear/editar cliente.
//
// La tabla clientes tiene id_cliente, nombre, nit y created_at. Los dos campos
// editables son nombre y nit, y el backend exige ambos.

import { useEffect, useState } from 'react';

export default function FormularioCliente({
  clienteEditar,
  onGuardar,
  onCerrar,
  guardando,
}) {
  const esEdicion = Boolean(clienteEditar);

  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (clienteEditar) {
      setNombre(clienteEditar.nombre || '');
      setNit(clienteEditar.nit || '');
    } else {
      setNombre('');
      setNit('');
    }
    setError('');
  }, [clienteEditar]);

  const manejarSubmit = (e) => {
    e.preventDefault();
    setError('');

    const nombreLimpio = nombre.trim();
    const nitLimpio = nit.trim();

    if (!nombreLimpio) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!nitLimpio) {
      setError('El NIT es obligatorio. Use CF si el cliente es consumidor final.');
      return;
    }

    onGuardar({ nombre: nombreLimpio, nit: nitLimpio });
  };

  const claseInput =
    'w-full px-4 py-2.5 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {esEdicion
                ? 'Actualice los datos del cliente seleccionado.'
                : 'Registre un cliente para poder facturarle ventas.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={manejarSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Ana Lucía Morales"
              className={claseInput}
              disabled={guardando}
            />
          </div>

          <div>
            <label htmlFor="nit" className="block text-sm font-medium text-gray-700 mb-1.5">
              NIT <span className="text-red-500">*</span>
            </label>
            <input
              id="nit"
              type="text"
              value={nit}
              onChange={(e) => setNit(e.target.value)}
              placeholder="Ej. 5544332-1"
              className={claseInput}
              disabled={guardando}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use <span className="font-mono">CF</span> para consumidor final.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
