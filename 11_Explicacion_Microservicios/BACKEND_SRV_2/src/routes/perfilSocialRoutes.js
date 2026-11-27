// Definicion de rutas para el recurso /api/perfiles-sociales
const express = require('express');
const router = express.Router();
const perfilSocialController = require('../controllers/perfilSocialController');
const { validarCon } = require('../middleware/validateInput');
const { validarPerfilSocial } = require('../utils/validators');

router.get('/', perfilSocialController.listar);
router.get('/usuario/:usuarioId', perfilSocialController.listarPorUsuario);
router.post('/', validarCon(validarPerfilSocial), perfilSocialController.crear);
router.put('/:redSocialId/:usuarioId', perfilSocialController.actualizar);
router.delete('/:redSocialId/:usuarioId', perfilSocialController.eliminar);

module.exports = router;
