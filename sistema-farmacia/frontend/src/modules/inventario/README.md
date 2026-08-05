# Módulo Inventario (frontend)

Scaffold funcional con datos mock, listo para conectar al backend cuando esté disponible.

## Cómo integrarlo

1. Copia esta carpeta completa dentro de tu repo, en:
   `frontend/src/modules/inventario/`
2. En `frontend/src/App.jsx`, importa y renderiza el módulo:

   ```jsx
   import InventarioModule from "./modules/inventario";

   function App() {
     return <InventarioModule />;
   }
   ```

   (Si el equipo ya tiene rutas/navegación general en `App.jsx`, coordina con el
   grupo antes de tocar ese archivo — es de los que requieren acuerdo previo
   según el README del proyecto.)
3. Corre `npm run dev` desde `frontend/` como de costumbre.

## Qué incluye

- `index.jsx` — punto de entrada del módulo, con 3 pestañas: Listado, Nuevo registro, Alertas.
- `components/InventarioTable.jsx` — tabla de stock por medicamento.
- `components/InventarioForm.jsx` — alta/edición de un registro de inventario.
- `components/AlertasStock.jsx` — dashboard de medicamentos en stock bajo o sin stock.
- `components/StockBadge.jsx` — badge de estado reutilizable (verde/ámbar/rojo).
- `hooks/useInventario.js` — estado del módulo, ya separado del acceso a datos.
- `services/inventario.service.js` — toda la lectura/escritura pasa por aquí.
- `data/inventario.mock.js` — datos de prueba.

## Cómo pasar de mock a backend real

Todo el estado pasa por `services/inventario.service.js`. El día que el backend
tenga listo `backend/src/modules/inventario/inventario.routes.js`, solo hay que
reemplazar el cuerpo de cada función en ese archivo por un `fetch()` real —
`hooks/useInventario.js` y los componentes no cambian:

```js
export async function getInventario() {
  const res = await fetch("/api/inventario");
  if (!res.ok) throw new Error("Error al cargar inventario");
  return res.json();
}
```

## Pendientes / decisiones a confirmar con el equipo

- El campo `stock_minimo` no está explícito en `CONTRATO.md` (el nombre del último
  campo de `inventario` quedó vacío). Confirmar que ese es el campo correcto antes
  de que el equipo de backend cree la migración SQL.
- `descontarStock(id_medicamento, cantidad)` está implementado del lado mock tal
  como lo pide el CONTRATO.md sección 4, para que Ventas ya lo pueda probar contra
  este módulo en desarrollo. La versión real vivirá en el backend.
