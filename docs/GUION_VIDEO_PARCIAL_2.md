# 🎬 Guion y Diálogos para el Video — Parcial 2 (Equipo 09)

**Proyecto:** Imperio del Tamal — Simulador de negocio multisucursal en CDMX  
**Asignatura:** Programación Web (`AEB-1055`) • Profesora: Alejandra González Sánchez  
**Duración total sugerida:** 5 a 7 minutos (aprox. 1 a 1.5 minutos por integrante)

---

## 📋 Resumen de Participación por Rol (según el Reporte del Parcial 1)

| Orden | Integrante | Rol en el Equipo | Qué muestra en pantalla mientras habla |
| :---: | :--- | :--- | :--- |
| **1** | **Montes Betancourt María Victoria** | Líder de Proyecto y Desarrolladora Fullstack | Presentación del proyecto, arquitectura general, pantalla de inicio (`index.html`) y objetivos del Parcial 2. |
| **2** | **Zamora Navarro Madelein Laura** | Diseñadora UI/UX y Prototipado Visual | Identidad visual (`css/styles.css`), paleta de colores mexicana, tipografías y diseño de Pantalla 2 (`ubicacion.html`) con el mapa de CDMX. |
| **3** | **Tejeda Juárez Ángel Androth** | Desarrollador Frontend | Estructura HTML5/CSS3 responsiva, Pantalla 3 (`menu.html`), programación del lado del cliente (`js/ubicacion.js`, `js/menu.js`) y validaciones en vivo. |
| **4** | **Fernández Martínez Diego** | Desarrollador Backend | Motor de simulación (`server.js` y `js/dashboard.js`), fórmulas financieras, simulación de días, contratación de ayudantes y apertura de sucursales en `dashboard.html`. |
| **5** | **García Esquivel Mitzi Cecilia** | Administradora de Base de Datos y Persistencia | Persistencia en archivos estructurados (`data/partidas.json`, `data/catalogo.xml`, `data/historial_ventas.csv`), reportes comparativos entre zonas y cierre. |

---

## 🎙️ Diálogos Paso a Paso (Listos para leer / grabar)

---

### 👤 PARTE 1: María Victoria Montes Betancourt
*(Rol: Líder de Proyecto y Desarrolladora Fullstack)*

**🖥️ Qué mostrar en pantalla:**  
Abre el navegador en `index.html` (Pantalla de Inicio con la ilustración del puesto de tamales y el vapor de la vaporera) y muestra brevemente la estructura de carpetas en VS Code.

**🗣️ Diálogo de María Victoria:**
> *"¡Hola profesora Alejandra y compañeros! Nosotros somos el **Equipo 09** y les presentamos el avance del **Segundo Parcial** de nuestro proyecto **Imperio del Tamal**, un simulador web de negocio multisucursal ambientado en la Ciudad de México.*
>
> *En mi rol como **Líder de Proyecto y Desarrolladora**, coordiné la integración de los entregables correspondientes a la interfaz web del **Tema 2**, la **Programación del Lado del Cliente del Tema 3** y la **Programación del Lado del Servidor del Tema 4**.*
>
> *Como vemos en nuestra pantalla de inicio (`index.html`), el simulador recibe al jugador con la frase **'De un puesto a un imperio'**. Desde aquí el usuario tiene dos caminos: iniciar una nueva partida desde cero configurando su primer puesto, o hacer clic en **'Cargar partida'** para recuperar desde el servidor una partida guardada previamente.*
>
> *Para explicar cómo diseñamos la experiencia visual y la selección estratégica de colonias en la CDMX, le cedo la palabra a mi compañera **Madelein**."*

---

### 👤 PARTE 2: Madelein Laura Zamora Navarro
*(Rol: Diseñadora UI/UX y Prototipado Visual)*

**🖥️ Qué mostrar en pantalla:**  
Haz clic en **"Crear nueva partida"** para pasar a `ubicacion.html` (Pantalla 2). Haz clic en distintos pines del mapa de la CDMX (*Polanco / Reforma*, *Coyoacán*, *Nápoles*, *Centro Histórico*, *Buenavista*) para que se vea cómo cambian las estrellas de Demanda, Renta, Competencia y Flujo de clientes.

**🗣️ Diálogo de Madelein Laura:**
> *"¡Gracias Victoria! Hola profesora, mi nombre es **Madelein Zamora**, encargada del **Diseño UI/UX y la Identidad Visual** del simulador.*
>
> *Nuestro objetivo de diseño fue que la aplicación no se viera como un formulario administrativo rígido, sino como un verdadero juego de estrategia gastronómica en la Ciudad de México. Para ello definimos en nuestra hoja de estilos (`css/styles.css`) una paleta de colores con identidad mexicana: el **Verde hoja de tamal (`#1E4D2B`)** como color institucional, el **Amarillo maíz (`#F4C430`)** para botones de acción e indicadores de estrellas, el **Naranja terracota (`#E25822`)** como acento cálido, y un fondo crema (`#FFF9F0`) que facilita la lectura junto con las fuentes **Montserrat** y **Roboto**.*
>
> *En esta **Pantalla 2 de Selección de Ubicación**, en lugar de usar una simple lista desplegable, implementamos un **mapa interactivo de la CDMX**. Cuando el jugador selecciona una zona como **Polanco / Reforma**, **Coyoacán** o **Centro Histórico**, la tarjeta derecha actualiza de inmediato sus estrellas de **Demanda**, **Renta**, **Competencia** y **Flujo de clientes**, convirtiendo la elección de la colonia en una decisión estratégica real.*
>
> *Ahora mi compañero **Ángel Androth** explicará cómo construimos las vistas en HTML y la validación del lado del cliente."*

---

### 👤 PARTE 3: Ángel Androth Tejeda Juárez
*(Rol: Desarrollador Frontend — HTML5, CSS3 y Programación Cliente)*

**🖥️ Qué mostrar en pantalla:**  
En `ubicacion.html`, intenta dar clic en *"Continuar"* con el nombre vacío para que se vea el mensaje de validación; luego escribe **"Tamales El Imperio"** y avanza a `menu.html` (Pantalla 3). En `menu.html`, activa/desactiva productos y sube/baja precios con los botones `+` y `-` para mostrar cómo cambia en tiempo real la **Ganancia estimada por día**.

**🗣️ Diálogo de Ángel Androth:**
> *"¡Gracias Madelein! Qué tal profesora, soy **Ángel Androth Tejeda**, **Desarrollador Frontend** del equipo.*
>
> *Para cubrir el **Tema 2 y el Tema 3 (Programación del lado del cliente)**, estructuramos la aplicación de forma modular en `js/ubicacion.js` y `js/menu.js`, asegurando diseño responsivo con CSS Grid y Flexbox e implementando validaciones en el navegador antes de enviar cualquier dato al servidor.*
>
> *Por ejemplo, aquí en el registro del negocio validamos que el usuario ingrese un nombre válido antes de avanzar. Al pasar a la **Pantalla 3: Configuración del Menú (`menu.html`)**, dividimos el catálogo en las categorías **TAMALES** (verde, mole, oaxaqueño, rajas, rojo y chocolate) y **BEBIDAS** (champurrado, atole de vainilla y café de olla).*
>
> *Cada tarjeta muestra su costo de producción y permite activar o desactivar el producto y ajustar su precio de venta. En el cliente validamos que ningún precio sea menor o igual a su costo de producción para evitar pérdidas unitarias. Además, cada vez que modificamos un precio, el panel derecho recalcula dinámicamente en el DOM las unidades estimadas, la inversión inicial de `$4,500` y la **ganancia diaria estimada** sin recargar la página.*
>
> *Al dar clic en **'Iniciar negocio'**, nos conectamos con el servidor y pasamos al tablero principal, el cual explicará mi compañero **Diego**."*

---

### 👤 PARTE 4: Diego Fernández Martínez
*(Rol: Desarrollador Backend — Motor de Simulación y Servidor)*

**🖥️ Qué mostrar en pantalla:**  
En `dashboard.html` (Pantalla 4), muestra las tarjetas superiores (`VENTAS HOY`, `COSTOS`, `GANANCIA`), la barra de progreso de niveles (*Nivel 2 — Negocio Local*), la gráfica de los últimos 7 días y haz clic en **"☀️ Simular siguiente día"**, luego en **"👨‍🍳 Contratar ayudante"** y finalmente entra a **"➕ Crear sucursal"** en la barra lateral para abrir una nueva sucursal en otra colonia.

**🗣️ Diálogo de Diego:**
> *"¡Gracias Ángel! Hola profesora, soy **Diego Fernández**, **Desarrollador Backend** del proyecto.*
>
> *Para el **Tema 3 y Tema 4**, programé el motor de simulación financiera y el servidor en **Node.js (`server.js`)** expuesto mediante una **API REST**. En el Dashboard Principal vemos cómo se aplican nuestras tres fórmulas financieras oficiales en cada jornada:*
> 1. *El **Ingreso Total** es igual a las Unidades Vendidas multiplicadas por el Precio de Venta.*
> 2. *Los **Costos Totales** suman el costo de los Insumos más los Sueldos de los ayudantes (`$350` al día cada uno) más la Renta diaria de la zona.*
> 3. *Y la **Ganancia Neta** es el Ingreso Total menos los Costos Totales.*
>
> *Cuando pulsamos **'Simular siguiente día'**, el cliente envía una petición `POST` al endpoint `/api/partidas/:id/simular`. El servidor calcula la demanda según la elasticidad de precios de cada colonia, actualiza el dinero disponible, hace avanzar nuestra **barra de progreso de 5 niveles** (desde *Puesto de Barrio* hasta *Imperio del Tamal*) y redibuja en tiempo real la **gráfica de rendimiento de los últimos 7 días**.*
>
> *También implementamos en el servidor la contratación de ayudantes y el módulo **'Crear sucursal'**, donde el servidor valida que tengamos el capital de apertura necesario para inaugurar una nueva sede en otra alcaldía de la CDMX.*
>
> *Para cerrar, mi compañera **Mitzi** explicará la persistencia de datos y los reportes comparativos entre zonas."*

---

### 👤 PARTE 5: Mitzi Cecilia García Esquivel
*(Rol: Administradora de Base de Datos, Persistencia e Infraestructura)*

**🖥️ Qué mostrar en pantalla:**  
En la barra lateral izquierda de `dashboard.html`, haz clic en **"🧾 Ventas"**, luego en **"📈 Reportes"** (mostrando las dos tablas comparativas y los botones de descarga `JSON`, `XML`, `CSV`), y muestra brevemente los archivos `data/partidas.json`, `data/catalogo.xml` y `data/historial_ventas.csv`.

**🗣️ Diálogo de Mitzi Cecilia:**
> *"¡Gracias Diego! Hola profesora, mi nombre es **Mitzi Cecilia García**, responsable de la **Persistencia de Datos e Infraestructura**.*
>
> *Para cumplir con el **Tema 4 (Programación del lado del servidor y manejo de datos)**, diseñamos una capa de persistencia multi-formato dentro de la carpeta `data/` que almacena toda la información generada por el simulador:*
> - *Primero, en **`data/catalogo.xml`** estructuramos mediante etiquetas XML los parámetros iniciales, los 5 niveles de crecimiento, las colonias de la CDMX y el catálogo de productos.*
> - *Segundo, en **`data/partidas.json`** guardamos de forma persistente el estado completo de cada partida, sus sucursales activas, su menú personalizado y el historial financiero.*
> - *Y tercero, en **`data/historial_ventas.csv`** sincronizamos automáticamente cada venta realizada por fecha, sucursal, producto y monto total.*
>
> *Finalmente, en la sección de **Reportes Comparativos (`GET /api/partidas/:id/reportes`)**, el servidor compara el rendimiento de todas nuestras sucursales activas desglosando Insumos, Sueldos y Renta, proyecta el Retorno de Inversión (ROI) en todas las colonias de la CDMX y le recomienda al jugador en qué colonia abrir su próxima sucursal. Además, desde aquí podemos exportar toda nuestra partida en **JSON, XML y CSV**.*
>
> *Con esto concluimos la presentación del Segundo Parcial del **Equipo 09 — Imperio del Tamal**. ¡Muchas gracias por su atención!"*
