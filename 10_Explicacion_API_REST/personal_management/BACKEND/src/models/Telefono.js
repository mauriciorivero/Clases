// Clase de dominio que representa un numero de telefono asociado a un Usuario.
// Cada setter valida el valor que recibe, asi ningun objeto puede contener datos invalidos.
const Usuario = require('./Usuario');
const { textoRequerido, enteroPositivo, indicador, exigir } = require('../utils/sanitizers');

class Telefono {
  #id = null;
  #numeroTelefono = null;
  #tipoTelefono = null;
  #usuario = null;
  #activo = null;

  // Un argumento ausente (undefined o null) deja el atributo sin asignar; cualquier
  // otro valor pasa por su setter y se valida.
  constructor(id, numeroTelefono, tipoTelefono, usuario, activo = 1) {
    if (id != null) this.id = id;
    if (numeroTelefono != null) this.numeroTelefono = numeroTelefono;
    if (tipoTelefono != null) this.tipoTelefono = tipoTelefono;
    if (usuario != null) this.usuario = usuario;
    if (activo != null) this.activo = activo;
  }

  get id() {
    return this.#id;
  }

  set id(value) {
    this.#id = enteroPositivo(value, 'id');
  }

  get numeroTelefono() {
    return this.#numeroTelefono;
  }

  set numeroTelefono(value) {
    this.#numeroTelefono = textoRequerido(value, 'numeroTelefono');
  }

  get tipoTelefono() {
    return this.#tipoTelefono;
  }

  set tipoTelefono(value) {
    this.#tipoTelefono = textoRequerido(value, 'tipoTelefono');
  }

  get usuario() {
    return this.#usuario;
  }

  // Acepta el Usuario completo o solo su id
  set usuario(value) {
    this.#usuario = value instanceof Usuario ? value : enteroPositivo(value, 'usuarioId');
  }

  get activo() {
    return this.#activo;
  }

  set activo(value) {
    this.#activo = indicador(value, 'activo');
  }

  esActivo() {
    return this.#activo === 1;
  }

  activar() {
    this.#activo = 1;
  }

  desactivar() {
    this.#activo = 0;
  }

  // Lanza 400 si el telefono no tiene id
  validarIdentificador() {
    exigir(this.#id, 'id');
  }

  // Lanza 400 si no se indico el usuario dueno
  validarUsuario() {
    exigir(this.#usuario, 'usuarioId');
  }

  // Lanza 400 si falta algun dato obligatorio para guardar el telefono
  validarDatos() {
    exigir(this.#numeroTelefono, 'numeroTelefono');
    exigir(this.#tipoTelefono, 'tipoTelefono');
    this.validarUsuario();
  }

  // Convierte la instancia en un objeto plano listo para responder como JSON en la API
  toJSON() {
    return {
      id: this.#id,
      numeroTelefono: this.#numeroTelefono,
      tipoTelefono: this.#tipoTelefono,
      usuarioId: this.#usuario?.id ?? this.#usuario ?? null,
      activo: this.#activo
    };
  }
}

module.exports = Telefono;
