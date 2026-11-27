// Logica de autenticacion: busca la cuenta y comprueba la contrasenia.
const { pool } = require('../config/database');
const Cuenta = require('../models/Cuenta');
const { generarHash, verificarPassword } = require('../utils/password');
const { crearError, registrarError } = require('../utils/helpers');

const SQL = Object.freeze({
  buscarPorUsername: 'SELECT id, username, password FROM CUENTA WHERE username = ?'
});

// Con un usuario inexistente se compara contra este hash, para que la respuesta
// tarde lo mismo y no revele que usuarios existen.
const HASH_SENUELO = generarHash('cuenta-inexistente');

class AuthService {
  // Devuelve la Cuenta (sin contrasenia) o lanza un 401
  async autenticar(username, password) {
    try {
      const { username: usernameLimpio } = new Cuenta(undefined, username);
      const [filas] = await pool.execute(SQL.buscarPorUsername, [usernameLimpio]);
      const [fila] = filas;

      const coincide = verificarPassword(password, fila ? fila.password : HASH_SENUELO);

      // Mismo mensaje en ambos casos, a proposito
      if (!fila || !coincide) {
        throw crearError('Usuario o contrasenia incorrectos', 401);
      }

      return new Cuenta(fila.id, fila.username);
    } catch (error) {
      registrarError('AuthService.autenticar', error);
      throw error;
    }
  }
}

module.exports = AuthService;
