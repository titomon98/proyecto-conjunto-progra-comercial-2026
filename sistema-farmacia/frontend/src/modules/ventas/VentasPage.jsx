// frontend/src/modules/ventas/VentasPage.jsx
// Pantalla principal del modulo ventas. Maneja la carga de datos y el estado
// compartido entre "Nueva venta" e "Historial".

import { useCallback, useEffect, useState } from 'react';
import {
  obtenerVentas,
  registrarVenta,
  obtenerClientes,
  obtenerMedicamentosConStock,
} from './ventas.api.js';
import NuevaVenta from './components/NuevaVenta.jsx';
import HistorialVentas from './components/HistorialVentas.jsx';
import { Aviso } from './components/ui.jsx';

const PESTANAS = [
  { id: 'nueva', texto: 'Nueva venta' },
  { id: 'historial', texto: 'Historial' },
];

export default function VentasPage({ usuario }) {
  const [pestana, setPestana] = useState('nueva');
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
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

  const cargarCatalogos = useCallback(async () => {
    try {
      const [cli, med] = await Promise.all([
        obtenerClientes(),
        obtenerMedicamentosConStock(),
      ]);
      setClientes(Array.isArray(cli) ? cli : []);
      setMedicamentos(Array.isArray(med) ? med : []);
    } catch (e) {
      setAviso({
        tono: 'rojo',
        texto: `No se pudieron cargar clientes o medicamentos: ${e.message}`,
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      await cargarCatalogos();
      await cargarVentas();
    })();
  }, [cargarCatalogos, cargarVentas]);

  const handleRegistrar = async ({ id_cliente, productos }) => {
    if (!usuario?.id_usuario) {
      setAviso({
        tono: 'rojo',
        texto: 'No hay una sesión activa: volvé a iniciar sesión para registrar la venta.',
      });
      return false;
    }

    setGuardando(true);
    setAviso(null);
    try {
      await registrarVenta({
        id_cliente,
        id_usuario: usuario.id_usuario,
        productos,
      });
      setAviso({ tono: 'verde', texto: 'Venta registrada. El stock ya fue descontado.' });
      // El stock cambio: hay que releer catalogos y ventas.
      await Promise.all([cargarCatalogos(), cargarVentas()]);
      return true;
    } catch (e) {
      setAviso({ tono: 'rojo', texto: `No se registró la venta: ${e.message}` });
      return false;
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ventas</h1>
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
  );
}
