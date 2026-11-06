# 🫔 Imperio del Tamal — Simulador de Negocio Multisucursal en CDMX

Aplicación web interactiva donde emprendes con un puesto de tamales en la Ciudad de México y lo haces crecer hasta convertirlo en una cadena multisucursal.

- **Asignatura:** Programación Web (`AEB-1055`)
- **Equipo 09:** Diego Fernández Martínez, Mitzi Cecilia García Esquivel, María Victoria Montes Betancourt, Ángel Androth Tejeda Juárez, Madelein Laura Zamora Navarro.

---

## 🚀 Cómo ejecutar el proyecto (Servidor + Cliente)

1. Asegúrate de tener **Node.js** instalado (v18 o superior).
2. En la terminal, dentro de la carpeta del proyecto, ejecuta:

```bash
npm start
```
*(O directamente `node server.js`)*

3. Abre en tu navegador:
   👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Estructura del Proyecto

```text
imperio-del-tamal/
├── index.html                  # Pantalla 1: Inicio y modal para cargar partidas del servidor
├── ubicacion.html              # Pantalla 2: Mapa interactivo de CDMX y selección de colonia
├── menu.html                   # Pantalla 3: Configuración de menú, precios y proyección diaria
├── dashboard.html              # Pantalla 4: Dashboard multisucursal, ventas y reportes comparativos
├── server.js                   # Servidor Backend Node.js y API REST (Tema 4)
├── package.json                # Configuración de scripts y metadatos del proyecto
├── css/
│   └── styles.css              # Identidad visual oficial (Verde tamal, Amarillo maíz, Terracota)
├── js/
│   ├── app.js                  # Motor financiero cliente, utilidades y cliente API REST (Tema 3)
│   ├── ubicacion.js            # Lógica del mapa de CDMX y validación de negocio
│   ├── menu.js                 # Lógica interactiva de productos, costos y precios
│   └── dashboard.js            # Controlador SPA del tablero, gráfica de 7 días, sucursales y reportes
├── data/
│   ├── partidas.json           # Persistencia de partidas y sucursales en JSON
│   ├── catalogo.xml            # Catálogo estructurado de zonas CDMX y productos en XML
│   └── historial_ventas.csv    # Bitácora histórica de ventas por sucursal en CSV
└── docs/
    └── DOCUMENTACION_PARCIAL_2.md  # Documentación técnica de cliente (Tema 3) y servidor (Tema 4)
```
