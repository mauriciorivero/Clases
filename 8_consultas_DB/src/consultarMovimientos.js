// Consulta a MongoDB Atlas: traigo los documentos de movimientos.
// Uso:  const movimientos = await consultarMovimientos({ limite: 10 })
import { conectarMongo } from './db_mongo.js'
import {
  esEnteroPositivo,
  esFechaValida,
  esTextoNoVacio,
  validarOpciones,
} from './validaciones.js'

// Nombre de la colección (la base de datos la elijo en MONGO_DB_NAME)
const COLECCION = 'movimientos'

// Convierto un error del driver de MongoDB en una frase que se entienda
// y me diga qué revisar.
function describirError(error) {
  if (error.name === 'MongoServerSelectionError') {
    // No pude llegar a ningún servidor del cluster
    return 'no se alcanzó el cluster ' +
      '(revisa tu internet y que tu IP esté en Network Access)'
  }
  // Atlas contesta los dos casos siguientes con code 8000 ("AtlasError"); un
  // MongoDB propio usa code 18 y 13. Por eso también miro el mensaje.
  if (error.code === 18 || /bad auth|authentication/i.test(error.message)) {
    return 'usuario o contraseña incorrectos ' +
      '(revisa MONGO_DB_USERNAME y MONGO_DB_PASSWORD)'
  }
  if (error.code === 13 || /not allowed to do action/i.test(error.message)) {
    return 'el usuario no tiene permiso para leer esta colección ' +
      '(revisa Database Access)'
  }
  if (error.code === 'ENOTFOUND') {
    // El nombre del cluster no existe
    return 'no se encontró el cluster (revisa MONGO_DB_HOST)'
  }
  return error.message
}

// Reviso que un documento tenga la forma que espero y devuelvo un objeto
// limpio. MongoDB no impone un esquema, así que lo valido yo.
function validarMovimiento(doc, indice) {
  const invalidos = []
  if (!esEnteroPositivo(doc.id)) invalidos.push('id')
  if (!esTextoNoVacio(doc.usuario)) invalidos.push('usuario')
  if (!esTextoNoVacio(doc.tipoMovimiento)) invalidos.push('tipoMovimiento')
  if (!esTextoNoVacio(doc.tabla)) invalidos.push('tabla')
  if (!esFechaValida(doc.fechaHora)) invalidos.push('fechaHora')

  // camposActualizados es opcional (crear y eliminar no lo necesitan),
  // pero si viene, lo quiero como arreglo de textos
  const campos = doc.camposActualizados ?? []
  if (!Array.isArray(campos) || !campos.every(esTextoNoVacio)) {
    invalidos.push('camposActualizados')
  }

  if (invalidos.length > 0) {
    throw new Error(
      `Movimiento inválido (documento ${indice + 1}, _id ${doc._id}): ` +
        `revisa ${invalidos.join(', ')}`
    )
  }

  const { id, usuario, tipoMovimiento, tabla, fechaHora } = doc
  return {
    _id: String(doc._id),
    id,
    usuario,
    tipoMovimiento,
    tabla,
    camposActualizados: campos,
    fechaHora,
  }
}

// Devuelvo los movimientos, del más reciente al más antiguo.
// Opciones: { limite } = cuántos traigo como máximo (entero de 1 a 1000).
export async function consultarMovimientos(opciones = {}) {
  // 1. Reviso lo que me llega, ANTES de hablar con la base de datos
  const { limite } = validarOpciones(opciones)

  // 2. Hago la consulta. Si falla, el catch lo traduce a un mensaje claro
  //    y guardo el error original en `cause` por si lo necesito.
  let documentos
  try {
    const db = await conectarMongo()

    // find({}) = sin filtro (todos). sort: -1 = de mayor a menor
    const consulta = db.collection(COLECCION).find({}).sort({ fechaHora: -1 })
    if (limite !== undefined) consulta.limit(limite)

    // El cursor trae los documentos por partes; toArray() los junta
    documentos = await consulta.toArray()
  } catch (error) {
    throw new Error(
      `No se pudieron consultar los movimientos: ${describirError(error)}`,
      { cause: error }
    )
  }

  // 3. Reviso lo que devolvió la base (colección vacía = [], no es un error)
  return documentos.map(validarMovimiento)
}
