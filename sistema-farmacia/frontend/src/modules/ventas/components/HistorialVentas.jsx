// frontend/src/modules/ventas/components/HistorialVentas.jsx
// Consume GET /api/ventas. Solo lectura: metricas, buscador y tabla.

import { useMemo, useState } from 'react';
import { Tarjeta, Boton, Badge, claseInput, quetzales, fechaCorta } from './ui.jsx';

function Metrica({ etiqueta, valor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
      <p className="text-sm text-gray-500">{etiqueta}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-800">{valor}</p>
    </div>
  );
}

export default function HistorialVentas({ ventas, clientes, cargando, onRecargar }) {
  const [busqueda, setBusqueda] = useState('');

  const nombreCliente = (id) =>
    clientes.find((c) => c.id_cliente === id)?.nombre ?? 'Cliente no identificado';

  const esDeHoy = (fecha) => {
    const f = new Date(fecha);
    const hoy = new Date();
    return f.toDateString() === hoy.toDateString();
  };

  const metricas = useMemo(() => {
    const deHoy = ventas.filter((v) => esDeHoy(v.fecha));
    const totalHoy = deHoy.reduce((a, v) => a + Number(v.total || 0), 0);
    return {
      hoy: deHoy.length,
      totalHoy,
      promedio: deHoy.length ? totalHoy / deHoy.length : 0,
    };
  }, [ventas]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return ventas;
    return ventas.filter(
      (v) =>
        nombreCliente(v.id_cliente).toLowerCase().includes(q) ||
        String(v.id_venta).toLowerCase().includes(q)
    );
  }, [ventas, busqueda, clientes]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metrica etiqueta="Ventas de hoy" valor={metricas.hoy} />
        <Metrica etiqueta="Total cobrado hoy" valor={quetzales(metricas.totalHoy)} />
        <Metrica etiqueta="Ticket promedio" valor={quetzales(metricas.promedio)} />
      </div>

      <Tarjeta
        titulo="Historial de ventas"
        descripcion="Ventas registradas en la base compartida."
        accion={
          <Boton variante="secundario" onClick={onRecargar} disabled={cargando}>
            {cargando ? 'Actualizando…' : 'Actualizar'}
          </Boton>
        }
      >
        <input
          type="search"
          className={`${claseInput} mb-4 sm:max-w-xs`}
          placeholder="Buscar por cliente o número de venta"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 font-medium">Venta</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-gray-500">
                    {cargando
                      ? 'Cargando ventas…'
                      : busqueda
                      ? 'Ninguna venta coincide con la búsqueda.'
                      : 'Todavía no hay ventas registradas. Registrá la primera desde “Nueva venta”.'}
                  </td>
                </tr>
              ) : (
                filtradas.map((v) => (
                  <tr
                    key={v.id_venta}
                    className="border-b border-gray-200 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {String(v.id_venta).slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fechaCorta(v.fecha)}</td>
                    <td className="px-4 py-3 text-gray-800">{nombreCliente(v.id_cliente)}</td>
                    <td className="px-4 py-3">
                      <Badge tono="verde">Registrada</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {quetzales(v.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </div>
  );
}
