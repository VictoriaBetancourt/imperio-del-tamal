/**
 * IMPERIO DEL TAMAL - MÓDULO GLOBAL Y MOTOR CLIENTE (js/app.js)
 * Funciona conectado al servidor Node.js (API REST) y también en modo autónomo (GitHub Pages).
 */

const ImperioApp = (() => {
    const STORAGE_DRAFT_KEY = 'imperio_tamal_borrador';
    const STORAGE_PARTIDA_ID_KEY = 'imperio_tamal_partida_activa_id';
    const STORAGE_PARTIDAS_LOCAL = 'imperio_tamal_partidas_guardadas_v2';

    // Catálogo oficial de zonas de la CDMX (Pág. 10, 14-16 del reporte)
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
            elasticidadPrecio: 0.85,
            factorCompetencia: 0.92,
            horarioPico: '07:00 - 11:00 hrs (Oficinas y Corporativos)',
            descripcion: 'Zona corporativa y financiera con alto flujo matutino de oficinistas y excelente disposición de pago.'
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
            descripcion: 'Tradición bohemia y familiar. Renta moderada y fuerte consumo de tamales tradicionales y atoles.'
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
            descripcion: 'Equilibrio estratégico entre oficinas del corredor Insurgentes/WTC y edificios residenciales.'
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
            elasticidadPrecio: 1.12,
            factorCompetencia: 0.88,
            horarioPico: '06:30 - 13:00 hrs (Comercio y Tránsito Masivo)',
            descripcion: 'El corazón de la CDMX con tráfico peatonal masivo todo el día; alta demanda y competencia intensa.'
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
            descripcion: 'Punto neurálgico de transporte público con miles de usuarios buscando desayuno rápido cada mañana.'
        }
    ];

    // Catálogo oficial de productos (Pág. 11 y 15 del reporte)
    const PRODUCTOS_BASE = [
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

    const PARTIDAS_SEMILLA = [
        {
            id: 'partida-demo-1',
            nombreNegocio: 'Imperio del Tamal CDMX',
            diaActual: 7,
            dineroDisponible: 12450,
            gananciaAcumulada: 16000,
            popularidad: 85,
            nivel: {
                numero: 2,
                nombre: 'NEGOCIO LOCAL',
                progresoPorcentaje: 80,
                proximoObjetivo: 'Alcanza $20,000 de ganancias acumuladas para desbloquear el Nivel 3 (Negocio Consolidado) y expandir tu red.'
            },
            resumenHoy: {
                ventasHoy: 6300,
                costosHoy: 3350,
                gananciaHoy: 2950,
                unidadesVendidasHoy: 252
            },
            menu: JSON.parse(JSON.stringify(PRODUCTOS_BASE)),
            sucursales: [
                {
                    id: 'suc-polanco',
                    nombre: 'Sucursal Polanco',
                    zonaId: 'polanco',
                    colonia: 'Polanco / Reforma',
                    alcaldia: 'Miguel Hidalgo',
                    codigoPostal: '11560',
                    direccion: 'Av. Presidente Masaryk 142, Polanco',
                    ayudantes: 2,
                    popularidadEstrellas: 5,
                    estado: 'Activa',
                    ventasHoy: 3500,
                    insumosHoy: 1100,
                    sueldosHoy: 50,
                    rentaHoy: 650,
                    costosHoy: 1800,
                    gananciaHoy: 1700,
                    unidadesHoy: 140,
                    ventasAcumuladas: 23800,
                    costosAcumulados: 12600,
                    gananciaAcumulada: 11200
                },
                {
                    id: 'suc-coyoacan',
                    nombre: 'Sucursal Coyoacán',
                    zonaId: 'coyoacan',
                    colonia: 'Coyoacán',
                    alcaldia: 'Coyoacán',
                    codigoPostal: '04000',
                    direccion: 'Jardín Centenario 18, Villa Coyoacán',
                    ayudantes: 1,
                    popularidadEstrellas: 4,
                    estado: 'Activa',
                    ventasHoy: 2800,
                    insumosHoy: 800,
                    sueldosHoy: 350,
                    rentaHoy: 400,
                    costosHoy: 1550,
                    gananciaHoy: 1250,
                    unidadesHoy: 112,
                    ventasAcumuladas: 11400,
                    costosAcumulados: 6600,
                    gananciaAcumulada: 4800
                }
            ],
            historial7Dias: [
                { dia: 1, etiqueta: 'Día 1', ventas: 2900, costos: 1650, ganancia: 1250 },
                { dia: 2, etiqueta: 'Día 2', ventas: 3250, costos: 1720, ganancia: 1530 },
                { dia: 3, etiqueta: 'Día 3', ventas: 3400, costos: 1760, ganancia: 1640 },
                { dia: 4, etiqueta: 'Día 4', ventas: 4850, costos: 2750, ganancia: 2100 },
                { dia: 5, etiqueta: 'Día 5', ventas: 5400, costos: 2980, ganancia: 2420 },
                { dia: 6, etiqueta: 'Día 6', ventas: 5900, costos: 3190, ganancia: 2710 },
                { dia: 7, etiqueta: 'Día 7', ventas: 6300, costos: 3350, ganancia: 2950 }
            ],
            registroVentas: [
                { fecha: '06/11/2026', dia: 7, sucursalId: 'suc-polanco', sucursal: 'Polanco / Reforma', producto: 'Tamal Verde', cantidad: 48, precioUnitario: 25, total: 1200 },
                { fecha: '06/11/2026', dia: 7, sucursalId: 'suc-polanco', sucursal: 'Polanco / Reforma', producto: 'Tamal Oaxaqueño', cantidad: 35, precioUnitario: 30, total: 1050 },
                { fecha: '06/11/2026', dia: 7, sucursalId: 'suc-coyoacan', sucursal: 'Coyoacán', producto: 'Tamal de Mole', cantidad: 40, precioUnitario: 26, total: 1040 },
                { fecha: '06/11/2026', dia: 7, sucursalId: 'suc-coyoacan', sucursal: 'Coyoacán', producto: 'Atole de Vainilla', cantidad: 43, precioUnitario: 20, total: 860 }
            ]
        },
        {
            id: 'partida-demo-2',
            nombreNegocio: 'Cadena Tradicional Equipo 09',
            diaActual: 12,
            dineroDisponible: 28450,
            gananciaAcumulada: 21340,
            popularidad: 92,
            nivel: {
                numero: 3,
                nombre: 'NEGOCIO CONSOLIDADO',
                progresoPorcentaje: 65,
                proximoObjetivo: 'Alcanza $45,000 de ganancias acumuladas para llegar a Nivel 4 (Cadena de Tamales).'
            },
            resumenHoy: {
                ventasHoy: 9640,
                costosHoy: 5120,
                gananciaHoy: 4520,
                unidadesVendidasHoy: 385
            },
            menu: JSON.parse(JSON.stringify(PRODUCTOS_BASE)),
            sucursales: [
                {
                    id: 'suc-centro',
                    nombre: 'Centro Histórico',
                    zonaId: 'centro',
                    colonia: 'Centro Histórico',
                    alcaldia: 'Cuauhtémoc',
                    codigoPostal: '06000',
                    direccion: 'Av. Francisco I. Madero 54, Centro',
                    ayudantes: 2,
                    popularidadEstrellas: 5,
                    estado: 'Activa',
                    ventasHoy: 3950,
                    insumosHoy: 1380,
                    sueldosHoy: 700,
                    rentaHoy: 520,
                    costosHoy: 2600,
                    gananciaHoy: 1350,
                    unidadesHoy: 158,
                    ventasAcumuladas: 15800,
                    costosAcumulados: 8600,
                    gananciaAcumulada: 7200
                },
                {
                    id: 'suc-buenavista',
                    nombre: 'Buenavista',
                    zonaId: 'buenavista',
                    colonia: 'Buenavista',
                    alcaldia: 'Cuauhtémoc',
                    codigoPostal: '06350',
                    direccion: 'Eje 1 Norte Mosqueta s/n, Buenavista',
                    ayudantes: 2,
                    popularidadEstrellas: 4,
                    estado: 'Activa',
                    ventasHoy: 3120,
                    insumosHoy: 1050,
                    sueldosHoy: 350,
                    rentaHoy: 420,
                    costosHoy: 1820,
                    gananciaHoy: 1300,
                    unidadesHoy: 124,
                    ventasAcumuladas: 12450,
                    costosAcumulados: 6650,
                    gananciaAcumulada: 5800
                },
                {
                    id: 'suc-coyoacan-2',
                    nombre: 'Coyoacán',
                    zonaId: 'coyoacan',
                    colonia: 'Coyoacán',
                    alcaldia: 'Coyoacán',
                    codigoPostal: '04000',
                    direccion: 'Ignacio Allende 32, Del Carmen',
                    ayudantes: 1,
                    popularidadEstrellas: 4,
                    estado: 'Activa',
                    ventasHoy: 2570,
                    insumosHoy: 850,
                    sueldosHoy: 350,
                    rentaHoy: 400,
                    costosHoy: 1600,
                    gananciaHoy: 970,
                    unidadesHoy: 103,
                    ventasAcumuladas: 10270,
                    costosAcumulados: 5370,
                    gananciaAcumulada: 4900
                }
            ],
            historial7Dias: [
                { dia: 6, etiqueta: 'Día 6', ventas: 6800, costos: 3800, ganancia: 3000 },
                { dia: 7, etiqueta: 'Día 7', ventas: 7200, costos: 4020, ganancia: 3180 },
                { dia: 8, etiqueta: 'Día 8', ventas: 7900, costos: 4300, ganancia: 3600 },
                { dia: 9, etiqueta: 'Día 9', ventas: 8350, costos: 4510, ganancia: 3840 },
                { dia: 10, etiqueta: 'Día 10', ventas: 8800, costos: 4720, ganancia: 4080 },
                { dia: 11, etiqueta: 'Día 11', ventas: 9200, costos: 4900, ganancia: 4300 },
                { dia: 12, etiqueta: 'Día 12', ventas: 9640, costos: 5120, ganancia: 4520 }
            ],
            registroVentas: [
                { fecha: '01/10/2026', dia: 12, sucursalId: 'suc-centro', sucursal: 'Centro Histórico', producto: 'Tamal Verde', cantidad: 25, precioUnitario: 25, total: 625 },
                { fecha: '01/10/2026', dia: 12, sucursalId: 'suc-buenavista', sucursal: 'Buenavista', producto: 'Tamal Rojo', cantidad: 30, precioUnitario: 28, total: 840 },
                { fecha: '01/10/2026', dia: 12, sucursalId: 'suc-coyoacan-2', sucursal: 'Coyoacán', producto: 'Tamal de Mole', cantidad: 18, precioUnitario: 30, total: 540 }
            ]
        }
    ];

    function obtenerPartidasLocales() {
        try {
            const raw = localStorage.getItem(STORAGE_PARTIDAS_LOCAL);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn(e);
        }
        localStorage.setItem(STORAGE_PARTIDAS_LOCAL, JSON.stringify(PARTIDAS_SEMILLA));
        return JSON.parse(JSON.stringify(PARTIDAS_SEMILLA));
    }

    function guardarPartidasLocales(lista) {
        localStorage.setItem(STORAGE_PARTIDAS_LOCAL, JSON.stringify(lista));
    }

    function calcularNivelCliente(gananciaAcumulada) {
        const g = Math.max(0, Number(gananciaAcumulada) || 0);
        if (g >= 80000) {
            return { numero: 5, nombre: 'IMPERIO DEL TAMAL', progresoPorcentaje: 100, proximoObjetivo: '¡Nivel máximo alcanzado! Dominas la CDMX.' };
        }
        if (g >= 45000) {
            return { numero: 4, nombre: 'CADENA DE TAMALES', progresoPorcentaje: Math.min(99, Math.round(((g - 45000) / 35000) * 100)), proximoObjetivo: 'Alcanza $80,000 de ganancias acumuladas para el Nivel 5 (Imperio del Tamal).' };
        }
        if (g >= 20000) {
            return { numero: 3, nombre: 'NEGOCIO CONSOLIDADO', progresoPorcentaje: Math.min(99, Math.round(((g - 20000) / 25000) * 100)), proximoObjetivo: 'Alcanza $45,000 de ganancias acumuladas para el Nivel 4 (Cadena de Tamales).' };
        }
        if (g >= 5000) {
            return { numero: 2, nombre: 'NEGOCIO LOCAL', progresoPorcentaje: Math.min(99, Math.round(((g - 5000) / 15000) * 100)), proximoObjetivo: 'Alcanza $20,000 de ganancias acumuladas para desbloquear una nueva sucursal.' };
        }
        return { numero: 1, nombre: 'PUESTO DE BARRIO', progresoPorcentaje: Math.max(10, Math.round((g / 5000) * 100)), proximoObjetivo: 'Alcanza $5,000 de ganancias acumuladas para subir a Nivel 2 (Negocio Local).' };
    }

    function formatoMoneda(valor) {
        const num = Math.round(Number(valor) || 0);
        const signo = num < 0 ? '-' : '';
        return `${signo}$${Math.abs(num).toLocaleString('es-MX')}`;
    }

    function formatoEstrellas(cantidad, max = 5) {
        const llenas = Math.max(0, Math.min(max, Math.round(Number(cantidad) || 0)));
        return '★'.repeat(llenas) + '☆'.repeat(max - llenas);
    }

    function obtenerZonaPorId(zonaId) {
        return ZONAS_CDMX.find((z) => z.id === zonaId) || ZONAS_CDMX[0];
    }

    function calcularSimulacionCliente(zonaId, menu, ayudantes = 1) {
        const zona = obtenerZonaPorId(zonaId);
        const activos = (menu || []).filter((p) => p.activo);
        const sueldoPorAyudante = 350;
        const capacidadMaxima = 95 + Math.max(0, Number(ayudantes)) * 65;

        if (activos.length === 0) {
            const sueldos = Math.max(0, Number(ayudantes)) * sueldoPorAyudante;
            const costos = zona.rentaDiaria + sueldos;
            return {
                unidadesHoy: 0,
                ventasHoy: 0,
                insumosHoy: 0,
                sueldosHoy: sueldos,
                rentaHoy: zona.rentaDiaria,
                costosHoy: costos,
                gananciaHoy: -costos,
                inversionInicial: zona.costoApertura,
                ventasPorProducto: []
            };
        }

        const precioPromedio =
            activos.reduce((acc, p) => acc + Number(p.precio || 25), 0) / activos.length;
        const ratioPrecio = 24.5 / Math.max(10, precioPromedio);
        const factorPrecio = Math.pow(ratioPrecio, zona.elasticidadPrecio || 1.0);

        const tieneTamales = activos.some((p) => p.categoria === 'TAMALES');
        const tieneBebidas = activos.some((p) => p.categoria === 'BEBIDAS');
        const factorVariedad =
            (tieneTamales && tieneBebidas ? 1.12 : 0.92) * Math.min(1.18, 0.85 + activos.length * 0.05);

        const demandaPotencial = Math.round(
            zona.clientesBase * zona.factorCompetencia * factorPrecio * factorVariedad
        );
        const unidadesTotales = Math.max(25, Math.min(capacidadMaxima, demandaPotencial));

        let sumaPesos = 0;
        const pesos = activos.map((prod) => {
            const margenRatio = Math.max(0.4, 32 / Math.max(12, Number(prod.precio)));
            const peso = prod.categoria === 'TAMALES' ? margenRatio * 1.25 : margenRatio * 0.95;
            sumaPesos += peso;
            return peso;
        });

        let ingresoTotal = 0;
        let costoInsumosTotal = 0;
        let acum = 0;
        const ventasPorProducto = [];

        activos.forEach((prod, idx) => {
            const prop = pesos[idx] / (sumaPesos || 1);
            const cant =
                idx === activos.length - 1
                    ? Math.max(1, unidadesTotales - acum)
                    : Math.max(1, Math.round(unidadesTotales * prop));
            acum += cant;
            const subVenta = Math.round(cant * Number(prod.precio));
            const subCosto = Math.round(cant * Number(prod.costo));
            ingresoTotal += subVenta;
            costoInsumosTotal += subCosto;
            ventasPorProducto.push({
                producto: prod.nombre,
                cantidad: cant,
                precioUnitario: Number(prod.precio),
                total: subVenta
            });
        });

        const sueldosHoy = Math.max(0, Number(ayudantes)) * sueldoPorAyudante;
        const rentaHoy = zona.rentaDiaria;
        const costosTotales = costoInsumosTotal + sueldosHoy + rentaHoy;
        const gananciaNeta = ingresoTotal - costosTotales;

        return {
            unidadesHoy: acum,
            ventasHoy: ingresoTotal,
            insumosHoy: costoInsumosTotal,
            sueldosHoy,
            rentaHoy,
            costosHoy: costosTotales,
            gananciaHoy: gananciaNeta,
            inversionInicial: zona.costoApertura,
            ventasPorProducto
        };
    }

    function obtenerBorrador() {
        try {
            const raw = localStorage.getItem(STORAGE_DRAFT_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn(e);
        }
        return {
            nombreNegocio: 'Imperio del Tamal CDMX',
            zonaId: 'polanco',
            ayudantesIniciales: 1,
            menu: JSON.parse(JSON.stringify(PRODUCTOS_BASE))
        };
    }

    function guardarBorrador(parcial) {
        const actual = obtenerBorrador();
        const actualizado = { ...actual, ...parcial };
        localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(actualizado));
        return actualizado;
    }

    function obtenerPartidaActivaId() {
        return localStorage.getItem(STORAGE_PARTIDA_ID_KEY) || 'partida-demo-1';
    }

    function establecerPartidaActivaId(id) {
        localStorage.setItem(STORAGE_PARTIDA_ID_KEY, id);
    }

    async function apiFetch(ruta, opciones = {}) {
        const config = {
            headers: { 'Content-Type': 'application/json' },
            ...opciones
        };
        const bodyObj = config.body && typeof config.body === 'object' ? config.body : null;
        if (bodyObj) {
            config.body = JSON.stringify(bodyObj);
        }
        try {
            const resp = await fetch(ruta, config);
            const data = await resp.json();
            if (!resp.ok || data.ok === false) {
                throw new Error(data.error || `Error HTTP ${resp.status}`);
            }
            return data;
        } catch (err) {
            // Si estamos en GitHub Pages o sin servidor Node activo, procesamos en el motor local del navegador
            if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('Error HTTP 404') && !err.message.includes('NetworkError') && !err.message.includes('JSON')) {
                throw err;
            }
            return procesarEnMotorLocal(ruta, opciones.method || 'GET', bodyObj);
        }
    }

    function procesarEnMotorLocal(ruta, metodo, body) {
        const partidas = obtenerPartidasLocales();

        if (metodo === 'GET' && ruta === '/api/partidas') {
            return { ok: true, total: partidas.length, partidas };
        }

        if (metodo === 'POST' && ruta === '/api/partidas') {
            const zona = obtenerZonaPorId(body?.zonaId || 'polanco');
            const ayudantes = Number(body?.ayudantesIniciales ?? 1);
            const menu = body?.menu || JSON.parse(JSON.stringify(PRODUCTOS_BASE));
            const sim = calcularSimulacionCliente(zona.id, menu, ayudantes);
            const nueva = {
                id: `partida-${Date.now()}`,
                nombreNegocio: body?.nombreNegocio || 'Imperio del Tamal CDMX',
                diaActual: 1,
                dineroDisponible: 15000 - zona.costoApertura + sim.gananciaHoy,
                gananciaAcumulada: Math.max(0, sim.gananciaHoy),
                popularidad: 85,
                nivel: calcularNivelCliente(Math.max(0, sim.gananciaHoy)),
                resumenHoy: {
                    ventasHoy: sim.ventasHoy,
                    costosHoy: sim.costosHoy,
                    gananciaHoy: sim.gananciaHoy,
                    unidadesVendidasHoy: sim.unidadesHoy
                },
                menu,
                sucursales: [
                    {
                        id: `suc-${zona.id}-1`,
                        nombre: `Puesto ${zona.nombre}`,
                        zonaId: zona.id,
                        colonia: zona.nombre,
                        alcaldia: zona.alcaldia,
                        codigoPostal: zona.codigoPostal,
                        direccion: `Calle Principal, Col. ${zona.nombre}`,
                        ayudantes,
                        popularidadEstrellas: zona.demanda,
                        estado: 'Activa',
                        ventasHoy: sim.ventasHoy,
                        insumosHoy: sim.insumosHoy,
                        sueldosHoy: sim.sueldosHoy,
                        rentaHoy: sim.rentaHoy,
                        costosHoy: sim.costosHoy,
                        gananciaHoy: sim.gananciaHoy,
                        unidadesHoy: sim.unidadesHoy,
                        ventasAcumuladas: sim.ventasHoy,
                        costosAcumulados: sim.costosHoy,
                        gananciaAcumulada: sim.gananciaHoy
                    }
                ],
                historial7Dias: [
                    { dia: 1, etiqueta: 'Día 1', ventas: sim.ventasHoy, costos: sim.costosHoy, ganancia: sim.gananciaHoy }
                ],
                registroVentas: (sim.ventasPorProducto || []).map((vp) => ({
                    fecha: '06/11/2026',
                    dia: 1,
                    sucursal: zona.nombre,
                    producto: vp.producto,
                    cantidad: vp.cantidad,
                    precioUnitario: vp.precioUnitario,
                    total: vp.total
                }))
            };
            partidas.unshift(nueva);
            guardarPartidasLocales(partidas);
            return { ok: true, partida: nueva };
        }

        const match = ruta.match(/^\/api\/partidas\/([^/]+)(?:\/([^/]+))?$/);
        if (match) {
            const id = decodeURIComponent(match[1]);
            const sub = match[2] || '';
            const idx = partidas.findIndex((p) => p.id === id);
            const partida = idx >= 0 ? partidas[idx] : partidas[0];

            if (metodo === 'GET' && !sub) {
                return { ok: true, partida };
            }
            if (metodo === 'PUT' && !sub) {
                if (body?.nombreNegocio) partida.nombreNegocio = body.nombreNegocio;
                if (body?.menu) partida.menu = body.menu;
                guardarPartidasLocales(partidas);
                return { ok: true, partida };
            }
            if (metodo === 'POST' && sub === 'sucursales') {
                const zona = obtenerZonaPorId(body?.zonaId);
                if (partida.dineroDisponible < zona.costoApertura) {
                    throw new Error(`Fondos insuficientes: necesitas $${zona.costoApertura.toLocaleString('es-MX')} para abrir en ${zona.nombre}.`);
                }
                const ayudantes = Number(body?.ayudantes || 1);
                const sim = calcularSimulacionCliente(zona.id, partida.menu, ayudantes);
                const nuevaSuc = {
                    id: `suc-${zona.id}-${Date.now().toString().slice(-3)}`,
                    nombre: body.nombre,
                    zonaId: zona.id,
                    colonia: zona.nombre,
                    alcaldia: body.alcaldia || zona.alcaldia,
                    codigoPostal: body.codigoPostal || zona.codigoPostal,
                    direccion: body.direccion,
                    descripcion: body.descripcion,
                    ayudantes,
                    popularidadEstrellas: zona.demanda,
                    estado: 'Activa',
                    ventasHoy: sim.ventasHoy,
                    insumosHoy: sim.insumosHoy,
                    sueldosHoy: sim.sueldosHoy,
                    rentaHoy: sim.rentaHoy,
                    costosHoy: sim.costosHoy,
                    gananciaHoy: sim.gananciaHoy,
                    unidadesHoy: sim.unidadesHoy,
                    ventasAcumuladas: sim.ventasHoy,
                    costosAcumulados: sim.costosHoy,
                    gananciaAcumulada: sim.gananciaHoy
                };
                partida.dineroDisponible = partida.dineroDisponible - zona.costoApertura + sim.gananciaHoy;
                partida.gananciaAcumulada += Math.max(0, sim.gananciaHoy);
                partida.sucursales.push(nuevaSuc);
                partida.nivel = calcularNivelCliente(partida.gananciaAcumulada);
                guardarPartidasLocales(partidas);
                return { ok: true, mensaje: `¡Sucursal "${body.nombre}" abierta en ${zona.nombre}!`, partida };
            }
            if (metodo === 'POST' && sub === 'ayudantes') {
                const suc = partida.sucursales.find((s) => s.id === body?.sucursalId) || partida.sucursales[0];
                if (partida.dineroDisponible < 600) {
                    throw new Error('Necesitas $600 para contratar un ayudante.');
                }
                suc.ayudantes += 1;
                partida.dineroDisponible -= 600;
                const sim = calcularSimulacionCliente(suc.zonaId, partida.menu, suc.ayudantes);
                suc.ventasHoy = sim.ventasHoy;
                suc.costosHoy = sim.costosHoy;
                suc.gananciaHoy = sim.gananciaHoy;
                guardarPartidasLocales(partidas);
                return { ok: true, mensaje: `¡Ayudante contratado en ${suc.nombre}!`, partida };
            }
        }
        throw new Error('Ruta local no soportada');
    }

    function mostrarToast(mensaje, tipo = 'exito') {
        let contenedor = document.getElementById('toastContainer');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'toastContainer';
            contenedor.className = 'toast-container';
            document.body.appendChild(contenedor);
        }
        const item = document.createElement('div');
        item.className = `toast-msg ${tipo === 'error' ? 'error' : ''}`;
        item.textContent = mensaje;
        contenedor.appendChild(item);

        setTimeout(() => {
            item.remove();
        }, 3800);
    }

    function inicializarPantallaInicio() {
        const btnAbrir = document.getElementById('btnAbrirModalCargar');
        const btnCerrar = document.getElementById('btnCerrarModalCargar');
        const modal = document.getElementById('modalCargarPartida');
        const lista = document.getElementById('listaPartidasServidor');

        if (!btnAbrir || !modal) return;

        btnAbrir.addEventListener('click', async () => {
            modal.classList.add('abierto');
            lista.innerHTML = '<p>Consultando partidas guardadas...</p>';
            try {
                const res = await apiFetch('/api/partidas');
                const partidas = res.partidas || [];
                lista.innerHTML = partidas
                    .map(
                        (p) => `
                    <div class="partida-item">
                        <div>
                            <strong style="color: var(--verde-tamal); font-size: 1.05rem;">${p.nombreNegocio}</strong>
                            <div style="font-size: 0.84rem; color: var(--texto-secundario); margin-top: 3px;">
                                Día ${p.diaActual} • ${p.sucursales?.length || 1} sucursal(es) • Dinero: <strong>${formatoMoneda(p.dineroDisponible)}</strong> • ${p.nivel?.nombre || 'Nivel 1'}
                            </div>
                        </div>
                        <button type="button" class="btn btn-primary btn-sm" data-cargar-id="${p.id}">
                            Cargar →
                        </button>
                    </div>
                `
                    )
                    .join('');

                lista.querySelectorAll('[data-cargar-id]').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        const id = btn.getAttribute('data-cargar-id');
                        establecerPartidaActivaId(id);
                        window.location.href = 'dashboard.html';
                    });
                });
            } catch (err) {
                lista.innerHTML = '<p>Error al cargar partidas.</p>';
            }
        });

        btnCerrar?.addEventListener('click', () => {
            modal.classList.remove('abierto');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('abierto');
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        inicializarPantallaInicio();
    });

    return {
        ZONAS_CDMX,
        PRODUCTOS_BASE,
        formatoMoneda,
        formatoEstrellas,
        obtenerZonaPorId,
        calcularSimulacionCliente,
        obtenerBorrador,
        guardarBorrador,
        obtenerPartidaActivaId,
        establecerPartidaActivaId,
        apiFetch,
        mostrarToast
    };
})();
