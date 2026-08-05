import { useCallback, useEffect, useState } from "react";
import {
  getInventario,
  getMedicamentosDisponibles,
  crearRegistroInventario,
  actualizarRegistroInventario,
} from "../services/inventario.service";

// Hook central del módulo: los componentes (tabla, formulario, dashboard)
// consumen este estado en vez de llamar al service directamente.
export function useInventario() {
  const [registros, setRegistros] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inventario, medicamentosDisponibles] = await Promise.all([
        getInventario(),
        getMedicamentosDisponibles(),
      ]);
      setRegistros(inventario);
      setMedicamentos(medicamentosDisponibles);
    } catch (err) {
      setError(err.message ?? "No se pudo cargar el inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardarRegistro = useCallback(
    async ({ id_inventario, id_medicamento, stock_actual, stock_minimo }) => {
      if (id_inventario) {
        const actualizado = await actualizarRegistroInventario(id_inventario, {
          id_medicamento,
          stock_actual: Number(stock_actual),
          stock_minimo: Number(stock_minimo),
        });
        setRegistros((prev) =>
          prev.map((r) => (r.id_inventario === id_inventario ? actualizado : r))
        );
        return actualizado;
      }
      const nuevo = await crearRegistroInventario({
        id_medicamento,
        stock_actual,
        stock_minimo,
      });
      setRegistros((prev) => [...prev, nuevo]);
      return nuevo;
    },
    []
  );

  return { registros, medicamentos, loading, error, recargar: cargar, guardarRegistro };
}
