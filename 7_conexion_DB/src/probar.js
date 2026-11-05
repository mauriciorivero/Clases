// Prueba rápida de la conexión: node src/probar.js
import sql from './db.js'

// Esquema y tablas que crea parametrizacion/script_homologado.sql
const ESQUEMA = 'mydb'
const TABLAS_DEL_SCRIPT = ['EMPLEADO', 'EVALUACION', 'USUARIO']

// Lista las tablas del script que existen en la instancia de Supabase,
// con su número de columnas, e indica cuáles faltan por crear.
async function listarTablas() {
  const filas = await sql`
    select t.table_name as tabla, count(c.column_name)::int as columnas
    from information_schema.tables t
    left join information_schema.columns c
      on c.table_schema = t.table_schema and c.table_name = t.table_name
    where t.table_schema = ${ESQUEMA}
      and t.table_type = 'BASE TABLE'
      and t.table_name in ${sql(TABLAS_DEL_SCRIPT)}
    group by t.table_name
    order by t.table_name
  `

  console.log(`\nTablas del esquema "${ESQUEMA}":`)
  console.table(filas)

  const existentes = filas.map((f) => f.tabla)
  const faltantes = TABLAS_DEL_SCRIPT.filter((t) => !existentes.includes(t))
  if (faltantes.length > 0) {
    console.warn(`Faltan por crear: ${faltantes.join(', ')} (ejecuta el script SQL)`)
  }

  return filas
}

try {
  const [{ ahora, version }] = await sql`select now() as ahora, version() as version`
  console.log('Conexión OK:', ahora.toISOString())
  console.log(version)

  await listarTablas()
} catch (error) {
  console.error('No se pudo conectar:', error.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
