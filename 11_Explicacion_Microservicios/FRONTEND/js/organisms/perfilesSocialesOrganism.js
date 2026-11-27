// ORGANISM: modulo completo de Perfiles Sociales (formulario + tabla + interacciones).
// PERFIL_SOCIAL tiene llave primaria compuesta (redSocialId + usuarioId), por lo que
// en modo edicion los selects de usuario/red social se deshabilitan: solo se permite
// modificar la url del perfil.
const PerfilesSocialesOrganism = (function () {
  let perfiles = [];
  let editando = false;

  // Llena los <select> de usuario y red social con las listas ya cargadas
  // por UsuariosOrganism y RedesSocialesOrganism
  function refrescarSelects() {
    const selectUsuario = $('#perfil-usuario');
    const selectRedSocial = $('#perfil-red-social');
    const usuarios = typeof UsuariosOrganism !== 'undefined' ? UsuariosOrganism.obtenerListaUsuarios() : [];
    const redesSociales = typeof RedesSocialesOrganism !== 'undefined' ? RedesSocialesOrganism.obtenerListaRedesSociales() : [];

    const usuarioAnterior = selectUsuario.options[selectUsuario.selectedIndex];
    const valorRedSocialActual = selectRedSocial.value;

    selectUsuario.innerHTML = usuarios.map(u => `<option value="${u.id}">${escaparHtml(u.nombreCompleto)}</option>`).join('');
    selectRedSocial.innerHTML = redesSociales.map(r => `<option value="${r.id}">${escaparHtml(r.nombre)}</option>`).join('');

    if (valorRedSocialActual) selectRedSocial.value = valorRedSocialActual;
    if (!usuarioAnterior) return;

    // En edicion el usuario se conserva aunque ya no este en la lista (desactivado)
    if (editando) seleccionarOpcion(selectUsuario, usuarioAnterior.value, usuarioAnterior.textContent);
    else selectUsuario.value = usuarioAnterior.value;
  }

  async function cargar() {
    try {
      perfiles = await PerfilesSocialesApi.listar();
      renderizarTabla();
    } catch (error) {
      mostrarNotificacion(error.message, 'error');
    }
  }

  function renderizarTabla() {
    const tbody = $('#perfiles-sociales-tbody');
    tbody.innerHTML = '';

    if (perfiles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="entity-table__vacio">No hay perfiles sociales registrados</td></tr>';
      return;
    }

    perfiles.forEach(perfil => {
      const fila = document.createElement('tr');
      const nombreRedSocial = perfil.redSocial ? perfil.redSocial.nombre : `Red #${perfil.redSocialId}`;
      const nombreUsuario = perfil.usuario || `Usuario #${perfil.usuarioId}`;

      fila.innerHTML = `
        <td>${escaparHtml(nombreUsuario)}</td>
        <td>${escaparHtml(nombreRedSocial)}</td>
        <td>${perfil.urlPerfil ? `<a href="${escaparHtml(perfil.urlPerfil)}" target="_blank" rel="noopener noreferrer">${escaparHtml(perfil.urlPerfil)}</a>` : '-'}</td>
        <td class="table-actions">
          <button class="btn btn--secondary btn--sm" data-accion="editar" data-red-social-id="${perfil.redSocialId}" data-usuario-id="${perfil.usuarioId}">Editar</button>
          <button class="btn btn--danger btn--sm" data-accion="eliminar" data-red-social-id="${perfil.redSocialId}" data-usuario-id="${perfil.usuarioId}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  }

  function obtenerDatosFormulario() {
    return {
      usuarioId: Number($('#perfil-usuario').value),
      redSocialId: Number($('#perfil-red-social').value),
      urlPerfil: $('#perfil-url').value.trim() || null
    };
  }

  function limpiarFormulario() {
    $('#form-perfil-social').reset();
    $('#perfil-usuario').disabled = false;
    $('#perfil-red-social').disabled = false;
    editando = false;
    $('#perfil-btn-guardar').textContent = 'Crear Perfil Social';
    $('#perfil-btn-cancelar').hidden = true;
    $('.entity-form__title', $('#form-perfil-social')).textContent = 'Nuevo Perfil Social';
    refrescarSelects(); // quita la opcion de un usuario desactivado, si se habia agregado
  }

  // En edicion, los selects quedan fijos (son parte de la llave primaria compuesta)
  function cargarEnFormulario(perfil) {
    seleccionarOpcion($('#perfil-usuario'), perfil.usuarioId, perfil.usuario || `Usuario #${perfil.usuarioId}`);
    $('#perfil-red-social').value = perfil.redSocialId;
    $('#perfil-url').value = perfil.urlPerfil || '';
    $('#perfil-usuario').disabled = true;
    $('#perfil-red-social').disabled = true;
    editando = true;
    $('#perfil-btn-guardar').textContent = 'Guardar Cambios';
    $('#perfil-btn-cancelar').hidden = false;
    $('.entity-form__title', $('#form-perfil-social')).textContent = 'Editar Perfil Social';
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    const datos = obtenerDatosFormulario();

    try {
      if (editando) {
        await PerfilesSocialesApi.actualizar(datos.redSocialId, datos.usuarioId, datos.urlPerfil);
        mostrarNotificacion('Perfil social actualizado correctamente');
      } else {
        await PerfilesSocialesApi.crear(datos);
        mostrarNotificacion('Perfil social creado correctamente');
      }

      limpiarFormulario();
      await cargar();
    } catch (error) {
      mostrarNotificacion(error.message, 'error');
    }
  }

  async function manejarClicTabla(evento) {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;

    const { redSocialId, usuarioId, accion } = boton.dataset;

    if (accion === 'editar') {
      const perfil = perfiles.find(p => String(p.redSocialId) === redSocialId && String(p.usuarioId) === usuarioId);
      if (perfil) cargarEnFormulario(perfil);
    }

    if (accion === 'eliminar') {
      if (!confirm('¿Desea eliminar este perfil social?')) return;

      try {
        await PerfilesSocialesApi.eliminar(redSocialId, usuarioId);
        mostrarNotificacion('Perfil social eliminado correctamente');
        await cargar();
      } catch (error) {
        mostrarNotificacion(error.message, 'error');
      }
    }
  }

  async function init() {
    refrescarSelects();
    $('#form-perfil-social').addEventListener('submit', manejarEnvioFormulario);
    $('#perfil-btn-cancelar').addEventListener('click', limpiarFormulario);
    $('#perfiles-sociales-tbody').addEventListener('click', manejarClicTabla);
    await cargar();
  }

  return { init, cargar, refrescarSelects };
})();
