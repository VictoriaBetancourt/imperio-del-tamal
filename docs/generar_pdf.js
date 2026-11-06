/**
 * Generador nativo de PDF para el Reporte del Parcial 2 - Imperio del Tamal (Equipo 09 - TESE)
 * Replica el formato visual del Reporte de Parcial 1 (marco de página, portada TESE,
 * títulos azules, tablas azul claro/oscuro, fórmulas y mockups).
 */
const fs = require('fs');
const path = require('path');

const OUTPUT_PDF = path.join(__dirname, 'Reporte_Parcial_2_Imperio_del_Tamal.pdf');

// Codificación WinAnsi para caracteres en español en PDF Type1 (Helvetica)
const WIN_ANSI_MAP = {
    'á': '\\341', 'é': '\\351', 'í': '\\355', 'ó': '\\363', 'ú': '\\372',
    'Á': '\\301', 'É': '\\311', 'Í': '\\315', 'Ó': '\\323', 'Ú': '\\332',
    'ñ': '\\361', 'Ñ': '\\321', 'ü': '\\374', 'Ü': '\\334',
    '¡': '\\241', '¿': '\\277', '•': '\\225', '—': '\\227', '–': '\\226',
    '“': '\\223', '”': '\\224', '‘': '\\221', '’': '\\222', '°': '\\260',
    '×': '\\327', '−': '-'
};

function escapePDFText(str) {
    let out = '';
    for (const ch of String(str || '')) {
        if (ch === '\\') out += '\\\\';
        else if (ch === '(') out += '\\(';
        else if (ch === ')') out += '\\)';
        else if (WIN_ANSI_MAP[ch]) out += WIN_ANSI_MAP[ch];
        else if (ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) <= 126) out += ch;
        else out += ' ';
    }
    return out;
}

// Ancho aproximado de caracteres en Helvetica (proporcional a 1000 unidades)
function estimateWidth(str, fontSize, bold = false) {
    let w = 0;
    for (const ch of String(str || '')) {
        if ('il.,:;|!I1 '.includes(ch)) w += 0.28;
        else if ('mwMW@%'.includes(ch)) w += 0.82;
        else if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) w += 0.68;
        else w += 0.53;
    }
    return w * fontSize * (bold ? 1.05 : 1.0);
}

function wrapText(text, maxWidth, fontSize, bold = false) {
    const words = String(text || '').split(/\s+/);
    const lines = [];
    let current = '';

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (estimateWidth(candidate, fontSize, bold) <= maxWidth) {
            current = candidate;
        } else {
            if (current) lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [''];
}

class PDFBuilder {
    constructor() {
        this.pages = [];
        this.currentOps = [];
        this.pageWidth = 612;  // Carta (Letter) 8.5 x 11 in
        this.pageHeight = 792;
        this.marginLeft = 56;
        this.marginRight = 56;
        this.contentWidth = 612 - 112;
        this.y = 720;
        this.newPage();
    }

    newPage() {
        if (this.currentOps.length > 0) {
            this.pages.push(this.currentOps.join('\n'));
        }
        this.currentOps = [];
        // Marco exterior negro idéntico al reporte de Parcial 1
        this.rectStroke(28, 28, 556, 736, [0.15, 0.15, 0.15], 0.8);
        this.y = 725;
    }

    ensureSpace(neededHeight) {
        if (this.y - neededHeight < 52) {
            this.newPage();
        }
    }

    rectFill(x, y, w, h, rgb) {
        this.currentOps.push(
            `${rgb[0].toFixed(3)} ${rgb[1].toFixed(3)} ${rgb[2].toFixed(3)} rg ${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`
        );
    }

    rectStroke(x, y, w, h, rgb, lineWidth = 1) {
        this.currentOps.push(
            `${lineWidth.toFixed(2)} w ${rgb[0].toFixed(3)} ${rgb[1].toFixed(3)} ${rgb[2].toFixed(3)} RG ${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re S`
        );
    }

    rectFillStroke(x, y, w, h, fillRgb, strokeRgb, lineWidth = 0.8) {
        this.currentOps.push(
            `${lineWidth.toFixed(2)} w ${fillRgb[0].toFixed(3)} ${fillRgb[1].toFixed(3)} ${fillRgb[2].toFixed(3)} rg ${strokeRgb[0].toFixed(3)} ${strokeRgb[1].toFixed(3)} ${strokeRgb[2].toFixed(3)} RG ${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re B`
        );
    }

    text(str, x, y, size = 11, font = 'F1', rgb = [0, 0, 0]) {
        this.currentOps.push(
            `BT /${font} ${size} Tf ${rgb[0].toFixed(3)} ${rgb[1].toFixed(3)} ${rgb[2].toFixed(3)} rg ${x.toFixed(1)} ${y.toFixed(1)} Td (${escapePDFText(str)}) Tj ET`
        );
    }

    centerText(str, y, size = 12, font = 'F1', rgb = [0, 0, 0]) {
        const w = estimateWidth(str, size, font === 'F2');
        const x = (this.pageWidth - w) / 2;
        this.text(str, x, y, size, font, rgb);
    }

    headingBlue(str, size = 12.5) {
        this.ensureSpace(32);
        this.y -= 10;
        const lines = wrapText(str, this.contentWidth, size, true);
        for (const line of lines) {
            this.text(line, this.marginLeft, this.y, size, 'F2', [0.12, 0.35, 0.49]);
            this.y -= size + 5;
        }
        this.y -= 4;
    }

    subHeadingGreen(str, size = 11.5) {
        this.ensureSpace(26);
        this.y -= 6;
        this.text(str, this.marginLeft, this.y, size, 'F2', [0.118, 0.302, 0.169]);
        this.y -= size + 6;
    }

    boxHeading(str) {
        this.ensureSpace(34);
        this.y -= 6;
        this.rectFillStroke(this.marginLeft, this.y - 18, 250, 24, [1, 1, 1], [0.12, 0.3, 0.4], 1);
        this.text(str, this.marginLeft + 10, this.y - 10, 10.5, 'F2', [0.12, 0.35, 0.49]);
        this.y -= 30;
    }

    paragraph(str, size = 10.5, indent = 0, boldPrefix = '') {
        const fullText = boldPrefix ? `${boldPrefix} ${str}` : str;
        const lines = wrapText(fullText, this.contentWidth - indent, size, false);
        this.ensureSpace(lines.length * (size + 4) + 8);

        lines.forEach((line, idx) => {
            if (idx === 0 && boldPrefix && line.startsWith(boldPrefix)) {
                this.text(boldPrefix, this.marginLeft + indent, this.y, size, 'F2', [0, 0, 0]);
                const offset = estimateWidth(boldPrefix + ' ', size, true);
                const rest = line.slice(boldPrefix.length).trimStart();
                this.text(rest, this.marginLeft + indent + offset, this.y, size, 'F1', [0, 0, 0]);
            } else {
                this.text(line, this.marginLeft + indent, this.y, size, 'F1', [0, 0, 0]);
            }
            this.y -= size + 4.5;
        });
        this.y -= 5;
    }

    bullet(boldTitle, textStr, size = 10.2) {
        this.paragraph(textStr, size, 14, `• ${boldTitle}`);
    }

    formulaBox(lines) {
        const h = lines.length * 16 + 14;
        this.ensureSpace(h + 10);
        this.rectFillStroke(this.marginLeft + 25, this.y - h + 6, this.contentWidth - 50, h, [0.95, 0.97, 1.0], [0.12, 0.35, 0.49], 0.8);
        let cy = this.y - 10;
        for (const l of lines) {
            this.centerText(l, cy, 10.5, 'F2', [0.12, 0.35, 0.49]);
            cy -= 16;
        }
        this.y -= h + 10;
    }

    table(headers, rows, colWidths) {
        const fontSize = 9.2;
        const lineHeight = 12.5;
        const headerH = 20;

        this.ensureSpace(headerH + 35);
        // Encabezado azul oscuro estilo reporte Parcial 1
        let cx = this.marginLeft;
        headers.forEach((h, i) => {
            const w = colWidths[i];
            this.rectFillStroke(cx, this.y - headerH, w, headerH, [0.08, 0.36, 0.48], [0.55, 0.75, 0.88], 0.7);
            this.text(h, cx + 6, this.y - 13.5, 9.5, 'F2', [1, 1, 1]);
            cx += w;
        });
        this.y -= headerH;

        // Filas en azul claro #E9F5FB
        for (const row of rows) {
            const wrappedCells = row.map((cell, i) => wrapText(cell, colWidths[i] - 12, fontSize, i === 0));
            const maxLines = Math.max(...wrappedCells.map((lines) => lines.length));
            const rowH = maxLines * lineHeight + 10;

            if (this.y - rowH < 48) {
                this.newPage();
            }

            let rx = this.marginLeft;
            wrappedCells.forEach((lines, i) => {
                const w = colWidths[i];
                this.rectFillStroke(rx, this.y - rowH, w, rowH, [0.89, 0.95, 0.98], [0.55, 0.75, 0.88], 0.6);
                let ty = this.y - 12;
                lines.forEach((line) => {
                    this.text(line, rx + 6, ty, fontSize, i === 0 ? 'F2' : 'F1', [0.05, 0.05, 0.05]);
                    ty -= lineHeight;
                });
                rx += w;
            });
            this.y -= rowH;
        }
        this.y -= 12;
    }

    save(filepath) {
        if (this.currentOps.length > 0) {
            this.pages.push(this.currentOps.join('\n'));
        }

        const objects = [];
        const addObj = (content) => {
            objects.push(content);
            return objects.length;
        };

        // 1: Catalog, 2: Pages, 3: Font F1 (Helvetica), 4: Font F2 (Helvetica-Bold)
        addObj('<< /Type /Catalog /Pages 2 0 R >>');
        addObj(''); // Placeholder para Pages
        addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
        addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

        const pageIds = [];
        for (const contentStream of this.pages) {
            const streamId = addObj(
                `<< /Length ${Buffer.byteLength(contentStream, 'binary')} >>\nstream\n${contentStream}\nendstream`
            );
            const pageId = addObj(
                `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamId} 0 R >>`
            );
            pageIds.push(`${pageId} 0 R`);
        }

        objects[1] = `<< /Type /Pages /Kids [${pageIds.join(' ')}] /Count ${pageIds.length} >>`;

        let pdf = '%PDF-1.4\n';
        const offsets = [0];
        objects.forEach((obj, idx) => {
            offsets.push(Buffer.byteLength(pdf, 'binary'));
            pdf += `${idx + 1} 0 obj\n${obj}\nendobj\n`;
        });

        const xrefStart = Buffer.byteLength(pdf, 'binary');
        pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
        for (let i = 1; i <= objects.length; i++) {
            pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
        }
        pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

        fs.writeFileSync(filepath, Buffer.from(pdf, 'binary'));
    }
}

const pdf = new PDFBuilder();

// ============================================================================
// PÁGINA 1: PORTADA IDÉNTICA AL REPORTE DE PARCIAL 1
// ============================================================================
// Escudo TESE estilizado en esquina superior derecha (como en página 1 de su PDF)
pdf.rectFillStroke(486, 668, 72, 78, [1, 1, 1], [0.8, 0.1, 0.1], 1.5);
pdf.rectStroke(496, 678, 52, 58, [0.8, 0.1, 0.1], 1.0);
pdf.text('DE ESTUDIOS', 498, 738, 6.5, 'F2', [0.8, 0.1, 0.1]);
pdf.text('TESE', 510, 704, 11, 'F2', [0.8, 0.1, 0.1]);
pdf.text('DE ECATEPEC', 498, 670, 6.5, 'F2', [0.8, 0.1, 0.1]);

pdf.centerText('Tecnológico de Estudios Superiores', 685, 19, 'F1');
pdf.centerText('de Ecatepec.', 658, 19, 'F1');
pdf.centerText('División de Ingeniería en Sistemas Computacionales.', 632, 13.5, 'F1');

pdf.centerText('Programación Web (AEB-1055).', 575, 16, 'F1');
pdf.centerText('Profesora: Alejandra González Sánchez.', 545, 16, 'F1');

pdf.centerText('Proyecto: Imperio del Tamal.', 485, 16.5, 'F2');
pdf.centerText('Simulador de negocio multisucursal en CDMX.', 460, 16.5, 'F2');
pdf.centerText('Reporte Técnico de Implementación — Parcial 2:', 432, 15, 'F1');
pdf.centerText('Interfaz Web (Tema 2), Programación del Lado del Cliente (Tema 3)', 410, 13.5, 'F1');
pdf.centerText('y Programación del Lado del Servidor con Persistencia (Tema 4).', 390, 13.5, 'F1');

pdf.centerText('Integrantes (Equipo 09):', 330, 15.5, 'F2');
pdf.centerText('Fernández Martínez Diego (202110011).', 298, 14, 'F1');
pdf.centerText('García Esquivel Mitzi Cecilia (202121190).', 270, 14, 'F1');
pdf.centerText('Montes Betancourt María Victoria (202121271).', 242, 14, 'F1');
pdf.centerText('Tejeda Juárez Ángel Androth (202210130).', 214, 14, 'F1');
pdf.centerText('Zamora Navarro Madelein Laura T (202120404).', 186, 14, 'F1');

// ============================================================================
// PÁGINA 2: TEMA 2 (HTML, XML Y CSS) Y JUSTIFICACIÓN DE INTERFAZ
// ============================================================================
pdf.newPage();
pdf.headingBlue('PARTE 1: TEMA 2. IMPLEMENTACIÓN DE INTERFAZ WEB (HTML5, XML Y CSS3)');
pdf.paragraph(
    'Durante la continuación del proyecto se concluyó la construcción integral de las cuatro pantallas del simulador Imperio del Tamal, aplicando las decisiones de diseño visual y experiencia de usuario (UI/UX) definidas por el equipo para evocar el ambiente tradicional y urbano de la Ciudad de México combinándolo con un tablero moderno de gestión empresarial.'
);

pdf.subHeadingGreen('1.1 Identidad Visual y Variables CSS Implementadas (css/styles.css)');
pdf.bullet('Verde hoja de tamal (#1E4D2B):', 'Color institucional aplicado en la barra lateral de navegación, encabezados, títulos principales e indicadores de ganancia positiva.');
pdf.bullet('Amarillo maíz (#F4C430):', 'Utilizado en botones de acción primaria, barras de progreso de nivel, encabezados de tarjetas del menú e indicadores de estrellas por colonia.');
pdf.bullet('Naranja terracota (#E25822):', 'Color de apoyo para alertas estratégicas, apertura de nuevas sucursales y detalles gráficos del vapor de la vaporera.');
pdf.bullet('Fondo cálido (#FFF9F0) y Texto oscuro (#263238):', 'Garantizan alto contraste y legibilidad junto con la jerarquía tipográfica de Montserrat (títulos) y Roboto (datos y formularios).');

pdf.subHeadingGreen('1.2 Pantallas Funcionales Construidas');
pdf.table(
    ['Vista / Archivo', 'Elementos Clave Implementados'],
    [
        [
            'Pantalla 1: Inicio (index.html)',
            'Logo Imperio del Tamal, ilustración SVG de un puesto tradicional de tamales con vapor animado en la vaporera, frase "De un puesto a un imperio", botón "Crear nueva partida" y botón "Cargar partida" con modal conectado al servidor.'
        ],
        [
            'Pantalla 2: Selección de Ubicación (ubicacion.html)',
            'Mapa interactivo en SVG de la Ciudad de México con pines seleccionables para Polanco / Reforma, Coyoacán, Nápoles, Centro Histórico y Buenavista. Muestra tarjetas dinámicas con estrellas de Demanda, Renta, Competencia y Flujo de clientes, más el registro validado del nombre del negocio.'
        ],
        [
            'Pantalla 3: Configuración del Menú (menu.html)',
            'Catálogo dividido en TAMALES (Verde, Mole, Oaxaqueño, Rajas, Rojo, Chocolate) y BEBIDAS (Champurrado, Atole de Vainilla, Café de Olla). Permite activar/desactivar productos y modificar precios calculando en vivo la Inversión Inicial ($4,500) y la Ganancia Estimada por día.'
        ],
        [
            'Pantalla 4: Dashboard Principal (dashboard.html)',
            'Interfaz SPA con barra lateral hacia 7 vistas: Dashboard, Sucursales, Crear sucursal, Menú, Ventas, Reportes y Configuración. Incluye barra de progreso de 5 niveles, gráfica de últimos 7 días, tabla de rendimiento por sede y botones de acción.'
        ]
    ],
    [145, 355]
);

pdf.subHeadingGreen('1.3 Uso de XML Estructurado (data/catalogo.xml)');
pdf.paragraph(
    'Para cumplir con el estándar XML del Tema 2 y la capa de persistencia, se creó el archivo data/catalogo.xml, el cual modela semánticamente mediante nodos <ParametrosIniciales>, <NivelesProgreso>, <ZonasCDMX> y <CatalogoProductos> toda la configuración base del simulador.'
);

// ============================================================================
// PÁGINA 3: TEMA 3 — PROGRAMACIÓN DEL LADO DEL CLIENTE
// ============================================================================
pdf.newPage();
pdf.headingBlue('PARTE 2: TEMA 3. PROGRAMACIÓN DEL LADO DEL CLIENTE (PARCIAL 2)');
pdf.paragraph(
    'El objetivo del Tema 3 consiste en desarrollar la lógica del lado del cliente en JavaScript para calcular ventas, costos y ganancias según la colonia, el menú y los precios elegidos por el jugador, validar todas sus decisiones en los formularios y actualizar el tablero dinámicamente descomponiendo el código en módulos manejables.'
);

pdf.subHeadingGreen('2.1 Descomposición Modular del Cliente (/js/)');
pdf.table(
    ['Módulo JavaScript', 'Responsabilidad Técnica y Funciones Clave'],
    [
        [
            'js/app.js (Módulo Central ImperioApp)',
            'Implementa el patrón Module (IIFE) que encapsula el catálogo de colonias de CDMX, el motor de cálculo en el cliente (calcularSimulacionCliente), formateadores de moneda y estrellas, notificaciones Toast y el cliente HTTP asíncrono (apiFetch) con respaldo local.'
        ],
        [
            'js/ubicacion.js (Controlador de Mapa CDMX)',
            'Escucha los eventos de clic en los pines del mapa SVG de la CDMX, actualiza en el DOM las estrellas de Demanda, Renta, Competencia y Flujo de clientes, y valida que el nombre del negocio tenga mínimo 3 caracteres antes de avanzar.'
        ],
        [
            'js/menu.js (Validación y Simulación Previa)',
            'Renderiza las tarjetas de tamales y bebidas, valida que ningún precio de venta sea igual o menor al costo unitario de producción (Precio >= Costo + 1), verifica que exista al menos un producto activo y recalcula en tiempo real la ganancia diaria estimada.'
        ],
        [
            'js/dashboard.js (Motor SPA del Tablero)',
            'Administra la navegación Single Page Application entre las 7 vistas del sidebar sin recargar la página, genera dinámicamente la gráfica vectorial SVG de los últimos 7 días, filtra la tabla de ventas por sucursal y sincroniza las acciones con el servidor.'
        ]
    ],
    [150, 350]
);

pdf.subHeadingGreen('2.2 Fórmulas Financieras y Reglas de Simulación en el Cliente');
pdf.paragraph(
    'Cada vez que el jugador modifica un precio, activa un producto, contrata un ayudante o simula un nuevo día, el motor ejecuta las tres ecuaciones financieras oficiales del proyecto:'
);
pdf.formulaBox([
    'Ingreso Total = Suma (Unidades Vendidas por Producto x Precio de Venta)',
    'Costos Totales = Costo de Insumos + Sueldos de Ayudantes + Renta por Zona',
    'Ganancia Neta = Ingreso Total - Costos Totales'
]);

pdf.bullet('Elasticidad de demanda por colonia:', 'Zonas corporativas como Polanco / Reforma ($650 renta/día, 210 clientes base) toleran precios más altos, mientras que zonas de flujo masivo como Centro Histórico ($520 renta/día, 235 clientes base) premian precios competitivos.');
pdf.bullet('Capacidad operativa y ayudantes:', 'Un puesto sin ayudantes atiende hasta 95 unidades diarias; cada ayudante contratado ($600 costo de contratación y $350/día de sueldo) incrementa la capacidad en +65 unidades diarias.');
pdf.bullet('Sistema de Progreso de 5 Niveles:', 'El cliente evalúa la ganancia acumulada para actualizar la barra de progreso desde Nivel 1 (Puesto de Barrio) hasta Nivel 5 (Imperio del Tamal).');

// ============================================================================
// PÁGINA 4: TEMA 4 — PROGRAMACIÓN DEL LADO DEL SERVIDOR Y PERSISTENCIA
// ============================================================================
pdf.newPage();
pdf.headingBlue('PARTE 3: TEMA 4. PROGRAMACIÓN DEL LADO DEL SERVIDOR Y PERSISTENCIA (PARCIAL 2)');
pdf.paragraph(
    'Para cumplir con el Tema 4 del Parcial 2, se implementó el servidor backend en Node.js (server.js) bajo una arquitectura Cliente-Servidor en capas comunicada mediante una API REST en el puerto 3000. El servidor resuelve el guardado y carga de partidas, valida la apertura de nuevas sucursales y genera reportes comparativos entre zonas de la CDMX.'
);

pdf.subHeadingGreen('3.1 Endpoints de la API REST en el Servidor (server.js)');
pdf.table(
    ['Método y Endpoint', 'Descripción del Procesamiento en el Servidor'],
    [
        [
            'GET /api/catalogo y /api/catalogo/xml',
            'Devuelve los parámetros iniciales del negocio, los 5 niveles de crecimiento, las colonias de la CDMX y el catálogo de productos tanto en JSON como en XML.'
        ],
        [
            'GET /api/partidas y GET /api/partidas/:id',
            'Recupera desde data/partidas.json la lista de partidas guardadas o el estado completo de una partida específica y sus sucursales.'
        ],
        [
            'POST /api/partidas y PUT /api/partidas/:id',
            'Valida en el servidor los datos del negocio, crea una nueva partida ejecutando el Día 1 de operación o actualiza los precios y el menú de una partida existente.'
        ],
        [
            'POST /api/partidas/:id/simular',
            'Simula un nuevo día de ventas en todas las sucursales activas del jugador, actualiza el dinero disponible, el historial de los últimos 7 días y sincroniza el archivo CSV.'
        ],
        [
            'POST /api/partidas/:id/sucursales',
            'Procesa la apertura de una nueva sucursal en otra colonia de la CDMX validando que el jugador cuente con la inversión requerida ($4,500) y registrando alcaldía, código postal y dirección.'
        ],
        [
            'POST /api/partidas/:id/ayudantes',
            'Valida el capital disponible ($600), incrementa la plantilla de ayudantes de la sucursal seleccionada y recalcula su capacidad productiva.'
        ],
        [
            'GET /api/partidas/:id/reportes',
            'Genera el Reporte Comparativo entre Zonas y Sucursales: desglosa Insumos + Sueldos + Renta por sede, proyecta el Retorno de Inversión (ROI) en las 5 zonas de CDMX y recomienda dónde expandir.'
        ],
        [
            'GET /api/partidas/:id/exportar/:formato',
            'Genera y descarga en tiempo real los reportes y el estado del negocio en formatos estructurados JSON, XML y CSV.'
        ]
    ],
    [160, 340]
);

pdf.subHeadingGreen('3.2 Persistencia Multi-formato en la Capa de Datos (/data/)');
pdf.bullet('data/partidas.json:', 'Almacena de forma estructurada todas las partidas de los jugadores, sus sucursales activas, configuración de precios, métricas del día y serie de los últimos 7 días.');
pdf.bullet('data/catalogo.xml:', 'Almacena en formato XML estándar las reglas de las colonias de la CDMX, niveles de progreso y catálogo oficial de tamales y bebidas.');
pdf.bullet('data/historial_ventas.csv:', 'Bitácora tabular separada por comas que se actualiza automáticamente en cada jornada simulada para su consulta en hojas de cálculo.');

// ============================================================================
// PÁGINA 5: ROLES EN PARCIAL 2 Y GUION DE EXPOSICIÓN EN VIDEO
// ============================================================================
pdf.newPage();
pdf.headingBlue('PARTE 4: APORTACIÓN POR ROL Y GUION DE PRESENTACIÓN (EQUIPO 09)');
pdf.paragraph(
    'A continuación se documenta la participación técnica de cada integrante del Equipo 09 durante el Segundo Parcial, así como la estructura de exposición para la demostración en video del simulador funcionando:'
);

pdf.table(
    ['Integrante y Rol', 'Módulos Implementados en Parcial 2', 'Demostración en el Video'],
    [
        [
            'Montes Betancourt María Victoria\nLíder de Proyecto y Fullstack',
            'Integración general cliente-servidor, estado global en js/app.js, flujo de inicio y carga de partidas en index.html y consolidación de documentación técnica.',
            'Presenta el objetivo del simulador, la arquitectura en capas y demuestra la Pantalla 1 (Inicio y modal de Cargar Partida desde el servidor).'
        ],
        [
            'Zamora Navarro Madelein Laura\nDiseñadora UI/UX',
            'Sistema de diseño en css/styles.css, ilustración vectorial del puesto con vaporera, mapa visual interactivo de la CDMX e indicadores de estrellas en ubicacion.html.',
            'Explica la identidad visual mexicana (Verde tamal, Amarillo maíz, Terracota) y demuestra la selección estratégica de colonias en el mapa de la CDMX.'
        ],
        [
            'Tejeda Juárez Ángel Androth\nDesarrollador Frontend',
            'Maquetación responsiva y lógica del cliente en js/ubicacion.js y js/menu.js, validación de formularios y cálculo dinámico de ganancia estimada en menu.html.',
            'Demuestra las validaciones en el cliente, la activación de tamales y bebidas, el ajuste de precios y la actualización instantánea del resumen de apertura.'
        ],
        [
            'Fernández Martínez Diego\nDesarrollador Backend',
            'Motor de simulación financiera en server.js y js/dashboard.js, endpoints REST de simulación diaria, contratación de ayudantes, barra de 5 niveles y apertura de sucursales.',
            'Explica las fórmulas financieras en el Dashboard Principal, simula nuevos días operativos, contrata ayudantes e inaugura una nueva sucursal en otra alcaldía.'
        ],
        [
            'García Esquivel Mitzi Cecilia\nAdministradora de Persistencia y Datos',
            'Estructuración de datos en data/partidas.json, data/catalogo.xml y data/historial_ventas.csv, módulo de reportes comparativos entre zonas y exportación.',
            'Demuestra el historial de ventas por sucursal, el Reporte Comparativo entre Zonas de la CDMX con recomendación de expansión y la descarga en JSON, XML y CSV.'
        ]
    ],
    [135, 185, 180]
);

pdf.subHeadingGreen('4.1 Instrucciones de Ejecución Local y Despliegue Web');
pdf.bullet('Ejecución con Servidor Node.js (API REST activa):', 'Ejecutar el comando "npm start" o "node server.js" en la raíz del proyecto y abrir en el navegador http://localhost:3000.');
pdf.bullet('Ejecución mediante Enlace Público (GitHub Pages):', 'Gracias al motor híbrido programado en js/app.js, el proyecto también funciona al 100% desde cualquier enlace público estático como GitHub Pages sin requerir instalación previa.');

pdf.save(OUTPUT_PDF);
console.log('PDF generado exitosamente en:', OUTPUT_PDF);
