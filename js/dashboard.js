/**
 * IMPERIO DEL TAMAL - CONTROLADOR DEL DASHBOARD Y GESTIÓN MULTISUCURSAL (js/dashboard.js)
 * Integra Tema 3 (Actualización dinámica del DOM, gráfica de 7 días, validaciones cliente)
 * y Tema 4 (Comunicación API REST con el servidor, apertura de sucursales y reportes comparativos).
 */

document.addEventListener('DOMContentLoaded', () => {
    let partidaActual = null;
    let reporteActual = null;

    // Referencias del DOM - Navegación Sidebar
    const botonesNav = document.querySelectorAll('.nav-item[data-vista]');
    const seccionesVista = document.querySelectorAll('.vista-seccion');

    // Referencias del DOM - Topbar y Progreso
    const headerNombreNegocio = document.getElementById('headerNombreNegocio');
    const headerDiaActual = document.getElementById('headerDiaActual');
    const topDineroDisponible = document.getElementById('topDineroDisponible');
    const topPopularidad = document.getElementById('topPopularidad');
    const topNumSucursales = document.getElementById('topNumSucursales');

    const progresoNivelNombre = document.getElementById('progresoNivelNombre');
    const progresoGananciaAcumulada = document.getElementById('progresoGananciaAcumulada');
    const progresoPorcentajeTexto = document.getElementById('progresoPorcentajeTexto');
    const progresoBarraFill = document.getElementById('progresoBarraFill');
    const progresoObjetivoTexto = document.getElementById('progresoObjetivoTexto');

    // Referencias del DOM - KPIs y Tablas Dashboard
    const kpiVentasHoy = document.getElementById('kpiVentasHoy');
    const kpiCostosHoy = document.getElementById('kpiCostosHoy');
    const kpiGananciaHoy = document.getElementById('kpiGananciaHoy');
    const kpiUnidadesHoy = document.getElementById('kpiUnidadesHoy');
    const contenedorGrafica7Dias = document.getElementById('contenedorGrafica7Dias');
    const tablaRendimientoSucursales = document.getElementById('tablaRendimientoSucursales');

    // Referencias del DOM - Otras Vistas
    const gridTarjetasSucursales = document.getElementById('gridTarjetasSucursales');
    const sucZonaSelect = document.getElementById('sucZonaSelect');
    const sucAlcaldia = document.getElementById('sucAlcaldia');
    const sucCodigoPostal = document.getElementById('sucCodigoPostal');
    const sucAyudantes = document.getElementById('sucAyudantes');
    const previewNuevaSucursal = document.getElementById('previewNuevaSucursal');
    const formNuevaSucursal = document.getElementById('formNuevaSucursal');
    const errorNuevaSucursal = document.getElementById('errorNuevaSucursal');

    const gridMenuDashboard = document.getElementById('gridMenuDashboard');
    const filtroVentasSucursal = document.getElementById('filtroVentasSucursal');
    const tablaHistorialVentas = document.getElementById('tablaHistorialVentas');

    const textoRecomendacionServidor = document.getElementById('textoRecomendacionServidor');
    const tablaReporteSucursales = document.getElementById('tablaReporteSucursales');
    const tablaReporteZonasCDMX = document.getElementById('tablaReporteZonasCDMX');

    const confNombreNegocio = document.getElementById('confNombreNegocio');
    const contenedorPartidasConfig = document.getElementById('contenedorPartidasConfig');

    // ========================================================================
    // 1. NAVEGACIÓN SPA DEL SIDEBAR
    // ========================================================================
    function cambiarVista(nombreVista) {
        botonesNav.forEach((btn) => {
            btn.classList.toggle('active', btn.getAttribute('data-vista') === nombreVista);
        });
        seccionesVista.forEach((sec) => {
            sec.classList.toggle('activa', sec.id === `vista-${nombreVista}`);
        });

        if (nombreVista === 'reportes') {
            cargarYRenderizarReportes();
        } else if (nombreVista === 'configuracion') {
            cargarListaPartidasServidor();
        }
    }

    botonesNav.forEach((btn) => {
        btn.addEventListener('click', () => {
            cambiarVista(btn.getAttribute('data-vista'));
        });
    });

    // ========================================================================
    // 2. CARGA DE LA PARTIDA DESDE EL SERVIDOR (O FALLBACK CLIENTE)
    // ========================================================================
    function crearPartidaRespaldoCliente() {
        const borrador = ImperioApp.obtenerBorrador();
        return {
            id: 'partida-demo-1',
            nombreNegocio: borrador.nombreNegocio || 'IMPERIO DEL TAMAL',
            diaActual: 7,
            dineroDisponible: 12450,
            gananciaAcumulada: 16000,
            popularidad: 85,
            nivel: {
                numero: 2,
                nombre: 'NEGOCIO LOCAL',
                progresoPorcentaje: 80,
                proximoObjetivo: 'Alcanza $20,000 de ganancias acumuladas para desbloquear una nueva sucursal.'
            },
            resumenHoy: {
                ventasHoy: 6300,
                costosHoy: 3350,
                gananciaHoy: 2950,
                unidadesVendidasHoy: 252
            },
            menu: borrador.menu || JSON.parse(JSON.stringify(ImperioApp.PRODUCTOS_BASE)),
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
                    direccion: 'Jardín Centenario 18, Coyoacán',
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
        };
    }

    async function inicializarDashboard() {
        const partidaId = ImperioApp.obtenerPartidaActivaId();
        try {
            const res = await ImperioApp.apiFetch(`/api/partidas/${encodeURIComponent(partidaId)}`);
            partidaActual = res.partida;
        } catch (err) {
            try {
                const lista = await ImperioApp.apiFetch('/api/partidas');
                if (lista.partidas && lista.partidas.length > 0) {
                    partidaActual = lista.partidas[0];
                    ImperioApp.establecerPartidaActivaId(partidaActual.id);
                } else {
                    partidaActual = crearPartidaRespaldoCliente();
                }
            } catch (e2) {
                partidaActual = crearPartidaRespaldoCliente();
            }
        }

        inicializarSelectorZonasSucursal();
        renderizarTodo();
    }

    // ========================================================================
    // 3. RENDERIZADO COMPLETO DEL TABLERO Y TODAS LAS VISTAS
    // ========================================================================
    function renderizarTodo() {
        if (!partidaActual) return;

        // Topbar
        if (headerNombreNegocio) headerNombreNegocio.textContent = partidaActual.nombreNegocio.toUpperCase();
        if (headerDiaActual) headerDiaActual.textContent = partidaActual.diaActual || 1;
        if (topDineroDisponible) topDineroDisponible.textContent = ImperioApp.formatoMoneda(partidaActual.dineroDisponible);
        if (topPopularidad) topPopularidad.textContent = `${partidaActual.popularidad || 85}%`;
        if (topNumSucursales) topNumSucursales.textContent = (partidaActual.sucursales || []).length;
        if (confNombreNegocio) confNombreNegocio.value = partidaActual.nombreNegocio;

        // Sistema de Progreso (Nivel 1 a 5)
        const niv = partidaActual.nivel || {
            numero: 2,
            nombre: 'NEGOCIO LOCAL',
            progresoPorcentaje: 80,
            proximoObjetivo: 'Alcanza $20,000 de ganancias acumuladas para desbloquear una nueva sucursal.'
        };
        if (progresoNivelNombre) progresoNivelNombre.textContent = `NIVEL ${niv.numero} — ${niv.nombre}`;
        if (progresoGananciaAcumulada) {
            progresoGananciaAcumulada.textContent = ImperioApp.formatoMoneda(partidaActual.gananciaAcumulada);
        }
        if (progresoPorcentajeTexto) progresoPorcentajeTexto.textContent = `${niv.progresoPorcentaje}%`;
        if (progresoBarraFill) progresoBarraFill.style.width = `${niv.progresoPorcentaje}%`;
        if (progresoObjetivoTexto) progresoObjetivoTexto.textContent = `Próximo objetivo: "${niv.proximoObjetivo}"`;

        // Tarjetas KPI principales
        const resHoy = partidaActual.resumenHoy || {
            ventasHoy: 3500,
            costosHoy: 1800,
            gananciaHoy: 1700,
            unidadesVendidasHoy: 140
        };
        if (kpiVentasHoy) kpiVentasHoy.textContent = ImperioApp.formatoMoneda(resHoy.ventasHoy);
        if (kpiCostosHoy) kpiCostosHoy.textContent = ImperioApp.formatoMoneda(resHoy.costosHoy);
        if (kpiGananciaHoy) {
            kpiGananciaHoy.textContent = ImperioApp.formatoMoneda(resHoy.gananciaHoy);
            kpiGananciaHoy.className = `kpi-value ${resHoy.gananciaHoy >= 0 ? 'positivo' : 'acento'}`;
        }
        if (kpiUnidadesHoy) kpiUnidadesHoy.textContent = (resHoy.unidadesVendidasHoy || 0).toLocaleString('es-MX');

        renderizarGrafica7Dias();
        renderizarTablaSucursalesDashboard();
        renderizarTarjetasSucursales();
        renderizarMenuDashboard();
        renderizarHistorialVentas();
    }

    // Gráfica SVG de Rendimiento de los Últimos 7 Días (Pág. 12 del reporte)
    function renderizarGrafica7Dias() {
        if (!contenedorGrafica7Dias) return;
        const historial = partidaActual.historial7Dias || [];
        if (historial.length === 0) {
            contenedorGrafica7Dias.innerHTML = '<p>Simula tu primer día para visualizar la gráfica.</p>';
            return;
        }

        const ancho = 560;
        const alto = 235;
        const padLeft = 54;
        const padRight = 24;
        const padTop = 22;
        const padBottom = 38;
        const areaAncho = ancho - padLeft - padRight;
        const areaAlto = alto - padTop - padBottom;

        const maxVal = Math.max(
            4000,
            ...historial.map((h) => Math.max(Number(h.ventas) || 0, Number(h.ganancia) || 0))
        );

        const anchoGrupo = areaAncho / historial.length;

        const lineasGuia = [0, 0.25, 0.5, 0.75, 1]
            .map((ratio) => {
                const y = padTop + areaAlto * (1 - ratio);
                const valorEje = Math.round(maxVal * ratio);
                return `
                <line x1="${padLeft}" y1="${y}" x2="${ancho - padRight}" y2="${y}" stroke="#E6DEC8" stroke-dasharray="4 3"/>
                <text x="${padLeft - 8}" y="${y + 4}" text-anchor="end" fill="#546E7A" font-size="10">$${(valorEje / 1000).toFixed(1)}k</text>
            `;
            })
            .join('');

        const barras = historial
            .map((item, idx) => {
                const xCentro = padLeft + idx * anchoGrupo + anchoGrupo / 2;
                const hVentas = Math.max(4, (Math.max(0, item.ventas) / maxVal) * areaAlto);
                const hGanancia = Math.max(4, (Math.max(0, item.ganancia) / maxVal) * areaAlto);
                const yVentas = padTop + areaAlto - hVentas;
                const yGanancia = padTop + areaAlto - hGanancia;

                return `
                <g>
                    <!-- Barra de Ventas -->
                    <rect x="${xCentro - 16}" y="${yVentas}" width="14" height="${hVentas}" rx="4" fill="#1E4D2B">
                        <title>${item.etiqueta}: Ventas ${ImperioApp.formatoMoneda(item.ventas)}</title>
                    </rect>
                    <!-- Barra de Ganancia -->
                    <rect x="${xCentro + 2}" y="${yGanancia}" width="14" height="${hGanancia}" rx="4" fill="#F4C430">
                        <title>${item.etiqueta}: Ganancia ${ImperioApp.formatoMoneda(item.ganancia)}</title>
                    </rect>
                    <text x="${xCentro}" y="${alto - 14}" text-anchor="middle" fill="#263238" font-size="11" font-weight="600">${item.etiqueta}</text>
                </g>
            `;
            })
            .join('');

        contenedorGrafica7Dias.innerHTML = `
            <svg viewBox="0 0 ${ancho} ${alto}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                ${lineasGuia}
                ${barras}
            </svg>
        `;
    }

    // Tabla Rendimiento por Sucursal en Dashboard (Pág. 12 del reporte)
    function renderizarTablaSucursalesDashboard() {
        if (!tablaRendimientoSucursales) return;
        const sucursales = partidaActual.sucursales || [];
        tablaRendimientoSucursales.innerHTML = sucursales
            .map(
                (s) => `
            <tr>
                <td>
                    <strong>${s.colonia}</strong>
                    <div style="font-size: 0.78rem; color: var(--texto-secundario);">${s.nombre} • ${s.ayudantes} ayudante(s)</div>
                </td>
                <td><strong>${ImperioApp.formatoMoneda(s.ventasHoy)}</strong></td>
                <td style="color: ${s.gananciaHoy >= 0 ? 'var(--verde-tamal)' : '#C62828'}; font-weight: 700;">
                    ${ImperioApp.formatoMoneda(s.gananciaHoy)}
                </td>
                <td>
                    <span class="estrellas-iconos" style="font-size: 1rem;">
                        ${ImperioApp.formatoEstrellas(s.popularidadEstrellas || 4)}
                    </span>
                </td>
            </tr>
        `
            )
            .join('');
    }

    // Tarjetas de la Vista "Sucursales" (Pág. 16 del reporte)
    function renderizarTarjetasSucursales() {
        if (!gridTarjetasSucursales) return;
        const sucursales = partidaActual.sucursales || [];
        gridTarjetasSucursales.innerHTML = sucursales
            .map(
                (s) => `
            <article class="sucursal-card">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div class="sucursal-icono-top">🏪</div>
                        <span class="badge-activa">${s.estado || 'Activa'}</span>
                    </div>
                    <h3 style="margin: 0 0 4px; color: var(--verde-tamal);">${s.nombre}</h3>
                    <p style="margin: 0 0 12px; font-size: 0.88rem; color: var(--texto-secundario);">
                        📍 ${s.colonia}, ${s.alcaldia || 'CDMX'} (${s.direccion || 'Ubicación principal'})
                    </p>

                    <div style="background: var(--fondo-claro); border-radius: 8px; padding: 12px; margin-bottom: 14px; font-size: 0.9rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span>💰 Ventas hoy:</span>
                            <strong>${ImperioApp.formatoMoneda(s.ventasHoy)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span>🧾 Costos hoy (Insumos + Sueldos + Renta):</span>
                            <strong>${ImperioApp.formatoMoneda(s.costosHoy)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span>📈 Ganancia neta hoy:</span>
                            <strong style="color: var(--verde-tamal);">${ImperioApp.formatoMoneda(s.gananciaHoy)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span>🏆 Ventas acumuladas:</span>
                            <strong>${ImperioApp.formatoMoneda(s.ventasAcumuladas || s.ventasHoy)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>👨‍🍳 Equipo actual:</span>
                            <strong>${s.ayudantes} ayudante(s)</strong>
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <span class="estrellas-iconos" title="Popularidad en la colonia">
                        ${ImperioApp.formatoEstrellas(s.popularidadEstrellas || 4)}
                    </span>
                    <button type="button" class="btn btn-verde btn-sm" data-contratar-suc="${s.id}">
                        + Contratar ayudante ($600)
                    </button>
                </div>
            </article>
        `
            )
            .join('');

        gridTarjetasSucursales.querySelectorAll('[data-contratar-suc]').forEach((btn) => {
            btn.addEventListener('click', () => {
                contratarAyudanteEnSucursal(btn.getAttribute('data-contratar-suc'));
            });
        });
    }

    // Vista "Menú" en el Dashboard (Pág. 15 del reporte)
    function renderizarMenuDashboard() {
        if (!gridMenuDashboard) return;
        const menu = partidaActual.menu || [];

        gridMenuDashboard.innerHTML = menu
            .map(
                (prod) => `
            <article class="producto-card ${prod.activo ? '' : 'inactivo'}">
                <div class="producto-banner">
                    <span>${prod.icono || '🫔'}</span>
                    <label class="producto-toggle-badge">
                        <input type="checkbox" data-dash-toggle="${prod.id}" ${prod.activo ? 'checked' : ''}>
                        <span>${prod.activo ? 'Activo' : 'Inactivo'}</span>
                    </label>
                </div>
                <div class="producto-body">
                    <div>
                        <h4>${prod.nombre}</h4>
                        <p class="producto-desc">${prod.descripcion || ''}</p>
                        <div class="producto-costos-row">
                            <span>Costo: <strong>$${Number(prod.costo).toFixed(2)}</strong></span>
                            <span>Categoría: <strong>${prod.categoria}</strong></span>
                        </div>
                    </div>
                    <div class="precio-selector-group">
                        <label>Precio ($):</label>
                        <input
                            type="number"
                            class="input-precio"
                            data-dash-precio="${prod.id}"
                            value="${Number(prod.precio)}"
                            min="${Number(prod.costo) + 1}"
                            max="120"
                        >
                    </div>
                </div>
            </article>
        `
            )
            .join('');

        gridMenuDashboard.querySelectorAll('[data-dash-toggle]').forEach((chk) => {
            chk.addEventListener('change', () => {
                const id = chk.getAttribute('data-dash-toggle');
                const prod = partidaActual.menu.find((p) => p.id === id);
                if (!prod) return;
                const activos = partidaActual.menu.filter((p) => p.activo);
                if (!chk.checked && activos.length <= 1) {
                    chk.checked = true;
                    ImperioApp.mostrarToast('Debe quedar al menos 1 producto activo en el menú.', 'error');
                    return;
                }
                prod.activo = chk.checked;
                renderizarMenuDashboard();
            });
        });

        gridMenuDashboard.querySelectorAll('[data-dash-precio]').forEach((inp) => {
            inp.addEventListener('change', () => {
                const id = inp.getAttribute('data-dash-precio');
                const prod = partidaActual.menu.find((p) => p.id === id);
                if (!prod) return;
                const min = Number(prod.costo) + 1;
                let nuevo = Number(inp.value);
                if (isNaN(nuevo) || nuevo < min) {
                    nuevo = min;
                    ImperioApp.mostrarToast(`El precio mínimo de ${prod.nombre} es $${min}.`, 'error');
                }
                prod.precio = nuevo;
                inp.value = nuevo;
            });
        });
    }

    // Vista "Ventas" con filtro por sucursal (Pág. 14 del reporte)
    function renderizarHistorialVentas() {
        if (!tablaHistorialVentas || !filtroVentasSucursal) return;

        const seleccionActual = filtroVentasSucursal.value || 'TODAS';
        const sucursales = partidaActual.sucursales || [];
        filtroVentasSucursal.innerHTML =
            '<option value="TODAS">Todas las sucursales</option>' +
            sucursales.map((s) => `<option value="${s.colonia}">${s.colonia} (${s.nombre})</option>`).join('');
        filtroVentasSucursal.value = seleccionActual;

        const todasLasVentas = partidaActual.registroVentas || [];
        const filtradas =
            seleccionActual === 'TODAS'
                ? todasLasVentas
                : todasLasVentas.filter((v) => v.sucursal === seleccionActual);

        if (filtradas.length === 0) {
            tablaHistorialVentas.innerHTML =
                '<tr><td colspan="7" style="text-align:center;">No hay registros de ventas para este filtro.</td></tr>';
        } else {
            tablaHistorialVentas.innerHTML = filtradas
                .map(
                    (v) => `
                <tr>
                    <td>${v.fecha || '06/11/2026'}</td>
                    <td>Día ${v.dia || 1}</td>
                    <td><strong>${v.sucursal}</strong></td>
                    <td>${v.producto}</td>
                    <td>${v.cantidad}</td>
                    <td>${ImperioApp.formatoMoneda(v.precioUnitario || 25)}</td>
                    <td><strong style="color: var(--verde-tamal);">${ImperioApp.formatoMoneda(v.total)}</strong></td>
                </tr>
            `
                )
                .join('');
        }

        const btnCsv = document.getElementById('btnDescargarVentasCSV');
        if (btnCsv && partidaActual.id) {
            btnCsv.href = `/api/partidas/${encodeURIComponent(partidaActual.id)}/exportar/csv`;
        }
    }

    filtroVentasSucursal?.addEventListener('change', renderizarHistorialVentas);

    // ========================================================================
    // 4. ACCIONES DEL JUGADOR CONECTADAS AL SERVIDOR (SIMULAR, AYUDANTES, SUCURSALES)
    // ========================================================================
    async function simularSiguienteDia() {
        try {
            const res = await ImperioApp.apiFetch(
                `/api/partidas/${encodeURIComponent(partidaActual.id)}/simular`,
                { method: 'POST' }
            );
            partidaActual = res.partida;
            renderizarTodo();
            ImperioApp.mostrarToast(res.mensaje || `Día ${partidaActual.diaActual} simulado con éxito.`);
        } catch (err) {
            // Respaldo cliente si no está corriendo el servidor
            const nuevoDia = (partidaActual.diaActual || 1) + 1;
            let ventasTot = 0;
            let costosTot = 0;
            let gananciaTot = 0;
            let udsTot = 0;

            partidaActual.sucursales.forEach((s) => {
                const sim = ImperioApp.calcularSimulacionCliente(s.zonaId, partidaActual.menu, s.ayudantes);
                s.ventasHoy = sim.ventasHoy;
                s.costosHoy = sim.costosHoy;
                s.gananciaHoy = sim.gananciaHoy;
                s.unidadesHoy = sim.unidadesHoy;
                s.ventasAcumuladas = (s.ventasAcumuladas || 0) + sim.ventasHoy;
                s.gananciaAcumulada = (s.gananciaAcumulada || 0) + sim.gananciaHoy;
                ventasTot += sim.ventasHoy;
                costosTot += sim.costosHoy;
                gananciaTot += sim.gananciaHoy;
                udsTot += sim.unidadesHoy;
            });

            partidaActual.diaActual = nuevoDia;
            partidaActual.dineroDisponible += gananciaTot;
            partidaActual.gananciaAcumulada += Math.max(0, gananciaTot);
            partidaActual.resumenHoy = {
                ventasHoy: ventasTot,
                costosHoy: costosTot,
                gananciaHoy: gananciaTot,
                unidadesVendidasHoy: udsTot
            };
            partidaActual.historial7Dias.push({
                dia: nuevoDia,
                etiqueta: `Día ${nuevoDia}`,
                ventas: ventasTot,
                costos: costosTot,
                ganancia: gananciaTot
            });
            if (partidaActual.historial7Dias.length > 7) {
                partidaActual.historial7Dias = partidaActual.historial7Dias.slice(-7);
            }
            renderizarTodo();
            ImperioApp.mostrarToast(`Día ${nuevoDia} simulado: Ganancia ${ImperioApp.formatoMoneda(gananciaTot)}`);
        }
    }

    async function contratarAyudanteEnSucursal(sucursalId) {
        const targetId = sucursalId || (partidaActual.sucursales[0] && partidaActual.sucursales[0].id);
        try {
            const res = await ImperioApp.apiFetch(
                `/api/partidas/${encodeURIComponent(partidaActual.id)}/ayudantes`,
                {
                    method: 'POST',
                    body: { sucursalId: targetId }
                }
            );
            partidaActual = res.partida;
            renderizarTodo();
            ImperioApp.mostrarToast(res.mensaje);
        } catch (err) {
            ImperioApp.mostrarToast(err.message || 'No se pudo contratar ayudante.', 'error');
        }
    }

    async function guardarPartidaEnServidor() {
        try {
            const res = await ImperioApp.apiFetch(`/api/partidas/${encodeURIComponent(partidaActual.id)}`, {
                method: 'PUT',
                body: {
                    nombreNegocio: partidaActual.nombreNegocio,
                    menu: partidaActual.menu
                }
            });
            partidaActual = res.partida;
            renderizarTodo();
            ImperioApp.mostrarToast('💾 Partida y configuración guardadas en el servidor (data/partidas.json).');
        } catch (err) {
            ImperioApp.mostrarToast(err.message || 'Error al guardar en el servidor.', 'error');
        }
    }

    // ========================================================================
    // 5. APERTURA DE NUEVAS SUCURSALES (FORMULARIO PÁG. 15)
    // ========================================================================
    function inicializarSelectorZonasSucursal() {
        if (!sucZonaSelect) return;
        sucZonaSelect.innerHTML = ImperioApp.ZONAS_CDMX.map(
            (z) => `<option value="${z.id}">${z.nombre} (Alcaldía ${z.alcaldia})</option>`
        ).join('');

        const actualizarCamposZona = () => {
            const zona = ImperioApp.obtenerZonaPorId(sucZonaSelect.value);
            const ayudantes = Number(sucAyudantes?.value || 1);
            if (sucAlcaldia) sucAlcaldia.value = zona.alcaldia;
            if (sucCodigoPostal) sucCodigoPostal.value = zona.codigoPostal;

            const proy = ImperioApp.calcularSimulacionCliente(
                zona.id,
                partidaActual?.menu || ImperioApp.PRODUCTOS_BASE,
                ayudantes
            );
            if (previewNuevaSucursal) {
                previewNuevaSucursal.innerHTML = `
                    <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                        <span><strong>Costo de Apertura:</strong> ${ImperioApp.formatoMoneda(zona.costoApertura)}</span>
                        <span><strong>Renta Diaria:</strong> ${ImperioApp.formatoMoneda(zona.rentaDiaria)}/día</span>
                        <span><strong>Demanda Zona:</strong> <span style="color:var(--amarillo-maiz);">${ImperioApp.formatoEstrellas(zona.demanda)}</span></span>
                        <span><strong>Ganancia Estimada:</strong> <strong style="color:var(--verde-tamal);">${ImperioApp.formatoMoneda(proy.gananciaHoy)}/día</strong></span>
                    </div>
                `;
            }
        };

        sucZonaSelect.addEventListener('change', actualizarCamposZona);
        sucAyudantes?.addEventListener('change', actualizarCamposZona);
        actualizarCamposZona();
    }

    formNuevaSucursal?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('sucNombre')?.value.trim() || '';
        const zonaId = sucZonaSelect?.value || 'centro';
        const alcaldia = sucAlcaldia?.value || '';
        const codigoPostal = sucCodigoPostal?.value || '';
        const direccion = document.getElementById('sucDireccion')?.value.trim() || '';
        const descripcion = document.getElementById('sucDescripcion')?.value.trim() || '';
        const ayudantes = Number(sucAyudantes?.value || 1);

        if (nombre.length < 3 || direccion.length < 4) {
            if (errorNuevaSucursal) {
                errorNuevaSucursal.textContent =
                    'Por favor ingresa el nombre de la sucursal (mín. 3 letras) y su dirección en la CDMX.';
                errorNuevaSucursal.style.display = 'block';
            }
            return;
        }
        if (errorNuevaSucursal) errorNuevaSucursal.style.display = 'none';

        try {
            const res = await ImperioApp.apiFetch(
                `/api/partidas/${encodeURIComponent(partidaActual.id)}/sucursales`,
                {
                    method: 'POST',
                    body: { nombre, zonaId, alcaldia, codigoPostal, direccion, descripcion, ayudantes }
                }
            );
            partidaActual = res.partida;
            formNuevaSucursal.reset();
            inicializarSelectorZonasSucursal();
            renderizarTodo();
            cambiarVista('sucursales');
            ImperioApp.mostrarToast(res.mensaje);
        } catch (err) {
            if (errorNuevaSucursal) {
                errorNuevaSucursal.textContent = err.message;
                errorNuevaSucursal.style.display = 'block';
            }
            ImperioApp.mostrarToast(err.message, 'error');
        }
    });

    // ========================================================================
    // 6. REPORTES COMPARATIVOS ENTRE ZONAS (TEMA 4)
    // ========================================================================
    async function cargarYRenderizarReportes() {
        if (!partidaActual) return;
        try {
            const res = await ImperioApp.apiFetch(
                `/api/partidas/${encodeURIComponent(partidaActual.id)}/reportes`
            );
            reporteActual = res.reporte;
        } catch (err) {
            // Si está en modo offline, construimos la comparativa localmente
            reporteActual = {
                recomendacionEstrategica:
                    'Con base en tu menú actual, Centro Histórico y Polanco ofrecen el mayor volumen de ventas matutinas.',
                comparativaSucursales: (partidaActual.sucursales || []).map((s) => ({
                    nombre: s.nombre,
                    colonia: s.colonia,
                    alcaldia: s.alcaldia || 'CDMX',
                    ayudantes: s.ayudantes,
                    ventasHoy: s.ventasHoy,
                    insumosHoy: s.insumosHoy || Math.round(s.costosHoy * 0.6),
                    sueldosHoy: s.sueldosHoy || s.ayudantes * 350,
                    rentaDiaria: s.rentaHoy || 500,
                    gananciaHoy: s.gananciaHoy,
                    margenPorcentaje: s.ventasHoy > 0 ? Math.round((s.gananciaHoy / s.ventasHoy) * 100) : 0,
                    gananciaAcumulada: s.gananciaAcumulada || s.gananciaHoy
                })),
                comparativaZonasCDMX: ImperioApp.ZONAS_CDMX.map((z) => {
                    const sim = ImperioApp.calcularSimulacionCliente(z.id, partidaActual.menu, 1);
                    return {
                        colonia: z.nombre,
                        alcaldia: z.alcaldia,
                        demandaEstrellas: z.demanda,
                        rentaDiaria: z.rentaDiaria,
                        costoApertura: z.costoApertura,
                        ventasEstimadasDia: sim.ventasHoy,
                        gananciaEstimadaDia: sim.gananciaHoy,
                        retornoInversionDias: Math.max(1, Math.ceil(z.costoApertura / Math.max(1, sim.gananciaHoy))),
                        ocupadaPorJugador: (partidaActual.sucursales || []).some((s) => s.zonaId === z.id)
                    };
                })
            };
        }

        if (textoRecomendacionServidor) {
            textoRecomendacionServidor.textContent = reporteActual.recomendacionEstrategica;
        }

        if (tablaReporteSucursales) {
            tablaReporteSucursales.innerHTML = (reporteActual.comparativaSucursales || [])
                .map(
                    (s) => `
                <tr>
                    <td><strong>${s.nombre}</strong></td>
                    <td>${s.colonia} <span style="color:var(--texto-secundario);">(${s.alcaldia})</span></td>
                    <td>${s.ayudantes}</td>
                    <td><strong>${ImperioApp.formatoMoneda(s.ventasHoy)}</strong></td>
                    <td>${ImperioApp.formatoMoneda(s.insumosHoy)}</td>
                    <td>${ImperioApp.formatoMoneda(s.sueldosHoy)}</td>
                    <td>${ImperioApp.formatoMoneda(s.rentaDiaria)}</td>
                    <td style="color:var(--verde-tamal); font-weight:700;">${ImperioApp.formatoMoneda(s.gananciaHoy)}</td>
                    <td><span class="badge-activa">${s.margenPorcentaje}%</span></td>
                    <td><strong>${ImperioApp.formatoMoneda(s.gananciaAcumulada)}</strong></td>
                </tr>
            `
                )
                .join('');
        }

        if (tablaReporteZonasCDMX) {
            tablaReporteZonasCDMX.innerHTML = (reporteActual.comparativaZonasCDMX || [])
                .map(
                    (z) => `
                <tr>
                    <td><strong>${z.colonia}</strong></td>
                    <td>${z.alcaldia}</td>
                    <td><span class="estrellas-iconos" style="font-size:0.95rem;">${ImperioApp.formatoEstrellas(z.demandaEstrellas)}</span></td>
                    <td>${ImperioApp.formatoMoneda(z.rentaDiaria)}/día</td>
                    <td>${ImperioApp.formatoMoneda(z.costoApertura)}</td>
                    <td>${ImperioApp.formatoMoneda(z.ventasEstimadasDia)}/día</td>
                    <td style="color:var(--verde-tamal); font-weight:700;">${ImperioApp.formatoMoneda(z.gananciaEstimadaDia)}/día</td>
                    <td><strong>~${z.retornoInversionDias} días</strong></td>
                    <td>
                        ${
                            z.ocupadaPorJugador
                                ? '<span class="badge-activa">Con Sucursal Activa</span>'
                                : '<span style="color:var(--naranja-terracota); font-weight:700;">Disponible para Expansión</span>'
                        }
                    </td>
                </tr>
            `
                )
                .join('');
        }
    }

    // Exportación de archivos estructurados desde el servidor (JSON, XML, CSV)
    function exportarFormato(formato) {
        if (!partidaActual?.id) return;
        window.open(`/api/partidas/${encodeURIComponent(partidaActual.id)}/exportar/${formato}`, '_blank');
    }

    document.getElementById('btnExportarJSON')?.addEventListener('click', () => exportarFormato('json'));
    document.getElementById('btnExportarXML')?.addEventListener('click', () => exportarFormato('xml'));
    document.getElementById('btnExportarCSV')?.addEventListener('click', () => exportarFormato('csv'));

    // ========================================================================
    // 7. GESTIÓN DE PARTIDAS EN LA VISTA DE CONFIGURACIÓN
    // ========================================================================
    async function cargarListaPartidasServidor() {
        if (!contenedorPartidasConfig) return;
        try {
            const res = await ImperioApp.apiFetch('/api/partidas');
            const partidas = res.partidas || [];
            contenedorPartidasConfig.innerHTML = partidas
                .map(
                    (p) => `
                <div class="partida-item">
                    <div>
                        <strong style="color:var(--verde-tamal);">${p.nombreNegocio}</strong>
                        ${p.id === partidaActual.id ? '<span class="badge-activa" style="margin-left:6px;">Activa</span>' : ''}
                        <div style="font-size:0.82rem; color:var(--texto-secundario);">
                            Día ${p.diaActual} • ${p.sucursales?.length || 1} sucursal(es) • Dinero: ${ImperioApp.formatoMoneda(p.dineroDisponible)}
                        </div>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button type="button" class="btn btn-primary btn-sm" data-switch-partida="${p.id}">Cargar</button>
                    </div>
                </div>
            `
                )
                .join('');

            contenedorPartidasConfig.querySelectorAll('[data-switch-partida]').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-switch-partida');
                    ImperioApp.establecerPartidaActivaId(id);
                    await inicializarDashboard();
                    cambiarVista('dashboard');
                    ImperioApp.mostrarToast('Partida cargada desde el servidor.');
                });
            });
        } catch (err) {
            contenedorPartidasConfig.innerHTML = '<p>Inicia el servidor con <code>npm start</code> para listar las partidas.</p>';
        }
    }

    // ========================================================================
    // 8. CONEXIÓN DE BOTONES DE ACCIÓN Y MODALES
    // ========================================================================
    document.getElementById('btnTopSimularDia')?.addEventListener('click', simularSiguienteDia);
    document.getElementById('btnAccionSimularDia')?.addEventListener('click', simularSiguienteDia);
    document.getElementById('btnAccionContratarAyudante')?.addEventListener('click', () =>
        contratarAyudanteEnSucursal()
    );
    document.getElementById('btnAccionAbrirSucursal')?.addEventListener('click', () =>
        cambiarVista('crear-sucursal')
    );
    document.getElementById('btnIrNuevaSucursal')?.addEventListener('click', () =>
        cambiarVista('crear-sucursal')
    );
    document.getElementById('btnCancelarSucursal')?.addEventListener('click', () =>
        cambiarVista('sucursales')
    );
    document.getElementById('btnAccionModificarMenu')?.addEventListener('click', () =>
        cambiarVista('menu')
    );
    document.getElementById('btnAccionVerReportes')?.addEventListener('click', () =>
        cambiarVista('reportes')
    );
    document.getElementById('btnAccionGuardarPartida')?.addEventListener('click', guardarPartidaEnServidor);
    document.getElementById('btnGuardarCambiosMenu')?.addEventListener('click', guardarPartidaEnServidor);

    document.getElementById('btnGuardarConfigNegocio')?.addEventListener('click', () => {
        if (confNombreNegocio && confNombreNegocio.value.trim().length >= 3) {
            partidaActual.nombreNegocio = confNombreNegocio.value.trim();
            guardarPartidaEnServidor();
        } else {
            ImperioApp.mostrarToast('El nombre del negocio debe tener al menos 3 caracteres.', 'error');
        }
    });

    // Modal para agregar nuevo producto personalizado al menú
    const modalNuevoProducto = document.getElementById('modalNuevoProducto');
    const formNuevoProducto = document.getElementById('formNuevoProducto');
    document.getElementById('btnAbrirModalProducto')?.addEventListener('click', () => {
        modalNuevoProducto?.classList.add('abierto');
    });
    document.getElementById('btnCerrarModalProducto')?.addEventListener('click', () => {
        modalNuevoProducto?.classList.remove('abierto');
    });

    formNuevoProducto?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nuevoProdNombre')?.value.trim();
        const categoria = document.getElementById('nuevoProdCategoria')?.value || 'TAMALES';
        const icono = document.getElementById('nuevoProdIcono')?.value || '🫔';
        const costo = Number(document.getElementById('nuevoProdCosto')?.value || 12);
        const precio = Number(document.getElementById('nuevoProdPrecio')?.value || 25);
        const descripcion = document.getElementById('nuevoProdDesc')?.value.trim() || 'Especialidad de la casa.';

        if (!nombre || precio <= costo) {
            ImperioApp.mostrarToast('El precio de venta debe ser mayor al costo unitario.', 'error');
            return;
        }

        partidaActual.menu.push({
            id: `prod-${Date.now()}`,
            categoria,
            nombre,
            descripcion,
            costo,
            precio,
            icono,
            activo: true
        });

        modalNuevoProducto?.classList.remove('abierto');
        formNuevoProducto.reset();
        renderizarMenuDashboard();
        guardarPartidaEnServidor();
    });

    // Arrancar Dashboard
    inicializarDashboard();
});
