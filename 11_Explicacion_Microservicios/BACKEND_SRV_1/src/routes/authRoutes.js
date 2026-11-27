// Rutas de autenticacion: /api/auth
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { validarCon } = require('../middleware/validateInput');
const { validarCredenciales } = require('../utils/validators');

router.post('/login', validarCon(validarCredenciales), authController.iniciarSesion);

module.exports = router;
