// Funciones auxiliares para manipular el DOM sin depender de ninguna libreria.

// Atajo para document.querySelector
function $(selector, contenedor = document) {
  return contenedor.querySelector(selector);
}

// Atajo para document.querySelectorAll, devuelve un arreglo real (no NodeList)
function $$(selector, contenedor = document) {
  return Array.from(contenedor.querySelectorAll(selector));
}

// Selecciona un valor en un <select>; si ya no esta entre las opciones (ej: se edita
// un registro de un usuario desactivado) agrega la opcion para no perderlo.
function seleccionarOpcion(select, valor, texto) {
  if (!Array.from(select.options).some(opcion => opcion.value === String(valor))) {
    select.add(new Option(texto, valor));
  }
  select.value = valor;
}

// Escapa texto para insertarlo de forma segura dentro de innerHTML
// (evita inyeccion de HTML/XSS a partir de datos que vienen del backend)
function escaparHtml(texto) {
  if (texto === null || texto === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(texto);
  return div.innerHTML;
}

// Muestra una notificacion flotante (toast) de exito o error durante unos segundos
function mostrarNotificacion(mensaje, tipo = 'exito') {
  const contenedor = $('#notificaciones');
  if (!contenedor) return;

  const notificacion = document.createElement('div');
  notificacion.className = `notificacion notificacion--${tipo}`;
  notificacion.textContent = mensaje;

  contenedor.appendChild(notificacion);

  setTimeout(() => {
    notificacion.remove();
  }, 4000);
}

// Formatea una fecha ISO (yyyy-mm-dd o timestamp) al formato dd/mm/aaaa para mostrarla en tablas
function formatearFecha(fechaIso) {
  if (!fechaIso) return '-';
  const fecha = new Date(fechaIso);
  if (isNaN(fecha.getTime())) return '-';
  return fecha.toLocaleDateString('es-CO', { timeZone: 'UTC' });
}

// Extrae del backend un mensaje de error legible, con un mensaje generico de respaldo
async function extraerMensajeError(response) {
  try {
    const cuerpo = await response.json();
    if (cuerpo.detalles && Array.isArray(cuerpo.detalles)) {
      return cuerpo.detalles.join(', ');
    }
    return cuerpo.error || 'Ocurrio un error inesperado';
  } catch (error) {
    return 'Ocurrio un error inesperado';
  }
}
