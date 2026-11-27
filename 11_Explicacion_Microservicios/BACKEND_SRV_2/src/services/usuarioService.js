// Capa de servicios: logica de negocio y persistencia de Usuario.
// Para el detalle completo coordina a TelefonoService y PerfilSocialService.
//
// Encapsulamiento: los datos externos (req.body / req.params) nunca llegan a la base de datos
// directamente. Cada operacion:
//   1. crea un Usuario con esos datos (sus setters validan cada valor)
//   2. ejecuta la consulta leyendo los atributos del objeto con los getters
//
// Prevencion de inyeccion SQL: todo el texto SQL esta en el objeto SQL (fijo, sin valores
// externos concatenados) y se ejecuta con pool.execute, que envia los valores como parametros
// enlazados (prepared statements), separados del texto de la consulta.
const { pool } = require('../config/database');
const Usuario = require('../models/Usuario');
const { crearError, registrarError } = require('../utils/helpers');

const SQL = Object.freeze({
  listarActivos: 'SELECT * FROM USUARIO WHERE estado = 1 ORDER BY id DESC',
  buscarPorId: 'SELECT * FROM USUARIO WHERE id = ?',
  insertar:
    'INSERT INTO USUARIO (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, ' +
    'fecha_nacimiento, edad, ciudad_domicilio, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  // El estado no se toca aqui: solo cambia con el borrado logico (actualizarEstado)
  actualizarDatos:
    'UPDATE USUARIO SET primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?, ' +
    'fecha_nacimiento = ?, edad = ?, ciudad_domicilio = ? WHERE id = ?',
  // Borrado logico: TELEFONO y PERFIL_SOCIAL referencian a USUARIO con ON DELETE NO ACTION
  actualizarEstado: 'UPDATE USUARIO SET estado = ? WHERE id = ?'
});

class UsuarioService {
  #telefonoService;
  #perfilSocialService;

  constructor(telefonoService, perfilSocialService) {
    this.#telefonoService = telefonoService;
    this.#perfilSocialService = perfilSocialService;
  }

  // Lista todos los usuarios activos, sin cargar sus relaciones (vista resumen)
  async listar() {
    try {
      const [filas] = await pool.execute(SQL.listarActivos);
      return filas.map(fila => this.#mapearFila(fila));
    } catch (error) {
      registrarError('UsuarioService.listar', error);
      throw error;
    }
  }

  // Obtiene el detalle completo de un usuario, incluyendo sus telefonos y perfiles sociales
  async obtenerDetalle(id) {
    try {
      const consulta = new Usuario(id);
      consulta.validarIdentificador();

      const usuario = await this.#buscar(consulta);

      const telefonos = await this.#telefonoService.listarPorUsuario(usuario.id);
      telefonos.forEach(telefono => {
        telefono.usuario = usuario;
        usuario.agregarTelefono(telefono);
      });

      const perfiles = await this.#perfilSocialService.listarPorUsuario(usuario.id);
      perfiles.forEach(perfil => {
        perfil.usuario = usuario;
        usuario.agregarPerfilSocial(perfil);
      });

      return usuario;
    } catch (error) {
      registrarError('UsuarioService.obtenerDetalle', error);
      throw error;
    }
  }

  // Crea un nuevo usuario. La edad la calcula el propio objeto a partir de la fecha de
  // nacimiento, sin depender de lo que envie el cliente.
  async crear(datos) {
    try {
      const entrada = datos ?? {};
      const usuario = new Usuario(
        null,
        entrada.primerNombre,
        entrada.segundoNombre,
        entrada.primerApellido,
        entrada.segundoApellido,
        entrada.fechaNacimiento,
        entrada.ciudadDomicilio,
        1
      );
      usuario.validarDatos();

      const [resultado] = await pool.execute(SQL.insertar, [
        usuario.primerNombre,
        usuario.segundoNombre,
        usuario.primerApellido,
        usuario.segundoApellido,
        usuario.fechaNacimiento,
        usuario.edad,
        usuario.ciudadDomicilio,
        usuario.estado
      ]);
      usuario.id = resultado.insertId;

      return await this.obtenerDetalle(usuario.id);
    } catch (error) {
      registrarError('UsuarioService.crear', error);
      throw error;
    }
  }

  // Actualiza los datos personales de un usuario existente
  async actualizar(id, datos) {
    try {
      const entrada = datos ?? {};
      const usuario = new Usuario(
        id,
        entrada.primerNombre,
        entrada.segundoNombre,
        entrada.primerApellido,
        entrada.segundoApellido,
        entrada.fechaNacimiento,
        entrada.ciudadDomicilio
      );
      usuario.validarIdentificador();
      usuario.validarDatos();
      await this.#buscar(usuario); // 404 si no existe

      await pool.execute(SQL.actualizarDatos, [
        usuario.primerNombre,
        usuario.segundoNombre,
        usuario.primerApellido,
        usuario.segundoApellido,
        usuario.fechaNacimiento,
        usuario.edad,
        usuario.ciudadDomicilio,
        usuario.id
      ]);

      return await this.obtenerDetalle(usuario.id);
    } catch (error) {
      registrarError('UsuarioService.actualizar', error);
      throw error;
    }
  }

  // "Elimina" un usuario mediante borrado logico (estado = 0)
  async eliminar(id) {
    try {
      const consulta = new Usuario(id);
      consulta.validarIdentificador();

      const usuario = await this.#buscar(consulta);
      usuario.estado = 0;

      await pool.execute(SQL.actualizarEstado, [usuario.estado, usuario.id]);
    } catch (error) {
      registrarError('UsuarioService.eliminar', error);
      throw error;
    }
  }

  // Carga desde la base de datos el usuario identificado por el objeto recibido
  // (sin sus relaciones). Lanza 404 si no existe.
  async #buscar(usuario) {
    const [filas] = await pool.execute(SQL.buscarPorId, [usuario.id]);
    if (filas.length === 0) {
      throw crearError('Usuario no encontrado', 404);
    }
    return this.#mapearFila(filas[0]);
  }

  // Convierte una fila de la tabla USUARIO (snake_case) en una instancia de Usuario.
  // La columna edad no se lee: el objeto la calcula.
  #mapearFila(fila) {
    return new Usuario(
      fila.id,
      fila.primer_nombre,
      fila.segundo_nombre,
      fila.primer_apellido,
      fila.segundo_apellido,
      fila.fecha_nacimiento,
      fila.ciudad_domicilio,
      fila.estado
    );
  }
}

module.exports = UsuarioService;
