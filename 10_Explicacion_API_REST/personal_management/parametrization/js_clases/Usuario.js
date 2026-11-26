class Usuario {
  #id;
  #primerNombre;
  #segundoNombre;
  #primerApellido;
  #segundoApellido;
  #fechaNacimiento;
  #edad;
  #ciudadDomicilio;
  #estado;
  #telefonos;
  #perfilesSociales;

  constructor(
    id = null,
    primerNombre,
    segundoNombre = null,
    primerApellido,
    segundoApellido = null,
    fechaNacimiento,
    edad,
    ciudadDomicilio,
    estado = 1
  ) {
    this.#id = id;
    this.#primerNombre = primerNombre;
    this.#segundoNombre = segundoNombre;
    this.#primerApellido = primerApellido;
    this.#segundoApellido = segundoApellido;
    this.#fechaNacimiento = fechaNacimiento;
    this.#edad = edad;
    this.#ciudadDomicilio = ciudadDomicilio;
    this.#estado = estado;
    this.#telefonos = [];
    this.#perfilesSociales = [];
  }

  get id() {
    return this.#id;
  }

  set id(value) {
    this.#id = value;
  }

  get primerNombre() {
    return this.#primerNombre;
  }

  set primerNombre(value) {
    this.#primerNombre = value;
  }

  get segundoNombre() {
    return this.#segundoNombre;
  }

  set segundoNombre(value) {
    this.#segundoNombre = value;
  }

  get primerApellido() {
    return this.#primerApellido;
  }

  set primerApellido(value) {
    this.#primerApellido = value;
  }

  get segundoApellido() {
    return this.#segundoApellido;
  }

  set segundoApellido(value) {
    this.#segundoApellido = value;
  }

  get fechaNacimiento() {
    return this.#fechaNacimiento;
  }

  set fechaNacimiento(value) {
    this.#fechaNacimiento = value;
  }

  get edad() {
    return this.#edad;
  }

  set edad(value) {
    this.#edad = value;
  }

  get ciudadDomicilio() {
    return this.#ciudadDomicilio;
  }

  set ciudadDomicilio(value) {
    this.#ciudadDomicilio = value;
  }

  get estado() {
    return this.#estado;
  }

  set estado(value) {
    this.#estado = value;
  }

  get telefonos() {
    return this.#telefonos;
  }

  get perfilesSociales() {
    return this.#perfilesSociales;
  }

  getNombreCompleto() {
    let nombre = this.#primerNombre;
    if (this.#segundoNombre) {
      nombre += ` ${this.#segundoNombre}`;
    }
    nombre += ` ${this.#primerApellido}`;
    if (this.#segundoApellido) {
      nombre += ` ${this.#segundoApellido}`;
    }
    return nombre;
  }

  agregarTelefono(telefono) {
    this.#telefonos.push(telefono);
  }

  agregarPerfilSocial(perfilSocial) {
    this.#perfilesSociales.push(perfilSocial);
  }

  obtenerTelefonosActivos() {
    return this.#telefonos.filter(t => t.activo === 1);
  }

  toJSON() {
    return {
      id: this.#id,
      primerNombre: this.#primerNombre,
      segundoNombre: this.#segundoNombre,
      primerApellido: this.#primerApellido,
      segundoApellido: this.#segundoApellido,
      fechaNacimiento: this.#fechaNacimiento,
      edad: this.#edad,
      ciudadDomicilio: this.#ciudadDomicilio,
      estado: this.#estado,
      telefonos: this.#telefonos.map(t => ({
        id: t.id,
        numeroTelefono: t.numeroTelefono,
        tipoTelefono: t.tipoTelefono,
        activo: t.activo
      })),
      perfilesSociales: this.#perfilesSociales.map(p => ({
        redSocialId: p.redSocial?.id || null,
        urlPerfil: p.urlPerfil
      }))
    };
  }
}

module.exports = Usuario;
