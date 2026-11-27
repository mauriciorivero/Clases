// Carga las variables de entorno definidas en el archivo .env
// y las expone de forma centralizada para el resto de la aplicacion.
require('dotenv').config();

// Objeto de configuracion con valores por defecto por si falta alguna variable en .env
const environment = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'personal_management',
    user: process.env.DB_USER || 'personal_manager',
    password: process.env.DB_PASSWORD || ''
  },
  server: {
    port: Number(process.env.SERVER_PORT) || 3000
  },
  jwt: {
    // Mismo secreto de BACKEND_SRV_1; sin valor por defecto a proposito
    secret: process.env.JWT_SECRET || ''
  }
};

module.exports = environment;
