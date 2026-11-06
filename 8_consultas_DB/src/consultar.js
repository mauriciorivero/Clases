// Ejecuto las consultas y muestro los resultados en la terminal.
//   npm run consultar                    -> empleados y movimientos
//   npm run consultar:empleados          -> solo Supabase
//   npm run consultar:movimientos        -> solo MongoDB Atlas
//   npm run consultar -- movimientos 3   -> solo 3 movimientos (límite)
import sql from './db.js'
import { cerrarMongo } from './db_mongo.js'
import { consultarEmpleados } from './consultarEmpleados.js'
import { consultarMovimientos } from './consultarMovimientos.js'
import { validarOpciones } from './validaciones.js'

const FUENTES = ['empleados', 'movimientos', 'todo']

// Muestro las fechas como texto corto (UTC) para que la tabla se lea bien
const fechaCorta = (fecha) => fecha.toISOString().slice(0, 16).replace('T', ' ')

const filaEmpleado = (e) => ({
  id: e.id,
  nombre: e.nombre,
  apellido: e.apellido,
  nacimiento: fechaCorta(e.fecha_nacimiento).slice(0, 10),
})
const filaMovimiento = (m) => ({
  id: m.id,
  usuario: m.usuario,
  tipo: m.tipoMovimiento,
  tabla: m.tabla,
  campos: m.camposActualizados.join(', '),
  fechaHora: fechaCorta(m.fechaHora),
})

// Ejecuto UNA consulta y muestro su resultado. Si falla, imprimo el error y
// sigo: así un problema en Supabase no me impide probar MongoDB (y al revés).
async function mostrar(titulo, consultar, convertirFila) {
  console.log(`\n${titulo}`)
  try {
    const resultados = await consultar()
    if (resultados.length === 0) {
      console.log('(sin resultados: carga datos con npm run cargar:datos)')
    } else {
      console.table(resultados.map(convertirFila))
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

try {
  // process.argv = [node, este archivo, ...lo que escribí en la terminal]
  const [fuente = 'todo', limiteTexto] = process.argv.slice(2)
  if (!FUENTES.includes(fuente)) {
    throw new Error(`Fuente "${fuente}" no válida (usa ${FUENTES.join(', ')})`)
  }

  // Los argumentos llegan como texto: paso el límite a número y lo reviso
  const limite = limiteTexto === undefined ? undefined : Number(limiteTexto)
  const opciones = validarOpciones({ limite })

  if (fuente !== 'movimientos') {
    const consultar = () => consultarEmpleados(opciones)
    await mostrar('Empleados (Supabase)', consultar, filaEmpleado)
  }
  if (fuente !== 'empleados') {
    const consultar = () => consultarMovimientos(opciones)
    await mostrar('Movimientos (MongoDB Atlas)', consultar, filaMovimiento)
  }
} catch (error) {
  console.error('Error:', error.message)
  process.exitCode = 1
} finally {
  // Cierro las dos conexiones, aunque alguna nunca se haya abierto
  await Promise.allSettled([sql.end(), cerrarMongo()])
}
