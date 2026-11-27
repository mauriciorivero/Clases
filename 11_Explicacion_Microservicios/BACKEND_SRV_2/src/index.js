// Punto de entrada de la aplicacion: arranca el servidor HTTP con la app de Express
// definida en config/app.js y verifica la conexion a la base de datos.
const app = require('./config/app');
const environment = require('./config/environment');
const { verificarConexion } = require('./config/database');

// Sin secreto no se puede verificar ningun token: es mejor no arrancar
if (!environment.jwt.secret) {
  console.error('Falta la variable JWT_SECRET en el archivo .env');
  process.exit(1);
}

const PUERTO = environment.server.port;

app.listen(PUERTO, async () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
  await verificarConexion();
});
