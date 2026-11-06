/**
 * IMPERIO DEL TAMAL - CONFIGURACIÓN DE MENÚ Y PRECIOS (js/menu.js)
 * Pantalla 3: Selección de productos (TAMALES y BEBIDAS), ajuste de precios con validación
 * y simulación financiera en vivo antes de inaugurar el puesto.
 */

document.addEventListener('DOMContentLoaded', () => {
    const borrador = ImperioApp.obtenerBorrador();
    let menuActual = Array.isArray(borrador.menu) && borrador.menu.length > 0
        ? borrador.menu
        : JSON.parse(JSON.stringify(ImperioApp.PRODUCTOS_BASE));

    const gridTamales = document.getElementById('gridTamales');
    const gridBebidas = document.getElementById('gridBebidas');

    const resumenNombreNegocio = document.getElementById('resumenNombreNegocio');
    const resumenZonaNombre = document.getElementById('resumenZonaNombre');
    const resumenProductosActivos = document.getElementById('resumenProductosActivos');
    const resumenInversion = document.getElementById('resumenInversion');
    const resumenUnidadesDia = document.getElementById('resumenUnidadesDia');
    const resumenIngresoDia = document.getElementById('resumenIngresoDia');
    const resumenCostosDia = document.getElementById('resumenCostosDia');
    const resumenGananciaDia = document.getElementById('resumenGananciaDia');
    const errorMenuConfig = document.getElementById('errorMenuConfig');
    const btnIniciarNegocio = document.getElementById('btnIniciarNegocio');

    const zona = ImperioApp.obtenerZonaPorId(borrador.zonaId);
    if (resumenNombreNegocio) resumenNombreNegocio.textContent = borrador.nombreNegocio || 'Imperio del Tamal';
    if (resumenZonaNombre) resumenZonaNombre.textContent = zona.nombre;

    function crearTarjetaProductoHTML(prod) {
        const margen = (Number(prod.precio) - Number(prod.costo)).toFixed(2);
        return `
            <article class="producto-card ${prod.activo ? '' : 'inactivo'}" data-prod-id="${prod.id}">
                <div class="producto-banner">
                    <span>${prod.icono || '🫔'}</span>
                    <label class="producto-toggle-badge">
                        <input type="checkbox" data-toggle-id="${prod.id}" ${prod.activo ? 'checked' : ''}>
                        <span>${prod.activo ? 'Activo' : 'Inactivo'}</span>
                    </label>
                </div>
                <div class="producto-body">
                    <div>
                        <h4>${prod.nombre}</h4>
                        <p class="producto-desc">${prod.descripcion || ''}</p>
                        <div class="producto-costos-row">
                            <span>Costo: <strong>$${Number(prod.costo).toFixed(2)}</strong></span>
                            <span style="color: var(--verde-tamal);">Margen: <strong>+$${margen}</strong></span>
                        </div>
                    </div>
                    <div class="precio-selector-group">
                        <label for="precio-${prod.id}">Precio de venta:</label>
                        <div class="precio-controles">
                            <button type="button" class="btn-step" data-step="-1" data-id="${prod.id}">−</button>
                            <input
                                type="number"
                                id="precio-${prod.id}"
                                class="input-precio"
                                data-precio-input="${prod.id}"
                                value="${Number(prod.precio).toFixed(2)}"
                                min="${Number(prod.costo) + 1}"
                                max="120"
                                step="1"
                            >
                            <button type="button" class="btn-step" data-step="1" data-id="${prod.id}">+</button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    function renderizarProductos() {
        const tamales = menuActual.filter((p) => p.categoria === 'TAMALES');
        const bebidas = menuActual.filter((p) => p.categoria === 'BEBIDAS');

        if (gridTamales) gridTamales.innerHTML = tamales.map(crearTarjetaProductoHTML).join('');
        if (gridBebidas) gridBebidas.innerHTML = bebidas.map(crearTarjetaProductoHTML).join('');

        // Eventos para activar/desactivar producto
        document.querySelectorAll('[data-toggle-id]').forEach((chk) => {
            chk.addEventListener('change', () => {
                const id = chk.getAttribute('data-toggle-id');
                const item = menuActual.find((p) => p.id === id);
                if (item) {
                    item.activo = chk.checked;
                    renderizarProductos();
                    actualizarResumenFinanciero();
                }
            });
        });

        // Eventos de botones +/- de precio
        document.querySelectorAll('.btn-step').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const delta = Number(btn.getAttribute('data-step'));
                const item = menuActual.find((p) => p.id === id);
                if (!item) return;

                const precioMinimo = Number(item.costo) + 1;
                const nuevoPrecio = Math.min(120, Math.max(precioMinimo, Math.round(Number(item.precio) + delta)));
                item.precio = nuevoPrecio;
                renderizarProductos();
                actualizarResumenFinanciero();
            });
        });

        // Eventos de edición manual del precio con validación en cliente
        document.querySelectorAll('[data-precio-input]').forEach((inp) => {
            inp.addEventListener('change', () => {
                const id = inp.getAttribute('data-precio-input');
                const item = menuActual.find((p) => p.id === id);
                if (!item) return;

                let val = Number(inp.value);
                const minPermitido = Number(item.costo) + 1;

                if (isNaN(val) || val < minPermitido) {
                    val = minPermitido;
                    ImperioApp.mostrarToast(
                        `El precio de ${item.nombre} no puede ser menor a $${minPermitido} (su costo es $${item.costo}).`,
                        'error'
                    );
                } else if (val > 120) {
                    val = 120;
                }
                item.precio = val;
                renderizarProductos();
                actualizarResumenFinanciero();
            });
        });
    }

    function actualizarResumenFinanciero() {
        const activos = menuActual.filter((p) => p.activo);
        if (resumenProductosActivos) {
            resumenProductosActivos.textContent = `${activos.length} producto(s)`;
        }

        const sim = ImperioApp.calcularSimulacionCliente(
            borrador.zonaId,
            menuActual,
            borrador.ayudantesIniciales ?? 1
        );

        if (resumenInversion) resumenInversion.textContent = ImperioApp.formatoMoneda(sim.inversionInicial);
        if (resumenUnidadesDia) resumenUnidadesDia.textContent = `${sim.unidadesHoy} uds/día`;
        if (resumenIngresoDia) resumenIngresoDia.textContent = `${ImperioApp.formatoMoneda(sim.ventasHoy)}/día`;
        if (resumenCostosDia) resumenCostosDia.textContent = `${ImperioApp.formatoMoneda(sim.costosHoy)}/día`;
        if (resumenGananciaDia) {
            resumenGananciaDia.textContent = `${ImperioApp.formatoMoneda(sim.gananciaHoy)}/día`;
            resumenGananciaDia.style.color = sim.gananciaHoy >= 0 ? 'var(--verde-tamal)' : '#C62828';
        }

        if (activos.length > 0 && errorMenuConfig) {
            errorMenuConfig.style.display = 'none';
        }

        ImperioApp.guardarBorrador({ menu: menuActual });
    }

    // Botón "Iniciar negocio" -> Crea la partida en el servidor (POST /api/partidas) y redirige a dashboard.html
    btnIniciarNegocio?.addEventListener('click', async () => {
        const activos = menuActual.filter((p) => p.activo);
        if (activos.length === 0) {
            if (errorMenuConfig) {
                errorMenuConfig.textContent = 'Debes activar al menos un producto (tamal o bebida) para iniciar tu negocio.';
                errorMenuConfig.style.display = 'block';
            }
            return;
        }

        btnIniciarNegocio.disabled = true;
        btnIniciarNegocio.textContent = 'Creando negocio...';

        try {
            const payload = {
                nombreNegocio: borrador.nombreNegocio || 'Imperio del Tamal CDMX',
                zonaId: borrador.zonaId || 'polanco',
                ayudantesIniciales: borrador.ayudantesIniciales ?? 1,
                menu: menuActual
            };

            const res = await ImperioApp.apiFetch('/api/partidas', {
                method: 'POST',
                body: payload
            });

            if (res.partida && res.partida.id) {
                ImperioApp.establecerPartidaActivaId(res.partida.id);
            }
            window.location.href = 'dashboard.html';
        } catch (err) {
            // Si el usuario abrió el HTML directamente sin correr node server.js, guardamos borrador y abrimos dashboard
            console.warn('Servidor no disponible, usando modo cliente:', err.message);
            ImperioApp.guardarBorrador({ menu: menuActual });
            window.location.href = 'dashboard.html';
        }
    });

    renderizarProductos();
    actualizarResumenFinanciero();
});
