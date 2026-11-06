/**
 * IMPERIO DEL TAMAL - SERVIDOR BACKEND Y PERSISTENCIA (TEMA 4 - PARCIAL 2)
 * Arquitectura Cliente-Servidor en Capas con API REST y persistencia en JSON, XML y CSV.
 * Compatible con Express.js y motor HTTP nativo de Node.js (cero fricción de ejecución).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PARTIDAS_FILE = path.join(DATA_DIR, 'partidas.json');
const CATALOGO_XML_FILE = path.join(DATA_DIR, 'catalogo.xml');
const HISTORIAL_CSV_FILE = path.join(DATA_DIR, 'historial_ventas.csv');

// ============================================================================
// 1. CATÁLOGO OFICIAL DE ZONAS DE CDMX, MENÚ Y NIVELES DE PROGRESO
// ============================================================================

const PARAMETROS_NEGOCIO = {
    capitalInicial: 15000,
    inversionPuestoInicial: 4500,
    sueldoDiarioAyudante: 350,
    costoContratacionAyudante: 600,
    capacidadBaseSinAyudantes: 95,
    capacidadExtraPorAyudante: 65,
    metaDesbloqueoSucursal: 10000 // Ganancia acumulada o capital requerido para expandir
};

const NIVELES_PROGRESO = [
    {
        numero: 1,
        nombre: 'PUESTO DE BARRIO',
        metaGanancia: 0,
        siguienteMeta: 5000,
        proximoObjetivo: 'Alcanza $5,000 de ganancias acumuladas para subir a Nivel 2 (Negocio Local).'
    },
    {
        numero: 2,
        nombre: 'NEGOCIO LOCAL',
        metaGanancia: 5000,
        siguienteMeta: 20000,
        proximoObjetivo: 'Alcanza $20,000 de ganancias acumuladas para desbloquear una nueva sucursal y el Nivel 3.'
    },
    {
        numero: 3,
        nombre: 'NEGOCIO CONSOLIDADO',
        metaGanancia: 20000,
        siguienteMeta: 45000,
        proximoObjetivo: 'Alcanza $45,000 de ganancias acumuladas para consolidar tu Cadena de Tamales (Nivel 4).'
    },
    {
        numero: 4,
        nombre: 'CADENA DE TAMALES',
        metaGanancia: 45000,
        siguienteMeta: 80000,
        proximoObjetivo: 'Alcanza $80,000 de ganancias acumuladas para coronarte como el Imperio del Tamal (Nivel 5).'
    },
    {
        numero: 5,
        nombre: 'IMPERIO DEL TAMAL',
        metaGanancia: 80000,
        siguienteMeta: 150000,
        proximoObjetivo: '¡Has alcanzado el nivel máximo! Domina todas las zonas estratégicas de la CDMX.'
    }
];

const ZONAS_CDMX = [
    {
        id: 'polanco',
        nombre: 'Polanco / Reforma',
        alcaldia: 'Miguel Hidalgo',
        codigoPostal: '11560',
        demanda: 5,
        renta: 5,
        competencia: 4,
        flujoClientes: 5,
        clientesBase: 210,
        rentaDiaria: 650,
        costoApertura: 4500,
        elasticidadPrecio: 0.85, // Menos sensible a precios altos
        factorCompetencia: 0.92,
        horarioPico: '07:00 - 11:00 hrs (Oficinas y Corporativos)',
        descripcion: 'Zona corporativa y financiera con alto flujo matutino de oficinistas y excelente disposición de pago.',
        coordsMapa: { x: 245, y: 175 }
    },
    {
        id: 'coyoacan',
        nombre: 'Coyoacán',
        alcaldia: 'Coyoacán',
        codigoPostal: '04000',
        demanda: 4,
        renta: 3,
        competencia: 3,
        flujoClientes: 4,
        clientesBase: 165,
        rentaDiaria: 400,
        costoApertura: 4500,
        elasticidadPrecio: 1.0,
        factorCompetencia: 0.95,
        horarioPico: '08:00 - 12:00 y 18:00 - 22:00 hrs (Familiar y Turístico)',
        descripcion: 'Tradición bohemia y familiar. Renta moderada y fuerte consumo de tamales tradicionales y atoles.',
        coordsMapa: { x: 295, y: 340 }
    },
    {
        id: 'napoles',
        nombre: 'Nápoles',
        alcaldia: 'Benito Juárez',
        codigoPostal: '03810',
        demanda: 4,
        renta: 4,
        competencia: 3,
        flujoClientes: 4,
        clientesBase: 175,
        rentaDiaria: 500,
        costoApertura: 4500,
        elasticidadPrecio: 0.95,
        factorCompetencia: 0.94,
        horarioPico: '07:30 - 11:30 hrs (Mixto: WTC y Residencial)',
        descripcion: 'Equilibrio estratégico entre oficinas del corredor Insurgentes/WTC y edificios residenciales.',
        coordsMapa: { x: 265, y: 260 }
    },
    {
        id: 'centro',
        nombre: 'Centro Histórico',
        alcaldia: 'Cuauhtémoc',
        codigoPostal: '06000',
        demanda: 5,
        renta: 4,
        competencia: 5,
        flujoClientes: 5,
        clientesBase: 235,
        rentaDiaria: 520,
        costoApertura: 4500,
        elasticidadPrecio: 1.12, // Mayor volumen si el precio es competitivo
        factorCompetencia: 0.88,
        horarioPico: '06:30 - 13:00 hrs (Comercio y Tránsito Masivo)',
        descripcion: 'El corazón de la CDMX con tráfico peatonal masivo todo el día; alta demanda y competencia intensa.',
        coordsMapa: { x: 345, y: 190 }
    },
    {
        id: 'buenavista',
        nombre: 'Buenavista',
        alcaldia: 'Cuauhtémoc',
        codigoPostal: '06350',
        demanda: 4,
        renta: 3,
        competencia: 3,
        flujoClientes: 5,
        clientesBase: 185,
        rentaDiaria: 420,
        costoApertura: 4500,
        elasticidadPrecio: 1.05,
        factorCompetencia: 0.93,
        horarioPico: '06:00 - 10:30 hrs (Confluencia Metro, Metrobús y Suburbano)',
        descripcion: 'Punto neurálgico de transporte público con miles de usuarios buscando desayuno rápido cada mañana.',
        coordsMapa: { x: 315, y: 145 }
    }
];

const PRODUCTOS_BASE = [
    // Categoría TAMALES (Pág. 11 y 15 del reporte)
    {
        id: 'tamal-verde',
        categoria: 'TAMALES',
        nombre: 'Tamal Verde',
        descripcion: 'Tamal tradicional de salsa verde de tomate con carne de cerdo.',
        costo: 12.00,
        precio: 25.00,
        icono: '🫔',
        activo: true
    },
    {
        id: 'tamal-mole',
        categoria: 'TAMALES',
        nombre: 'Tamal de Mole',
        descripcion: 'Tamal acompañado de mole poblano artesanal y pollo deshebrado.',
        costo: 13.00,
        precio: 26.00,
        icono: '🍫',
        activo: true
    },
    {
        id: 'tamal-oaxaqueno',
        categoria: 'TAMALES',
        nombre: 'Tamal Oaxaqueño',
        descripcion: 'Envuelto en hoja de plátano con mole negro o salsa roja especial.',
        costo: 15.00,
        precio: 30.00,
        icono: '🌿',
        activo: true
    },
    {
        id: 'tamal-rajas',
        categoria: 'TAMALES',
        nombre: 'Tamal de Rajas',
        descripcion: 'Rajas de chile poblano con queso panela y jitomate.',
        costo: 12.00,
        precio: 25.00,
        icono: '🌶️',
        activo: true
    },
    {
        id: 'tamal-rojo',
        categoria: 'TAMALES',
        nombre: 'Tamal Rojo',
        descripcion: 'Tamal de salsa roja de guajillo con pollo.',
        costo: 12.00,
        precio: 28.00,
        icono: '🍅',
        activo: false
    },
    {
        id: 'tamal-dulce',
        categoria: 'TAMALES',
        nombre: 'Tamal de Chocolate',
        descripcion: 'Tamal dulce con sabor a chocolate tradicional.',
        costo: 13.00,
        precio: 30.00,
        icono: '🍓',
        activo: false
    },
    // Categoría BEBIDAS (Pág. 11 y 15 del reporte)
    {
        id: 'champurrado',
        categoria: 'BEBIDAS',
        nombre: 'Champurrado',
        descripcion: 'Bebida caliente de masa de maíz, chocolate de mesa y piloncillo.',
        costo: 9.00,
        precio: 22.00,
        icono: '☕',
        activo: true
    },
    {
        id: 'atole-vainilla',
        categoria: 'BEBIDAS',
        nombre: 'Atole de Vainilla',
        descripcion: 'Atole tradicional mexicano cremoso con esencia natural de vainilla.',
        costo: 8.00,
        precio: 20.00,
        icono: '🥛',
        activo: true
    },
    {
        id: 'cafe-olla',
        categoria: 'BEBIDAS',
        nombre: 'Café de Olla',
        descripcion: 'Café tradicional mexicano infusionado con canela y piloncillo.',
        costo: 7.00,
        precio: 20.00,
        icono: '🏺',
        activo: true
    }
];

// ============================================================================
// 2. CAPA DE DATOS Y PERSISTENCIA (JSON, CSV, XML)
// ============================================================================

function asegurarDirectorioDatos() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PARTIDAS_FILE)) {
        fs.writeFileSync(PARTIDAS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
    if (!fs.existsSync(HISTORIAL_CSV_FILE)) {
        fs.writeFileSync(
            HISTORIAL_CSV_FILE,
            'PartidaID,Fecha,Dia,Sucursal,Producto,Cantidad,PrecioUnitario,Total\n',
            'utf8'
        );
    }
}

function leerPartidas() {
    asegurarDirectorioDatos();
    try {
        const raw = fs.readFileSync(PARTIDAS_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Error leyendo partidas.json:', err.message);
        return [];
    }
}

function guardarPartidas(partidas) {
    asegurarDirectorioDatos();
    fs.writeFileSync(PARTIDAS_FILE, JSON.stringify(partidas, null, 2), 'utf8');
    sincronizarHistorialCSV(partidas);
}

function sincronizarHistorialCSV(partidas) {
    try {
        const encabezados = 'PartidaID,Fecha,Dia,Sucursal,Producto,Cantidad,PrecioUnitario,Total';
        const filas = [encabezados];
        for (const p of partidas) {
            const ventas = Array.isArray(p.registroVentas) ? p.registroVentas : [];
            for (const v of ventas) {
                const sucursalLimpia = String(v.sucursal || '').replace(/,/g, ' ');
                const prodLimpio = String(v.producto || '').replace(/,/g, ' ');
                filas.push(
                    `${p.id},${v.fecha || ''},${v.dia || 1},${sucursalLimpia},${prodLimpio},${v.cantidad || 0},${v.precioUnitario || 0},${v.total || 0}`
                );
            }
        }
        fs.writeFileSync(HISTORIAL_CSV_FILE, filas.join('\n') + '\n', 'utf8');
    } catch (err) {
        console.error('Error actualizando historial_ventas.csv:', err.message);
    }
}

function generarXMLPartida(partida, reporteComparativo) {
    const escapar = (str) =>
        String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

    const sucursalesXml = (partida.sucursales || [])
        .map(
            (s) => `
        <Sucursal id="${escapar(s.id)}" estado="${escapar(s.estado)}">
            <Nombre>${escapar(s.nombre)}</Nombre>
            <Colonia>${escapar(s.colonia)}</Colonia>
            <Alcaldia>${escapar(s.alcaldia)}</Alcaldia>
            <Ayudantes>${s.ayudantes}</Ayudantes>
            <VentasHoy>${s.ventasHoy}</VentasHoy>
            <CostosHoy>${s.costosHoy}</CostosHoy>
            <GananciaHoy>${s.gananciaHoy}</GananciaHoy>
            <GananciaAcumulada>${s.gananciaAcumulada}</GananciaAcumulada>
        </Sucursal>`
        )
        .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<ReportePartidaImperioDelTamal id="${escapar(partida.id)}" fecha="${new Date().toISOString()}">
    <Negocio>
        <Nombre>${escapar(partida.nombreNegocio)}</Nombre>
        <DiaActual>${partida.diaActual}</DiaActual>
        <DineroDisponible>${partida.dineroDisponible}</DineroDisponible>
        <GananciaAcumulada>${partida.gananciaAcumulada}</GananciaAcumulada>
        <Popularidad>${partida.popularidad}</Popularidad>
        <Nivel numero="${partida.nivel?.numero || 1}">${escapar(partida.nivel?.nombre || 'PUESTO DE BARRIO')}</Nivel>
    </Negocio>
    <ResumenFinancieroHoy>
        <IngresoTotal>${partida.resumenHoy?.ventasHoy || 0}</IngresoTotal>
        <CostosTotales>${partida.resumenHoy?.costosHoy || 0}</CostosTotales>
        <GananciaNeta>${partida.resumenHoy?.gananciaHoy || 0}</GananciaNeta>
    </ResumenFinancieroHoy>
    <Sucursales total="${(partida.sucursales || []).length}">${sucursalesXml}
    </Sucursales>
    <RecomendacionExpansion>${escapar(reporteComparativo?.recomendacionEstrategica || '')}</RecomendacionExpansion>
</ReportePartidaImperioDelTamal>`;
}

// ============================================================================
// 3. CAPA DE LÓGICA DE NEGOCIO Y MOTOR DE SIMULACIÓN (TEMA 3 Y TEMA 4)
// ============================================================================

function calcularNivelImperio(gananciaAcumulada, numSucursales) {
    const gananciaBase = Math.max(0, Number(gananciaAcumulada) || 0);
    let nivelActual = NIVELES_PROGRESO[0];

    for (const niv of NIVELES_PROGRESO) {
        if (gananciaBase >= niv.metaGanancia) {
            nivelActual = niv;
        }
    }

    const rango = Math.max(1, nivelActual.siguienteMeta - nivelActual.metaGanancia);
    const avance = Math.max(0, gananciaBase - nivelActual.metaGanancia);
    const progresoPorcentaje =
        nivelActual.numero === 5 ? 100 : Math.min(99, Math.max(8, Math.round((avance / rango) * 100)));

    return {
        numero: nivelActual.numero,
        nombre: nivelActual.nombre,
        progresoPorcentaje,
        proximoObjetivo: nivelActual.proximoObjetivo,
        desbloqueoSucursalActivo: gananciaBase >= PARAMETROS_NEGOCIO.metaDesbloqueoSucursal || numSucursales >= 2
    };
}

/**
 * Simula la operación de un día para una sucursal específica aplicando las fórmulas oficiales:
 *   Ingreso Total = Unidades Vendidas * Precio de Venta
 *   Costos Totales = Insumos + Sueldos + Renta por Zona
 *   Ganancia Neta = Ingreso Total - Costos Totales
 */
function simularOperacionSucursal(sucursal, menuActivos, diaNumero, determinista = false) {
    const zona = ZONAS_CDMX.find((z) => z.id === sucursal.zonaId) || ZONAS_CDMX[0];
    const productosActivos = (menuActivos || []).filter((p) => p.activo);

    if (productosActivos.length === 0) {
        const rentaHoy = zona.rentaDiaria;
        const sueldosHoy = (sucursal.ayudantes || 0) * PARAMETROS_NEGOCIO.sueldoDiarioAyudante;
        const costosHoy = rentaHoy + sueldosHoy;
        return {
            ventasHoy: 0,
            insumosHoy: 0,
            sueldosHoy,
            rentaHoy,
            costosHoy,
            gananciaHoy: -costosHoy,
            unidadesHoy: 0,
            popularidadEstrellas: Math.max(2, zona.demanda - 1),
            ventasPorProducto: []
        };
    }

    // Capacidad de atención según ayudantes contratados
    const ayudantes = Math.max(0, Number(sucursal.ayudantes) || 0);
    const capacidadMaxima =
        PARAMETROS_NEGOCIO.capacidadBaseSinAyudantes +
        ayudantes * PARAMETROS_NEGOCIO.capacidadExtraPorAyudante;

    // Precio promedio para evaluar elasticidad de la demanda en la colonia
    const precioPromedio =
        productosActivos.reduce((acc, p) => acc + Number(p.precio || 25), 0) / productosActivos.length;
    const precioReferencia = 24.5;
    const ratioPrecio = precioReferencia / Math.max(10, precioPromedio);
    const factorPrecio = Math.pow(ratioPrecio, zona.elasticidadPrecio || 1.0);

    // Variedad del menú (tamales + bebidas impulsa el ticket)
    const tieneTamales = productosActivos.some((p) => p.categoria === 'TAMALES');
    const tieneBebidas = productosActivos.some((p) => p.categoria === 'BEBIDAS');
    const factorVariedad = (tieneTamales && tieneBebidas ? 1.12 : 0.92) * Math.min(1.18, 0.85 + productosActivos.length * 0.05);

    // Pequeña variación diaria realista (o fija si es estimación previa)
    const factorClimaDia = determinista ? 1.0 : 0.94 + ((diaNumero * 7 + productosActivos.length * 3) % 15) * 0.01;

    const demandaPotencial = Math.round(
        zona.clientesBase * zona.factorCompetencia * factorPrecio * factorVariedad * factorClimaDia
    );

    const unidadesTotales = Math.max(25, Math.min(capacidadMaxima, demandaPotencial));

    // Distribuir las unidades vendidas entre los productos activos según su atractivo costo/precio
    let sumaPesos = 0;
    const pesos = productosActivos.map((prod) => {
        const margenRatio = Math.max(0.4, 32 / Math.max(12, Number(prod.precio)));
        const peso = prod.categoria === 'TAMALES' ? margenRatio * 1.25 : margenRatio * 0.95;
        sumaPesos += peso;
        return peso;
    });

    let ingresoTotal = 0;
    let costoInsumosTotal = 0;
    let unidadesAcumuladas = 0;
    const ventasPorProducto = [];

    productosActivos.forEach((prod, idx) => {
        const proporcion = pesos[idx] / (sumaPesos || 1);
        const cantidad =
            idx === productosActivos.length - 1
                ? Math.max(1, unidadesTotales - unidadesAcumuladas)
                : Math.max(1, Math.round(unidadesTotales * proporcion));

        unidadesAcumuladas += cantidad;
        const precioUnitario = Number(prod.precio);
        const costoUnitario = Number(prod.costo);
        const subtotalVenta = Math.round(cantidad * precioUnitario);
        const subtotalInsumo = Math.round(cantidad * costoUnitario);

        ingresoTotal += subtotalVenta;
        costoInsumosTotal += subtotalInsumo;

        ventasPorProducto.push({
            productoId: prod.id,
            producto: prod.nombre,
            categoria: prod.categoria,
            cantidad,
            precioUnitario,
            costoUnitario,
            total: subtotalVenta,
            costoInsumos: subtotalInsumo
        });
    });

    const sueldosHoy = ayudantes * PARAMETROS_NEGOCIO.sueldoDiarioAyudante;
    const rentaHoy = zona.rentaDiaria;
    const costosTotales = costoInsumosTotal + sueldosHoy + rentaHoy;
    const gananciaNeta = ingresoTotal - costosTotales;

    // Popularidad en estrellas (1 a 5) según relación calidad/precio y atención
    const estrellasCalculadas = Math.min(
        5,
        Math.max(2, Math.round((zona.demanda * 0.5) + (factorPrecio * 1.8) + (tieneBebidas ? 0.5 : 0)))
    );

    return {
        ventasHoy: ingresoTotal,
        insumosHoy: costoInsumosTotal,
        sueldosHoy,
        rentaHoy,
        costosHoy: costosTotales,
        gananciaHoy: gananciaNeta,
        unidadesHoy: unidadesAcumuladas,
        popularidadEstrellas: estrellasCalculadas,
        ventasPorProducto
    };
}

/**
 * Genera el Reporte Comparativo entre Zonas y Sucursales (Entregable Tema 4).
 */
function construirReporteComparativo(partida) {
    const sucursales = partida.sucursales || [];
    const menu = partida.menu || PRODUCTOS_BASE;

    // 1. Desempeño real de las sucursales activas de la partida
    const comparativaSucursales = sucursales.map((s) => {
        const zona = ZONAS_CDMX.find((z) => z.id === s.zonaId) || ZONAS_CDMX[0];
        const margenPorcentaje =
            s.ventasHoy > 0 ? Math.round((s.gananciaHoy / s.ventasHoy) * 100) : 0;
        const margenAcumulado =
            s.ventasAcumuladas > 0 ? Math.round((s.gananciaAcumulada / s.ventasAcumuladas) * 100) : 0;

        return {
            sucursalId: s.id,
            nombre: s.nombre,
            colonia: s.colonia,
            alcaldia: s.alcaldia,
            ayudantes: s.ayudantes,
            demandaZona: zona.demanda,
            rentaDiaria: s.rentaHoy ?? zona.rentaDiaria,
            insumosHoy: s.insumosHoy ?? Math.round(s.costosHoy * 0.6),
            sueldosHoy: s.sueldosHoy ?? s.ayudantes * PARAMETROS_NEGOCIO.sueldoDiarioAyudante,
            ventasHoy: s.ventasHoy,
            costosHoy: s.costosHoy,
            gananciaHoy: s.gananciaHoy,
            unidadesHoy: s.unidadesHoy || 0,
            ventasAcumuladas: s.ventasAcumuladas || s.ventasHoy,
            costosAcumulados: s.costosAcumulados || s.costosHoy,
            gananciaAcumulada: s.gananciaAcumulada || s.gananciaHoy,
            margenPorcentaje,
            margenAcumulado,
            popularidadEstrellas: s.popularidadEstrellas || 4
        };
    });

    // 2. Simulación comparativa de TODAS las zonas de CDMX con el menú actual del jugador
    const comparativaZonasCDMX = ZONAS_CDMX.map((zona) => {
        const tieneSucursal = sucursales.some((s) => s.zonaId === zona.id);
        const proyeccion = simularOperacionSucursal(
            { zonaId: zona.id, ayudantes: 1 },
            menu,
            partida.diaActual || 1,
            true
        );
        const roiDias =
            proyeccion.gananciaHoy > 0
                ? Math.ceil(zona.costoApertura / proyeccion.gananciaHoy)
                : 99;

        return {
            zonaId: zona.id,
            colonia: zona.nombre,
            alcaldia: zona.alcaldia,
            demandaEstrellas: zona.demanda,
            rentaEstrellas: zona.renta,
            competenciaEstrellas: zona.competencia,
            flujoEstrellas: zona.flujoClientes,
            rentaDiaria: zona.rentaDiaria,
            costoApertura: zona.costoApertura,
            ventasEstimadasDia: proyeccion.ventasHoy,
            costosEstimadosDia: proyeccion.costosHoy,
            gananciaEstimadaDia: proyeccion.gananciaHoy,
            unidadesEstimadasDia: proyeccion.unidadesHoy,
            retornoInversionDias: roiDias,
            ocupadaPorJugador: tieneSucursal,
            horarioPico: zona.horarioPico
        };
    });

    // 3. Determinar la mejor zona libre para recomendar en el Plan de Expansión
    const zonasDisponibles = comparativaZonasCDMX
        .filter((z) => !z.ocupadaPorJugador)
        .sort((a, b) => b.gananciaEstimadaDia - a.gananciaEstimadaDia);

    const mejorZonaLibre = zonasDisponibles[0] || comparativaZonasCDMX[0];
    const sucursalLider =
        [...comparativaSucursales].sort((a, b) => b.gananciaHoy - a.gananciaHoy)[0] || null;

    const recomendacionEstrategica = mejorZonaLibre
        ? `La colonia con mejor proyección para tu siguiente apertura es ${mejorZonaLibre.colonia} (${mejorZonaLibre.alcaldia}), con una ganancia neta estimada de $${mejorZonaLibre.gananciaEstimadaDia.toLocaleString('es-MX')}/día y recuperación de inversión en ${mejorZonaLibre.retornoInversionDias} días.`
        : 'Ya tienes presencia en todas las zonas estratégicas de la CDMX. Optimiza tus ayudantes y precios por temporada.';

    return {
        partidaId: partida.id,
        nombreNegocio: partida.nombreNegocio,
        diaActual: partida.diaActual,
        totalesImperio: {
            sucursalesActivas: sucursales.length,
            dineroDisponible: partida.dineroDisponible,
            gananciaAcumulada: partida.gananciaAcumulada,
            ventasDiariasTotales: sucursales.reduce((a, s) => a + (s.ventasHoy || 0), 0),
            costosDiariosTotales: sucursales.reduce((a, s) => a + (s.costosHoy || 0), 0),
            gananciaDiariaTotal: sucursales.reduce((a, s) => a + (s.gananciaHoy || 0), 0)
        },
        sucursalLider,
        mejorZonaExpansion: mejorZonaLibre,
        recomendacionEstrategica,
        comparativaSucursales,
        comparativaZonasCDMX
    };
}

// ============================================================================
// 4. SERVIDOR WEB Y ENRUTADOR API REST (PORT 3000)
// ============================================================================

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.csv': 'text/csv; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

function enviarJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data, null, 2));
}

function leerBodyJSON(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
            if (body.length > 2 * 1024 * 1024) {
                reject(new Error('Payload demasiado grande'));
            }
        });
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(new Error('JSON inválido en la petición'));
            }
        });
        req.on('error', reject);
    });
}

function formatearFechaHoy(diaSimulado = 1) {
    const base = new Date(2026, 9, 1); // 01/10/2026 inicio del semestre
    base.setDate(base.getDate() + (Number(diaSimulado) - 1));
    const d = String(base.getDate()).padStart(2, '0');
    const m = String(base.getMonth() + 1).padStart(2, '0');
    const y = base.getFullYear();
    return `${d}/${m}/${y}`;
}

async function manejarApiRest(req, res, pathname) {
    const metodo = req.method;

    if (metodo === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        return res.end();
    }

    // GET /api/catalogo -> Devuelve zonas de CDMX, menú base, niveles y parámetros
    if (metodo === 'GET' && pathname === '/api/catalogo') {
        return enviarJSON(res, 200, {
            ok: true,
            parametros: PARAMETROS_NEGOCIO,
            niveles: NIVELES_PROGRESO,
            zonas: ZONAS_CDMX,
            productosBase: PRODUCTOS_BASE
        });
    }

    // GET /api/catalogo/xml -> Sirve el archivo XML estructurado del catálogo
    if (metodo === 'GET' && pathname === '/api/catalogo/xml') {
        if (fs.existsSync(CATALOGO_XML_FILE)) {
            const xml = fs.readFileSync(CATALOGO_XML_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
            return res.end(xml);
        }
        return enviarJSON(res, 404, { ok: false, error: 'Archivo catalogo.xml no encontrado' });
    }

    // POST /api/simular-previa -> Calcula en servidor la proyección de ventas para menu.html
    if (metodo === 'POST' && pathname === '/api/simular-previa') {
        const body = await leerBodyJSON(req);
        const zonaId = body.zonaId || 'polanco';
        const ayudantes = Number(body.ayudantes ?? 1);
        const menu = Array.isArray(body.menu) ? body.menu : PRODUCTOS_BASE;
        const zona = ZONAS_CDMX.find((z) => z.id === zonaId) || ZONAS_CDMX[0];
        const resultado = simularOperacionSucursal({ zonaId: zona.id, ayudantes }, menu, 1, true);

        return enviarJSON(res, 200, {
            ok: true,
            zona: zona.nombre,
            inversionInicial: zona.costoApertura,
            estimacionDiaria: resultado
        });
    }

    // GET /api/partidas -> Lista todas las partidas guardadas
    if (metodo === 'GET' && pathname === '/api/partidas') {
        const partidas = leerPartidas();
        return enviarJSON(res, 200, {
            ok: true,
            total: partidas.length,
            partidas
        });
    }

    // POST /api/partidas -> Crea una nueva partida desde el flujo Ubicación -> Menú
    if (metodo === 'POST' && pathname === '/api/partidas') {
        const body = await leerBodyJSON(req);
        const nombreNegocio = String(body.nombreNegocio || '').trim();
        const zonaId = String(body.zonaId || 'polanco').trim();
        const menuConfigurado = Array.isArray(body.menu) && body.menu.length > 0 ? body.menu : PRODUCTOS_BASE;
        const ayudantesIniciales = Math.max(0, Number(body.ayudantesIniciales ?? 1));

        // Validaciones en el servidor
        if (nombreNegocio.length < 3) {
            return enviarJSON(res, 400, {
                ok: false,
                error: 'El nombre del negocio debe tener al menos 3 caracteres.'
            });
        }

        const productosActivos = menuConfigurado.filter((p) => p.activo);
        if (productosActivos.length === 0) {
            return enviarJSON(res, 400, {
                ok: false,
                error: 'Debes activar al menos un producto en el menú para iniciar el negocio.'
            });
        }

        const zona = ZONAS_CDMX.find((z) => z.id === zonaId) || ZONAS_CDMX[0];
        const simDia1 = simularOperacionSucursal(
            { zonaId: zona.id, ayudantes: ayudantesIniciales },
            menuConfigurado,
            1,
            false
        );

        const inversionInicial = zona.costoApertura || PARAMETROS_NEGOCIO.inversionPuestoInicial;
        const dineroInicialTrasApertura =
            PARAMETROS_NEGOCIO.capitalInicial - inversionInicial + simDia1.gananciaHoy;
        const gananciaAcumulada = Math.max(0, simDia1.gananciaHoy);

        const sucursalInicial = {
            id: `suc-${zona.id}-${Date.now().toString().slice(-4)}`,
            nombre: `Puesto ${zona.nombre}`,
            zonaId: zona.id,
            colonia: zona.nombre,
            alcaldia: zona.alcaldia,
            codigoPostal: zona.codigoPostal,
            direccion: body.direccion || `Calle Principal s/n, Col. ${zona.nombre}`,
            descripcion: body.descripcion || `Puesto fundador de ${nombreNegocio} en ${zona.nombre}.`,
            ayudantes: ayudantesIniciales,
            popularidadEstrellas: simDia1.popularidadEstrellas,
            estado: 'Activa',
            ventasHoy: simDia1.ventasHoy,
            insumosHoy: simDia1.insumosHoy,
            sueldosHoy: simDia1.sueldosHoy,
            rentaHoy: simDia1.rentaHoy,
            costosHoy: simDia1.costosHoy,
            gananciaHoy: simDia1.gananciaHoy,
            unidadesHoy: simDia1.unidadesHoy,
            ventasAcumuladas: simDia1.ventasHoy,
            costosAcumulados: simDia1.costosHoy,
            gananciaAcumulada: simDia1.gananciaHoy
        };

        const fechaStr = formatearFechaHoy(1);
        const registroVentas = simDia1.ventasPorProducto.map((vp, idx) => ({
            id: `v-${Date.now()}-${idx}`,
            fecha: fechaStr,
            dia: 1,
            sucursalId: sucursalInicial.id,
            sucursal: sucursalInicial.colonia,
            producto: vp.producto,
            cantidad: vp.cantidad,
            precioUnitario: vp.precioUnitario,
            total: vp.total
        }));

        const nuevaPartida = {
            id: `partida-${Date.now()}`,
            nombreNegocio,
            fechaCreacion: new Date().toISOString(),
            ultimaActualizacion: new Date().toISOString(),
            diaActual: 1,
            dineroDisponible: dineroInicialTrasApertura,
            gananciaAcumulada,
            popularidad: Math.min(98, Math.max(65, simDia1.popularidadEstrellas * 17)),
            nivel: calcularNivelImperio(gananciaAcumulada, 1),
            resumenHoy: {
                ventasHoy: simDia1.ventasHoy,
                costosHoy: simDia1.costosHoy,
                gananciaHoy: simDia1.gananciaHoy,
                unidadesVendidasHoy: simDia1.unidadesHoy
            },
            menu: menuConfigurado,
            sucursales: [sucursalInicial],
            historial7Dias: [
                {
                    dia: 1,
                    etiqueta: 'Día 1',
                    ventas: simDia1.ventasHoy,
                    costos: simDia1.costosHoy,
                    ganancia: simDia1.gananciaHoy,
                    unidades: simDia1.unidadesHoy
                }
            ],
            registroVentas
        };

        const partidas = leerPartidas();
        partidas.unshift(nuevaPartida);
        guardarPartidas(partidas);

        return enviarJSON(res, 201, {
            ok: true,
            mensaje: `¡Negocio "${nombreNegocio}" inaugurado con éxito en ${zona.nombre}!`,
            partida: nuevaPartida
        });
    }

    // Rutas con parámetro :id -> /api/partidas/:id...
    const matchPartida = pathname.match(/^\/api\/partidas\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
    if (matchPartida) {
        const partidaId = decodeURIComponent(matchPartida[1]);
        const subruta = matchPartida[2] || '';
        const parametroExtra = matchPartida[3] || '';

        const partidas = leerPartidas();
        const index = partidas.findIndex((p) => p.id === partidaId);

        if (index === -1) {
            return enviarJSON(res, 404, {
                ok: false,
                error: `No se encontró la partida con ID "${partidaId}".`
            });
        }

        const partida = partidas[index];

        // GET /api/partidas/:id
        if (metodo === 'GET' && !subruta) {
            return enviarJSON(res, 200, { ok: true, partida });
        }

        // PUT /api/partidas/:id -> Actualizar menú, precios o guardar estado general
        if (metodo === 'PUT' && !subruta) {
            const body = await leerBodyJSON(req);
            if (body.nombreNegocio) partida.nombreNegocio = String(body.nombreNegocio).trim();
            if (Array.isArray(body.menu)) {
                const activos = body.menu.filter((p) => p.activo);
                if (activos.length === 0) {
                    return enviarJSON(res, 400, {
                        ok: false,
                        error: 'El menú debe mantener al menos 1 producto activo.'
                    });
                }
                partida.menu = body.menu;
            }
            partida.ultimaActualizacion = new Date().toISOString();
            partidas[index] = partida;
            guardarPartidas(partidas);

            return enviarJSON(res, 200, {
                ok: true,
                mensaje: 'Partida guardada exitosamente en el servidor.',
                partida
            });
        }

        // DELETE /api/partidas/:id
        if (metodo === 'DELETE' && !subruta) {
            partidas.splice(index, 1);
            guardarPartidas(partidas);
            return enviarJSON(res, 200, {
                ok: true,
                mensaje: 'Partida eliminada correctamente.'
            });
        }

        // POST /api/partidas/:id/simular -> Simula el siguiente día en todas las sucursales
        if (metodo === 'POST' && subruta === 'simular') {
            const nuevoDia = (partida.diaActual || 1) + 1;
            const fechaStr = formatearFechaHoy(nuevoDia);

            let ventasDiaTotal = 0;
            let costosDiaTotal = 0;
            let gananciaDiaTotal = 0;
            let unidadesDiaTotal = 0;
            let sumaEstrellas = 0;
            const nuevasVentas = [];

            partida.sucursales = (partida.sucursales || []).map((suc) => {
                const sim = simularOperacionSucursal(suc, partida.menu, nuevoDia, false);
                ventasDiaTotal += sim.ventasHoy;
                costosDiaTotal += sim.costosHoy;
                gananciaDiaTotal += sim.gananciaHoy;
                unidadesDiaTotal += sim.unidadesHoy;
                sumaEstrellas += sim.popularidadEstrellas;

                sim.ventasPorProducto.forEach((vp, idx) => {
                    nuevasVentas.push({
                        id: `v-${nuevoDia}-${suc.id}-${idx}`,
                        fecha: fechaStr,
                        dia: nuevoDia,
                        sucursalId: suc.id,
                        sucursal: suc.colonia,
                        producto: vp.producto,
                        cantidad: vp.cantidad,
                        precioUnitario: vp.precioUnitario,
                        total: vp.total
                    });
                });

                return {
                    ...suc,
                    popularidadEstrellas: sim.popularidadEstrellas,
                    ventasHoy: sim.ventasHoy,
                    insumosHoy: sim.insumosHoy,
                    sueldosHoy: sim.sueldosHoy,
                    rentaHoy: sim.rentaHoy,
                    costosHoy: sim.costosHoy,
                    gananciaHoy: sim.gananciaHoy,
                    unidadesHoy: sim.unidadesHoy,
                    ventasAcumuladas: (suc.ventasAcumuladas || 0) + sim.ventasHoy,
                    costosAcumulados: (suc.costosAcumulados || 0) + sim.costosHoy,
                    gananciaAcumulada: (suc.gananciaAcumulada || 0) + sim.gananciaHoy
                };
            });

            partida.diaActual = nuevoDia;
            partida.dineroDisponible = Math.round((partida.dineroDisponible || 0) + gananciaDiaTotal);
            partida.gananciaAcumulada = Math.round(
                (partida.gananciaAcumulada || 0) + Math.max(0, gananciaDiaTotal)
            );

            const promEstrellas =
                partida.sucursales.length > 0 ? sumaEstrellas / partida.sucursales.length : 4;
            partida.popularidad = Math.min(99, Math.max(50, Math.round(promEstrellas * 18 + (nuevoDia % 5))));

            partida.resumenHoy = {
                ventasHoy: ventasDiaTotal,
                costosHoy: costosDiaTotal,
                gananciaHoy: gananciaDiaTotal,
                unidadesVendidasHoy: unidadesDiaTotal
            };

            partida.historial7Dias = Array.isArray(partida.historial7Dias) ? partida.historial7Dias : [];
            partida.historial7Dias.push({
                dia: nuevoDia,
                etiqueta: `Día ${nuevoDia}`,
                ventas: ventasDiaTotal,
                costos: costosDiaTotal,
                ganancia: gananciaDiaTotal,
                unidades: unidadesDiaTotal
            });
            if (partida.historial7Dias.length > 7) {
                partida.historial7Dias = partida.historial7Dias.slice(-7);
            }

            partida.registroVentas = [...nuevasVentas, ...(partida.registroVentas || [])].slice(0, 120);
            partida.nivel = calcularNivelImperio(partida.gananciaAcumulada, partida.sucursales.length);
            partida.ultimaActualizacion = new Date().toISOString();

            partidas[index] = partida;
            guardarPartidas(partidas);

            return enviarJSON(res, 200, {
                ok: true,
                mensaje: `Día ${nuevoDia} simulado: Ventas $${ventasDiaTotal.toLocaleString('es-MX')} | Ganancia Neta $${gananciaDiaTotal.toLocaleString('es-MX')}`,
                partida
            });
        }

        // POST /api/partidas/:id/sucursales -> Procesar apertura de nueva sucursal (Tema 4)
        if (metodo === 'POST' && subruta === 'sucursales') {
            const body = await leerBodyJSON(req);
            const nombreSucursal = String(body.nombre || '').trim();
            const zonaId = String(body.zonaId || '').trim();
            const direccion = String(body.direccion || '').trim();
            const descripcion = String(body.descripcion || '').trim();
            const ayudantes = Math.max(1, Number(body.ayudantes || 1));

            const zona = ZONAS_CDMX.find((z) => z.id === zonaId);
            if (!zona) {
                return enviarJSON(res, 400, {
                    ok: false,
                    error: 'Selecciona una colonia/zona válida de la CDMX.'
                });
            }
            if (nombreSucursal.length < 3) {
                return enviarJSON(res, 400, {
                    ok: false,
                    error: 'El nombre de la nueva sucursal debe tener al menos 3 caracteres.'
                });
            }

            const costoApertura = zona.costoApertura || PARAMETROS_NEGOCIO.inversionPuestoInicial;
            if ((partida.dineroDisponible || 0) < costoApertura) {
                return enviarJSON(res, 400, {
                    ok: false,
                    error: `Fondos insuficientes. Necesitas $${costoApertura.toLocaleString('es-MX')} disponibles para abrir en ${zona.nombre} y tienes $${(partida.dineroDisponible || 0).toLocaleString('es-MX')}.`
                });
            }

            const simInicial = simularOperacionSucursal(
                { zonaId: zona.id, ayudantes },
                partida.menu,
                partida.diaActual || 1,
                false
            );

            const nuevaSucursal = {
                id: `suc-${zona.id}-${Date.now().toString().slice(-4)}`,
                nombre: nombreSucursal,
                zonaId: zona.id,
                colonia: zona.nombre,
                alcaldia: body.alcaldia || zona.alcaldia,
                codigoPostal: body.codigoPostal || zona.codigoPostal,
                direccion: direccion || `Av. Principal, Col. ${zona.nombre}`,
                descripcion: descripcion || `Sucursal estratégica en ${zona.nombre}.`,
                ayudantes,
                popularidadEstrellas: simInicial.popularidadEstrellas,
                estado: 'Activa',
                ventasHoy: simInicial.ventasHoy,
                insumosHoy: simInicial.insumosHoy,
                sueldosHoy: simInicial.sueldosHoy,
                rentaHoy: simInicial.rentaHoy,
                costosHoy: simInicial.costosHoy,
                gananciaHoy: simInicial.gananciaHoy,
                unidadesHoy: simInicial.unidadesHoy,
                ventasAcumuladas: simInicial.ventasHoy,
                costosAcumulados: simInicial.costosHoy,
                gananciaAcumulada: simInicial.gananciaHoy
            };

            partida.dineroDisponible = Math.round(
                (partida.dineroDisponible || 0) - costoApertura + simInicial.gananciaHoy
            );
            partida.gananciaAcumulada = Math.round(
                (partida.gananciaAcumulada || 0) + Math.max(0, simInicial.gananciaHoy)
            );
            partida.sucursales.push(nuevaSucursal);

            // Recalcular totales de hoy
            partida.resumenHoy = {
                ventasHoy: partida.sucursales.reduce((a, s) => a + (s.ventasHoy || 0), 0),
                costosHoy: partida.sucursales.reduce((a, s) => a + (s.costosHoy || 0), 0),
                gananciaHoy: partida.sucursales.reduce((a, s) => a + (s.gananciaHoy || 0), 0),
                unidadesVendidasHoy: partida.sucursales.reduce((a, s) => a + (s.unidadesHoy || 0), 0)
            };

            if (Array.isArray(partida.historial7Dias) && partida.historial7Dias.length > 0) {
                const ultimo = partida.historial7Dias[partida.historial7Dias.length - 1];
                ultimo.ventas = partida.resumenHoy.ventasHoy;
                ultimo.costos = partida.resumenHoy.costosHoy;
                ultimo.ganancia = partida.resumenHoy.gananciaHoy;
                ultimo.unidades = partida.resumenHoy.unidadesVendidasHoy;
            }

            const fechaStr = formatearFechaHoy(partida.diaActual || 1);
            const ventasApertura = simInicial.ventasPorProducto.map((vp, idx) => ({
                id: `v-open-${Date.now()}-${idx}`,
                fecha: fechaStr,
                dia: partida.diaActual || 1,
                sucursalId: nuevaSucursal.id,
                sucursal: nuevaSucursal.colonia,
                producto: vp.producto,
                cantidad: vp.cantidad,
                precioUnitario: vp.precioUnitario,
                total: vp.total
            }));
            partida.registroVentas = [...ventasApertura, ...(partida.registroVentas || [])].slice(0, 120);
            partida.nivel = calcularNivelImperio(partida.gananciaAcumulada, partida.sucursales.length);
            partida.ultimaActualizacion = new Date().toISOString();

            partidas[index] = partida;
            guardarPartidas(partidas);

            return enviarJSON(res, 201, {
                ok: true,
                mensaje: `¡Nueva sucursal "${nombreSucursal}" abierta en ${zona.nombre}! Inversión: $${costoApertura.toLocaleString('es-MX')}.`,
                sucursal: nuevaSucursal,
                partida
            });
        }

        // POST /api/partidas/:id/ayudantes -> Contratar ayudante en una sucursal
        if (metodo === 'POST' && subruta === 'ayudantes') {
            const body = await leerBodyJSON(req);
            const sucursalId = body.sucursalId || (partida.sucursales[0] && partida.sucursales[0].id);
            const sucursal = (partida.sucursales || []).find((s) => s.id === sucursalId);

            if (!sucursal) {
                return enviarJSON(res, 404, { ok: false, error: 'Sucursal no encontrada.' });
            }

            if ((sucursal.ayudantes || 0) >= 6) {
                return enviarJSON(res, 400, {
                    ok: false,
                    error: `La sucursal ${sucursal.nombre} ya cuenta con el equipo máximo de 6 ayudantes.`
                });
            }

            const costoContratacion = PARAMETROS_NEGOCIO.costoContratacionAyudante;
            if ((partida.dineroDisponible || 0) < costoContratacion) {
                return enviarJSON(res, 400, {
                    ok: false,
                    error: `Necesitas $${costoContratacion} para contratar y capacitar a un nuevo ayudante.`
                });
            }

            sucursal.ayudantes = (sucursal.ayudantes || 0) + 1;
            partida.dineroDisponible -= costoContratacion;

            // Recalcular operación del día de esa sucursal con el nuevo ayudante
            const sim = simularOperacionSucursal(sucursal, partida.menu, partida.diaActual || 1, true);
            sucursal.ventasHoy = sim.ventasHoy;
            sucursal.insumosHoy = sim.insumosHoy;
            sucursal.sueldosHoy = sim.sueldosHoy;
            sucursal.rentaHoy = sim.rentaHoy;
            sucursal.costosHoy = sim.costosHoy;
            sucursal.gananciaHoy = sim.gananciaHoy;
            sucursal.unidadesHoy = sim.unidadesHoy;

            partida.resumenHoy = {
                ventasHoy: partida.sucursales.reduce((a, s) => a + (s.ventasHoy || 0), 0),
                costosHoy: partida.sucursales.reduce((a, s) => a + (s.costosHoy || 0), 0),
                gananciaHoy: partida.sucursales.reduce((a, s) => a + (s.gananciaHoy || 0), 0),
                unidadesVendidasHoy: partida.sucursales.reduce((a, s) => a + (s.unidadesHoy || 0), 0)
            };

            partida.ultimaActualizacion = new Date().toISOString();
            partidas[index] = partida;
            guardarPartidas(partidas);

            return enviarJSON(res, 200, {
                ok: true,
                mensaje: `¡Ayudante contratado en ${sucursal.nombre}! Ahora tiene ${sucursal.ayudantes} ayudante(s) y mayor capacidad de venta.`,
                partida
            });
        }

        // GET /api/partidas/:id/reportes -> Reporte comparativo entre zonas y sucursales (Tema 4)
        if (metodo === 'GET' && subruta === 'reportes') {
            const reporte = construirReporteComparativo(partida);
            return enviarJSON(res, 200, {
                ok: true,
                reporte
            });
        }

        // GET /api/partidas/:id/exportar/:formato -> Descarga en JSON, XML o CSV
        if (metodo === 'GET' && subruta === 'exportar') {
            const formato = (parametroExtra || 'json').toLowerCase();
            const reporte = construirReporteComparativo(partida);

            if (formato === 'xml') {
                const xml = generarXMLPartida(partida, reporte);
                res.writeHead(200, {
                    'Content-Type': 'application/xml; charset=utf-8',
                    'Content-Disposition': `attachment; filename="imperio-tamal-${partida.id}.xml"`
                });
                return res.end(xml);
            }

            if (formato === 'csv') {
                const lineas = [
                    'Sucursal,Colonia,Alcaldia,Ayudantes,VentasHoy,InsumosHoy,SueldosHoy,RentaZona,CostosTotalesHoy,GananciaNetaHoy,VentasAcumuladas,GananciaAcumulada'
                ];
                for (const s of reporte.comparativaSucursales) {
                    lineas.push(
                        `"${s.nombre}","${s.colonia}","${s.alcaldia}",${s.ayudantes},${s.ventasHoy},${s.insumosHoy},${s.sueldosHoy},${s.rentaDiaria},${s.costosHoy},${s.gananciaHoy},${s.ventasAcumuladas},${s.gananciaAcumulada}`
                    );
                }
                res.writeHead(200, {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="reporte-zonas-${partida.id}.csv"`
                });
                return res.end(lineas.join('\n'));
            }

            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Disposition': `attachment; filename="partida-${partida.id}.json"`
            });
            return res.end(JSON.stringify({ partida, reporteComparativo: reporte }, null, 2));
        }
    }

    return enviarJSON(res, 404, { ok: false, error: `Endpoint no encontrado: ${metodo} ${pathname}` });
}

function servirArchivoEstatico(req, res, pathname) {
    let rutaRelativa = pathname === '/' ? '/index.html' : pathname;
    rutaRelativa = path.normalize(rutaRelativa).replace(/^(\.\.[/\\])+/, '');
    const rutaAbsoluta = path.join(__dirname, rutaRelativa);

    if (!rutaAbsoluta.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Acceso denegado');
    }

    fs.stat(rutaAbsoluta, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Recurso no encontrado');
        }
        const ext = path.extname(rutaAbsoluta).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(rutaAbsoluta).pipe(res);
    });
}

const server = http.createServer(async (req, res) => {
    try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = parsedUrl.pathname;

        if (pathname.startsWith('/api/')) {
            await manejarApiRest(req, res, pathname);
        } else {
            servirArchivoEstatico(req, res, pathname);
        }
    } catch (err) {
        console.error('Error en servidor:', err);
        enviarJSON(res, 500, { ok: false, error: err.message || 'Error interno del servidor' });
    }
});

if (require.main === module) {
    asegurarDirectorioDatos();
    server.listen(PORT, () => {
        console.log('============================================================');
        console.log('🫔 IMPERIO DEL TAMAL - SERVIDOR WEB Y API REST ACTIVO');
        console.log(`🌐 URL Local:        http://localhost:${PORT}`);
        console.log(`📂 Persistencia:     JSON (data/partidas.json), XML (data/catalogo.xml) y CSV (data/historial_ventas.csv)`);
        console.log('============================================================');
    });
}

module.exports = { server, ZONAS_CDMX, PRODUCTOS_BASE, PARAMETROS_NEGOCIO };
