// Configura y expone el "pool" (piscina) de conexiones a MySQL.
// Usar un pool en lugar de una sola conexion permite atender varias
// peticiones concurrentes sin abrir/cerrar una conexion por cada una.
const mysql = require('mysql2/promise');
const environment = require('./environment');

const pool = mysql.createPool({
  host: environment.db.host,
  port: environment.db.port,
  database: environment.db.database,
  user: environment.db.user,
  password: environment.db.password,
  waitForConnections: true,
  connectionLimit: 10, // maximo de conexiones simultaneas en el pool
  queueLimit: 0
});

// Verifica que la conexion a la base de datos funcione correctamente.
// Se ejecuta una vez al iniciar el servidor para mostrar un mensaje claro
// en consola si las credenciales o el host son incorrectos.
async function verificarConexion() {
  try {
    const conexion = await pool.getConnection();
    console.log(
      `Conexion a MySQL exitosa (${environment.db.database}@${environment.db.host}:${environment.db.port})`
    );
    conexion.release();
  } catch (error) {
    console.error('No fue posible conectar a la base de datos MySQL:', error.message);
  }
}

module.exports = { pool, verificarConexion };
