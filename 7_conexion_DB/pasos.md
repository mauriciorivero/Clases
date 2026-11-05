# Clase 7 · Conexión a bases de datos con Node.js

Guion de la clase. La presentación (`diapositivas_instruccion/index.html`) sigue este mismo orden y el código completo de cada paso está en `src/` y `parametrizacion/`. Se conectan dos servicios en la nube: **Supabase** (PostgreSQL) con el paquete `postgres` y **MongoDB Atlas** con el driver `mongodb`. Requiere Node.js 20.12 o superior y una cuenta en cada servicio.

# paso1
Preparar el proyecto. El `"type": "module"` activa `import` y `export` (como en la clase 1) y el campo `engines` documenta la versión mínima de Node.js.
```bash
mkdir 7_conexion_DB && cd 7_conexion_DB
npm init -y
npm pkg set type=module
npm pkg set engines.node=">=20.12"
npm install postgres mongodb
npm pkg set scripts.probar="node src/probar.js"
npm pkg set scripts.probar:mongo="node src/probarMongo.js"
mkdir src parametrizacion
```

# paso2 · Las credenciales van en un `.env`
Una contraseña escrita en el código se queda en el historial de git. Se guarda en un archivo `.env`, que **no se sube**, y se comparte una plantilla sin secretos: `.env.example`.
```bash
# .env.example
DATABASE_URL=postgresql://postgres.[TU-REF-DE-PROYECTO]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# MongoDB Atlas
MONGO_DB_USERNAME=tu_usuario
MONGO_DB_PASSWORD=tu_contraseña
```
Copia `.env.example` a `.env` y escribe tus datos reales. Si la contraseña tiene caracteres especiales hay que codificarlos (`@` se escribe `%40`). El `.gitignore` de la raíz del repositorio ya ignora los archivos `.env`.

# paso3 · Supabase: la cadena de conexión
1. Crea un proyecto en [supabase.com](https://supabase.com) y **guarda la contraseña** de la base de datos.
2. Abre el botón **Connect** del panel del proyecto.
3. Elige **Transaction pooler** (puerto `6543`). La conexión directa (puerto `5432`) usa IPv6 y puede fallar en redes que solo tienen IPv4.
4. Copia la URI en tu `.env` como `DATABASE_URL` y reemplaza `[YOUR-PASSWORD]`.

La URL tiene seis partes: protocolo, usuario (`postgres.<ref>`), contraseña, servidor, puerto y base de datos.

# paso4 · `src/db.js`: la conexión a Supabase
1. Importa `postgres` y carga el `.env` con `process.loadEnvFile` (nativo desde Node.js 20.12, sin instalar `dotenv`). `new URL('../.env', import.meta.url)` lo busca junto al archivo, sin importar desde qué carpeta ejecutes `node`.
2. Valida que exista `DATABASE_URL` y falla de inmediato con un mensaje claro si falta.
3. Crea el cliente con `postgres(connectionString, { prepare: false })`: el pooler en modo transacción no admite *prepared statements*.
4. Exporta la conexión con `export default sql`. Node.js ejecuta el módulo una sola vez, así que todos comparten la misma conexión (el Singleton de la clase 6).

`sql` es una función etiqueta: `sql\`select * from mydb."EMPLEADO" where nombre = ${nombre}\`` envía `${nombre}` como parámetro (`$1`) y no como texto pegado, lo que evita la inyección SQL.

# paso5 · `parametrizacion/script_homologado.sql`: las tablas
Es la adaptación a PostgreSQL de un script de MySQL Workbench. Se ejecuta una sola vez en el **SQL Editor** de Supabase y crea el esquema `mydb` y tres tablas:
1. `EMPLEADO`: `id`, `nombre`, `apellido`, `fecha_nacimiento`.
2. `EVALUACION`: apunta a `EMPLEADO` con una llave foránea. PostgreSQL no crea el índice de las llaves foráneas por sí solo, así que se crea a mano (`fk_EVALUACION_EMPLEADO_idx`).
3. `USUARIO`: `nombre_usuario` y `clave`. Es solo para practicar: en un proyecto real nunca se guardan contraseñas en texto plano, se guarda un hash.

Con comillas dobles PostgreSQL respeta las mayúsculas, así que las consultas deben escribir `"EMPLEADO"` igual.

# paso6 · `src/probar.js`: probar Supabase
1. **Versión mínima:** `select now(), version()` dentro de un `try / catch / finally`. `sql.end()` en el `finally` es obligatorio: sin él las conexiones siguen abiertas y el programa no termina.
2. **`listarTablas()`:** consulta `information_schema` para contar las columnas de cada tabla del script. `sql(TABLAS_DEL_SCRIPT)` expande el arreglo en un `in (...)` y `::int` convierte el conteo a número.
3. Muestra el resultado con `console.table` y avisa de las tablas que faltan por crear.
```bash
npm run probar
```
Deben aparecer `EMPLEADO` (4 columnas), `EVALUACION` (4) y `USUARIO` (3).

# paso7 · MongoDB Atlas: preparar el cluster
1. Crea un cluster gratuito (**M0**) en [cloud.mongodb.com](https://cloud.mongodb.com).
2. En **Database Access** crea un usuario y una contraseña (no son los de tu cuenta de Atlas).
3. En **Network Access** agrega tu dirección IP. Sin esto, Atlas rechaza la conexión. `0.0.0.0/0` abre el cluster a todo internet: úsalo solo en clase.
4. En **Connect → Drivers → Node.js** copia el host de tu cluster (`cluster0.xxxxx.mongodb.net`).

La URI es `mongodb+srv://usuario:contraseña@host/`. El `+srv` hace que el driver averigüe los servidores del cluster por DNS y la conexión usa TLS.

# paso8 · `src/probarMongo.js`: probar MongoDB Atlas
1. Importa `MongoClient` y `ServerApiVersion`, carga el `.env` igual que en `db.js` y valida `MONGO_DB_USERNAME` y `MONGO_DB_PASSWORD`.
2. Arma la URI con `encodeURIComponent` para que los símbolos de la contraseña no rompan la URL. Cambia el host por el de tu cluster.
3. Crea el `MongoClient` con la **Stable API** (`version: ServerApiVersion.v1, strict: true, deprecationErrors: true`) y `serverSelectionTimeoutMS: 10000`, para que un fallo de red avise a los 10 segundos y no a los 30 por defecto.
4. `client.connect()`, un `ping` en la base `admin` y `listDatabases()`. El `finally` cierra la conexión con `client.close()`.
```bash
npm run probar:mongo
```

# paso9 · Si algo falla
| Mensaje | Causa probable |
|---------|----------------|
| `Falta DATABASE_URL` | No existe el `.env` o la variable no está escrita. |
| `password authentication failed` | Contraseña incorrecta o con símbolos sin codificar. |
| `Tenant or user not found` | El usuario del pooler no trae bien el identificador del proyecto. |
| `getaddrinfo ENOTFOUND` | Servidor mal escrito, sin internet, o conexión directa desde una red sin IPv6. |
| `Faltan por crear: ...` | La conexión funciona, pero falta ejecutar el script SQL. |
| `bad auth: Authentication failed` | Usuario o contraseña de **Database Access** incorrectos. |
| `Server selection timed out` | Tu IP no está en **Network Access**, o no hay internet. |
| `querySrv ENOTFOUND` | El nombre del cluster está mal escrito o falla el DNS. |

# retos
- **Postgres:** cuenta las filas de `"EMPLEADO"` desde `probar.js`.
- **Postgres:** inserta un empleado con `insert` usando `${}` para los valores y léelo con `select`.
- **MongoDB:** crea `src/mongoPrueba.js` que inserte un documento en una colección `pruebas` y lo lea con `find()`.
- **Refactor:** mueve la creación del `MongoClient` a `src/mongoDb.js` y exporta el cliente, como `db.js`.
- **Errores:** cambia una letra de cada contraseña y compara los mensajes.
- **Seguridad:** comprueba con `git status` que tu `.env` no aparece.
