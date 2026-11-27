// Funciones auxiliares reutilizables en distintas capas de la aplicacion.

// Las clases de dominio pueden guardar una relacion (ej: Telefono.usuario,
// PerfilSocial.redSocial) como objeto completo o solo como su id. Esta funcion
// devuelve siempre el id, para usarlo como parametro SQL.
function idDeReferencia(referencia) {
  return referencia !== null && typeof referencia === 'object' ? referencia.id : referencia;
}

// Construye una respuesta de error estandar para toda la API
function respuestaError(mensaje, detalles = undefined) {
  const respuesta = { error: mensaje };
  if (detalles) {
    respuesta.detalles = detalles;
  }
  return respuesta;
}

// Crea un Error "de negocio" con un codigo HTTP asociado, para que el
// middleware errorHandler sepa con que status code debe responder.
function crearError(mensaje, statusCode = 500) {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
}

// Deja en consola en que operacion fallo un service. No modifica el error: quien lo
// llama lo relanza y el errorHandler decide la respuesta HTTP.
function registrarError(origen, error) {
  console.error(`[${origen}] ${error.message}`);
}

module.exports = { idDeReferencia, respuestaError, crearError, registrarError };
