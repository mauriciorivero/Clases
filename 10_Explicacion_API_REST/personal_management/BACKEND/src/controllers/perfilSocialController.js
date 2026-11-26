// Controlador de PerfilSocial (relacion Usuario <-> RedSocial).
const PerfilSocialService = require('../services/perfilSocialService');

const perfilSocialService = new PerfilSocialService();

// GET /api/perfiles-sociales -> lista todos los perfiles sociales
async function listar(req, res, next) {
  try {
    const perfiles = await perfilSocialService.listar();
    res.status(200).json(perfiles.map(p => p.toJSON()));
  } catch (error) {
    next(error);
  }
}

// GET /api/perfiles-sociales/usuario/:usuarioId -> perfiles sociales de un usuario
async function listarPorUsuario(req, res, next) {
  try {
    const perfiles = await perfilSocialService.listarPorUsuario(req.params.usuarioId);
    res.status(200).json(perfiles.map(p => p.toJSON()));
  } catch (error) {
    next(error);
  }
}

// POST /api/perfiles-sociales -> crea un nuevo perfil social
async function crear(req, res, next) {
  try {
    const perfil = await perfilSocialService.crear(req.body);
    res.status(201).json(perfil.toJSON());
  } catch (error) {
    next(error);
  }
}

// PUT /api/perfiles-sociales/:redSocialId/:usuarioId -> actualiza la url del perfil
async function actualizar(req, res, next) {
  try {
    const { redSocialId, usuarioId } = req.params;
    const perfil = await perfilSocialService.actualizar(redSocialId, usuarioId, req.body.urlPerfil);
    res.status(200).json(perfil.toJSON());
  } catch (error) {
    next(error);
  }
}

// DELETE /api/perfiles-sociales/:redSocialId/:usuarioId -> elimina el perfil social
async function eliminar(req, res, next) {
  try {
    const { redSocialId, usuarioId } = req.params;
    await perfilSocialService.eliminar(redSocialId, usuarioId);
    res.status(200).json({ mensaje: 'Perfil social eliminado correctamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, listarPorUsuario, crear, actualizar, eliminar };
