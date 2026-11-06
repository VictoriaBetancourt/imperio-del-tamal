/**
 * IMPERIO DEL TAMAL - LÓGICA DE SELECCIÓN DE UBICACIÓN (js/ubicacion.js)
 * Pantalla 2: Mapa interactivo de CDMX, tarjetas con estrellas y validación del nombre del negocio.
 */

document.addEventListener('DOMContentLoaded', () => {
    const borrador = ImperioApp.obtenerBorrador();
    let zonaSeleccionadaId = borrador.zonaId || 'polanco';

    const contenedorChips = document.getElementById('contenedorChipsZonas');
    const pinesMapa = document.querySelectorAll('.zona-pin');
    const zonaTitulo = document.getElementById('zonaTitulo');
    const zonaAlcaldia = document.getElementById('zonaAlcaldia');
    const zonaDescripcion = document.getElementById('zonaDescripcion');
    const estrellasDemanda = document.getElementById('estrellasDemanda');
    const estrellasRenta = document.getElementById('estrellasRenta');
    const estrellasCompetencia = document.getElementById('estrellasCompetencia');
    const estrellasFlujo = document.getElementById('estrellasFlujo');
    const zonaRentaMonto = document.getElementById('zonaRentaMonto');
    const zonaClientesBase = document.getElementById('zonaClientesBase');

    const formUbicacion = document.getElementById('formUbicacion');
    const inputNombre = document.getElementById('inputNombreNegocio');
    const selectAyudantes = document.getElementById('selectAyudantesIniciales');
    const errorNombre = document.getElementById('errorNombreNegocio');

    if (inputNombre && borrador.nombreNegocio) {
        inputNombre.value = borrador.nombreNegocio;
    }
    if (selectAyudantes && borrador.ayudantesIniciales !== undefined) {
        selectAyudantes.value = String(borrador.ayudantesIniciales);
    }

    function renderizarChipsZonas() {
        if (!contenedorChips) return;
        contenedorChips.innerHTML = ImperioApp.ZONAS_CDMX.map(
            (z) => `
            <button type="button" class="zona-chip ${z.id === zonaSeleccionadaId ? 'active' : ''}" data-chip-zona="${z.id}">
                📍 ${z.nombre}
            </button>
        `
        ).join('');

        contenedorChips.querySelectorAll('[data-chip-zona]').forEach((btn) => {
            btn.addEventListener('click', () => {
                seleccionarZona(btn.getAttribute('data-chip-zona'));
            });
        });
    }

    function seleccionarZona(zonaId) {
        zonaSeleccionadaId = zonaId;
        const zona = ImperioApp.obtenerZonaPorId(zonaId);

        // Actualizar pines del mapa SVG
        pinesMapa.forEach((pin) => {
            if (pin.getAttribute('data-zona') === zonaId) {
                pin.classList.add('selected');
            } else {
                pin.classList.remove('selected');
            }
        });

        // Actualizar botones chip
        renderizarChipsZonas();

        // Actualizar tarjeta de información de la zona (Pág. 10 del reporte)
        if (zonaTitulo) zonaTitulo.textContent = zona.nombre.toUpperCase();
        if (zonaAlcaldia) zonaAlcaldia.textContent = `Alcaldía ${zona.alcaldia}`;
        if (zonaDescripcion) {
            zonaDescripcion.textContent = `${zona.descripcion} Horario fuerte: ${zona.horarioPico}.`;
        }
        if (estrellasDemanda) estrellasDemanda.textContent = ImperioApp.formatoEstrellas(zona.demanda);
        if (estrellasRenta) estrellasRenta.textContent = ImperioApp.formatoEstrellas(zona.renta);
        if (estrellasCompetencia) estrellasCompetencia.textContent = ImperioApp.formatoEstrellas(zona.competencia);
        if (estrellasFlujo) estrellasFlujo.textContent = ImperioApp.formatoEstrellas(zona.flujoClientes);
        if (zonaRentaMonto) zonaRentaMonto.textContent = `${ImperioApp.formatoMoneda(zona.rentaDiaria)} / día`;
        if (zonaClientesBase) zonaClientesBase.textContent = `~${zona.clientesBase} clientes / día`;
    }

    // Eventos en los pines del mapa de CDMX
    pinesMapa.forEach((pin) => {
        pin.addEventListener('click', () => {
            const zId = pin.getAttribute('data-zona');
            if (zId) seleccionarZona(zId);
        });
    });

    // Validación en tiempo real del nombre del negocio
    inputNombre?.addEventListener('input', () => {
        if (inputNombre.value.trim().length >= 3) {
            errorNombre.style.display = 'none';
        }
    });

    // Envío del formulario hacia Pantalla 3 (menu.html)
    formUbicacion?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombreLimpio = (inputNombre?.value || '').trim();

        if (nombreLimpio.length < 3) {
            if (errorNombre) {
                errorNombre.textContent = 'El nombre de tu negocio debe tener al menos 3 caracteres.';
                errorNombre.style.display = 'block';
            }
            inputNombre?.focus();
            return;
        }

        ImperioApp.guardarBorrador({
            nombreNegocio: nombreLimpio,
            zonaId: zonaSeleccionadaId,
            ayudantesIniciales: Number(selectAyudantes?.value ?? 1)
        });

        window.location.href = 'menu.html';
    });

    // Inicializar con la zona actual
    seleccionarZona(zonaSeleccionadaId);
});
