// Saneamiento y tipado estricto de los datos externos.
// Los setters de las clases de dominio (models/) pasan por aqui cada valor que reciben:
// cada funcion devuelve un valor limpio o lanza un error 400. Asi ninguna entidad
// (ni, por tanto, ninguna consulta SQL) contiene objetos, arreglos, numeros fuera de
// rango o textos mas largos que la columna de la base de datos.
const { crearError } = require('./helpers');

const MAX_VARCHAR = 45; // longitud de las columnas VARCHAR(45) del esquema
const MAX_INT = 2147483647; // maximo de una columna INT de MySQL

function limitarLongitud(texto, campo, max) {
  if (texto.length > max) {
    throw crearError(`El campo ${campo} no puede superar ${max} caracteres`, 400);
  }
  return texto;
}

// Texto obligatorio: solo acepta strings no vacios. Devuelve el texto sin espacios en los extremos.
function textoRequerido(valor, campo, max = MAX_VARCHAR) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw crearError(`El campo ${campo} es obligatorio y debe ser texto`, 400);
  }
  return limitarLongitud(valor.trim(), campo, max);
}

// Texto opcional: undefined, null o vacio se guardan como null; cualquier otro tipo que no sea string se rechaza.
function textoOpcional(valor, campo, max = MAX_VARCHAR) {
  if (valor === undefined || valor === null) {
    return null;
  }
  if (typeof valor !== 'string') {
    throw crearError(`El campo ${campo} debe ser texto`, 400);
  }
  const limpio = valor.trim();
  return limpio === '' ? null : limitarLongitud(limpio, campo, max);
}

// Entero positivo (ids). Acepta un numero entero o un string compuesto solo por digitos
// (los ids de la URL llegan como string); rechaza "5abc", "1 OR 1=1", arreglos, objetos, etc.
function enteroPositivo(valor, campo) {
  const numero = typeof valor === 'string' && /^\d+$/.test(valor.trim()) ? Number(valor.trim()) : valor;
  if (!Number.isSafeInteger(numero) || numero < 1 || numero > MAX_INT) {
    throw crearError(`El campo ${campo} debe ser un entero positivo`, 400);
  }
  return numero;
}

// Indicador 0/1 (activo, estado). Acepta 0, 1, true o false.
function indicador(valor, campo) {
  if (valor === 1 || valor === true) {
    return 1;
  }
  if (valor === 0 || valor === false) {
    return 0;
  }
  throw crearError(`El campo ${campo} debe ser 0 o 1`, 400);
}

// Fecha: acepta un objeto Date valido (asi llega desde MySQL) o un texto que Date.parse
// reconozca. Si el texto empieza por aaaa-mm-dd, ademas se exige que ese dia exista en el
// calendario (Date.parse acepta, por ejemplo, el 30 de febrero).
function fecha(valor, campo) {
  const error = () => crearError(`El campo ${campo} es obligatorio y debe ser una fecha valida`, 400);

  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) {
      throw error();
    }
    return new Date(valor.getTime());
  }

  if (typeof valor !== 'string' || Number.isNaN(Date.parse(valor))) {
    throw error();
  }

  const texto = valor.trim();
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);
  if (partes) {
    const [, anio, mes, dia] = partes.map(Number);
    const comprobacion = new Date(Date.UTC(anio, mes - 1, dia));
    if (comprobacion.getUTCMonth() !== mes - 1 || comprobacion.getUTCDate() !== dia) {
      throw error();
    }
  }
  return texto;
}

// Comprueba que un atributo obligatorio de una entidad ya tenga valor.
// Las entidades pueden crearse incompletas (ej: solo con el id, para buscarlas),
// por eso esta comprobacion se hace antes de usar el dato.
function exigir(valor, campo) {
  if (valor === null || valor === undefined) {
    throw crearError(`El campo ${campo} es obligatorio`, 400);
  }
  return valor;
}

module.exports = { textoRequerido, textoOpcional, enteroPositivo, indicador, fecha, exigir };
