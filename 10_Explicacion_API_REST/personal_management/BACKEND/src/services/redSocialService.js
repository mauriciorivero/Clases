// Capa de servicios: logica de negocio y persistencia de RedSocial.
//
// Encapsulamiento: los datos externos (req.body / req.params) nunca llegan a la base de datos
// directamente. Cada operacion:
//   1. crea una RedSocial con esos datos (sus setters validan cada valor)
//   2. ejecuta la consulta leyendo los atributos del objeto con los getters
//
// Prevencion de inyeccion SQL: todo el texto SQL esta en el objeto SQL (fijo, sin valores
// externos concatenados) y se ejecuta con pool.execute, que envia los valores como parametros
// enlazados (prepared statements), separados del texto de la consulta.
const { pool } = require('../config/database');
const RedSocial = require('../models/RedSocial');
const { crearError, registrarError } = require('../utils/helpers');

const SQL = Object.freeze({
  listar: 'SELECT * FROM RED_SOCIAL ORDER BY nombre ASC',
  buscarPorId: 'SELECT * FROM RED_SOCIAL WHERE id = ?',
  insertar: 'INSERT INTO RED_SOCIAL (nombre, url) VALUES (?, ?)',
  actualizar: 'UPDATE RED_SOCIAL SET nombre = ?, url = ? WHERE id = ?',
  // Si tiene perfiles sociales asociados, MySQL rechaza el DELETE por la llave foranea
  // (ON DELETE NO ACTION) y el errorHandler traduce ese error a un HTTP 409.
  eliminar: 'DELETE FROM RED_SOCIAL WHERE id = ?'
});

class RedSocialService {
  // Lista todas las redes sociales del catalogo
  async listar() {
    try {
      const [filas] = await pool.execute(SQL.listar);
      return filas.map(fila => this.#mapearFila(fila));
    } catch (error) {
      registrarError('RedSocialService.listar', error);
      throw error;
    }
  }

  // Crea una nueva red social
  async crear(datos) {
    try {
      const entrada = datos ?? {};
      const redSocial = new RedSocial(null, entrada.nombre, entrada.url);
      redSocial.validarDatos();

      const [resultado] = await pool.execute(SQL.insertar, [redSocial.nombre, redSocial.url]);
      redSocial.id = resultado.insertId;

      return await this.#buscar(redSocial);
    } catch (error) {
      registrarError('RedSocialService.crear', error);
      throw error;
    }
  }

  // Actualiza una red social existente
  async actualizar(id, datos) {
    try {
      const entrada = datos ?? {};
      const redSocial = new RedSocial(id, entrada.nombre, entrada.url);
      redSocial.validarIdentificador();
      redSocial.validarDatos();
      await this.#buscar(redSocial); // 404 si no existe

      await pool.execute(SQL.actualizar, [redSocial.nombre, redSocial.url, redSocial.id]);

      return await this.#buscar(redSocial);
    } catch (error) {
      registrarError('RedSocialService.actualizar', error);
      throw error;
    }
  }

  // Elimina una red social
  async eliminar(id) {
    try {
      const redSocial = new RedSocial(id);
      redSocial.validarIdentificador();
      await this.#buscar(redSocial); // 404 si no existe

      await pool.execute(SQL.eliminar, [redSocial.id]);
    } catch (error) {
      registrarError('RedSocialService.eliminar', error);
      throw error;
    }
  }

  // Carga desde la base de datos la red social identificada por el objeto recibido.
  // Lanza 404 si no existe.
  async #buscar(redSocial) {
    const [filas] = await pool.execute(SQL.buscarPorId, [redSocial.id]);
    if (filas.length === 0) {
      throw crearError('Red social no encontrada', 404);
    }
    return this.#mapearFila(filas[0]);
  }

  // Convierte una fila de la tabla RED_SOCIAL en una instancia de RedSocial
  #mapearFila(fila) {
    return new RedSocial(fila.id, fila.nombre, fila.url);
  }
}

module.exports = RedSocialService;
