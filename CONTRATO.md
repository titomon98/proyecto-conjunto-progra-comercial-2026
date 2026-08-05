# CONTRATO.md - Sistema de Farmacia

Este documento establece los acuerdos arquitectónicos, técnicos y de flujo de trabajo para el desarrollo del Sistema de Farmacia. Sirve como fuente única de verdad para los 7 equipos de desarrollo y provee el contexto necesario para herramientas de Inteligencia Artificial que asistan en el proyecto.

## 1. Stack Tecnológico Elegido y Justificación

*   **Base de Datos:** PostgreSQL alojada en **Supabase**.
    *   *Justificación:* Cumple con el requisito de usar una base de datos compartida y persistente. Supabase permite que los 7 equipos se conecten a la misma instancia en la nube en tiempo real, evitando discrepancias de datos locales.
*   **Backend:** Node.js con Express.js.
    *   *Justificación:* Express es un framework ligero, flexible y ampliamente dominado por el grupo, ideal para construir una API RESTful modular donde cada equipo pueda gestionar sus propias rutas y controladores.
*   **Frontend:** React + Vite y Tailwind CSS.
    *   *Justificación:* Vite proporciona un entorno de desarrollo de alta velocidad; React permite dividir el desarrollo de la interfaz en componentes independientes por módulo; y Tailwind estandariza el diseño sin conflictos de clases CSS.

## 2. Asignación de Módulos y Estructura del Proyecto

Para mantener el código ordenado y evitar conflictos de fusión (merge conflicts), cada encargado trabajará en su propia carpeta raíz correspondiente a su módulo.

*   **Medicamentos:** Josué Vásquez `(📁 /src/modules/medicamentos)`
*   **Clientes:** Christian Ramírez `(📁 /src/modules/clientes)`
*   **Proveedores:** Marco Bolaños `(📁 /src/modules/proveedores)`
*   **Usuarios:** Ethan Ruiz `(📁 /src/modules/usuarios)`
*   **Inventario:** Demy De León `(📁 /src/modules/inventario)`
*   **Ventas:** Pedro López `(📁 /src/modules/ventas)`
*   **Reportes:** Marco Orozco `(📁 /src/modules/reportes)`

## 3. Convenciones y Reglas de Base de Datos

Al ser una base de datos compartida, un error de un módulo afecta a todo el sistema. 

**Reglas Estrictas:**
1.  **PROHIBIDO** ejecutar `DROP TABLE`, `TRUNCATE` o reiniciar el esquema sin previo aviso y autorización por escrito del grupo completo.
2.  Todos los cambios estructurales se manejarán mediante una carpeta compartida de migraciones `(📁 /database/migrations)`.
3.  Formato de archivos de migración: `[correlativo]-[accion]-[tabla].sql` (Ejemplo: `1-create-table-medicamentos.sql`).

**Estructura Base Acordada (Nombres exactos y llaves):**
Para que los equipos puedan referenciar llaves foráneas desde el día 1, se definen las siguientes entidades principales:

*   `usuarios` (PK: `id_usuario` UUID, `email`, `password`, `rol`)
*   `clientes` (PK: `id_cliente` UUID, `nombre`, `nit`)
*   `proveedores` (PK: `id_proveedor` UUID, `nombre`, `contacto`)
*   `medicamentos` (PK: `id_medicamento` UUID, FK: `id_proveedor`, `nombre`, `descripcion`,`precio`)
*   `inventario` (PK: `id_inventario` UUID, FK: `id_medicamento`, `stock_actual`, ``)
*   `ventas` (PK: `id_venta` UUID, FK: `id_cliente`, FK: `id_usuario`, `fecha`, `total`)
*   `detalle_ventas` (PK: `id_detalle` UUID, FK: `id_venta`, FK: `id_medicamento`,`` `cantidad`, `subtotal`)

*Nota: El equipo de Reportes tiene la libertad de solicitar tablas adicionales, índices o vistas específicas a los demás equipos según lo requiera.*

## 4. Exposición de Lógica entre Módulos

Para que el sistema funcione de manera integrada, los módulos **no deben acceder directamente a la base de datos de otros módulos para realizar escrituras**. 

*   Cada módulo exportará un "Servicio" (Ej. `InventarioService.js` o funciones exportadas en su `index.js`).
*   **Regla de Integración:** Si el módulo de *Ventas* necesita descontar stock tras una compra, debe invocar la función exportada por el módulo de *Inventario* (Ej: `descontarStock(id_medicamento, cantidad)`).
*   El equipo de *Reportes* consumirá los servicios de solo lectura exportados por los demás módulos para centralizar la información.

## 5. Flujo de Trabajo en GitHub (Branching)

*   `main`: Rama de producción. **Nadie hace commits directos aquí.** Solo el Docente (Tech Lead) revisará y aprobará la única Pull Request final hacia esta rama.
*   `develop`: Rama principal de integración. Aquí se irán juntando los cambios de los 7 módulos durante el ciclo de desarrollo.
*   **Ramas de trabajo:** Cada encargado creará ramas a partir de `develop` usando la convención `<tipo>/<modulo>-<descripcion>`.
    *   *Ejemplos permitidos:* `feature/medicamentos-crud`, `bugfix/clientes-typo`, `feature/ventas-descuento`.
*   Solo los aportes registrados en GitHub tendrán validez para el punteo del examen final.

## 6. Orden de Integración

Para evitar cuellos de botella y errores de dependencias de llaves foráneas, el código se integrará a la rama `develop` en las siguientes fases:

*   **Fase 1 (Módulos Base sin dependencias):** Usuarios, Clientes, Proveedores.
*   **Fase 2 (Módulo de 1er grado):** Medicamentos *(requiere que Proveedores ya esté integrado).*
*   **Fase 3 (Módulo de 2do grado):** Inventario *(requiere que Medicamentos ya esté integrado).*
*   **Fase 4 (Módulo Transaccional):** Ventas *(requiere Usuarios, Clientes e Inventario listos).*
*   **Fase 5 (Módulo de Consumo):** Reportes *(depende de que todos los módulos anteriores estén emitiendo y registrando datos correctamente).*
## 7. Línea gráfica

