// Clase de dominio que representa el perfil de un Usuario en una Red Social especifica.
// Es la tabla intermedia (N:M) entre USUARIO y RED_SOCIAL, con llave primaria compuesta.
// Cada setter valida el valor que recibe, asi ningun objeto puede contener datos invalidos.
const RedSocial = require('./RedSocial');
const Usuario = require('./Usuario');
const { textoOpcional, enteroPositivo, exigir } = require('../utils/sanitizers');

class PerfilSocial {
  #redSocial = null;
  #usuario = null;
  #urlPerfil = null;

  // Un argumento ausente (undefined o null) deja el atributo sin asignar; cualquier
  // otro valor pasa por su setter y se valida.
  constructor(redSocial, usuario, urlPerfil) {
    if (redSocial != null) this.redSocial = redSocial;
    if (usuario != null) this.usuario = usuario;
    this.urlPerfil = urlPerfil;
  }

  get redSocial() {
    return this.#redSocial;
  }

  // Acepta la RedSocial completa o solo su id
  set redSocial(value) {
    this.#redSocial = value instanceof RedSocial ? value : enteroPositivo(value, 'redSocialId');
  }

  get usuario() {
    return this.#usuario;
  }

  // Acepta el Usuario completo o solo su id
  set usuario(value) {
    this.#usuario = value instanceof Usuario ? value : enteroPositivo(value, 'usuarioId');
  }

  get urlPerfil() {
    return this.#urlPerfil;
  }

  set urlPerfil(value) {
    this.#urlPerfil = textoOpcional(value, 'urlPerfil');
  }

  // Lanza 400 si falta alguna de las dos partes de la llave compuesta
  validarIdentificador() {
    exigir(this.#redSocial, 'redSocialId');
    exigir(this.#usuario, 'usuarioId');
  }

  // Lanza 400 si no se indico el usuario
  validarUsuario() {
    exigir(this.#usuario, 'usuarioId');
  }

  // Convierte la instancia en un objeto plano listo para responder como JSON en la API.
  // Si redSocial/usuario son objetos completos (vienen de un JOIN), se incluyen sus datos
  // basicos para que el frontend no tenga que hacer peticiones adicionales.
  toJSON() {
    const redSocialId = this.#redSocial?.id ?? this.#redSocial ?? null;
    const usuarioId = this.#usuario?.id ?? this.#usuario ?? null;

    return {
      redSocialId,
      usuarioId,
      urlPerfil: this.#urlPerfil,
      redSocial: this.#redSocial && typeof this.#redSocial === 'object' ? this.#redSocial.toJSON() : undefined,
      usuario: this.#usuario && typeof this.#usuario === 'object' ? this.#usuario.getNombreCompleto?.() : undefined
    };
  }
}

module.exports = PerfilSocial;
