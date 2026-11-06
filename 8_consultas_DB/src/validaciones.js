// Aquí dejo las validaciones que comparten consultarEmpleados.js y
// consultarMovimientos.js. Validar es revisar que un dato tenga la forma
// correcta ANTES de usarlo: así el error sale pronto y se entiende.

// Máximo de registros que dejo pedir de una sola vez
export const LIMITE_MAXIMO = 1000

// ¿Es un texto con algo más que espacios en blanco?
export function esTextoNoVacio(valor) {
  return typeof valor === 'string' && valor.trim().length > 0
}

// ¿Es un entero mayor que 0?
// Number.isInteger rechaza 3.5, NaN, Infinity y también el texto '3'.
export function esEnteroPositivo(valor) {
  return Number.isInteger(valor) && valor > 0
}

// ¿Es una fecha de verdad? `new Date('hola')` existe, pero es una
// "Invalid Date" y su getTime() da NaN.
export function esFechaValida(valor) {
  return valor instanceof Date && !Number.isNaN(valor.getTime())
}

// Reviso el objeto de opciones de las consultas, por ejemplo { limite: 10 }.
// Devuelvo { limite } ya revisado (undefined = sin límite).
export function validarOpciones(opciones) {
  // 1. Primero compruebo que sea un objeto de verdad (null y los arreglos
  //    también dan typeof 'object')
  const esObjeto =
    typeof opciones === 'object' &&
    opciones !== null &&
    !Array.isArray(opciones)
  if (!esObjeto) {
    throw new TypeError('Las opciones deben ser un objeto: { limite: 10 }')
  }

  // 2. No dejo pasar claves desconocidas: así un error de escritura
  //    (`limit` en vez de `limite`) no se me escapa en silencio
  const desconocidas = Object.keys(opciones).filter((k) => k !== 'limite')
  if (desconocidas.length > 0) {
    throw new TypeError(
      `Opciones no reconocidas: ${desconocidas.join(', ')}. Solo "limite"`
    )
  }

  // 3. El límite es opcional; si llega, debe ser entero de 1 a LIMITE_MAXIMO
  const { limite } = opciones
  if (limite !== undefined) {
    if (!Number.isInteger(limite) || limite < 1 || limite > LIMITE_MAXIMO) {
      throw new RangeError(
        `"limite" debe ser un entero entre 1 y ${LIMITE_MAXIMO} ` +
          `(recibí: ${String(limite)})`
      )
    }
  }

  return { limite }
}
