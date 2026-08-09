import { useEffect, useMemo, useState } from 'react';
import { inventarioService } from './inventario.service.js';

const demo = [
  { id_inventario: 'f1111111-1111-1111-1111-111111111111', id_medicamento: 'd1111111-1111-1111-1111-111111111111', stock_actual: 150, created_at: '2026-08-05T18:03:08.899644+00:00' },
  { id_inventario: 'f2222222-2222-2222-2222-222222222222', id_medicamento: 'd2222222-2222-2222-2222-222222222222', stock_actual: 18, created_at: '2026-08-05T18:03:08.899644+00:00' },
  { id_inventario: 'f3333333-3333-3333-3333-333333333333', id_medicamento: 'd3333333-3333-3333-3333-333333333333', stock_actual: 0, created_at: '2026-08-05T18:03:08.899644+00:00' },
];

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    box: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    alert: <><path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/></>,
    close: <path d="M18 6 6 18M6 6l12 12"/>,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function estado(registro) {
  if (Number(registro.stock_actual) === 0) return { texto: 'Sin stock', clase: 'bg-red-100 text-red-700', punto: 'bg-red-500' };
  if (Number(registro.stock_actual) <= 20) return { texto: 'Stock bajo', clase: 'bg-amber-100 text-amber-700', punto: 'bg-amber-500' };
  return { texto: 'Óptimo', clase: 'bg-green-100 text-green-700', punto: 'bg-green-500' };
}

function Resumen({ registros }) {
  const items = [
    { label: 'Productos registrados', value: registros.length, icon: 'box', tone: 'bg-blue-50 text-blue-600' },
    { label: 'Unidades disponibles', value: registros.reduce((total, item) => total + Number(item.stock_actual), 0), icon: 'check', tone: 'bg-green-50 text-green-600' },
    { label: 'Stock bajo (≤ 20)', value: registros.filter((item) => Number(item.stock_actual) > 0 && Number(item.stock_actual) <= 20).length, icon: 'alert', tone: 'bg-amber-50 text-amber-600' },
    { label: 'Sin existencias', value: registros.filter((item) => Number(item.stock_actual) === 0).length, icon: 'alert', tone: 'bg-red-50 text-red-600' },
  ];
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen del inventario">{items.map((item) => <article key={item.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-500">{item.label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-gray-800">{item.value.toLocaleString('es-GT')}</p></div><span className={`rounded-xl p-3 ${item.tone}`}><Icon name={item.icon}/></span></div></article>)}</section>;
}

function Formulario({ registro, onClose, onSave, saving }) {
  const [form, setForm] = useState(registro ?? { id_medicamento: '', stock_actual: 0 });
  const [error, setError] = useState('');
  const change = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.id_medicamento.trim()) return setError('El ID del medicamento es obligatorio.');
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(form.id_medicamento)) return setError('Ingresa un UUID válido para el medicamento.');
    if (form.stock_actual === '' || Number(form.stock_actual) < 0) return setError('El stock es obligatorio y no puede ser negativo.');
    onSave({ id_medicamento: form.id_medicamento.trim(), stock_actual: Number(form.stock_actual) });
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4" role="dialog" aria-modal="true" aria-labelledby="form-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form onSubmit={submit} className="w-full max-w-lg rounded-xl bg-white shadow-xl"><header className="flex items-center justify-between border-b border-gray-200 px-6 py-5"><div><h2 id="form-title" className="text-xl font-semibold text-gray-800">{registro ? 'Editar existencias' : 'Nuevo registro'}</h2><p className="mt-1 text-sm text-gray-500">{registro ? 'Modifica el medicamento o sus existencias.' : 'Asocia un medicamento existente con su stock.'}</p></div><button type="button" onClick={onClose} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Cerrar"><Icon name="close"/></button></header><div className="space-y-4 p-6"><label className="block text-sm font-medium text-gray-700">ID del medicamento<input name="id_medicamento" value={form.id_medicamento} onChange={change} placeholder="d1111111-1111-1111-1111-111111111111" className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5 font-mono text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/><span className="mt-1 block text-xs font-normal text-gray-500">Debe ser el UUID de un medicamento que ya exista.</span></label><label className="block text-sm font-medium text-gray-700">Stock actual<input type="number" min="0" step="1" required name="stock_actual" value={form.stock_actual} onChange={change} className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/></label>{error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}</div><footer className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4"><button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">Cancelar</button><button disabled={saving} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar registro'}</button></footer></form></div>;
}

export default function InventarioPage({ usarDatosDemo = false }) {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [editando, setEditando] = useState(undefined);
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modoLocal] = useState(usarDatosDemo);

  useEffect(() => {
    let activo = true;
    (usarDatosDemo ? Promise.resolve(demo) : inventarioService.listar()).then((data) => activo && setRegistros(Array.isArray(data) ? data : data.data ?? [])).catch((error) => { if (activo) { setMensaje(`${error.message} Verifica que el backend esté encendido y permita solicitudes desde Vite.`); setRegistros([]); } }).finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, [usarDatosDemo]);

  const visibles = useMemo(() => registros.filter((item) => {
    const coincide = `${item.id_inventario} ${item.id_medicamento}`.toLowerCase().includes(busqueda.toLowerCase());
    const tipo = estado(item).texto;
    return coincide && (filtro === 'todos' || tipo === filtro);
  }), [registros, busqueda, filtro]);

  const abrir = (registro) => { setEditando(registro); setModal(true); };
  const guardar = async (form) => {
    setGuardando(true); setMensaje('');
    try {
      if (modoLocal) {
        const nuevo = editando ? { ...editando, ...form } : { ...form, id_inventario: crypto.randomUUID() };
        setRegistros((items) => editando ? items.map((item) => item.id_inventario === editando.id_inventario ? nuevo : item) : [nuevo, ...items]);
      } else {
        const result = editando ? await inventarioService.actualizar(editando.id_inventario, form) : await inventarioService.crear(form);
        const saved = result.data ?? result;
        setRegistros((items) => editando ? items.map((item) => item.id_inventario === editando.id_inventario ? saved : item) : [saved, ...items]);
      }
      setModal(false); setMensaje('Registro guardado correctamente.');
    } catch (error) { setMensaje(error.message); } finally { setGuardando(false); }
  };
  const eliminar = async (registro) => {
    if (!window.confirm(`¿Eliminar el inventario ${registro.id_inventario}?`)) return;
    try { if (!modoLocal) await inventarioService.eliminar(registro.id_inventario); setRegistros((items) => items.filter((item) => item.id_inventario !== registro.id_inventario)); setMensaje('Registro eliminado.'); } catch (error) { setMensaje(error.message); }
  };

  return <main className="min-h-screen bg-slate-50 px-4 py-8 font-sans text-gray-800 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-sm font-semibold uppercase tracking-wider text-blue-600">Sistema de farmacia</p><h1 className="text-3xl font-bold tracking-tight">Control de inventario</h1><p className="mt-2 text-gray-500">Consulta existencias y detecta productos que necesitan reposición.</p></div><button onClick={() => abrir(undefined)} className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"><Icon name="plus"/>Nuevo registro</button></header><Resumen registros={registros}/>{mensaje && <div className={`mt-5 rounded-lg border px-4 py-3 text-sm ${mensaje.includes('correctamente') ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{mensaje}</div>}<section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-gray-200 p-4 md:flex-row md:items-center md:justify-between"><div className="relative w-full md:max-w-sm"><Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/><input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por UUID…" className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/></div><select value={filtro} onChange={(event) => setFiltro(event.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"><option value="todos">Todos los estados</option><option value="Óptimo">Óptimo</option><option value="Stock bajo">Stock bajo</option><option value="Sin stock">Sin stock</option></select></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-6 py-3 font-semibold">Medicamento</th><th className="px-6 py-3 font-semibold">Existencias</th><th className="px-6 py-3 font-semibold">Fecha de registro</th><th className="px-6 py-3 font-semibold">Estado</th><th className="px-6 py-3 text-right font-semibold">Acciones</th></tr></thead><tbody className="divide-y divide-gray-100">{cargando ? <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">Cargando inventario…</td></tr> : visibles.length === 0 ? <tr><td colSpan="5" className="px-6 py-12 text-center"><Icon name="box" className="mx-auto h-8 w-8 text-gray-300"/><p className="mt-2 font-medium text-gray-600">No se encontraron registros</p><p className="text-gray-400">Prueba con otra búsqueda o agrega un producto.</p></td></tr> : visibles.map((item) => { const status = estado(item); return <tr key={item.id_inventario} className="transition-colors hover:bg-gray-50/50"><td className="px-6 py-4"><p className="font-mono text-sm font-semibold text-gray-800">{item.id_medicamento}</p><p className="mt-0.5 font-mono text-xs text-gray-400">Inventario: {item.id_inventario}</p></td><td className="px-6 py-4"><span className="text-lg font-bold text-gray-800">{item.stock_actual}</span> <span className="text-gray-400">unid.</span></td><td className="px-6 py-4 text-gray-600">{item.created_at ? new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(new Date(item.created_at)) : '—'}</td><td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.clase}`}><span className={`h-1.5 w-1.5 rounded-full ${status.punto}`}/>{status.texto}</span></td><td className="px-6 py-4"><div className="flex justify-end gap-1"><button onClick={() => abrir(item)} className="rounded-md p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600" aria-label={`Editar inventario ${item.id_inventario}`}><Icon name="edit" className="h-4 w-4"/></button><button onClick={() => eliminar(item)} className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label={`Eliminar inventario ${item.id_inventario}`}><Icon name="trash" className="h-4 w-4"/></button></div></td></tr>; })}</tbody></table></div><footer className="border-t border-gray-200 px-6 py-3 text-sm text-gray-500">Mostrando <span className="font-medium text-gray-700">{visibles.length}</span> de {registros.length} registros</footer></section></div>{modal && <Formulario registro={editando} onClose={() => setModal(false)} onSave={guardar} saving={guardando}/>}</main>;
}
