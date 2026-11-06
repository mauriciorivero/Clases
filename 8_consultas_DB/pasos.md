# Clase 8 · Consultas a bases de datos con Node.js

Guion de la clase. La presentación (`diapositivas_instruccion/index.html`) sigue este mismo orden y el código completo de cada paso está en `src/`. Partimos de la clase 7: ya tienes una cuenta en **Supabase** (con las tablas de `parametrizacion/script_homologado.sql`) y un cluster en **MongoDB Atlas** con tu IP permitida. Hoy separamos las conexiones de las pruebas, armamos las cadenas de conexión desde un `.env` por partes y **consultamos** empleados (Supabase) y movimientos (MongoDB Atlas), validando los datos y manejando los errores. Requiere Node.js 20.12 o superior.

# paso1 · Preparar el proyecto
Igual que en la clase 7: una carpeta, un `package.json` y dos paquetes. Si ya hiciste esa clase, copia su carpeta y renómbrala.
```bash
mkdir 8_consultas_DB && cd 8_consultas_DB
npm init -y
npm pkg set type=module
npm pkg set engines.node=">=20.12"
npm install postgres mongodb
mkdir src parametrizacion
```
Los scripts del `package.json` quedan así (se agregan a mano o con `npm pkg set`):
```bash
npm pkg set scripts.probar="node src/probar.js"
npm pkg set scripts.probar:mongo="node src/probarMongo.js"
npm pkg set scripts.consultar="node src/consultar.js"
npm pkg set scripts.consultar:empleados="node src/consultar.js empleados"
npm pkg set scripts.consultar:movimientos="node src/consultar.js movimientos"
npm pkg set scripts.cargar:datos="node src/cargarDatosEjemplo.js"
```

# paso2 · El `.env` por partes
En la clase 7 la contraseña de Supabase viajaba dentro de una URL (`DATABASE_URL`). Ahora **cada dato tiene su variable** y el código arma la cadena de conexión. Se comparte una plantilla sin secretos: `.env.example`.
```bash
# .env.example
SUPABASE_DB_HOST=aws-0-us-east-1.pooler.supabase.com
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USERNAME=postgres.[TU-REF-DE-PROYECTO]
SUPABASE_DB_PASSWORD=[YOUR-PASSWORD]

MONGO_DB_HOST=cluster0.xxxxx.mongodb.net
MONGO_DB_USERNAME=tu_usuario
MONGO_DB_PASSWORD=tu_contraseña
MONGO_DB_NAME=Auditoria_HHRR
```
Copia `.env.example` a `.env` y escribe tus datos reales, **sin codificar**: el código codifica los símbolos de la contraseña (`@` pasa a `%40`). Si un valor tiene espacios o un `#`, enciérralo entre comillas simples. El `.gitignore` de la raíz del repositorio ya ignora los archivos `.env`. El host de Atlas y la base de datos ya no están escritos en el código: viven en `MONGO_DB_HOST` y `MONGO_DB_NAME`.

# paso3 · `src/db.js`: la conexión a Supabase
1. **Cargar el `.env`:** `process.loadEnvFile(new URL('../.env', import.meta.url))`. Solo se ignora el error `ENOENT` (el archivo no existe); cualquier otro error (permisos, archivo dañado) se vuelve a lanzar.
2. **`leerVariable(nombre)`:** lee la variable, falla con un mensaje que dice **cuál** falta si no existe o está vacía, y recorta los espacios (menos en la contraseña).
3. **Validar:** el host solo admite letras, números, puntos y guiones (si pegan una URL completa, se detecta) y el puerto debe ser un entero entre 1 y 65535.
4. **Armar la cadena:** `postgresql://usuario:clave@host:puerto/base`, con `encodeURIComponent` en el usuario, la clave y la base.
5. **Crear el cliente:** `postgres(cadena, { prepare: false, connect_timeout: 10 })`. `prepare: false` es obligatorio con el pooler en modo transacción; `connect_timeout` avisa del fallo a los 10 segundos y no a los 30.
6. `export default sql`: el módulo se ejecuta una sola vez, así que todos comparten la misma conexión (el Singleton de la clase 6).

# paso4 · `src/db_mongo.js`: la conexión a MongoDB Atlas
En la clase 7, `probarMongo.js` armaba la URI, creaba el cliente y probaba. Igual que con Supabase, ahora cada tarea tiene su archivo: `db_mongo.js` **conecta** y `probarMongo.js` **prueba**.
1. Carga el `.env` y lee las cuatro variables (`MONGO_DB_HOST`, `MONGO_DB_USERNAME`, `MONGO_DB_PASSWORD`, `MONGO_DB_NAME`) con la misma `leerVariable`.
2. Valida el host (sin `://` ni `/`) y el nombre de la base (letras, números, `_` y `-`, máximo 63).
3. Arma la URI `mongodb+srv://usuario:clave@host/` con `encodeURIComponent`.
4. Crea el `MongoClient` con la **Stable API** (`version: ServerApiVersion.v1, strict: true, deprecationErrors: true`) y `serverSelectionTimeoutMS: 10000`. `new MongoClient(uri)` todavía no conecta.
5. Exporta dos funciones: `conectarMongo()` conecta solo la primera vez, guarda la base y la reutiliza; `cerrarMongo()` cierra la conexión (va en un `finally`).

# paso5 · `src/probarMongo.js`: solo la prueba
Importa `conectarMongo` y `cerrarMongo`, hace un `ping` con `db.command({ ping: 1 })`, lista las bases con `db.admin().listDatabases()` y cierra la conexión en el `finally`. Ya no sabe nada de URIs.

# paso6 · Probar las dos conexiones
```bash
npm run probar
npm run probar:mongo
```
`probar` debe mostrar `EMPLEADO` (4 columnas), `EVALUACION` (4) y `USUARIO` (3). `probar:mongo` debe mostrar `Conexión OK a MongoDB Atlas (base "Auditoria_HHRR")` y la lista de bases del cluster.

# paso7 · `src/validaciones.js`: validar antes de usar
Funciones pequeñas que comparten las dos consultas:
1. `esTextoNoVacio`, `esEnteroPositivo` y `esFechaValida` responden `true` o `false`.
2. `validarOpciones(opciones)` revisa el objeto de opciones, por ejemplo `{ limite: 10 }`: debe ser un objeto de verdad (no `null` ni un arreglo), no puede traer claves desconocidas (`{ limit: 5 }` falla en vez de ignorarse) y el `limite`, si viene, debe ser un entero entre 1 y 1000. Lanza `TypeError` si el **tipo** es incorrecto y `RangeError` si el valor está **fuera de rango**.

# paso8 · `src/consultarEmpleados.js`: la consulta SQL
La función `consultarEmpleados({ limite })` sigue tres pasos:
1. **Validar la entrada** con `validarOpciones`, antes de hablar con la base de datos.
2. **Consultar** con `sql` dentro de un `try / catch`: `select id, nombre, apellido, fecha_nacimiento from mydb."EMPLEADO" order by id`, con `limit` solo si hay límite. Cada `${}` viaja como parámetro (no hay inyección SQL). Si falla, `describirError` traduce el código (`42P01` tabla inexistente, `28P01` contraseña incorrecta, `ENOTFOUND`, `CONNECT_TIMEOUT`...) a una frase que dice qué revisar, y el error original queda en `cause`.
3. **Validar la salida** con `validarEmpleado`: cada fila debe traer `id`, `nombre`, `apellido` y `fecha_nacimiento` correctos. Una tabla vacía devuelve `[]`, no un error.

# paso9 · La colección `movimientos`
En MongoDB los datos son documentos parecidos a JSON. Cada movimiento registra quién hizo qué y cuándo:
```json
{
  "_id": { "$oid": "6548a1f0e4b0c3d2a1b2c3d4" },
  "id": 1042,
  "usuario": "Mauricio Rivero",
  "tipoMovimiento": "actualizar",
  "tabla": "EMPLEADO",
  "camposActualizados": ["email", "telefono"],
  "fechaHora": { "$date": "2026-11-05T15:47:00.000Z" }
}
```
`$oid` y `$date` son JSON extendido: el driver entrega un `ObjectId` y un `Date` de JavaScript. MongoDB no obliga a que todos los documentos tengan esta forma, así que la validamos nosotros. `email` y `telefono` son solo un ejemplo: la tabla `EMPLEADO` de esta clase no tiene esas columnas.

# paso10 · `src/consultarMovimientos.js`: la consulta a MongoDB
Misma receta de tres pasos, con `find()` en lugar de SQL:
1. **Validar la entrada** con `validarOpciones`.
2. **Consultar:** `db.collection('movimientos').find({}).sort({ fechaHora: -1 })`, con `.limit()` si hay límite, y `toArray()` para juntar los resultados. `describirError` traduce los errores del driver (`MongoServerSelectionError`, autenticación, permisos, `ENOTFOUND`). Atlas responde la contraseña incorrecta con `code: 8000`, por eso también se revisa el mensaje.
3. **Validar la salida** con `validarMovimiento`: `id` entero, `usuario`, `tipoMovimiento` y `tabla` con texto, `fechaHora` válida y `camposActualizados` (opcional) como arreglo de textos. Devuelve un objeto limpio, con `_id` convertido a texto.

# paso11 · `src/consultar.js`: mostrar los resultados
```bash
npm run consultar                    # empleados y movimientos
npm run consultar:empleados          # solo Supabase
npm run consultar:movimientos        # solo MongoDB Atlas
npm run consultar -- movimientos 3   # solo 3 movimientos (límite)
```
1. `process.argv.slice(2)` trae lo que se escribió en la terminal: la fuente (`empleados`, `movimientos` o `todo`) y el límite, que llega como texto y se convierte con `Number(...)`.
2. `mostrar(titulo, consultar, convertirFila)` ejecuta **una** consulta dentro de su propio `try / catch`: si Supabase falla, MongoDB se consulta igual (y al revés). Los resultados salen con `console.table`.
3. El `finally` cierra las dos conexiones con `Promise.allSettled([sql.end(), cerrarMongo()])`.

# paso12 · `src/cargarDatosEjemplo.js`: datos para practicar
```bash
npm run cargar:datos
```
Es el único script que **escribe** datos. Se puede repetir sin duplicar: en `EMPLEADO` solo inserta si la tabla está vacía; en `movimientos` busca con `$in` qué `id` ya existen y solo inserta los que faltan (`insertMany`). Cada carga va en su propio `try / catch`.

# paso13 · Ejecutar las consultas
```bash
npm run consultar
npm run consultar -- empleados 2
npm run consultar -- empleados abc     # Error: "limite" debe ser un entero entre 1 y 1000 (recibí: NaN)
npm run consultar -- clientes          # Error: Fuente "clientes" no válida (usa empleados, movimientos, todo)
```
Los empleados salen ordenados por `id`; los movimientos, del más reciente al más antiguo.

# paso14 · Si algo falla
| Mensaje | Causa probable |
|---------|----------------|
| `Falta SUPABASE_DB_PORT. Copia .env.example a .env.` | La variable no existe o está vacía; el nombre debe coincidir con el de `.env.example`. |
| `SUPABASE_DB_PORT debe ser un número entre 1 y 65535` | El valor del `.env` no tiene la forma correcta. |
| `"limite" debe ser un entero entre 1 y 1000` | El parámetro llegó mal: texto, decimal, 0 o demasiado grande. |
| `usuario o contraseña incorrectos` | Credenciales distintas a las de la base que falló. En el pooler el usuario es `postgres.<ref>`. |
| `no se encontró el servidor` / `no se encontró el cluster` | El host del `.env` está mal escrito o no hay internet. |
| `no se alcanzó el cluster` | Tu IP no está en **Network Access** de Atlas, o no hay internet. |
| `la tabla mydb."EMPLEADO" no existe` | Falta ejecutar `parametrizacion/script_homologado.sql` en Supabase. |
| `Empleado inválido` / `Movimiento inválido` | La base devolvió un dato con forma inesperada: el mensaje dice cuál y qué campos. |

# retos
- **Filtro en Postgres:** agrega a `consultarEmpleados` la opción `apellido`, valídala como texto no vacío y úsala con `where apellido = ${apellido}`.
- **Filtro en MongoDB:** agrega a `consultarMovimientos` la opción `usuario` y úsala en `find({ usuario })`.
- **Rango de fechas:** filtra los movimientos entre dos fechas con `$gte` y `$lte`, y valida que `desde` sea anterior a `hasta`.
- **Otra tabla:** crea `consultarEvaluaciones.js` con un `join` a `"EMPLEADO"`.
- **Errores:** apaga tu internet o cambia una letra del host y compara los mensajes.
- **Pruebas:** escribe un script que llame a `validarOpciones` con diez entradas distintas y anota cuáles lanzan error.
