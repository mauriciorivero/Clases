// Clase de dominio que representa una Red Social del catalogo (ej: Facebook, Instagram).
// Cada setter valida el valor que recibe, asi ningun objeto puede contener datos invalidos.
const { textoRequerido, enteroPositivo, exigir } = require('../utils/sanitizers');

class RedSocial {
  #id = null;
  #nombre = null;
  #url = null;

  // Un argumento ausente (undefined o null) deja el atributo sin asignar; cualquier
  // otro valor pasa por su setter y se valida.
  constructor(id, nombre, url) {
    if (id != null) this.id = id;
    if (nombre != null) this.nombre = nombre;
    if (url != null) this.url = url;
  }

  get id() {
    return this.#id;
  }

  set id(value) {
    this.#id = enteroPositivo(value, 'id');
  }

  get nombre() {
    return this.#nombre;
  }

  set nombre(value) {
    this.#nombre = textoRequerido(value, 'nombre');
  }

  get url() {
    return this.#url;
  }

  set url(value) {
    this.#url = textoRequerido(value, 'url');
  }

  // Lanza 400 si la red social no tiene id
  validarIdentificador() {
    exigir(this.#id, 'id');
  }

  // Lanza 400 si falta algun dato obligatorio para guardar la red social
  validarDatos() {
    exigir(this.#nombre, 'nombre');
    exigir(this.#url, 'url');
  }

  // Convierte la instancia en un objeto plano listo para responder como JSON en la API
  toJSON() {
    return {
      id: this.#id,
      nombre: this.#nombre,
      url: this.#url
    };
  }
}

module.exports = RedSocial;
