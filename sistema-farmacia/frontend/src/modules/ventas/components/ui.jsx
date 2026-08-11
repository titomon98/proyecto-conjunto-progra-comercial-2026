// frontend/src/modules/ventas/components/ui.jsx
// Piezas visuales internas del modulo ventas.
// Siguen la seccion 7 del CONTRATO.md (paleta, bordes, sombras, badges).
// Viven aqui a proposito: frontend/src/components/ es carpeta compartida.

export function Tarjeta({ titulo, descripcion, accion, children, className = '' }) {
  return (
    <section
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      {(titulo || accion) && (
        <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-200">
          <div>
            {titulo && <h2 className="text-xl font-semibold text-gray-800">{titulo}</h2>}
            {descripcion && <p className="text-sm text-gray-500 mt-0.5">{descripcion}</p>}
          </div>
          {accion}
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

export function Badge({ tono = 'verde', children }) {
  const tonos = {
    verde: 'bg-green-100 text-green-700',
    ambar: 'bg-amber-100 text-amber-700',
    rojo: 'bg-red-100 text-red-700',
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tonos[tono]}`}
    >
      {children}
    </span>
  );
}

export function Campo({ etiqueta, ayuda, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{etiqueta}</span>
      {children}
      {ayuda && <span className="block text-xs text-gray-500 mt-1">{ayuda}</span>}
    </label>
  );
}

export const claseInput =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-800 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-gray-50 disabled:text-gray-500';

export function Aviso({ tono = 'verde', children, onCerrar }) {
  const tonos = {
    verde: 'bg-green-100 text-green-700',
    ambar: 'bg-amber-100 text-amber-700',
    rojo: 'bg-red-100 text-red-700',
  };
  return (
    <div
      role="status"
      className={`flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm ${tonos[tono]}`}
    >
      <span>{children}</span>
      {onCerrar && (
        <button onClick={onCerrar} className="text-xs font-medium underline shrink-0">
          Cerrar
        </button>
      )}
    </div>
  );
}

/* Utilidades de formato */

export const quetzales = (n) =>
  `Q ${Number(n || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const fechaCorta = (valor) => {
  if (!valor) return '—';
  const f = new Date(valor);
  if (Number.isNaN(f.getTime())) return '—';
  return f.toLocaleString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const estadoStock = (stock) => {
  if (stock <= 0) return { tono: 'rojo', texto: 'Sin stock' };
  if (stock <= 10) return { tono: 'ambar', texto: `Stock bajo · ${stock}` };
  return { tono: 'verde', texto: `Disponible · ${stock}` };
};
