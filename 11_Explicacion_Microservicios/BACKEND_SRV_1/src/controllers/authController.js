// Controlador de autenticacion: traduce la peticion HTTP en llamadas al service.
const AuthService = require('../services/authService');
const { firmarToken } = require('../utils/token');

const authService = new AuthService();

// POST /api/auth/login  { username, password }
async function iniciarSesion(req, res, next) {
  try {
    const { username, password } = req.body;
    const cuenta = await authService.autenticar(username, password);
    res.json({ token: firmarToken(cuenta), usuario: cuenta });
  } catch (error) {
    next(error);
  }
}

module.exports = { iniciarSesion };
