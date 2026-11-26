// Configuracion principal de la aplicacion Express: middlewares globales,
// montaje de rutas y manejo de errores. No inicia el servidor (ver src/index.js).
const express = require('express');
const cors = require('cors');
const environment = require('./environment');
const rutas = require('../routes');
const errorHandler = require('../middleware/errorHandler');

const app = express();

// Habilita CORS para que el frontend (servido en otro puerto/origen) pueda
// consumir esta API sin ser bloqueado por el navegador.
app.use(
  cors({
    origin: environment.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Permite que Express interprete automaticamente el body de las peticiones como JSON
app.use(express.json());

// Ruta de verificacion rapida (util para confirmar que el servidor esta arriba)
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de gestion personal funcionando correctamente' });
});

// Todas las rutas de la API quedan bajo el prefijo /api
app.use('/api', rutas);

// Middleware para rutas que no coinciden con ningun endpoint definido
app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

// Middleware de manejo de errores (siempre debe ir al final)
app.use(errorHandler);

module.exports = app;
