class Persona {
    
    #id;
    #nombre;
    #apellido;
    #fecha_nacimiento;
    #edad;

    constructor(id, nombre, apellido, fecha_nacimiento) {
        this.#id = id;
        this.#nombre = nombre;
        this.#apellido = apellido;
        this.#fecha_nacimiento = fecha_nacimiento;
        this.#edad = this.calcularEdad(fecha_nacimiento);
    }

    get id() {
        return this.#id;
    }

    get nombre() {
        return this.#nombre;
    }

    get apellido() {
        return this.#apellido;
    }

    get fecha_nacimiento() {
        return this.#fecha_nacimiento;
    }

    get edad() {
        return this.#edad;
    }

    set id(id) {
        this.#id = id;
    }

    set nombre(nombre) {
        this.#nombre = nombre;
    }

    set apellido(apellido) {
        this.#apellido = apellido;
    }

    set fecha_nacimiento(fecha_nacimiento) {
        this.#fecha_nacimiento = fecha_nacimiento;
    }

    set edad(edad) {
        this.#edad = edad;
    }

    calcularEdad(fecha_nacimiento) {
        const fecha_actual = new Date();
        fecha_nacimiento = new Date(this.#fecha_nacimiento);
        this.#edad = fecha_actual.getFullYear() - fecha_nacimiento.getFullYear();
        return this.#edad;
    }

    toJSON(){
        return {
            id: this.#id,
            nombre: this.#nombre,
            apellido: this.#apellido,
            fecha_nacimiento: this.#fecha_nacimiento,
            edad: this.#edad
        }
    }
}

module.exports = Persona;