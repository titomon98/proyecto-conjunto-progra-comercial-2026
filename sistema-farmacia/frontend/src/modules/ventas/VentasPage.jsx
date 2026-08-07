// frontend/src/modules/ventas/VentasPage.jsx
// Pantalla principal del modulo ventas. Maneja la carga de datos y el estado
// compartido entre "Nueva venta" e "Historial".

import { useCallback, useEffect, useState } from 'react';
import {
  obtenerVentas,
  registrarVenta,
  obtenerClientes,
  obtenerMedicamentos,
} from './ventas.api.js';
import { CLIENTES_DEMO, MEDICAMENTOS_DEMO, ID_USUARIO_SESION } from './ventas.demo.js';
import NuevaVenta from './components/NuevaVenta.jsx';
import HistorialVentas from './components/HistorialVentas.jsx';
import { Aviso } from './components/ui.jsx';

const PESTANAS = [
  { id: 'nueva', texto: 'Nueva venta' },
  { id: 'historial', texto: 'Historial' },
];

export default function VentasPage() {
  const [pestana, setPestana] = useState('nueva');
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState(CLIENTES_DEMO);
  const [medicamentos, setMedicamentos] = useState(MEDICAMENTOS_DEMO);
  const [modoDemo, setModoDemo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const cargarVentas = useCallback(async () => {
    setCargando(true);
    try {
      const data = await obtenerVentas();
      setVentas(Array.isArray(data) ? data : []);
    } catch (e) {
      setAviso({ tono: 'rojo', texto: `No se pudieron cargar las ventas: ${e.message}` });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const [cli, med] = await Promise.all([obtenerClientes(), obtenerMedicamentos()]);
      if (cli?.length) setClientes(cli);
      if (med?.length) setMedicamentos(med);
      if (!cli?.length || !med?.length) setModoDemo(true);
      await cargarVentas();
    })();
  }, [cargarVentas]);

  const handleRegistrar = async ({ id_cliente, productos }) => {
    setGuardando(true);
    setAviso(null);
    try {
      await registrarVenta({
        id_cliente,
        id_usuario: ID_USUARIO_SESION,
        productos,
      });
      setAviso({ tono: 'verde', texto: 'Venta registrada. El stock ya fue descontado.' });
      await cargarVentas();
      return true;
    } catch (e) {
      setAviso({ tono: 'rojo', texto: `No se registró la venta: ${e.message}` });
      return false;
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Ventas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Registro de ventas y consulta del historial de la farmacia.
          </p>
        </header>

        <nav className="mb-6 flex gap-1 rounded-lg bg-white p-1 shadow-sm border border-gray-200 w-fit">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPestana(p.id)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                pestana === p.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.texto}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {modoDemo && (
            <Aviso tono="ambar">
              Clientes o Medicamentos aún no responden. La pantalla está usando catálogos
              de prueba; las ventas sí se envían al backend real.
            </Aviso>
          )}

          {aviso && (
            <Aviso tono={aviso.tono} onCerrar={() => setAviso(null)}>
              {aviso.texto}
            </Aviso>
          )}

          {pestana === 'nueva' ? (
            <NuevaVenta
              clientes={clientes}
              medicamentos={medicamentos}
              onRegistrar={handleRegistrar}
              guardando={guardando}
            />
          ) : (
            <HistorialVentas
              ventas={ventas}
              clientes={clientes}
              cargando={cargando}
              onRecargar={cargarVentas}
            />
          )}
        </div>
      </div>
    </div>
  );
}
