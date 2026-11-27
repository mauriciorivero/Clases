// ==========================================================
// js/generar-code-files.js
// Vuelve a crear js/code-files.js a partir de los archivos reales
// del proyecto. Ejecutalo despues de cambiar el codigo:
//
//   node diapositivas_instruccion/js/generar-code-files.js
//
// La lista es explicita a proposito: los .env (con claves reales)
// nunca deben terminar dentro de la presentacion.
// Si cambian las lineas de un archivo, revisa tambien los rangos
// "range" y "focus" que lo usan en js/slides.js.
// ==========================================================
const fs = require('node:fs');
const path = require('node:path');

const PROYECTO = path.join(__dirname, '../..');

const ARCHIVOS = [
  'parametrization/db_relational_model/DB_authentication_model.sql',

  'BACKEND_SRV_1/package.json',
  'BACKEND_SRV_1/.env.example',
  'BACKEND_SRV_1/.gitignore',
  'BACKEND_SRV_1/src/index.js',
  'BACKEND_SRV_1/src/config/app.js',
  'BACKEND_SRV_1/src/config/database.js',
  'BACKEND_SRV_1/src/config/environment.js',
  'BACKEND_SRV_1/src/routes/index.js',
  'BACKEND_SRV_1/src/routes/authRoutes.js',
  'BACKEND_SRV_1/src/controllers/authController.js',
  'BACKEND_SRV_1/src/services/authService.js',
  'BACKEND_SRV_1/src/models/Cuenta.js',
  'BACKEND_SRV_1/src/middleware/validateInput.js',
  'BACKEND_SRV_1/src/middleware/errorHandler.js',
  'BACKEND_SRV_1/src/utils/helpers.js',
  'BACKEND_SRV_1/src/utils/password.js',
  'BACKEND_SRV_1/src/utils/token.js',
  'BACKEND_SRV_1/src/utils/validators.js',

  'BACKEND_SRV_2/package.json',
  'BACKEND_SRV_2/.env.example',
  'BACKEND_SRV_2/src/index.js',
  'BACKEND_SRV_2/src/config/app.js',
  'BACKEND_SRV_2/src/config/environment.js',
  'BACKEND_SRV_2/src/middleware/autenticacion.js',

  'FRONTEND/login.html',
  'FRONTEND/index.html',
  'FRONTEND/js/config.js',
  'FRONTEND/js/login.js',
  'FRONTEND/js/main.js',
  'FRONTEND/js/utils/sesion.js',
  'FRONTEND/js/api/authApi.js',
  'FRONTEND/js/api/usuariosApi.js',
];

const contenido = {};
for (const archivo of ARCHIVOS) {
  contenido[archivo] = fs.readFileSync(path.join(PROYECTO, archivo), 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '');
}

const salida = [
  '// ==========================================================',
  '// js/code-files.js',
  '// GENERADO por js/generar-code-files.js: no lo edites a mano.',
  '// Codigo fuente del proyecto que se muestra en las diapositivas.',
  '// ==========================================================',
  'window.CODE_FILES = {',
  ...Object.entries(contenido).map(([nombre, texto]) => `  ${JSON.stringify(nombre)}: ${JSON.stringify(texto)},`),
  '};',
  '',
].join('\n');

fs.writeFileSync(path.join(__dirname, 'code-files.js'), salida);
console.log(`code-files.js generado con ${ARCHIVOS.length} archivos`);
