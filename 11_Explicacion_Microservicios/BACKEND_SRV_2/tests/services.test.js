// Pruebas de las clases de servicio con la base de datos simulada: comprueban que
// ningun dato invalido llega a SQL, que las consultas usan los valores del objeto de
// dominio y que los errores se registran y se relanzan sin modificarse.
const test = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../src/config/database');
const UsuarioService = require('../src/services/usuarioService');
const TelefonoService = require('../src/services/telefonoService');
const RedSocialService = require('../src/services/redSocialService');
const PerfilSocialService = require('../src/services/perfilSocialService');

const telefonos = new TelefonoService();
const perfiles = new PerfilSocialService();
const redes = new RedSocialService();
const usuarios = new UsuarioService(telefonos, perfiles);

test.after(() => pool.end());

function simularBaseDeDatos(t, responder = async () => [[]]) {
  const execute = t.mock.method(pool, 'execute', responder);
  const registro = t.mock.method(console, 'error', () => {});
  return { execute, registro };
}

test('ningun dato invalido llega a la base de datos', async t => {
  const { execute } = simularBaseDeDatos(t);
  const usuarioValido = {
    primerNombre: 'Ana', primerApellido: 'Lopez', fechaNacimiento: '1990-01-15', ciudadDomicilio: 'Cali'
  };
  const casos = [
    () => usuarios.obtenerDetalle('1 OR 1=1'),
    () => usuarios.obtenerDetalle(undefined),
    () => usuarios.crear({}),
    () => usuarios.crear({ ...usuarioValido, primerNombre: { a: 1 } }),
    () => usuarios.actualizar('abc', usuarioValido),
    () => usuarios.actualizar(1, { ...usuarioValido, fechaNacimiento: '2026-02-30' }),
    () => usuarios.crear({ ...usuarioValido, fechaNacimiento: '2999-01-01' }),
    () => usuarios.actualizar(1, { ...usuarioValido, fechaNacimiento: '2999-01-01' }),
    () => usuarios.eliminar(null),
    () => telefonos.listarPorUsuario('x'),
    () => telefonos.listarPorUsuario(undefined),
    () => telefonos.crear({ numeroTelefono: '300', tipoTelefono: 'movil' }),
    () => telefonos.actualizar(1, { numeroTelefono: '300', tipoTelefono: 'movil', usuarioId: 1, activo: 7 }),
    () => telefonos.eliminar('1;DROP TABLE TELEFONO'),
    () => redes.crear({ nombre: 'x' }),
    () => redes.actualizar(1, { nombre: ['x'], url: 'y' }),
    () => redes.eliminar(-3),
    () => perfiles.listarPorUsuario({}),
    () => perfiles.crear({ redSocialId: 1 }),
    () => perfiles.actualizar(1, 1, 99),
    () => perfiles.eliminar(1, undefined)
  ];

  for (const [indice, caso] of casos.entries()) {
    await assert.rejects(caso, { statusCode: 400 }, `caso ${indice}`);
  }
  assert.equal(execute.mock.callCount(), 0);
});

test('los parametros SQL salen del objeto de dominio ya limpio', async t => {
  const { execute } = simularBaseDeDatos(t, async sql =>
    sql.startsWith('INSERT') ? [{ insertId: 8 }] : [[{ id: 8, nombre: 'GitHub', url: 'u' }]]
  );

  const creada = await redes.crear({ nombre: '  GitHub ', url: ' u ', id: 999 });

  assert.deepEqual(execute.mock.calls[0].arguments[1], ['GitHub', 'u']);
  assert.deepEqual(execute.mock.calls[1].arguments[1], [8]);
  assert.equal(creada.id, 8);
});

test('un error de la base de datos se registra y se relanza intacto', async t => {
  const falla = Object.assign(new Error('Duplicate entry'), { code: 'ER_DUP_ENTRY' });
  const { registro } = simularBaseDeDatos(t, async () => {
    throw falla;
  });

  await assert.rejects(perfiles.crear({ redSocialId: 1, usuarioId: 1 }), error => error === falla);

  assert.deepEqual(registro.mock.calls[0].arguments, ['[PerfilSocialService.crear] Duplicate entry']);
});

test('todas las operaciones publicas registran su fallo', async t => {
  const { registro } = simularBaseDeDatos(t, async () => {
    throw new Error('sin conexion');
  });
  const datosTelefono = { numeroTelefono: '300', tipoTelefono: 'movil', usuarioId: 1 };
  const datosRed = { nombre: 'a', url: 'b' };
  const datosUsuario = {
    primerNombre: 'Ana', primerApellido: 'Lopez', fechaNacimiento: '1990-01-15', ciudadDomicilio: 'Cali'
  };
  const operaciones = {
    'UsuarioService.listar': () => usuarios.listar(),
    'UsuarioService.obtenerDetalle': () => usuarios.obtenerDetalle(1),
    'UsuarioService.crear': () => usuarios.crear(datosUsuario),
    'UsuarioService.actualizar': () => usuarios.actualizar(1, datosUsuario),
    'UsuarioService.eliminar': () => usuarios.eliminar(1),
    'TelefonoService.listar': () => telefonos.listar(),
    'TelefonoService.listarPorUsuario': () => telefonos.listarPorUsuario(1),
    'TelefonoService.crear': () => telefonos.crear(datosTelefono),
    'TelefonoService.actualizar': () => telefonos.actualizar(1, datosTelefono),
    'TelefonoService.eliminar': () => telefonos.eliminar(1),
    'RedSocialService.listar': () => redes.listar(),
    'RedSocialService.crear': () => redes.crear(datosRed),
    'RedSocialService.actualizar': () => redes.actualizar(1, datosRed),
    'RedSocialService.eliminar': () => redes.eliminar(1),
    'PerfilSocialService.listar': () => perfiles.listar(),
    'PerfilSocialService.listarPorUsuario': () => perfiles.listarPorUsuario(1),
    'PerfilSocialService.crear': () => perfiles.crear({ redSocialId: 1, usuarioId: 1 }),
    'PerfilSocialService.actualizar': () => perfiles.actualizar(1, 1, 'u'),
    'PerfilSocialService.eliminar': () => perfiles.eliminar(1, 1)
  };

  for (const [nombre, operacion] of Object.entries(operaciones)) {
    registro.mock.resetCalls();
    await assert.rejects(operacion, { message: 'sin conexion' });
    assert.deepEqual(registro.mock.calls.at(-1).arguments, [`[${nombre}] sin conexion`]);
  }
});
