// Prueba de conexión a MongoDB Atlas: node src/probarMongo.js (o npm run probar:mongo)
// Usuario y contraseña se leen del .env (MONGO_DB_USERNAME y MONGO_DB_PASSWORD).
import { MongoClient, ServerApiVersion } from 'mongodb'

try {
  process.loadEnvFile(new URL('../.env', import.meta.url))
} catch {
  // Si no existe .env, se usa lo que ya haya en el entorno
}

const { MONGO_DB_USERNAME, MONGO_DB_PASSWORD } = process.env
if (!MONGO_DB_USERNAME || !MONGO_DB_PASSWORD) {
  throw new Error('Faltan MONGO_DB_USERNAME o MONGO_DB_PASSWORD en el .env')
}

// encodeURIComponent protege los caracteres especiales de la contraseña
const uri =
  `mongodb+srv://${encodeURIComponent(MONGO_DB_USERNAME)}:` +
  `${encodeURIComponent(MONGO_DB_PASSWORD)}@cluster0.9y3jazd.mongodb.net/`

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  serverSelectionTimeoutMS: 10000,
})

try {
  await client.connect()
  await client.db('admin').command({ ping: 1 })
  console.log('Conexión OK a MongoDB Atlas (ping exitoso)')

  const { databases } = await client.db().admin().listDatabases()
  console.log('Bases de datos:', databases.map((d) => d.name).join(', ') || '(ninguna)')
} catch (error) {
  console.error('No se pudo conectar a MongoDB:', error.message)
  process.exitCode = 1
} finally {
  await client.close()
}
