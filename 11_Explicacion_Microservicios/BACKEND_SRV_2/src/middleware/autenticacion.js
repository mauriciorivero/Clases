// Exige el token JWT que entrega el microservicio de autenticacion (BACKEND_SRV_1).
// Se verifica aqui mismo con el secreto compartido, sin llamar al otro servicio.
const jwt = require('jsonwebtoken');
const environment = require('../config/environment');
const { crearError } = require('../utils/helpers');

function requiereAutenticacion(req, res, next) {
  // Sin secreto es un error de configuracion del servidor, no del cliente
  if (!environment.jwt.secret) {
    return next(new Error('Falta la variable JWT_SECRET'));
  }

  const [esquema, token] = (req.headers.authorization || '').split(' ');
  if (esquema !== 'Bearer' || !token) {
    return next(crearError('Debe iniciar sesion para usar este servicio', 401));
  }

  try {
    // Fijar el algoritmo impide aceptar tokens sin firma o firmados de otra forma
    req.cuenta = jwt.verify(token, environment.jwt.secret, { algorithms: ['HS256'] });
  } catch (error) {
    return next(crearError('La sesion no es valida o ya expiro', 401));
  }

  next();
}

module.exports = requiereAutenticacion;
