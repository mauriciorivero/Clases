// Mi prueba de conexión a MongoDB Atlas: npm run probar:mongo
// La conexión la hace db_mongo.js; aquí solo compruebo que funcione.
import { conectarMongo, cerrarMongo } from './db_mongo.js'

try {
  // Abro la conexión y me traigo la base del .env (MONGO_DB_NAME)
  const db = await conectarMongo()

  // `ping` es lo más liviano: solo le pregunto si el servidor responde
  await db.command({ ping: 1 })
  console.log(`Conexión OK a MongoDB Atlas (base "${db.databaseName}")`)

  // Listo las bases de datos del cluster
  const { databases } = await db.admin().listDatabases()
  const nombres = databases.map((d) => d.name).join(', ')
  console.log('Bases de datos:', nombres || '(ninguna)')
} catch (error) {
  console.error('No se pudo conectar a MongoDB:', error.message)
  process.exitCode = 1
} finally {
  // Cierro la conexión siempre, haya salido bien o mal
  await cerrarMongo()
}
