// Cuenta de acceso. No guarda la contrasenia ni su hash, asi nunca pueden
// terminar por error en una respuesta de la API.
const { crearError } = require('../utils/helpers');

const LARGO_MAXIMO_USERNAME = 45; // columna VARCHAR(45)

class Cuenta {
  #id;
  #username;

  constructor(id, username) {
    if (id !== undefined && id !== null) this.id = id;
    if (username !== undefined && username !== null) this.username = username;
  }

  get id() {
    return this.#id;
  }

  set id(valor) {
    if (!Number.isInteger(valor) || valor <= 0) {
      throw crearError('El campo id debe ser un entero positivo', 400);
    }
    this.#id = valor;
  }

  get username() {
    return this.#username;
  }

  set username(valor) {
    const texto = typeof valor === 'string' ? valor.trim() : '';
    if (texto.length === 0 || texto.length > LARGO_MAXIMO_USERNAME) {
      throw crearError(`El campo username debe tener entre 1 y ${LARGO_MAXIMO_USERNAME} caracteres`, 400);
    }
    this.#username = texto;
  }

  toJSON() {
    return { id: this.#id, username: this.#username };
  }
}

module.exports = Cuenta;
