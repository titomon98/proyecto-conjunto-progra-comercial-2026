import { useState } from 'react';
import { obtenerVentasDiarias } from '../reportes.api.js';
import FiltroPeriodo from './FiltroPeriodo.jsx';
import {
  Aviso,
  Cargando,
  Metrica,
  SinResultados,
  Tarjeta,
  fechaDia,
  numero,
  quetzales,
} from './ui.jsx';

export default function ReporteVentasDiarias() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [reporte, setReporte] = useState(null);

  const generar = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('La fecha inicial y la fecha final son obligatorias.');
      setReporte(null);
      return;
    }
    if (fechaInicio > fechaFin) {
      setError('La fecha inicial no puede ser posterior a la fecha final.');
      setReporte(null);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const data = await obtenerVentasDiarias({ fechaInicio, fechaFin });
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

  const dias = reporte?.dias ?? [];
  const resumen = reporte?.resumen;

  return (
    <div className="space-y-4">
      <Tarjeta
        titulo="Ventas diarias"
        descripcion="Ventas agrupadas por día dentro del período. Ambas fechas son obligatorias."
      >
        <FiltroPeriodo
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onFechaInicio={setFechaInicio}
          onFechaFin={setFechaFin}
          onGenerar={generar}
          onLimpiar={limpiar}
          cargando={cargando}
          obligatorio
        />
      </Tarjeta>

      {error && <Aviso tono="rojo">{error}</Aviso>}

      {cargando && <Cargando />}

      {!cargando && !error && reporte && dias.length === 0 && (
        <SinResultados texto="No se registraron ventas en el período seleccionado." />
      )}

      {!cargando && !error && dias.length > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Metrica etiqueta="Días con ventas" valor={numero(resumen.total_dias_con_ventas)} />
            <Metrica etiqueta="Ventas realizadas" valor={numero(resumen.total_ventas)} />
            <Metrica etiqueta="Unidades vendidas" valor={numero(resumen.total_unidades_vendidas)} />
            <Metrica etiqueta="Monto total" valor={quetzales(resumen.monto_total)} />
          </div>

          <Tarjeta className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium text-right">Ventas</th>
                    <th className="px-4 py-3 font-medium text-right">Unidades</th>
                    <th className="px-4 py-3 font-medium text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {dias.map((dia) => (
                    <tr key={dia.fecha} className="border-b border-gray-200 hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-800">{fechaDia(dia.fecha)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {numero(dia.cantidad_ventas)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {numero(dia.unidades_vendidas)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800">
                        {quetzales(dia.monto_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-medium text-gray-800">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">{numero(resumen.total_ventas)}</td>
                    <td className="px-4 py-3 text-right">
                      {numero(resumen.total_unidades_vendidas)}
                    </td>
                    <td className="px-4 py-3 text-right">{quetzales(resumen.monto_total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Tarjeta>
        </>
      )}
    </div>
  );
}