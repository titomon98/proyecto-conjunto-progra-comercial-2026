// frontend/src/modules/proveedores/index.js
// Punto de entrada publico del modulo proveedores en el frontend.
// El resto del sistema (App.jsx, Medicamentos, etc.) solo importa desde aqui.

export { default as ProveedoresPage } from './ProveedoresPage.jsx';
export { listarProveedores, obtenerProveedor } from './proveedores.api.js';
