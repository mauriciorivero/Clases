// Agrupa todas las rutas de la API bajo un unico router.
// app.js monta este router con el prefijo /api.
const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./usuarioRoutes');
const telefonoRoutes = require('./telefonoRoutes');
const redSocialRoutes = require('./redSocialRoutes');
const perfilSocialRoutes = require('./perfilSocialRoutes');

router.use('/usuarios', usuarioRoutes);
router.use('/telefonos', telefonoRoutes);
router.use('/redes-sociales', redSocialRoutes);
router.use('/perfiles-sociales', perfilSocialRoutes);

module.exports = router;
