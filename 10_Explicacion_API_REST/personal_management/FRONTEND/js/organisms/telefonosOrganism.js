// ORGANISM: modulo completo de Telefonos (formulario + tabla + interacciones).
const TelefonosOrganism = (function () {
  let telefonos = [];

  // Llena el <select> de usuarios usando la lista ya cargada por UsuariosOrganism
  function refrescarSelectUsuarios() {
    const select = $('#telefono-usuario');
    const anterior = select.options[select.selectedIndex];
    const usuarios = typeof UsuariosOrganism !== 'undefined' ? UsuariosOrganism.obtenerListaUsuarios() : [];

    select.innerHTML = usuarios
      .map(u => `<option value="${u.id}">${escaparHtml(u.nombreCompleto)}</option>`)
      .join('');

    if (!anterior) return;

    // En edicion el dueno se conserva aunque ya no este en la lista
    if ($('#telefono-id').value) seleccionarOpcion(select, anterior.value, anterior.textContent);
    else select.value = anterior.value;
  }

  // Busca el nombre de un usuario por id dentro de la lista cargada (para mostrar en la tabla)
  function nombreUsuario(usuarioId) {
    const usuarios = typeof UsuariosOrganism !== 'undefined' ? UsuariosOrganism.obtenerListaUsuarios() : [];
    const usuario = usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.nombreCompleto : `Usuario #${usuarioId}`;
  }

  // Pide al backend la lista de telefonos y refresca la tabla
  async function cargar() {
    try {
      telefonos = await TelefonosApi.listar();
      renderizarTabla();
    } catch (error) {
      mostrarNotificacion(error.message, 'error');
    }
  }

  function renderizarTabla() {
    const tbody = $('#telefonos-tbody');
    tbody.innerHTML = '';

    if (telefonos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="entity-table__vacio">No hay teléfonos registrados</td></tr>';
      return;
    }

    telefonos.forEach(telefono => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${telefono.id}</td>
        <td>${escaparHtml(nombreUsuario(telefono.usuarioId))}</td>
        <td>${escaparHtml(telefono.numeroTelefono)}</td>
        <td>${escaparHtml(telefono.tipoTelefono)}</td>
        <td>${telefono.activo === 1 ? 'Sí' : 'No'}</td>
        <td class="table-actions">
          <button class="btn btn--secondary btn--sm" data-accion="editar" data-id="${telefono.id}">Editar</button>
          <button class="btn btn--danger btn--sm" data-accion="eliminar" data-id="${telefono.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  }

  function obtenerDatosFormulario() {
    return {
      usuarioId: Number($('#telefono-usuario').value),
      numeroTelefono: $('#telefono-numero').value.trim(),
      tipoTelefono: $('#telefono-tipo').value,
      activo: $('#telefono-activo').checked ? 1 : 0
    };
  }

  function limpiarFormulario() {
    $('#form-telefono').reset();
    $('#telefono-id').value = '';
    $('#telefono-activo').checked = true;
    $('#telefono-btn-guardar').textContent = 'Crear Teléfono';
    $('#telefono-btn-cancelar').hidden = true;
    $('.entity-form__title', $('#form-telefono')).textContent = 'Nuevo Teléfono';
    $('#telefono-usuario').disabled = false;
    refrescarSelectUsuarios(); // quita la opcion de un usuario desactivado, si se habia agregado
  }

  // En edicion el dueno queda fijo: el backend no permite cambiarlo
  function cargarEnFormulario(telefono) {
    $('#telefono-id').value = telefono.id;
    seleccionarOpcion($('#telefono-usuario'), telefono.usuarioId, nombreUsuario(telefono.usuarioId));
    $('#telefono-usuario').disabled = true;
    $('#telefono-numero').value = telefono.numeroTelefono;
    $('#telefono-tipo').value = telefono.tipoTelefono;
    $('#telefono-activo').checked = telefono.activo === 1;
    $('#telefono-btn-guardar').textContent = 'Guardar Cambios';
    $('#telefono-btn-cancelar').hidden = false;
    $('.entity-form__title', $('#form-telefono')).textContent = 'Editar Teléfono';
  }

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    const id = $('#telefono-id').value;
    const datos = obtenerDatosFormulario();

    try {
      if (id) {
        await TelefonosApi.actualizar(id, datos);
        mostrarNotificacion('Teléfono actualizado correctamente');
      } else {
        await TelefonosApi.crear(datos);
        mostrarNotificacion('Teléfono creado correctamente');
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

    const { id, accion } = boton.dataset;

    if (accion === 'editar') {
      const telefono = telefonos.find(t => String(t.id) === id);
      if (telefono) cargarEnFormulario(telefono);
    }

    if (accion === 'eliminar') {
      if (!confirm('¿Desea eliminar este teléfono?')) return;

      try {
        await TelefonosApi.eliminar(id);
        mostrarNotificacion('Teléfono eliminado correctamente');
        await cargar();
      } catch (error) {
        mostrarNotificacion(error.message, 'error');
      }
    }
  }

  async function init() {
    refrescarSelectUsuarios();
    $('#form-telefono').addEventListener('submit', manejarEnvioFormulario);
    $('#telefono-btn-cancelar').addEventListener('click', limpiarFormulario);
    $('#telefonos-tbody').addEventListener('click', manejarClicTabla);
    await cargar();
  }

  return { init, cargar, refrescarSelectUsuarios };
})();
