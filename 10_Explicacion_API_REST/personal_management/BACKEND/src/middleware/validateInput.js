// Middleware "fabrica": recibe una funcion validadora (de utils/validators.js)
// y devuelve un middleware de Express que la aplica sobre req.body.
// Si hay errores, responde 400 de inmediato y detiene la cadena de middlewares.
function validarCon(funcionValidadora) {
  return (req, res, next) => {
    const errores = funcionValidadora(req.body || {});

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Datos invalidos', detalles: errores });
    }

    next();
  };
}

module.exports = { validarCon };
