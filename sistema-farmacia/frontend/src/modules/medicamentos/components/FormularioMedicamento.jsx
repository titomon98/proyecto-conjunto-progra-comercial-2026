import React, { useState, useEffect } from 'react';

export function FormularioMedicamento({ medicamentoEditar, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    id_proveedor: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (medicamentoEditar) {
      setFormData({
        nombre: medicamentoEditar.nombre || '',
        descripcion: medicamentoEditar.descripcion || '',
        precio: medicamentoEditar.precio || '',
        id_proveedor: medicamentoEditar.id_proveedor || ''
      });
    } else {
      // Al pasar de "editar" a "nuevo" hay que limpiar, o el formulario se
      // queda con los datos del medicamento anterior.
      setFormData({ nombre: '', descripcion: '', precio: '', id_proveedor: '' });
    }
    setError('');
  }, [medicamentoEditar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre.trim() || !formData.precio || !formData.id_proveedor.trim()) {
      setError('El nombre, el precio y el ID de proveedor son obligatorios.');
      return;
    }

    if (parseFloat(formData.precio) <= 0) {
      setError('El precio debe ser mayor a 0.');
      return;
    }

    onGuardar({
      ...formData,
      precio: parseFloat(formData.precio)
    });
  };

  const claseInput =
    'w-full px-4 py-2.5 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="pb-4 border-b border-gray-100 mb-5">
        <h2 className="text-gray-800 text-xl font-semibold">
          {medicamentoEditar ? 'Editar Medicamento' : 'Nuevo Medicamento'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {medicamentoEditar
            ? 'Actualice la información del medicamento seleccionado.'
            : 'Complete los datos del medicamento que desea registrar.'}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Paracetamol 500mg"
              className={claseInput}
            />
          </div>

          <div>
            <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1.5">
              Precio (Q) <span className="text-red-500">*</span>
            </label>
            <input
              id="precio"
              type="number"
              step="0.01"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              placeholder="0.00"
              className={claseInput}
            />
          </div>
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1.5">
            Descripción
          </label>
          <input
            id="descripcion"
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Ej. Analgésico y antipirético"
            className={claseInput}
          />
        </div>

        <div>
          <label htmlFor="id_proveedor" className="block text-sm font-medium text-gray-700 mb-1.5">
            ID Proveedor (UUID) <span className="text-red-500">*</span>
          </label>
          <input
            id="id_proveedor"
            type="text"
            name="id_proveedor"
            value={formData.id_proveedor}
            onChange={handleChange}
            placeholder="00000000-0000-0000-0000-000000000000"
            className={`${claseInput} font-mono text-sm`}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
          <button
            type="button"
            onClick={onCancelar}
            className="bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
