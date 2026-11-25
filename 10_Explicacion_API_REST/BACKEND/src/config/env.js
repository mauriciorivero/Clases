// ==========================================================
// config/env.js
// Carga y valida las variables de entorno desde el archivo .env
// usando la libreria dotenv. Centralizar esto evita repetir
// "require('dotenv').config()" en cada archivo del proyecto.
// ==========================================================

const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

// Variables que la aplicacion necesita si o si para funcionar
const VARIABLES_REQUERIDAS = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

VARIABLES_REQUERIDAS.forEach((nombreVariable) => {
  if (process.env[nombreVariable] === undefined) {
    throw new Error(`Falta la variable de entorno obligatoria: ${nombreVariable}. Revisa tu archivo .env`);
  }
});

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT),
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME,
};
