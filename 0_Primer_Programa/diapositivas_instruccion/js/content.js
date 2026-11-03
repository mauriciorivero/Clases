/* Contenido de la presentación: código mostrado, bloques explicados y las 11 diapositivas. */
(function (App) {
  'use strict';
  var editor = App.editor, terminal = App.terminal, tree = App.tree, copyCol = App.copyCol;

  var HELLO = ['console.log("Hola Mundo");'];
  var MAIN = [
    "const args = process.argv.slice(2);",
    "",
    "let min = 1;",
    "let max = 100;",
    "",
    "if (args.length >= 2) {",
    "  const parseMin = parseInt(args[0], 10);",
    "  const parseMax = parseInt(args[1], 10);",
    "",
    "  if (!isNaN(parseMin) && !isNaN(parseMax) && parseMin < parseMax) {",
    "    min = parseMin;",
    "    max = parseMax;",
    "  } else {",
    "    console.log('rango inválido: usando valores por defecto del 1 al 100.');",
    "  }",
    "}",
    "",
    "const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;",
    "console.log(`número aleatorio generado entre ${min} y ${max}: ${randomNumber}`);"
  ];
  var PKG = [
    '{',
    '  "name": "primer_programa_node",',
    '  "version": "1.0.0",',
    '  "main": "index.js",',
    '  "scripts": {',
    '    "test": "echo \\"Error: no test specified\\" && exit 1"',
    '  },',
    '  "license": "MIT"',
    '}'
  ];

  /* Bloques del paso 8: l = rango de líneas resaltadas, t = título, d = explicación. */
  App.GROUPS = [
    { l: [1, 1], t: 'Leer los argumentos', d: '<code>process.argv</code> es un arreglo con todo lo que se escribió en la terminal. <code>slice(2)</code> descarta las dos primeras posiciones (la ruta de Node y la del archivo) y deja solo los argumentos que tú escribiste.' },
    { l: [3, 4], t: 'Valores por defecto', d: 'Si nadie indica un rango, el programa usa 1 y 100. Son <code>let</code> porque su valor puede cambiar más adelante.' },
    { l: [6, 8], t: 'Convertir texto en número', d: 'Todo argumento llega como texto. Si hay al menos dos, <code>parseInt</code> los convierte a números enteros en base 10.' },
    { l: [9, 16], t: 'Validar antes de usar', d: 'Si ambos son números y el mínimo es menor que el máximo, reemplazan a los valores por defecto. Si no, el programa avisa y conserva 1 y 100.' },
    { l: [17, 19], t: 'Generar e imprimir', d: '<code>Math.random()</code> da un decimal entre 0 y 1. Multiplicar por <code>(max - min + 1)</code>, redondear hacia abajo y sumar <code>min</code> deja el resultado entre min y max, ambos incluidos.' }
  ];

  var SL = [];

  SL.push({ mood: 'happy', bubble: '', html:
    '<div class="copy"><p class="eyebrow rise" style="--d:0">SENA · Node.js · 2026</p>' +
    '<h1 class="rise" style="--d:1">Tu primer programa en Node.js</h1>' +
    '<p class="lead rise" style="--d:2">Nueve pasos para ir de una carpeta vacía a un generador de números aleatorios que lee argumentos desde la terminal.</p>' +
    '<button class="btn rise" style="--d:3" data-next>Comenzar <span aria-hidden="true">→</span></button>' +
    '<div class="pills rise" style="--d:4"><span>mkdir</span><span>git</span><span>npm</span><span>node</span></div>' +
    '<p class="hint rise" style="--d:5"><kbd>←</kbd> <kbd>→</kbd> para navegar</p></div><div></div>' });

  SL.push({ mood: 'happy', bubble: 'Una carpeta por proyecto mantiene todo en orden.',
    term: [{ c: 'mkdir primer_programa' }, { c: 'cd primer_programa' }],
    html: copyCol('Paso 1', 'Crea la carpeta del proyecto', ['<code>mkdir</code> crea una carpeta nueva y <code>cd</code> te mueve adentro de ella.', 'Desde aquí, todos los comandos se ejecutan dentro de <b>primer_programa</b>.']) +
      '<div class="vis">' + terminal('~/clase', 'mkdir primer_programa\ncd primer_programa') + tree([[0, 'primer_programa', true, true]]) + '</div>' });

  SL.push({ mood: 'happy', bubble: 'Git recordará cada cambio que hagas.',
    term: [{ c: 'git init' }, { o: 'Initialized empty Git repository in …/primer_programa/.git/', k: 'ok' }],
    html: copyCol('Paso 2', 'Inicia el control de versiones', ['<code>git init</code> convierte la carpeta en un repositorio. Git guarda el historial de tu código para que puedas volver atrás si algo sale mal.']) +
      '<div class="vis">' + terminal('primer_programa', 'git init') + tree([[0, 'primer_programa', true], [1, '.git', true, true]]) + '</div>' });

  SL.push({ mood: 'think', bubble: 'Tranquilo: Enter acepta lo que va entre paréntesis.',
    term: [{ c: 'npm init' },
      { o: 'package name: (primer_programa) <span class="q">primer_programa_node</span>' },
      { o: 'version: (1.0.0) <span class="a">↵</span>' },
      { o: 'entry point: (index.js) <span class="a">↵</span>' },
      { o: 'license: (ISC) <span class="q">MIT</span>' },
      { o: 'Is this OK? (yes) <span class="q">yes</span>', k: 'ok' }],
    html: copyCol('Paso 3', 'Crea el archivo package.json', ['<code>npm init</code> te hace unas preguntas y con tus respuestas genera <code>package.json</code>, la ficha de identidad de tu proyecto.', 'Cuando aparece un valor entre paréntesis, presiona Enter para aceptarlo.']) +
      '<div class="vis">' + terminal('primer_programa', 'npm init') + editor('package.json', PKG, 'json') + tree([[0, 'primer_programa', true], [1, '.git', true], [1, 'package.json', false, true]]) + '</div>' });

  SL.push({ mood: 'think', bubble: 'Ojo: touch no crea carpetas, por eso hacemos mkdir src antes.',
    term: [{ c: 'mkdir src' }, { c: 'touch src/index.js' }],
    html: copyCol('Paso 4', 'Crea el archivo del programa', ['<code>touch</code> crea un archivo vacío. Tu código vivirá en <code>src/index.js</code>.'], '<code>touch</code> no crea carpetas. Si <code>src</code> no existe, el comando falla, así que créala primero con <code>mkdir src</code>.') +
      '<div class="vis">' + terminal('primer_programa', 'mkdir src\ntouch src/index.js') + tree([[0, 'primer_programa', true], [1, '.git', true], [1, 'package.json'], [1, 'src', true], [2, 'index.js', false, true]]) + '</div>' });

  SL.push({ mood: 'happy', bubble: 'Una línea basta para saludar al mundo.',
    html: copyCol('Paso 5', 'Escribe tu primer código', ['Abre <code>src/index.js</code> en tu editor y escribe esta línea.', '<code>console.log()</code> imprime en la terminal lo que pongas entre paréntesis. Lo que va entre comillas es un texto.']) +
      '<div class="vis">' + editor('src/index.js', HELLO, 'js') + '</div>' });

  SL.push({ mood: 'happy', bubble: 'Node lee el archivo y ejecuta lo que dice adentro.',
    term: [{ c: 'node src/index.js' }], idle: false,
    html: copyCol('Paso 6', 'Ejecuta el programa', ['Guarda el archivo, abre la terminal en la carpeta del proyecto y escribe el comando.', '<code>node</code> es el programa que entiende JavaScript fuera del navegador. Le pasas la ruta del archivo que quieres correr.']) +
      '<div class="vis">' + terminal('primer_programa', 'node src/index.js') + editor('src/index.js', HELLO, 'js') + '</div>' });

  SL.push({ mood: 'party', bubble: '¡Lo lograste! Tu primer programa corre.', kick: 1,
    term: [{ c: 'node src/index.js', fast: true }, { o: 'Hola Mundo', k: 'big ok', wait: 300 }],
    html: copyCol('Paso 7', 'Revisa el resultado', ['Si ves <b>Hola Mundo</b> en la terminal, todo está correcto.'], '¿No aparece? Confirma que estás dentro de <code>primer_programa</code> y que guardaste el archivo antes de ejecutar.') +
      '<div class="vis">' + terminal('primer_programa', 'node src/index.js') + '</div>' });

  SL.push({ mood: 'think', bubble: 'Mira un bloque a la vez, no todo junto.', groups: true,
    html: '<div class="copy"><p class="eyebrow rise" style="--d:0">Paso 8</p><h2 class="rise" style="--d:1">Genera números aleatorios</h2>' +
      '<p class="lead rise" style="--d:2">Reemplaza el contenido de <code>src/index.js</code>. El programa recibe un rango por la terminal. Elige un bloque para ver qué hace.</p>' +
      '<ul class="blocks rise" style="--d:3">' + App.GROUPS.map(function (g, i) {
        return '<li><button data-g="' + i + '"><span class="n">' + (g.l[0] === g.l[1] ? 'L' + g.l[0] : 'L' + g.l[0] + '–' + g.l[1]) + '</span><span>' + g.t + '</span></button></li>';
      }).join('') + '</ul>' +
      '<p class="explain rise" style="--d:4" id="explain"></p></div>' +
      '<div class="vis">' + editor('src/index.js', MAIN, 'js') + '</div>' });

  SL.push({ mood: 'happy', bubble: 'Cambia los números y vuelve a ejecutar.', play: true,
    html: '<div class="copy"><p class="eyebrow rise" style="--d:0">Paso 9</p><h2 class="rise" style="--d:1">Pruébalo con argumentos</h2>' +
      '<p class="lead rise" style="--d:2">Escribe el rango después del nombre del archivo. Aquí puedes probarlo sin salir de la presentación.</p>' +
      '<div class="pg rise" style="--d:3"><label class="fld" for="inMin">Mínimo<input id="inMin" value="1" inputmode="numeric" autocomplete="off"></label><label class="fld" for="inMax">Máximo<input id="inMax" value="10" inputmode="numeric" autocomplete="off"></label><button class="btn" id="run">Ejecutar</button></div>' +
      '<p class="chipcap rise" style="--d:4">Prueba también casos que fallan:</p><div class="chips rise" style="--d:4"><button data-a="50|20">50 20</button><button data-a="hola|5">hola 5</button><button data-a="7|">solo 7</button><button data-a="|">sin argumentos</button></div></div>' +
      '<div class="vis">' + terminal('primer_programa', 'node src/index.js 1 10') + '</div>' });

  SL.push({ mood: 'party', bubble: '¡Excelente trabajo!', kick: 1,
    html: copyCol('Resumen', 'Lo que construiste', ['Un programa que lee datos de la terminal, los valida y responde.']) +
      '<div class="vis"><div class="cards rise" style="--d:3">' +
      '<div class="card"><h3>process.argv</h3><p>Entrega los argumentos escritos al ejecutar el programa.</p></div>' +
      '<div class="card"><h3>parseInt()</h3><p>Convierte texto en un número entero.</p></div>' +
      '<div class="card"><h3>Math.random()</h3><p>Genera un decimal entre 0 y 1 que se escala a tu rango.</p></div>' +
      '<div class="card"><h3>`${plantilla}`</h3><p>Inserta variables dentro de un mensaje.</p></div></div>' +
      tree([[0, 'primer_programa', true], [1, '.git', true], [1, 'package.json'], [1, 'src', true], [2, 'index.js']]) +
      '<div><button class="btn ghost" data-restart>Volver al inicio</button></div></div>' });

  App.SLIDES = SL;
})(window.App);
