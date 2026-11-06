# Reporte Técnico — Parcial 2: Programación del Lado del Cliente y del Servidor

**Proyecto:** Imperio del Tamal — Simulador de negocio multisucursal en CDMX  
**Asignatura:** Programación Web (AEB-1055) • Grupo 2026-2  
**Profesora:** Alejandra González Sánchez  
**Equipo 09 — Integrantes:**
- Fernández Martínez Diego (`202110011`) — Desarrollador Backend
- García Esquivel Mitzi Cecilia (`202121190`) — Administradora de Base de Datos y Persistencia
- Montes Betancourt María Victoria (`202121271`) — Líder de Proyecto y Desarrolladora Fullstack
- Tejeda Juárez Ángel Androth (`202210130`) — Desarrollador Frontend
- Zamora Navarro Madelein Laura T (`202120404`) — Diseñadora UI/UX y Prototipado Visual

---

## 1. Resumen de Entregables Cubiertos

| Tema | Evaluación | Entregable Implementado | Archivos Clave |
| :--- | :--- | :--- | :--- |
| **Tema 2 — HTML, XML y CSS** | Parcial 1 / 2 | Interfaz web funcional completa (Inicio, Selección de Ubicación con mapa CDMX, Configuración de Menú, Dashboard Multisucursal) y catálogo estructurado en XML. | `index.html`, `ubicacion.html`, `menu.html`, `dashboard.html`, `css/styles.css`, `data/catalogo.xml` |
| **Tema 3 — Programación del lado del cliente** | **Parcial 2** | Motor de cálculo en el cliente (ventas, costos y ganancias según colonia, menú y precios), validaciones de formularios y actualización dinámica del DOM sin recargas. | `js/app.js`, `js/ubicacion.js`, `js/menu.js`, `js/dashboard.js` |
| **Tema 4 — Programación del lado del servidor** | **Parcial 2** | Servidor HTTP y API REST en Node.js con persistencia en archivos estructurados (`JSON`, `XML`, `CSV`), gestión de partidas guardadas, apertura de sucursales y reportes comparativos entre zonas. | `server.js`, `package.json`, `data/partidas.json`, `data/catalogo.xml`, `data/historial_ventas.csv` |

---

## 2. Tema 3 — Decisiones Técnicas de la Programación del Lado del Cliente

### 2.1 Descomposición Modular del Cliente
Para mantener el código limpio, escalable y fácil de mantener por los 5 integrantes del equipo, la lógica del navegador se dividió en cuatro módulos independientes dentro de la carpeta `/js/`:

1. **`js/app.js` (Núcleo y Estado Compartido):**
   - Encapsula mediante el patrón **IIFE / Module (`ImperioApp`)** el catálogo de zonas de la CDMX, los productos base, los formateadores de moneda (`$12,450`) y calificaciones en estrellas (`★★★★★`).
   - Implementa el motor matemático de proyección en el cliente (`calcularSimulacionCliente`) y el cliente HTTP (`apiFetch`) para consumir la API REST del servidor con manejo de errores y notificaciones tipo *Toast*.
2. **`js/ubicacion.js` (Pantalla 2 — Mapa Estratégico de CDMX):**
   - Vincula los pines interactivos del mapa vectorial SVG de la Ciudad de México con las tarjetas de información de cada colonia (**Polanco / Reforma**, **Coyoacán**, **Nápoles**, **Centro Histórico** y **Buenavista**).
   - Valida en tiempo real que el nombre del negocio tenga al menos 3 caracteres antes de avanzar a la configuración del menú.
3. **`js/menu.js` (Pantalla 3 — Configuración de Menú y Simulación Previa):**
   - Renderiza dinámicamente las categorías **TAMALES** y **BEBIDAS**.
   - Valida que ningún producto tenga un precio de venta igual o menor a su costo de producción unitario ($\text{Precio} \ge \text{Costo} + 1$) y que siempre exista al menos un producto activo en el puesto.
   - Recalcula instantáneamente la **Inversión inicial** (`$4,500`) y la **Ganancia diaria estimada** conforme el jugador activa productos o modifica precios.
4. **`js/dashboard.js` (Pantalla 4 — Tablero Principal SPA):**
   - Implementa navegación **Single Page Application (SPA)** mediante la barra lateral izquierda (`Dashboard`, `Sucursales`, `Crear sucursal`, `Menú`, `Ventas`, `Reportes`, `Configuración`) evitando recargas completas de página.
   - Genera dinámicamente en SVG la gráfica comparativa de **Rendimiento de los últimos 7 días** (Ventas vs. Ganancias) y actualiza la barra del **Sistema de Progreso de 5 Niveles** (*Nivel 1: Puesto de Barrio* hasta *Nivel 5: Imperio del Tamal*).

### 2.2 Modelo Matemático y Fórmulas Financieras
Tanto en la vista previa del cliente como en el motor del servidor se aplican las ecuaciones definidas en la planeación:

$$\text{Ingreso Total} = \sum_{i=1}^{n} \left( \text{Unidades Vendidas}_i \times \text{Precio de Venta}_i \right)$$

$$\text{Costos Totales} = \text{Costo de Insumos} + \text{Sueldos de Ayudantes} + \text{Renta Diaria por Zona}$$

$$\text{Ganancia Neta} = \text{Ingreso Total} - \text{Costos Totales}$$

Donde la cantidad de unidades vendidas por zona depende de:
- **Demanda base de la colonia** (ej. 210 clientes base en Polanco/Reforma, 235 en Centro Histórico, 165 en Coyoacán).
- **Elasticidad al precio y competencia de la zona** (precios excesivos reducen la conversión según la sensibilidad de cada colonia).
- **Capacidad operativa del puesto** ($95 \text{ unidades base} + 65 \text{ unidades adicionales por cada ayudante contratado}$).

---

## 3. Tema 4 — Decisiones Técnicas de la Programación del Lado del Servidor

### 3.1 Arquitectura Cliente-Servidor en Capas y API REST
El backend (`server.js`) implementa una arquitectura en tres capas (**Presentación**, **Lógica de Negocio** y **Persistencia de Datos**) comunicada mediante servicios **API REST** sobre HTTP en el puerto `3000`:

| Método | Endpoint | Descripción Técnica |
| :--- | :--- | :--- |
| `GET` | `/api/catalogo` | Entrega los parámetros financieros, niveles de progreso, zonas de CDMX y productos base. |
| `GET` | `/api/catalogo/xml` | Sirve el catálogo estructurado en formato `application/xml` (`data/catalogo.xml`). |
| `GET` | `/api/partidas` | Lista todas las partidas almacenadas en `data/partidas.json`. |
| `GET` | `/api/partidas/:id` | Recupera el estado completo de una partida y sus sucursales activas. |
| `POST` | `/api/partidas` | Valida y registra una nueva partida inicial, ejecutando el Día 1 de operación. |
| `PUT` | `/api/partidas/:id` | Persiste cambios de menú, precios o nombre del negocio en el servidor. |
| `POST` | `/api/partidas/:id/simular` | Ejecuta el motor de simulación de un nuevo día para todas las sucursales activas y sincroniza `JSON` y `CSV`. |
| `POST` | `/api/partidas/:id/sucursales` | Valida el capital disponible (`$4,500`), registra una nueva sucursal en otra colonia de CDMX y recalcula el nivel del imperio. |
| `POST` | `/api/partidas/:id/ayudantes` | Contrata un nuevo ayudante (`$600` costo de contratación, `$350/día` sueldo) e incrementa la capacidad productiva de la sede. |
| `GET` | `/api/partidas/:id/reportes` | Genera el **Reporte Comparativo entre Zonas y Sucursales**, calculando márgenes, ROI en días y recomendación de expansión. |
| `GET` | `/api/partidas/:id/exportar/:formato` | Exporta el estado de la partida y el reporte comparativo en **`json`**, **`xml`** o **`csv`**. |

### 3.2 Persistencia Multi-formato (JSON, XML y CSV)
Siguiendo el diseño de la Capa de Datos definida por el equipo:
- **`data/partidas.json`:** Almacena de forma transaccional las partidas de los jugadores, sus sucursales, configuración de menú, serie histórica de 7 días y bitácora de ventas.
- **`data/catalogo.xml`:** Define mediante etiquetas semánticas XML las zonas de la CDMX (`<ZonasCDMX>`), los niveles de progreso (`<NivelesProgreso>`) y el catálogo de productos (`<CatalogoProductos>`).
- **`data/historial_ventas.csv`:** Se sincroniza automáticamente en cada día simulado para permitir su análisis en hojas de cálculo (Excel / Google Sheets).
