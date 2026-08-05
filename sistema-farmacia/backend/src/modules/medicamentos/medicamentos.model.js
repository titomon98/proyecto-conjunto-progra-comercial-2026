const { supabase } = require('../../config/supabase')

const TABLA = 'medicamentos'

const findAll = async () => {
  const { data, error } = await supabase.from(TABLA).select('*')
  if (error) throw error
  return data
}

const findById = async id => {
  const { data, error } = await supabase.from(TABLA).select('*').eq('id_medicamento', id).single()
  if (error) throw error
  return data
}

const insert = async datos => {
  const { data, error } = await supabase.from(TABLA).insert(datos).select().single()
  if (error) throw error
  return data
}

const update = async (id, datos) => {
  const { data, error } = await supabase
    .from(TABLA)
    .update(datos)
    .eq('id_medicamento', id)
    .select()
    .single()
  if (error) throw error
  return data
}

const remove = async id => {
  const { error } = await supabase.from(TABLA).delete().eq('id_medicamento', id)
  if (error) throw error
  return true
}

module.exports = { TABLA, findAll, findById, insert, update, remove }
