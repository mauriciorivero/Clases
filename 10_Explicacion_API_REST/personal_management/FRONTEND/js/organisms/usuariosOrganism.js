// ORGANISM: modulo completo de Usuarios (formulario + tabla + interacciones).
// Se usa un IIFE para encapsular el estado interno (usuarios) y exponer
// solo lo necesario a traves del objeto UsuariosOrganism.
const UsuariosOrganism = (function () {
  let usuarios = [];

  // Pide al backend la lista de usuarios y refresca la tabla
  async function cargar() {
    try {
      usuarios = await UsuariosApi.listar();
      renderizarTabla();
    } catch (error) {
      mostrarNotificacion(error.message, 'error');
    }
  }

  // Dibuja las filas de la tabla de usuarios a partir del arreglo en memoria
  function renderizarTabla() {
    const tbody = $('#usuarios-tbody');
    tbody.innerHTML = '';

    if (usuarios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="entity-table__vacio">No hay usuarios registrados</td></tr>';
      return;
    }

    usuarios.forEach(usuario => {
      const fila = document.createElement('tr');
      const claseEstado = usuario.estado === 1 ? 'badge--activo' : 'badge--inactivo';
      const textoEstado = usuario.estado === 1 ? 'Activo' : 'Inactivo';

      fila.innerHTML = `
        <td>${usuario.id}</td>
        <td>${escaparHtml(usuario.nombreCompleto)}</td>
        <td>${formatearFecha(usuario.fechaNacimiento)}</td>
        <td>${usuario.edad}</td>
        <td>${escaparHtml(usuario.ciudadDomicilio)}</td>
        <td><span class="badge ${claseEstado}">${textoEstado}</span></td>
        <td class="table-actions">
          <button class="btn btn--secondary btn--sm" data-accion="editar" data-id="${usuario.id}">Editar</button>
          <button class="btn btn--danger btn--sm" data-accion="eliminar" data-id="${usuario.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  }

  // Lee los valores actuales del formulario y arma el objeto a enviar a la API
  function obtenerDatosFormulario() {
    return {
      primerNombre: $('#usuario-primer-nombre').value.trim(),
      segundoNombre: $('#usuario-segundo-nombre').value.trim() || null,
      primerApellido: $('#usuario-primer-apellido').value.trim(),
      segundoApellido: $('#usuario-segundo-apellido').value.trim() || null,
      fechaNacimiento: $('#usuario-fecha-nacimiento').value,
      ciudadDomicilio: $('#usuario-ciudad').value.trim()
    };
  }

  // Vuelve el formulario a su estado inicial (modo "crear")
  function limpiarFormulario() {
    $('#form-usuario').reset();
    $('#usuario-id').value = '';
    $('#usuario-btn-guardar').textContent = 'Crear Usuario';
    $('#usuario-btn-cancelar').hidden = true;
    $('.entity-form__title', $('#form-usuario')).textContent = 'Nuevo Usuario';
  }

  // Llena el formulario con los datos de un usuario para editarlo (modo "editar")
  function cargarEnFormulario(usuario) {
    $('#usuario-id').value = usuario.id;
    $('#usuario-primer-nombre').value = usuario.primerNombre || '';
    $('#usuario-segundo-nombre').value = usuario.segundoNombre || '';
    $('#usuario-primer-apellido').value = usuario.primerApellido || '';
    $('#usuario-segundo-apellido').value = usuario.segundoApellido || '';
    $('#usuario-fecha-nacimiento').value = usuario.fechaNacimiento ? String(usuario.fechaNacimiento).substring(0, 10) : '';
    $('#usuario-ciudad').value = usuario.ciudadDomicilio || '';
    $('#usuario-btn-guardar').textContent = 'Guardar Cambios';
    $('#usuario-btn-cancelar').hidden = false;
    $('.entity-form__title', $('#form-usuario')).textContent = 'Editar Usuario';
  }

  // Otros modulos dependen de la lista de usuarios (selects de Telefonos y Perfiles Sociales)
  function refrescarModulosDependientes() {
    if (typeof TelefonosOrganism !== 'undefined') TelefonosOrganism.refrescarSelectUsuarios();
    if (typeof PerfilesSocialesOrganism !== 'undefined') PerfilesSocialesOrganism.refrescarSelects();
  }

  // Maneja el envio del formulario: crea o actualiza segun si hay un id cargado
  async function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    const id = $('#usuario-id').value;
    const datos = obtenerDatosFormulario();

    try {
      if (id) {
        await UsuariosApi.actualizar(id, datos);
        mostrarNotificacion('Usuario actualizado correctamente');
      } else {
        await UsuariosApi.crear(datos);
        mostrarNotificacion('Usuario creado correctamente');
      }

      limpiarFormulario();
      await cargar();
      refrescarModulosDependientes();
    } catch (error) {
      mostrarNotificacion(error.message, 'error');
    }
  }

  // Delegacion de eventos: un solo listener en la tabla atiende clics de Editar/Eliminar
  async function manejarClicTabla(evento) {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;

    const { id, accion } = boton.dataset;

    if (accion === 'editar') {
      try {
        const usuario = await UsuariosApi.obtenerPorId(id);
        cargarEnFormulario(usuario);
      } catch (error) {
        mostrarNotificacion(error.message, 'error');
      }
    }

    if (accion === 'eliminar') {
      if (!confirm('¿Desea desactivar este usuario?')) return;

      try {
        await UsuariosApi.eliminar(id);
        mostrarNotificacion('Usuario desactivado correctamente');
        await cargar();
        refrescarModulosDependientes();
      } catch (error) {
        mostrarNotificacion(error.message, 'error');
      }
    }
  }

  // Devuelve la lista de usuarios cargada en memoria (usada para llenar selects en otros modulos)
  function obtenerListaUsuarios() {
    return usuarios;
  }

  // Inicializa el modulo: conecta eventos y hace la primera carga de datos.
  // Es async porque otros modulos (Telefonos, Perfiles Sociales) necesitan
  // esperar a que la lista de usuarios este lista antes de llenar sus selects.
  async function init() {
    $('#form-usuario').addEventListener('submit', manejarEnvioFormulario);
    $('#usuario-btn-cancelar').addEventListener('click', limpiarFormulario);
    $('#usuarios-tbody').addEventListener('click', manejarClicTabla);
    await cargar();
  }

  return { init, cargar, obtenerListaUsuarios };
})();
