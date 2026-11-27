// Reglas de validacion de los datos recibidos en el body de cada peticion.
// Cada funcion recibe el objeto "datos" (req.body) y devuelve un arreglo de
// mensajes de error. Si el arreglo esta vacio, los datos son validos.

function esTextoNoVacio(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

// Valida los datos para crear/actualizar un Usuario
function validarUsuario(datos) {
  const errores = [];

  if (!esTextoNoVacio(datos.primerNombre)) {
    errores.push('El campo primerNombre es obligatorio');
  }
  if (!esTextoNoVacio(datos.primerApellido)) {
    errores.push('El campo primerApellido es obligatorio');
  }
  if (!datos.fechaNacimiento || isNaN(Date.parse(datos.fechaNacimiento))) {
    errores.push('El campo fechaNacimiento es obligatorio y debe ser una fecha valida');
  }
  if (!esTextoNoVacio(datos.ciudadDomicilio)) {
    errores.push('El campo ciudadDomicilio es obligatorio');
  }

  return errores;
}

// Valida los datos para crear/actualizar un Telefono
function validarTelefono(datos) {
  const errores = [];

  if (!esTextoNoVacio(datos.numeroTelefono)) {
    errores.push('El campo numeroTelefono es obligatorio');
  }
  if (!esTextoNoVacio(datos.tipoTelefono)) {
    errores.push('El campo tipoTelefono es obligatorio');
  }
  if (datos.usuarioId === undefined || datos.usuarioId === null || isNaN(Number(datos.usuarioId))) {
    errores.push('El campo usuarioId es obligatorio y debe ser numerico');
  }

  return errores;
}

// Valida los datos para crear/actualizar una Red Social
function validarRedSocial(datos) {
  const errores = [];

  if (!esTextoNoVacio(datos.nombre)) {
    errores.push('El campo nombre es obligatorio');
  }
  if (!esTextoNoVacio(datos.url)) {
    errores.push('El campo url es obligatorio');
  }

  return errores;
}

// Valida los datos para crear/actualizar un Perfil Social
function validarPerfilSocial(datos) {
  const errores = [];

  if (datos.redSocialId === undefined || datos.redSocialId === null || isNaN(Number(datos.redSocialId))) {
    errores.push('El campo redSocialId es obligatorio y debe ser numerico');
  }
  if (datos.usuarioId === undefined || datos.usuarioId === null || isNaN(Number(datos.usuarioId))) {
    errores.push('El campo usuarioId es obligatorio y debe ser numerico');
  }

  return errores;
}

module.exports = {
  validarUsuario,
  validarTelefono,
  validarRedSocial,
  validarPerfilSocial
};
