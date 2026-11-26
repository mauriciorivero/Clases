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
  cors: {
    // Origenes permitidos para las peticiones del frontend (evita bloqueos CORS).
    // Admite una lista separada por comas en CORS_ORIGIN (ej: "http://localhost:8000,http://127.0.0.1:8000")
    origin: (process.env.CORS_ORIGIN || 'http://localhost:8000,http://127.0.0.1:8000')
      .split(',')
      .map(origen => origen.trim())
  }
};

module.exports = environment;
