const Persona = require('../models/Persona');
const database = require('../config/database');

class PersonaService {
    constructor() {
        this.personas = [];
        this.database = new database();
    }

    async crearPersona(personaData) {
        try {
            const nuevaPersona = new Persona(personaData.id, personaData.nombre, personaData.apellido, personaData.fecha_nacimiento);
            const edad = nuevaPersona.edad = nuevaPersona.calcularEdad(nuevaPersona.fecha_nacimiento);
            await this.database.query('INSERT INTO persona (id, nombre, apellido, fecha_nacimiento, edad) VALUES (?, ?, ?, ?, ?)',
                [nuevaPersona.id,
                nuevaPersona.nombre,
                nuevaPersona.apellido,
                nuevaPersona.fecha_nacimiento,
                    edad]);
            return { success: true, message: 'Persona creada correctamente' };
        } catch (error) {
            console.error('Error al crear persona:', error);
            throw error;
        }
    }

    /** 
     * El metodo obtener personas extrae todas las personas de la base de datos y las retorna como un array de objetos JSON
    */
    async obtenerPersonas() {
        try {   // Ejecuta la consulta SQL y obtiene las personas de la base de datos
            const rows = await this.database.query('SELECT * FROM persona');
            return rows.map(row => new Persona(row.id, row.nombre, row.apellido, row.fecha_nacimiento, row.edad).toJSON());
        } catch (error) {
            console.error('Error al obtener personas:', error);
            throw error;
        }
    }

    /**
     * El metodo obtener persona por id extrae una persona de la base de datos por su id y la retorna como un objeto JSON
     */
    async obtenerPersonaPorId(id) {
        try {
            const [rows] = await database.query('SELECT * FROM persona WHERE id = ?', [id]);
            return new Persona(rows[0].id, rows[1].nombre, rows[2].apellido, rows[3].fecha_nacimiento, rows[4].edad).toJSON();
        } catch (error) {
            console.error('Error al obtener persona por id:', error);
            throw error;
        }
    }

    /**
     * El metodo guardar persona, primero crea un objeto persona con datos recibidos para asegurar la encapsulacion de los datos
     * luego ejecuta la consulta SQL para guardar la persona en la base de datos y por ultimo crea un nuevo objeto persona con los datos obtenidos de la base de datos y lo retorna como un objeto JSON
     */
    async guardarPersona(persona) {
        try {
            const nuevaPersona = new Persona(persona.id, persona.nombre, persona.apellido, persona.fecha_nacimiento);
            const [result] = await database.query('INSERT INTO persona (id, nombre, apellido, fecha_nacimiento) VALUES (?, ?, ?, ?)',
                [nuevaPersona.id,
                nuevaPersona.nombre,
                nuevaPersona.apellido,
                nuevaPersona.fecha_nacimiento]);
            return new Persona(result.insertId,
                nuevaPersona.nombre,
                nuevaPersona.apellido,
                nuevaPersona.fecha_nacimiento,
                nuevaPersona.edad).toJSON();
        } catch (error) {
            console.error('Error al guardar persona:', error);
            throw error;
        }
    }

    /**
     * El metodo actualizar persona, primero busca en el array de objetos el objeto 
     * persona con datos recibidos para asegurar la encapsulacion de los datos, luego
     * actualiza los datos del objeto persona y por ultimo ejecuta la consulta SQL para actualizar la persona en la base de datos y retorna el objeto persona actualizado como un objeto JSON
     */
    async actualizarPersona(persona) {
        try {
            const personaActualizada = new Persona(persona.id, persona.nombre, persona.apellido, persona.fecha_nacimiento);
            const [result] = await database.query('UPDATE persona SET nombre = ?, apellido = ?, fecha_nacimiento = ?, edad = ? WHERE id = ?',
                [personaActualizada.nombre,
                personaActualizada.apellido,
                personaActualizada.fecha_nacimiento,
                personaActualizada.edad,
                personaActualizada.id]);
            return new Persona(result.insertId,
                personaActualizada.nombre,
                personaActualizada.apellido,
                personaActualizada.fecha_nacimiento,
                personaActualizada.edad).toJSON();
        } catch (error) {
            console.error('Error al actualizar persona:', error);
            throw error;
        }
    }

    /**
     * El metodo eliminar persona, busca en el array de objetos el objeto persona con datos recibidos para asegurar la encapsulacion de los datos, luego
     * elimina el objeto persona del array y ejecuta la consulta SQL para eliminar la persona de la base de datos y retorna true si la eliminacion fue exitosa
     */
    async eliminarPersona(persona) {
        try {
            const personaEliminada = new Persona(persona.id, persona.nombre, persona.apellido, persona.fecha_nacimiento);
            const [result] = await database.query('DELETE FROM persona WHERE id = ?', [personaEliminada.id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al eliminar persona:', error);
            throw error;
        }
    }
}

module.exports = PersonaService;