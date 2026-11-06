// Aquí armo la conexión a Supabase (PostgreSQL) con el paquete `postgres`.
// Los datos los saco del .env, cada uno en su propia variable, y con ellos
// armo yo mismo la cadena de conexión (la clave nunca va en el código).
import postgres from 'postgres'

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

const host = leerVariable('SUPABASE_DB_HOST')
const puerto = Number(leerVariable('SUPABASE_DB_PORT'))
const baseDeDatos = leerVariable('SUPABASE_DB_NAME')
const usuario = leerVariable('SUPABASE_DB_USERNAME')
const clave = leerVariable('SUPABASE_DB_PASSWORD')

// Reviso que el host sea solo el nombre del servidor: sin "://" ni "/"
if (!/^[A-Za-z0-9.-]+$/.test(host)) {
  throw new Error('SUPABASE_DB_HOST debe ser solo el nombre del servidor')
}
// Reviso que el puerto sea un entero de 1 a 65535 (el pooler usa 6543)
if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
  throw new Error('SUPABASE_DB_PORT debe ser un número entre 1 y 65535')
}

// Armo la cadena: postgresql://usuario:clave@host:puerto/base
// Con encodeURIComponent protejo los símbolos (@, #, %) de usuario y clave
const connectionString =
  `postgresql://${encodeURIComponent(usuario)}:` +
  `${encodeURIComponent(clave)}@${host}:${puerto}/` +
  encodeURIComponent(baseDeDatos)

// El pooler de Supabase (puerto 6543) no admite prepared statements,
// así que los apago. Con connect_timeout el fallo me llega a los 10 s.
const sql = postgres(connectionString, {
  prepare: false,
  connect_timeout: 10,
})

export default sql
