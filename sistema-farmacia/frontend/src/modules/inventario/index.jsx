import { useState } from "react";
import { useInventario } from "./hooks/useInventario";
import InventarioTable from "./components/InventarioTable";
import InventarioForm from "./components/InventarioForm";
import AlertasStock from "./components/AlertasStock";

const TABS = [
  { id: "listado", label: "Listado" },
  { id: "nuevo", label: "Nuevo registro" },
  { id: "alertas", label: "Alertas" },
];

// Este archivo es el único punto de entrada del módulo hacia App.jsx,
// siguiendo la misma regla del backend (CONTRATO.md sección 2): otros módulos
// del frontend no deben importar directamente los componentes internos de acá.
export default function InventarioModule() {
  const { registros, medicamentos, loading, error, guardarRegistro } = useInventario();
  const [tab, setTab] = useState("listado");
  const [registroEditando, setRegistroEditando] = useState(null);

  function editar(registro) {
    setRegistroEditando(registro);
    setTab("nuevo");
  }

  async function guardar(datos) {
    await guardarRegistro(datos);
    setRegistroEditando(null);
    setTab("listado");
  }

  const alertasActivas = registros.filter((r) => r.stock_actual <= r.stock_minimo).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-gray-800">Inventario</h1>
        <p className="mt-1 text-sm text-gray-500">
          Consulta el stock por medicamento, registra movimientos y revisa alertas.
        </p>

        <nav className="mt-6 flex gap-2 border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                if (t.id !== "nuevo") setRegistroEditando(null);
              }}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
              {t.id === "alertas" && alertasActivas > 0 && (
                <span className="ml-2 rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                  {alertasActivas}
                </span>
              )}
              {tab === t.id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-blue-600" />}
            </button>
          ))}
        </nav>

        {error && (
          <div className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-6">
          {tab === "listado" && (
            <InventarioTable registros={registros} loading={loading} onEditar={editar} />
          )}
          {tab === "nuevo" && (
            <InventarioForm
              medicamentos={medicamentos}
              registroEditando={registroEditando}
              onGuardar={guardar}
              onCancelar={() => {
                setRegistroEditando(null);
                setTab("listado");
              }}
            />
          )}
          {tab === "alertas" && <AlertasStock registros={registros} />}
        </div>
      </div>
    </div>
  );
}
