import { useState } from 'react';
import { obtenerReporteVentas, obtenerReporteVentasPorCliente } from './reportes.api.js';
import ReporteMedicamentosMasVendidos from './components/ReporteMedicamentosMasVendidos.jsx';
import ReporteVentasDiarias from './components/ReporteVentasDiarias.jsx';

const PESTANAS = [
  { id: 'ventas', texto: 'Ventas por periodo' },
  { id: 'clientes', texto: 'Ventas por cliente' },
  { id: 'medicamentos', texto: 'Medicamentos mas vendidos' },
  { id: 'diarias', texto: 'Ventas diarias' },
];

const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
});

function formatearFecha(fecha) {
  if (!fecha) return '-';
  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(fecha));
}

function Aviso({ tono = 'gris', children }) {
  const clases = {
    gris: 'bg-gray-50 text-gray-600 border-gray-200',
    rojo: 'bg-red-100 text-red-700 border-red-200',
    azul: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${clases[tono]}`}>
      {children}
    </div>
  );
}

export default function ReportesPage() {
  const [pestana, setPestana] = useState('ventas');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [fechaInicioClientes, setFechaInicioClientes] = useState('');
  const [fechaFinClientes, setFechaFinClientes] = useState('');
  const [reporteVentas, setReporteVentas] = useState(null);
  const [reporteClientes, setReporteClientes] = useState(null);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [errorVentas, setErrorVentas] = useState(null);
  const [errorClientes, setErrorClientes] = useState(null);

  const generarVentas = async (event) => {
    event.preventDefault();
    setCargandoVentas(true);
    setErrorVentas(null);

    try {
      const data = await obtenerReporteVentas({ fechaInicio, fechaFin });
      setReporteVentas(data);
    } catch (error) {
      setReporteVentas(null);
      setErrorVentas(error.message || 'No se pudo generar el reporte de ventas.');
    } finally {
      setCargandoVentas(false);
    }
  };

  const generarVentasPorCliente = async (event) => {
    event.preventDefault();
    setCargandoClientes(true);
    setErrorClientes(null);

    try {
      const data = await obtenerReporteVentasPorCliente({
        fechaInicio: fechaInicioClientes,
        fechaFin: fechaFinClientes,
      });
      setReporteClientes(data);
    } catch (error) {
      setReporteClientes(null);
      setErrorClientes(error.message || 'No se pudo generar el reporte de ventas por cliente.');
    } finally {
      setCargandoClientes(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Consulta de ventas por periodo y ventas agrupadas por cliente.
        </p>
      </header>

      <nav className="mb-6 flex gap-1 rounded-lg bg-white p-1 shadow-sm border border-gray-200 w-fit">
        {PESTANAS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPestana(item.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              pestana === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item.texto}
          </button>
        ))}
      </nav>

      {pestana === 'medicamentos' && <ReporteMedicamentosMasVendidos />}

      {pestana === 'diarias' && <ReporteVentasDiarias />}

      {pestana === 'ventas' && (
        <section className="space-y-6">
          <form
            onSubmit={generarVentas}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha inicial
                </span>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(event) => setFechaInicio(event.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha final
                </span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(event) => setFechaFin(event.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800"
                />
              </label>

              <button
                type="submit"
                disabled={cargandoVentas}
                className="bg-blue-600 text-white rounded-md px-4 py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {cargandoVentas ? 'Generando...' : 'Generar reporte'}
              </button>
            </div>
          </form>

          {errorVentas && <Aviso tono="rojo">{errorVentas}</Aviso>}
          {cargandoVentas && <Aviso tono="azul">Cargando ventas del periodo...</Aviso>}

          {reporteVentas && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
                  <p className="text-sm text-gray-500">Total de ventas</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-800">
                    {reporteVentas.resumen.total_ventas}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
                  <p className="text-sm text-gray-500">Unidades vendidas</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-800">
                    {reporteVentas.resumen.total_unidades}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
                  <p className="text-sm text-gray-500">Monto vendido</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-800">
                    {formatoMoneda.format(reporteVentas.resumen.monto_total)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left text-sm font-medium text-gray-500 uppercase px-6 py-3">
                          Fecha
                        </th>
                        <th className="text-left text-sm font-medium text-gray-500 uppercase px-6 py-3">
                          Venta
                        </th>
                        <th className="text-left text-sm font-medium text-gray-500 uppercase px-6 py-3">
                          Cliente
                        </th>
                        <th className="text-right text-sm font-medium text-gray-500 uppercase px-6 py-3">
                          Unidades
                        </th>
                        <th className="text-right text-sm font-medium text-gray-500 uppercase px-6 py-3">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reporteVentas.ventas.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No existen ventas registradas en el periodo seleccionado.
                          </td>
                        </tr>
                      ) : (
                        reporteVentas.ventas.map((venta) => (
                          <tr key={venta.id_venta} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4 text-sm text-gray-800">
                              {formatearFecha(venta.fecha)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                              {venta.id_venta}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800">
                              {venta.cliente}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800 text-right">
                              {venta.total_unidades}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800 text-right font-medium">
                              {formatoMoneda.format(venta.total)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {pestana === 'clientes' && (
        <section className="space-y-6">
          <form
            onSubmit={generarVentasPorCliente}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha inicial
                </span>
                <input
                  type="date"
                  value={fechaInicioClientes}
                  onChange={(event) => setFechaInicioClientes(event.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha final
                </span>
                <input
                  type="date"
                  value={fechaFinClientes}
                  onChange={(event) => setFechaFinClientes(event.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800"
                />
              </label>

              <button
                type="submit"
                disabled={cargandoClientes}
                className="bg-blue-600 text-white rounded-md px-4 py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {cargandoClientes ? 'Generando...' : 'Generar reporte'}
              </button>
            </div>
          </form>

          {errorClientes && <Aviso tono="rojo">{errorClientes}</Aviso>}
          {cargandoClientes && <Aviso tono="azul">Cargando ventas por cliente...</Aviso>}

          {reporteClientes && (
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
                <p className="text-sm text-gray-500">Clientes</p>
                <p className="mt-1 text-2xl font-semibold text-gray-800">
                  {reporteClientes.resumen.total_clientes}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
                <p className="text-sm text-gray-500">Ventas</p>
                <p className="mt-1 text-2xl font-semibold text-gray-800">
                  {reporteClientes.resumen.total_ventas}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
                <p className="text-sm text-gray-500">Unidades</p>
                <p className="mt-1 text-2xl font-semibold text-gray-800">
                  {reporteClientes.resumen.total_unidades}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
                <p className="text-sm text-gray-500">Total comprado</p>
                <p className="mt-1 text-2xl font-semibold text-gray-800">
                  {formatoMoneda.format(reporteClientes.resumen.monto_total)}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-sm font-medium text-gray-500 uppercase px-6 py-3">
                      Cliente
                    </th>
                    <th className="text-right text-sm font-medium text-gray-500 uppercase px-6 py-3">
                      Ventas
                    </th>
                    <th className="text-right text-sm font-medium text-gray-500 uppercase px-6 py-3">
                      Unidades
                    </th>
                    <th className="text-right text-sm font-medium text-gray-500 uppercase px-6 py-3">
                      Total comprado
                    </th>
                    <th className="text-left text-sm font-medium text-gray-500 uppercase px-6 py-3">
                      Ultima compra
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {!cargandoClientes && !reporteClientes ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Genera el reporte para consultar las ventas agrupadas por cliente.
                      </td>
                    </tr>
                  ) : !cargandoClientes && reporteClientes?.clientes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No existen ventas de clientes para mostrar.
                      </td>
                    </tr>
                  ) : (
                    reporteClientes?.clientes.map((registro) => (
                      <tr key={registro.id_cliente} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                          {registro.cliente}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 text-right">
                          {registro.cantidad_ventas}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 text-right">
                          {registro.total_unidades}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 text-right font-medium">
                          {formatoMoneda.format(registro.total_comprado)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {formatearFecha(registro.ultima_compra)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
