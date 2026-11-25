const { PORT } = require('./config/env');
const Database = require('./config/database');
const PersonaService = require('./services/PersonaService');

const database = new Database();

/*
database.testConnection().then(result => {
    console.log('Conexion exitosa:', result);
}).catch(error => {
    console.error('Error al probar la conexion:', error);
});
*/

const personaService = new PersonaService();

personaService.crearPersona({ id: 4, nombre: 'Alicia', apellido: 'Rivero', fecha_nacimiento: '2024-03-03' }).then(result => {
    console.log('Persona creada:', result);
}).catch(error => {
    console.error('Error al crear persona:', error);
});

/*
personaService.obtenerPersonas().then(result => {
    console.log('Personas obtenidas:', result);
}).catch(error => {
    console.error('Error al obtener personas:', error);
});

*/