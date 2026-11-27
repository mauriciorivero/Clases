// Agrupa todas las rutas de la API bajo un unico router.
// app.js monta este router con el prefijo /api.
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');

router.use('/auth', authRoutes);

module.exports = router;
