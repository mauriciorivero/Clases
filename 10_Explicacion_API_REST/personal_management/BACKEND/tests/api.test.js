// Pruebas de integracion: la API completa (rutas, controladores, services y modelos)
// contra un MySQL temporal. La configuracion se fija antes de cargar la aplicacion.
const test = require('node:test');
const assert = require('node:assert/strict');
const { iniciarMysqlTemporal } = require('./mysqlTemporal');

let mysqlTemporal;
let servidor;
let pool;
let base;

test.before(async () => {
  mysqlTemporal = await iniciarMysqlTemporal();
  Object.assign(process.env, {
    DB_HOST: '127.0.0.1',
    DB_PORT: String(mysqlTemporal.puerto),
    DB_NAME: 'personal_management',
    DB_USER: 'root',
    DB_PASSWORD: '',
    CORS_ORIGIN: 'http://localhost:8000'
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

async function pedir(metodo, url, cuerpo) {
  const respuesta = await fetch(base + url, {
    method: metodo,
    headers: cuerpo === undefined ? {} : { 'Content-Type': 'application/json' },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo)
  });
  return { status: respuesta.status, body: await respuesta.json() };
}

async function esperar(status, metodo, url, cuerpo) {
  const respuesta = await pedir(metodo, url, cuerpo);
  assert.equal(respuesta.status, status, `${metodo} ${url} -> ${JSON.stringify(respuesta.body)}`);
  return respuesta.body;
}

const ana = {
  primerNombre: ' Ana ',
  segundoNombre: '',
  primerApellido: 'Lopez',
  fechaNacimiento: '1990-01-15',
  ciudadDomicilio: 'Bogota',
  edad: 999,
  estado: 0
};

// Fecha aaaa-mm-dd de quien cumple "anios" anios dentro de "dias" dias
function nacidoHace(anios, dias) {
  const hoy = new Date();
  const fecha = new Date(hoy.getFullYear() - anios, hoy.getMonth(), hoy.getDate() + dias);
  const dos = numero => String(numero).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

let usuarioId;
let redId;
let telefonoId;

test('usuarios: crear, consultar, listar y actualizar', async () => {
  const creado = await esperar(201, 'POST', '/api/usuarios', ana);
  usuarioId = creado.id;
  assert.equal(creado.primerNombre, 'Ana');
  assert.equal(creado.segundoNombre, null);
  assert.equal(creado.estado, 1, 'el estado enviado por el cliente se ignora');
  assert.notEqual(creado.edad, 999, 'la edad enviada por el cliente se ignora');
  assert.match(creado.fechaNacimiento, /^1990-01-15T/);

  assert.equal((await esperar(200, 'GET', '/api/usuarios')).length, 1);

  const editado = await esperar(200, 'PUT', `/api/usuarios/${usuarioId}`, { ...ana, ciudadDomicilio: 'Cali' });
  assert.equal(editado.ciudadDomicilio, 'Cali');
});

test('usuarios: errores de validacion y registros inexistentes', async () => {
  const sinDatos = await esperar(400, 'POST', '/api/usuarios', {});
  assert.equal(sinDatos.detalles.length, 4);
  await esperar(400, 'POST', '/api/usuarios', { ...ana, primerNombre: 'x'.repeat(46) });
  await esperar(400, 'POST', '/api/usuarios', { ...ana, fechaNacimiento: '2026-02-30' });
  await esperar(400, 'PUT', `/api/usuarios/${usuarioId}`, { primerNombre: 'solo' });
  await esperar(400, 'GET', '/api/usuarios/abc');
  await esperar(404, 'GET', '/api/usuarios/9999');
  await esperar(404, 'PUT', '/api/usuarios/9999', ana);
  await esperar(404, 'DELETE', '/api/usuarios/9999');
});

test('usuarios: no se acepta una fecha de nacimiento futura', async () => {
  const futura = { ...ana, fechaNacimiento: nacidoHace(0, 1) };
  const mensaje = 'El campo fechaNacimiento no puede ser una fecha futura';
  assert.equal((await esperar(400, 'POST', '/api/usuarios', futura)).error, mensaje);
  assert.equal((await esperar(400, 'PUT', `/api/usuarios/${usuarioId}`, futura)).error, mensaje);

  const recienNacido = await esperar(201, 'POST', '/api/usuarios', { ...ana, fechaNacimiento: nacidoHace(0, 0) });
  assert.equal(recienNacido.edad, 0);
  await esperar(200, 'DELETE', `/api/usuarios/${recienNacido.id}`);
});

test('usuarios: la edad es correcta el dia antes del cumpleanios y no queda desactualizada', async () => {
  const manana = await esperar(201, 'POST', '/api/usuarios', { ...ana, fechaNacimiento: nacidoHace(30, 1) });
  const hoy = await esperar(201, 'POST', '/api/usuarios', { ...ana, fechaNacimiento: nacidoHace(30, 0) });
  assert.equal(manana.edad, 29);
  assert.equal(hoy.edad, 30);

  const [[fila]] = await pool.execute('SELECT edad FROM USUARIO WHERE id = ?', [manana.id]);
  assert.equal(fila.edad, 29, 'la edad se guarda en la columna');

  await pool.execute('UPDATE USUARIO SET edad = 5 WHERE id = ?', [manana.id]);
  assert.equal((await esperar(200, 'GET', `/api/usuarios/${manana.id}`)).edad, 29, 'la edad se calcula al leer');

  await esperar(200, 'DELETE', `/api/usuarios/${manana.id}`);
  await esperar(200, 'DELETE', `/api/usuarios/${hoy.id}`);
});

test('usuarios: el borrado es logico', async () => {
  const otro = await esperar(201, 'POST', '/api/usuarios', ana);
  await esperar(200, 'DELETE', `/api/usuarios/${otro.id}`);

  const activos = await esperar(200, 'GET', '/api/usuarios');
  assert.ok(!activos.some(usuario => usuario.id === otro.id));
  assert.equal((await esperar(200, 'GET', `/api/usuarios/${otro.id}`)).estado, 0);
});

test('un texto con SQL se guarda literalmente', async () => {
  const nombre = "Robert'); DROP TABLE USUARIO;--";
  const creado = await esperar(201, 'POST', '/api/usuarios', { ...ana, primerNombre: nombre });
  assert.equal(creado.primerNombre, nombre);
  await esperar(200, 'GET', '/api/usuarios');
  await esperar(200, 'DELETE', `/api/usuarios/${creado.id}`);
});

test('redes sociales: CRUD y validaciones', async () => {
  redId = (await esperar(201, 'POST', '/api/redes-sociales', { nombre: 'GitHub', url: 'https://github.com' })).id;
  const temporal = (await esperar(201, 'POST', '/api/redes-sociales', { nombre: 'Otra', url: 'u' })).id;

  assert.equal((await esperar(200, 'PUT', `/api/redes-sociales/${redId}`, { nombre: 'GH', url: 'u' })).nombre, 'GH');
  assert.equal((await esperar(200, 'GET', '/api/redes-sociales')).length, 2);

  await esperar(400, 'POST', '/api/redes-sociales', { nombre: 'x' });
  await esperar(400, 'PUT', '/api/redes-sociales/abc', { nombre: 'a', url: 'b' });
  await esperar(404, 'PUT', '/api/redes-sociales/9999', { nombre: 'a', url: 'b' });
  await esperar(200, 'DELETE', `/api/redes-sociales/${temporal}`);
  await esperar(404, 'DELETE', `/api/redes-sociales/${temporal}`);
});

test('telefonos: CRUD, valor por defecto de activo y dueno fijo', async () => {
  const datos = { numeroTelefono: '3001234567', tipoTelefono: 'movil', usuarioId };
  const creado = await esperar(201, 'POST', '/api/telefonos', datos);
  telefonoId = creado.id;
  assert.equal(creado.activo, 1);
  assert.equal((await esperar(201, 'POST', '/api/telefonos', { ...datos, activo: null })).activo, 1);

  const editado = await esperar(200, 'PUT', `/api/telefonos/${telefonoId}`, { ...datos, usuarioId: 9999, activo: 0 });
  assert.equal(editado.activo, 0);
  assert.equal(editado.usuarioId, usuarioId, 'el dueno no cambia');

  assert.equal((await esperar(200, 'GET', '/api/telefonos')).length, 2);
  assert.equal((await esperar(200, 'GET', `/api/telefonos/usuario/${usuarioId}`)).length, 2);

  await esperar(400, 'POST', '/api/telefonos', { ...datos, usuarioId: 9999 });
  await esperar(400, 'POST', '/api/telefonos', { ...datos, activo: 2 });
  await esperar(400, 'GET', '/api/telefonos/usuario/abc');
  await esperar(404, 'PUT', '/api/telefonos/9999', datos);
  await esperar(404, 'DELETE', '/api/telefonos/9999');
});

test('perfiles sociales: CRUD con llave compuesta', async () => {
  const datos = { redSocialId: redId, usuarioId, urlPerfil: 'https://github.com/ana' };
  const creado = await esperar(201, 'POST', '/api/perfiles-sociales', datos);
  assert.equal(creado.usuario, 'Ana Lopez');
  assert.equal(creado.redSocial.id, redId);

  await esperar(409, 'POST', '/api/perfiles-sociales', datos);
  await esperar(400, 'POST', '/api/perfiles-sociales', { ...datos, redSocialId: 9999 });
  await esperar(409, 'DELETE', `/api/redes-sociales/${redId}`);

  const ruta = `/api/perfiles-sociales/${redId}/${usuarioId}`;
  assert.equal((await esperar(200, 'PUT', ruta, { urlPerfil: 'nueva' })).urlPerfil, 'nueva');
  assert.equal((await esperar(200, 'GET', '/api/perfiles-sociales')).length, 1);
  assert.equal((await esperar(200, 'GET', `/api/perfiles-sociales/usuario/${usuarioId}`)).length, 1);

  const detalle = await esperar(200, 'GET', `/api/usuarios/${usuarioId}`);
  assert.equal(detalle.telefonos.length, 2);
  assert.equal(detalle.perfilesSociales.length, 1);

  await esperar(200, 'DELETE', ruta);
  await esperar(404, 'DELETE', ruta);
  await esperar(404, 'PUT', ruta, { urlPerfil: 'a' });
  await esperar(200, 'DELETE', `/api/redes-sociales/${redId}`);
  await esperar(200, 'DELETE', `/api/telefonos/${telefonoId}`);
});

test('CORS y rutas desconocidas', async () => {
  const preflight = await fetch(`${base}/api/usuarios`, {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:8000', 'Access-Control-Request-Method': 'PUT' }
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://localhost:8000');

  const ajeno = await fetch(`${base}/api/usuarios`, { headers: { Origin: 'http://otro.example' } });
  assert.equal(ajeno.headers.get('access-control-allow-origin'), null);

  await esperar(404, 'GET', '/api/no-existe');
});
