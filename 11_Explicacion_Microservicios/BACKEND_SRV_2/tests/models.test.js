// Pruebas unitarias de las clases de dominio (no usan base de datos).
// Se fija la zona horaria de Colombia: el error de calculo de edad solo aparece
// en zonas con desfase negativo respecto a UTC.
process.env.TZ = 'America/Bogota';

const test = require('node:test');
const assert = require('node:assert/strict');
const Usuario = require('../src/models/Usuario');
const Telefono = require('../src/models/Telefono');
const RedSocial = require('../src/models/RedSocial');
const PerfilSocial = require('../src/models/PerfilSocial');

const error400 = mensaje => ({ statusCode: 400, message: mensaje });

function usuarioCompleto() {
  return new Usuario(1, '  Ana ', '', 'Lopez', null, '1990-01-15', 'Bogota');
}

test('Usuario: limpia los textos y guarda como null los opcionales vacios', () => {
  const usuario = usuarioCompleto();
  assert.equal(usuario.primerNombre, 'Ana');
  assert.equal(usuario.segundoNombre, null);
  assert.equal(usuario.estado, 1);
  usuario.validarDatos();
});

test('Usuario: puede crearse solo con el id (para buscarlo)', () => {
  const usuario = new Usuario('7');
  assert.equal(usuario.id, 7);
  assert.equal(usuario.primerNombre, null);
  assert.equal(usuario.edad, null);
  usuario.validarIdentificador();
  assert.throws(() => usuario.validarDatos(), error400('El campo primerNombre es obligatorio'));
  assert.throws(() => new Usuario().validarIdentificador(), error400('El campo id es obligatorio'));
});

test('Usuario: constructor y setters rechazan datos invalidos', () => {
  for (const id of ['abc', '1 OR 1=1', 0, -1, 1.5, {}, [1]]) {
    assert.throws(() => new Usuario(id), error400('El campo id debe ser un entero positivo'), `id ${JSON.stringify(id)}`);
  }
  const usuario = usuarioCompleto();
  assert.throws(() => (usuario.primerNombre = 123), { statusCode: 400 });
  assert.throws(() => (usuario.primerNombre = ''), { statusCode: 400 });
  assert.throws(() => (usuario.primerApellido = 'x'.repeat(46)), error400('El campo primerApellido no puede superar 45 caracteres'));
  assert.throws(() => (usuario.segundoNombre = 5), error400('El campo segundoNombre debe ser texto'));
  assert.throws(() => (usuario.estado = 2), error400('El campo estado debe ser 0 o 1'));
  for (const valor of ['abc', '2026-02-30', '2025-13-01', 5, new Date('x'), undefined]) {
    assert.throws(() => (usuario.fechaNacimiento = valor), { statusCode: 400 }, `fecha ${String(valor)}`);
  }
  // Un valor rechazado no modifica el objeto
  assert.equal(usuario.primerNombre, 'Ana');
  assert.equal(usuario.fechaNacimiento, '1990-01-15');
});

test('Usuario: la fecha de nacimiento puede ser hoy, pero no futura', () => {
  const hoy = new Date();
  const dia = desfase => new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + desfase);
  const texto = fecha =>
    [fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate()].map(n => String(n).padStart(2, '0')).join('-');
  const futura = error400('El campo fechaNacimiento no puede ser una fecha futura');
  const usuario = usuarioCompleto();

  for (const valor of [texto(dia(1)), dia(1), '2999-01-01']) {
    assert.throws(() => (usuario.fechaNacimiento = valor), futura, `fecha ${String(valor)}`);
  }
  assert.equal(usuario.fechaNacimiento, '1990-01-15', 'el valor rechazado no modifica el objeto');
  assert.throws(() => new Usuario(1, 'Ana', null, 'Lopez', null, texto(dia(1)), 'Cali'), futura);

  for (const valor of [texto(dia(0)), dia(0)]) {
    usuario.fechaNacimiento = valor;
    assert.equal(usuario.edad, 0);
  }
});

test('Usuario: calcularEdad respeta el dia del cumpleanios (texto y Date)', () => {
  for (const fechaNacimiento of ['1996-11-27', new Date(1996, 10, 27)]) {
    const usuario = new Usuario(1, 'Ana', null, 'Lopez', null, fechaNacimiento, 'Cali');
    assert.equal(usuario.calcularEdad(new Date(2026, 10, 26)), 29, 'un dia antes');
    assert.equal(usuario.calcularEdad(new Date(2026, 10, 27)), 30, 'el mismo dia');
    assert.equal(usuario.calcularEdad(new Date(2026, 10, 28)), 30, 'un dia despues');
  }
});

test('Usuario: calcularEdad con nacimiento en 29 de febrero', () => {
  const usuario = new Usuario(1, 'Ana', null, 'Lopez', null, '2000-02-29', 'Cali');
  assert.equal(usuario.calcularEdad(new Date(2025, 1, 28)), 24);
  assert.equal(usuario.calcularEdad(new Date(2025, 2, 1)), 25);
});

test('Usuario: edad es de solo lectura y los getters no exponen el estado interno', () => {
  assert.equal(Object.getOwnPropertyDescriptor(Usuario.prototype, 'edad').set, undefined);

  const usuario = new Usuario(1, 'Ana', null, 'Lopez', null, new Date(1990, 0, 15), 'Cali');
  usuario.fechaNacimiento.setFullYear(2020);
  assert.equal(usuario.fechaNacimiento.getFullYear(), 1990);

  usuario.telefonos.push('intruso');
  usuario.perfilesSociales.push('intruso');
  assert.deepEqual(usuario.telefonos, []);
  assert.deepEqual(usuario.perfilesSociales, []);
});

test('Usuario: toJSON conserva el contrato de la API', () => {
  const json = usuarioCompleto().toJSON();
  assert.deepEqual(Object.keys(json), [
    'id', 'primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido', 'nombreCompleto',
    'fechaNacimiento', 'edad', 'ciudadDomicilio', 'estado', 'telefonos', 'perfilesSociales'
  ]);
  assert.equal(json.nombreCompleto, 'Ana Lopez');
});

test('Telefono: el dueno es un id o un Usuario, y activo solo admite 0/1', () => {
  assert.equal(new Telefono(1, '300', 'movil', '4').usuario, 4);
  const dueno = usuarioCompleto();
  assert.equal(new Telefono(1, '300', 'movil', dueno).usuario, dueno);
  assert.throws(() => new Telefono(1, '300', 'movil', { id: 1 }), error400('El campo usuarioId debe ser un entero positivo'));

  const telefono = new Telefono(null, '300', 'movil', 1);
  assert.equal(telefono.activo, 1);
  telefono.activo = false;
  assert.equal(telefono.activo, 0);
  assert.throws(() => (telefono.activo = 'si'), error400('El campo activo debe ser 0 o 1'));
  assert.throws(() => new Telefono(null, '300', 'movil').validarDatos(), error400('El campo usuarioId es obligatorio'));
});

test('RedSocial: valida nombre y url', () => {
  assert.throws(() => new RedSocial(null, 'GitHub', 'x'.repeat(46)), { statusCode: 400 });
  assert.throws(() => new RedSocial(null, 'GitHub').validarDatos(), error400('El campo url es obligatorio'));
  assert.deepEqual(new RedSocial('2', ' GitHub ', 'https://github.com').toJSON(), {
    id: 2,
    nombre: 'GitHub',
    url: 'https://github.com'
  });
});

test('PerfilSocial: exige la llave compuesta completa y valida la url', () => {
  assert.throws(() => new PerfilSocial(1).validarIdentificador(), error400('El campo usuarioId es obligatorio'));
  assert.throws(() => new PerfilSocial('x', 1), error400('El campo redSocialId debe ser un entero positivo'));
  assert.throws(() => new PerfilSocial(1, 1, 9), error400('El campo urlPerfil debe ser texto'));
  assert.equal(new PerfilSocial(1, 1, '  ').urlPerfil, null);
});
