// Clase de dominio que representa a un Usuario del sistema.
// Usa campos privados (#) para encapsular el estado y exponerlo solo a traves de
// getters/setters. Cada setter valida el valor que recibe, asi ningun objeto puede
// contener datos invalidos. La edad no se asigna: se calcula con calcularEdad().
const { textoRequerido, textoOpcional, enteroPositivo, indicador, fecha, exigir } = require('../utils/sanitizers');
const { crearError } = require('../utils/helpers');

// Convierte una fecha (Date o texto) al dia de calendario local. Un texto aaaa-mm-dd se
// arma por partes: new Date('aaaa-mm-dd') lo interpretaria en UTC y en Colombia (UTC-5)
// quedaria en el dia anterior.
function aFechaDeCalendario(valor) {
  const partes = typeof valor === 'string' ? /^(\d{4})-(\d{2})-(\d{2})/.exec(valor) : null;
  return partes ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3])) : new Date(valor);
}

class Usuario {
  #id = null;
  #primerNombre = null;
  #segundoNombre = null;
  #primerApellido = null;
  #segundoApellido = null;
  #fechaNacimiento = null;
  #ciudadDomicilio = null;
  #estado = null;
  #telefonos = [];
  #perfilesSociales = [];

  // Un argumento ausente (undefined o null) deja el atributo sin asignar; cualquier
  // otro valor pasa por su setter y se valida.
  constructor(
    id,
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    fechaNacimiento,
    ciudadDomicilio,
    estado = 1
  ) {
    if (id != null) this.id = id;
    if (primerNombre != null) this.primerNombre = primerNombre;
    this.segundoNombre = segundoNombre;
    if (primerApellido != null) this.primerApellido = primerApellido;
    this.segundoApellido = segundoApellido;
    if (fechaNacimiento != null) this.fechaNacimiento = fechaNacimiento;
    if (ciudadDomicilio != null) this.ciudadDomicilio = ciudadDomicilio;
    if (estado != null) this.estado = estado;
  }

  get id() {
    return this.#id;
  }

  set id(value) {
    this.#id = enteroPositivo(value, 'id');
  }

  get primerNombre() {
    return this.#primerNombre;
  }

  set primerNombre(value) {
    this.#primerNombre = textoRequerido(value, 'primerNombre');
  }

  get segundoNombre() {
    return this.#segundoNombre;
  }

  set segundoNombre(value) {
    this.#segundoNombre = textoOpcional(value, 'segundoNombre');
  }

  get primerApellido() {
    return this.#primerApellido;
  }

  set primerApellido(value) {
    this.#primerApellido = textoRequerido(value, 'primerApellido');
  }

  get segundoApellido() {
    return this.#segundoApellido;
  }

  set segundoApellido(value) {
    this.#segundoApellido = textoOpcional(value, 'segundoApellido');
  }

  // Si es un Date se entrega una copia, para que no se pueda modificar desde fuera
  get fechaNacimiento() {
    return this.#fechaNacimiento instanceof Date ? new Date(this.#fechaNacimiento.getTime()) : this.#fechaNacimiento;
  }

  // La fecha de nacimiento puede ser hoy, pero no un dia posterior
  set fechaNacimiento(value) {
    const nueva = fecha(value, 'fechaNacimiento');
    const finDeHoy = new Date();
    finDeHoy.setHours(23, 59, 59, 999);
    if (aFechaDeCalendario(nueva) > finDeHoy) {
      throw crearError('El campo fechaNacimiento no puede ser una fecha futura', 400);
    }
    this.#fechaNacimiento = nueva;
  }

  // Atributo derivado (solo lectura): siempre es coherente con la fecha de nacimiento
  get edad() {
    return this.calcularEdad();
  }

  get ciudadDomicilio() {
    return this.#ciudadDomicilio;
  }

  set ciudadDomicilio(value) {
    this.#ciudadDomicilio = textoRequerido(value, 'ciudadDomicilio');
  }

  get estado() {
    return this.#estado;
  }

  set estado(value) {
    this.#estado = indicador(value, 'estado');
  }

  get telefonos() {
    return [...this.#telefonos];
  }

  get perfilesSociales() {
    return [...this.#perfilesSociales];
  }

  // Calcula la edad en anios cumplidos a la fecha "hoy"; null si no hay fecha de nacimiento
  calcularEdad(hoy = new Date()) {
    if (this.#fechaNacimiento === null) {
      return null;
    }

    const nacimiento = aFechaDeCalendario(this.#fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const noHaCumplidoAniosAun =
      hoy.getMonth() < nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());

    if (noHaCumplidoAniosAun) {
      edad -= 1;
    }

    return edad;
  }

  // Lanza 400 si el usuario no tiene id (necesario para buscar, actualizar o eliminar)
  validarIdentificador() {
    exigir(this.#id, 'id');
  }

  // Lanza 400 si falta algun dato obligatorio para guardar el usuario
  validarDatos() {
    exigir(this.#primerNombre, 'primerNombre');
    exigir(this.#primerApellido, 'primerApellido');
    exigir(this.#fechaNacimiento, 'fechaNacimiento');
    exigir(this.#ciudadDomicilio, 'ciudadDomicilio');
  }

  // Devuelve el nombre completo concatenando solo las partes que existan
  getNombreCompleto() {
    return [this.#primerNombre, this.#segundoNombre, this.#primerApellido, this.#segundoApellido]
      .filter(Boolean)
      .join(' ');
  }

  // Asocia un objeto Telefono a este usuario (relacion 1:N)
  agregarTelefono(telefono) {
    this.#telefonos.push(telefono);
  }

  // Asocia un objeto PerfilSocial a este usuario (relacion N:M via PERFIL_SOCIAL)
  agregarPerfilSocial(perfilSocial) {
    this.#perfilesSociales.push(perfilSocial);
  }

  // Filtra y devuelve solo los telefonos marcados como activos
  obtenerTelefonosActivos() {
    return this.#telefonos.filter(t => t.activo === 1);
  }

  // Convierte la instancia en un objeto plano listo para responder como JSON en la API
  toJSON() {
    return {
      id: this.#id,
      primerNombre: this.#primerNombre,
      segundoNombre: this.#segundoNombre,
      primerApellido: this.#primerApellido,
      segundoApellido: this.#segundoApellido,
      nombreCompleto: this.getNombreCompleto(),
      fechaNacimiento: this.fechaNacimiento,
      edad: this.edad,
      ciudadDomicilio: this.#ciudadDomicilio,
      estado: this.#estado,
      telefonos: this.#telefonos.map(t => t.toJSON()),
      perfilesSociales: this.#perfilesSociales.map(p => p.toJSON())
    };
  }
}

module.exports = Usuario;
