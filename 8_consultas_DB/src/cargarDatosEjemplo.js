// Cargo datos de ejemplo para practicar las consultas: npm run cargar:datos
// Se puede repetir sin miedo: no duplico, no borro ni modifico lo que ya hay.
//   - EMPLEADO: solo inserto si la tabla está vacía.
//   - movimientos: solo inserto los documentos cuyo `id` todavía no está.
import { ObjectId } from 'mongodb'
import sql from './db.js'
import { conectarMongo, cerrarMongo } from './db_mongo.js'

// Filas para la tabla mydb."EMPLEADO" (el id lo genera PostgreSQL solo)
const EMPLEADOS = [
  ['Laura', 'Gómez', '1990-04-15'],
  ['Carlos', 'Martínez', '1985-09-02'],
  ['Ana', 'Rodríguez', '1993-12-21'],
  ['Andrés', 'Torres', '1988-06-30'],
  ['Camila', 'Herrera', '1995-02-08'],
].map(([nombre, apellido, nacimiento]) => ({
  nombre,
  apellido,
  fecha_nacimiento: new Date(nacimiento),
}))

// Documentos para la colección movimientos. El primero es el del ejemplo.
const MOVIMIENTOS = [
  {
    _id: new ObjectId('6548a1f0e4b0c3d2a1b2c3d4'),
    id: 1042,
    usuario: 'Mauricio Rivero',
    tipoMovimiento: 'actualizar',
    tabla: 'EMPLEADO',
    camposActualizados: ['email', 'telefono'],
    fechaHora: new Date('2026-11-05T15:47:00.000Z'),
  },
  {
    id: 1043,
    usuario: 'Mauricio Rivero',
    tipoMovimiento: 'crear',
    tabla: 'EMPLEADO',
    camposActualizados: [],
    fechaHora: new Date('2026-11-05T16:02:00.000Z'),
  },
  {
    id: 1044,
    usuario: 'Laura Gómez',
    tipoMovimiento: 'actualizar',
    tabla: 'EVALUACION',
    camposActualizados: ['descripcion'],
    fechaHora: new Date('2026-11-05T17:15:00.000Z'),
  },
  {
    id: 1045,
    usuario: 'Carlos Martínez',
    tipoMovimiento: 'eliminar',
    tabla: 'USUARIO',
    camposActualizados: [],
    fechaHora: new Date('2026-11-06T08:30:00.000Z'),
  },
  {
    id: 1046,
    usuario: 'Laura Gómez',
    tipoMovimiento: 'actualizar',
    tabla: 'EMPLEADO',
    camposActualizados: ['nombre', 'apellido'],
    fechaHora: new Date('2026-11-06T09:10:00.000Z'),
  },
]

// Inserto los empleados en Supabase, pero solo si la tabla está vacía
async function cargarEmpleados() {
  const [{ total }] = await sql`
    select count(*)::int as total from mydb."EMPLEADO"
  `
  if (total > 0) {
    console.log(`EMPLEADO ya tiene ${total} filas: no se inserta nada.`)
    return
  }

  // sql(arreglo, 'columna', ...) arma un solo insert con todas las filas
  await sql`
    insert into mydb."EMPLEADO"
    ${sql(EMPLEADOS, 'nombre', 'apellido', 'fecha_nacimiento')}
  `
  console.log(`EMPLEADO: ${EMPLEADOS.length} filas insertadas.`)
}

// Inserto en MongoDB Atlas los movimientos que todavía no existen
async function cargarMovimientos() {
  const db = await conectarMongo()
  const coleccion = db.collection('movimientos')

  // Busco cuáles de mis `id` ya están guardados ($in = "está en...")
  const ids = MOVIMIENTOS.map((m) => m.id)
  const existentes = await coleccion
    .find({ id: { $in: ids } }, { projection: { id: 1, _id: 0 } })
    .toArray()
  const yaGuardados = new Set(existentes.map((doc) => doc.id))

  // Me quedo solo con los que faltan
  const pendientes = MOVIMIENTOS.filter((m) => !yaGuardados.has(m.id))
  if (pendientes.length === 0) {
    console.log('movimientos: ya están todos, no se inserta nada.')
    return
  }

  // insertMany guarda todos los documentos en una sola llamada
  const { insertedCount } = await coleccion.insertMany(pendientes)
  console.log(`movimientos: ${insertedCount} documentos insertados.`)
}

// Cada carga va en su propio try/catch: si una falla, la otra sigue
for (const [nombre, cargar] of [
  ['Supabase', cargarEmpleados],
  ['MongoDB Atlas', cargarMovimientos],
]) {
  try {
    await cargar()
  } catch (error) {
    console.error(`No se pudo cargar ${nombre}:`, error.message)
    process.exitCode = 1
  }
}

// Cierro las dos conexiones, aunque alguna nunca se haya abierto
await Promise.allSettled([sql.end(), cerrarMongo()])
