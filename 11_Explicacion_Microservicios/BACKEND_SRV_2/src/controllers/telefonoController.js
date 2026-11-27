// Controlador de Telefono.
const TelefonoService = require('../services/telefonoService');

const telefonoService = new TelefonoService();

// GET /api/telefonos -> lista todos los telefonos
async function listar(req, res, next) {
  try {
    const telefonos = await telefonoService.listar();
    res.status(200).json(telefonos.map(t => t.toJSON()));
  } catch (error) {
    next(error);
  }
}

// GET /api/telefonos/usuario/:usuarioId -> telefonos de un usuario especifico
async function listarPorUsuario(req, res, next) {
  try {
    const telefonos = await telefonoService.listarPorUsuario(req.params.usuarioId);
    res.status(200).json(telefonos.map(t => t.toJSON()));
  } catch (error) {
    next(error);
  }
}

// POST /api/telefonos -> crea un nuevo telefono
async function crear(req, res, next) {
  try {
    const telefono = await telefonoService.crear(req.body);
    res.status(201).json(telefono.toJSON());
  } catch (error) {
    next(error);
  }
}

// PUT /api/telefonos/:id -> actualiza un telefono existente
async function actualizar(req, res, next) {
  try {
    const telefono = await telefonoService.actualizar(req.params.id, req.body);
    res.status(200).json(telefono.toJSON());
  } catch (error) {
    next(error);
  }
}

// DELETE /api/telefonos/:id -> elimina fisicamente un telefono
async function eliminar(req, res, next) {
  try {
    await telefonoService.eliminar(req.params.id);
    res.status(200).json({ mensaje: 'Telefono eliminado correctamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, listarPorUsuario, crear, actualizar, eliminar };
