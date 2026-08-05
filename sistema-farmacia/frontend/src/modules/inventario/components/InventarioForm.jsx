import { useEffect, useState } from "react";

const VACIO = { id_inventario: null, id_medicamento: "", stock_actual: "", stock_minimo: "" };

export default function InventarioForm({ medicamentos, registroEditando, onGuardar, onCancelar }) {
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm(
      registroEditando
        ? {
            id_inventario: registroEditando.id_inventario,
            id_medicamento: registroEditando.id_medicamento,
            stock_actual: registroEditando.stock_actual,
            stock_minimo: registroEditando.stock_minimo,
          }
        : VACIO
    );
    setError(null);
  }, [registroEditando]);

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    if (!form.id_medicamento || form.stock_actual === "" || form.stock_minimo === "") {
      setError("Completa medicamento, stock actual y stock mínimo.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(form);
      setForm(VACIO);
    } catch (err) {
      setError(err.message ?? "No se pudo guardar el registro");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800">
        {form.id_inventario ? "Editar registro de inventario" : "Nuevo registro de inventario"}
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm text-gray-600">Medicamento</label>
          <select
            value={form.id_medicamento}
            onChange={(e) => actualizarCampo("id_medicamento", e.target.value)}
            disabled={Boolean(form.id_inventario)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">Selecciona un medicamento</option>
            {medicamentos.map((m) => (
              <option key={m.id_medicamento} value={m.id_medicamento}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Stock actual</label>
          <input
            type="number"
            min="0"
            value={form.stock_actual}
            onChange={(e) => actualizarCampo("stock_actual", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Stock mínimo</label>
          <input
            type="number"
            min="0"
            value={form.stock_minimo}
            onChange={(e) => actualizarCampo("stock_minimo", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-800"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        {form.id_inventario && (
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
}
