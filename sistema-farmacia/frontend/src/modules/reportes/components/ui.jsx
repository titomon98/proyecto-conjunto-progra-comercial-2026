export function Tarjeta({ titulo, descripcion, children, className = '' }) {
  return (
    <section className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {titulo && (
        <header className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{titulo}</h2>
          {descripcion && <p className="text-sm text-gray-500 mt-0.5">{descripcion}</p>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Boton({ variante = 'primario', className = '', children, ...props }) {
  const estilos = {
    primario:
      'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed',
    secundario:
      'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
  };
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 ${estilos[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Campo({ etiqueta, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{etiqueta}</span>
      {children}
    </label>
  );
}

export function Aviso({ tono = 'rojo', children }) {
  const tonos = {
    verde: 'bg-green-100 text-green-700',
    ambar: 'bg-amber-100 text-amber-700',
    rojo: 'bg-red-100 text-red-700',
  };
  return (
    <div role="status" className={`rounded-lg px-4 py-3 text-sm ${tonos[tono]}`}>
      {children}
    </div>
  );
}

export function Cargando({ texto = 'Generando reporte...' }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      {texto}
    </div>
  );
}

export function SinResultados({ texto }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
      {texto}
    </div>
  );
}

export function Metrica({ etiqueta, valor }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs text-gray-500">{etiqueta}</p>
      <p className="text-xl font-semibold text-gray-800">{valor}</p>
    </div>
  );
}

export const claseInput =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-800 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-gray-50 disabled:text-gray-500';

export const quetzales = (n) =>
  `Q ${Number(n || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const numero = (n) => Number(n || 0).toLocaleString('es-GT');

export const fechaDia = (valor) => {
  if (!valor) return '—';
  const f = new Date(`${valor}T00:00:00Z`);
  if (Number.isNaN(f.getTime())) return valor;
  return f.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};