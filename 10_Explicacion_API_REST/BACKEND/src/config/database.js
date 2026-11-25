/*
// Clase de conexion a MySQL usando un "pool" de conexiones
// (mysql2/promise). Un pool reutiliza conexiones en lugar de
// abrir/cerrar una nueva por cada consulta, lo cual es mucho
// mas eficiente para una API que atiende muchas peticiones.
*/

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const mysql = require('mysql2/promise');

class Database {

    
    constructor() {
        this.pool = mysql.createPool({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            // dateStrings evita que mysql2 convierta las columnas DATE
            // a objetos Date de JavaScript (lo que causa corrimientos
            // de un dia por temas de zona horaria). Asi "datebirth"
            // siempre viaja como texto 'YYYY-MM-DD'.
            dateStrings: true,
          });
    }

    // Inicializa el pool de conexiones
    async init() {
        try {
            const connection = await this.pool.getConnection();
            return connection;
        } catch (error) {
            console.error('Error al inicializar el pool de conexiones:', error);
            throw error;
        }
    }

    // Obtiene una conexion del pool
    async getConnection() {
        try {
            const connection = await this.pool.getConnection();
            return connection;
        } catch (error) {
            console.error('Error al obtener una conexion:', error);
            throw error;
        }
    }

    // Ejecuta una consulta SQL y devuelve el resultado
    async query(sql, params) {
        try {   
            const [rows] = await this.pool.query(sql, params);
            return rows;
        } catch (error) {
            console.error('Error al ejecutar la consulta:', error);
            throw error;
        }
    }

    async close() {
        try {
            await this.pool.end();
            return true;
        } catch (error) {
            console.error('Error al cerrar la conexion:', error);
            throw error;
        }
    }

    async releaseConnection(connection) {
        try {
            await connection.release();
            return true;
        } catch (error) {
            console.error('Error al liberar la conexion:', error);
            throw error;
        }
    }

    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            await connection.release();
            return true;
        } catch (error) {
            console.error('Error al probar la conexion:', error);
            return false;
        }
        return this.pool.getConnection();    // Verifica si la conexion es exitosa
    }
}

module.exports = Database;