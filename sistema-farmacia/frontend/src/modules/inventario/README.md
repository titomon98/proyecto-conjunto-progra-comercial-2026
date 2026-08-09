# Módulo de inventario

Pantalla React autocontenida para consultar, buscar, filtrar, crear, editar y eliminar registros de inventario.

## Integración

Importar el punto público del módulo desde el router o desde `App.jsx`:

```jsx
import { InventarioPage } from './modules/inventario';

export default function App() {
  return <InventarioPage />;
}
```

Durante una demostración sin backend se puede usar:

```jsx
<InventarioPage usarDatosDemo />
```

El servicio consume `VITE_API_URL` (por defecto `http://localhost:3000/api`) y usa `GET/POST /inventario` y `GET/PUT/DELETE /inventario/:id`.

Los cuerpos de creación y actualización contienen exclusivamente:

```json
{
  "id_medicamento": "UUID de un medicamento existente",
  "stock_actual": 100
}
```

La etiqueta **Stock bajo** se calcula en el frontend cuando quedan entre 1 y 20 unidades, ya que la tabla actual no incluye un campo `stock_minimo`.
