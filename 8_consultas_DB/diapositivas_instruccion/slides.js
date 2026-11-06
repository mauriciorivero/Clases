/*
  Contenido de las diapositivas de la clase 8: consultas a bases de datos.
  Cada diapositiva puede tener:
    type: 'title'                    -> portada
    kicker / title / lead / bullets  -> texto (admite `codigo` y **negrita**)
    motif                            -> animacion de fondo en Three.js (ver app.js)
    accent                           -> color de acento
    diagram                          -> flujo de cajas numeradas: [{ label, sub }]
    cards (+ cardsWide)              -> cuadricula de tarjetas: [{ label, sub, on }]
    code                             -> { file, lang, start, text, marks, hints }
        lang:  js | json | term | env | sql
        marks: { numeroDeLinea: 'add' | 'del' }
        hints: { numeroDeLinea: 'pista que dice el avatar al hacer clic en esa linea' }
    hints                            -> pistas del avatar para esta diapositiva
  Los fragmentos de codigo salen de los archivos de la clase (src/ y package.json) y
  "start" es el numero de linea del archivo donde empieza el fragmento. Si cambias un
  archivo, actualiza aqui el texto, "start" y las claves de "hints" (numero de linea
  DENTRO del fragmento). Los bloques cuyo "file" no es una ruta real (terminal, ejemplo.js,
  "movimientos (documento)") no estan respaldados por un archivo. Las salidas de la
  terminal son capturas reales de los scripts (la hora y la version de PostgreSQL varian).
*/
window.SLIDES = [
  {
    type: 'title',
    kicker: 'Clase 8 · Node.js',
    title: 'Consulta tus bases de datos con Node.js',
    lead: 'Separa la conexión de la prueba, arma las cadenas de conexión desde un `.env` por partes y **consulta** empleados en **Supabase** y movimientos en **MongoDB Atlas**, validando cada dato y manejando cada error.',
    motif: 'cloud',
    accent: '#a3e635',
    hints: [
      '¡Hola de nuevo! Soy **Dato**. Haz clic en mí cuando quieras una pista sobre el código.',
      'Usa las flechas ← → del teclado para moverte, `T` para cambiar de tema y `H` para pedirme una pista.',
      'Las líneas de código con un punto tienen pista. Haz clic en ellas.'
    ]
  },
  {
    kicker: 'Concepto',
    title: 'De conectar a consultar',
    lead: 'En la clase 7 comprobaste que tu programa **puede hablar** con las bases de datos. Hoy le haces preguntas y compruebas que las respuestas son correctas.',
    bullets: [
      'Conectar es abrir la puerta; consultar es pedir datos a través de ella.',
      'Cada paso vive en su propio archivo, así se entiende y se reutiliza.',
      'Entre tu código y la base de datos siempre puede fallar algo: por eso validamos y capturamos errores.'
    ],
    diagram: [
      {
        label: 'Conectar',
        sub: '`db.js` y `db_mongo.js` arman la cadena de conexión con los datos del `.env`.'
      },
      {
        label: 'Validar lo que entra',
        sub: '`validaciones.js` revisa los parámetros antes de tocar la base de datos.'
      },
      {
        label: 'Consultar',
        sub: '`consultarEmpleados.js` usa SQL; `consultarMovimientos.js` usa `find()`.'
      },
      {
        label: 'Validar lo que sale',
        sub: 'Cada fila o documento debe tener los campos y tipos esperados.'
      },
      {
        label: 'Mostrar y cerrar',
        sub: '`consultar.js` imprime la tabla y cierra las conexiones.'
      }
    ],
    motif: 'pipeline',
    accent: '#7928ca',
    hints: [
      'Piensa en un restaurante: conectar es entrar, consultar es pedir, y validar es revisar que te trajeron lo que pediste.',
      'Si algo falla, el mensaje debe decirte **qué** falló y **qué** revisar.'
    ]
  },
  {
    kicker: 'Panorama',
    title: 'Los archivos de la clase',
    lead: 'Nueve archivos de código, un script de SQL y un `.env`. Cada archivo tiene **una sola tarea**.',
    bullets: [
      'Vienen de la clase 7: `db.js`, `probar.js`, `probarMongo.js` y el script de SQL.',
      'Son nuevos: `db_mongo.js`, `validaciones.js`, los dos `consultar...`, `consultar.js` y `cargarDatosEjemplo.js`.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `8_consultas_DB/
├── .env
├── .env.example
├── package.json
├── parametrizacion/
│   └── script_homologado.sql
└── src/
    ├── db.js
    ├── db_mongo.js
    ├── probar.js
    ├── probarMongo.js
    ├── validaciones.js
    ├── consultarEmpleados.js
    ├── consultarMovimientos.js
    ├── consultar.js
    └── cargarDatosEjemplo.js`,
      hints: {
        2: '`.env` guarda tus datos de conexión reales, uno por variable. Nunca se sube a git.',
        3: 'La plantilla sin secretos: dice qué variables hay que llenar.',
        6: 'El mismo script de la clase 7: crea el esquema `mydb` y sus tres tablas.',
        8: 'Conexión a Supabase. Ahora arma la cadena desde variables separadas.',
        9: 'Conexión a MongoDB Atlas, separada de la prueba. Nuevo.',
        11: 'Ahora solo prueba la conexión; ya no la crea.',
        12: 'Funciones que comprueban que un dato tenga la forma correcta. Las usan las dos consultas.',
        13: 'Consulta SQL a Supabase: todos los empleados.',
        14: 'Consulta a la colección `movimientos` de MongoDB Atlas.',
        15: 'Ejecuta las consultas y las muestra como tabla en la terminal.',
        16: 'Inserta datos de ejemplo para tener algo que consultar.'
      }
    },
    motif: 'grid',
    accent: '#50e3c2',
    hints: [
      'Esta separación se llama **responsabilidad única**: si algo falla, sabes en qué archivo buscar.',
      'Haz clic en las líneas con punto para ver qué hace cada archivo.'
    ]
  },
  {
    kicker: 'Preparación',
    title: 'Prepara el proyecto',
    lead: 'Igual que en la clase 7: una carpeta, un `package.json` y dos paquetes de npm. Si ya hiciste esa clase, copia su carpeta y renómbrala.',
    bullets: [
      'Necesitas Node.js 20.12 o superior.',
      'Debes tener tus cuentas de **Supabase** y **MongoDB Atlas** de la clase 7, con tu IP permitida en Atlas.',
      'Las tablas salen de `script_homologado.sql`, que se ejecuta una sola vez en el SQL Editor de Supabase.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `$ mkdir 8_consultas_DB && cd 8_consultas_DB
$ npm init -y
$ npm pkg set type=module
$ npm pkg set engines.node=">=20.12"
$ npm install postgres mongodb
$ mkdir src parametrizacion`,
      hints: {
        3: 'Así Node.js trata los `.js` como ES Modules y puedes usar `import`.',
        5: 'Instala los dos paquetes de una vez; npm los anota en `dependencies`.',
        6: '`src/` guarda el código y `parametrizacion/` el script de SQL.'
      }
    },
    motif: 'grid',
    accent: '#50e3c2',
    hints: [
      'Si hiciste la clase 7, solo copia la carpeta, cámbiale el nombre y actualiza el campo `name` del `package.json`.',
      'Los scripts del siguiente paso evitan memorizar rutas: solo recuerdas `npm run consultar`.'
    ]
  },
  {
    kicker: 'Preparación',
    title: 'El package.json resultante',
    lead: 'Además de `probar` y `probar:mongo`, agregamos cuatro scripts nuevos para las consultas.',
    bullets: [
      '`npm run consultar` muestra empleados y movimientos; los otros dos muestran solo uno.',
      '`npm run cargar:datos` inserta los datos de ejemplo.',
      '`"main"` sigue apuntando a `src/db.js`, el archivo central del proyecto.'
    ],
    code: {
      file: 'package.json',
      lang: 'json',
      start: 1,
      text: `{
  "name": "8_consultas_db",
  "version": "1.0.0",
  "description": "",
  "main": "src/db.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1",
    "probar": "node src/probar.js",
    "probar:mongo": "node src/probarMongo.js",
    "consultar": "node src/consultar.js",
    "consultar:empleados": "node src/consultar.js empleados",
    "consultar:movimientos": "node src/consultar.js movimientos",
    "cargar:datos": "node src/cargarDatosEjemplo.js"
  },
  "keywords": [],
  "type": "module",
  "engines": {
    "node": ">=20.12"
  },
  "dependencies": {
    "mongodb": "^7.8.0",
    "postgres": "^4.0.0"
  }
}`,
      hints: {
        5: 'El archivo principal del proyecto: la conexión a Supabase.',
        8: 'Atajo para `node src/probar.js`.',
        9: 'Atajo para `node src/probarMongo.js`. Los dos puntos son parte del nombre.',
        10: 'Atajo para `node src/consultar.js`: sin argumentos consulta las dos bases.',
        11: 'Le pasa el argumento `empleados`: solo consulta Supabase.',
        13: 'Ejecuta el script que inserta empleados y movimientos de ejemplo.',
        16: 'ES Modules: `import` y `export`.'
      }
    },
    motif: 'rows',
    accent: '#0070f3',
    hints: [
      'Si quieres pasar argumentos con npm, usa dos guiones: `npm run consultar -- movimientos 3`.',
      'El campo `name` cambió a `8_consultas_db`; las versiones de `dependencies` pueden ser más nuevas en tu equipo.'
    ]
  },
  {
    kicker: 'Configuración',
    title: 'Un dato por variable',
    lead: 'En la clase 7 la contraseña de Supabase viajaba dentro de una URL larga. Ahora cada dato tiene su propia variable y el código arma la cadena.',
    cards: [
      {
        label: 'Antes: una sola `DATABASE_URL`',
        sub: 'Usuario, contraseña, servidor, puerto y base mezclados en una línea. Difícil de leer y de corregir.'
      },
      {
        label: 'Ahora: una variable por dato',
        sub: '`SUPABASE_DB_HOST`, `SUPABASE_DB_PORT`, `SUPABASE_DB_NAME`, `SUPABASE_DB_USERNAME` y `SUPABASE_DB_PASSWORD`.',
        on: true
      },
      {
        label: 'MongoDB igual',
        sub: '`MONGO_DB_HOST`, `MONGO_DB_USERNAME`, `MONGO_DB_PASSWORD` y `MONGO_DB_NAME`. El cluster y la base ya no están escritos en el código.',
        on: true
      },
      {
        label: 'El código arma la cadena',
        sub: '`db.js` y `db_mongo.js` leen las variables, las validan y las unen en la URL, codificando los símbolos.',
        on: true
      }
    ],
    cardsWide: true,
    motif: 'scatter',
    accent: '#f5a623',
    hints: [
      'Con una variable por dato, cambiar solo el puerto o solo la contraseña es cambiar una línea.',
      'El `.env` sigue fuera de git: lo único que se comparte es `.env.example`.'
    ]
  },
  {
    kicker: 'Configuración',
    title: 'El archivo .env.example',
    lead: 'La plantilla con las nueve variables de la clase. Cópiala a `.env` y escribe tus datos reales.',
    bullets: [
      'Escribe cada valor **tal cual**, sin codificar: el código codifica los símbolos por ti.',
      'Si un valor tiene espacios o un `#`, enciérralo entre comillas simples.',
      'En la clase 7 el host de Atlas estaba escrito en el código; ahora está en `MONGO_DB_HOST`.'
    ],
    code: {
      file: '.env.example',
      lang: 'env',
      start: 1,
      text: `# Copio este archivo a .env y cambio los valores entre corchetes.
# Cada valor lo escribo tal cual, SIN codificarlo: db.js y db_mongo.js se
# encargan de codificar los símbolos (@, #, %, ...) al armar la conexión.
# Si un valor lleva espacios o un #, lo pongo entre comillas simples:
#   SUPABASE_DB_PASSWORD='mi clave#1'

# Supabase (PostgreSQL) · Transaction pooler (puerto 6543)
SUPABASE_DB_HOST=aws-0-us-east-1.pooler.supabase.com
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USERNAME=postgres.[TU-REF-DE-PROYECTO]
SUPABASE_DB_PASSWORD=[YOUR-PASSWORD]

# MongoDB Atlas
MONGO_DB_HOST=cluster0.xxxxx.mongodb.net
MONGO_DB_USERNAME=tu_usuario
MONGO_DB_PASSWORD=tu_contraseña
MONGO_DB_NAME=Auditoria_HHRR`,
      hints: {
        2: 'Antes había que escribir `@` como `%40`. Ahora se escribe normal y `encodeURIComponent` lo codifica.',
        9: '`6543` es el puerto del Transaction pooler (clase 7).',
        11: 'En el pooler el usuario lleva el identificador de tu proyecto: `postgres.<ref>`.',
        12: 'La contraseña de la **base de datos**, no la de tu cuenta de Supabase.',
        15: 'El nombre de tu cluster, que copiaste en **Connect → Drivers**. Sin `mongodb+srv://`.',
        18: 'La base de datos donde está la colección `movimientos`.'
      }
    },
    motif: 'rows',
    accent: '#f5a623',
    hints: [
      'En tu `.env` real, `[YOUR-PASSWORD]` y `[TU-REF-DE-PROYECTO]` se reemplazan por tus datos, incluyendo los corchetes.',
      'Si cambias algo en el `.env`, vuelve a ejecutar el programa: se lee al arrancar.'
    ]
  },
  {
    kicker: 'Supabase · Cadena de conexión',
    title: 'De cinco variables a una URL',
    lead: 'Cada variable ocupa un lugar fijo en la cadena `postgresql://usuario:clave@host:puerto/base`. Saber leerla te ayuda a encontrar errores.',
    cards: [
      {
        label: 'postgresql://',
        sub: 'El protocolo, fijo: dice que es una base PostgreSQL.',
        on: true
      },
      {
        label: 'usuario ← SUPABASE_DB_USERNAME',
        sub: 'En el pooler es `postgres.<ref-del-proyecto>`.',
        on: true
      },
      {
        label: 'clave ← SUPABASE_DB_PASSWORD',
        sub: 'Se codifica: `p@ss#1` se convierte en `p%40ss%231`.',
        on: true
      },
      {
        label: 'host ← SUPABASE_DB_HOST',
        sub: 'El servidor del pooler, sin `postgresql://`.',
        on: true
      },
      {
        label: 'puerto ← SUPABASE_DB_PORT',
        sub: '`6543`: el pooler en modo transacción.',
        on: true
      },
      {
        label: 'base ← SUPABASE_DB_NAME',
        sub: 'Normalmente `postgres`.',
        on: true
      }
    ],
    cardsWide: true,
    motif: 'grid',
    accent: '#3fcf8e',
    hints: [
      'Si la contraseña tiene `@`, la URL no sabría dónde termina la clave: por eso se codifica.',
      'Para MongoDB la idea es la misma, con `mongodb+srv://usuario:clave@host/`.'
    ]
  },
  {
    kicker: 'Supabase · db.js',
    title: 'db.js: cargar el .env',
    lead: 'Igual que en la clase 7, pero con una mejora: solo se ignora el error de «el archivo no existe».',
    bullets: [
      '`process.loadEnvFile` carga el `.env` sin instalar `dotenv`.',
      'Un `.env` ausente es normal en un servidor: allí las variables vienen del sistema.',
      'Pero un `.env` dañado o sin permisos **sí** debe avisar, por eso se vuelve a lanzar el error.'
    ],
    code: {
      file: 'src/db.js',
      lang: 'js',
      start: 1,
      text: `// Aquí armo la conexión a Supabase (PostgreSQL) con el paquete \`postgres\`.
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
}`,
      marks: { 12: 'add' },
      hints: {
        4: '`postgres` es una función: al llamarla con la cadena de conexión crea el cliente.',
        8: 'Busca el `.env` junto a este archivo, sin importar desde qué carpeta ejecutes `node`.',
        9: 'Antes era `catch {` y se ignoraba cualquier fallo. Ahora recibimos el error para revisarlo.',
        12: '`ENOENT` significa «no existe el archivo». Cualquier otro error se vuelve a lanzar con `throw`.'
      }
    },
    motif: 'stream',
    accent: '#3fcf8e',
    hints: [
      'La línea en verde es lo nuevo respecto a la clase 7.',
      'Regla de oro: un error que no esperabas no se esconde; se deja pasar para que alguien lo vea.'
    ]
  },
  {
    kicker: 'Supabase · db.js',
    title: 'db.js: leer las variables',
    lead: '`leerVariable` es una función pequeña que se repite para cada dato: lee, comprueba que no esté vacío y devuelve el valor.',
    bullets: [
      'Falla de inmediato con un mensaje que dice **cuál** variable falta.',
      '`valor.trim() === \'\'` también detecta variables que solo tienen espacios.',
      'La contraseña no se recorta: se usa exactamente como se escribió.'
    ],
    code: {
      file: 'src/db.js',
      lang: 'js',
      start: 15,
      text: `// Leo una variable del entorno y paro de una si falta o está vacía
function leerVariable(nombre) {
  const valor = process.env[nombre]
  if (valor === undefined || valor.trim() === '') {
    throw new Error(\`Falta \${nombre}. Copia .env.example a .env.\`)
  }
  // Le quito los espacios sobrantes, menos a la contraseña:
  // esa la dejo exactamente como me la escribieron
  return nombre.endsWith('PASSWORD') ? valor : valor.trim()
}

const host = leerVariable('SUPABASE_DB_HOST')
const puerto = Number(leerVariable('SUPABASE_DB_PORT'))
const baseDeDatos = leerVariable('SUPABASE_DB_NAME')
const usuario = leerVariable('SUPABASE_DB_USERNAME')
const clave = leerVariable('SUPABASE_DB_PASSWORD')`,
      hints: {
        2: 'Recibe el **nombre** de la variable, por ejemplo `\'SUPABASE_DB_HOST\'`.',
        3: 'Los valores del `.env` quedan en `process.env`. Si no existe, es `undefined`.',
        4: 'Dos casos: la variable no existe (`undefined`) o está vacía.',
        5: 'El mensaje incluye el nombre de la variable: así sabes qué corregir en tu `.env`.',
        9: 'Si el nombre termina en `PASSWORD`, el valor se usa tal cual; si no, se quitan los espacios sobrantes.',
        13: '`Number(...)` convierte el texto `\'6543\'` en el número `6543`.'
      }
    },
    motif: 'rows',
    accent: '#3fcf8e',
    hints: [
      'Las variables de entorno siempre son **texto**; por eso el puerto hay que convertirlo a número.',
      'Esta función evita repetir cinco veces el mismo `if`.'
    ]
  },
  {
    kicker: 'Supabase · db.js',
    title: 'db.js: validar host y puerto',
    lead: 'Leer no basta: hay que comprobar que el valor **tenga sentido** antes de usarlo.',
    bullets: [
      'La expresión regular acepta solo letras, números, puntos y guiones. Si alguien pega la URL completa en el host, se detecta.',
      '`Number.isInteger` descarta textos y decimales; un puerto válido va de 1 a 65535.',
      'Cada error nombra la variable para que sepas qué corregir en tu `.env`.'
    ],
    code: {
      file: 'src/db.js',
      lang: 'js',
      start: 32,
      text: `// Reviso que el host sea solo el nombre del servidor: sin "://" ni "/"
if (!/^[A-Za-z0-9.-]+$/.test(host)) {
  throw new Error('SUPABASE_DB_HOST debe ser solo el nombre del servidor')
}
// Reviso que el puerto sea un entero de 1 a 65535 (el pooler usa 6543)
if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
  throw new Error('SUPABASE_DB_PORT debe ser un número entre 1 y 65535')
}`,
      hints: {
        2: '`^` y `$` obligan a que **todo** el texto cumpla el patrón: no hay `:` ni `/`.',
        3: 'Mensaje claro: dice qué variable y qué se esperaba.',
        6: '`Number(\'abc\')` da `NaN`, y `Number.isInteger(NaN)` es `false`. Los puertos de red van del 1 al 65535.'
      }
    },
    motif: 'burst',
    accent: '#ff0080',
    hints: [
      'Prueba: pon `SUPABASE_DB_PORT=abc` en tu `.env` y ejecuta `npm run probar` para ver el mensaje.',
      'Validar temprano ahorra tiempo: el error aparece al instante, no después de esperar la red.'
    ]
  },
  {
    kicker: 'Supabase · db.js',
    title: 'db.js: armar la cadena y crear el cliente',
    lead: 'Con las cinco variables validadas, se une todo en la cadena de conexión y se crea el cliente.',
    bullets: [
      '`encodeURIComponent` protege los símbolos del usuario y la contraseña.',
      '`prepare: false` es obligatorio con el pooler en modo transacción (clase 7).',
      '`connect_timeout: 10` hace que un fallo de red avise a los 10 segundos y no a los 30.',
      '`export default sql`: el módulo se ejecuta una sola vez y todos comparten la misma conexión (Singleton).'
    ],
    code: {
      file: 'src/db.js',
      lang: 'js',
      start: 41,
      text: `// Armo la cadena: postgresql://usuario:clave@host:puerto/base
// Con encodeURIComponent protejo los símbolos (@, #, %) de usuario y clave
const connectionString =
  \`postgresql://\${encodeURIComponent(usuario)}:\` +
  \`\${encodeURIComponent(clave)}@\${host}:\${puerto}/\` +
  encodeURIComponent(baseDeDatos)

// El pooler de Supabase (puerto 6543) no admite prepared statements,
// así que los apago. Con connect_timeout el fallo me llega a los 10 s.
const sql = postgres(connectionString, {
  prepare: false,
  connect_timeout: 10,
})

export default sql`,
      marks: { 12: 'add' },
      hints: {
        3: 'Una cadena se puede partir en varias líneas con `+` para que se lea mejor.',
        4: 'Convierte símbolos como `@` o `#` en `%40` o `%23`.',
        5: 'La contraseña también se codifica. Así el `.env` guarda la clave **sin** codificar.',
        11: 'El pooler de Supabase no admite *prepared statements*.',
        12: 'Segundos de espera para conectar. Por defecto serían 30.',
        15: 'Todos los archivos que importen `db.js` reciben **la misma** conexión.'
      }
    },
    motif: 'pipeline',
    accent: '#3fcf8e',
    hints: [
      'Un `console.log` de `connectionString` mostraría tu contraseña: nunca lo hagas.',
      'La línea en verde es nueva respecto a la clase 7.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · Refactor',
    title: 'Separar la conexión de la prueba',
    lead: 'En la clase 7, `probarMongo.js` hacía todo: armaba la URI, creaba el cliente y probaba. Igual que con Supabase, ahora cada tarea tiene su archivo.',
    cards: [
      {
        label: 'Antes: `probarMongo.js` hacía todo',
        sub: 'Leía el `.env`, armaba la URI, creaba el `MongoClient`, conectaba y probaba. Nadie más podía reutilizar esa conexión.'
      },
      {
        label: 'Ahora: `db_mongo.js` conecta',
        sub: 'Lee las variables, las valida, arma la URI y exporta `conectarMongo()` y `cerrarMongo()`.',
        on: true
      },
      {
        label: 'Ahora: `probarMongo.js` prueba',
        sub: 'Importa esas dos funciones y solo hace un `ping` y lista las bases de datos.',
        on: true
      },
      {
        label: 'Y se reutiliza',
        sub: '`consultarMovimientos.js` y `cargarDatosEjemplo.js` usan la misma conexión sin repetir nada.',
        on: true
      }
    ],
    cardsWide: true,
    motif: 'ring',
    accent: '#13aa52',
    hints: [
      'Es el reto de refactor de la clase 7: mover la creación del `MongoClient` a su propio módulo, como `db.js`.',
      'Compara: `db.js` ↔ `db_mongo.js` y `probar.js` ↔ `probarMongo.js`.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · db_mongo.js',
    title: 'db_mongo.js: leer las variables',
    lead: 'Empieza igual que `db.js`: carga el `.env` y lee cada dato con `leerVariable`.',
    bullets: [
      'La carga del `.env` (con el `ENOENT`) es idéntica a la de `db.js`; aquí mostramos desde `leerVariable`.',
      'Cuatro variables: cluster, usuario, contraseña y nombre de la base.',
      'La base `Auditoria_HHRR` ya no está escondida en el código: viene de `MONGO_DB_NAME`.'
    ],
    code: {
      file: 'src/db_mongo.js',
      lang: 'js',
      start: 15,
      text: `// Leo una variable del entorno y paro de una si falta o está vacía
function leerVariable(nombre) {
  const valor = process.env[nombre]
  if (valor === undefined || valor.trim() === '') {
    throw new Error(\`Falta \${nombre}. Copia .env.example a .env.\`)
  }
  // Le quito los espacios sobrantes, menos a la contraseña:
  // esa la dejo exactamente como me la escribieron
  return nombre.endsWith('PASSWORD') ? valor : valor.trim()
}

const host = leerVariable('MONGO_DB_HOST')
const usuario = leerVariable('MONGO_DB_USERNAME')
const clave = leerVariable('MONGO_DB_PASSWORD')
const nombreBD = leerVariable('MONGO_DB_NAME')`,
      hints: {
        2: 'La misma función que en `db.js`: lee, comprueba y devuelve.',
        12: 'El nombre del cluster, p. ej. `cluster0.xxxxx.mongodb.net`.',
        14: 'La contraseña del usuario de **Database Access**, no la de tu cuenta de Atlas.',
        15: 'La base de datos donde vive la colección `movimientos`.'
      }
    },
    motif: 'stream',
    accent: '#13aa52',
    hints: [
      'Repetir `leerVariable` en dos archivos es intencional: cada archivo se entiende solo.',
      'En un proyecto grande moverías esa función a un módulo compartido.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · db_mongo.js',
    title: 'db_mongo.js: validar y armar la URI',
    lead: 'Antes de usar el host y el nombre de la base se comprueba que tengan la forma correcta.',
    bullets: [
      'El nombre de una base en MongoDB no admite espacios ni símbolos como `/`, `.` o `$`.',
      '`mongodb+srv://` hace que el driver averigüe los servidores del cluster por DNS.',
      'La URI termina en `/`: la base se elige después, con `client.db(nombreBD)`.'
    ],
    code: {
      file: 'src/db_mongo.js',
      lang: 'js',
      start: 31,
      text: `// Reviso que el host sea solo el nombre del cluster: sin "://" ni "/"
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
  \`mongodb+srv://\${encodeURIComponent(usuario)}:\` +
  \`\${encodeURIComponent(clave)}@\${host}/\``,
      hints: {
        2: 'Letras, números, puntos y guiones. Si pegan `https://...` en el host, falla aquí.',
        3: 'El mensaje dice qué variable está mal.',
        6: 'Entre 1 y 63 caracteres: letras, números, `_` y `-`.',
        7: 'Así `Auditoria_HHRR` es válido pero `mi base` no.',
        12: 'Misma idea que `connectionString`: se une todo y se codifica el usuario y la contraseña.',
        13: 'Protege los símbolos del usuario.',
        14: 'Protege los símbolos de la contraseña.'
      }
    },
    motif: 'burst',
    accent: '#ff0080',
    hints: [
      'La URI completa tiene la forma `mongodb+srv://usuario:clave@cluster/`.',
      'Si el nombre del cluster está mal, el error será `querySrv ENOTFOUND`.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · db_mongo.js',
    title: 'db_mongo.js: crear el MongoClient',
    lead: 'El cliente se crea con la URI y tres opciones que lo hacen más predecible.',
    bullets: [
      'La **Stable API** fija el comportamiento del servidor a la versión 1: tu código no se rompe si Atlas se actualiza.',
      '`strict: true` rechaza comandos que no estén en esa versión; `deprecationErrors: true` avisa de lo que va a desaparecer.',
      '`serverSelectionTimeoutMS: 10000` hace que el error llegue a los 10 segundos y no a los 30.',
      '`new MongoClient(uri)` todavía **no** conecta: solo prepara el cliente.'
    ],
    code: {
      file: 'src/db_mongo.js',
      lang: 'js',
      start: 46,
      text: `// Stable API: dejo fijo el comportamiento del servidor en la versión 1.
// Con serverSelectionTimeoutMS el fallo me llega a los 10 s y no a los 30 s.
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 10000,
})`,
      hints: {
        3: 'Crea el cliente, pero aún no abre ninguna conexión.',
        5: 'La versión 1 de la Stable API.',
        6: 'Si usas un comando que no está en la API v1, el servidor lo rechaza.',
        7: 'Convierte las advertencias de «esto desaparecerá» en errores.',
        9: 'Milisegundos de espera para encontrar un servidor del cluster.'
      }
    },
    motif: 'ring',
    accent: '#13aa52',
    hints: [
      'Si tu IP no está en **Network Access**, este tiempo de espera es el que se agota.',
      'La Stable API es una recomendación de MongoDB para aplicaciones en producción.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · db_mongo.js',
    title: 'db_mongo.js: conectar y cerrar',
    lead: 'Dos funciones exportadas: una conecta (solo la primera vez) y la otra cierra.',
    bullets: [
      '`conectarMongo()` guarda la base ya conectada; las siguientes llamadas la reutilizan.',
      'Si la conexión falla, el error **sube** hasta quien llamó: cada archivo decide cómo mostrarlo.',
      '`cerrarMongo()` va en un `finally`: sin cerrar, el programa se queda esperando y no termina.'
    ],
    code: {
      file: 'src/db_mongo.js',
      lang: 'js',
      start: 57,
      text: `// Aquí guardo la base ya conectada para no reconectar en cada llamada
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

// Cierro la conexión. La llamo siempre al terminar (en un \`finally\`);
// si no, el programa se queda esperando y nunca termina.
export async function cerrarMongo() {
  baseDeDatos = null
  await client.close()
}`,
      hints: {
        2: 'Una variable del módulo que recuerda la base. `null` significa «aún no conectado».',
        6: '`export` permite que otros archivos la importen. Es `async` porque conectar toma tiempo.',
        7: 'Solo conecta si todavía no hay una conexión.',
        8: 'Abre la conexión con el cluster. Si falla, lanza un error.',
        9: 'Elige la base de datos de `MONGO_DB_NAME`.',
        11: 'Devuelve la base lista para pedirle colecciones.',
        16: 'Hay que llamarla al terminar.',
        18: 'Cierra la conexión y libera el programa.'
      }
    },
    motif: 'pipeline',
    accent: '#13aa52',
    hints: [
      'Este patrón (guardar el resultado y reutilizarlo) se llama *caché*.',
      '¿Qué pasaría si dos archivos llaman `conectarMongo()` casi a la vez? El driver evita abrir dos conexiones.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · probarMongo.js',
    title: 'probarMongo.js: solo la prueba',
    lead: 'Con la conexión aparte, la prueba queda corta: importa las dos funciones y comprueba que el cluster responde.',
    bullets: [
      '`ping` es el comando más liviano de MongoDB: solo pregunta si el servidor responde.',
      '`db.admin().listDatabases()` lista las bases del cluster, si tu usuario tiene permiso.',
      'El `finally` cierra la conexión pase lo que pase.'
    ],
    code: {
      file: 'src/probarMongo.js',
      lang: 'js',
      start: 1,
      text: `// Mi prueba de conexión a MongoDB Atlas: npm run probar:mongo
// La conexión la hace db_mongo.js; aquí solo compruebo que funcione.
import { conectarMongo, cerrarMongo } from './db_mongo.js'

try {
  // Abro la conexión y me traigo la base del .env (MONGO_DB_NAME)
  const db = await conectarMongo()

  // \`ping\` es lo más liviano: solo le pregunto si el servidor responde
  await db.command({ ping: 1 })
  console.log(\`Conexión OK a MongoDB Atlas (base "\${db.databaseName}")\`)

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
}`,
      hints: {
        3: 'Importa las dos funciones de `db_mongo.js`. Este archivo ya no sabe nada de URIs.',
        7: 'Abre la conexión y devuelve la base de datos del `.env`.',
        10: 'Pregunta «¿estás ahí?». Si responde, credenciales, IP y red están bien.',
        11: '`databaseName` es el nombre de la base a la que estamos conectados.',
        14: 'Pide a Atlas la lista de bases del cluster.',
        17: 'Si algo falla (credenciales, red, IP), el mensaje llega aquí.',
        22: 'El `finally` se ejecuta siempre, haya éxito o error.'
      }
    },
    motif: 'stream',
    accent: '#13aa52',
    hints: [
      'Compara con `probar.js`: misma estructura `try / catch / finally`, otro driver.',
      'Si `listDatabases` falla por permisos, el `ping` ya demostró que la conexión funciona.'
    ]
  },
  {
    kicker: 'Verificación',
    title: 'Ejecuta las dos pruebas',
    lead: 'Antes de consultar, comprueba que las dos conexiones siguen funcionando con las variables nuevas.',
    bullets: [
      'La hora y la versión de PostgreSQL pueden ser distintas en tu caso.',
      'Ahora MongoDB muestra la base por nombre: `Auditoria_HHRR`, la de `MONGO_DB_NAME`.',
      'Si falla, revisa primero que los nombres del `.env` coincidan con los de `.env.example`.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `$ npm run probar
Conexión OK: 2026-11-06T14:57:25.744Z
PostgreSQL 15.8 on aarch64-unknown-linux-gnu, compiled by gcc (GCC) 13.2.0, 64-bit

Tablas del esquema "mydb":
┌─────────┬──────────────┬──────────┐
│ (index) │ tabla        │ columnas │
├─────────┼──────────────┼──────────┤
│ 0       │ 'EMPLEADO'   │ 4        │
│ 1       │ 'EVALUACION' │ 4        │
│ 2       │ 'USUARIO'    │ 3        │
└─────────┴──────────────┴──────────┘
$ npm run probar:mongo
Conexión OK a MongoDB Atlas (base "Auditoria_HHRR")
Bases de datos: Auditoria_HHRR, sample_mflix, admin, local`,
      hints: {
        2: 'Supabase respondió. La hora es la del servidor.',
        9: '`EMPLEADO` tiene 4 columnas: `id`, `nombre`, `apellido` y `fecha_nacimiento`.',
        14: 'El `ping` respondió y la base del `.env` existe.',
        15: 'Las bases de este cluster. Tu lista será distinta.'
      }
    },
    motif: 'burst',
    accent: '#50e3c2',
    hints: [
      'Si ves estos resultados, ya puedes consultar datos con confianza.',
      'Si algo falla, el mensaje te dice cuál variable revisar.'
    ]
  },
  {
    kicker: 'Consultas',
    title: 'Una consulta, tres pasos',
    lead: 'Las dos funciones de consulta siguen la **misma receta**. Aprende una y entiendes la otra.',
    bullets: [
      'Los datos que vienen de fuera **nunca** son de fiar: ni los que escribe el usuario ni los que devuelve la base.',
      'Una lista vacía **no** es un error: significa que no hay datos todavía.'
    ],
    diagram: [
      {
        label: 'Validar la entrada',
        sub: 'Antes de hablar con la base de datos: ¿el `limite` es un entero entre 1 y 1000?'
      },
      {
        label: 'Ejecutar la consulta',
        sub: 'Dentro de un `try / catch`. Si falla, el error se traduce a una frase que se entienda.'
      },
      {
        label: 'Validar la salida',
        sub: 'Cada fila o documento debe traer los campos y tipos esperados.'
      }
    ],
    motif: 'pipeline',
    accent: '#0070f3',
    hints: [
      'Mira el código de las dos funciones: los tres pasos están numerados en los comentarios.',
      'Por eso `consultarEmpleados` y `consultarMovimientos` se parecen tanto.'
    ]
  },
  {
    kicker: 'Validaciones',
    title: 'validaciones.js: tres preguntas simples',
    lead: 'Funciones pequeñas que responden sí o no. Las usan los dos archivos de consulta.',
    bullets: [
      '`typeof` solo no basta: `null` y `NaN` también tienen tipo.',
      '`Number.isInteger` rechaza `3.5`, `NaN`, `Infinity` y también el texto `\'3\'`.',
      'Una fecha inválida existe como objeto (`Invalid Date`), pero su `getTime()` es `NaN`.'
    ],
    code: {
      file: 'src/validaciones.js',
      lang: 'js',
      start: 1,
      text: `// Aquí dejo las validaciones que comparten consultarEmpleados.js y
// consultarMovimientos.js. Validar es revisar que un dato tenga la forma
// correcta ANTES de usarlo: así el error sale pronto y se entiende.

// Máximo de registros que dejo pedir de una sola vez
export const LIMITE_MAXIMO = 1000

// ¿Es un texto con algo más que espacios en blanco?
export function esTextoNoVacio(valor) {
  return typeof valor === 'string' && valor.trim().length > 0
}

// ¿Es un entero mayor que 0?
// Number.isInteger rechaza 3.5, NaN, Infinity y también el texto '3'.
export function esEnteroPositivo(valor) {
  return Number.isInteger(valor) && valor > 0
}

// ¿Es una fecha de verdad? \`new Date('hola')\` existe, pero es una
// "Invalid Date" y su getTime() da NaN.
export function esFechaValida(valor) {
  return valor instanceof Date && !Number.isNaN(valor.getTime())
}`,
      hints: {
        6: 'Una constante con nombre es mejor que un `1000` suelto: se cambia en un solo lugar.',
        9: '`export` permite usarla desde los otros archivos.',
        10: '`trim()` quita los espacios: un texto de solo espacios cuenta como vacío.',
        15: 'Se usará para validar los `id`.',
        16: 'Entero **y** mayor que cero.',
        21: 'Se usará para validar las fechas que devuelven las bases.',
        22: '`instanceof Date` confirma que es una fecha; `getTime()` detecta las inválidas.'
      }
    },
    motif: 'rows',
    accent: '#0070f3',
    hints: [
      'Una función que responde `true` o `false` y no hace nada más es fácil de probar y de reutilizar.',
      'Los nombres empiezan por `es...`: se leen como una pregunta.'
    ]
  },
  {
    kicker: 'Validaciones',
    title: 'validarOpciones: el tipo (1/2)',
    lead: 'Las funciones de consulta reciben un objeto de opciones, por ejemplo `{ limite: 10 }`. Primero se revisa que sea un objeto de verdad.',
    bullets: [
      'Paso 1: `null` y los arreglos también dan `typeof \'object\'`, hay que descartarlos aparte.',
      'Paso 2: se rechazan las claves desconocidas. Así `{ limit: 5 }` falla en vez de ignorarse en silencio.',
      'Se lanza un `TypeError` cuando el **tipo** es incorrecto.'
    ],
    code: {
      file: 'src/validaciones.js',
      lang: 'js',
      start: 25,
      text: `// Reviso el objeto de opciones de las consultas, por ejemplo { limite: 10 }.
// Devuelvo { limite } ya revisado (undefined = sin límite).
export function validarOpciones(opciones) {
  // 1. Primero compruebo que sea un objeto de verdad (null y los arreglos
  //    también dan typeof 'object')
  const esObjeto =
    typeof opciones === 'object' &&
    opciones !== null &&
    !Array.isArray(opciones)
  if (!esObjeto) {
    throw new TypeError('Las opciones deben ser un objeto: { limite: 10 }')
  }

  // 2. No dejo pasar claves desconocidas: así un error de escritura
  //    (\`limit\` en vez de \`limite\`) no se me escapa en silencio
  const desconocidas = Object.keys(opciones).filter((k) => k !== 'limite')
  if (desconocidas.length > 0) {
    throw new TypeError(
      \`Opciones no reconocidas: \${desconocidas.join(', ')}. Solo "limite"\`
    )
  }`,
      hints: {
        3: 'Recibe lo que escribió quien llama a la consulta.',
        6: 'Tres condiciones: es `object`, no es `null` y no es un arreglo.',
        11: '`TypeError` es el error estándar para «el tipo no es el esperado».',
        16: '`Object.keys` devuelve los nombres de las claves del objeto y `filter` se queda con las que **no** son `limite`.',
        19: 'El mensaje lista las claves que sobran.'
      }
    },
    motif: 'burst',
    accent: '#ff0080',
    hints: [
      'Prueba en la terminal: `node -e "import(\'./src/validaciones.js\').then(m => m.validarOpciones({ limit: 5 }))"`.',
      'Rechazar en silencio es peor que fallar: el error de escritura pasaría desapercibido.'
    ]
  },
  {
    kicker: 'Validaciones',
    title: 'validarOpciones: el rango (2/2)',
    lead: 'Después del tipo se revisa el valor. El límite es opcional, pero si viene debe estar dentro del rango.',
    bullets: [
      '`undefined` significa «sin límite»: se devuelve `{ limite: undefined }`.',
      'Se lanza un `RangeError` cuando el valor está **fuera del rango** permitido.',
      'El texto `\'5\'` se rechaza: quien llama debe convertirlo antes con `Number(...)`.',
      'El mensaje incluye lo que se recibió, para encontrar el error más rápido.'
    ],
    code: {
      file: 'src/validaciones.js',
      lang: 'js',
      start: 47,
      text: `  // 3. El límite es opcional; si llega, debe ser entero de 1 a LIMITE_MAXIMO
  const { limite } = opciones
  if (limite !== undefined) {
    if (!Number.isInteger(limite) || limite < 1 || limite > LIMITE_MAXIMO) {
      throw new RangeError(
        \`"limite" debe ser un entero entre 1 y \${LIMITE_MAXIMO} \` +
          \`(recibí: \${String(limite)})\`
      )
    }
  }

  return { limite }
}`,
      hints: {
        2: 'Saca `limite` del objeto de opciones.',
        3: 'Solo valida si el usuario envió el límite.',
        4: 'Rechaza decimales, `NaN`, `Infinity` y textos; y también lo que esté por debajo de 1 o por encima de `LIMITE_MAXIMO` (1000).',
        5: '`RangeError` es el error estándar para «el valor está fuera de rango».',
        7: '`String(...)` convierte cualquier valor a texto para mostrarlo en el mensaje.',
        12: 'Devuelve el límite ya validado.'
      }
    },
    motif: 'burst',
    accent: '#ff0080',
    hints: [
      '`TypeError` y `RangeError` son errores estándar de JavaScript; usar el correcto ayuda a entender el problema.',
      'El máximo de 1000 evita traer miles de filas por error y saturar la memoria.'
    ]
  },
  {
    kicker: 'Validaciones',
    title: 'Prueba la validación en la terminal',
    lead: 'Ejecuta `consultar` con datos buenos y malos y mira cómo responde cada validación.',
    bullets: [
      '`npm run consultar -- ...`: los dos guiones separan los argumentos de npm de los tuyos.',
      '`abc` se convierte en `NaN` y la validación lo rechaza antes de tocar la base de datos.',
      'Cuando hay un error, el programa termina con código de salida 1.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `$ npm run consultar -- empleados 2
Empleados (Supabase)
┌─────────┬────┬──────────┬────────────┬──────────────┐
│ (index) │ id │ nombre   │ apellido   │ nacimiento   │
├─────────┼────┼──────────┼────────────┼──────────────┤
│ 0       │ 1  │ 'Laura'  │ 'Gómez'    │ '1990-04-15' │
│ 1       │ 2  │ 'Carlos' │ 'Martínez' │ '1985-09-02' │
└─────────┴────┴──────────┴────────────┴──────────────┘
$ npm run consultar -- empleados abc
Error: "limite" debe ser un entero entre 1 y 1000 (recibí: NaN)
$ npm run consultar -- clientes
Error: Fuente "clientes" no válida (usa empleados, movimientos, todo)`,
      hints: {
        1: 'El segundo argumento (`2`) es el límite: trae solo 2 empleados.',
        4: '`console.table` muestra un arreglo de objetos como tabla.',
        9: '`abc` no es un número, así que no llega a la base de datos.',
        10: 'El mensaje dice qué se esperaba y qué se recibió.',
        11: '`clientes` no es una fuente válida: el programa lista las que sí existen.'
      }
    },
    motif: 'scatter',
    accent: '#ff0080',
    hints: [
      'Prueba tú mismo: `npm run consultar -- movimientos 1001` y `npm run consultar -- movimientos 2.5`.',
      'Los mensajes de error son parte de la interfaz de tu programa: escríbelos pensando en quien los lee.'
    ]
  },
  {
    kicker: 'Supabase · consultarEmpleados.js',
    title: 'consultarEmpleados: traducir los errores',
    lead: 'Los errores de la base de datos traen un `code` poco amigable. `describirError` los traduce a frases que dicen **qué revisar**.',
    bullets: [
      'El archivo importa `sql` (la conexión) y las funciones de `validaciones.js`.',
      '`42P01` y `28P01` son códigos de PostgreSQL; `ENOTFOUND` y `ECONNREFUSED` vienen de la red.',
      'Si el código no se conoce, se devuelve el mensaje original: nunca se esconde un error.'
    ],
    code: {
      file: 'src/consultarEmpleados.js',
      lang: 'js',
      start: 11,
      text: `// Convierto el código de un error de PostgreSQL (o de la red) en una frase
// que se entienda y me diga qué revisar.
function describirError(error) {
  switch (error.code) {
    case '42P01': // la tabla no existe
      return 'la tabla mydb."EMPLEADO" no existe ' +
        '(ejecuta parametrizacion/script_homologado.sql)'
    case '28P01': // contraseña incorrecta
      return 'usuario o contraseña incorrectos ' +
        '(revisa SUPABASE_DB_USERNAME y SUPABASE_DB_PASSWORD)'
    case 'CONNECT_TIMEOUT': // el servidor no respondió a tiempo
    case 'ECONNREFUSED': // el servidor rechazó la conexión
      return 'no hubo respuesta del servidor ' +
        '(revisa tu internet, el host y el puerto)'
    case 'ENOTFOUND': // el nombre del servidor no existe
      return 'no se encontró el servidor (revisa SUPABASE_DB_HOST)'
    default:
      return error.message
  }
}`,
      hints: {
        3: 'Recibe el error y devuelve una frase para una persona.',
        4: '`switch` elige un caso según el valor de `error.code`.',
        5: 'La tabla no existe: casi siempre falta ejecutar el script de SQL.',
        8: 'La contraseña (o el usuario) no coincide.',
        11: 'El servidor no respondió a tiempo.',
        15: 'El nombre del servidor no existe: revisa `SUPABASE_DB_HOST`.',
        17: 'Cualquier otro error: se muestra su mensaje original.'
      }
    },
    motif: 'scatter',
    accent: '#ff0080',
    hints: [
      'Los casos `CONNECT_TIMEOUT` y `ECONNREFUSED` comparten la misma respuesta porque se escriben uno debajo del otro.',
      'Para ver el código de un error nuevo, imprime `error.code` en un `console.log`.'
    ]
  },
  {
    kicker: 'Supabase · consultarEmpleados.js',
    title: 'consultarEmpleados: validar cada fila',
    lead: 'La base de datos puede devolver algo inesperado (un `NULL`, otra columna). `validarEmpleado` lo detecta y devuelve un objeto limpio.',
    bullets: [
      'Acumula los campos malos en un arreglo y lanza **un solo** error que los lista todos.',
      '`indice + 1` muestra la fila como la contaría una persona (desde 1).',
      'Devuelve solo los cuatro campos conocidos: no deja pasar columnas extra.'
    ],
    code: {
      file: 'src/consultarEmpleados.js',
      lang: 'js',
      start: 32,
      text: `// Reviso que una fila tenga la forma que espero y devuelvo un objeto limpio.
// Si cambia la tabla (otra columna, un NULL), el error me salta aquí.
function validarEmpleado(fila, indice) {
  const invalidos = []
  if (!esEnteroPositivo(fila.id)) invalidos.push('id')
  if (!esTextoNoVacio(fila.nombre)) invalidos.push('nombre')
  if (!esTextoNoVacio(fila.apellido)) invalidos.push('apellido')
  if (!esFechaValida(fila.fecha_nacimiento)) invalidos.push('fecha_nacimiento')

  if (invalidos.length > 0) {
    throw new Error(
      \`Empleado inválido (fila \${indice + 1}): revisa \${invalidos.join(', ')}\`
    )
  }

  const { id, nombre, apellido, fecha_nacimiento } = fila
  return { id, nombre, apellido, fecha_nacimiento }
}`,
      hints: {
        3: 'Recibe la fila y su posición en la lista.',
        4: 'Aquí se anotan los nombres de los campos incorrectos.',
        5: 'El `id` debe ser un entero mayor que 0.',
        8: 'PostgreSQL entrega la fecha como un `Date` de JavaScript.',
        10: 'Si hay al menos un campo malo, se lanza el error.',
        12: 'Los arreglos empiezan en 0, las personas cuentan desde 1.',
        16: 'Desestructura: saca los cuatro campos del objeto.'
      }
    },
    motif: 'rows',
    accent: '#0070f3',
    hints: [
      'Mira qué pasa si `nombre` fuera `null`: `esTextoNoVacio(null)` da `false`.',
      'Un solo error con todos los campos malos ahorra corregir de uno en uno.'
    ]
  },
  {
    kicker: 'Supabase · consultarEmpleados.js',
    title: 'consultarEmpleados: la consulta',
    lead: 'La función principal sigue los tres pasos: validar la entrada, consultar y validar la salida.',
    bullets: [
      'Cada `${}` dentro de `sql` viaja como **parámetro**, nunca como texto pegado.',
      'Un fragmento vacío no agrega nada al SQL: así `limit` solo aparece cuando hay un límite.',
      'El `catch` traduce el error y guarda el original en `cause`.'
    ],
    code: {
      file: 'src/consultarEmpleados.js',
      lang: 'js',
      start: 51,
      text: `// Devuelvo los empleados ordenados por id.
// Opciones: { limite } = cuántos traigo como máximo (entero de 1 a 1000).
export async function consultarEmpleados(opciones = {}) {
  // 1. Reviso lo que me llega, ANTES de hablar con la base de datos
  const { limite } = validarOpciones(opciones)

  // 2. Hago la consulta. Si falla, el catch lo traduce a un mensaje claro
  //    y guardo el error original en \`cause\` por si lo necesito.
  let filas
  try {
    // \`sql\` es una función etiqueta: cada \${} viaja como parámetro, no
    // pegado al texto, así que no hay inyección SQL. sql\`\` no agrega nada.
    filas = await sql\`
      select id, nombre, apellido, fecha_nacimiento
      from mydb."EMPLEADO"
      order by id
      \${limite === undefined ? sql\`\` : sql\`limit \${limite}\`}
    \`
  } catch (error) {
    throw new Error(
      \`No se pudieron consultar los empleados: \${describirError(error)}\`,
      { cause: error }
    )
  }

  // 3. Reviso lo que devolvió la base (tabla vacía da [], no es un error)
  return filas.map(validarEmpleado)
}`,
      hints: {
        3: '`opciones = {}` es el valor por defecto: se puede llamar sin argumentos.',
        5: 'Paso 1: si algo está mal, lanza un error **antes** de consultar.',
        9: 'Se declara fuera del `try` para poder usarla después.',
        13: 'Paso 2: la consulta SQL. `await` espera la respuesta de Supabase.',
        15: 'Esquema `mydb` y tabla `"EMPLEADO"`: las comillas respetan las mayúsculas.',
        16: 'Siempre ordena para que el resultado sea predecible.',
        17: 'Si hay límite agrega `limit $1`; si no, un fragmento vacío.',
        22: '`cause` conserva el error original por si hace falta más detalle.',
        27: 'Paso 3: valida cada fila. Una tabla vacía devuelve `[]`.'
      }
    },
    motif: 'pipeline',
    accent: '#3fcf8e',
    hints: [
      'Prueba: `npm run consultar:empleados` y luego `npm run consultar -- empleados 2`.',
      'Observa que `filas` no se usa dentro del `try`: se declara fuera para que el `return` la vea.'
    ]
  },
  {
    kicker: 'Seguridad',
    title: 'SQL con parámetros, no con texto pegado',
    lead: 'Si pegas lo que escribe el usuario dentro del SQL, alguien puede colar sus propias instrucciones. Eso se llama **inyección SQL**.',
    bullets: [
      'Con la función `sql`, cada `${}` viaja aparte del texto del SQL.',
      'PostgreSQL lo trata como un **dato**, nunca como instrucciones.',
      'En el mal ejemplo, `unsafe` ejecuta como SQL lo que le pases: no lo uses con datos del usuario.'
    ],
    code: {
      file: 'ejemplo.js',
      lang: 'js',
      text: `const id = '1; drop table mydb."EMPLEADO"'  // texto malicioso

// MAL: el texto se pega dentro del SQL
await sql.unsafe(\`select * from mydb."EMPLEADO" where id = \${id}\`)

// BIEN: \${} viaja como parámetro, nunca como parte del SQL
await sql\`select * from mydb."EMPLEADO" where id = \${id}\``,
      marks: { 4: 'del', 7: 'add' },
      hints: {
        1: 'Imagina que este texto lo escribió un usuario en un formulario.',
        4: 'El texto se junta con el SQL: el `drop table` se ejecutaría.',
        7: 'El valor viaja como parámetro: el peor resultado es un error, nunca un `drop`.'
      }
    },
    motif: 'scatter',
    accent: '#ff0080',
    hints: [
      'Este ejemplo no se ejecuta: es solo para entender el riesgo.',
      'Regla simple: si hay datos del usuario, usa `${}` dentro de `sql` y nada más.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · movimientos',
    title: 'La colección movimientos',
    lead: 'En MongoDB los datos son **documentos** parecidos a JSON, agrupados en colecciones. Este es un documento de `movimientos`.',
    bullets: [
      'Cada movimiento registra quién hizo qué y cuándo, en la tabla de Postgres que tocó.',
      'Los formatos `{ "$oid": ... }` y `{ "$date": ... }` son JSON extendido: así se muestran, no así llegan a JavaScript.',
      'MongoDB no obliga a que todos los documentos tengan esta forma: por eso la validamos nosotros.'
    ],
    code: {
      file: 'movimientos (documento)',
      lang: 'json',
      text: `{
  "_id": {
    "$oid": "6548a1f0e4b0c3d2a1b2c3d4"
  },
  "id": 1042,
  "usuario": "Mauricio Rivero",
  "tipoMovimiento": "actualizar",
  "tabla": "EMPLEADO",
  "camposActualizados": [
    "email",
    "telefono"
  ],
  "fechaHora": {
    "$date": "2026-11-05T15:47:00.000Z"
  }
}`,
      hints: {
        3: 'MongoDB crea el `_id` solo. En JavaScript llega como `ObjectId`; lo pasamos a texto con `String(doc._id)`.',
        5: 'El número del movimiento. Se valida con `esEnteroPositivo`.',
        6: 'Quién hizo el movimiento. Texto no vacío.',
        7: 'Qué se hizo, por ejemplo `actualizar`, `crear` o `eliminar`.',
        8: 'La tabla de Postgres a la que se refiere el movimiento.',
        9: 'Un arreglo de textos. Es opcional: `crear` y `eliminar` no lo necesitan.',
        14: 'La forma JSON de una fecha. El driver la entrega como un `Date` de JavaScript.'
      }
    },
    motif: 'rows',
    accent: '#13aa52',
    hints: [
      '`email` y `telefono` son un ejemplo: la tabla `EMPLEADO` de esta clase no tiene esas columnas.',
      'Compara: una fila de Postgres siempre tiene las mismas columnas; un documento puede variar.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · consultarMovimientos.js',
    title: 'consultarMovimientos: traducir los errores',
    lead: 'Igual que con Supabase, los errores del driver se traducen a frases que dicen qué revisar.',
    bullets: [
      'Atlas responde la contraseña incorrecta con `code: 8000`; un MongoDB propio usa `18`. Por eso también se mira el mensaje.',
      '`MongoServerSelectionError` significa que no se pudo llegar al cluster: casi siempre es la IP o internet.',
      '`/bad auth|authentication/i` es una expresión regular; la `i` ignora mayúsculas.'
    ],
    code: {
      file: 'src/consultarMovimientos.js',
      lang: 'js',
      start: 11,
      text: `// Nombre de la colección (la base de datos la elijo en MONGO_DB_NAME)
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
}`,
      hints: {
        2: 'El nombre de la colección va en una constante. La base se elige en `MONGO_DB_NAME`.',
        7: 'El driver no encontró ningún servidor del cluster.',
        10: 'Atlas bloquea las IP que no están en la lista de **Network Access**.',
        14: 'Autenticación fallida: el código `18` es de un MongoDB propio; Atlas manda «bad auth» dentro del mensaje, así que también se busca el texto.',
        18: 'Falta de permisos: el usuario existe, pero no puede leer esa colección (código `13`, o «not allowed to do action» en Atlas).',
        22: 'El nombre del cluster no existe (falla el DNS).'
      }
    },
    motif: 'scatter',
    accent: '#ff0080',
    hints: [
      'Prueba: cambia una letra de `MONGO_DB_PASSWORD` y ejecuta `npm run consultar:movimientos`.',
      'Si tu IP cambió (otra red), agrégala de nuevo en **Network Access**.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · consultarMovimientos.js',
    title: 'consultarMovimientos: validar el documento (1/2)',
    lead: 'MongoDB no impone un esquema, así que la forma del documento la validamos nosotros, campo por campo.',
    bullets: [
      'Los cinco campos obligatorios se revisan con las funciones de `validaciones.js`.',
      '`camposActualizados` es **opcional**: si no existe se usa `[]`.',
      '`??` devuelve el valor de la derecha solo si el de la izquierda es `null` o `undefined`.'
    ],
    code: {
      file: 'src/consultarMovimientos.js',
      lang: 'js',
      start: 39,
      text: `// Reviso que un documento tenga la forma que espero y devuelvo un objeto
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
  }`,
      hints: {
        3: 'Recibe el documento y su posición en la lista.',
        5: 'El `id` del movimiento: entero mayor que 0.',
        6: 'Quién lo hizo: texto con contenido.',
        9: 'El driver convierte `{ "$date": ... }` en un `Date`; aquí se comprueba.',
        13: 'Si el campo falta, se trabaja con un arreglo vacío.',
        14: 'Debe ser un arreglo (`Array.isArray`) y todos sus elementos deben ser textos no vacíos (`every`).'
      }
    },
    motif: 'rows',
    accent: '#0070f3',
    hints: [
      '`every` devuelve `true` solo si **todos** los elementos cumplen la función.',
      'Pasa la función sin paréntesis (`esTextoNoVacio`) para que `every` la llame con cada elemento.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · consultarMovimientos.js',
    title: 'consultarMovimientos: validar el documento (2/2)',
    lead: 'Si algún campo está mal se lanza un error que lo nombra; si todo está bien se devuelve un objeto limpio.',
    bullets: [
      'El error incluye la posición y el `_id` del documento, para encontrarlo en Atlas.',
      '`String(doc._id)` convierte el `ObjectId` en texto.',
      'Se devuelven solo los campos conocidos, con `camposActualizados` siempre como arreglo.'
    ],
    code: {
      file: 'src/consultarMovimientos.js',
      lang: 'js',
      start: 56,
      text: `  if (invalidos.length > 0) {
    throw new Error(
      \`Movimiento inválido (documento \${indice + 1}, _id \${doc._id}): \` +
        \`revisa \${invalidos.join(', ')}\`
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
}`,
      hints: {
        1: 'Si hay al menos un campo malo, se lanza el error.',
        3: 'El mensaje dice cuál documento (su posición y su `_id`, para buscarlo en Atlas) y cuáles campos están mal.',
        8: 'Saca los campos que se van a devolver.',
        10: 'El `ObjectId` se convierte en un texto de 24 caracteres.',
        15: 'Siempre es un arreglo, aunque el documento no lo traiga.'
      }
    },
    motif: 'rows',
    accent: '#0070f3',
    hints: [
      'Devolver un objeto nuevo en vez del documento original evita que se cuelen campos inesperados.',
      'Si el error aparece en tu colección, abre ese `_id` en Atlas y corrige el documento.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · consultarMovimientos.js',
    title: 'consultarMovimientos: la consulta',
    lead: 'La misma receta de tres pasos, pero con `find()` en lugar de SQL.',
    bullets: [
      '`find({})` con un objeto vacío significa «sin filtro»: trae todos los documentos.',
      '`sort({ fechaHora: -1 })` ordena de mayor a menor: los más recientes primero.',
      'El cursor trae los documentos por partes; `toArray()` los junta en un arreglo.'
    ],
    code: {
      file: 'src/consultarMovimientos.js',
      lang: 'js',
      start: 75,
      text: `// Devuelvo los movimientos, del más reciente al más antiguo.
// Opciones: { limite } = cuántos traigo como máximo (entero de 1 a 1000).
export async function consultarMovimientos(opciones = {}) {
  // 1. Reviso lo que me llega, ANTES de hablar con la base de datos
  const { limite } = validarOpciones(opciones)

  // 2. Hago la consulta. Si falla, el catch lo traduce a un mensaje claro
  //    y guardo el error original en \`cause\` por si lo necesito.
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
      \`No se pudieron consultar los movimientos: \${describirError(error)}\`,
      { cause: error }
    )
  }

  // 3. Reviso lo que devolvió la base (colección vacía = [], no es un error)
  return documentos.map(validarMovimiento)
}`,
      hints: {
        3: 'Misma firma que `consultarEmpleados`: opciones con valor por defecto.',
        5: 'Paso 1: valida el límite antes de conectar.',
        11: 'Reutiliza la conexión de `db_mongo.js`.',
        14: 'Elige la colección `movimientos`; `find({})` con filtro vacío no descarta nada; y `sort({ fechaHora: -1 })` ordena de mayor a menor (`1` sería de menor a mayor).',
        15: 'Solo se limita si el usuario pidió un límite.',
        18: 'Hasta aquí la consulta no se ejecutó: `toArray()` la lanza y espera el resultado.',
        27: 'Paso 3: valida cada documento. Una colección vacía devuelve `[]`.'
      }
    },
    motif: 'pipeline',
    accent: '#13aa52',
    hints: [
      'Prueba: `npm run consultar -- movimientos 3` y compara el orden con `npm run consultar:movimientos`.',
      'Un cursor es como un puntero a los resultados: no los descarga todos hasta que se lo pides.'
    ]
  },
  {
    kicker: 'Mostrar resultados',
    title: 'consultar.js: mostrar sin detener todo',
    lead: 'Esta función ejecuta **una** consulta y muestra el resultado. Si falla, imprime el error y sigue.',
    bullets: [
      'Recibe la consulta como una **función** (`consultar`) para ejecutarla dentro de su propio `try / catch`.',
      'Así, si Supabase falla, MongoDB se consulta de todos modos (y al revés).',
      '`console.table` muestra el arreglo como tabla; `process.exitCode = 1` marca que hubo un error.'
    ],
    code: {
      file: 'src/consultar.js',
      lang: 'js',
      start: 32,
      text: `// Ejecuto UNA consulta y muestro su resultado. Si falla, imprimo el error y
// sigo: así un problema en Supabase no me impide probar MongoDB (y al revés).
async function mostrar(titulo, consultar, convertirFila) {
  console.log(\`\\n\${titulo}\`)
  try {
    const resultados = await consultar()
    if (resultados.length === 0) {
      console.log('(sin resultados: carga datos con npm run cargar:datos)')
    } else {
      console.table(resultados.map(convertirFila))
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}`,
      hints: {
        3: 'Tres parámetros: el título, la consulta a ejecutar y cómo convertir cada fila.',
        4: 'Imprime el título con una línea en blanco antes.',
        6: 'Ejecuta la consulta que recibió como función.',
        7: 'Lista vacía: no es un error, solo no hay datos todavía.',
        10: 'Convierte cada resultado a una fila legible y la muestra como tabla.',
        13: 'Muestra el mensaje ya traducido por `describirError`.',
        14: 'El programa termina con código 1: avisa que algo falló.'
      }
    },
    motif: 'stream',
    accent: '#50e3c2',
    hints: [
      'Pasar una función como argumento permite que `mostrar` decida cuándo ejecutarla.',
      'Cada consulta tiene su propio `try / catch`: un error no impide la siguiente.'
    ]
  },
  {
    kicker: 'Mostrar resultados',
    title: 'consultar.js: argumentos y cierre',
    lead: 'El programa lee lo que escribiste en la terminal, valida, ejecuta y cierra siempre las dos conexiones.',
    bullets: [
      '`process.argv.slice(2)` devuelve lo que escribiste después del nombre del archivo.',
      'Los argumentos llegan como texto: el límite se convierte con `Number(...)` y se valida.',
      '`Promise.allSettled` cierra las dos conexiones aunque una nunca se haya abierto.'
    ],
    code: {
      file: 'src/consultar.js',
      lang: 'js',
      start: 49,
      text: `try {
  // process.argv = [node, este archivo, ...lo que escribí en la terminal]
  const [fuente = 'todo', limiteTexto] = process.argv.slice(2)
  if (!FUENTES.includes(fuente)) {
    throw new Error(\`Fuente "\${fuente}" no válida (usa \${FUENTES.join(', ')})\`)
  }

  // Los argumentos llegan como texto: paso el límite a número y lo reviso
  const limite = limiteTexto === undefined ? undefined : Number(limiteTexto)
  const opciones = validarOpciones({ limite })

  if (fuente !== 'movimientos') {
    const consultar = () => consultarEmpleados(opciones)
    await mostrar('Empleados (Supabase)', consultar, filaEmpleado)
  }
  if (fuente !== 'empleados') {
    const consultar = () => consultarMovimientos(opciones)
    await mostrar('Movimientos (MongoDB Atlas)', consultar, filaMovimiento)
  }
} catch (error) {
  console.error('Error:', error.message)
  process.exitCode = 1
} finally {
  // Cierro las dos conexiones, aunque alguna nunca se haya abierto
  await Promise.allSettled([sql.end(), cerrarMongo()])
}`,
      hints: {
        3: 'Los dos primeros elementos de `process.argv` son `node` y este archivo; `slice(2)` deja lo tuyo. Si no escribes nada, la fuente es `todo`.',
        4: 'Comprueba que la fuente sea una de las permitidas.',
        9: 'Convierte el texto `\'3\'` en el número `3`.',
        10: 'La misma validación que usan las consultas, pero aquí falla una sola vez.',
        12: 'Si no pediste solo movimientos, consulta empleados.',
        16: 'Si no pediste solo empleados, consulta movimientos.',
        20: 'Errores de argumentos o de validación llegan aquí.',
        25: 'Espera a que las dos terminen, sin importar si alguna falla.'
      }
    },
    motif: 'stream',
    accent: '#50e3c2',
    hints: [
      '`allSettled` no lanza error si alguna promesa falla; por eso sirve para limpiar al final.',
      'El bloque `finally` se ejecuta aunque haya un error o un `process.exitCode`.'
    ]
  },
  {
    kicker: 'Datos de ejemplo',
    title: 'cargarDatosEjemplo: insertar solo lo que falta',
    lead: 'Para consultar necesitas datos. Este script los inserta y se puede repetir sin duplicar nada.',
    bullets: [
      'Es el único script de la clase que **escribe** datos en tus bases.',
      '`$in` busca los documentos cuyo `id` está en la lista; el `Set` guarda los que ya existen.',
      '`filter` deja solo los que faltan y `insertMany` los guarda de una vez.',
      'En `EMPLEADO` el criterio es más simple: solo inserta si la tabla está vacía.'
    ],
    code: {
      file: 'src/cargarDatosEjemplo.js',
      lang: 'js',
      start: 85,
      text: `// Inserto en MongoDB Atlas los movimientos que todavía no existen
async function cargarMovimientos() {
  const db = await conectarMongo()
  const coleccion = db.collection('movimientos')

  // Busco cuáles de mis \`id\` ya están guardados ($in = "está en...")
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
  console.log(\`movimientos: \${insertedCount} documentos insertados.\`)
}`,
      hints: {
        2: 'Solo inserta los movimientos que todavía no están guardados.',
        7: 'Saca la lista de `id` de los documentos de ejemplo.',
        9: '`$in` = «el `id` está dentro de esta lista». Con `projection` se pide solo el campo `id`, no el documento completo.',
        11: 'Un `Set` permite preguntar rápido si un valor ya existe.',
        14: 'Se queda con los movimientos cuyo `id` aún no está en Atlas.',
        15: 'Si no falta ninguno, avisa y no inserta nada.',
        21: 'Guarda todos los documentos en una sola llamada.'
      }
    },
    motif: 'burst',
    accent: '#f5a623',
    hints: [
      'Un script que se puede repetir sin efectos secundarios se llama **idempotente**.',
      'Estos datos son de práctica: en un proyecto real no insertarías datos de ejemplo en producción.'
    ]
  },
  {
    kicker: 'Datos de ejemplo',
    title: 'Ejecútalo: npm run cargar:datos',
    lead: 'La primera vez inserta; la segunda no hace nada porque los datos ya existen.',
    bullets: [
      'Tus cifras pueden variar si ya tenías datos: por ejemplo, un `movimientos` con un documento de antes.',
      'En una base vacía verás 5 empleados y 5 movimientos.',
      'Si falla uno de los dos, el otro se intenta igual.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `$ npm run cargar:datos
EMPLEADO: 5 filas insertadas.
movimientos: 4 documentos insertados.
$ npm run cargar:datos
EMPLEADO ya tiene 5 filas: no se inserta nada.
movimientos: ya están todos, no se inserta nada.`,
      hints: {
        2: 'Se insertaron 5 filas en la tabla `EMPLEADO` de Supabase.',
        3: 'En este ejemplo ya existía 1 movimiento; por eso se insertaron 4.',
        5: 'Segunda ejecución: la tabla ya tiene datos y no se toca.',
        6: 'Todos los `id` de ejemplo ya existen en Atlas.'
      }
    },
    motif: 'burst',
    accent: '#f5a623',
    hints: [
      'Si quieres empezar de cero, borra las filas desde el SQL Editor de Supabase y los documentos desde Atlas.',
      'Ejecútalo dos veces: la segunda vez debe decir que no inserta nada.'
    ]
  },
  {
    kicker: 'Resultado',
    title: 'Ejecútalo: npm run consultar',
    lead: 'Un solo comando consulta las dos bases y muestra cada resultado como una tabla.',
    bullets: [
      'Los empleados salen ordenados por `id`; los movimientos, del más reciente al más antiguo.',
      'La tabla de movimientos es ancha: si no cabe, desplázate horizontalmente en el editor.',
      'Puedes consultar una sola fuente con `npm run consultar:empleados` o `npm run consultar:movimientos`.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `$ npm run consultar
Empleados (Supabase)
┌─────────┬────┬──────────┬─────────────┬──────────────┐
│ (index) │ id │ nombre   │ apellido    │ nacimiento   │
├─────────┼────┼──────────┼─────────────┼──────────────┤
│ 0       │ 1  │ 'Laura'  │ 'Gómez'     │ '1990-04-15' │
│ 1       │ 2  │ 'Carlos' │ 'Martínez'  │ '1985-09-02' │
│ 2       │ 3  │ 'Ana'    │ 'Rodríguez' │ '1993-12-21' │
│ 3       │ 4  │ 'Andrés' │ 'Torres'    │ '1988-06-30' │
│ 4       │ 5  │ 'Camila' │ 'Herrera'   │ '1995-02-08' │
└─────────┴────┴──────────┴─────────────┴──────────────┘

Movimientos (MongoDB Atlas)
┌─────────┬──────┬───────────────────┬──────────────┬──────────────┬────────────────────┬────────────────────┐
│ (index) │ id   │ usuario           │ tipo         │ tabla        │ campos             │ fechaHora          │
├─────────┼──────┼───────────────────┼──────────────┼──────────────┼────────────────────┼────────────────────┤
│ 0       │ 1046 │ 'Laura Gómez'     │ 'actualizar' │ 'EMPLEADO'   │ 'nombre, apellido' │ '2026-11-06 09:10' │
│ 1       │ 1045 │ 'Carlos Martínez' │ 'eliminar'   │ 'USUARIO'    │ ''                 │ '2026-11-06 08:30' │
│ 2       │ 1044 │ 'Laura Gómez'     │ 'actualizar' │ 'EVALUACION' │ 'descripcion'      │ '2026-11-05 17:15' │
│ 3       │ 1043 │ 'Mauricio Rivero' │ 'crear'      │ 'EMPLEADO'   │ ''                 │ '2026-11-05 16:02' │
│ 4       │ 1042 │ 'Mauricio Rivero' │ 'actualizar' │ 'EMPLEADO'   │ 'email, telefono'  │ '2026-11-05 15:47' │
└─────────┴──────┴───────────────────┴──────────────┴──────────────┴────────────────────┴────────────────────┘`,
      hints: {
        2: 'Resultado de `consultarEmpleados()`: una consulta SQL.',
        6: 'Cada fila de la tabla `EMPLEADO`. La fecha se muestra como texto.',
        13: 'Resultado de `consultarMovimientos()`: un `find()` sobre la colección.',
        17: 'El movimiento más reciente va primero (`sort` de mayor a menor).',
        21: 'El arreglo `camposActualizados` unido con `join(\', \')`.'
      }
    },
    motif: 'burst',
    accent: '#50e3c2',
    hints: [
      '¡Ya consultas dos bases de datos distintas con un solo comando!',
      'Prueba `npm run consultar -- movimientos 3` para ver solo los 3 más recientes.'
    ]
  },
  {
    kicker: 'Errores',
    title: 'Si algo falla',
    lead: 'Los mensajes de esta clase dicen qué falló y qué revisar. Estos son los más comunes.',
    cards: [
      {
        label: 'Falta SUPABASE_DB_PORT. Copia .env.example a .env.',
        sub: 'La variable no existe o está vacía. El nombre debe coincidir exactamente con el de `.env.example`.',
        on: true
      },
      {
        label: 'SUPABASE_DB_PORT debe ser un número…',
        sub: 'El valor del `.env` no tiene la forma correcta. El mensaje dice qué variable y qué se esperaba.',
        on: true
      },
      {
        label: '"limite" debe ser un entero entre 1 y 1000',
        sub: 'El parámetro llegó mal: un texto, un decimal, 0 o demasiado grande. Se detecta antes de consultar.',
        on: true
      },
      {
        label: 'usuario o contraseña incorrectos',
        sub: 'Revisa el usuario y la contraseña de la base que falló. En el pooler de Supabase el usuario es `postgres.<ref>`.',
        on: true
      },
      {
        label: 'no se encontró el servidor / no se alcanzó el cluster',
        sub: 'El host está mal escrito, no hay internet o, en Atlas, tu IP no está en **Network Access**.',
        on: true
      },
      {
        label: 'la tabla mydb."EMPLEADO" no existe',
        sub: 'La conexión funciona, pero falta ejecutar `script_homologado.sql` en el SQL Editor de Supabase.',
        on: true
      }
    ],
    cardsWide: true,
    motif: 'scatter',
    accent: '#ff0080',
    hints: [
      'Cada mensaje sale de una validación o de `describirError`: búscalo en el código para ver cuándo se lanza.',
      'Si ves `Empleado inválido` o `Movimiento inválido`, la base devolvió un dato con forma inesperada.'
    ]
  },
  {
    kicker: 'Comparación',
    title: 'Dos bases, las mismas tareas',
    lead: 'Cambian las herramientas, no la receta. Compara lo que hicimos en cada archivo.',
    cards: [
      {
        label: 'Conectar',
        sub: 'Supabase: `postgres(cadena)` en `db.js`. Atlas: `new MongoClient(uri)` en `db_mongo.js`.',
        on: true
      },
      {
        label: 'Consultar',
        sub: 'Supabase: SQL (`select`) escrito dentro de la función `sql`. Atlas: `find({})` sobre una colección.',
        on: true
      },
      {
        label: 'Ordenar y limitar',
        sub: 'Supabase: `order by id` y `limit`. Atlas: `.sort({ fechaHora: -1 })` y `.limit()`.',
        on: true
      },
      {
        label: 'Parámetros',
        sub: 'Supabase: cada `${}` viaja aparte del SQL. Atlas: los filtros son objetos, no texto.',
        on: true
      },
      {
        label: 'Resultado',
        sub: 'Supabase: un arreglo de filas. Atlas: un cursor; `toArray()` lo junta en un arreglo.',
        on: true
      },
      {
        label: 'Cerrar',
        sub: 'Supabase: `sql.end()`. Atlas: `cerrarMongo()`.',
        on: true
      }
    ],
    cardsWide: true,
    motif: 'ring',
    accent: '#7c8cff',
    hints: [
      'Los dos siguen los mismos pasos: validar la entrada, consultar, validar la salida y cerrar.',
      'Si aprendiste una, la otra es casi igual con otro vocabulario.'
    ]
  },
  {
    kicker: 'Buenas prácticas',
    title: 'Consultas seguras y claras',
    lead: 'Estas reglas hacen que tu código sea más difícil de romper y más fácil de entender.',
    bullets: [
      '**Valida todo lo que viene de fuera:** lo que escribe el usuario, el `.env` y también la respuesta de la base de datos.',
      '**Un error, un mensaje claro:** di qué falló y qué revisar, y guarda el error original en `cause`.',
      '**Parámetros, no texto pegado:** usa `${}` dentro de `sql` para evitar la inyección SQL.',
      '**Pon un límite a las consultas:** evita traer miles de filas por error.',
      '**Cierra siempre las conexiones** en un `finally`.',
      '**No imprimas contraseñas** ni cadenas de conexión con `console.log`.'
    ],
    motif: 'wave',
    accent: '#ff0080',
    hints: [
      'Antes de cada `git commit`, mira `git status`: el `.env` no debe aparecer.',
      'Un buen mensaje de error ahorra media hora de búsqueda.'
    ]
  },
  {
    kicker: 'Práctica',
    title: 'Retos para practicar',
    lead: 'Usan lo que ya escribiste. Resuelve al menos uno de cada base de datos.',
    bullets: [
      '**Filtro en Postgres:** agrega a `consultarEmpleados` la opción `apellido`, valídala como texto no vacío y úsala con `where apellido = ${apellido}`.',
      '**Filtro en MongoDB:** agrega a `consultarMovimientos` la opción `usuario` y úsala en `find({ usuario })`.',
      '**Rango de fechas:** filtra los movimientos entre dos fechas con `$gte` y `$lte`, y valida que `desde` sea anterior a `hasta`.',
      '**Otra tabla:** crea `consultarEvaluaciones.js` con un `join` a `"EMPLEADO"`.',
      '**Errores:** apaga tu internet o cambia una letra del host y compara los mensajes.',
      '**Pruebas:** escribe un script que llame a `validarOpciones` con diez entradas distintas y anota cuáles lanzan error.'
    ],
    motif: 'grid',
    accent: '#ff0080',
    hints: [
      'Para los filtros tendrás que ampliar `validarOpciones`: hoy solo conoce `limite`.',
      'En MongoDB, `{ usuario: \'Laura Gómez\' }` dentro de `find` solo trae los documentos con ese usuario.'
    ]
  },
  {
    kicker: 'Créditos',
    title: 'Fuentes',
    lead: 'El código de esta clase sigue las guías oficiales de cada proyecto. Consúltalas para ir más lejos.',
    bullets: [
      '**postgres (postgres.js)**, el cliente de PostgreSQL para Node.js: `github.com/porsager/postgres`.',
      '**MongoDB:** documentación del driver para Node.js, `find()` y la Stable API: `mongodb.com/docs`.',
      '**Supabase:** guías para conectarse a la base de datos: `supabase.com/docs`.',
      '**Node.js:** `process.loadEnvFile`, `process.argv` y los errores estándar: `nodejs.org/api`.'
    ],
    motif: 'cloud',
    accent: '#0070f3',
    hints: [
      '¡Terminaste! Abre la carpeta `src/` y juega con los archivos.',
      'Lee la documentación oficial: tiene ejemplos de filtros, actualizaciones y borrados.'
    ]
  }
];
