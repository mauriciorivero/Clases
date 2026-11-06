// Consulta a Supabase (PostgreSQL): traigo los empleados de EMPLEADO.
// Uso:  const empleados = await consultarEmpleados({ limite: 10 })
import sql from './db.js'
import {
  esEnteroPositivo,
  esFechaValida,
  esTextoNoVacio,
  validarOpciones,
} from './validaciones.js'

// Convierto el código de un error de PostgreSQL (o de la red) en una frase
// que se entienda y me diga qué revisar.
function describirError(error) {
  switch (error.code) {
    case '42P01': // la tabla no existe
      return 'la tabla mydb."EMPLEADO" no existe ' +
        '(ejecuta parametrizacion/script_homologado.sql)'
    case '28P01': // contraseña incorrecta
      return 'usuario o contraseña incorrectos ' +
        '(revisa SUPABASE_DB_USERNAME y SUPABASE_DB_PASSWORD)'
    case 'CONNECT_TIMEOUT': // el servidor no respondió a tiempo
    case 'ECONNREFUSED': // el servidor rechazó la conexión
      return 'no hubo respuesta del servidor ' +
        '(revisa tu internet, el host y el puerto)'
    case 'ENOTFOUND': // el nombre del servidor no existe
      return 'no se encontró el servidor (revisa SUPABASE_DB_HOST)'
    default:
      return error.message
  }
}

// Reviso que una fila tenga la forma que espero y devuelvo un objeto limpio.
// Si cambia la tabla (otra columna, un NULL), el error me salta aquí.
function validarEmpleado(fila, indice) {
  const invalidos = []
  if (!esEnteroPositivo(fila.id)) invalidos.push('id')
  if (!esTextoNoVacio(fila.nombre)) invalidos.push('nombre')
  if (!esTextoNoVacio(fila.apellido)) invalidos.push('apellido')
  if (!esFechaValida(fila.fecha_nacimiento)) invalidos.push('fecha_nacimiento')

  if (invalidos.length > 0) {
    throw new Error(
      `Empleado inválido (fila ${indice + 1}): revisa ${invalidos.join(', ')}`
    )
  }

  const { id, nombre, apellido, fecha_nacimiento } = fila
  return { id, nombre, apellido, fecha_nacimiento }
}

// Devuelvo los empleados ordenados por id.
// Opciones: { limite } = cuántos traigo como máximo (entero de 1 a 1000).
export async function consultarEmpleados(opciones = {}) {
  // 1. Reviso lo que me llega, ANTES de hablar con la base de datos
  const { limite } = validarOpciones(opciones)

  // 2. Hago la consulta. Si falla, el catch lo traduce a un mensaje claro
  //    y guardo el error original en `cause` por si lo necesito.
  let filas
  try {
    // `sql` es una función etiqueta: cada ${} viaja como parámetro, no
    // pegado al texto, así que no hay inyección SQL. sql`` no agrega nada.
    filas = await sql`
      select id, nombre, apellido, fecha_nacimiento
      from mydb."EMPLEADO"
      order by id
      ${limite === undefined ? sql`` : sql`limit ${limite}`}
    `
  } catch (error) {
    throw new Error(
      `No se pudieron consultar los empleados: ${describirError(error)}`,
      { cause: error }
    )
  }

  // 3. Reviso lo que devolvió la base (tabla vacía da [], no es un error)
  return filas.map(validarEmpleado)
}
