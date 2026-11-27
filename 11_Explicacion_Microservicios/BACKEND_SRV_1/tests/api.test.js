// Pruebas de integracion del login contra un MySQL temporal creado con el script real.
// La aplicacion se conecta como personal_manager, con los permisos que da el script.
const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { iniciarMysqlTemporal, CLAVE_APP } = require('./mysqlTemporal');

const SECRETO = 'secreto-de-pruebas';
let mysqlTemporal;
let servidor;
let pool;
let base;

test.before(async () => {
  mysqlTemporal = await iniciarMysqlTemporal();
  Object.assign(process.env, {
    DB_HOST: '127.0.0.1',
    DB_PORT: String(mysqlTemporal.puerto),
    DB_NAME: 'authentication',
    DB_USER: 'personal_manager',
    DB_PASSWORD: CLAVE_APP,
    JWT_SECRET: SECRETO,
    JWT_EXPIRES_IN: '1h'
  });

  test.mock.method(console, 'error', () => {}); // los errores esperados no ensucian la salida
  const app = require('../src/config/app');
  ({ pool } = require('../src/config/database'));
  assert.equal(require('../src/config/environment').db.port, mysqlTemporal.puerto);

  await new Promise(resolve => (servidor = app.listen(0, resolve)));
  base = `http://127.0.0.1:${servidor.address().port}`;
}, { timeout: 120000 });

test.after(async () => {
  servidor?.close();
  await pool?.end();
  await mysqlTemporal?.detener();
});

async function login(cuerpo, crudo = JSON.stringify(cuerpo)) {
  const respuesta = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: crudo
  });
  return { status: respuesta.status, body: await respuesta.json() };
}

test('la cuenta de prueba inicia sesion y recibe un token valido', async () => {
  const { status, body } = await login({ username: 'admin', password: 'Admin123*' });
  assert.equal(status, 200, JSON.stringify(body));
  assert.deepEqual(body.usuario, { id: 1, username: 'admin' }, 'la respuesta no expone el hash');

  const datos = jwt.verify(body.token, SECRETO, { algorithms: ['HS256'] });
  assert.equal(datos.sub, '1');
  assert.equal(datos.username, 'admin');
  assert.equal(datos.exp - datos.iat, 3600);
});

test('contrasenia errada y usuario inexistente responden igual', async () => {
  const mala = await login({ username: 'admin', password: 'Admin123' });
  const nadie = await login({ username: 'nadie', password: 'Admin123*' });
  const inyeccion = await login({ username: "' OR '1'='1", password: 'x' });

  for (const respuesta of [mala, nadie, inyeccion]) {
    assert.equal(respuesta.status, 401);
    assert.deepEqual(respuesta.body, { error: 'Usuario o contrasenia incorrectos' });
  }
});

test('datos incompletos o invalidos responden 400', async () => {
  assert.equal((await login({})).body.detalles.length, 2);
  assert.equal((await login({ username: 'admin', password: 123 })).status, 400);
  assert.equal((await login({ username: 'x'.repeat(46), password: 'x' })).status, 400);
});

test('un JSON mal formado no deja la contrasenia en los registros', async () => {
  console.error.mock.resetCalls();
  const { status } = await login(null, '{"username":"admin","password":SuperSecreta}');
  assert.equal(status, 400);
  assert.equal(console.error.mock.callCount(), 0);
});

test('la base guarda sal y hash, y la aplicacion solo puede leer', async () => {
  const [filas] = await pool.execute('SELECT username, password FROM CUENTA');
  assert.equal(filas.length, 1, 'repetir el script no duplica la cuenta');
  assert.match(filas[0].password, /^[0-9a-f]{32}:[0-9a-f]{64}$/);

  await assert.rejects(pool.execute('DELETE FROM CUENTA'), { code: 'ER_TABLEACCESS_DENIED_ERROR' });
});
