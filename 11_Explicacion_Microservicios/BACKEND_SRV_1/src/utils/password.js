// Hash de contrasenias con SHA-256 y sal. SHA-2 no es cifrado: el hash no se puede
// revertir, para validar se vuelve a calcular y se comparan los resultados.
//
// Formato guardado: "sal:hash", donde hash = SHA-256(sal + contrasenia) en hexadecimal.
// Equivale en MySQL a: CONCAT(@sal, ':', SHA2(CONCAT(@sal, contrasenia), 256))
const crypto = require('crypto');

function sha256(sal, password) {
  return crypto.createHash('sha256').update(sal + password, 'utf8').digest();
}

function generarHash(password, sal = crypto.randomBytes(16).toString('hex')) {
  return `${sal}:${sha256(sal, password).toString('hex')}`;
}

function verificarPassword(password, almacenado) {
  const [sal, hash] = String(almacenado).split(':');
  if (!sal || !hash) return false;

  const esperado = Buffer.from(hash, 'hex');
  const calculado = sha256(sal, password);

  // timingSafeEqual evita deducir el hash midiendo el tiempo de respuesta
  return esperado.length === calculado.length && crypto.timingSafeEqual(esperado, calculado);
}

module.exports = { generarHash, verificarPassword };
