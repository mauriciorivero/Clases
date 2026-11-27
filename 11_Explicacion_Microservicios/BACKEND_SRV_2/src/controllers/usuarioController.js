// Controlador de Usuario: interpreta la peticion HTTP, delega en el service
// y arma la respuesta. No contiene logica de negocio ni SQL.
const UsuarioService = require('../services/usuarioService');
const TelefonoService = require('../services/telefonoService');
const PerfilSocialService = require('../services/perfilSocialService');

// UsuarioService recibe los services que necesita para armar el detalle de un usuario
const usuarioService = new UsuarioService(new TelefonoService(), new PerfilSocialService());

// GET /api/usuarios -> lista los usuarios activos (vista resumen, sin relaciones)
async function listar(req, res, next) {
  try {
    const usuarios = await usuarioService.listar();
    res.status(200).json(usuarios.map(u => u.toJSON()));
  } catch (error) {
    next(error);
  }
}

// GET /api/usuarios/:id -> detalle completo (con telefonos y perfiles sociales)
async function obtener(req, res, next) {
  try {
    const usuario = await usuarioService.obtenerDetalle(req.params.id);
    res.status(200).json(usuario.toJSON());
  } catch (error) {
    next(error);
  }
}

// POST /api/usuarios -> crea un nuevo usuario
async function crear(req, res, next) {
  try {
    const usuario = await usuarioService.crear(req.body);
    res.status(201).json(usuario.toJSON());
  } catch (error) {
    next(error);
  }
}

// PUT /api/usuarios/:id -> actualiza un usuario existente
async function actualizar(req, res, next) {
  try {
    const usuario = await usuarioService.actualizar(req.params.id, req.body);
    res.status(200).json(usuario.toJSON());
  } catch (error) {
    next(error);
  }
}

// DELETE /api/usuarios/:id -> borrado logico (estado = 0)
async function eliminar(req, res, next) {
  try {
    await usuarioService.eliminar(req.params.id);
    res.status(200).json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
