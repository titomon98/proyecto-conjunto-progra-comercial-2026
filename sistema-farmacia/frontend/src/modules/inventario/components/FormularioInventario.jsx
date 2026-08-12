// frontend/src/modules/inventario/components/FormularioInventario.jsx
// Modal para dar de alta un medicamento en bodega o ajustar su stock.
//
// Al crear, el select solo ofrece medicamentos que TODAVIA no estan en
// inventario: la tabla guarda una fila por medicamento y el descontarStock del
// backend busca con .single(), asi que dos filas del mismo medicamento lo
// romperian.
//
// Al editar, el medicamento queda fijo y solo se cambia la cantidad.

import { useEffect, useState } from 'react';

export default function FormularioInventario({
  registroEditar,
  medicamentosDisponibles,
  nombreMedicamento,
  onGuardar,
  onCerrar,
  guardando,
}) {
  const esEdicion = Boolean(registroEditar);

  const [idMedicamento, setIdMedicamento] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (registroEditar) {
      setIdMedicamento(registroEditar.id_medicamento);
      setStock(String(registroEditar.stock_actual ?? ''));
    } else {
      setIdMedicamento('');
      setStock('');
    }
    setError('');
  }, [registroEditar]);

  const manejarSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!idMedicamento) {
      setError('Seleccione el medicamento.');
      return;
    }

    const cantidad = Number(stock);
    if (stock === '' || !Number.isInteger(cantidad)) {
      setError('El stock debe ser un número entero.');
      return;
    }
    if (cantidad < 0) {
      setError('El stock no puede ser negativo.');
      return;
    }

    onGuardar({ id_medicamento: idMedicamento, stock_actual: cantidad });
  };

  const claseInput =
    'w-full px-4 py-2.5 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:text-gray-500';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {esEdicion ? 'Ajustar stock' : 'Registrar en inventario'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {esEdicion
                ? 'Corrija la cantidad disponible en bodega.'
                : 'Dé de alta un medicamento que aún no tiene bodega.'}
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
            <label htmlFor="medicamento" className="block text-sm font-medium text-gray-700 mb-1.5">
              Medicamento <span className="text-red-500">*</span>
            </label>

            {esEdicion ? (
              <input
                id="medicamento"
                type="text"
                value={nombreMedicamento}
                className={claseInput}
                disabled
              />
            ) : (
              <select
                id="medicamento"
                value={idMedicamento}
                onChange={(e) => setIdMedicamento(e.target.value)}
                className={claseInput}
                disabled={guardando || medicamentosDisponibles.length === 0}
              >
                <option value="">Seleccionar medicamento…</option>
                {medicamentosDisponibles.map((m) => (
                  <option key={m.id_medicamento} value={m.id_medicamento}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            )}

            {!esEdicion && medicamentosDisponibles.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Todos los medicamentos ya tienen registro de inventario.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1.5">
              Stock actual <span className="text-red-500">*</span>
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              className={claseInput}
              disabled={guardando}
            />
            <p className="text-xs text-gray-500 mt-1">
              Cantidad de unidades disponibles en bodega.
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
              disabled={guardando || (!esEdicion && medicamentosDisponibles.length === 0)}
              className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
