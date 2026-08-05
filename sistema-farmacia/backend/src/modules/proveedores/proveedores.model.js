/**
 * proveedores.model.js — CAPA DE ACCESO A DATOS
 * ---------------------------------------------------------------------------
 * Dueño: Marco Bolaños (Integrante A)
 *
 * ESTADO ACTUAL: implementación EN MEMORIA.
 * La base en Supabase la administra otro equipo y aún no tenemos el esquema
 * definitivo. Para no bloquear al equipo, este model implementa las firmas
 * acordadas contra un arreglo en memoria.
 *
 * 🔁 AL MIGRAR A SUPABASE solo cambia el INTERIOR de estas funciones.
 *    Las firmas y la forma de los datos NO cambian, así que el service,
 *    el controller y las rutas NO se tocan. Buscar el marcador "SWAP".
 *
 * REGLAS DE ESTA CAPA (README del repo):
 *   - Flujo: routes → controller → service → model. Es la última capa.
 *   - NO valida entradas (eso es del validator).
 *   - NO aplica reglas de negocio (eso es del service).
 *   - NO conoce Express: nada de req ni res acá.
 *   - Devuelve datos crudos o null. Nunca lanza errores HTTP.
 *
 * ESQUEMA: el CONTRATO.md solo garantiza id_proveedor, nombre y contacto.
 * Las demás columnas son OPCIONALES: si el equipo de BD no las incluye,
 * el código sigue funcionando y esos campos vienen en null.
 */

const { randomUUID } = require('node:crypto');
// Nativo de Node. No agrega dependencias a package.json, que es compartido.

// ---------------------------------------------------------------------------
// SWAP #1 — Al migrar, borrar este bloque y poner:
//   const { supabase } = require('../../config/supabase');
//   const TABLA = 'proveedores';
// ---------------------------------------------------------------------------

/** @type {object[]} Almacén temporal. Se pierde al reiniciar el servidor. */
const _almacen = [
  {
    id_proveedor: '11111111-1111-4111-8111-111111111111',
    nombre: 'Droguería Central',
    contacto: 'Ana Morales',
    telefono: '2222-1111',
    email: 'ventas@drogueriacentral.gt',
    direccion: 'Zona 1, Ciudad de Guatemala',
    activo: true,
    creado_en: new Date('2026-01-15T10:00:00Z').toISOString(),
    actualizado_en: null,
  },
  {
    id_proveedor: '22222222-2222-4222-8222-222222222222',
    nombre: 'Farmacéutica del Sur',
    contacto: 'Luis Pérez',
    telefono: '2222-2222',
    email: 'contacto@farmasur.gt',
    direccion: 'Zona 12, Ciudad de Guatemala',
    activo: true,
    creado_en: new Date('2026-01-20T14:30:00Z').toISOString(),
    actualizado_en: null,
  },
  {
    id_proveedor: '33333333-3333-4333-8333-333333333333',
    nombre: 'Distribuidora MedGT',
    contacto: 'Carla Ruiz',
    telefono: '2222-3333',
    email: 'info@medgt.com',
    direccion: 'Mixco, Guatemala',
    activo: false, // Inactivo a propósito: sirve para probar el filtro y el
                   // borrado lógico sin tener que desactivar uno primero.
    creado_en: new Date('2026-01-05T08:00:00Z').toISOString(),
    actualizado_en: new Date('2026-02-01T09:15:00Z').toISOString(),
  },
];

/** Copia defensiva: que nadie mute el almacén por referencia desde afuera. */
const _clonar = (registro) => (registro ? { ...registro } : null);

// ---------------------------------------------------------------------------
// API DEL MODEL — firmas congeladas, acordadas con el equipo
// ---------------------------------------------------------------------------

/**
 * Inserta un proveedor.
 * @param {object} datos - Ya validados y normalizados por capas superiores.
 * @returns {Promise<object>} El proveedor creado, con su id generado.
 */
async function crear(datos) {
  // SWAP #2:
  //   const { data, error } = await supabase
  //     .from(TABLA).insert([datos]).select().single();
  //   if (error) throw error;
  //   return data;

  const nuevo = {
    id_proveedor: randomUUID(),
    nombre: datos.nombre,
    contacto: datos.contacto ?? null,
    telefono: datos.telefono ?? null,
    email: datos.email ?? null,
    direccion: datos.direccion ?? null,
    activo: true,
    creado_en: new Date().toISOString(),
    actualizado_en: null,
  };

  _almacen.push(nuevo);
  return _clonar(nuevo);
}

/**
 * Lista proveedores con paginación, búsqueda y filtro por estado.
 * @param {object} [opciones]
 * @param {number} [opciones.pagina=1]
 * @param {number} [opciones.limite=10]
 * @param {string} [opciones.busqueda] - Texto libre sobre nombre y contacto.
 * @param {boolean|null} [opciones.activo=true] - null trae activos e inactivos.
 * @returns {Promise<{ datos: object[], total: number }>}
 *   total = filas que cumplen el filtro, NO las de la página. El service lo
 *   necesita para calcular el número de páginas.
 */
async function obtenerTodos({ pagina = 1, limite = 10, busqueda, activo = true } = {}) {
  // SWAP #3:
  //   let consulta = supabase.from(TABLA).select('*', { count: 'exact' });
  //   if (activo !== null && activo !== undefined) consulta = consulta.eq('activo', activo);
  //   if (busqueda) {
  //     const t = busqueda.replace(/[%_]/g, '\\$&');
  //     consulta = consulta.or(`nombre.ilike.%${t}%,contacto.ilike.%${t}%`);
  //   }
  //   const desde = (pagina - 1) * limite;
  //   const { data, error, count } = await consulta
  //     .order('nombre', { ascending: true })
  //     .range(desde, desde + limite - 1);
  //   if (error) throw error;
  //   return { datos: data ?? [], total: count ?? 0 };

  let filtrados = [..._almacen];

  if (activo !== null && activo !== undefined) {
    filtrados = filtrados.filter((p) => p.activo === activo);
  }

  if (busqueda) {
    const termino = busqueda.toLowerCase();
    filtrados = filtrados.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(termino) ||
        p.contacto?.toLowerCase().includes(termino)
    );
  }

  // Mismo orden que tendrá la consulta real, para que el frontend no note
  // cambios de comportamiento al migrar.
  filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const total = filtrados.length;
  const desde = (pagina - 1) * limite;
  const datos = filtrados.slice(desde, desde + limite).map(_clonar);

  return { datos, total };
}

/**
 * Busca un proveedor por su llave primaria.
 * @param {string} id_proveedor - UUID.
 * @returns {Promise<object|null>} null si no existe. No existir no es un error.
 */
async function obtenerPorId(id_proveedor) {
  // SWAP #4:
  //   const { data, error } = await supabase
  //     .from(TABLA).select('*').eq('id_proveedor', id_proveedor).maybeSingle();
  //   if (error) throw error;
  //   return data;

  const encontrado = _almacen.find((p) => p.id_proveedor === id_proveedor);
  return _clonar(encontrado);
}

/**
 * Actualiza campos de un proveedor.
 * @param {string} id_proveedor - UUID.
 * @param {object} datos - Solo los campos a modificar.
 * @returns {Promise<object|null>} null si el id no existe.
 */
async function actualizar(id_proveedor, datos) {
  // SWAP #5:
  //   const { data, error } = await supabase
  //     .from(TABLA).update(datos).eq('id_proveedor', id_proveedor)
  //     .select().maybeSingle();
  //   if (error) throw error;
  //   return data;

  const indice = _almacen.findIndex((p) => p.id_proveedor === id_proveedor);
  if (indice === -1) return null;

  // Blindaje: nadie reescribe la PK ni las marcas de tiempo desde afuera.
  const { id_proveedor: _pk, creado_en: _c, actualizado_en: _a, ...cambios } = datos;

  _almacen[indice] = {
    ..._almacen[indice],
    ...cambios,
    actualizado_en: new Date().toISOString(),
  };

  return _clonar(_almacen[indice]);
}

/**
 * Borrado LÓGICO. Nunca físico.
 * Medicamentos tendrá una FK id_proveedor hacia esta tabla: un DELETE real
 * rompería su módulo y viola el CONTRATO.md.
 * @param {string} id_proveedor - UUID.
 * @returns {Promise<boolean>} true si desactivó, false si el id no existe.
 */
async function desactivar(id_proveedor) {
  // SWAP #6:
  //   const { data, error } = await supabase
  //     .from(TABLA).update({ activo: false }).eq('id_proveedor', id_proveedor)
  //     .select('id_proveedor').maybeSingle();
  //   if (error) throw error;
  //   return data !== null;

  const registro = _almacen.find((p) => p.id_proveedor === id_proveedor);
  if (!registro) return false;

  registro.activo = false;
  registro.actualizado_en = new Date().toISOString();
  return true;
}

/**
 * Verifica si ya existe un proveedor ACTIVO con ese nombre.
 * Comparación insensible a mayúsculas.
 * @param {string} nombre
 * @param {string|null} [idExcluir] - UUID a ignorar. Al actualizar, el service
 *   pasa el id del propio registro para que no choque consigo mismo.
 * @returns {Promise<boolean>}
 */
async function existePorNombre(nombre, idExcluir = null) {
  // SWAP #7:
  //   let consulta = supabase.from(TABLA).select('id_proveedor')
  //     .ilike('nombre', nombre).eq('activo', true);
  //   if (idExcluir) consulta = consulta.neq('id_proveedor', idExcluir);
  //   const { data, error } = await consulta.limit(1);
  //   if (error) throw error;
  //   return (data?.length ?? 0) > 0;

  return _almacen.some(
    (p) =>
      p.activo &&
      p.nombre.toLowerCase() === String(nombre).toLowerCase() &&
      p.id_proveedor !== idExcluir
  );
}

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  desactivar,
  existePorNombre,
};