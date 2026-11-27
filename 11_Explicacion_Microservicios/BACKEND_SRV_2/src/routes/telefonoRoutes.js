// Definicion de rutas para el recurso /api/telefonos
const express = require('express');
const router = express.Router();
const telefonoController = require('../controllers/telefonoController');
const { validarCon } = require('../middleware/validateInput');
const { validarTelefono } = require('../utils/validators');

router.get('/', telefonoController.listar);
router.get('/usuario/:usuarioId', telefonoController.listarPorUsuario);
router.post('/', validarCon(validarTelefono), telefonoController.crear);
router.put('/:id', validarCon(validarTelefono), telefonoController.actualizar);
router.delete('/:id', telefonoController.eliminar);

module.exports = router;
