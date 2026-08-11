import { Boton, Campo, claseInput } from './ui.jsx';

export default function FiltroPeriodo({
  fechaInicio,
  fechaFin,
  onFechaInicio,
  onFechaFin,
  onGenerar,
  onLimpiar,
  cargando,
  obligatorio = false,
}) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="w-44">
        <Campo etiqueta={obligatorio ? 'Fecha inicial *' : 'Fecha inicial'}>
          <input
            type="date"
            value={fechaInicio}
            max={fechaFin || undefined}
            onChange={(e) => onFechaInicio(e.target.value)}
            disabled={cargando}
            className={claseInput}
          />
        </Campo>
      </div>

      <div className="w-44">
        <Campo etiqueta={obligatorio ? 'Fecha final *' : 'Fecha final'}>
          <input
            type="date"
            value={fechaFin}
            min={fechaInicio || undefined}
            onChange={(e) => onFechaFin(e.target.value)}
            disabled={cargando}
            className={claseInput}
          />
        </Campo>
      </div>

      <Boton onClick={onGenerar} disabled={cargando}>
        {cargando ? 'Generando...' : 'Generar reporte'}
      </Boton>

      {onLimpiar && (
        <Boton variante="secundario" onClick={onLimpiar} disabled={cargando}>
          Limpiar filtros
        </Boton>
      )}
    </div>
  );
}