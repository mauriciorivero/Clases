// Capa de servicios: logica de negocio y persistencia de Telefono.
//
// Encapsulamiento: los datos externos (req.body / req.params) nunca llegan a la base de datos
// directamente. Cada operacion:
//   1. crea un Telefono con esos datos (sus setters validan cada valor)
//   2. ejecuta la consulta leyendo los atributos del objeto con los getters
//
// Prevencion de inyeccion SQL: todo el texto SQL esta en el objeto SQL (fijo, sin valores
// externos concatenados) y se ejecuta con pool.execute, que envia los valores como parametros
// enlazados (prepared statements), separados del texto de la consulta.
const { pool } = require('../config/database');
const Telefono = require('../models/Telefono');
const { crearError, idDeReferencia, registrarError } = require('../utils/helpers');

const SQL = Object.freeze({
  listar: 'SELECT * FROM TELEFONO ORDER BY id DESC',
  listarPorUsuario: 'SELECT * FROM TELEFONO WHERE USUARIO_id = ? ORDER BY id DESC',
  buscarPorId: 'SELECT * FROM TELEFONO WHERE id = ?',
  insertar: 'INSERT INTO TELEFONO (numero_telefono, tipo_telefono, USUARIO_id, activo) VALUES (?, ?, ?, ?)',
  // El usuario dueno del telefono no se modifica
  actualizar: 'UPDATE TELEFONO SET numero_telefono = ?, tipo_telefono = ?, activo = ? WHERE id = ?',
  // Borrado fisico: ninguna tabla hija referencia a TELEFONO
  eliminar: 'DELETE FROM TELEFONO WHERE id = ?'
});

class TelefonoService {
  // Lista todos los telefonos registrados
  async listar() {
    try {
      const [filas] = await pool.execute(SQL.listar);
      return filas.map(fila => this.#mapearFila(fila));
    } catch (error) {
      registrarError('TelefonoService.listar', error);
      throw error;
    }
  }

  // Lista los telefonos de un usuario especifico
  async listarPorUsuario(usuarioId) {
    try {
      const filtro = new Telefono(null, null, null, usuarioId);
      filtro.validarUsuario();

      const [filas] = await pool.execute(SQL.listarPorUsuario, [idDeReferencia(filtro.usuario)]);
      return filas.map(fila => this.#mapearFila(fila));
    } catch (error) {
      registrarError('TelefonoService.listarPorUsuario', error);
      throw error;
    }
  }

  // Crea un nuevo telefono asociado a un usuario.
  // Si el usuarioId no existe, MySQL rechaza el INSERT por la llave foranea
  // y el errorHandler traduce ese error a un HTTP 400.
  async crear(datos) {
    try {
      const entrada = datos ?? {};
      const telefono = new Telefono(
        null,
        entrada.numeroTelefono,
        entrada.tipoTelefono,
        entrada.usuarioId,
        entrada.activo ?? 1
      );
      telefono.validarDatos();

      const [resultado] = await pool.execute(SQL.insertar, [
        telefono.numeroTelefono,
        telefono.tipoTelefono,
        idDeReferencia(telefono.usuario),
        telefono.activo
      ]);
      telefono.id = resultado.insertId;

      return await this.#buscar(telefono);
    } catch (error) {
      registrarError('TelefonoService.crear', error);
      throw error;
    }
  }

  // Actualiza un telefono existente
  async actualizar(id, datos) {
    try {
      const entrada = datos ?? {};
      const telefono = new Telefono(
        id,
        entrada.numeroTelefono,
        entrada.tipoTelefono,
        entrada.usuarioId,
        entrada.activo ?? 1
      );
      telefono.validarIdentificador();
      telefono.validarDatos();
      await this.#buscar(telefono); // 404 si no existe

      await pool.execute(SQL.actualizar, [
        telefono.numeroTelefono,
        telefono.tipoTelefono,
        telefono.activo,
        telefono.id
      ]);

      return await this.#buscar(telefono);
    } catch (error) {
      registrarError('TelefonoService.actualizar', error);
      throw error;
    }
  }

  // Elimina fisicamente un telefono
  async eliminar(id) {
    try {
      const telefono = new Telefono(id);
      telefono.validarIdentificador();
      await this.#buscar(telefono); // 404 si no existe

      await pool.execute(SQL.eliminar, [telefono.id]);
    } catch (error) {
      registrarError('TelefonoService.eliminar', error);
      throw error;
    }
  }

  // Carga desde la base de datos el telefono identificado por el objeto recibido.
  // Lanza 404 si no existe.
  async #buscar(telefono) {
    const [filas] = await pool.execute(SQL.buscarPorId, [telefono.id]);
    if (filas.length === 0) {
      throw crearError('Telefono no encontrado', 404);
    }
    return this.#mapearFila(filas[0]);
  }

  // Convierte una fila de la tabla TELEFONO en una instancia de Telefono
  #mapearFila(fila) {
    return new Telefono(fila.id, fila.numero_telefono, fila.tipo_telefono, fila.USUARIO_id, fila.activo);
  }
}

module.exports = TelefonoService;
