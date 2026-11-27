// Definicion de rutas para el recurso /api/redes-sociales
const express = require('express');
const router = express.Router();
const redSocialController = require('../controllers/redSocialController');
const { validarCon } = require('../middleware/validateInput');
const { validarRedSocial } = require('../utils/validators');

router.get('/', redSocialController.listar);
router.post('/', validarCon(validarRedSocial), redSocialController.crear);
router.put('/:id', validarCon(validarRedSocial), redSocialController.actualizar);
router.delete('/:id', redSocialController.eliminar);

module.exports = router;
