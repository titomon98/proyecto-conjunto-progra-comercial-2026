import StockBadge, { getEstadoStock } from "./StockBadge";

export default function AlertasStock({ registros }) {
  const alertas = registros
    .filter((r) => r.stock_actual <= r.stock_minimo)
    .sort((a, b) => a.stock_actual - b.stock_actual);

  if (alertas.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-base text-gray-800">Sin alertas de stock por el momento.</p>
        <p className="mt-1 text-sm text-gray-500">
          Todos los medicamentos están por encima de su stock mínimo.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800">Alertas de stock</h2>
      <p className="mt-1 text-sm text-gray-500">
        Medicamentos en o por debajo de su stock mínimo, del más crítico al menos urgente.
      </p>

      <ul className="mt-4 divide-y divide-gray-200">
        {alertas.map((registro) => {
          const { label } = getEstadoStock(registro.stock_actual, registro.stock_minimo);
          return (
            <li key={registro.id_inventario} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-gray-800">{registro.nombre_medicamento}</p>
                <p className="text-sm text-gray-500">
                  {registro.stock_actual} en stock · mínimo {registro.stock_minimo}
                  {label === "Sin stock" ? " · requiere reposición inmediata" : ""}
                </p>
              </div>
              <StockBadge stock_actual={registro.stock_actual} stock_minimo={registro.stock_minimo} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
