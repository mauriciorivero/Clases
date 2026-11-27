// Configuracion principal de la aplicacion Express: middlewares globales,
// montaje de rutas y manejo de errores. No inicia el servidor (ver src/index.js).
const express = require('express');
const cors = require('cors');
const rutas = require('../routes');
const errorHandler = require('../middleware/errorHandler');
const requiereAutenticacion = require('../middleware/autenticacion');

const app = express();

// CORS abierto: acepta peticiones desde cualquier origen (cualquier URL y puerto).
// El acceso a los datos lo protege el token (ver middleware/autenticacion.js); aun asi,
// antes de publicarla fuera de un entorno local conviene restringir los origenes.
app.use(cors());

// Permite que Express interprete automaticamente el body de las peticiones como JSON
app.use(express.json());

// Ruta de verificacion rapida (util para confirmar que el servidor esta arriba)
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de gestion personal funcionando correctamente' });
});

// Todas las rutas de la API quedan bajo el prefijo /api y exigen un token valido
app.use('/api', requiereAutenticacion, rutas);

// Middleware para rutas que no coinciden con ningun endpoint definido
app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

// Middleware de manejo de errores (siempre debe ir al final)
app.use(errorHandler);

module.exports = app;
