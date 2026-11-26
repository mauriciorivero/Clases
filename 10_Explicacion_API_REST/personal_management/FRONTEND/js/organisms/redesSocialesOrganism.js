// ORGANISM: modulo completo de Redes Sociales (formulario + tabla + interacciones).
const RedesSocialesOrganism = (function () {
  let redesSociales = [];

  async function cargar() {
    try {
      redesSociales = await RedesSocialesApi.listar();
      renderizarTabla();
    } catch (error) {
      mostrarNotificacion(error.message, 'error');
    }
  }

  function renderizarTabla() {
    const tbody = $('#redes-sociales-tbody');
    tbody.innerHTML = '';

    if (redesSociales.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="entity-table__vacio">No hay redes sociales registradas</td></tr>';
      return;
    }

    redesSociales.forEach(red => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${red.id}</td>
        <td>${escaparHtml(red.nombre)}</td>
        <td><a href="${escaparHtml(red.url)}" target="_blank" rel="noopener noreferrer">${escaparHtml(red.url)}</a></td>
        <td class="table-actions">
          <button class="btn btn--secondary btn--sm" data-accion="editar" data-id="${red.id}">Editar</button>
          <button class="btn btn--danger btn--sm" data-accion="eliminar" data-id="${red.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  }

  function obtenerDatosFormulario() {
    return {
      nombre: $('#red-social-nombre').value.trim(),
      url: $('#red-social-url').value.trim()
    };
  }

  function limpiarFormulario() {
    $('#form-red-social').reset();
    $('#red-social-id').value = '';
    $('#red-social-btn-guardar').textContent = 'Crear Red Social';
    $('#red-social-btn-cancelar').hidden = true;
    $('.entity-form__title', $('#form-red-social')).textContent = 'Nueva Red Social';
  }

  function cargarEnFormulario(redSocial) {
    $('#red-social-id').value = redSocial.id;
    $('#red-social-nombre').value = redSocial.nombre;
    $('#red-social-url').value = redSocial.url;
    $('#red-social-btn-guardar').textContent = 'Guardar Cambios';
    $('#red-social-btn-cancelar').hidden = false;
    $('.entity-form__title', $('#form-red-social')).textContent = 'Editar Red Social';
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    const id = $('#red-social-id').value;
    const datos = obtenerDatosFormulario();

    try {
      if (id) {
        await RedesSocialesApi.actualizar(id, datos);
        mostrarNotificacion('Red social actualizada correctamente');
      } else {
        await RedesSocialesApi.crear(datos);
        mostrarNotificacion('Red social creada correctamente');
      }

      limpiarFormulario();
      await cargar();

      // El select de Perfiles Sociales depende del catalogo de redes sociales
      if (typeof PerfilesSocialesOrganism !== 'undefined') PerfilesSocialesOrganism.refrescarSelects();
    } catch (error) {
      mostrarNotificacion(error.message, 'error');
    }
  }

  async function manejarClicTabla(evento) {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;

    const { id, accion } = boton.dataset;

    if (accion === 'editar') {
      const redSocial = redesSociales.find(r => String(r.id) === id);
      if (redSocial) cargarEnFormulario(redSocial);
    }

    if (accion === 'eliminar') {
      if (!confirm('¿Desea eliminar esta red social?')) return;

      try {
        await RedesSocialesApi.eliminar(id);
        mostrarNotificacion('Red social eliminada correctamente');
        await cargar();
        if (typeof PerfilesSocialesOrganism !== 'undefined') PerfilesSocialesOrganism.refrescarSelects();
      } catch (error) {
        mostrarNotificacion(error.message, 'error');
      }
    }
  }

  function obtenerListaRedesSociales() {
    return redesSociales;
  }

  // Es async porque Perfiles Sociales necesita esperar a que el catalogo
  // de redes sociales este listo antes de llenar su select.
  async function init() {
    $('#form-red-social').addEventListener('submit', manejarEnvioFormulario);
    $('#red-social-btn-cancelar').addEventListener('click', limpiarFormulario);
    $('#redes-sociales-tbody').addEventListener('click', manejarClicTabla);
    await cargar();
  }

  return { init, cargar, obtenerListaRedesSociales };
})();
