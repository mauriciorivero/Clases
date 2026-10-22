/*
  Contenido de las diapositivas.
  Cada diapositiva puede tener:
    kicker / title / lead / bullets  -> texto (admite `codigo` y **negrita**)
    motif                            -> animacion de fondo en Three.js (ver app.js)
    accent                           -> color de acento
    diagram                          -> flujo de cajas (solo la diapositiva 2)
    code                             -> { file, lang, start, text, marks, hints }
        lang:  js | bash | term | env | tree
        marks: { numeroDeLinea: 'add' | 'del' }
        hints: { numeroDeLinea: 'pista que dice el avatar al hacer clic en esa linea' }
    hints                            -> pistas del avatar para esta diapositiva
  Los fragmentos de codigo salen de src/transcriptOpenAI.js (los numeros de linea coinciden).
*/
window.SLIDES = [
  {
    type: 'title',
    kicker: 'Clase 5 · Node.js',
    title: 'Transcribe audio con Node.js',
    lead: 'Vamos a leer un archivo de audio, enviarlo al modelo **Whisper** de NVIDIA y guardar la transcripción en un archivo de texto. Paso a paso.',
    motif: 'cloud',
    accent: '#0070f3',
    hints: [
      '¡Hola! Soy **Byte**. Haz clic en mí cuando quieras una pista sobre el código.',
      'Usa las flechas ← → del teclado para moverte entre diapositivas.',
      'También puedes hacer clic en cualquier línea de código marcada con un punto.'
    ]
  },
  {
    kicker: 'Visión general',
    title: 'Qué vamos a construir',
    lead: 'Una sola función, `transcribirAudio`, que recorre cuatro etapas. Cada diapositiva siguiente construye una parte.',
    diagram: [
      { label: 'audio.mp3', sub: 'archivo de entrada' },
      { label: 'WAV 16 kHz', sub: 'conversión con afconvert / ffmpeg' },
      { label: 'gRPC + Whisper', sub: 'servidor de NVIDIA' },
      { label: 'audio_transcription.txt', sub: 'texto resultante' }
    ],
    motif: 'pipeline',
    accent: '#7928ca',
    hints: [
      'El servicio no acepta MP3, por eso la etapa de conversión a WAV es obligatoria.',
      'Fíjate: son solo 4 etapas. Si entiendes una, entiendes todo el flujo.'
    ]
  },
  {
    kicker: 'Preparación',
    title: 'Crea el proyecto',
    lead: 'Una carpeta, un `package.json` y dos dependencias de gRPC. Los archivos `.proto` describen el servicio de NVIDIA.',
    bullets: [
      '`@grpc/grpc-js` es el cliente gRPC para Node.',
      '`@grpc/proto-loader` lee los `.proto` en tiempo de ejecución.',
      'El audio de prueba vive en `src/audio/`.',
      'La carpeta `proto/` **no** la crea npm: los `.proto` se descargan aparte (ver «Descarga los `.proto`»).'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `$ mkdir 5_leer_archivos_audio && cd 5_leer_archivos_audio
$ npm init -y
$ npm install @grpc/grpc-js @grpc/proto-loader

# estructura final
5_leer_archivos_audio/
├── package.json
├── .env
└── src/
    ├── transcriptOpenAI.js
    ├── audio/
    │   └── audio.mp3
    └── proto/riva/proto/
        ├── riva_asr.proto
        ├── riva_audio.proto
        └── riva_common.proto`,
      hints: {
        3: 'No necesitas `axios` ni `node-fetch`: el servicio de NVIDIA habla gRPC, no HTTP simple.',
        13: 'Esta carpeta no la crea `npm install`: los `.proto` se descargan de GitHub y deben quedar en `riva/proto/`, porque se importan entre sí con esa ruta.'
      }
    },
    motif: 'grid',
    accent: '#50e3c2',
    hints: [
      'Los tres `.proto` salen del repositorio `nvidia-riva/common` en GitHub, no de npm.',
      '`npm init -y` crea el package.json con valores por defecto.'
    ]
  },
  {
    kicker: 'Credenciales',
    title: 'Guarda tu API key en `.env`',
    lead: 'La clave se obtiene en build.nvidia.com y **nunca** se escribe dentro del código. Se lee de una variable de entorno.',
    bullets: [
      '`.env` vive en la raíz, junto al `package.json`.',
      '`.gitignore` evita que la clave llegue a un repositorio.',
      '`LANGUAGE_CODE` es opcional; por defecto es `en-US`.'
    ],
    code: {
      file: '.env',
      lang: 'env',
      text: `NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxxxxx
# LANGUAGE_CODE=es-US`,
      hints: {
        1: 'Reemplaza los x por tu clave real. Si la compartes por error, genera otra y revoca la anterior.',
        2: 'Quita el # para transcribir audio en español.'
      }
    },
    motif: 'ring',
    accent: '#f5a623',
    hints: [
      'Una clave en el código termina tarde o temprano en un repositorio público. ¡Evítalo!',
      'Si compartes tu clave por accidente, revócala y genera otra.'
    ]
  },
  {
    kicker: 'Paso 1',
    title: 'Importa los módulos',
    lead: 'Tres módulos nativos para archivos y rutas, `child_process` para convertir audio, y las dos librerías gRPC.',
    bullets: [
      '`fs` lee y escribe archivos.',
      '`path` construye rutas que funcionan en cualquier sistema operativo.',
      '`execFileSync` ejecuta un programa externo (el conversor de audio).'
    ],
    code: {
      file: 'src/transcriptOpenAI.js',
      lang: 'js',
      start: 1,
      text: `//paso 1 declaramos las constantes con los modulos que necesitamos
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');`,
      hints: {
        2: '`fs` = File System. Lo usamos para comprobar que el audio existe y para guardar el texto.',
        3: '`os.tmpdir()` nos dará una carpeta temporal para el WAV convertido.',
        4: '`path` evita escribir rutas con `/` o `\\` a mano.',
        5: 'Con las llaves `{ }` sacamos solo la función que necesitamos del módulo.'
      }
    },
    motif: 'ring',
    accent: '#0070f3',
    hints: [
      '`require` carga un módulo. Es la forma CommonJS de importar.',
      'Las dos librerías gRPC son las únicas que instalaste con npm.'
    ]
  },
  {
    kicker: 'Cómo habla el servicio',
    title: 'El servicio es gRPC',
    lead: 'NVIDIA publica Whisper a través de **gRPC** (Riva). En vez de rutas HTTP como `/v1/...`, el servicio expone **métodos remotos** descritos en un archivo `.proto`.',
    bullets: [
      'Se llega por un servidor y un puerto: `grpc.nvcf.nvidia.com:443`.',
      '`Recognize` envía el audio completo y espera la transcripción.',
      'La autenticación viaja en metadatos, como las cabeceras en HTTP.'
    ],
    code: {
      file: 'src/proto/riva/proto/riva_asr.proto',
      lang: 'proto',
      start: 33,
      text: `service RivaSpeechRecognition {
  // Recognize expects a RecognizeRequest and returns a RecognizeResponse. This
  // request will block until the audio is uploaded, processed, and a transcript
  // is returned.
  rpc Recognize(RecognizeRequest) returns (RecognizeResponse) {}`,
      hints: {
        1: 'Este es el nombre del servicio. El código lo usará más adelante para crear el cliente.',
        5: '`rpc` declara un método remoto: recibe un `RecognizeRequest` y devuelve un `RecognizeResponse`.'
      }
    },
    motif: 'pipeline',
    accent: '#ff0080',
    hints: [
      'gRPC usa HTTP/2 y mensajes binarios definidos en archivos `.proto`.',
      'En la pestaña API del modelo, en build.nvidia.com, aparecen el servidor gRPC y el function-id.'
    ]
  },
  {
    kicker: 'Paso 2',
    title: 'Apunta al servidor gRPC',
    lead: 'Para conectarnos necesitamos un **servidor** y un **function-id**, que le dice a NVIDIA qué función ejecutar: Whisper.',
    bullets: [
      'Dirección: `grpc.nvcf.nvidia.com:443`.',
      'El function-id identifica al modelo `whisper-large-v3`.',
      'Los valores van en constantes en mayúsculas.'
    ],
    code: {
      file: 'src/transcriptOpenAI.js',
      lang: 'js',
      start: 9,
      text: `/*
paso 2 el API de NVIDIA para whisper-large-v3 NO es REST, es gRPC (Riva).
Por eso no existe una URL para usar con fetch: nos conectamos a un servidor gRPC
y le indicamos que funcion queremos usar con el function-id
(https://build.nvidia.com/openai/whisper-large-v3/api)
*/
const NVIDIA_SERVER = 'grpc.nvcf.nvidia.com:443';
const WHISPER_FUNCTION_ID = 'b702f636-f60c-4a3d-a6f4-f3568c13bd7d';`,
      hints: {
        7: '443 es el puerto de las conexiones seguras (TLS).',
        8: 'Este identificador es público; lo que debes proteger es tu API key.'
      }
    },
    motif: 'stream',
    accent: '#7928ca',
    hints: [
      'gRPC usa HTTP/2 y mensajes binarios definidos en archivos `.proto`.',
      'Piensa en el function-id como el "número de extensión" del modelo.'
    ]
  },
  {
    kicker: 'Paso 3',
    title: 'Carga el archivo `.proto`',
    lead: 'El `.proto` describe qué métodos tiene el servicio y cómo son sus mensajes. `proto-loader` lo convierte en un objeto de JavaScript.',
    bullets: [
      '`loadSync` lee el `.proto` y sus imports.',
      '`includeDirs` indica dónde buscar los archivos importados.',
      '`rasr` queda listo para crear el cliente del servicio.'
    ],
    code: {
      file: 'src/transcriptOpenAI.js',
      lang: 'js',
      start: 18,
      text: `//paso 3 cargamos la definicion del servicio de reconocimiento de voz desde los archivos .proto
const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, 'proto', 'riva', 'proto', 'riva_asr.proto'),
    { keepCase: true, longs: String, enums: String, defaults: true, includeDirs: [path.join(__dirname, 'proto')] }
);
const rasr = grpc.loadPackageDefinition(packageDefinition).nvidia.riva.asr;`,
      hints: {
        3: '`__dirname` es la carpeta del archivo actual: así la ruta funciona desde cualquier lugar.',
        4: '`keepCase: true` conserva nombres como `sample_rate_hertz` tal cual están en el `.proto`.',
        6: '`nvidia.riva.asr` es el `package` declarado dentro de `riva_asr.proto`.'
      }
    },
    motif: 'rows',
    accent: '#50e3c2',
    hints: [
      'Si cambias los `.proto` de carpeta, este código dejará de encontrarlos.',
      '`loadSync` bloquea un instante al arrancar, y eso está bien: ocurre una sola vez.',
      'En las siguientes diapositivas verás qué contiene cada uno de los tres `.proto`.'
    ]
  },
  {
    kicker: 'Carpeta proto/',
    title: 'Los tres archivos `.proto`',
    lead: 'Un `.proto` es el **contrato** entre tu programa y el servidor: dice qué métodos existen y qué campos lleva cada mensaje. NVIDIA lo reparte en tres archivos para no repetir definiciones.',
    bullets: [
      'Los tres son de NVIDIA (repositorio `nvidia-riva/common`) y no se modifican.',
      'Solo cargamos `riva_asr.proto`; los otros dos entran por `import`.',
      'Los tres deben estar juntos en `src/proto/riva/proto/`.'
    ],
    diagram: [
      { label: 'riva_asr.proto', sub: 'El archivo principal. Declara el servicio `RivaSpeechRecognition` y los mensajes que viajan: `RecognizeRequest`, `RecognitionConfig` y `RecognizeResponse`. Es el que carga `loadSync`.' },
      { label: 'riva_audio.proto', sub: 'Declara `AudioEncoding`, la lista de formatos de audio válidos (`LINEAR_PCM`, `FLAC`, `OGGOPUS`…). Lo usa el campo `encoding` de `RecognitionConfig`.' },
      { label: 'riva_common.proto', sub: 'Declara `RequestId`, un mensaje compartido para identificar una petición. Lo reutilizan las peticiones y respuestas de `riva_asr.proto`.' }
    ],
    motif: 'grid',
    accent: '#50e3c2',
    hints: [
      'Piensa en `riva_asr.proto` como el jefe y en los otros dos como sus ayudantes.',
      'Estos archivos son como un diccionario compartido: cliente y servidor usan las mismas palabras.',
      'No tienes que memorizarlos: lo importante es saber qué contiene cada uno.'
    ]
  },
  {
    kicker: 'Origen de los .proto',
    title: 'Los `.proto` no vienen de npm',
    lead: '`npm install` solo instala **código** dentro de `node_modules`. Los `.proto` son el **contrato del servicio** y NVIDIA los publica aparte, en GitHub.',
    bullets: [
      'Por eso la carpeta `src/proto/` no aparece sola después de `npm install`.',
      'Hay que descargarlos una vez y guardarlos en el proyecto.',
      'Así cliente y servidor hablan con las mismas definiciones.'
    ],
    diagram: [
      { label: '@grpc/proto-loader  ·  npm', sub: 'Un **lector**: sabe interpretar archivos `.proto`, pero no trae ninguno del servicio de NVIDIA. Queda en `node_modules`.' },
      { label: '@grpc/grpc-js  ·  npm', sub: 'El **cliente de red**: abre la conexión gRPC y envía los mensajes. También queda en `node_modules`.' },
      { label: 'nvidia-riva/common  ·  GitHub', sub: 'El repositorio **oficial** de NVIDIA (licencia MIT). Ahí están `riva_asr.proto`, `riva_audio.proto` y `riva_common.proto`.' }
    ],
    motif: 'stream',
    accent: '#0070f3',
    hints: [
      'Piensa en `proto-loader` como un lector de PDF: sabe abrir el formato, pero el documento lo trae otro.',
      'Puedes comprobarlo: busca archivos `.proto` dentro de `node_modules/@grpc/proto-loader`. No hay ninguno.',
      'El proveedor del servicio (NVIDIA) es quien define y publica su contrato.'
    ]
  },
  {
    kicker: 'Consíguelos',
    title: 'Descarga los `.proto`',
    lead: 'Se crean las carpetas con la misma estructura que usan los `import` y se bajan los tres archivos desde el repositorio oficial.',
    bullets: [
      '`mkdir -p` crea todas las carpetas intermedias de una vez.',
      '`curl -O` guarda cada archivo con su nombre original.',
      'El repositorio tiene más archivos (`riva_tts`, `riva_nlp`…); aquí solo hacen falta tres.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `# 1. carpetas con la misma estructura que usan los import
$ mkdir -p src/proto/riva/proto
$ cd src/proto/riva/proto

# 2. los tres archivos desde el repositorio oficial de NVIDIA
$ curl -O https://raw.githubusercontent.com/nvidia-riva/common/main/riva/proto/riva_asr.proto
$ curl -O https://raw.githubusercontent.com/nvidia-riva/common/main/riva/proto/riva_audio.proto
$ curl -O https://raw.githubusercontent.com/nvidia-riva/common/main/riva/proto/riva_common.proto

# alternativa: git clone --depth 1 https://github.com/nvidia-riva/common
# y copiar la carpeta riva/proto dentro de src/proto/`,
      hints: {
        2: 'La ruta `riva/proto/` es obligatoria: los `import` de `riva_asr.proto` empiezan en `riva/proto/...`.',
        6: '`raw.githubusercontent.com` entrega el contenido del archivo tal cual, sin la página de GitHub alrededor.',
        7: 'Este archivo define los formatos de audio (`AudioEncoding`).',
        8: 'Y este, el mensaje `RequestId`. Sin él, `riva_asr.proto` no carga.',
        10: 'Clonar el repositorio también sirve, pero baja muchos archivos que no necesitamos.'
      }
    },
    motif: 'rows',
    accent: '#50e3c2',
    hints: [
      'En Windows PowerShell escribe `curl.exe` en lugar de `curl`; si no, PowerShell usa otro comando con el mismo nombre.',
      'Usamos la rama `main`. El repositorio también tiene etiquetas de versión, por ejemplo `r2.19.0`, para fijar una versión exacta.',
      'Estos pasos se hacen una sola vez. Después, los archivos viven dentro de tu proyecto.'
    ]
  },
  {
    kicker: 'proto · riva_asr',
    title: 'Cómo se conectan: `import`',
    lead: 'La cabecera de `riva_asr.proto` declara su `package` y trae a los otros dos archivos con `import`.',
    bullets: [
      '`package nvidia.riva.asr` es la ruta que usamos en JavaScript.',
      'Cada `import` se busca dentro de `includeDirs` (`src/proto`).',
      'Si cambias la carpeta `riva/proto/`, los `import` dejan de encontrarse.'
    ],
    code: {
      file: 'src/proto/riva/proto/riva_asr.proto',
      lang: 'proto',
      start: 21,
      text: `package nvidia.riva.asr;

option cc_enable_arenas = true;
option go_package = "nvidia.com/riva_speech";

import "riva/proto/riva_audio.proto";
import "riva/proto/riva_common.proto";`,
      hints: {
        1: 'Este `package` es el mismo que usamos en el paso 3: `.nvidia.riva.asr`.',
        3: 'Las `option` son ajustes para otros lenguajes (C++, Go). Node las ignora.',
        6: 'Trae `AudioEncoding`. La ruta se resuelve desde `includeDirs`, por eso empieza en `riva/proto/`.',
        7: 'Trae `RequestId`. Sin este archivo, `riva_asr.proto` no se puede cargar.'
      }
    },
    motif: 'rows',
    accent: '#0070f3',
    hints: [
      'Es parecido a `require` en Node: un archivo pide a otro lo que necesita.',
      'Si el loader dice que no encuentra un archivo, revisa primero las rutas de los `import`.'
    ]
  },
  {
    kicker: 'proto · riva_audio',
    title: 'Los formatos de audio',
    lead: '`riva_audio.proto` define un **enum**: una lista cerrada de valores permitidos para el campo `encoding`.',
    bullets: [
      'Cada nombre tiene un número: `LINEAR_PCM = 1`, `FLAC = 2`…',
      'Nuestra solicitud envía `ENCODING_UNSPECIFIED`: el servicio lee el formato del encabezado del WAV.',
      '`enums: String` en el loader permite escribir el nombre en vez del número.'
    ],
    code: {
      file: 'src/proto/riva/proto/riva_audio.proto',
      lang: 'proto',
      start: 11,
      text: `/*
 * AudioEncoding specifies the encoding of the audio bytes in the encapsulating
 * message.
 */
enum AudioEncoding {
  // Not specified.
  ENCODING_UNSPECIFIED = 0;

  // Uncompressed 16-bit signed little-endian samples (Linear PCM).
  LINEAR_PCM = 1;`,
      hints: {
        5: 'Un `enum` es una lista cerrada de opciones. Aquí, los formatos de audio que acepta el servicio.',
        7: 'Este es el valor que enviamos en el paso 9: `encoding: \'ENCODING_UNSPECIFIED\'`.',
        10: 'Audio sin comprimir. Es lo que contiene el WAV que generamos en el paso 4.'
      }
    },
    motif: 'wave',
    accent: '#f5a623',
    hints: [
      'El archivo completo también lista `FLAC`, `MULAW`, `OGGOPUS` y `ALAW`.',
      'Con `enums: String`, escribimos `\'LINEAR_PCM\'` en vez del número `1`.'
    ]
  },
  {
    kicker: 'proto · riva_common',
    title: 'Un mensaje compartido',
    lead: 'El archivo más pequeño: solo 16 líneas. Define `RequestId`, un mensaje que otros archivos **reutilizan** en vez de repetirlo.',
    bullets: [
      'Un `message` es una estructura de datos con campos numerados.',
      '`RecognizeRequest` y `RecognizeResponse` lo incluyen en su campo opcional `id`.',
      'Nuestro código no lo usa, pero el `.proto` lo necesita para cargarse sin errores.'
    ],
    code: {
      file: 'src/proto/riva/proto/riva_common.proto',
      lang: 'proto',
      start: 11,
      text: `/*
 * Specifies the request ID of the request.
 */
message RequestId {
  string value = 1;
}`,
      hints: {
        4: 'Un `message` agrupa campos, como un objeto en JavaScript.',
        5: 'Tipo `string`, nombre `value`, número de campo `1`. El número identifica al campo en los datos binarios.'
      }
    },
    motif: 'ring',
    accent: '#7928ca',
    hints: [
      'En `riva_asr.proto` aparece como `RequestId id = 100;` en las peticiones y respuestas.',
      'Poner lo común en un archivo aparte evita copiar la misma definición varias veces.'
    ]
  },
  {
    kicker: 'Sin compilación',
    title: 'Del `.proto` al cliente',
    lead: 'Estos archivos **no se compilan**. `proto-loader` los lee cada vez que arranca el programa y construye el cliente en memoria.',
    bullets: [
      'No se genera ningún archivo nuevo.',
      'Si cambia un `.proto`, basta con volver a ejecutar el programa.',
      'Existe otra forma: generar código con `protoc` (por ejemplo, con el paquete `grpc-tools`). Aquí no hace falta.'
    ],
    diagram: [
      { label: 'riva_asr.proto (+ imports)', sub: 'Archivos de texto con el contrato. Los descargaste de GitHub.' },
      { label: 'protoLoader.loadSync(...)', sub: 'Lee y analiza los `.proto` al arrancar (paso 3). No escribe nada en disco.' },
      { label: 'grpc.loadPackageDefinition(...)', sub: 'Convierte esa definición en clases de JavaScript, como `RivaSpeechRecognition`.' },
      { label: 'new rasr.RivaSpeechRecognition(...)', sub: 'Ya tienes el cliente: llamas a `client.Recognize(...)` en los pasos 8 y 10.' }
    ],
    motif: 'pipeline',
    accent: '#7928ca',
    hints: [
      'Se llama carga dinámica: el cliente se arma en tiempo de ejecución, no antes.',
      'La carga estática genera archivos `*_pb.js` con `protoc`. Es más rápida al arrancar, pero añade un paso de compilación.',
      'Resumen: npm instala las herramientas, GitHub entrega el contrato y tu código los junta.'
    ]
  },
  {
    kicker: 'Paso 4',
    title: 'Convierte el audio a WAV',
    lead: 'El servicio solo entiende **WAV, FLAC u OPUS** en mono y 16 bits. Un MP3 hay que convertirlo antes de enviarlo.',
    bullets: [
      'Si ya es `.wav`, se devuelve tal cual.',
      '`afconvert` viene con macOS; si falla, se intenta con `ffmpeg`.',
      'El WAV temporal se guarda en la carpeta temporal del sistema.'
    ],
    code: {
      file: 'src/transcriptOpenAI.js',
      lang: 'js',
      start: 25,
      text: `/*
paso 4 el servicio solo acepta audio WAV/FLAC/OPUS (mono, 16 bits), asi que si el archivo
es otro formato (por ejemplo mp3) lo convertimos a WAV a 16 kHz usando afconvert (macOS)
o ffmpeg
*/
function convertirAWav(audioFilePath) {
    if (path.extname(audioFilePath).toLowerCase() === '.wav') {
        return audioFilePath;
    }
    const wavPath = path.join(os.tmpdir(), \`\${path.basename(audioFilePath, path.extname(audioFilePath))}_16k.wav\`);
    try {
        execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@16000', '-c', '1', audioFilePath, wavPath]);
    } catch (error) {
        execFileSync('ffmpeg', ['-y', '-i', audioFilePath, '-ar', '16000', '-ac', '1', wavPath]);
    }
    return wavPath;
}`,
      hints: {
        7: '`path.extname` devuelve la extensión, por ejemplo `.mp3`. Con `.toLowerCase()` también reconoce `.WAV`.',
        10: 'El nombre queda como `audio_16k.wav` dentro de la carpeta temporal.',
        12: '`LEI16@16000` = enteros de 16 bits, little-endian, a 16 000 muestras por segundo. `-c 1` = mono.',
        14: 'Si `afconvert` no existe (Linux o Windows), el `catch` prueba con `ffmpeg`.'
      }
    },
    motif: 'wave',
    accent: '#f5a623',
    hints: [
      '16 kHz es suficiente para voz humana y hace que el archivo pese menos.',
      'En Linux o Windows instala `ffmpeg` para que este paso funcione.'
    ]
  },
  {
    kicker: 'Pasos 5 y 6',
    title: 'La función y sus validaciones',
    lead: 'Declaramos `transcribirAudio` como `async` y, dentro de un `try`, comprobamos que el audio existe y que tenemos la API key.',
    bullets: [
      '`async` nos permite usar `await` más adelante.',
      '`fs.existsSync` responde si el archivo está en el disco.',
      '`languageCode` tiene un valor por defecto: `en-US`.'
    ],
    code: {
      file: 'src/transcriptOpenAI.js',
      lang: 'js',
      start: 43,
      text: `/*
paso 5 declaramos e implementamos la funcion a la cual le pasaremos el audio y el api key
de NVIDIA como parametro para transcribir nuestro audio
*/
async function transcribirAudio(audioFilePath, apiKey, languageCode = 'en-US') {
    try {
        //paso 6: validamos que el archivo de audio existe
        if (!fs.existsSync(audioFilePath)) {
            throw new Error('El archivo no existe');
        }
        if (!apiKey) {
            throw new Error('Falta la variable de entorno NVIDIA_API_KEY');
        }`,
      hints: {
        5: 'Un parámetro con `= \'en-US\'` toma ese valor si no le pasas nada.',
        6: 'El `try` agrupa todo lo que puede fallar; el `catch` lo atrapará al final.',
        8: '`!` niega la condición: "si el archivo NO existe".',
        9: '`throw` detiene la función y salta directo al `catch`.',
        11: 'Validar antes de llamar a la red da mensajes de error claros y rápidos.'
      }
    },
    motif: 'ring',
    accent: '#0070f3',
    hints: [
      'Validar primero evita enviar peticiones que sabemos que van a fallar.',
      '`throw new Error(...)` crea un error con un mensaje que podrás leer en el `catch`.'
    ]
  },
  {
    kicker: 'Pasos 7 y 8',
    title: 'Lee el audio y crea el cliente',
    lead: 'Leemos los bytes del WAV y abrimos una conexión **segura (TLS)** con NVIDIA. La autenticación viaja como metadatos.',
    bullets: [
      '`readFileSync` devuelve el archivo como `Buffer`.',
      '`createSsl()` activa el cifrado de la conexión.',
      'Dos metadatos: `function-id` y `authorization`.'
    ],
    code: {
      file: 'src/transcriptOpenAI.js',
      lang: 'js',
      start: 57,
      text: `        //paso 7: convertimos (si hace falta) y leemos el archivo de audio
        const audioFile = fs.readFileSync(convertirAWav(audioFilePath));

        //paso 8: creamos el cliente seguro (TLS) y los metadatos de autenticacion
        const client = new rasr.RivaSpeechRecognition(NVIDIA_SERVER, grpc.credentials.createSsl());
        const metadata = new grpc.Metadata();
        metadata.add('function-id', WHISPER_FUNCTION_ID);
        metadata.add('authorization', \`Bearer \${apiKey}\`);`,
      hints: {
        2: 'Llamamos a `convertirAWav` aquí mismo: su resultado se lo pasamos a `readFileSync`.',
        5: '`RivaSpeechRecognition` es el nombre del servicio dentro del `.proto`.',
        7: 'Este metadato le dice a NVIDIA cuál modelo ejecutar.',
        8: '`Bearer` + tu API key es el formato estándar de autorización.'
      }
    },
    motif: 'stream',
    accent: '#7928ca',
    hints: [
      'Los metadatos de gRPC cumplen el papel de las cabeceras HTTP.',
      'Un `Buffer` es una secuencia de bytes: justo lo que necesita un archivo de audio.'
    ]
  },
  {
    kicker: 'Paso 9',
    title: 'Arma la solicitud',
    lead: 'La petición lleva dos partes: la **configuración** del reconocimiento y el **audio** en sí.',
    bullets: [
      '`ENCODING_UNSPECIFIED`: el encabezado del WAV ya indica el formato.',
      '`language_code` elige el idioma que se transcribe.',
      '`enable_automatic_punctuation` agrega puntos y comas.'
    ],
    code: {
      file: 'src/transcriptOpenAI.js',
      lang: 'js',
      start: 66,
      text: `        //paso 9: armamos la solicitud con la configuracion y el contenido del audio
        const request = {
            config: {
                encoding: 'ENCODING_UNSPECIFIED', // el encabezado del WAV indica el formato
                sample_rate_hertz: 16000,
                language_code: languageCode,
                max_alternatives: 1,
                enable_automatic_punctuation: true
            },
            audio: audioFile
        };`,
      hints: {
        4: 'No decimos si es PCM, FLAC u otro: el servicio lo lee del encabezado del archivo.',
        5: 'Coincide con los 16 kHz de la conversión del paso 4.',
        6: 'Cambia a `es-US` si tu audio está en español.',
        7: 'Solo pedimos la mejor transcripción, no alternativas.',
        10: 'Aquí van los bytes del WAV que leímos en el paso 7.'
      }
    },
    motif: 'rows',
    accent: '#50e3c2',
    hints: [
      'Los nombres con guion bajo (`sample_rate_hertz`) vienen del `.proto`; por eso usamos `keepCase`.',
      'Prueba cambiar `language_code` a `es-US` con un audio en español.'
    ]
  },
  {
    kicker: 'Pasos 10 y 11',
    title: 'Envía el audio y une el texto',
    lead: '`Recognize` funciona con callbacks; lo envolvemos en una `Promise` para poder usar `await`. Después unimos los fragmentos.',
    bullets: [
      '`resolve` entrega la respuesta; `reject` entrega el error.',
      '`response.results` es una lista de fragmentos.',
      '`.join(\' \')` los une con un espacio.'
    ],
    code: {
      file: 'src/transcriptOpenAI.js',
      lang: 'js',
      start: 78,
      text: `        //paso 10: realizamos la solicitud al servidor de NVIDIA
        const response = await new Promise((resolve, reject) => {
            client.Recognize(request, metadata, (error, res) => (error ? reject(error) : resolve(res)));
        });

        //paso 11: unimos los fragmentos transcritos en un solo texto
        const transcription = response.results
            .map(result => result.alternatives[0].transcript.trim())
            .join(' ');`,
      hints: {
        2: 'Una `Promise` convierte un callback en algo que podemos esperar con `await`.',
        3: 'El operador `? :` dice: si hay error, rechaza; si no, resuelve con la respuesta.',
        8: '`alternatives[0]` es la mejor opción; `.trim()` quita espacios sobrantes.',
        9: 'Si el audio es largo, el servicio devuelve varios fragmentos que se unen aquí.'
      }
    },
    motif: 'stream',
    accent: '#0070f3',
    hints: [
      '`await` pausa la función hasta que la Promise termina, sin bloquear el resto del programa.',
      '`.map()` transforma cada fragmento; `.join()` los une en un solo texto.'
    ]
  },
  {
    kicker: 'Paso 12',
    title: 'Guarda la transcripción',
    lead: 'El texto se escribe junto al audio con el nombre `<audio>_transcription.txt`. Usamos `path` para que la ruta sea válida en cualquier sistema.',
    bullets: [
      '`path.dirname` obtiene la carpeta del audio.',
      '`path.basename(ruta, extension)` quita la extensión.',
      'La función también devuelve el texto.'
    ],
    code: {
      file: 'src/transcriptOpenAI.js',
      lang: 'js',
      start: 88,
      text: `        //paso 12: guardamos la transcripcion junto al audio, con ruta independiente del sistema operativo
        const outputFilePath = path.join(path.dirname(audioFilePath),
            \`\${path.basename(audioFilePath, path.extname(audioFilePath))}_transcription.txt\`);
        fs.writeFileSync(outputFilePath, transcription);
        console.log(\`Transcripcion guardada en: \${outputFilePath}\`);
        return transcription;`,
      hints: {
        2: '`path.join` pega las partes de la ruta con el separador correcto para tu sistema.',
        3: 'De `audio.mp3` sale `audio_transcription.txt`.',
        4: '`writeFileSync` crea el archivo; si ya existía, lo sobrescribe.',
        6: '`return` entrega el texto a quien llamó la función.'
      }
    },
    motif: 'rows',
    accent: '#f5a623',
    hints: [
      'Cada ejecución sobrescribe el archivo `_transcription.txt` anterior.',
      'Las comillas invertidas permiten insertar variables con `${ }` dentro del texto.'
    ]
  },
  {
    kicker: 'Paso 13',
    title: 'Maneja los errores',
    lead: 'Cualquier fallo (archivo faltante, clave inválida, red caída) llega al `catch`. Lo mostramos y lo volvemos a lanzar.',
    bullets: [
      '`error.message` contiene el texto del error.',
      '`throw error` deja que quien llama también se entere.',
      'Así `.catch()` del final recibe el mismo error.'
    ],
    code: {
      file: 'src/transcriptOpenAI.js',
      lang: 'js',
      start: 94,
      text: `    } catch (error) {
        //paso 13: manejamos el error
        console.error('Error durante la transcripcion', error.message);
        throw error;
    }
}`,
      hints: {
        1: 'Este `catch` cierra el `try` que abrimos en el paso 6.',
        3: '`console.error` escribe en la salida de errores, no en la normal.',
        4: 'Volver a lanzar el error evita que la función parezca exitosa cuando falló.'
      }
    },
    motif: 'scatter',
    accent: '#ff0080',
    hints: [
      'Si la API key es inválida, el error aparecerá aquí con el mensaje de NVIDIA.',
      'Un `catch` que solo imprime y no relanza esconde fallos a quien llama.'
    ]
  },
  {
    kicker: 'Pasos 14 y 15',
    title: 'La ruta del audio y la API key',
    lead: 'La ruta se calcula desde `__dirname`, así el programa funciona sin importar desde dónde lo ejecutes. La clave se carga del archivo `.env`.',
    bullets: [
      '`process.loadEnvFile` lee el `.env` y llena `process.env`.',
      'Si no existe el archivo, el `catch` vacío lo ignora.',
      'Requiere Node 20.12 o superior.'
    ],
    code: {
      file: 'src/transcriptOpenAI.js',
      lang: 'js',
      start: 101,
      text: `//paso 14: ruta del audio relativa a este archivo, para que funcione desde cualquier carpeta
const audioPath = path.join(__dirname, 'audio', 'audio.mp3');

//paso 15: la API key se lee de la variable de entorno NVIDIA_API_KEY, nunca se escribe en el codigo.
//Si existe el archivo .env en la raiz del proyecto lo cargamos para no tener que exportarla a mano
try {
    process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch (error) {
    // no hay archivo .env, usamos las variables de entorno que ya existan
}
const nvidiaApiKey = process.env.NVIDIA_API_KEY;`,
      hints: {
        2: '`__dirname` calcula la ruta desde la carpeta de este archivo, no desde donde ejecutes `node`.',
        7: '`..` sube una carpeta: de `src/` a la raíz, donde vive el `.env`.',
        9: 'Un `catch` vacío es aceptable aquí porque el `.env` es opcional.',
        11: '`process.env` guarda las variables de entorno del proceso.'
      }
    },
    motif: 'ring',
    accent: '#50e3c2',
    hints: [
      'Con `__dirname` ya no importa desde qué carpeta ejecutes el programa.',
      'Nunca pongas la clave en esta línea: lo que escribas en el código puede terminar en un repositorio.'
    ]
  },
  {
    kicker: 'Paso 16',
    title: 'Llama a la función',
    lead: '`transcribirAudio` devuelve una Promise. Con `.then` manejamos el éxito y con `.catch` el fallo.',
    bullets: [
      '`.then` recibe el texto transcrito.',
      '`.catch` recibe el error que relanzó el paso 13.',
      'El idioma se puede cambiar con `LANGUAGE_CODE`.'
    ],
    code: {
      file: 'src/transcriptOpenAI.js',
      lang: 'js',
      start: 113,
      text: `//paso 16: llamamos a la funcion y manejamos el resultado
transcribirAudio(audioPath, nvidiaApiKey, process.env.LANGUAGE_CODE || 'en-US')
    .then(transcription => {
        console.log('Transcripción generada con exito');
        console.log(transcription);
    })
    .catch(error => {
        console.error('Fallo la transcripción', error);
    });`,
      hints: {
        2: '`||` usa `en-US` cuando `LANGUAGE_CODE` no está definida.',
        3: 'Esta función flecha se ejecuta solo si todo salió bien.',
        7: 'Y esta solo si algo falló en cualquier paso anterior.'
      }
    },
    motif: 'burst',
    accent: '#0070f3',
    hints: [
      'Una Promise tiene tres estados: pendiente, cumplida o rechazada.',
      '`.then` y `.catch` son la alternativa a `await` fuera de una función `async`.'
    ]
  },
  {
    kicker: 'Resultado',
    title: 'Ejecútalo',
    lead: 'Instala las dependencias, deja tu clave en `.env` y ejecuta el archivo. Funciona desde cualquier carpeta.',
    bullets: [
      'Se crea `src/audio/audio_transcription.txt`.',
      'Usa `LANGUAGE_CODE=es-US` para audio en español.',
      'Si falla, lee el mensaje: casi siempre es la clave.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `$ npm install
$ node src/transcriptOpenAI.js
Transcripcion guardada en: src/audio/audio_transcription.txt
Transcripción generada con exito
Hello, I am Mauricio Rivero, software engineer. This time we are going to develop a...`,
      hints: {
        1: 'Solo necesitas `npm install` la primera vez.',
        2: 'Node ejecuta el archivo de arriba abajo y llama a la función en el paso 16.',
        5: 'Este es el texto que Whisper reconoció en el audio de prueba.'
      }
    },
    motif: 'wave',
    accent: '#7928ca',
    hints: [
      '¡Funcionó! Prueba cambiar el audio por uno tuyo.',
      'Si ves "Falta la variable de entorno", revisa que `.env` esté en la raíz.'
    ]
  },
  {
    type: 'title',
    kicker: 'Resumen',
    title: 'Lo que aprendiste',
    lead: 'Leer archivos con `fs`, rutas con `path`, convertir audio con un programa externo, llamar un servicio **gRPC** con `async/await` y proteger tu API key con `.env`.',
    motif: 'burst',
    accent: '#50e3c2',
    hints: [
      '¡Buen trabajo! Repasa las diapositivas con las flechas o los puntos de abajo.',
      'Reto: guarda también la transcripción en JSON o traduce el texto.',
      'Gracias por aprender conmigo. ¡Hasta la próxima!'
    ]
  }
];
