/*
 * Contenido de la presentación.
 *
 * Formato de las pestañas del editor (tabs):
 *   kind: 'code'      → archivo con números de línea y resaltado según `lang`
 *   kind: 'terminal'  → líneas que empiezan con "$ " o "> " son comandos (se "escriben"),
 *                       las que empiezan con "# " son comentarios y el resto es salida.
 *   kind: 'preview'   → HTML ya renderizado (vista previa de Markdown)
 *
 * Árbol de archivos (tree): dos espacios por nivel. Marca final opcional:
 *   " +" archivo nuevo · " *" archivo abierto/modificado · " @" enlace simbólico
 *
 * Pistas (hints): `tab` es el índice de la pestaña y `lines` un rango tipo "6-15" o "1-3,20-23".
 * En los textos, `código` se muestra como código y **texto** en negrita.
 */
window.GUIDE = (function () {
  var phases = [
    { id: 'preparar',  name: 'Preparar',  full: 'Preparar el proyecto',  desc: 'Creamos la estructura base del paquete.', steps: [1, 2, 3] },
    { id: 'programar', name: 'Programar', full: 'Código y documentación', desc: 'Escribimos las funciones, el README y la configuración.', steps: [4, 5, 6, 7] },
    { id: 'probar',    name: 'Probar',    full: 'Probar en local',        desc: 'Enlazamos el paquete y lo usamos desde otro proyecto.', steps: [8, 9, 10] },
    { id: 'publicar',  name: 'Publicar',  full: 'Publicar en npm',        desc: 'Subimos a GitHub, nos autenticamos y publicamos.', steps: [11, 12, 13, 14] }
  ];

  var slides = [
    /* ---------------------------------------------------------------- Portada */
    {
      type: 'cover',
      short: 'Portada',
      title: 'Publica tu propio paquete en npm',
      lead: 'Construye **sena-date** paso a paso: desde `npm init` hasta `npm publish`. Catorce pasos, cuatro fases y un paquete real que cualquiera podrá instalar.',
      terminal: [
        '$ npm install sena-date',
        '',
        'added 1 package in 812ms',
        '$ node -e "console.log(require(\'sena-date\').getLongTime())"',
        'lunes, 19 de octubre de 2026, 10:30:00 GMT-5'
      ],
      hints: [
        { text: '¡Hola! Soy **Bit** 👋 Te acompaño en cada paso. Haz clic en mí cuando quieras una pista sobre el código.' },
        { text: 'Avanza con las flechas `←` `→` del teclado, con la barra espaciadora o con los botones de abajo.' },
        { text: 'Pulsa `T` para cambiar entre modo claro y oscuro, e `I` para abrir el índice.' },
        { text: 'Un **paquete npm** es una carpeta con código y un `package.json`. Al publicarlo, cualquiera lo instala con `npm install`.' }
      ]
    },

    /* ---------------------------------------------------------------- Mapa */
    {
      type: 'overview',
      short: 'Ruta',
      title: 'La ruta completa',
      lead: 'Así se ve el camino de una carpeta vacía a un paquete publicado. Haz clic en cualquier paso para ir directo.',
      hints: [
        { text: 'Son **14 pasos** agrupados en **4 fases**. Cada fase cambia el color de acento de la presentación.' },
        { text: 'Las fases 1 y 2 construyen el paquete; la 3 lo prueba en tu computador y la 4 lo publica para el mundo.' },
        { text: 'Puedes saltar a cualquier paso desde aquí o desde el botón **Índice** de arriba.' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 1 */
    {
      type: 'step', step: 1, phase: 0,
      title: 'Inicializa el proyecto',
      lead: 'Todo paquete de Node.js empieza con un `package.json`: la ficha técnica del proyecto. El comando `npm init` lo genera por nosotros.',
      points: [
        '`npm init` crea el archivo `package.json` en la carpeta actual.',
        'La bandera `-y` (*yes*) acepta todos los valores por defecto sin hacer preguntas.',
        'Más adelante editaremos nombre, descripción, autor y licencia.'
      ],
      note: { type: 'tip', text: 'Ejecuta el comando dentro de una carpeta vacía con el nombre de tu paquete, por ejemplo `sena-date`.' },
      editor: {
        tree: ['sena-date/', '  package.json +'],
        tabs: [
          {
            label: 'Terminal', kind: 'terminal', outLang: 'json',
            code: [
              '$ npm init -y',
              'Wrote to /home/aprendiz/sena-date/package.json:',
              '',
              '{',
              '  "name": "sena-date",',
              '  "version": "1.0.0",',
              '  "description": "",',
              '  "main": "index.js",',
              '  "scripts": {',
              '    "test": "echo \\"Error: no test specified\\" && exit 1"',
              '  },',
              '  "keywords": [],',
              '  "author": "",',
              '  "license": "ISC",',
              '  "type": "commonjs"',
              '}'
            ]
          }
        ]
      },
      hints: [
        { text: 'La `-y` significa *yes*: npm responde "sí" por ti a todas las preguntas del asistente.', tab: 0, lines: '1' },
        { text: 'Sin `-y`, npm te pregunta uno a uno: nombre, versión, descripción, punto de entrada… ¡Pruébalo una vez para ver la diferencia!' },
        { text: '`"name"` es el nombre con el que otros instalarán tu paquete. Debe ir en minúsculas y ser único en todo npm.', tab: 0, lines: '5' },
        { text: '`"main"` indica qué archivo se carga al hacer `require()`. Ahora dice `index.js`; en el paso 7 lo cambiaremos a `src/index.js`.', tab: 0, lines: '8' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 2 */
    {
      type: 'step', step: 2, phase: 0,
      title: 'Crea la carpeta src',
      lead: 'Separamos el código fuente en su propia carpeta. Así la raíz queda limpia para la configuración y la documentación.',
      points: [
        '`mkdir` (*make directory*) crea un directorio nuevo.',
        '`src` es la convención para *source*: el código fuente.',
        'En la raíz quedarán `package.json`, `README.md` y otros archivos de configuración.'
      ],
      note: { type: 'tip', text: 'Este comando funciona igual en macOS, Linux, Git Bash y PowerShell.' },
      editor: {
        tree: ['sena-date/', '  src/ +', '  package.json'],
        tabs: [
          {
            label: 'Terminal', kind: 'terminal',
            code: [
              '$ mkdir src',
              '$ ls',
              'package.json  src'
            ]
          }
        ]
      },
      hints: [
        { text: '`mkdir src` crea la carpeta en el lugar donde estás. Revisa siempre tu ubicación con `pwd`.', tab: 0, lines: '1' },
        { text: '`ls` lista el contenido de la carpeta (en CMD de Windows es `dir`). Así compruebas que `src` existe.', tab: 0, lines: '2-3' },
        { text: '¿Carpetas dentro de carpetas? Usa `mkdir -p src/utils` y se crean todas de una vez.' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 3 */
    {
      type: 'step', step: 3, phase: 0,
      title: 'Crea el archivo index.js',
      lead: '`index.js` será el punto de entrada del paquete: el archivo que Node carga cuando alguien lo importa.',
      points: [
        '`touch` crea un archivo vacío (o actualiza su fecha si ya existía).',
        'Desde la raíz indicamos la ruta completa: `src/index.js`.',
        'Si ya estás dentro de `src`, basta con `touch index.js`.'
      ],
      note: { type: 'warn', text: 'En CMD o PowerShell de Windows `touch` no existe. Usa Git Bash o `New-Item src/index.js`.' },
      editor: {
        tree: ['sena-date/', '  src/', '    index.js +', '  package.json'],
        tabs: [
          { label: 'Desde la raíz', kind: 'terminal', code: ['$ touch src/index.js', '$ ls src', 'index.js'] },
          { label: 'Dentro de src', kind: 'terminal', code: ['$ cd src', '$ touch index.js', '$ cd ..'] }
        ]
      },
      hints: [
        { text: 'Las dos pestañas producen el mismo resultado: solo cambia desde qué carpeta ejecutas el comando.' },
        { text: '`cd src` entra a la carpeta y `cd ..` te devuelve a la carpeta padre, la raíz del proyecto.', tab: 1, lines: '1,3' },
        { text: 'En VS Code también puedes crearlo con clic derecho sobre `src` → **Nuevo archivo**. El resultado es idéntico.' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 4 */
    {
      type: 'step', step: 4, phase: 1,
      title: 'Escribe y exporta las funciones',
      lead: 'Nuestro paquete ofrece dos utilidades de fecha. Las definimos y luego las exportamos con `module.exports` (CommonJS) para que otros proyectos puedan usarlas.',
      points: [
        '`getTimeStamp()` devuelve los milisegundos transcurridos desde el 1 de enero de 1970.',
        '`getLongTime()` escribe la fecha actual en texto largo según un idioma (*locale*).',
        '`module.exports` define qué parte del archivo es pública.'
      ],
      editor: {
        tree: ['sena-date/', '  src/', '    index.js *', '  package.json'],
        tabs: [
          {
            label: 'index.js', file: 'src/index.js', kind: 'code', lang: 'js',
            code: [
              'function getTimeStamp(){',
              '    return Date.now();',
              '}',
              '',
              "function getLongTime(locale = 'es-ES'){",
              '    const options = {',
              "        weekday: 'long',",
              "        year: 'numeric',",
              "        month: 'long',",
              "        day: 'numeric',",
              "        hour: 'numeric',",
              "        minute: 'numeric',",
              "        second: 'numeric',",
              "        timeZoneName: 'short'",
              '    };',
              '',
              '    return new Date().toLocaleString(locale, options)',
              '}',
              '',
              'module.exports = {',
              '    getTimeStamp,',
              '    getLongTime',
              '}'
            ]
          },
          {
            label: 'Probar en node', kind: 'terminal',
            code: [
              '$ node',
              "> const fecha = require('./src/index.js')",
              '> fecha.getTimeStamp()',
              '1792423800000',
              '> fecha.getLongTime()',
              "'lunes, 19 de octubre de 2026, 10:30:00 GMT-5'",
              "> fecha.getLongTime('en-US')",
              "'Monday, October 19, 2026 at 10:30:00 AM GMT-5'"
            ]
          }
        ]
      },
      hints: [
        { text: '`Date.now()` devuelve un número como `1792423800000`: los milisegundos desde 1970. Ideal para medir tiempos o guardar fechas.', tab: 0, lines: '1-3' },
        { text: "`locale = 'es-ES'` es un **parámetro por defecto**: si no envías idioma, la función usa español.", tab: 0, lines: '5' },
        { text: 'El objeto `options` le dice a `toLocaleString` qué partes mostrar: día de la semana, mes en letras, hora y zona horaria.', tab: 0, lines: '6-15' },
        { text: '`{ getTimeStamp, getLongTime }` es la forma corta de `{ getTimeStamp: getTimeStamp, … }`. Solo lo exportado es visible desde fuera.', tab: 0, lines: '20-23' },
        { text: "Prueba otros idiomas: `getLongTime('fr-FR')` o `getLongTime('ja-JP')`. Escribe `.exit` para salir de node.", tab: 1, lines: '7-8' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 5 */
    {
      type: 'step', step: 5, phase: 1,
      title: 'Crea el README.md',
      lead: 'El README es la portada de tu paquete: lo primero que la gente verá en npmjs.com y en GitHub.',
      points: [
        'Se crea en la **raíz** del proyecto, junto a `package.json`.',
        'Usa formato Markdown (`.md`): títulos, listas y bloques de código.',
        'npm lo incluye automáticamente al publicar, aunque no lo declares.'
      ],
      editor: {
        tree: ['sena-date/', '  src/', '    index.js', '  package.json', '  README.md +'],
        tabs: [
          { label: 'Terminal', kind: 'terminal', code: ['$ touch README.md', '$ ls', 'README.md  package.json  src'] }
        ]
      },
      hints: [
        { text: 'El nombre en mayúsculas `README.md` es una convención: así GitHub y npm lo encuentran solos.', tab: 0, lines: '1' },
        { text: 'Un buen README responde tres preguntas: ¿qué hace?, ¿cómo se instala? y ¿cómo se usa?' },
        { text: 'Fíjate en el explorador: el archivo nuevo aparece marcado con una **U** (*untracked*), igual que en VS Code.' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 6 */
    {
      type: 'step', step: 6, phase: 1,
      title: 'Escribe la portada del paquete',
      lead: 'Llenamos el README con el nombre, una descripción corta y las instrucciones de instalación.',
      points: [
        '`#` crea un título de nivel 1 y `##` uno de nivel 2.',
        'Los bloques entre tres comillas invertidas muestran código resaltado.',
        'Agregamos una sección **Uso** con un ejemplo: ayuda muchísimo.'
      ],
      note: { type: 'warn', text: 'El comando de instalación correcto es `npm install sena-date` (o `npm i sena-date`). Solo `npm sena-date` da error.' },
      editor: {
        tree: ['sena-date/', '  src/', '    index.js', '  package.json', '  README.md *'],
        tabs: [
          {
            label: 'README.md', file: 'README.md', kind: 'code', lang: 'md',
            code: [
              '# SENA-DATE',
              '',
              'Una utilidad para manejar fechas en formato timestamp y long time',
              '',
              '## Install',
              '',
              '```bash',
              'npm install sena-date',
              '```',
              '',
              '## Uso',
              '',
              '```js',
              "const { getTimeStamp, getLongTime } = require('sena-date');",
              '',
              'getTimeStamp();        // 1792423800000',
              "getLongTime('en-US');  // 'Monday, October 19, 2026 ...'",
              '```'
            ]
          },
          {
            label: 'Vista previa', kind: 'preview',
            html:
              '<h1>SENA-DATE</h1>' +
              '<p>Una utilidad para manejar fechas en formato timestamp y long time</p>' +
              '<h2>Install</h2>' +
              '<pre><code>npm install sena-date</code></pre>' +
              '<h2>Uso</h2>' +
              '<pre><code>const { getTimeStamp, getLongTime } = require(\'sena-date\');\n\ngetTimeStamp();        // 1792423800000\ngetLongTime(\'en-US\');  // \'Monday, October 19, 2026 ...\'</code></pre>'
          }
        ]
      },
      hints: [
        { text: 'Markdown necesita un espacio después de `#`: `#SENA-DATE` no siempre se ve como título, `# SENA-DATE` sí.', tab: 0, lines: '1' },
        { text: 'La palabra que sigue a las tres comillas invertidas (`bash`, `js`) le dice a GitHub y a npm qué lenguaje resaltar.', tab: 0, lines: '7-9' },
        { text: 'La sección **Uso** es opcional pero muy recomendada: muestra en segundos cómo se usa tu paquete.', tab: 0, lines: '11-18' },
        { text: 'Abre la pestaña **Vista previa** para ver cómo lucirá tu portada.', tab: 1 },
        { text: 'npm toma el README al publicar. Si lo cambias, necesitas publicar una nueva versión para verlo actualizado en npmjs.com.' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 7 */
    {
      type: 'step', step: 7, phase: 1,
      title: 'Configura el package.json',
      lead: 'Editamos la ficha técnica del paquete: nombre, versión, descripción, punto de entrada, scripts, palabras clave, autor y licencia.',
      points: [
        '`main` apunta a `src/index.js`: el archivo que se carga con `require(\'sena-date\')`.',
        '`version` sigue *Semantic Versioning*: MAYOR.MENOR.PARCHE.',
        '`keywords` ayuda a que encuentren tu paquete en el buscador de npm.'
      ],
      editor: {
        tree: ['sena-date/', '  src/', '    index.js', '  package.json *', '  README.md'],
        tabs: [
          {
            label: 'package.json', file: 'package.json', kind: 'code', lang: 'json',
            code: [
              '{',
              '  "name": "sena-date",',
              '  "version": "1.0.0",',
              '  "description": "Una utilidad para manejar fechas en formato timestamp y long time",',
              '  "main": "src/index.js",',
              '  "scripts": {',
              '    "test": "echo \\"Error: no test specified\\" && exit 1"',
              '  },',
              '  "keywords": ["date", "nodejs"],',
              '  "author": "Mauricio Rivero <mjrivero@sena.edu.co>",',
              '  "license": "MIT",',
              '  "type": "commonjs"',
              '}'
            ]
          }
        ]
      },
      hints: [
        { text: 'El nombre debe ser único en npm. Búscalo antes en npmjs.com; si ya existe, usa un nombre con alcance como `@tu-usuario/sena-date`.', tab: 0, lines: '2' },
        { text: 'No puedes publicar dos veces la misma versión. Para subir cambios usa `npm version patch` (1.0.0 → 1.0.1).', tab: 0, lines: '3' },
        { text: '`main` es la puerta de entrada: cuando alguien escribe `require(\'sena-date\')`, Node abre este archivo.', tab: 0, lines: '5' },
        { text: 'En `scripts` puedes agregar tus comandos, por ejemplo `"start": "node src/index.js"`, y ejecutarlo con `npm run start`.', tab: 0, lines: '6-8' },
        { text: 'Pon **tu** nombre en `author`. MIT es una licencia libre muy usada: permite que otros reutilicen tu código.', tab: 0, lines: '10-11' },
        { text: '`"type": "commonjs"` indica que usamos `require` y `module.exports`. Para `import`/`export` sería `"module"`.', tab: 0, lines: '12' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 8 */
    {
      type: 'step', step: 8, phase: 2,
      title: 'Enlaza el paquete con npm link',
      lead: 'Antes de publicar lo probamos en local. `npm link` crea un enlace simbólico global que apunta a tu carpeta.',
      points: [
        'Se ejecuta en la **raíz** de `sena-date`.',
        'Crea un acceso directo en la carpeta global de paquetes de npm.',
        'Cualquier cambio en tu código se refleja al instante: no hay que reinstalar.'
      ],
      diagram: 1,
      editor: {
        tree: ['sena-date/', '  src/', '    index.js', '  package.json', '  README.md'],
        tabs: [
          {
            label: 'Terminal', kind: 'terminal',
            code: [
              '$ npm link',
              '',
              'added 1 package, and audited 3 packages in 612ms',
              '',
              'found 0 vulnerabilities',
              '$ npm ls -g --depth=0',
              '/usr/local/lib',
              '├── npm@11.6.2',
              '└── sena-date@1.0.0 -> /home/aprendiz/sena-date'
            ]
          }
        ]
      },
      hints: [
        { text: 'Un **enlace simbólico** (*symlink*) es como un acceso directo: no copia archivos, apunta a los originales.' },
        { text: 'Comprueba el enlace con `npm ls -g --depth=0`. La flecha `->` muestra hacia dónde apunta.', tab: 0, lines: '6-9' },
        { text: 'Si ves un error `EACCES` (permisos), instala Node con **nvm**: evita usar `sudo` con npm.' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 9 */
    {
      type: 'step', step: 9, phase: 2,
      title: 'Conecta tu proyecto principal',
      lead: 'Vamos al proyecto donde usaremos el paquete y creamos ahí el enlace. Es solo para probar: todavía no está publicado.',
      points: [
        '`npm link sena-date` crea `node_modules/sena-date` apuntando a tu carpeta.',
        'El proyecto destino necesita su propio `package.json`.',
        'Para deshacerlo: `npm unlink sena-date`.'
      ],
      diagram: 2,
      editor: {
        tree: ['mi-app/', '  node_modules/', '    sena-date @', '  package.json'],
        tabs: [
          {
            label: 'Terminal', kind: 'terminal',
            code: [
              '$ cd ../mi-app',
              '$ npm link sena-date',
              '',
              'added 1 package, and audited 2 packages in 418ms',
              '$ ls -l node_modules',
              'sena-date -> ../../sena-date'
            ]
          }
        ]
      },
      hints: [
        { text: 'Si `mi-app` aún no tiene `package.json`, créalo primero con `npm init -y`.', tab: 0, lines: '1' },
        { text: 'Si luego ejecutas `npm install` en mi-app, el enlace puede desaparecer. Solo repite `npm link sena-date`.', tab: 0, lines: '2' },
        { text: 'Para limpiar todo: `npm unlink sena-date` en mi-app y `npm unlink -g sena-date` para quitar el enlace global.' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 10 */
    {
      type: 'step', step: 10, phase: 2,
      title: 'Importa y usa el paquete',
      lead: 'Ya podemos traer las funciones: con CommonJS usamos `require` y con módulos ES6 usamos `import`.',
      points: [
        'Se importa por el **nombre del paquete**, no por una ruta.',
        'CommonJS: `require()` es el sistema clásico de Node.',
        'ES Modules: requiere `"type": "module"` en el package.json de mi-app o la extensión `.mjs`.'
      ],
      editor: {
        tree: ['mi-app/', '  node_modules/', '    sena-date @', '  app.js +', '  package.json'],
        tabs: [
          {
            label: 'app.js', file: 'mi-app/app.js', kind: 'code', lang: 'js',
            code: [
              '// CommonJS',
              "const { getTimeStamp, getLongTime } = require('sena-date');",
              '',
              'console.log(getTimeStamp());',
              'console.log(getLongTime());',
              "console.log(getLongTime('en-US'));"
            ]
          },
          {
            label: 'app.mjs', file: 'mi-app/app.mjs', kind: 'code', lang: 'js',
            code: [
              '// ES Modules (ES6)',
              "import { getTimeStamp, getLongTime } from 'sena-date';",
              '',
              'console.log(getTimeStamp());',
              'console.log(getLongTime());',
              "console.log(getLongTime('en-US'));"
            ]
          },
          {
            label: 'Terminal', kind: 'terminal',
            code: [
              '$ node app.js',
              '1792423800000',
              'lunes, 19 de octubre de 2026, 10:30:00 GMT-5',
              'Monday, October 19, 2026 at 10:30:00 AM GMT-5'
            ]
          }
        ]
      },
      hints: [
        { text: 'La **desestructuración** `{ getTimeStamp, getLongTime }` saca del paquete solo las funciones que necesitas.', tab: 0, lines: '2' },
        { text: '¿Error *"Cannot use import statement outside a module"*? Agrega `"type": "module"` al package.json de mi-app o usa la extensión `.mjs`.', tab: 1, lines: '2' },
        { text: 'También puedes traer todo el objeto: `const senaDate = require(\'sena-date\')` y luego `senaDate.getTimeStamp()`.' },
        { text: 'Ejecuta el archivo con `node app.js` y verás la fecha en los dos formatos.', tab: 2, lines: '1-4' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 11 */
    {
      type: 'step', step: 11, phase: 3,
      title: 'Sube el proyecto a GitHub',
      lead: 'Antes de publicar en npm subimos el código a un repositorio de GitHub, para que cualquiera pueda ver el código fuente y reportar errores.',
      points: [
        'Crea en github.com un repositorio vacío llamado `sena-date`.',
        'Un `.gitignore` con `node_modules/` evita subir dependencias.',
        'Enlaza el repositorio en `package.json` con el campo `repository`.'
      ],
      editor: {
        tree: ['sena-date/', '  src/', '    index.js', '  .gitignore +', '  package.json *', '  README.md'],
        tabs: [
          {
            label: 'Terminal', kind: 'terminal',
            code: [
              '$ git init',
              '$ git add .',
              '$ git commit -m "feat: primera versión de sena-date"',
              '$ git branch -M main',
              '$ git remote add origin https://github.com/tu-usuario/sena-date.git',
              '$ git push -u origin main'
            ]
          },
          {
            label: 'package.json', file: 'package.json', kind: 'code', lang: 'json',
            code: [
              '{',
              '  "name": "sena-date",',
              '  "...": "...",',
              '  "repository": {',
              '    "type": "git",',
              '    "url": "git+https://github.com/tu-usuario/sena-date.git"',
              '  },',
              '  "homepage": "https://github.com/tu-usuario/sena-date#readme",',
              '  "bugs": {',
              '    "url": "https://github.com/tu-usuario/sena-date/issues"',
              '  }',
              '}'
            ]
          },
          { label: '.gitignore', file: '.gitignore', kind: 'code', lang: 'plain', code: ['node_modules/', '.env'] }
        ]
      },
      hints: [
        { text: 'Reemplaza `tu-usuario` por tu usuario real de GitHub.', tab: 0, lines: '5' },
        { text: 'npm no exige GitHub, pero con `repository` tu página en npmjs.com mostrará el enlace a tu código.', tab: 1, lines: '4-7' },
        { text: 'Escribe mensajes de commit claros con prefijos como `feat:`, `fix:` o `docs:` (*Conventional Commits*).', tab: 0, lines: '3' },
        { text: 'Nunca subas secretos: `.env` va en el `.gitignore`.', tab: 2, lines: '2' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 12 */
    {
      type: 'step', step: 12, phase: 3,
      title: 'Autentícate en npm',
      lead: 'Para publicar necesitas una cuenta en npmjs.com. Luego conectas tu terminal con esa cuenta.',
      points: [
        'Crea tu cuenta gratis en `npmjs.com/signup` y verifica tu correo.',
        'Si ya tienes sesión en el navegador, npm lo abrirá para autenticarte.',
        'En versiones recientes de npm el comando es `npm login`.'
      ],
      editor: {
        tabs: [
          {
            label: 'npm adduser', kind: 'terminal',
            code: [
              '$ npm adduser',
              'npm notice Log in on https://registry.npmjs.org/',
              'Login at:',
              'https://www.npmjs.com/login?next=/login/cli/…',
              'Press ENTER to open in the browser...',
              '',
              'Logged in on https://registry.npmjs.org/.'
            ]
          },
          {
            label: 'npm login', kind: 'terminal',
            code: [
              '$ npm login',
              'npm notice Log in on https://registry.npmjs.org/',
              'Press ENTER to open in the browser...',
              '',
              'Logged in on https://registry.npmjs.org/.',
              '$ npm whoami',
              'tu-usuario'
            ]
          }
        ]
      },
      hints: [
        { text: '`npm adduser` y `npm login` hacen lo mismo en npm moderno: abren el navegador para iniciar sesión.' },
        { text: '`npm whoami` te dice con qué cuenta está conectada tu terminal.', tab: 1, lines: '6-7' },
        { text: 'Activa la **verificación en dos pasos (2FA)** desde tu perfil en npmjs.com: la necesitarás al publicar.' },
        { text: 'Para cerrar la sesión en la terminal usa `npm logout`.' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 13 */
    {
      type: 'step', step: 13, phase: 3,
      title: 'Ensaya con --dry-run',
      lead: 'Antes de publicar de verdad hacemos un simulacro: `--dry-run` muestra exactamente qué se enviaría a npm, sin subir nada.',
      points: [
        'Revisa el nombre, la versión y los archivos incluidos.',
        'Verifica que no se cuelen archivos privados como `.env`.',
        'Si algo está mal, corrígelo y repite el ensayo.'
      ],
      editor: {
        tabs: [
          {
            label: 'Terminal', kind: 'terminal',
            code: [
              '$ npm publish --dry-run',
              'npm notice',
              'npm notice 📦  sena-date@1.0.0',
              'npm notice Tarball Contents',
              'npm notice 116B README.md',
              'npm notice 369B package.json',
              'npm notice 438B src/index.js',
              'npm notice Tarball Details',
              'npm notice name: sena-date',
              'npm notice version: 1.0.0',
              'npm notice filename: sena-date-1.0.0.tgz',
              'npm notice package size: 627 B',
              'npm notice unpacked size: 923 B',
              'npm notice total files: 3',
              'npm notice',
              '+ sena-date@1.0.0'
            ]
          }
        ]
      },
      hints: [
        { text: '**Tarball Contents** es la lista exacta de archivos que se publicarán. ¡Revísala con lupa!', tab: 0, lines: '4-7' },
        { text: 'Controla qué se publica con `"files": ["src"]` en package.json o con un archivo `.npmignore`.' },
        { text: '`npm pack` crea el archivo `.tgz` en tu carpeta para que lo inspecciones antes de publicar.' },
        { text: 'Tu paquete pesa **627 B**: ¡menos de un kilobyte! Los paquetes pequeños se instalan más rápido.', tab: 0, lines: '12-13' }
      ]
    },

    /* ---------------------------------------------------------------- Paso 14 */
    {
      type: 'step', step: 14, phase: 3, celebrate: true,
      title: 'Publica en npm',
      lead: '¡Llegó el momento! `npm publish` empaqueta tu proyecto y lo sube al registro público de npm.',
      points: [
        'Tu paquete quedará en `npmjs.com/package/sena-date`.',
        'Cualquiera podrá instalarlo con `npm install sena-date`.',
        'En WSL, si el inicio de sesión falla, usa `npm login --auth-type=legacy`.'
      ],
      note: { type: 'warn', text: 'La autenticación de dos factores (2FA) debe estar activa en tu cuenta de npm; si no, la publicación fallará.' },
      editor: {
        tabs: [
          {
            label: 'npm publish', kind: 'terminal',
            code: [
              '$ npm publish',
              'npm notice 📦  sena-date@1.0.0',
              'npm notice total files: 3',
              'npm notice Publishing to https://registry.npmjs.org/',
              '+ sena-date@1.0.0'
            ]
          },
          {
            label: 'WSL', kind: 'terminal',
            code: [
              '# Windows Subsystem for Linux',
              '$ npm login --auth-type=legacy',
              'npm notice Log in on https://registry.npmjs.org/',
              'Username: tu-usuario',
              'Password: ********',
              'Enter one-time password: 123456',
              'Logged in on https://registry.npmjs.org/.'
            ]
          },
          {
            label: 'Errores comunes', kind: 'terminal',
            code: [
              '# El nombre ya existe o no es tuyo',
              'npm error code E403',
              'npm error 403 You do not have permission to publish "sena-date".',
              '',
              '# Falta el código de la verificación en dos pasos',
              'npm error code EOTP',
              'npm error This operation requires a one-time password.',
              '$ npm publish --otp=123456'
            ]
          }
        ]
      },
      hints: [
        { text: '¡Felicidades! 🎉 La línea `+ sena-date@1.0.0` confirma que tu paquete ya está publicado.', tab: 0, lines: '5' },
        { text: '**WSL** es el subsistema de Linux para Windows. Ahí a veces falla el login por navegador; `--auth-type=legacy` pide usuario y contraseña en la terminal.', tab: 1, lines: '2' },
        { text: 'Error `E403`: el nombre ya existe. Renómbralo a `@tu-usuario/sena-date` y publica con `npm publish --access public`.', tab: 2, lines: '1-3' },
        { text: 'Error `EOTP`: npm necesita el código de tu app de autenticación. Agrégalo con `--otp`.', tab: 2, lines: '5-8' },
        { text: 'Para publicar cambios: `npm version patch` y otra vez `npm publish`. Cada versión se publica una sola vez.' }
      ]
    },

    /* ---------------------------------------------------------------- Cierre */
    {
      type: 'final',
      short: 'Resumen',
      title: 'Tu paquete ya vive en npm',
      lead: 'Recorriste el ciclo completo de un paquete: crearlo, documentarlo, probarlo en local y publicarlo. Aquí tienes todos los comandos en un solo lugar.',
      achievements: [
        'Creaste un paquete con `package.json` y `src/index.js`',
        'Exportaste funciones con `module.exports`',
        'Documentaste el paquete con un `README.md`',
        'Lo probaste en local con `npm link`',
        'Lo publicaste con `npm publish`'
      ],
      cheatsheet: [
        '# 1 · Preparar',
        '$ npm init -y',
        '$ mkdir src',
        '$ touch src/index.js',
        '# 2 · Programar',
        '$ touch README.md',
        '# 3 · Probar en local',
        '$ npm link',
        '$ npm link sena-date',
        '# 4 · Publicar',
        '$ git push -u origin main',
        '$ npm login',
        '$ npm publish --dry-run',
        '$ npm publish'
      ],
      hints: [
        { text: '¡Lo lograste! 🚀 Ahora prueba instalar tu propio paquete en un proyecto nuevo con `npm install`.' },
        { text: 'Siguiente reto: agrega pruebas con `node --test` y publica la versión `1.0.1`.' },
        { text: 'Puedes copiar todos los comandos con el botón del editor y guardarlos como chuleta.' }
      ]
    }
  ];

  return { phases: phases, slides: slides };
})();
