# Clases de Node.js · SENA 2026

Material de las clases de Node.js del **Tecnólogo en Análisis y Desarrollo de Software · Ficha 3406211**.

Cada clase es una carpeta numerada con dos partes:

- **El código** del proyecto que se construye en clase.
- **Una presentación interactiva** que explica, paso a paso, cómo construirlo.

En la raíz hay una **landing** (`index.html`) que reúne las seis presentaciones en tarjetas, cada una con su enlace a la presentación y a su código.

## Contenido

- [Las clases](#las-clases)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Ver las presentaciones](#ver-las-presentaciones)
- [Detalle de cada clase](#detalle-de-cada-clase)
- [Configurar los enlaces de la landing](#configurar-los-enlaces-de-la-landing)
- [Agregar una clase nueva](#agregar-una-clase-nueva)

## Las clases

| # | Carpeta | Qué construyes | Conceptos clave | Diapositivas |
|---|---------|----------------|-----------------|:------------:|
| 0 | [`0_Primer_Programa`](0_Primer_Programa) | "Hola Mundo" y un generador de números aleatorios | `mkdir`, `git init`, `npm init`, `process.argv` | 11 |
| 1 | [`1_module_vs_common`](1_module_vs_common) | Cuatro ejemplos de módulos | CommonJS, ES Modules, módulos nativos, paquetes externos | 14 |
| 2 | [`2_npm`](2_npm) | Un encriptador con `object-hash` | `npm init`, `npm install`, `import`, scripts de npm | 14 |
| 3 | [`3_publicar_paquete_npm`](3_publicar_paquete_npm) | El paquete `sena-date`, publicado en npm | `npm link`, `README.md`, `npm login`, `npm publish` | 17 |
| 4 | [`4_crear_leer_archivos`](4_crear_leer_archivos) | Un programa que crea, lee, actualiza y borra un archivo | módulo `fs` (versiones `Sync`) | 16 |
| 5 | [`5_leer_archivos_audio`](5_leer_archivos_audio) | Un transcriptor de audio con Whisper de NVIDIA | gRPC, archivos `.proto`, variables de entorno (`.env`) | 26 |

## Estructura del repositorio

```text
.
├── index.html                     # Landing: tarjetas con presentación y código de cada clase
├── assets/                        # Estilos, scripts y fuentes de la landing
├── 0_Primer_Programa/
│   ├── pasos.md                   # Guion escrito de la clase
│   ├── primer_programa/           # Proyecto (src/index.js)
│   └── dispositivas_instruccion/  # Presentación
├── 1_module_vs_common/
│   ├── package.json
│   ├── src/
│   │   ├── commonJS/              # require + module.exports
│   │   ├── esModulesJS/           # import + export
│   │   ├── native/                # módulo nativo fs
│   │   └── externalModule/        # paquete de npm (is-odd)
│   └── diapositivas_instruccion/  # Presentación
├── 2_npm/                         # package.json, pasos.md, src/index.js, presentación
├── 3_publicar_paquete_npm/        # package.json, README.md, pasos.md, src/index.js, presentación
├── 4_crear_leer_archivos/         # package.json, pasos.md, src/fs.js, presentación
└── 5_leer_archivos_audio/
    ├── package.json
    ├── src/
    │   ├── transcriptOpenAI.js    # Cliente gRPC que transcribe el audio
    │   ├── audio/audio.mp3        # Audio de ejemplo
    │   └── proto/                 # Definiciones .proto de NVIDIA Riva
    └── dispositivas_instruccion/  # Presentación
```

Cada clase es un proyecto independiente: tiene su propio `package.json` y se instala y ejecuta por separado.

## Requisitos

- **Node.js 20.12 o superior** y **npm** (que viene con Node.js). Comprueba tu versión con `node -v`. Las clases 0 a 4 funcionan con cualquier versión LTS reciente; la clase 5 usa `process.loadEnvFile`, que existe desde la 20.12.
- Un navegador moderno para ver las presentaciones.
- **Clase 3:** una cuenta en [npmjs.com](https://www.npmjs.com) con verificación en dos pasos activa, y una cuenta de GitHub.
- **Clase 5:** una clave de API de NVIDIA (se obtiene en [build.nvidia.com](https://build.nvidia.com/openai/whisper-large-v3)) y `afconvert` (viene con macOS) o `ffmpeg` para convertir el audio a WAV.

## Ver las presentaciones

La forma más cómoda es abrir la landing:

```bash
# Opción 1: abrir index.html directamente en el navegador
# Opción 2: servir la carpeta (recomendado)
npx serve .
# o, sin instalar nada:
python3 -m http.server 8000     # y abrir http://localhost:8000
```

Cada tarjeta de la landing tiene dos botones: **Ver presentación** (abre las diapositivas) y **Código** (abre la carpeta de la clase).

Dentro de una presentación:

- Navega con las flechas **←** y **→** (o con los botones de la pantalla).
- Un robot te acompaña con consejos. En las clases 2 a 5 puedes hacer clic en él para pedir una pista sobre el código.
- Las presentaciones de las clases 2 a 5 y la landing cambian entre tema claro y oscuro con la tecla **T**.
- Las clases 0 y 5 incluyen todo lo que necesitan. Las clases 1 a 4 cargan la tipografía Geist (y, en las clases 1 y 4, three.js) desde internet, así que necesitan conexión para verse como fueron diseñadas.

## Detalle de cada clase

Presentación de cada clase: `<carpeta>/dispositivas_instruccion/index.html` (la clase 1 usa `diapositivas_instruccion`).

### Clase 0 · Primer programa

Crea la carpeta del proyecto, inicializa `git` y `npm`, escribe un "Hola Mundo" y termina con un programa que genera un número aleatorio dentro de un rango recibido por la terminal. El guion está en [`pasos.md`](0_Primer_Programa/pasos.md).

```bash
cd 0_Primer_Programa/primer_programa
node src/index.js          # rango por defecto: 1 a 100
node src/index.js 1 10     # número aleatorio entre 1 y 10
```

### Clase 1 · Módulos: CommonJS vs ES Modules

Un mismo proyecto con cuatro maneras de traer código:

| Carpeta | Qué muestra |
|---------|-------------|
| `src/commonJS` | `require()` y `module.exports` |
| `src/esModulesJS` | `import` y `export` (módulo en `math.mjs`) |
| `src/native` | Módulo nativo `fs` con `readFile` y callback |
| `src/externalModule` | Paquete externo de npm (`is-odd`) |

```bash
cd 1_module_vs_common
npm install                          # instala is-odd
node src/esModulesJS/main.js
node src/externalModule/main.js
cd src/native && node native.js      # lee archivoTexto.txt de su propia carpeta
```

> **Notas.** El `package.json` de esta clase declara `"type": "module"`, así que Node.js trata todos los `.js` como ES Modules y `src/commonJS/main.js` (que usa `require`) falla con `require is not defined in ES module scope`. Para ejecutarlo, agrega un `package.json` con `{ "type": "commonjs" }` dentro de `src/commonJS/`.
> Además, `native.js` abre `./archivoTexto.txt` relativo a la carpeta desde donde ejecutas el comando, por eso debe correrse desde `src/native`.

### Clase 2 · npm: un encriptador

Inicializa un proyecto con `npm init`, instala [`object-hash`](https://www.npmjs.com/package/object-hash), lo importa con `import` y genera hashes de una persona (un objeto) y de su nombre, con SHA-1 por defecto y con MD5 en base64. Los datos se leen de la terminal con `process.argv`. El guion está en [`pasos.md`](2_npm/pasos.md).

```bash
cd 2_npm
npm install
npm start -- mauricio hombre colombia 30 ana luis
#            nombre  género  nacionalidad edad  amigos...
```

> Un hash no es cifrado: no se puede revertir, solo comparar. La presentación termina explicando esa diferencia.

### Clase 3 · Publicar un paquete en npm

Construye `sena-date`, un paquete con dos funciones (`getTimeStamp()` y `getLongTime(locale)`), lo prueba en local con `npm link` y lo publica en npm. El recorrido completo (inicializar, `README.md`, `package.json`, `npm link`, GitHub, `npm login`, `npm publish --dry-run` y `npm publish`) está en [`pasos.md`](3_publicar_paquete_npm/pasos.md).

```bash
cd 3_publicar_paquete_npm
node -e "const d = require('./src'); console.log(d.getTimeStamp(), d.getLongTime())"
```

> Para publicar, el nombre del paquete en `package.json` debe estar libre en npm y tu cuenta debe tener la verificación en dos pasos activa.

### Clase 4 · Crear y leer archivos

Recorre el ciclo de vida de un archivo con el módulo nativo `fs`: crearlo (`writeFileSync`), leerlo (`readFileSync`), agregarle texto (`appendFileSync`) y borrarlo (`unlinkSync`). El guion también propone dos retos: copiar el archivo a otra carpeta antes de borrarlo, y moverlo a una ruta absoluta. Están en [`pasos.md`](4_crear_leer_archivos/pasos.md) y se trabajan en la presentación.

```bash
cd 4_crear_leer_archivos
node src/fs.js
```

El programa crea `ejemplo.txt` en la carpeta desde la que lo ejecutas y lo elimina al terminar.

### Clase 5 · Transcribir audio con Node.js

Lee `src/audio/audio.mp3`, lo convierte a WAV de 16 kHz (con `afconvert` o `ffmpeg`), lo envía por **gRPC** al servicio de reconocimiento de voz de NVIDIA Riva que sirve Whisper large-v3 y guarda la transcripción junto al audio como `audio_transcription.txt`. El cliente se arma con `@grpc/grpc-js` y `@grpc/proto-loader` a partir de los archivos `.proto` de `src/proto/`. Whisper es un modelo de OpenAI que NVIDIA aloja y expone por gRPC.

```bash
cd 5_leer_archivos_audio
npm install
```

Crea un archivo `.env` en esa carpeta con tu clave:

```text
NVIDIA_API_KEY=tu_clave_de_nvidia
# LANGUAGE_CODE=es-US    (opcional; por defecto en-US)
```

```bash
node src/transcriptOpenAI.js
```

> **No subas el `.env` a git.** Guarda una clave privada y ya está excluido en el [`.gitignore`](.gitignore) de la raíz.

## Configurar los enlaces de la landing

Las tarjetas enlazan a la presentación con rutas relativas, así que funcionan donde sea que se sirva el repositorio. El botón **Código** necesita saber dónde está el repositorio:

- **GitHub Pages:** no tienes que hacer nada. Si publicas el sitio desde la raíz de la rama, la landing deduce la URL del repositorio (`https://github.com/<usuario>/<repositorio>`) y apunta cada botón a `…/tree/HEAD/<carpeta>`.
- **Cualquier otro lugar:** escribe la URL en `REPO_URL`, al inicio de [`assets/landing.js`](assets/landing.js):

  ```js
  var REPO_URL = 'https://github.com/usuario/repositorio';
  ```

- **Sin URL:** los botones **Código** abren las carpetas locales y el botón **Repositorio** de la landing se oculta.

## Agregar una clase nueva

1. Crea la carpeta `N_nombre_de_la_clase/` con su proyecto y su presentación (`diapositivas_instruccion/index.html`).
2. En [`index.html`](index.html), copia uno de los `<li>` de la lista de tarjetas y cambia la carpeta en los dos enlaces, el título, la descripción, las etiquetas, el fragmento de código, los colores (`--accent` para el tema oscuro y `--accent-l` para el claro) y `data-slides`.
3. Los totales del encabezado ("6 clases · 98 diapositivas") se recalculan solos.

## Autor

Mauricio Rivero · SENA
