// Capa de servicios: logica de negocio y persistencia de PerfilSocial (relacion N:M Usuario <-> RedSocial).
// PERFIL_SOCIAL es una tabla intermedia con llave primaria compuesta (RED_SOCIAL_id, USUARIO_id).
//
// Encapsulamiento: los datos externos (req.body / req.params) nunca llegan a la base de datos
// directamente. Cada operacion:
//   1. crea un PerfilSocial con esos datos (sus setters validan cada valor)
//   2. ejecuta la consulta leyendo los atributos del objeto con los getters
//
// Prevencion de inyeccion SQL: todo el texto SQL esta en el objeto SQL (fijo, sin valores
// externos concatenados) y se ejecuta con pool.execute, que envia los valores como parametros
// enlazados (prepared statements), separados del texto de la consulta.
const { pool } = require('../config/database');
const PerfilSocial = require('../models/PerfilSocial');
const RedSocial = require('../models/RedSocial');
const Usuario = require('../models/Usuario');
const { crearError, idDeReferencia, registrarError } = require('../utils/helpers');

// Consulta base con JOIN para traer, junto al perfil, el nombre de la red social
// y el nombre del usuario. Esto evita que el frontend tenga que pedir esos datos aparte.
// Es un texto fijo: solo se le concatenan los fragmentos WHERE/ORDER BY constantes de abajo.
const SELECT_CON_JOIN =
  'SELECT ps.RED_SOCIAL_id AS redSocialId, ps.USUARIO_id AS usuarioId, ps.url_perfil AS urlPerfil, ' +
  'rs.nombre AS redSocialNombre, rs.url AS redSocialUrl, ' +
  'u.primer_nombre AS usuarioPrimerNombre, u.primer_apellido AS usuarioPrimerApellido ' +
  'FROM PERFIL_SOCIAL ps ' +
  'INNER JOIN RED_SOCIAL rs ON rs.id = ps.RED_SOCIAL_id ' +
  'INNER JOIN USUARIO u ON u.id = ps.USUARIO_id';

const SQL = Object.freeze({
  listar: SELECT_CON_JOIN + ' ORDER BY ps.USUARIO_id DESC',
  listarPorUsuario: SELECT_CON_JOIN + ' WHERE ps.USUARIO_id = ?',
  buscarPorIds: SELECT_CON_JOIN + ' WHERE ps.RED_SOCIAL_id = ? AND ps.USUARIO_id = ?',
  insertar: 'INSERT INTO PERFIL_SOCIAL (RED_SOCIAL_id, USUARIO_id, url_perfil) VALUES (?, ?, ?)',
  // La llave compuesta no cambia: solo se actualiza la url
  actualizar: 'UPDATE PERFIL_SOCIAL SET url_perfil = ? WHERE RED_SOCIAL_id = ? AND USUARIO_id = ?',
  eliminar: 'DELETE FROM PERFIL_SOCIAL WHERE RED_SOCIAL_id = ? AND USUARIO_id = ?'
});

class PerfilSocialService {
  // Lista todos los perfiles sociales
  async listar() {
    try {
      const [filas] = await pool.execute(SQL.listar);
      return filas.map(fila => this.#mapearFila(fila));
    } catch (error) {
      registrarError('PerfilSocialService.listar', error);
      throw error;
    }
  }

  // Lista los perfiles sociales de un usuario especifico
  async listarPorUsuario(usuarioId) {
    try {
      const filtro = new PerfilSocial(null, usuarioId);
      filtro.validarUsuario();

      const [filas] = await pool.execute(SQL.listarPorUsuario, [idDeReferencia(filtro.usuario)]);
      return filas.map(fila => this.#mapearFila(fila));
    } catch (error) {
      registrarError('PerfilSocialService.listarPorUsuario', error);
      throw error;
    }
  }

  // Crea un nuevo perfil social. Si redSocialId o usuarioId no existen, o si ya
  // existe ese mismo par (llave compuesta duplicada), el errorHandler traduce
  // el error de MySQL al codigo HTTP correspondiente (400 o 409).
  async crear(datos) {
    try {
      const entrada = datos ?? {};
      const perfil = new PerfilSocial(entrada.redSocialId, entrada.usuarioId, entrada.urlPerfil);
      perfil.validarIdentificador();

      await pool.execute(SQL.insertar, [
        idDeReferencia(perfil.redSocial),
        idDeReferencia(perfil.usuario),
        perfil.urlPerfil
      ]);

      return await this.#buscar(perfil);
    } catch (error) {
      registrarError('PerfilSocialService.crear', error);
      throw error;
    }
  }

  // Actualiza la url de un perfil social existente
  async actualizar(redSocialId, usuarioId, urlPerfil) {
    try {
      const perfil = new PerfilSocial(redSocialId, usuarioId, urlPerfil);
      perfil.validarIdentificador();
      await this.#buscar(perfil); // 404 si no existe

      await pool.execute(SQL.actualizar, [
        perfil.urlPerfil,
        idDeReferencia(perfil.redSocial),
        idDeReferencia(perfil.usuario)
      ]);

      return await this.#buscar(perfil);
    } catch (error) {
      registrarError('PerfilSocialService.actualizar', error);
      throw error;
    }
  }

  // Elimina un perfil social por su llave primaria compuesta
  async eliminar(redSocialId, usuarioId) {
    try {
      const perfil = new PerfilSocial(redSocialId, usuarioId);
      perfil.validarIdentificador();
      await this.#buscar(perfil); // 404 si no existe

      await pool.execute(SQL.eliminar, [idDeReferencia(perfil.redSocial), idDeReferencia(perfil.usuario)]);
    } catch (error) {
      registrarError('PerfilSocialService.eliminar', error);
      throw error;
    }
  }

  // Carga desde la base de datos el perfil identificado por el objeto recibido.
  // Lanza 404 si no existe.
  async #buscar(perfil) {
    const [filas] = await pool.execute(SQL.buscarPorIds, [
      idDeReferencia(perfil.redSocial),
      idDeReferencia(perfil.usuario)
    ]);
    if (filas.length === 0) {
      throw crearError('Perfil social no encontrado', 404);
    }
    return this.#mapearFila(filas[0]);
  }

  // Convierte una fila (resultado del JOIN) en una instancia de PerfilSocial,
  // con la RedSocial y un Usuario "resumido" embebidos para mostrar en el frontend
  // sin necesidad de peticiones adicionales.
  #mapearFila(fila) {
    const redSocial = new RedSocial(fila.redSocialId, fila.redSocialNombre, fila.redSocialUrl);
    const usuario = new Usuario(fila.usuarioId, fila.usuarioPrimerNombre, null, fila.usuarioPrimerApellido);

    return new PerfilSocial(redSocial, usuario, fila.urlPerfil);
  }
}

module.exports = PerfilSocialService;
