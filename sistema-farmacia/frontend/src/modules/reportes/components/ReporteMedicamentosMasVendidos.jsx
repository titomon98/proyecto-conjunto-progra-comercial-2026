import { useState } from 'react';
import { obtenerMedicamentosMasVendidos } from '../reportes.api.js';
import FiltroPeriodo from './FiltroPeriodo.jsx';
import {
  Aviso,
  Cargando,
  Metrica,
  SinResultados,
  Tarjeta,
  numero,
  quetzales,
} from './ui.jsx';

export default function ReporteMedicamentosMasVendidos() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [reporte, setReporte] = useState(null);

  const generar = async () => {
    if (Boolean(fechaInicio) !== Boolean(fechaFin)) {
      setError('Debe indicar ambas fechas o ninguna de las dos.');
      setReporte(null);
      return;
    }
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      setError('La fecha inicial no puede ser posterior a la fecha final.');
      setReporte(null);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const data = await obtenerMedicamentosMasVendidos({ fechaInicio, fechaFin });
      setReporte(data);
    } catch (e) {
      setError(e.message);
      setReporte(null);
    } finally {
      setCargando(false);
    }
  };

  const limpiar = () => {
    setFechaInicio('');
    setFechaFin('');
    setError(null);
    setReporte(null);
  };

  const filas = reporte?.medicamentos ?? [];
  const totalUnidades = filas.reduce((suma, f) => suma + f.unidades_vendidas, 0);
  const totalMonto = filas.reduce((suma, f) => suma + f.monto_total, 0);

  return (
    <div className="space-y-4">
      <Tarjeta
        titulo="Medicamentos más vendidos"
        descripcion="Ranking por unidades vendidas. El período es opcional: sin fechas se toma el histórico completo."
      >
        <FiltroPeriodo
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onFechaInicio={setFechaInicio}
          onFechaFin={setFechaFin}
          onGenerar={generar}
          onLimpiar={limpiar}
          cargando={cargando}
        />
      </Tarjeta>

      {error && <Aviso tono="rojo">{error}</Aviso>}

      {cargando && <Cargando />}

      {!cargando && !error && reporte && filas.length === 0 && (
        <SinResultados texto="No se encontraron medicamentos vendidos en el período seleccionado." />
      )}

      {!cargando && !error && filas.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Metrica etiqueta="Medicamentos vendidos" valor={numero(reporte.total_medicamentos)} />
            <Metrica etiqueta="Unidades vendidas" valor={numero(totalUnidades)} />
            <Metrica etiqueta="Monto total" valor={quetzales(totalMonto)} />
          </div>

          <Tarjeta className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Medicamento</th>
                    <th className="px-4 py-3 font-medium text-right">Unidades</th>
                    <th className="px-4 py-3 font-medium text-right">Ventas</th>
                    <th className="px-4 py-3 font-medium text-right">Monto total</th>
                    <th className="px-4 py-3 font-medium text-right">Prom. unidades/venta</th>
                    <th className="px-4 py-3 font-medium text-right">Prom. monto/venta</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((fila, indice) => (
                    <tr
                      key={fila.id_medicamento}
                      className="border-b border-gray-200 hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3 text-gray-500">{indice + 1}</td>
                      <td className="px-4 py-3 text-gray-800">{fila.nombre}</td>
                      <td className="px-4 py-3 text-right text-gray-800">
                        {numero(fila.unidades_vendidas)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {numero(fila.cantidad_ventas)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800">
                        {quetzales(fila.monto_total)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {numero(fila.promedio_unidades_por_venta)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {quetzales(fila.promedio_monto_por_venta)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tarjeta>
        </>
      )}
    </div>
  );
}