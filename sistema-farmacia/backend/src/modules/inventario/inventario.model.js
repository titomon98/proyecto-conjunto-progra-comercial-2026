const supabase = require("../../config/supabase");

const obtenerTodos = async () => {
  const { data, error } = await supabase
    .from("inventario")
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const obtenerPorId = async (id) => {
  const { data, error } = await supabase
    .from("inventario")
    .select("*")
    .eq("id_inventario", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return data;
};

// Busca la fila de inventario de un medicamento. Ventas la necesita para
// descontar stock, porque solo conoce el id_medicamento, no el id_inventario.
const obtenerPorMedicamento = async (idMedicamento) => {
  const { data, error } = await supabase
    .from("inventario")
    .select("*")
    .eq("id_medicamento", idMedicamento)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return data;
};

const crear = async (datos) => {
  const { data, error } = await supabase
    .from("inventario")
    .insert([datos])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const actualizar = async (id, datos) => {
  const { data, error } = await supabase
    .from("inventario")
    .update(datos)
    .eq("id_inventario", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return data;
};

const eliminar = async (id) => {
  const { data, error } = await supabase
    .from("inventario")
    .delete()
    .eq("id_inventario", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  obtenerPorMedicamento,
  crear,
  actualizar,
  eliminar,
};