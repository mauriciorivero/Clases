// Middleware centralizado de manejo de errores. Express lo reconoce porque
// recibe 4 parametros (err, req, res, next) y se registra al final de app.js.
// Aqui se traducen los errores conocidos (de negocio o de MySQL) a codigos HTTP.
function errorHandler(err, req, res, next) {
  console.error('Error capturado:', err);

  // Errores de negocio lanzados por los services (ya traen su propio statusCode)
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Errores tipicos del driver de MySQL (mysql2)
  switch (err.code) {
    case 'ER_NO_REFERENCED_ROW_2':
    case 'ER_NO_REFERENCED_ROW':
      // Se intento crear un registro que referencia una llave foranea inexistente
      return res.status(400).json({ error: 'La referencia indicada no existe (llave foranea invalida)' });

    case 'ER_ROW_IS_REFERENCED_2':
    case 'ER_ROW_IS_REFERENCED':
      // Se intento borrar/modificar un registro que todavia esta siendo usado por otro
      return res.status(409).json({ error: 'No se puede eliminar: el registro esta relacionado con otros datos' });

    case 'ER_DUP_ENTRY':
      // Violacion de llave unica o llave primaria duplicada
      return res.status(409).json({ error: 'El registro ya existe (llave duplicada)' });

    default:
      // Cualquier otro error no controlado se responde como error interno
      return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = errorHandler;
