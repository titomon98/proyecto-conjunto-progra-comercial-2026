# Módulo Proveedores

Módulo de gestión de proveedores del Sistema de Farmacia. Sigue el flujo obligatorio del repositorio: **`routes → controller → service → model`**.

---

## 1. Estructura

```
backend/src/modules/proveedores/
├── proveedores.routes.js       Definición de rutas + montaje de validadores
├── proveedores.controller.js   Traduce HTTP ⇄ service. No toca el model.
├── proveedores.service.js      Lógica de negocio. No conoce Express.
├── proveedores.model.js        Acceso a Supabase. No valida ni lanza errores HTTP.
├── proveedores.validator.js    Validación nativa por endpoint
├── proveedores.errors.js       Errores de dominio + manejador de errores del módulo
├── index.js                    ÚNICO punto público del módulo
└── README.md                   Este archivo
```

> El módulo **no** agrega archivos a `backend/src/middlewares/` ni dependencias a `backend/package.json`. Ambos son compartidos entre los 7 equipos. Toda la validación y el manejo de errores viven aquí adentro.

---

## 2. Endpoints

Base: `/api/proveedores`

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| POST | `/` | Crear proveedor | 201 · 400 · 409 |
| GET | `/` | Listar con paginación y búsqueda | 200 · 400 |
| GET | `/:id` | Obtener uno por UUID | 200 · 400 · 404 |
| PUT | `/:id` | Actualizar | 200 · 400 · 404 · 409 |
| DELETE | `/:id` | Desactivar (**borrado lógico**) | 200 · 400 · 404 |

### Query params de `GET /`

| Param | Tipo | Default | Reglas |
|---|---|---|---|
| `pagina` | entero | `1` | ≥ 1 |
| `limite` | entero | `10` | ≥ 1, **tope duro 100** |
| `busqueda` | texto | — | máx. 100 caracteres, se escapan `%` y `_` |
| `activo` | `true` / `false` / `todos` | `true` | Por defecto solo se listan activos |

---

## 3. Formato de respuesta estándar

Todo el módulo responde con esta forma. **Los 4 integrantes la respetan.**

**Éxito**
```json
{ "ok": true, "mensaje": "Proveedor creado correctamente", "datos": { } }
```

**Éxito con paginación**
```json
{
  "ok": true,
  "mensaje": "Proveedores obtenidos correctamente",
  "datos": [ ],
  "meta": { "total": 42, "pagina": 1, "limite": 10 }
}
```

**Error**
```json
{
  "ok": false,
  "mensaje": "No se pudo crear el proveedor: hay campos inválidos",
  "errores": [ { "campo": "email", "mensaje": "El formato del email no es válido" } ]
}
```

| Código | Cuándo |
|---|---|
| 200 | OK |
| 201 | Creado |
| 400 | Validación / petición mal formada |
| 404 | No encontrado |
| 409 | Duplicado o conflicto con otro módulo |
| 500 | Error interno (nunca expone stack traces ni detalles de Supabase) |

---

## 4. Reglas de validación

| Campo | Obligatorio | Reglas |
|---|---|---|
| `nombre` | Sí (en POST) | Texto, 2–150 caracteres, sanitizado |
| `contacto` | No | Texto, máx. 100 |
| `telefono` | No | 8–20 caracteres; dígitos, espacios, `-`, `()`, `+` inicial |
| `email` | No | Formato válido, máx. 150, se normaliza a minúsculas |
| `direccion` | No | Texto, máx. 500 |

- Cualquier campo fuera de esa lista (`activo`, `id_proveedor`, `creado_en`, …) se **rechaza con 400**.
- En `PUT` se exige **al menos un campo**; enviar `null` en un opcional lo limpia.
- `:id` debe ser un **UUID válido** o la petición se corta con 400 antes de tocar la base.

---

## 5. Uso de validadores y errores (para B y C)

**En `proveedores.routes.js` (Integrante B):**

```js
const express = require('express');
const controller = require('./proveedores.controller');
const validator = require('./proveedores.validator');
const { rutaNoEncontrada, manejadorErrores } = require('./proveedores.errors');

const router = express.Router();

router.post('/',       validator.validarCrear,                                controller.crear);
router.get('/',        validator.validarListar,                               controller.listar);
router.get('/:id',     validator.validarIdParam,                              controller.obtener);
router.put('/:id',     validator.validarIdParam, validator.validarActualizar, controller.actualizar);
router.delete('/:id',  validator.validarIdParam,                              controller.desactivar);

// Siempre al final, en este orden:
router.use(rutaNoEncontrada);
router.use(manejadorErrores);

module.exports = router;
```

**Dónde quedan los datos ya validados:**

| Middleware | Deja el resultado en |
|---|---|
| `validarCrear` / `validarActualizar` | `req.datosValidados` |
| `validarListar` | `req.consultaValidada` |
| `validarIdParam` | `req.idValidado` |

> No se escribe sobre `req.query` porque en Express 5 es de solo lectura.

**En el controller (Integrante B):**

```js
const { exito, creado, envolver } = require('./proveedores.errors');
const service = require('./proveedores.service');

exports.crear = envolver(async (req, res) => {
  const proveedor = await service.crearProveedor(req.datosValidados);
  return creado(res, { mensaje: 'Proveedor creado correctamente', datos: proveedor });
});

exports.listar = envolver(async (req, res) => {
  const { datos, total, pagina, limite } = await service.listarProveedores(req.consultaValidada);
  return exito(res, {
    mensaje: 'Proveedores obtenidos correctamente',
    datos,
    meta: { total, pagina, limite },
  });
});
```

`envolver()` reemplaza el `try/catch`: cualquier rechazo llega solo a `manejadorErrores`.

**En el service (Integrante C):**

```js
const { NotFoundError, ConflictError } = require('./proveedores.errors');

if (!proveedor) throw new NotFoundError('El proveedor no existe');
if (await model.existePorNombre(dto.nombre)) {
  throw new ConflictError('Ya existe un proveedor activo con ese nombre');
}
```

El service **nunca** toca `res` ni códigos HTTP: lanza el error de dominio y `proveedores.errors.js` lo traduce.

---

## 6. Cómo consumir este módulo desde otro módulo

Solo a través de `index.js`. **No importes nuestro service ni nuestro model.**

```js
const proveedores = require('../proveedores');

// Validar una FK id_proveedor antes de insertar un medicamento
const existe = await proveedores.existeProveedor(id_proveedor);
if (!existe) { /* rechazar */ }

// Datos para un <select> de proveedores
const activos = await proveedores.listarProveedoresActivos();

// Detalle de uno
const proveedor = await proveedores.obtenerProveedorPorId(id_proveedor);
```

| Export | Firma | Uso |
|---|---|---|
| `proveedoresRouter` | Router de Express | Se monta en `app.js` |
| `obtenerProveedorPorId(id)` | `→ Proveedor \| null` | Lectura de detalle |
| `existeProveedor(id)` | `→ boolean` | **Medicamentos** valida su FK |
| `listarProveedoresActivos()` | `→ Proveedor[]` | Selects y catálogos |

**Ningún módulo escribe en la tabla `proveedores`.** La integración es solo por estos servicios.

---

## 7. Nota crítica: el borrado es LÓGICO

`DELETE /api/proveedores/:id` marca `activo = false`. **Nunca** hace `DELETE` físico, porque el módulo de Medicamentos tiene una FK `id_proveedor` hacia esta tabla y un borrado real rompería su módulo.

---

## 8. Pruebas

La colección `proveedores.postman_collection.json` (en esta misma carpeta) cubre los 5 endpoints más los casos de error: nombre faltante, email inválido, UUID mal formado, campo no permitido, límite fuera de rango y nombre duplicado.

Variables de la colección: `baseUrl` (por defecto `http://localhost:3000`) y `proveedorId`, que se llena automáticamente al ejecutar el POST de creación.