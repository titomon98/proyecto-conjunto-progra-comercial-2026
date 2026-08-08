// frontend/src/modules/ventas/components/NuevaVenta.jsx
// Formulario de registro de venta: cliente + carrito de medicamentos.
// Arma el payload que espera POST /api/ventas y lo entrega al padre.

import { useMemo, useState } from 'react';
import {
  Tarjeta,
  Boton,
  Badge,
  Campo,
  Aviso,
  claseInput,
  quetzales,
  estadoStock,
} from './ui.jsx';

export default function NuevaVenta({ clientes, medicamentos, onRegistrar, guardando }) {
  const [idCliente, setIdCliente] = useState('');
  const [idMedicamento, setIdMedicamento] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [carrito, setCarrito] = useState([]);
  const [error, setError] = useState('');

  const medicamentoElegido = medicamentos.find((m) => m.id_medicamento === idMedicamento);
  const total = useMemo(
    () => carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [carrito]
  );

  const agregar = () => {
    setError('');

    if (!medicamentoElegido) return setError('Elegí un medicamento antes de agregarlo.');
    const cant = Number(cantidad);
    if (!Number.isInteger(cant) || cant < 1)
      return setError('La cantidad debe ser un número entero mayor a 0.');
    if (medicamentoElegido.stock_actual <= 0)
      return setError(`${medicamentoElegido.nombre} no tiene stock disponible.`);

    const yaEnCarrito = carrito.find((i) => i.id_medicamento === idMedicamento);
    const cantidadTotal = cant + (yaEnCarrito?.cantidad ?? 0);

    if (cantidadTotal > medicamentoElegido.stock_actual)
      return setError(
        `Solo hay ${medicamentoElegido.stock_actual} unidades de ${medicamentoElegido.nombre}.`
      );

    setCarrito((actual) =>
      yaEnCarrito
        ? actual.map((i) =>
            i.id_medicamento === idMedicamento ? { ...i, cantidad: cantidadTotal } : i
          )
        : [
            ...actual,
            {
              id_medicamento: medicamentoElegido.id_medicamento,
              nombre: medicamentoElegido.nombre,
              precio: medicamentoElegido.precio,
              cantidad: cant,
            },
          ]
    );

    setIdMedicamento('');
    setCantidad(1);
  };

  const quitar = (id) =>
    setCarrito((actual) => actual.filter((i) => i.id_medicamento !== id));

  const cobrar = async () => {
    setError('');
    if (!idCliente) return setError('Seleccioná el cliente de la venta.');
    if (carrito.length === 0) return setError('Agregá al menos un medicamento al detalle.');

    const ok = await onRegistrar({
      id_cliente: idCliente,
      productos: carrito.map(({ id_medicamento, cantidad, precio }) => ({
        id_medicamento,
        cantidad,
        precio,
      })),
    });

    if (ok) {
      setCarrito([]);
      setIdCliente('');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Tarjeta
        titulo="Nueva venta"
        descripcion="Elegí el cliente y agregá los medicamentos al detalle."
        className="lg:col-span-2"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Cliente">
            <select
              className={claseInput}
              value={idCliente}
              onChange={(e) => setIdCliente(e.target.value)}
            >
              <option value="">Seleccionar cliente…</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre} — NIT {c.nit}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Medicamento">
            <select
              className={claseInput}
              value={idMedicamento}
              onChange={(e) => setIdMedicamento(e.target.value)}
            >
              <option value="">Seleccionar medicamento…</option>
              {medicamentos.map((m) => (
                <option
                  key={m.id_medicamento}
                  value={m.id_medicamento}
                  disabled={m.stock_actual <= 0}
                >
                  {m.nombre} — {quetzales(m.precio)}
                  {m.stock_actual <= 0 ? ' (sin stock)' : ''}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Cantidad">
            <input
              type="number"
              min="1"
              className={claseInput}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </Campo>

          <div className="flex items-end gap-3">
            <Boton onClick={agregar} className="w-full sm:w-auto">
              Agregar al detalle
            </Boton>
            {medicamentoElegido && (
              <Badge tono={estadoStock(medicamentoElegido.stock_actual).tono}>
                {estadoStock(medicamentoElegido.stock_actual).texto}
              </Badge>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4">
            <Aviso tono="rojo" onCerrar={() => setError('')}>
              {error}
            </Aviso>
          </div>
        )}

        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 font-medium">Medicamento</th>
                <th className="px-4 py-3 font-medium text-right">Precio</th>
                <th className="px-4 py-3 font-medium text-right">Cantidad</th>
                <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {carrito.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-gray-500">
                    El detalle está vacío. Agregá el primer medicamento para empezar.
                  </td>
                </tr>
              ) : (
                carrito.map((item) => (
                  <tr
                    key={item.id_medicamento}
                    className="border-b border-gray-200 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3 text-gray-800">{item.nombre}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {quetzales(item.precio)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{item.cantidad}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {quetzales(item.precio * item.cantidad)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => quitar(item.id_medicamento)}
                        className="text-xs font-medium text-red-700 hover:underline"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Tarjeta>

      <Tarjeta titulo="Resumen" descripcion="Revisá antes de cobrar.">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Productos</dt>
            <dd className="text-gray-800">{carrito.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Unidades</dt>
            <dd className="text-gray-800">
              {carrito.reduce((a, i) => a + i.cantidad, 0)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-3">
            <dt className="text-gray-800 font-medium">Total</dt>
            <dd className="text-2xl font-semibold text-gray-800">{quetzales(total)}</dd>
          </div>
        </dl>

        <Boton
          onClick={cobrar}
          disabled={guardando || carrito.length === 0}
          className="mt-5 w-full"
        >
          {guardando ? 'Registrando…' : 'Registrar venta'}
        </Boton>

        <p className="mt-3 text-xs text-gray-500">
          Al registrar, Ventas descuenta el stock llamando a Inventario según el contrato.
        </p>
      </Tarjeta>
    </div>
  );
}
