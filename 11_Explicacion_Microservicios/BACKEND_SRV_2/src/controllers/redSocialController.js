// Controlador de RedSocial.
const RedSocialService = require('../services/redSocialService');

const redSocialService = new RedSocialService();

// GET /api/redes-sociales -> lista el catalogo de redes sociales
async function listar(req, res, next) {
  try {
    const redesSociales = await redSocialService.listar();
    res.status(200).json(redesSociales.map(r => r.toJSON()));
  } catch (error) {
    next(error);
  }
}

// POST /api/redes-sociales -> crea una nueva red social
async function crear(req, res, next) {
  try {
    const redSocial = await redSocialService.crear(req.body);
    res.status(201).json(redSocial.toJSON());
  } catch (error) {
    next(error);
  }
}

// PUT /api/redes-sociales/:id -> actualiza una red social existente
async function actualizar(req, res, next) {
  try {
    const redSocial = await redSocialService.actualizar(req.params.id, req.body);
    res.status(200).json(redSocial.toJSON());
  } catch (error) {
    next(error);
  }
}

// DELETE /api/redes-sociales/:id -> elimina una red social (409 si tiene perfiles asociados)
async function eliminar(req, res, next) {
  try {
    await redSocialService.eliminar(req.params.id);
    res.status(200).json({ mensaje: 'Red social eliminada correctamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, crear, actualizar, eliminar };
