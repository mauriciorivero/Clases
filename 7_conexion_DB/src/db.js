// Conexión a Supabase (Postgres) usando el paquete `postgres`.
// La cadena de conexión viene de DATABASE_URL, definida en el archivo .env
// (nunca se escribe la contraseña directamente en el código).
import postgres from 'postgres'

// Carga el .env que está en la carpeta de la clase (funciona desde cualquier cwd)
try {
  process.loadEnvFile(new URL('../.env', import.meta.url))
} catch {
  // Si no existe .env, se usa lo que ya haya en el entorno
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('Falta DATABASE_URL. Copia .env.example a .env y pon tu contraseña.')
}

// El pooler de Supabase (puerto 6543, modo transacción) no soporta prepared statements
const sql = postgres(connectionString, { prepare: false })

export default sql