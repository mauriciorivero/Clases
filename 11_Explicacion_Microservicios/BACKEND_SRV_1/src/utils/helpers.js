// Funciones auxiliares reutilizables en distintas capas del servicio.

// Crea un Error "de negocio" con un codigo HTTP asociado, para que el
// middleware errorHandler sepa con que status code debe responder.
function crearError(mensaje, statusCode = 500) {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
}

// Deja en consola en que operacion fallo un service. No modifica el error.
function registrarError(origen, error) {
  console.error(`[${origen}] ${error.message}`);
}

module.exports = { crearError, registrarError };
