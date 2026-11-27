// Carga las variables de entorno definidas en el archivo .env
// y las expone de forma centralizada para el resto de la aplicacion.
require('dotenv').config();

// Objeto de configuracion con valores por defecto por si falta alguna variable en .env.
// El secreto de los tokens no tiene valor por defecto a proposito.
const environment = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'authentication',
    user: process.env.DB_USER || 'personal_manager',
    password: process.env.DB_PASSWORD || ''
  },
  server: {
    port: Number(process.env.SERVER_PORT) || 3001
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h' // formato: 30m, 1h, 8h...
  }
};

module.exports = environment;
