/*
  Contenido de las diapositivas de la clase 7: conexión a bases de datos.
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
  Los fragmentos de codigo salen de los archivos de la clase (src/ y parametrizacion/) y
  "start" es el numero de linea del archivo donde empieza el fragmento. Si cambias un
  archivo, actualiza aqui el texto, "start" y las claves de "hints" (numero de linea
  DENTRO del fragmento). Los bloques cuyo "file" no es una ruta real (terminal, ejemplo.js,
  .env.example, "src/probar.js (versión mínima)") no estan respaldados por un archivo.
*/
window.SLIDES = [
  {
    type: 'title',
    kicker: 'Clase 7 · Node.js',
    title: 'Conecta Node.js a tus bases de datos',
    lead: 'Aprende a conectarte a **Supabase** (PostgreSQL) y a **MongoDB Atlas**, a guardar las credenciales en un archivo `.env` y a comprobar con un script que todo funciona.',
    motif: 'cloud',
    accent: '#7c8cff',
    hints: [
      '¡Hola! Soy **Dato**. Haz clic en mí cuando quieras una pista sobre el código.',
      'Usa las flechas ← → del teclado para moverte, `T` para cambiar de tema y `H` para pedirme una pista.',
      'Las líneas de código con un punto tienen pista. Haz clic en ellas.'
    ]
  },
  {
    kicker: 'Concepto',
    title: '¿Qué significa conectarse a una base de datos?',
    lead: 'Tu programa le pide datos a **otro computador** a través de internet. Para lograrlo necesita cuatro piezas.',
    bullets: [
      'La base de datos **no vive en tu computador**: vive en un servidor en la nube.',
      'Por eso necesitas credenciales y que la red te deje pasar.',
      'Hoy conectamos dos servicios: **Supabase** y **MongoDB Atlas**.'
    ],
    diagram: [
      {
        label: 'Tu programa en Node.js',
        sub: 'Lo ejecutas con `node src/probar.js`.'
      },
      {
        label: 'Un paquete de npm (el driver)',
        sub: '`postgres` habla con PostgreSQL y `mongodb` habla con MongoDB.'
      },
      {
        label: 'Una cadena de conexión',
        sub: 'Una URL con usuario, contraseña, servidor y base de datos.'
      },
      {
        label: 'El servidor en la nube',
        sub: 'Supabase o Atlas reciben la petición y responden.'
      }
    ],
    motif: 'pipeline',
    accent: '#7928ca',
    hints: [
      'El «driver» es solo un paquete que sabe hablar el idioma de una base de datos concreta.',
      'Si algo falla, casi siempre es una de estas piezas: la cadena, las credenciales o la red.'
    ]
  },
  {
    kicker: 'Concepto',
    title: 'Dos bases de datos, dos estilos',
    lead: 'Esta clase conecta las dos. Cambian las herramientas, pero el proceso es el mismo.',
    cards: [
      {
        label: 'Supabase · PostgreSQL (relacional)',
        sub: 'Los datos viven en **tablas** con filas y columnas, relacionadas entre sí. Se consultan con **SQL**. Paquete de npm: `postgres`.',
        on: true
      },
      {
        label: 'MongoDB Atlas (documentos)',
        sub: 'Los datos viven en **colecciones** de documentos parecidos a JSON, sin un esquema fijo. Paquete de npm: `mongodb`.',
        on: true
      }
    ],
    cardsWide: true,
    motif: 'ring',
    accent: '#3fcf8e',
    hints: [
      'Relacional = tablas con relaciones. Documentos = objetos flexibles agrupados en colecciones.',
      'Supabase es un servicio que te da una base de datos PostgreSQL lista para usar.'
    ]
  },
  {
    kicker: 'Panorama',
    title: 'Los archivos de la clase',
    lead: 'Tres archivos de código, un script de SQL y un `.env`. Los construiremos en este orden.',
    bullets: [
      '`db.js`: la conexión a Supabase.',
      '`probar.js`: comprueba esa conexión y las tablas.',
      '`probarMongo.js`: se conecta a MongoDB Atlas y la prueba.',
      '`script_homologado.sql`: crea las tablas de ejemplo.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `7_conexion_DB/
├── .env
├── .env.example
├── package.json
├── parametrizacion/
│   └── script_homologado.sql
└── src/
    ├── db.js
    ├── probar.js
    └── probarMongo.js`,
      hints: {
        2: '`.env` guarda tus credenciales reales. Nunca se sube a git.',
        3: '`.env.example` es la plantilla sin secretos: dice qué variables hay que llenar.',
        6: 'El script de SQL que crea el esquema y las tres tablas en Supabase.',
        8: '`db.js` exporta la conexión; los demás archivos la importan.',
        9: 'Prueba la conexión a Supabase y lista las tablas.',
        10: 'Prueba la conexión a MongoDB Atlas.'
      }
    },
    motif: 'grid',
    accent: '#50e3c2',
    hints: [
      'Cada archivo tiene una sola tarea. Eso hará fácil reutilizarlos en las próximas clases.',
      'Haz clic en las líneas con punto para ver qué hace cada archivo.'
    ]
  },
  {
    kicker: 'Preparación',
    title: 'Prepara el proyecto',
    lead: 'Una carpeta, un `package.json` y dos paquetes de npm: uno por cada base de datos.',
    bullets: [
      '`postgres` es el cliente de PostgreSQL; `mongodb` es el driver oficial de MongoDB.',
      '`"type": "module"` activa `import` y `export` (clase 1).',
      'Requiere Node.js 20.12 o superior: ahí llegó `process.loadEnvFile`.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `$ mkdir 7_conexion_DB && cd 7_conexion_DB
$ npm init -y
$ npm pkg set type=module
$ npm pkg set engines.node=">=20.12"
$ npm install postgres mongodb
$ npm pkg set scripts.probar="node src/probar.js"
$ npm pkg set scripts.probar:mongo="node src/probarMongo.js"
$ mkdir src parametrizacion`,
      hints: {
        3: 'Así Node.js trata los `.js` como ES Modules y puedes usar `import`.',
        5: 'Instala los dos paquetes de una vez; npm los anota en `dependencies`.',
        6: 'Un atajo: `npm run probar` ejecuta `node src/probar.js`.'
      }
    },
    motif: 'grid',
    accent: '#50e3c2',
    hints: [
      'Si ya hiciste la clase 2, esto te suena: `npm install` descarga paquetes y los anota en el `package.json`.',
      'Los scripts evitan memorizar rutas: solo recuerdas `npm run probar`.'
    ]
  },
  {
    kicker: 'Preparación',
    title: 'El package.json resultante',
    lead: 'Así queda el archivo después de los comandos anteriores.',
    bullets: [
      'Se ejecutan con `npm run probar` y `npm run probar:mongo`.',
      'Las versiones de `dependencies` pueden ser más nuevas en tu computador.',
      '`"main"` apunta a `src/db.js`, el archivo central del proyecto.'
    ],
    code: {
      file: 'package.json',
      lang: 'json',
      start: 1,
      text: `{
  "name": "7_conexion_db",
  "version": "1.0.0",
  "description": "",
  "main": "src/db.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1",
    "probar": "node src/probar.js",
    "probar:mongo": "node src/probarMongo.js"
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
        5: 'El archivo principal del proyecto. `npm init` pone `index.js`; aquí lo cambiamos a `src/db.js`.',
        8: 'Atajo para `node src/probar.js`.',
        9: 'Atajo para `node src/probarMongo.js`. Los dos puntos son parte del nombre del script.',
        12: 'ES Modules: `import` y `export`.',
        14: 'Versión mínima de Node.js que necesita el proyecto.',
        17: 'El driver oficial de MongoDB para Node.js.',
        18: 'El cliente de PostgreSQL que usaremos con Supabase.'
      }
    },
    motif: 'rows',
    accent: '#0070f3',
    hints: [
      'El `^` de `^7.8.0` permite actualizaciones que no rompen la compatibilidad (7.x).',
      'Estas versiones son las que se instalaron al preparar la clase.'
    ]
  },
  {
    kicker: 'Seguridad',
    title: 'Las credenciales no van en el código',
    lead: 'Una contraseña escrita en el código se queda en el historial de git, aunque la borres después.',
    cards: [
      {
        label: 'Mal: la contraseña dentro del código',
        sub: 'Cualquiera con acceso al repositorio la ve, y no hay forma de retirarla del historial.'
      },
      {
        label: 'Bien: variables de entorno',
        sub: 'El código lee `process.env.DATABASE_URL`. El valor vive en un archivo `.env` que **no se sube** a git.',
        on: true
      },
      {
        label: 'Bien: una plantilla pública',
        sub: '`.env.example` muestra qué variables hacen falta, con valores falsos. Ese archivo sí se comparte.',
        on: true
      }
    ],
    cardsWide: true,
    motif: 'scatter',
    accent: '#f5a623',
    hints: [
      'El `.gitignore` de la raíz de este repositorio ya ignora los archivos `.env`.',
      'Piensa en el `.env` como las llaves de tu casa: no las dejas a la vista de todos.'
    ]
  },
  {
    kicker: 'Seguridad',
    title: 'El archivo .env.example',
    lead: 'La plantilla con las dos variables de la clase: una para Supabase y otras dos para MongoDB Atlas. Cópiala a `.env` y escribe tus datos reales.',
    bullets: [
      'Cada línea es `NOMBRE=valor`, sin espacios alrededor del `=`.',
      'Las líneas que empiezan por `#` son comentarios.',
      '`.env` queda fuera de git; `.env.example` no tiene secretos.'
    ],
    code: {
      file: '.env.example',
      lang: 'env',
      text: `# Copia este archivo a .env y reemplaza [YOUR-PASSWORD].
# Si la contraseña tiene caracteres especiales, codifícalos (percent-encoding), p. ej. ; -> %3B  @ -> %40
DATABASE_URL=postgresql://postgres.[TU-REF-DE-PROYECTO]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# MongoDB Atlas (cluster0.9y3jazd.mongodb.net)
MONGO_DB_USERNAME=tu_usuario
MONGO_DB_PASSWORD=tu_contraseña`,
      hints: {
        2: 'Si la contraseña tiene `@`, `;`, `/` o `:`, hay que codificarla. Por ejemplo, `@` se escribe `%40`.',
        3: 'La cadena de conexión de Supabase en una sola variable. La copiarás del panel de tu proyecto.',
        6: 'Para Atlas guardamos el usuario y la contraseña por separado: el código armará la URL.',
        7: 'La contraseña del usuario de la base de datos. No es la de tu cuenta de Atlas.'
      }
    },
    motif: 'rows',
    accent: '#f5a623',
    hints: [
      'En tu `.env` real, `[YOUR-PASSWORD]` se reemplaza por tu contraseña, incluyendo los corchetes.',
      'Si cambias algo en el `.env`, vuelve a ejecutar el programa: se lee al arrancar.'
    ]
  },
  {
    kicker: 'Supabase · Paso 1',
    title: 'Consigue tu cadena de conexión',
    lead: 'Antes de escribir código necesitas una base de datos a la cual conectarte.',
    bullets: [
      'Si olvidas la contraseña, la restableces en **Project Settings → Database**.',
      'El nombre de los botones puede cambiar un poco: la idea es la misma.'
    ],
    diagram: [
      {
        label: 'Crea un proyecto en Supabase',
        sub: 'En `supabase.com`: elige un nombre y una región, y **guarda la contraseña** de la base de datos.'
      },
      {
        label: 'Abre «Connect»',
        sub: 'El botón está en la parte superior del panel de tu proyecto.'
      },
      {
        label: 'Elige «Transaction pooler»',
        sub: 'Usa el puerto `6543` y funciona bien desde casi cualquier red.'
      },
      {
        label: 'Copia la URI en tu .env',
        sub: 'Reemplaza `[YOUR-PASSWORD]` por tu contraseña y guárdala como `DATABASE_URL`.'
      }
    ],
    motif: 'pipeline',
    accent: '#3fcf8e',
    hints: [
      'La conexión directa (puerto `5432`) usa IPv6 y puede fallar en redes que solo tienen IPv4. El pooler evita ese problema.',
      'La contraseña de la base de datos no es la de tu cuenta de Supabase: son dos cosas distintas.'
    ]
  },
  {
    kicker: 'Supabase · Paso 1',
    title: 'Anatomía de `DATABASE_URL`',
    lead: 'La URL es una sola línea con seis partes. Saber leerla te ayuda a encontrar errores.',
    cards: [
      {
        label: 'postgresql://',
        sub: 'El protocolo: dice que es una base de datos PostgreSQL.',
        on: true
      },
      {
        label: 'postgres.<ref>',
        sub: 'El usuario. En el pooler lleva el identificador de tu proyecto.',
        on: true
      },
      {
        label: '[YOUR-PASSWORD]',
        sub: 'La contraseña de la base de datos, codificada si tiene símbolos.',
        on: true
      },
      {
        label: '@aws-0-us-east-1',
        sub: 'El servidor: el pooler de la región de tu proyecto. El host completo termina en .pooler.supabase.com',
        on: true
      },
      {
        label: ':6543',
        sub: 'El puerto del pooler en modo transacción.',
        on: true
      },
      {
        label: '/postgres',
        sub: 'El nombre de la base de datos dentro del servidor.',
        on: true
      }
    ],
    motif: 'grid',
    accent: '#3fcf8e',
    hints: [
      'Las seis partes siempre van en este orden: protocolo, usuario, contraseña, servidor, puerto y base.',
      'Si copias la URI desde «Connect», ya trae el usuario con el identificador correcto.'
    ]
  },
  {
    kicker: 'Supabase · Paso 2',
    title: 'db.js: cargar el .env',
    lead: 'El primer archivo de la conexión lee las variables del `.env` antes de tocar la base de datos.',
    bullets: [
      '`process.loadEnvFile` es nativo de Node.js: no necesitas instalar `dotenv`.',
      '`import.meta.url` es la ubicación de este archivo (hace el papel de `__dirname` en ES Modules).',
      'El `try / catch` evita que un `.env` ausente detenga el programa.'
    ],
    code: {
      file: 'src/db.js',
      lang: 'js',
      start: 1,
      text: `// Conexión a Supabase (Postgres) usando el paquete \`postgres\`.
// La cadena de conexión viene de DATABASE_URL, definida en el archivo .env
// (nunca se escribe la contraseña directamente en el código).
import postgres from 'postgres'

// Carga el .env que está en la carpeta de la clase (funciona desde cualquier cwd)
try {
  process.loadEnvFile(new URL('../.env', import.meta.url))
} catch {
  // Si no existe .env, se usa lo que ya haya en el entorno
}`,
      hints: {
        3: 'La regla de oro: la contraseña nunca se escribe en el código.',
        4: '`postgres` es una función: al llamarla con la URL crea el cliente (siguiente diapositiva).',
        8: 'Busca el `.env` junto a este archivo, sin importar desde qué carpeta ejecutes `node`. Compara con la clase 4, donde la ruta dependía del cwd.',
        9: 'Este `catch` está vacío a propósito: en un servidor real las variables ya existen en el entorno y no hay `.env`.'
      }
    },
    motif: 'rows',
    accent: '#3fcf8e',
    hints: [
      'Antes existía el paquete `dotenv` para esto. Desde Node.js 20.12 ya viene incluido.',
      'Esta lectura ocurre una sola vez, cuando se importa `db.js`.'
    ]
  },
  {
    kicker: 'Supabase · Paso 2',
    title: 'db.js: crear la conexión',
    lead: 'Se valida que la variable exista, se crea el cliente con `postgres()` y se exporta para que otros archivos lo usen.',
    bullets: [
      'Si falta `DATABASE_URL`, el programa falla de inmediato con un mensaje claro.',
      '`prepare: false` es necesario con el pooler en modo transacción.',
      '`export default sql` entrega la conexión a quien importe `db.js`.'
    ],
    code: {
      file: 'src/db.js',
      lang: 'js',
      start: 13,
      text: `const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('Falta DATABASE_URL. Copia .env.example a .env y pon tu contraseña.')
}

// El pooler de Supabase (puerto 6543, modo transacción) no soporta prepared statements
const sql = postgres(connectionString, { prepare: false })

export default sql`,
      hints: {
        1: '`process.env` es donde Node.js guarda las variables de entorno, incluidas las que cargó el `.env`.',
        3: 'Falla rápido: un mensaje claro ahora es mejor que un error raro de conexión después.',
        6: 'Los *prepared statements* son consultas que el servidor guarda con nombre. El pooler en modo transacción no los admite.',
        7: '`postgres(url, opciones)` crea el cliente. Todavía no se conecta: lo hará con la primera consulta.',
        9: 'Todo archivo que haga `import sql from \'./db.js\'` recibe esta misma conexión.'
      }
    },
    motif: 'stream',
    accent: '#3fcf8e',
    hints: [
      'Si ves el error de `DATABASE_URL`, revisa que el archivo se llame `.env` (con el punto) y esté en la carpeta de la clase.',
      'Sin `prepare: false`, con el pooler pueden aparecer errores sobre sentencias preparadas inexistentes.'
    ]
  },
  {
    kicker: 'Supabase · Paso 2',
    title: 'Un módulo, una conexión',
    lead: 'Node.js ejecuta `db.js` **una sola vez** y guarda el resultado. Todos los archivos que lo importen comparten la misma conexión: es el patrón **Singleton** de la clase 6.',
    bullets: [
      'Abrir una conexión nueva por cada consulta es lento y agota el límite del servidor.',
      '`postgres` mantiene un grupo de conexiones reutilizables detrás de `sql`.',
      'Por eso `sql` se crea en `db.js` y se **importa** donde haga falta.'
    ],
    code: {
      file: 'ejemplo.js',
      lang: 'js',
      text: `// Cualquier archivo del proyecto reutiliza la MISMA conexión
import sql from './db.js'

const empleados = await sql\`select * from mydb."EMPLEADO"\`
const usuarios = await sql\`select * from mydb."USUARIO"\``,
      hints: {
        2: 'No crea otra conexión: reutiliza la que ya abrió `db.js`.',
        4: 'Las dos consultas viajan por el mismo cliente.'
      }
    },
    motif: 'ring',
    accent: '#0070f3',
    hints: [
      'Es la caché de módulos de Node.js la que hace el trabajo, como viste en el Singleton de la clase 6.',
      'Este ejemplo no es parte de los archivos de la clase: solo muestra cómo se reutiliza `sql`.'
    ]
  },
  {
    kicker: 'Supabase · Paso 2',
    title: 'Consultas con plantillas de texto',
    lead: '`sql` es una **función etiqueta**: escribes la consulta entre comillas invertidas y `postgres` convierte cada `${...}` en un **parámetro** seguro.',
    bullets: [
      'Nunca armes SQL pegando texto con `+`: abre la puerta a la **inyección SQL**.',
      'Con la plantilla de `sql`, el valor se envía por separado y no puede alterar la consulta.',
      'El resultado es un arreglo de objetos, uno por cada fila.'
    ],
    code: {
      file: 'ejemplo.js',
      lang: 'js',
      text: `const nombre = 'Ana'

// \${nombre} NO se pega al texto de la consulta: viaja como parámetro ($1)
const filas = await sql\`
  select * from mydb."EMPLEADO"
  where nombre = \${nombre}
\`

console.log(filas) // un arreglo con una fila (objeto) por cada empleado`,
      hints: {
        3: 'Es la diferencia clave con un `template string` normal: aquí `postgres` intercepta los valores.',
        6: '`${nombre}` se convierte en `$1`. El valor nunca se mezcla con el texto SQL.',
        9: 'Cada fila es un objeto con una propiedad por columna: `{ id, nombre, apellido, ... }`.'
      }
    },
    motif: 'stream',
    accent: '#ff0080',
    hints: [
      'La inyección SQL es uno de los ataques más comunes: alguien escribe SQL en un campo de texto y tu programa lo ejecuta.',
      'Los nombres de tabla no se pueden parametrizar así. Por eso `"EMPLEADO"` va escrito dentro de la consulta.'
    ]
  },
  {
    kicker: 'Supabase · Paso 3',
    title: 'Crea las tablas con SQL',
    lead: 'El archivo `parametrizacion/script_homologado.sql` se ejecuta una sola vez en Supabase. Es una adaptación a PostgreSQL de un script de MySQL Workbench.',
    bullets: [
      '`IF NOT EXISTS` permite ejecutarlo varias veces sin que falle.',
      'Crea el esquema `mydb` y las tablas `EMPLEADO`, `EVALUACION` y `USUARIO`.'
    ],
    diagram: [
      {
        label: 'Abre el SQL Editor',
        sub: 'Está en el menú lateral de tu proyecto en Supabase.'
      },
      {
        label: 'Pega el script',
        sub: 'Todo el contenido de `script_homologado.sql`.'
      },
      {
        label: 'Pulsa «Run»',
        sub: 'Supabase ejecuta las sentencias en orden.'
      },
      {
        label: 'Compruébalo con probar.js',
        sub: 'Más adelante el script de prueba confirmará que las tres tablas existen.'
      }
    ],
    motif: 'rows',
    accent: '#3fcf8e',
    hints: [
      'En el *Table Editor* cambia el esquema a `mydb` para ver tus tablas.',
      'Puedes ejecutar el script otra vez sin miedo: no duplica nada.'
    ]
  },
  {
    kicker: 'Supabase · Paso 3',
    title: 'El esquema y la tabla EMPLEADO',
    lead: 'Un **esquema** es como una carpeta dentro de la base de datos. Aquí se llama `mydb` y guarda las tres tablas.',
    bullets: [
      'Con comillas dobles, PostgreSQL respeta las mayúsculas: hay que escribir `"EMPLEADO"` igual en cada consulta.',
      '`GENERATED BY DEFAULT AS IDENTITY` es el autoincremento de PostgreSQL.',
      'La llave primaria identifica cada fila de forma única.'
    ],
    code: {
      file: 'parametrizacion/script_homologado.sql',
      lang: 'sql',
      start: 1,
      text: `-- Script equivalente para PostgreSQL
-- Adaptado desde el script de MySQL Workbench

CREATE SCHEMA IF NOT EXISTS mydb;
SET search_path TO mydb;

-- -----------------------------------------------------
-- Tabla EMPLEADO
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "EMPLEADO" (
  "id"               INT GENERATED BY DEFAULT AS IDENTITY,
  "nombre"           VARCHAR(45) NOT NULL,
  "apellido"         VARCHAR(45) NOT NULL,
  "fecha_nacimiento" TIMESTAMP NOT NULL,
  CONSTRAINT "EMPLEADO_pkey" PRIMARY KEY ("id")
);`,
      hints: {
        4: 'Crea el esquema `mydb` solo si todavía no existe.',
        5: '`search_path` le dice a PostgreSQL en qué esquema crear lo que viene después.',
        10: 'Las comillas dobles conservan las mayúsculas: la tabla se llama exactamente `EMPLEADO`.',
        11: 'La columna `id` se numera sola: 1, 2, 3...',
        12: '`NOT NULL`: el campo es obligatorio.',
        14: '`TIMESTAMP` guarda fecha y hora.',
        15: 'La llave primaria es `id`: no se repite en ninguna fila.'
      }
    },
    motif: 'rows',
    accent: '#3fcf8e',
    hints: [
      '`VARCHAR(45)` es un texto de hasta 45 caracteres.',
      'En la tabla `EMPLEADO` hay 4 columnas. Recuérdalo: `probar.js` las contará.'
    ]
  },
  {
    kicker: 'Supabase · Paso 3',
    title: 'EVALUACION: llave foránea e índice',
    lead: 'Cada evaluación pertenece a un empleado. La **llave foránea** obliga a que esa relación sea real.',
    bullets: [
      'No se puede crear una evaluación para un empleado que no existe.',
      '`NO ACTION` impide borrar un empleado que todavía tenga evaluaciones.',
      'PostgreSQL no crea el índice de una llave foránea por sí solo: hay que crearlo.'
    ],
    code: {
      file: 'parametrizacion/script_homologado.sql',
      lang: 'sql',
      start: 18,
      text: `-- -----------------------------------------------------
-- Tabla EVALUACION
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "EVALUACION" (
  "id"           INT GENERATED BY DEFAULT AS IDENTITY,
  "fecha"        TIMESTAMP NOT NULL,
  "descripcion"  VARCHAR(45) NOT NULL,
  "EMPLEADO_id"  INT NOT NULL,
  CONSTRAINT "EVALUACION_pkey" PRIMARY KEY ("id", "EMPLEADO_id"),
  CONSTRAINT "EVALUACION_id_key" UNIQUE ("id"),
  CONSTRAINT "fk_EVALUACION_EMPLEADO" FOREIGN KEY ("EMPLEADO_id")
    REFERENCES "EMPLEADO" ("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- PostgreSQL no crea un índice automático para las llaves foráneas (MySQL sí),
-- así que se crea explícitamente.
CREATE INDEX IF NOT EXISTS "fk_EVALUACION_EMPLEADO_idx"
  ON "EVALUACION" ("EMPLEADO_id");`,
      hints: {
        4: '`EVALUACION` depende de `EMPLEADO`, por eso se crea después.',
        8: 'Esta columna guarda el `id` del empleado evaluado.',
        9: 'Llave primaria compuesta (`id` + `EMPLEADO_id`), tal como la generó MySQL Workbench.',
        10: '`UNIQUE ("id")` mantiene el `id` único por sí solo.',
        11: 'La **llave foránea**: `EMPLEADO_id` debe apuntar a un empleado que exista.',
        13: 'Si intentas borrar un empleado con evaluaciones, PostgreSQL lo rechaza.',
        17: 'MySQL crea un índice para cada llave foránea; PostgreSQL no. Esta diferencia obliga a crearlo a mano.',
        19: 'Un índice acelera buscar las evaluaciones de un empleado.'
      }
    },
    motif: 'rows',
    accent: '#3fcf8e',
    hints: [
      'El orden importa: una tabla no puede apuntar a otra que todavía no existe.',
      'El punto y coma `;` cierra cada sentencia SQL.'
    ]
  },
  {
    kicker: 'Supabase · Paso 3',
    title: 'USUARIO y una advertencia',
    lead: 'La tercera tabla guarda los datos de acceso. Es solo para practicar: en un proyecto real se maneja distinto.',
    bullets: [
      'Tres tablas, once columnas: 4 en `EMPLEADO`, 4 en `EVALUACION` y 3 en `USUARIO`.',
      '**Nunca guardes contraseñas en texto plano:** se guarda un *hash* (por ejemplo, con bcrypt).',
      'Un hash de bcrypt mide 60 caracteres; `VARCHAR(45)` no alcanzaría.'
    ],
    code: {
      file: 'parametrizacion/script_homologado.sql',
      lang: 'sql',
      start: 39,
      text: `-- -----------------------------------------------------
-- Tabla USUARIO
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "USUARIO" (
  "id"             INT GENERATED BY DEFAULT AS IDENTITY,
  "nombre_usuario" VARCHAR(45) NOT NULL,
  "clave"          VARCHAR(45) NOT NULL,
  CONSTRAINT "USUARIO_pkey" PRIMARY KEY ("id")
);`,
      hints: {
        6: 'El nombre con el que la persona inicia sesión.',
        7: 'Aquí iría la contraseña. En un proyecto real guardarías un hash, no el texto.'
      }
    },
    motif: 'rows',
    accent: '#ff0080',
    hints: [
      'Con las tres tablas creadas, ya tienes qué verificar con `probar.js`.',
      'Un hash es una huella irreversible de la contraseña: sirve para comprobarla sin guardarla.'
    ]
  },
  {
    kicker: 'Supabase · Paso 4',
    title: 'probar.js: la prueba más corta',
    lead: 'Antes de listar tablas, comprueba lo esencial: ¿llegas a la base de datos? Pedimos la hora y la versión del servidor.',
    bullets: [
      'Si la consulta responde, la URL, la contraseña y la red están bien.',
      '`try / catch / finally` maneja el éxito, el error y el cierre.',
      '`sql.end()` es obligatorio: cierra las conexiones para que el programa termine.'
    ],
    code: {
      file: 'src/probar.js (versión mínima)',
      lang: 'js',
      text: `// Prueba rápida de la conexión: node src/probar.js
import sql from './db.js'

try {
  const [{ ahora, version }] = await sql\`select now() as ahora, version() as version\`
  console.log('Conexión OK:', ahora.toISOString())
  console.log(version)
} catch (error) {
  console.error('No se pudo conectar:', error.message)
  process.exitCode = 1
} finally {
  await sql.end()
}`,
      hints: {
        2: 'Importa la conexión que exporta `db.js`.',
        5: 'La consulta devuelve un arreglo de filas; `[{ ahora, version }]` toma la primera y saca sus dos columnas.',
        6: '`ahora` llega como objeto `Date`; `toISOString()` lo imprime en formato ISO.',
        9: '`error.message` es el texto del fallo: contraseña incorrecta, servidor inalcanzable...',
        10: 'Termina con código 1 para que quien ejecute el script sepa que falló.',
        12: 'Sin esta línea, las conexiones siguen abiertas y el programa no termina.'
      }
    },
    motif: 'stream',
    accent: '#3fcf8e',
    hints: [
      'Este bloque es una versión corta. En las siguientes diapositivas le sumamos la lista de tablas.',
      '`await` fuera de una función funciona porque el proyecto usa ES Modules (top-level await).'
    ]
  },
  {
    kicker: 'Supabase · Paso 4',
    title: 'probar.js: buscar las tablas',
    lead: 'La función `listarTablas` pregunta al catálogo de PostgreSQL cuántas columnas tiene cada tabla del script.',
    bullets: [
      '`information_schema` describe todas las tablas y columnas de la base.',
      '`sql(TABLAS_DEL_SCRIPT)` convierte el arreglo en la lista de un `in (...)`.',
      '`left join` mantiene las tablas aunque no tengan columnas coincidentes.'
    ],
    code: {
      file: 'src/probar.js',
      lang: 'js',
      start: 4,
      text: `// Esquema y tablas que crea parametrizacion/script_homologado.sql
const ESQUEMA = 'mydb'
const TABLAS_DEL_SCRIPT = ['EMPLEADO', 'EVALUACION', 'USUARIO']

// Lista las tablas del script que existen en la instancia de Supabase,
// con su número de columnas, e indica cuáles faltan por crear.
async function listarTablas() {
  const filas = await sql\`
    select t.table_name as tabla, count(c.column_name)::int as columnas
    from information_schema.tables t
    left join information_schema.columns c
      on c.table_schema = t.table_schema and c.table_name = t.table_name
    where t.table_schema = \${ESQUEMA}
      and t.table_type = 'BASE TABLE'
      and t.table_name in \${sql(TABLAS_DEL_SCRIPT)}
    group by t.table_name
    order by t.table_name
  \``,
      hints: {
        2: 'El esquema donde el script SQL creó las tablas.',
        3: 'Las tres tablas que esperamos encontrar. Las mayúsculas coinciden con las del script.',
        7: 'Una función `async`: espera la respuesta de la base de datos.',
        9: '`count` cuenta las columnas de cada tabla; `::int` lo convierte a número (si no, `postgres` lo entrega como texto).',
        10: '`information_schema` es el catálogo de PostgreSQL: describe todas sus tablas.',
        13: '`${ESQUEMA}` es un parámetro seguro (`$1`), no texto pegado a la consulta.',
        14: 'Solo tablas reales, sin vistas.',
        15: '`sql(arreglo)` expande el arreglo de JavaScript en la lista de un `in (...)`.'
      }
    },
    motif: 'rows',
    accent: '#3fcf8e',
    hints: [
      'Es una consulta de lectura: no cambia nada en tu base de datos.',
      'Si cambias el nombre del esquema en el script SQL, cambia `ESQUEMA` también.'
    ]
  },
  {
    kicker: 'Supabase · Paso 4',
    title: 'probar.js: mostrar y avisar',
    lead: 'Con las filas en la mano, se muestran como tabla y se avisa de las que todavía no existen.',
    bullets: [
      '`console.table` imprime un arreglo de objetos como una tabla en la terminal.',
      'Las faltantes son las esperadas que no aparecieron en el resultado.',
      'Es un aviso con `console.warn`, no un error: la conexión sí funcionó.'
    ],
    code: {
      file: 'src/probar.js',
      lang: 'js',
      start: 23,
      text: `  console.log(\`\\nTablas del esquema "\${ESQUEMA}":\`)
  console.table(filas)

  const existentes = filas.map((f) => f.tabla)
  const faltantes = TABLAS_DEL_SCRIPT.filter((t) => !existentes.includes(t))
  if (faltantes.length > 0) {
    console.warn(\`Faltan por crear: \${faltantes.join(', ')} (ejecuta el script SQL)\`)
  }

  return filas
}`,
      hints: {
        2: 'Dibuja las filas como una tabla con bordes.',
        4: 'Solo los nombres de las tablas que sí existen.',
        5: 'Las que están en la lista esperada pero no en la base de datos.',
        7: 'Un aviso amable: te recuerda ejecutar el script SQL.',
        10: 'Devuelve las filas por si otro archivo quiere usarlas.'
      }
    },
    motif: 'rows',
    accent: '#3fcf8e',
    hints: [
      '`filter` y `includes` revisan una lista contra la otra, igual que harías a mano.',
      'Si falta una tabla, no pasa nada grave: el aviso te dice cuál.'
    ]
  },
  {
    kicker: 'Supabase · Paso 4',
    title: 'probar.js: lo junta todo',
    lead: 'La versión final: la misma prueba corta, más una llamada a `listarTablas()` si la conexión funcionó.',
    bullets: [
      'La línea resaltada es la única que se agrega a la versión corta.',
      'Si algo falla, el `catch` imprime el motivo y marca el programa como fallido.',
      '`finally` cierra la conexión siempre, haya éxito o error.'
    ],
    code: {
      file: 'src/probar.js',
      lang: 'js',
      start: 35,
      text: `try {
  const [{ ahora, version }] = await sql\`select now() as ahora, version() as version\`
  console.log('Conexión OK:', ahora.toISOString())
  console.log(version)

  await listarTablas()
} catch (error) {
  console.error('No se pudo conectar:', error.message)
  process.exitCode = 1
} finally {
  await sql.end()
}`,
      marks: { 6: 'add' },
      hints: {
        2: 'Primero la prueba más simple: ¿responde el servidor?',
        6: 'Solo si la conexión funcionó se llega aquí y se listan las tablas.',
        7: '`catch` atrapa cualquier fallo: contraseña incorrecta, red caída, tabla ausente...',
        11: '`finally` se ejecuta siempre: así la conexión siempre se cierra.'
      }
    },
    motif: 'pipeline',
    accent: '#3fcf8e',
    hints: [
      'Ya puedes ejecutar `npm run probar` en la diapositiva siguiente.',
      '`listarTablas()` está definida arriba en el mismo archivo.'
    ]
  },
  {
    kicker: 'Supabase · Paso 4',
    title: 'Ejecútalo: npm run probar',
    lead: 'Si ves las tres tablas con su número de columnas, la conexión a Supabase funciona y el script SQL se ejecutó bien.',
    bullets: [
      'La hora y la versión de PostgreSQL te dicen que hablaste con el servidor real.',
      'Las columnas son 4, 4 y 3: coinciden con el script SQL.',
      'Si falta una tabla verás: `Faltan por crear: USUARIO (ejecuta el script SQL)`.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `$ npm run probar
Conexión OK: 2026-11-05T16:10:10.143Z
PostgreSQL 15.8 on aarch64-unknown-linux-gnu, compiled by gcc (GCC) 13.2.0, 64-bit

Tablas del esquema "mydb":
┌─────────┬──────────────┬──────────┐
│ (index) │ tabla        │ columnas │
├─────────┼──────────────┼──────────┤
│ 0       │ 'EMPLEADO'   │ 4        │
│ 1       │ 'EVALUACION' │ 4        │
│ 2       │ 'USUARIO'    │ 3        │
└─────────┴──────────────┴──────────┘`,
      hints: {
        2: 'Esta línea confirma la conexión. La hora es la del servidor.',
        3: 'La versión exacta de PostgreSQL que corre en Supabase. La tuya puede ser distinta.',
        5: 'Aquí empieza el resultado de `listarTablas()`.',
        9: '`EMPLEADO` tiene 4 columnas: `id`, `nombre`, `apellido` y `fecha_nacimiento`.'
      }
    },
    motif: 'burst',
    accent: '#50e3c2',
    hints: [
      '¡Primera conexión lograda! Tu programa habló con una base de datos en la nube.',
      'La hora y la versión serán distintas en tu computador: eso es normal.'
    ]
  },
  {
    kicker: 'Supabase · Errores',
    title: 'Si algo falla en Supabase',
    lead: 'Casi todos los errores de conexión son de credenciales o de red. El mensaje del `catch` te dice cuál.',
    cards: [
      {
        label: 'Falta DATABASE_URL',
        sub: 'No existe el `.env` o la variable no está escrita. Copia `.env.example` a `.env`.',
        on: true
      },
      {
        label: 'password authentication failed',
        sub: 'La contraseña no es la de la base de datos, o tiene símbolos sin codificar (`@` se escribe `%40`).',
        on: true
      },
      {
        label: 'Tenant or user not found',
        sub: 'El usuario del pooler no trae bien el identificador del proyecto (`postgres.<ref>`). Vuelve a copiar la URI desde «Connect».',
        on: true
      },
      {
        label: 'getaddrinfo ENOTFOUND',
        sub: 'El servidor está mal escrito, no tienes internet, o usas la conexión directa desde una red sin IPv6.',
        on: true
      },
      {
        label: 'Faltan por crear: ...',
        sub: 'La conexión funciona, pero falta ejecutar el script SQL en Supabase.',
        on: true
      }
    ],
    cardsWide: true,
    motif: 'scatter',
    accent: '#ff0080',
    hints: [
      'Lee el mensaje completo antes de cambiar nada: casi siempre dice qué pasó.',
      'Rompe algo a propósito (cambia una letra de la contraseña) y mira cómo cambia el mensaje.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · Paso 1',
    title: 'Prepara tu cluster en Atlas',
    lead: 'Atlas es el servicio en la nube de MongoDB. Antes de conectar hay cuatro cosas que preparar en su panel.',
    bullets: [
      '`0.0.0.0/0` abre el cluster a cualquier IP: úsalo solo en clase y nunca en producción.',
      'El nombre de los botones puede cambiar un poco: la idea es la misma.'
    ],
    diagram: [
      {
        label: 'Crea un cluster gratuito',
        sub: 'En `cloud.mongodb.com`: un cluster **M0** (gratis) en la región que prefieras.'
      },
      {
        label: 'Crea un usuario de base de datos',
        sub: 'En **Database Access**: usuario y contraseña. No es el de tu cuenta de Atlas.'
      },
      {
        label: 'Permite tu dirección IP',
        sub: 'En **Network Access**: agrega tu IP. Sin esto, Atlas rechaza la conexión.'
      },
      {
        label: 'Copia el host de tu cluster',
        sub: 'En **Connect → Drivers → Node.js** verás una URI como `cluster0.xxxxx.mongodb.net`.'
      }
    ],
    motif: 'pipeline',
    accent: '#13aa52',
    hints: [
      'La lista de IP permitidas es la causa número uno de «no me conecta» en Atlas.',
      'El usuario de base de datos y tu cuenta de Atlas son cosas distintas.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · Paso 1',
    title: 'Anatomía de la URI de Atlas',
    lead: 'Es parecida a la de Supabase, pero más corta. Tiene cuatro piezas.',
    bullets: [
      '`+srv` hace que el driver averigüe los servidores del cluster por DNS.',
      'Con `+srv` la conexión usa TLS: viaja cifrada.'
    ],
    cards: [
      {
        label: 'mongodb+srv://',
        sub: 'El protocolo. La URL no lista cada servidor del cluster: el DNS los entrega.',
        on: true
      },
      {
        label: 'usuario:contraseña@',
        sub: 'Las credenciales del usuario de **Database Access**, codificadas si tienen símbolos.',
        on: true
      },
      {
        label: 'cluster0.9y3jazd.mongodb.net',
        sub: 'El host de tu cluster en Atlas. Cada cluster tiene el suyo.',
        on: true
      },
      {
        label: '/',
        sub: 'La base de datos va después, opcional. Aquí queda vacía y se elige con `client.db()`.',
        on: true
      }
    ],
    motif: 'grid',
    accent: '#13aa52',
    hints: [
      'Compara con `DATABASE_URL`: aquí no hay puerto, porque `+srv` lo resuelve solo.',
      'El host de ejemplo es el del cluster de esta clase; el tuyo será distinto.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · Paso 2',
    title: 'probarMongo.js: leer las credenciales',
    lead: 'El script carga el `.env` igual que `db.js`, pero aquí el `.env` guarda **usuario y contraseña por separado**.',
    bullets: [
      'Así el código puede codificar cada valor antes de armar la URL.',
      'Si falta una variable, el programa se detiene con un mensaje claro.',
      'Del driver importamos `MongoClient` y `ServerApiVersion`.'
    ],
    code: {
      file: 'src/probarMongo.js',
      lang: 'js',
      start: 1,
      text: `// Prueba de conexión a MongoDB Atlas: node src/probarMongo.js (o npm run probar:mongo)
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
}`,
      hints: {
        3: '`MongoClient` crea la conexión; `ServerApiVersion` nombra las versiones de la API estable.',
        6: 'El mismo mecanismo que usamos en `db.js` para cargar el `.env`.',
        11: 'Desestructura las dos variables de `process.env` en una sola línea.',
        12: 'Si alguna está vacía o no existe, se rechaza antes de intentar conectar.'
      }
    },
    motif: 'rows',
    accent: '#13aa52',
    hints: [
      'Es el mismo patrón que en `db.js`: cargar el `.env`, validar y recién después conectar.',
      'Los nombres `MONGO_DB_USERNAME` y `MONGO_DB_PASSWORD` deben coincidir exactamente con los del `.env`.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · Paso 2',
    title: 'Armar la URI y crear el cliente',
    lead: 'Se arma la URL con el usuario y la contraseña codificados, y se crea el `MongoClient` con dos opciones importantes.',
    bullets: [
      '`encodeURIComponent` convierte símbolos como `@` o `/` para que no rompan la URL.',
      'La **Stable API** congela el comportamiento del servidor: tu código sigue funcionando cuando Atlas se actualice.',
      '`serverSelectionTimeoutMS` evita esperar 30 segundos cuando algo falla.'
    ],
    code: {
      file: 'src/probarMongo.js',
      lang: 'js',
      start: 16,
      text: `// encodeURIComponent protege los caracteres especiales de la contraseña
const uri =
  \`mongodb+srv://\${encodeURIComponent(MONGO_DB_USERNAME)}:\` +
  \`\${encodeURIComponent(MONGO_DB_PASSWORD)}@cluster0.9y3jazd.mongodb.net/\`

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  serverSelectionTimeoutMS: 10000,
})`,
      hints: {
        1: 'Si la contraseña es `p@ss/1`, sin codificar la URL se rompería. Codificada queda `p%40ss%2F1`.',
        3: 'Aquí va el usuario codificado, seguido de los dos puntos.',
        4: 'La contraseña codificada y, después de la `@`, el host de tu cluster.',
        6: '`new MongoClient` solo crea el cliente: todavía no se conecta.',
        7: '`strict` rechaza comandos fuera de la API estable y `deprecationErrors` convierte lo obsoleto en error.',
        8: 'Si el cluster no responde en 10 segundos, falla. Por defecto esperaría 30.'
      }
    },
    motif: 'stream',
    accent: '#13aa52',
    hints: [
      'Cambia el host por el de tu cluster: es la única parte fija en el código.',
      'La coma final después de la última opción es válida en JavaScript.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · Paso 2',
    title: 'Conectar, hacer ping y listar',
    lead: 'Se abre la conexión, se comprueba con un `ping` y se listan las bases de datos del cluster. Al final siempre se cierra.',
    bullets: [
      '`ping` es el comando más pequeño: si responde, todo funciona.',
      '`listDatabases()` muestra qué bases tiene tu cluster.',
      '`client.close()` cumple el papel de `sql.end()` en `probar.js`.'
    ],
    code: {
      file: 'src/probarMongo.js',
      lang: 'js',
      start: 26,
      text: `try {
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
}`,
      hints: {
        2: '`connect()` abre la conexión con el cluster y devuelve una promesa.',
        3: 'Ejecuta el comando `ping` en la base `admin`. Si responde, las credenciales y la red están bien.',
        6: 'Pide a Atlas la lista de bases de datos del cluster.',
        7: '`map` saca los nombres y `join` los une con comas. Si no hay ninguna, muestra «(ninguna)».',
        9: 'Si algo falla (credenciales, red, IP no permitida), el mensaje llega aquí.',
        12: '`finally` cierra la conexión siempre, haya éxito o error.'
      }
    },
    motif: 'stream',
    accent: '#13aa52',
    hints: [
      'Cambia `client.db(\'admin\')` por otra base si quieres probar su `ping`.',
      'Compara con `probar.js`: misma estructura `try / catch / finally`, otro driver.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · Paso 2',
    title: 'Ejecútalo: npm run probar:mongo',
    lead: 'Dos líneas bastan: la primera confirma la conexión y la segunda lista las bases de tu cluster.',
    bullets: [
      'Tus bases de datos serán otras: dependen de tu cluster.',
      '`admin` y `local` las crea MongoDB. `sample_mflix` es un conjunto de datos de ejemplo que Atlas puede cargar.',
      'Si algo falla, el mensaje empieza por `No se pudo conectar a MongoDB:`.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `$ npm run probar:mongo
Conexión OK a MongoDB Atlas (ping exitoso)
Bases de datos: Auditoria_HHRR, sample_mflix, admin, local`,
      hints: {
        2: 'El `ping` respondió: usuario, contraseña, IP y host son correctos.',
        3: 'Las bases de datos de este cluster. Tu lista será distinta.'
      }
    },
    motif: 'burst',
    accent: '#50e3c2',
    hints: [
      '¡Segunda conexión lograda! Ahora tu programa habla con Supabase y con MongoDB Atlas.',
      'Si tu lista tiene `admin` y `local`, vas por buen camino.'
    ]
  },
  {
    kicker: 'MongoDB Atlas · Errores',
    title: 'Si algo falla en Atlas',
    lead: 'Igual que con Supabase, casi siempre es una credencial o la red.',
    cards: [
      {
        label: 'bad auth: Authentication failed',
        sub: 'Usuario o contraseña incorrectos. Recuerda: es el usuario de **Database Access**, no tu cuenta de Atlas.',
        on: true
      },
      {
        label: 'Server selection timed out',
        sub: 'Atlas no te dejó pasar: tu IP no está en **Network Access**, o no tienes internet. Falla a los 10 segundos por `serverSelectionTimeoutMS`.',
        on: true
      },
      {
        label: 'querySrv ENOTFOUND',
        sub: 'El nombre del cluster está mal escrito o falla el DNS que resuelve `+srv`.',
        on: true
      },
      {
        label: 'Faltan MONGO_DB_USERNAME o MONGO_DB_PASSWORD',
        sub: 'Revisa el `.env`: los nombres deben coincidir exactamente con los del código.',
        on: true
      }
    ],
    cardsWide: true,
    motif: 'scatter',
    accent: '#ff0080',
    hints: [
      'Si cambias de red (de casa a la clase), tu IP cambia: vuelve a agregarla en **Network Access**.',
      'El tiempo de espera de 10 segundos hace que el error llegue más rápido.'
    ]
  },
  {
    kicker: 'Comparación',
    title: 'Dos bases, el mismo proceso',
    lead: 'Compara lo que hicimos en cada script. Cambian los nombres, no los pasos.',
    cards: [
      {
        label: 'Credenciales',
        sub: 'Supabase: `DATABASE_URL` completa. Atlas: usuario y contraseña por separado.',
        on: true
      },
      {
        label: 'Crear el cliente',
        sub: 'Supabase: `postgres(url)`. Atlas: `new MongoClient(uri)`.',
        on: true
      },
      {
        label: 'Comprobar',
        sub: 'Supabase: `select now()`. Atlas: el comando `ping`.',
        on: true
      },
      {
        label: 'Consultar',
        sub: 'Supabase: SQL con la función `sql`. Atlas: métodos como `listDatabases()`.',
        on: true
      },
      {
        label: 'Errores',
        sub: 'En los dos: `try / catch` y `process.exitCode = 1`.',
        on: true
      },
      {
        label: 'Cerrar',
        sub: 'Supabase: `sql.end()`. Atlas: `client.close()`.',
        on: true
      }
    ],
    cardsWide: true,
    motif: 'ring',
    accent: '#7c8cff',
    hints: [
      'Los dos scripts siguen los mismos seis pasos: cargar `.env`, validar, crear cliente, probar, manejar errores y cerrar.',
      'Si aprendiste uno, el otro es casi el mismo con otro vocabulario.'
    ]
  },
  {
    kicker: 'Buenas prácticas',
    title: 'Cuida tus credenciales',
    lead: 'Una base de datos expuesta es un problema grave. Estas reglas te protegen.',
    bullets: [
      '**No subas el `.env` a git.** Si una contraseña se filtró, cámbiala de inmediato.',
      '**Un usuario por proyecto**, con los permisos que necesita y nada más.',
      '**Restringe las IP** en Atlas (**Network Access**) y evita `0.0.0.0/0` fuera de clase.',
      '**Codifica los símbolos** de las contraseñas (`encodeURIComponent` o `%40`).',
      '**No imprimas la URI ni la contraseña** con `console.log`: quedan en los registros.'
    ],
    motif: 'wave',
    accent: '#ff0080',
    hints: [
      'Antes de cada `git commit`, mira `git status`: el `.env` no debe aparecer.',
      'Si subes una contraseña por error, borrar el archivo no basta: hay que cambiar la contraseña.'
    ]
  },
  {
    kicker: 'Siguiente paso',
    title: 'De los simuladores a las bases reales',
    lead: 'En la clase 6 usaste simuladores en memoria de Supabase y MongoDB. Esta clase te dio las conexiones reales para reemplazarlos.',
    bullets: [
      '`db.js` ya es un **Singleton**: un módulo que exporta una sola conexión.',
      'Para MongoDB, el siguiente paso es mover la creación del cliente a su propio módulo, igual que `db.js`.',
      'Los repositorios (**Adapter**) escondían qué base usaban: ahora pueden usar estos clientes reales.'
    ],
    diagram: [
      {
        label: 'Clase 6',
        sub: 'Patrones con simuladores de bases de datos en memoria.'
      },
      {
        label: 'Clase 7 (hoy)',
        sub: 'Conexión real a Supabase y a MongoDB Atlas, con las credenciales en `.env`.'
      },
      {
        label: 'Lo que sigue',
        sub: 'Consultas reales y una API con Express sobre estas conexiones.'
      }
    ],
    motif: 'pipeline',
    accent: '#7928ca',
    hints: [
      'El simulador y el cliente real tienen métodos parecidos: por eso los patrones de la clase 6 siguen sirviendo.',
      'Piensa dónde pondrías `sql` y el `MongoClient` para que toda la API los comparta.'
    ]
  },
  {
    kicker: 'Práctica',
    title: 'Retos para practicar',
    lead: 'Usan lo que ya escribiste. Resuelve al menos uno de cada base de datos.',
    bullets: [
      '**Postgres:** agrega a `probar.js` una consulta que cuente las filas de `"EMPLEADO"` y las muestre.',
      '**Postgres:** inserta un empleado con una consulta `insert` que use `${}` para los valores y léelo con `select`.',
      '**MongoDB:** crea `src/mongoPrueba.js` que inserte un documento en una colección `pruebas` y lo lea con `find()`.',
      '**Refactor:** mueve la creación del `MongoClient` a `src/mongoDb.js` y exporta el cliente, como `db.js`.',
      '**Errores:** cambia una letra de cada contraseña y compara los mensajes de los dos scripts.',
      '**Seguridad:** comprueba con `git status` que tu `.env` no aparece en la lista.'
    ],
    motif: 'grid',
    accent: '#ff0080',
    hints: [
      'Para insertar en PostgreSQL usa `sql` con `insert into mydb."EMPLEADO" (...) values (...)`.',
      'En MongoDB las colecciones se crean solas al insertar el primer documento.'
    ]
  },
  {
    kicker: 'Créditos',
    title: 'Fuentes',
    lead: 'Los scripts de esta clase siguen las guías oficiales de cada proyecto. Consúltalas para ir más lejos.',
    bullets: [
      '**postgres (postgres.js)**, el cliente de PostgreSQL para Node.js: `github.com/porsager/postgres`.',
      '**Supabase:** guías para conectarse a la base de datos (Connect y pooler): `supabase.com/docs`.',
      '**MongoDB:** documentación del driver para Node.js y de Atlas: `mongodb.com/docs`.',
      '**Node.js:** `process.loadEnvFile` en la documentación de `process`: `nodejs.org/api/process.html`.'
    ],
    motif: 'cloud',
    accent: '#0070f3',
    hints: [
      '¡Terminaste! Abre la carpeta `src/` y juega con los tres scripts.',
      'Lee la documentación oficial: tiene ejemplos de inserciones, búsquedas y actualizaciones.'
    ]
  }
];
