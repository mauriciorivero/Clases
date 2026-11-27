// Genera el token JWT que BACKEND_SRV_2 verifica con el mismo secreto.
const jwt = require('jsonwebtoken');
const environment = require('../config/environment');

function firmarToken(cuenta) {
  return jwt.sign({ username: cuenta.username }, environment.jwt.secret, {
    algorithm: 'HS256',
    subject: String(cuenta.id),
    expiresIn: environment.jwt.expiresIn
  });
}

module.exports = { firmarToken };
