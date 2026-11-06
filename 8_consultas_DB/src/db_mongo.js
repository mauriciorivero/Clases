// Aquí armo la conexión a MongoDB Atlas con el driver `mongodb`.
// Este archivo SOLO conecta; las pruebas y las consultas viven en otros
// archivos que importan `conectarMongo` y `cerrarMongo`.
import { MongoClient, ServerApiVersion } from 'mongodb'

// Cargo el .env de la carpeta de la clase (me sirve desde cualquier cwd)
try {
  process.loadEnvFile(new URL('../.env', import.meta.url))
} catch (error) {
  // Si no hay .env, sigo con las variables del sistema.
  // Cualquier otro error (permisos, archivo dañado) sí lo dejo salir.
  if (error.code !== 'ENOENT') throw error
}

// Leo una variable del entorno y paro de una si falta o está vacía
function leerVariable(nombre) {
  const valor = process.env[nombre]
  if (valor === undefined || valor.trim() === '') {
    throw new Error(`Falta ${nombre}. Copia .env.example a .env.`)
  }
  // Le quito los espacios sobrantes, menos a la contraseña:
  // esa la dejo exactamente como me la escribieron
  return nombre.endsWith('PASSWORD') ? valor : valor.trim()
}

const host = leerVariable('MONGO_DB_HOST')
const usuario = leerVariable('MONGO_DB_USERNAME')
const clave = leerVariable('MONGO_DB_PASSWORD')
const nombreBD = leerVariable('MONGO_DB_NAME')

// Reviso que el host sea solo el nombre del cluster: sin "://" ni "/"
if (!/^[A-Za-z0-9.-]+$/.test(host)) {
  throw new Error('MONGO_DB_HOST debe ser solo el nombre del cluster')
}
// Mongo no deja espacios ni símbolos como / . $ en el nombre de la base
if (!/^[A-Za-z0-9_-]{1,63}$/.test(nombreBD)) {
  throw new Error('MONGO_DB_NAME solo admite letras, números, "_" y "-"')
}

// Armo la URI: mongodb+srv://usuario:clave@host/
// Con encodeURIComponent protejo los símbolos (@, #, %) de usuario y clave
const uri =
  `mongodb+srv://${encodeURIComponent(usuario)}:` +
  `${encodeURIComponent(clave)}@${host}/`

// Stable API: dejo fijo el comportamiento del servidor en la versión 1.
// Con serverSelectionTimeoutMS el fallo me llega a los 10 s y no a los 30 s.
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 10000,
})

// Aquí guardo la base ya conectada para no reconectar en cada llamada
let baseDeDatos = null

// Conecto (solo la primera vez) y devuelvo la base MONGO_DB_NAME.
// Si la conexión falla, el error le llega a quien me llamó y que él decida.
export async function conectarMongo() {
  if (baseDeDatos === null) {
    await client.connect()
    baseDeDatos = client.db(nombreBD)
  }
  return baseDeDatos
}

// Cierro la conexión. La llamo siempre al terminar (en un `finally`);
// si no, el programa se queda esperando y nunca termina.
export async function cerrarMongo() {
  baseDeDatos = null
  await client.close()
}
