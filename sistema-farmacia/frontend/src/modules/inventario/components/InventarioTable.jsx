import StockBadge from "./StockBadge";

export default function InventarioTable({ registros, loading, onEditar }) {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow-sm">
        Cargando inventario…
      </div>
    );
  }

  if (registros.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow-sm">
        <p className="text-base text-gray-800">Todavía no hay registros de inventario.</p>
        <p className="mt-1 text-sm text-gray-500">
          Usa "Nuevo registro" para asignar stock a un medicamento.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Medicamento</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock actual</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock mínimo</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {registros.map((registro) => (
            <tr key={registro.id_inventario} className="hover:bg-gray-50/50">
              <td className="px-4 py-3 text-sm text-gray-800">{registro.nombre_medicamento}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{registro.stock_actual}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{registro.stock_minimo}</td>
              <td className="px-4 py-3">
                <StockBadge stock_actual={registro.stock_actual} stock_minimo={registro.stock_minimo} />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEditar(registro)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
