// Validacion de los datos recibidos en el body. Devuelve un arreglo de mensajes
// de error; si esta vacio, los datos son validos.
function validarCredenciales(datos) {
  const errores = [];

  if (typeof datos.username !== 'string' || datos.username.trim().length === 0) {
    errores.push('El campo username es obligatorio');
  }
  // La contrasenia no se recorta: los espacios hacen parte de ella
  if (typeof datos.password !== 'string' || datos.password.length === 0) {
    errores.push('El campo password es obligatorio');
  }

  return errores;
}

module.exports = { validarCredenciales };
