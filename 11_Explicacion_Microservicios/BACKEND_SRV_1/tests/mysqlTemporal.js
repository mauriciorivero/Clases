// Servidor MySQL temporal y privado para las pruebas de integracion: usa su propia
// carpeta de datos y su propio puerto, asi nunca toca la base de datos de desarrollo.
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const mysql = require('mysql2/promise');

const ESQUEMA = path.join(__dirname, '../../parametrization/db_relational_model/DB_authentication_model.sql');
// Clave de la cuenta de la aplicacion, solo valida en el servidor temporal
const CLAVE_APP = 'clave-temporal';

function buscarMysqld() {
  const enPath = (process.env.PATH || '').split(path.delimiter).map(carpeta => path.join(carpeta, 'mysqld'));
  const candidatos = [process.env.MYSQLD_PATH, ...enPath, '/usr/local/mysql/bin/mysqld', '/usr/sbin/mysqld'];
  const encontrado = candidatos.find(ruta => ruta && fs.existsSync(ruta));
  if (!encontrado) {
    throw new Error('No se encontro mysqld: defina la variable MYSQLD_PATH con la ruta del ejecutable');
  }
  return encontrado;
}

function puertoLibre() {
  return new Promise((resolve, reject) => {
    const servidor = net.createServer();
    servidor.on('error', reject);
    servidor.listen(0, '127.0.0.1', () => {
      const { port } = servidor.address();
      servidor.close(() => resolve(port));
    });
  });
}

async function conectar(puerto, proceso) {
  for (let intento = 0; intento < 300; intento++) {
    if (proceso.exitCode !== null) break;
    try {
      return await mysql.createConnection({ host: '127.0.0.1', port: puerto, user: 'root', multipleStatements: true });
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  throw new Error('El servidor MySQL temporal no arranco');
}

// Arranca el servidor, crea la cuenta de la aplicacion, ejecuta el script real
// (dos veces: debe poder repetirse) y devuelve { puerto, detener }
async function iniciarMysqlTemporal() {
  const mysqld = buscarMysqld();
  const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'auth-mysql-'));
  const datos = path.join(carpeta, 'data');
  const opciones = ['--no-defaults', `--datadir=${datos}`, `--log-error=${path.join(carpeta, 'mysqld.log')}`];

  execFileSync(mysqld, [...opciones, '--initialize-insecure']);

  const puerto = await puertoLibre();
  // --socket relativo: se crea dentro de datadir y evita el limite de largo de la ruta
  const proceso = spawn(
    mysqld,
    [...opciones, `--port=${puerto}`, '--bind-address=127.0.0.1', '--socket=mysql.sock', '--mysqlx=OFF'],
    { stdio: 'ignore' }
  );
  const matar = () => proceso.kill('SIGKILL');
  process.on('exit', matar);

  async function detener() {
    if (proceso.exitCode === null) {
      const salida = new Promise(resolve => proceso.once('exit', resolve));
      proceso.kill('SIGTERM');
      await salida;
    }
    process.removeListener('exit', matar);
    fs.rmSync(carpeta, { recursive: true, force: true });
  }

  try {
    const conexion = await conectar(puerto, proceso);
    await conexion.query(`CREATE USER 'personal_manager'@'localhost' IDENTIFIED BY '${CLAVE_APP}'`);
    const script = fs.readFileSync(ESQUEMA, 'utf8');
    await conexion.query(script);
    await conexion.query(script);
    await conexion.end();
  } catch (error) {
    await detener();
    throw error;
  }

  return { puerto, detener };
}

module.exports = { iniciarMysqlTemporal, CLAVE_APP };
