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
    }
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

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
      <h3>{medicamentoEditar ? 'Editar Medicamento' : 'Nuevo Medicamento'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem', maxWidth: '400px' }}>
        <div>
          <label>Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.4rem' }}
          />
        </div>

        <div>
          <label>Descripción</label>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.4rem' }}
          />
        </div>

        <div>
          <label>Precio (Q) *</label>
          <input
            type="number"
            step="0.01"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.4rem' }}
          />
        </div>

        <div>
          <label>ID Proveedor (UUID) *</label>
          <input
            type="text"
            name="id_proveedor"
            value={formData.id_proveedor}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Guardar
          </button>
          <button type="button" onClick={onCancelar} style={{ backgroundColor: '#6b7280', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}