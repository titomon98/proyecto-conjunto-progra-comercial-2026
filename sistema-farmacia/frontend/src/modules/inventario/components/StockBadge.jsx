// Estados de stock según CONTRATO.md sección 7.4:
//   Éxito / Óptimo   -> bg-green-100 text-green-700
//   Advertencia      -> bg-amber-100 text-amber-700   (ej. stock bajo)
//   Error / Crítico  -> bg-red-100 text-red-700        (ej. sin stock)
export function getEstadoStock(stock_actual, stock_minimo) {
  if (stock_actual <= 0) {
    return { label: "Sin stock", classes: "bg-red-100 text-red-700" };
  }
  if (stock_actual <= stock_minimo) {
    return { label: "Stock bajo", classes: "bg-amber-100 text-amber-700" };
  }
  return { label: "Óptimo", classes: "bg-green-100 text-green-700" };
}

export default function StockBadge({ stock_actual, stock_minimo }) {
  const { label, classes } = getEstadoStock(stock_actual, stock_minimo);
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ${classes}`}>
      {label}
    </span>
  );
}
