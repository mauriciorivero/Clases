// Configura y expone el "pool" (piscina) de conexiones a la base de datos de autenticacion.
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

// Verifica que la conexion funcione. Se ejecuta una vez al iniciar el servidor
// para mostrar un mensaje claro si las credenciales, los permisos o el host fallan.
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
