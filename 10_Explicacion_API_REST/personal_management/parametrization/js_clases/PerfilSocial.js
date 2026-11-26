class PerfilSocial {
  #redSocial;
  #usuario;
  #urlPerfil;

  constructor(redSocial, usuario, urlPerfil = null) {
    this.#redSocial = redSocial;
    this.#usuario = usuario;
    this.#urlPerfil = urlPerfil;
  }

  get redSocial() {
    return this.#redSocial;
  }

  set redSocial(value) {
    this.#redSocial = value;
  }

  get usuario() {
    return this.#usuario;
  }

  set usuario(value) {
    this.#usuario = value;
  }

  get urlPerfil() {
    return this.#urlPerfil;
  }

  set urlPerfil(value) {
    this.#urlPerfil = value;
  }

  toJSON() {
    return {
      redSocialId: this.#redSocial?.id || null,
      usuarioId: this.#usuario?.id || null,
      urlPerfil: this.#urlPerfil
    };
  }
}

module.exports = PerfilSocial;
