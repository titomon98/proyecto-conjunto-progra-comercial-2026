# Sistema de Farmacia

Proyecto grupal de Programación Comercial. Sistema de gestión para una farmacia,
desarrollado por **7 equipos trabajando en paralelo**, cada uno dueño de un módulo.

Este repositorio contiene por ahora **solo el esqueleto**: carpetas, archivos base y
comentarios que indican la responsabilidad de cada capa. Todavía no hay lógica de negocio.

## Stack

| Capa      | Tecnología                          |
|-----------|-------------------------------------|
| Backend   | Node.js + Express (modular)         |
| Base de datos | PostgreSQL en Supabase          |
| Frontend  | React + Vite + Tailwind CSS         |

## Módulos y equipos

Los 7 módulos existen con el **mismo nombre** en backend y frontend:

| Módulo        | Carpeta backend                        | Carpeta frontend                     |
|---------------|----------------------------------------|--------------------------------------|
| usuarios      | `backend/src/modules/usuarios/`        | `frontend/src/modules/usuarios/`     |
| clientes      | `backend/src/modules/clientes/`        | `frontend/src/modules/clientes/`     |
| proveedores   | `backend/src/modules/proveedores/`     | `frontend/src/modules/proveedores/`  |
| medicamentos  | `backend/src/modules/medicamentos/`    | `frontend/src/modules/medicamentos/` |
| inventario    | `backend/src/modules/inventario/`      | `frontend/src/modules/inventario/`   |
| ventas        | `backend/src/modules/ventas/`          | `frontend/src/modules/ventas/`       |
| reportes      | `backend/src/modules/reportes/`        | `frontend/src/modules/reportes/`     |

## Cómo se ubica cada equipo

1. **Trabaja solo dentro de tu carpeta de módulo**, en backend y en frontend.
   No edites las carpetas de otros equipos: así se evitan conflictos al hacer merge.
2. Los archivos compartidos (`backend/src/app.js`, `frontend/src/App.jsx`,
   `backend/src/config/`, `backend/src/middlewares/`, `package.json`) se tocan
   **solo previo acuerdo del grupo**, porque los modifican todos.
3. Si tu módulo necesita algo de otro módulo, **pídelo por su `index.js`**.
   Nunca importes directamente el `service` o el `model` ajeno.
4. Trabaja en una rama por módulo (por ejemplo `feature/ventas-crud`) y abre Pull Request.

## Arquitectura del backend

Cada módulo sigue el flujo `routes → controller → service → model`:

```
<modulo>.routes.js       Define los endpoints HTTP y los conecta al controller.
<modulo>.controller.js   Lee req, valida entrada, llama al service, responde con res.
<modulo>.service.js      Lógica de negocio. No conoce Express.
<modulo>.model.js        Acceso a datos (Supabase / PostgreSQL).
index.js                 Único punto público del módulo hacia los demás.
```

Regla: cada capa solo llama a la siguiente. El controller nunca habla con el model.

## Estructura

```
sistema-farmacia/
├── backend/
│   ├── src/
│   │   ├── modules/<modulo>/     rutas, controller, service, model, index
│   │   ├── config/supabase.js    cliente de Supabase (placeholder)
│   │   ├── middlewares/          auth.middleware.js
│   │   └── app.js                arranque de Express
│   ├── database/migrations/      scripts SQL del esquema
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── modules/<modulo>/     pantallas y componentes de cada equipo
│   │   ├── components/           componentes compartidos
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

## Puesta en marcha

Las dependencias están **listadas pero no instaladas**. Cada quien las instala local:

```bash
# Backend
cd backend
npm install
cp .env.example .env      # y llenar las credenciales de Supabase
npm run dev               # http://localhost:3000

# Frontend
cd frontend
npm install
npm run dev               # http://localhost:5173
```

## Conexión a Supabase

`backend/src/config/supabase.js` ya crea el cliente real y lo exporta. Desde el
model de tu módulo se usa así:

```js
const supabase = require('../../config/supabase');
```

Para comprobar que tu entorno quedó bien configurado, levanta el backend y abre
`http://localhost:3000/api/health`. Debe responder:

```json
{ "ok": true, "supabase": "conectado", "tabla": "usuarios", "registros": 5 }
```

Si responde `503`, revisa que tu `backend/.env` tenga `SUPABASE_URL` y
`SUPABASE_ANON_KEY`. **El `.env` no está en el repositorio** (está en `.gitignore`):
pídele las credenciales al encargado del grupo y crea el tuyo a partir de `.env.example`.

> Nota: el proyecto corre sobre Node 20, que no trae `WebSocket` nativo. Por eso
> `supabase.js` le pasa el paquete `ws` como transporte de Realtime. Si migran a
> Node 22 o superior, esa opción se puede quitar.

## Pendientes del esqueleto

- Inicializar Tailwind en el frontend (`npx tailwindcss init -p` y crear `src/index.css`).
- Definir el esquema de la base y agregar las migraciones en `backend/database/migrations/`.
- Implementar la validación de token en `backend/src/middlewares/auth.middleware.js`.
