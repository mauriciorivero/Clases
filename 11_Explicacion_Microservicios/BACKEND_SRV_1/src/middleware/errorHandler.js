// Middleware centralizado de manejo de errores. A diferencia del otro servicio,
// aqui solo se registra el mensaje: el error completo puede traer la contrasenia.
function errorHandler(err, req, res, next) {
  // El mensaje del parser cita parte del body recibido, por eso no se registra
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la peticion no es un JSON valido' });
  }

  console.error('Error capturado:', err.message);

  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = errorHandler;
