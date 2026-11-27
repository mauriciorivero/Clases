// Pruebas del hash de contrasenias. No necesitan base de datos.
const test = require('node:test');
const assert = require('node:assert/strict');
const { generarHash, verificarPassword } = require('../src/utils/password');

test('el hash tiene el formato sal:sha256 y no contiene la contrasenia', () => {
  const hash = generarHash('Secreta123');
  assert.match(hash, /^[0-9a-f]{32}:[0-9a-f]{64}$/);
  assert.ok(!hash.includes('Secreta123'));
});

test('la misma contrasenia produce hashes distintos por la sal', () => {
  assert.notEqual(generarHash('Secreta123'), generarHash('Secreta123'));
});

test('solo la contrasenia exacta coincide', () => {
  const hash = generarHash('Secreta123');
  assert.equal(verificarPassword('Secreta123', hash), true);
  for (const intento of ['secreta123', 'Secreta123 ', 'Secreta12', '']) {
    assert.equal(verificarPassword(intento, hash), false, JSON.stringify(intento));
  }
});

test('un valor guardado mal formado nunca coincide', () => {
  for (const almacenado of ['', 'Secreta123', 'sal:', ':abc', 'sal:zz', null]) {
    assert.equal(verificarPassword('Secreta123', almacenado), false, JSON.stringify(almacenado));
  }
});
