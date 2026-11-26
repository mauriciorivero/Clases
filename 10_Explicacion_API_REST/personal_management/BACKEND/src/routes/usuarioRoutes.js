// Definicion de rutas para el recurso /api/usuarios
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { validarCon } = require('../middleware/validateInput');
const { validarUsuario } = require('../utils/validators');

router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.obtener);
router.post('/', validarCon(validarUsuario), usuarioController.crear);
router.put('/:id', validarCon(validarUsuario), usuarioController.actualizar);
router.delete('/:id', usuarioController.eliminar);

module.exports = router;
