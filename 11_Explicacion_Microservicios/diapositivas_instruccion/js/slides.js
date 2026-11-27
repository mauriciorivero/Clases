// ==========================================================
// js/slides.js
// Contenido de las diapositivas de la clase de microservicios.
// El codigo NO se escribe aqui: cada editor apunta a un archivo
// real (js/code-files.js, generado con js/generar-code-files.js)
// y a un rango de lineas, para que las diapositivas no se
// desincronicen del proyecto.
//
// Campos principales de cada diapositiva:
//   step     -> numero de paso (el indice los agrupa por "phase")
//   part     -> { n, of, label } cuando un tema se divide
//   layer    -> etiqueta de la carpeta o tema
//   lead     -> parrafos de explicacion (admite <code> y <strong>)
//   commands -> comandos de terminal
//   visual   -> panel derecho (editor, terminal, laboratorio, etc.)
//   flow     -> { lit: nodos iluminados, route: saltos animados }
//   bubble   -> lo que narra Bit (punto clave)
//   mood     -> expresion de Bit
//
// Los mensajes de la API y las salidas de consola se copian tal
// cual los imprime el codigo (sin tildes). Las respuestas son
// capturas reales de los dos servicios; los tokens y las fechas
// cambian en cada ejecucion.
// ==========================================================

window.PHASES = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'conceptos', label: 'Qué son los microservicios' },
  { id: 'diseno', label: 'Diseño del sistema' },
  { id: 'datos', label: 'Bases de datos y SHA-2' },
  { id: 'auth', label: 'Microservicio de autenticación' },
  { id: 'integrar', label: 'Integrar el segundo servicio' },
  { id: 'redirigir', label: 'Redirección en el frontend' },
  { id: 'probar', label: 'Probar y cerrar' },
];

// Nodos de la franja superior. El orden de "main" es el de los saltos.
window.PIPELINE = {
  main: [
    { id: 'dbauth', label: 'authentication', hint: 'MySQL: tabla CUENTA' },
    { id: 'auth', label: ':3001 auth', hint: 'BACKEND_SRV_1: valida la clave y firma el token' },
    { id: 'cliente', label: 'Navegador', hint: 'login.html e index.html' },
    { id: 'gestion', label: ':3000 gestión', hint: 'BACKEND_SRV_2: verifica el token y atiende' },
    { id: 'dbgestion', label: 'personal_management', hint: 'MySQL: datos de gestión' },
  ],
  side: [{ id: 'secreto', label: 'JWT_SECRET', hint: 'el mismo valor en los dos .env' }],
};

// Diagrama grande de arquitectura (rejilla de 3 columnas)
window.ARCHITECTURE = [
  { id: 'cliente', label: 'Navegador', note: 'login.html → index.html', row: 1, col: 2 },
  { id: 'auth', label: 'SRV_1 · :3001', note: 'valida la clave y firma el token', row: 2, col: 1 },
  { id: 'secreto', label: 'JWT_SECRET', note: 'compartido', row: 2, col: 2 },
  { id: 'gestion', label: 'SRV_2 · :3000', note: 'verifica el token y atiende', row: 2, col: 3 },
  { id: 'dbauth', label: 'MySQL', note: 'authentication: CUENTA', row: 3, col: 1 },
  { id: 'dbgestion', label: 'MySQL', note: 'personal_management', row: 3, col: 3 },
];

(function () {
  'use strict';

  // ---------------------------------------------------------- recorridos
  // Cada salto es [desde, hasta, tipo]: req (peticion), res (respuesta),
  // token (viaja el JWT) o err (rechazo).
  const CONSULTA_CUENTA = [['cliente', 'auth', 'req'], ['auth', 'dbauth', 'req'], ['dbauth', 'auth', 'res']];
  const LOGIN = [...CONSULTA_CUENTA, ['auth', 'cliente', 'token']];
  const MAL_LOGIN = [...CONSULTA_CUENTA, ['auth', 'cliente', 'err']];
  const DATOS = [['cliente', 'gestion', 'token'], ['gestion', 'dbgestion', 'req'], ['dbgestion', 'gestion', 'res'], ['gestion', 'cliente', 'res']];
  const COMPLETO = [...LOGIN, ...DATOS];
  const SIN_TOKEN = [['cliente', 'gestion', 'req'], ['gestion', 'cliente', 'err']];
  const TOKEN_MALO = [['cliente', 'gestion', 'token'], ['gestion', 'cliente', 'err']];
  const BODY_MALO = [['cliente', 'auth', 'req'], ['auth', 'cliente', 'err']];
  const TODO = ['dbauth', 'auth', 'cliente', 'gestion', 'dbgestion', 'secreto'];

  const S1 = 'BACKEND_SRV_1';
  const S2 = 'BACKEND_SRV_2';
  const FE = 'FRONTEND';
  const SQL_AUTH = 'parametrization/db_relational_model/DB_authentication_model.sql';

  const js = (file, extra = {}) => ({ file, lang: 'javascript', ...extra });
  const editor = (...tabs) => ({ type: 'editor', tabs });

  // ---------------------------------------------------------- peticiones de prueba
  const TOKEN_CORTO = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwi…';
  const LOGIN_OK = { token: TOKEN_CORTO, usuario: { id: 1, username: 'admin' } };
  const USUARIO = {
    id: 1,
    primerNombre: 'Juan',
    segundoNombre: null,
    primerApellido: 'Pérez',
    segundoApellido: null,
    nombreCompleto: 'Juan Pérez',
    fechaNacimiento: '1995-06-15T05:00:00.000Z',
    edad: 31,
    ciudadDomicilio: 'Bogotá',
    estado: 1,
    telefonos: [],
    perfilesSociales: [],
  };

  const curlLogin = (body) => `curl -X POST http://localhost:3001/api/auth/login \\\n  -H 'Content-Type: application/json' \\\n  -d '${body}'`;
  const curlUsuarios = 'curl http://localhost:3000/api/usuarios \\\n  -H "Authorization: Bearer $TOKEN"';

  const PRUEBAS_LOGIN = [
    {
      method: 'POST', path: '/api/auth/login', label: 'Credenciales correctas', route: LOGIN,
      curl: curlLogin('{"username":"admin","password":"Admin123*"}'),
      status: 200, statusText: 'OK', response: LOGIN_OK,
    },
    {
      method: 'POST', path: '/api/auth/login', label: 'Contraseña errada', route: MAL_LOGIN, error: true,
      curl: curlLogin('{"username":"admin","password":"Admin123"}'),
      status: 401, statusText: 'Unauthorized', response: { error: 'Usuario o contrasenia incorrectos' },
    },
    {
      method: 'POST', path: '/api/auth/login', label: 'Usuario que no existe', route: MAL_LOGIN, error: true,
      curl: curlLogin('{"username":"nadie","password":"x"}'),
      status: 401, statusText: 'Unauthorized', response: { error: 'Usuario o contrasenia incorrectos' },
    },
    {
      method: 'POST', path: '/api/auth/login', label: 'Body vacío', route: BODY_MALO, error: true,
      curl: curlLogin('{}'),
      status: 400, statusText: 'Bad Request',
      response: { error: 'Datos invalidos', detalles: ['El campo username es obligatorio', 'El campo password es obligatorio'] },
    },
    {
      method: 'POST', path: '/api/auth/login', label: 'JSON mal escrito', route: BODY_MALO, error: true,
      curl: curlLogin('{"username":'),
      status: 400, statusText: 'Bad Request', response: { error: 'El cuerpo de la peticion no es un JSON valido' },
    },
  ];

  const PRUEBAS_SISTEMA = [
    {
      method: 'POST', path: ':3001/api/auth/login', label: 'Pedir y guardar el token', route: LOGIN,
      curl: `TOKEN=$(${curlLogin('{"username":"admin","password":"Admin123*"}').replace('curl ', 'curl -s ')} \\\n  | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')`,
      status: 200, statusText: 'OK', response: LOGIN_OK,
    },
    {
      method: 'GET', path: ':3000/api/usuarios', label: 'Sin token', route: SIN_TOKEN, error: true,
      curl: 'curl -i http://localhost:3000/api/usuarios',
      status: 401, statusText: 'Unauthorized', response: { error: 'Debe iniciar sesion para usar este servicio' },
    },
    {
      method: 'POST', path: ':3000/api/usuarios', label: 'Crear un usuario con token', route: DATOS,
      curl: 'curl -X POST http://localhost:3000/api/usuarios \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"primerNombre":"Juan","primerApellido":"Pérez","fechaNacimiento":"1995-06-15","ciudadDomicilio":"Bogotá"}\'',
      status: 201, statusText: 'Created', response: USUARIO,
    },
    {
      method: 'GET', path: ':3000/api/usuarios', label: 'Token alterado', route: TOKEN_MALO, error: true,
      curl: 'curl http://localhost:3000/api/usuarios \\\n  -H "Authorization: Bearer ${TOKEN}x"',
      status: 401, statusText: 'Unauthorized', response: { error: 'La sesion no es valida o ya expiro' },
    },
    {
      method: 'GET', path: ':3000/api/usuarios', label: 'Con SRV_1 apagado', route: DATOS,
      curl: `# Detén BACKEND_SRV_1 con Ctrl + C y repite\n${curlUsuarios}`,
      status: 200, statusText: 'OK', response: [USUARIO],
    },
  ];

  // ---------------------------------------------------------- secuencias
  const LANES = [
    { id: 'dbauth', label: 'MySQL', sub: 'authentication' },
    { id: 'auth', label: 'Autenticación', sub: ':3001' },
    { id: 'cliente', label: 'Navegador', sub: ':8000' },
    { id: 'gestion', label: 'Gestión', sub: ':3000' },
    { id: 'dbgestion', label: 'MySQL', sub: 'personal_…' },
  ];
  const msg = (from, to, text, detail, kind) => ({ from, to, text, detail, kind });

  const PEDIR = [
    msg('cliente', 'auth', 'POST /auth/login', 'login.html envía {"username","password"} a BACKEND_SRV_1.'),
    msg('auth', 'dbauth', 'SELECT … = ?', 'El service busca la cuenta por username, con una consulta parametrizada.'),
    msg('dbauth', 'auth', 'sal:hash', 'MySQL devuelve la fila con la columna password en formato sal:hash.', 'res'),
    msg('auth', 'auth', 'SHA-256(sal + clave)', 'Repite el cálculo con la sal guardada y compara los dos hashes.'),
  ];

  const SEC_SESION = [
    ...PEDIR,
    msg('auth', 'cliente', '200 { token }', 'Coincide: firma un JWT con JWT_SECRET y lo devuelve junto con el usuario.', 'token'),
    msg('cliente', 'cliente', 'guarda y redirige', 'sessionStorage guarda el token y location.replace("index.html") cambia de página. Esta es la redirección.', 'token'),
    msg('cliente', 'gestion', 'GET + Bearer', 'index.html pide los datos al otro backend con la cabecera Authorization: Bearer <token>.', 'token'),
    msg('gestion', 'gestion', 'jwt.verify', 'Gestión comprueba firma, expiración y algoritmo con el mismo secreto. No le pregunta nada a autenticación.'),
    msg('gestion', 'dbgestion', 'SELECT', 'Con el token válido, la petición sigue por controlador y service.'),
    msg('dbgestion', 'gestion', 'filas', 'MySQL devuelve los usuarios activos.', 'res'),
    msg('gestion', 'cliente', '200 [ … ]', 'El navegador pinta la tabla.', 'res'),
  ];

  const SEC_MALA = [
    ...PEDIR,
    msg('auth', 'cliente', '401', 'No coincide: {"error":"Usuario o contrasenia incorrectos"}. No hay token, así que nunca se llega a gestión.', 'err'),
  ];

  const SEC_VENCIDA = [
    msg('cliente', 'gestion', 'GET + vencido', 'La pestaña sigue abierta y el token ya pasó su fecha exp.', 'token'),
    msg('gestion', 'gestion', 'verify falla', 'jwt.verify lanza un error porque el token expiró.', 'err'),
    msg('gestion', 'cliente', '401', '{"error":"La sesion no es valida o ya expiro"}', 'err'),
    msg('cliente', 'cliente', 'borra y redirige', 'fetchConSesion borra el token y envía a login.html?expirada=1.', 'err'),
    msg('cliente', 'auth', 'nuevo login', 'El usuario vuelve a escribir su clave y el ciclo empieza otra vez.'),
  ];

  const secuencia = (title, scenarios) => ({ type: 'sequence', title, lanes: LANES, scenarios });

  // ---------------------------------------------------------- árboles
  const dir = (name, depth, extra) => ({ name, type: 'dir', depth, ...extra });
  const file = (name, depth, note, muted) => ({ name, type: 'file', depth, note, muted });

  const TREE_SISTEMA = [
    dir('microservicios', 0),
    dir('parametrization', 1),
    dir('db_relational_model', 2),
    file('DB_authentication_model.sql', 3, 'nuevo: base authentication'),
    file('DB_relational_model.sql', 3, 'clase 10: personal_management'),
    dir('BACKEND_SRV_1', 1, { note: 'nuevo: autenticación, :3001' }),
    dir('BACKEND_SRV_2', 1, { note: 'backend de la clase 10, :3000' }),
    dir('FRONTEND', 1, { note: 'frontend de la clase 10 + login' }),
  ];

  const TREE_SRV2 = [
    dir('BACKEND_SRV_2', 0),
    dir('src', 1),
    dir('config', 2),
    file('app.js', 3, 'cambia'),
    file('database.js', 3, '', true),
    file('environment.js', 3, 'cambia'),
    dir('controllers', 2, { note: 'sin cambios' }),
    dir('middleware', 2),
    file('autenticacion.js', 3, 'NUEVO'),
    file('errorHandler.js', 3, '', true),
    file('validateInput.js', 3, '', true),
    dir('models', 2, { note: 'sin cambios' }),
    dir('routes', 2, { note: 'sin cambios' }),
    dir('services', 2, { note: 'sin cambios' }),
    dir('utils', 2, { note: 'sin cambios' }),
    file('index.js', 2, 'cambia'),
    file('.env.example', 1, 'cambia'),
    file('package.json', 1, 'cambia'),
  ];

  // ---------------------------------------------------------- diapositivas
  const slides = [
    {
      id: 'inicio',
      kind: 'cover',
      phase: 'inicio',
      title: 'Microservicios',
      titleParts: ['Micro', 'servicios'],
      kicker: 'Clase 11 · Taller de backend con Node.js',
      lead: [
        'Construye e integra <strong>dos microservicios</strong>: uno autentica con <strong>SHA-256</strong> y entrega un <strong>JWT</strong>; el otro lo verifica y protege tus datos.',
      ],
      meta: ['2 microservicios', '2 bases de datos', 'SHA-256 + JWT'],
      visual: {
        type: 'editor',
        caption: 'Al final del taller, el primer servicio responderá así a un login:',
        tabs: [{ title: 'respuesta 200', lang: 'json', text: JSON.stringify(LOGIN_OK, null, 2), status: 'JSON · 200 OK' }],
      },
      flow: { lit: TODO, route: COMPLETO, boot: true },
      bubble: { title: 'Hola, soy Bit', text: 'Hoy un sistema se parte en dos: uno decide quién eres y el otro te entrega los datos. Avanza con las flechas del teclado o con los botones.' },
      mood: 'wave',
    },

    // ------------------------------------------------------ CONCEPTOS
    {
      step: 0,
      phase: 'conceptos',
      layer: 'concepto',
      title: '¿Qué es un microservicio?',
      lead: ['Una aplicación pequeña e independiente que se encarga de <strong>una sola responsabilidad</strong> y habla con las demás por la red, normalmente con HTTP y JSON.'],
      list: [
        '<strong>Una responsabilidad:</strong> autenticar, o gestionar datos, pero no ambas.',
        '<strong>Proceso propio:</strong> se arranca, se detiene y se despliega solo.',
        '<strong>Datos propios:</strong> su base de datos no la escribe nadie más.',
        '<strong>Contrato claro:</strong> los demás solo conocen su API, no su código.',
      ],
      visual: { type: 'architecture', caption: 'El sistema de esta clase: dos microservicios y un navegador' },
      flow: { lit: ['auth', 'gestion'] },
      bubble: { text: 'Un microservicio no se define por tener pocas líneas, sino por tener un trabajo claro que puede hacer sin los demás.' },
    },
    {
      step: 1,
      phase: 'conceptos',
      layer: 'concepto',
      title: 'Monolito frente a microservicios',
      lead: ['En un <strong>monolito</strong> todo vive en un mismo programa: se escribe, se arranca y se cae junto.'],
      table: {
        head: ['', 'Monolito', 'Microservicios'],
        rows: [
          ['<strong>Procesos</strong>', 'uno', 'varios'],
          ['<strong>Despliegue</strong>', 'todo a la vez', 'cada uno por separado'],
          ['<strong>Datos</strong>', 'una base', 'una por servicio'],
          ['<strong>Una falla</strong>', 'puede tumbar todo', 'queda contenida'],
          ['<strong>Complejidad</strong>', 'baja al comenzar', 'red y configuración'],
        ],
      },
      visual: { type: 'failsim' },
      flow: { lit: [] },
      bubble: { text: 'Prueba primero en Monolito y luego en Microservicios: tumba autenticación y compara qué puede seguir haciendo un usuario.' },
      mood: 'think',
    },
    {
      step: 2,
      phase: 'conceptos',
      layer: 'concepto',
      title: 'Cuándo usarlos y qué cuestan',
      lead: ['Separar tiene un precio. Con un equipo y una aplicación pequeños, un monolito bien organizado suele ser la mejor decisión.'],
      visual: {
        type: 'columns',
        columns: [
          {
            title: 'Se gana', tone: 'ok',
            items: ['Escalar solo la parte que lo necesita', 'Equipos que trabajan y publican por separado', 'Una falla no arrastra todo el sistema', 'Cambiar un servicio sin tocar los demás'],
          },
          {
            title: 'Se paga', tone: 'cost',
            items: ['La red puede fallar o ser lenta', 'Más procesos, puertos y archivos .env', 'No hay JOIN entre bases de datos separadas', 'Probar todo junto exige encender todo'],
          },
        ],
      },
      flow: { lit: [] },
      bubble: { text: 'Aquí partimos una aplicación pequeña a propósito, para aprender las ideas. En el trabajo real la separación debe tener una razón.' },
    },

    // ------------------------------------------------------ DISEÑO
    {
      step: 3,
      phase: 'diseno',
      layer: 'arquitectura',
      title: 'El sistema que vas a construir',
      lead: ['Dos backends en Node.js y Express, dos bases de datos en MySQL y un frontend en JavaScript puro.'],
      table: {
        head: ['Pieza', 'Puerto', 'Responsabilidad'],
        rows: [
          ['<code>FRONTEND</code>', '8000', 'Login y pantallas de gestión'],
          ['<code>SRV_1</code>', '3001', 'Validar usuario y clave; firmar el JWT'],
          ['<code>SRV_2</code>', '3000', 'Verificar el JWT; hacer el CRUD'],
          ['MySQL', '3306', 'Bases <code>authentication</code> y <code>personal_management</code>'],
        ],
      },
      visual: { type: 'architecture', caption: 'SRV_1 es BACKEND_SRV_1 y SRV_2 es BACKEND_SRV_2' },
      flow: { lit: TODO, route: COMPLETO },
      bubble: { text: 'Lo único que comparten los dos backends es un secreto, JWT_SECRET. No hay ninguna línea entre ellos: no se llaman.' },
    },
    {
      step: 4,
      phase: 'diseno',
      layer: 'contrato',
      title: 'Del login a los datos',
      lead: [
        'Avanza mensaje por mensaje. Los dos backends <strong>nunca se hablan entre sí</strong>: el navegador lleva el token de uno al otro.',
        'Cambia de escenario para ver dónde se corta cuando algo sale mal.',
      ],
      visual: secuencia('El recorrido completo', [
        { id: 'ok', label: 'Todo bien', steps: SEC_SESION },
        { id: 'mala', label: 'Clave errada', steps: SEC_MALA },
        { id: 'vencida', label: 'Token vencido', steps: SEC_VENCIDA },
      ]),
      flow: { lit: ['cliente'] },
      bubble: { text: 'El token es el contrato: autenticación promete firmarlo con JWT_SECRET y gestión promete aceptar solo lo firmado con ese mismo secreto.' },
    },
    {
      step: 5,
      phase: 'diseno',
      layer: 'terminal',
      title: 'Prerrequisitos',
      lead: ['Necesitas el proyecto de <strong>gestión personal</strong> de la clase 10 (será el segundo microservicio) y un servidor MySQL corriendo.'],
      checklist: [
        { name: 'Node.js', detail: 'Versión 18 o superior', cmd: 'node -v' },
        { name: 'npm', detail: 'Viene con Node.js', cmd: 'npm -v' },
        { name: 'MySQL', detail: 'Versión 8.0 o superior', cmd: 'mysql --version' },
        { name: 'Python 3', detail: 'Opcional, sirve el frontend', cmd: 'python3 --version' },
      ],
      visual: { type: 'terminal', commands: [{ code: 'node -v\nnpm -v\nmysql --version\npython3 --version' }] },
      flow: { lit: [] },
      bubble: { text: 'Node 18 trae fetch y el ejecutor de pruebas node --test, que usan las pruebas del proyecto.' },
    },
    {
      step: 6,
      phase: 'diseno',
      layer: 'carpetas',
      title: 'La estructura del proyecto',
      lead: ['Una carpeta por microservicio. Cada uno tiene su <code>package.json</code>, sus dependencias y su <code>.env</code>.'],
      commands: [
        { label: 'Crea la carpeta y trae lo de la clase 10 (ajusta la ruta a tu copia)', code: 'mkdir microservicios && cd microservicios\ncp -r ../personal_management/BACKEND BACKEND_SRV_2\ncp -r ../personal_management/FRONTEND FRONTEND\ncp -r ../personal_management/parametrization parametrization' },
        { label: 'El servicio nuevo', code: 'mkdir BACKEND_SRV_1' },
      ],
      visual: { type: 'explorer', title: 'Al terminar la clase', tree: TREE_SISTEMA },
      flow: { lit: ['auth', 'gestion'] },
      bubble: { text: 'No hay un package.json en la raíz: cada servicio es un proyecto independiente que se instala y se ejecuta desde su carpeta.' },
    },

    // ------------------------------------------------------ DATOS Y SHA-2
    {
      step: 7,
      phase: 'datos',
      layer: 'MySQL',
      title: 'Una base de datos por servicio',
      lead: [
        'La gestión sigue usando <code>personal_management</code>. Las cuentas de acceso viven aparte, en <code>authentication</code>.',
        'El orden importa: <code>personal_manager</code> debe existir <strong>antes</strong> de crear la base de autenticación.',
      ],
      visual: {
        type: 'stack',
        items: [
          { label: '1. La base de gestión (clase 10)', code: 'mysql -u root -p < parametrization/db_relational_model/DB_relational_model.sql' },
          {
            caption: '2. Abre la consola con mysql -u root -p y crea el usuario de la aplicación:',
            tabs: [{
              title: 'consola mysql',
              lang: 'sql',
              status: 'SQL · valores de práctica',
              text: "CREATE USER IF NOT EXISTS 'personal_manager'@'localhost'\n  IDENTIFIED BY 'person_123456*';\n\nGRANT ALL PRIVILEGES ON personal_management.*\n  TO 'personal_manager'@'localhost';\n\nFLUSH PRIVILEGES;\nEXIT;",
            }],
          },
          { label: '3. La base de autenticación', code: 'mysql -u root -p < parametrization/db_relational_model/DB_authentication_model.sql' },
        ],
      },
      flow: { lit: ['dbauth', 'dbgestion'] },
      bubble: { text: 'Las cuentas de acceso (quién puede entrar) no son los usuarios que administras en la pestaña Usuarios. No hay relación entre ellos.' },
    },
    {
      step: 8,
      phase: 'datos',
      layer: 'MySQL',
      title: 'La tabla CUENTA',
      file: SQL_AUTH,
      lead: [
        '<code>password</code> guarda <code>sal:hash</code>, nunca la contraseña. Mide 97 caracteres: 32 + 1 + 64.',
        'La aplicación recibe solo <strong>SELECT</strong>: aunque alguien la engañe, no puede crear ni borrar cuentas.',
      ],
      visual: editor(
        { file: SQL_AUTH, title: 'tabla CUENTA', lang: 'sql', range: [11, 30], focus: [[27, 27]] },
        { file: SQL_AUTH, title: 'permisos y admin', lang: 'sql', range: [32, 49], focus: [[35, 35], [46, 49]] }),
      flow: { lit: ['auth', 'dbauth'], route: [['auth', 'dbauth', 'req'], ['dbauth', 'auth', 'res']] },
      bubble: { text: 'El script se puede ejecutar varias veces: CREATE ... IF NOT EXISTS e INSERT IGNORE no borran ni duplican nada.' },
    },
    {
      step: 9,
      phase: 'datos',
      layer: 'SHA-2',
      title: 'SHA-2: un hash, no un cifrado',
      lead: ['<strong>SHA-2</strong> es una familia de funciones <em>hash</em>. Usamos <strong>SHA-256</strong>, que ya viene en Node.js (módulo <code>crypto</code>) y en MySQL (<code>SHA2()</code>).'],
      list: [
        'La misma entrada da siempre la misma salida.',
        'La salida mide igual sin importar el tamaño de la entrada.',
        'No se puede <strong>revertir</strong>: no existe «descifrar».',
        'Un cambio mínimo en la entrada cambia todo el resultado.',
      ],
      commands: [{ label: 'Compruébalo con Node.js', code: 'node -p "require(\'crypto\').createHash(\'sha256\').update(\'Admin123*\').digest(\'hex\')"' }],
      visual: { type: 'shalab', mode: 'hash' },
      flow: { lit: ['auth'] },
      bubble: { text: 'Escribe en el laboratorio: cambiar una sola letra produce un hash que no se parece al anterior. Eso se llama efecto avalancha.' },
      mood: 'surprised',
    },
    {
      step: 10,
      phase: 'datos',
      layer: 'SHA-2',
      title: 'La sal: misma clave, distinto hash',
      lead: [
        'La <strong>sal</strong> es un texto aleatorio, distinto en cada cuenta, que se mezcla con la contraseña antes de calcular el hash.',
        'Para validar un ingreso se toma la sal guardada, se <strong>repite el cálculo</strong> y se comparan los dos resultados.',
      ],
      visual: { type: 'shalab', mode: 'salt' },
      flow: { lit: ['auth', 'dbauth'] },
      bubble: { text: 'La sal no es secreta: va junto al hash. Su trabajo es que no sirvan las tablas de hashes calculadas de antemano.' },
    },

    // ------------------------------------------------------ AUTENTICACIÓN
    {
      step: 11,
      phase: 'auth',
      layer: 'npm',
      title: 'Crear el proyecto e instalar dependencias',
      lead: ['Empieza el primer microservicio dentro de <code>BACKEND_SRV_1</code>.'],
      commands: [
        { label: 'Inicializa e instala (fija las versiones mayores)', code: 'cd BACKEND_SRV_1\nnpm init -y\nnpm install express@4 cors dotenv@16 jsonwebtoken mysql2\nnpm install -D nodemon' },
        { label: 'Las carpetas', code: 'mkdir src tests\ncd src\nmkdir config controllers middleware models routes services utils\ncd ..' },
      ],
      visual: {
        type: 'packages',
        title: 'Dependencias del proyecto (versiones instaladas)',
        rows: [
          ['express', '4.22.3', 'Servidor HTTP, rutas y middlewares'],
          ['cors', '2.8.6', 'Permite que el frontend llame desde otro origen'],
          ['dotenv', '16.6.1', 'Carga las variables del archivo .env'],
          ['jsonwebtoken', '9.0.3', 'Firma (SRV_1) y verifica (SRV_2) los JWT'],
          ['mysql2', '3.24', 'Conexión a MySQL con promesas'],
          ['nodemon', '3.1.14', 'Reinicia al guardar cambios', 'desarrollo'],
          ['crypto', 'Node.js', 'SHA-256, sal y comparación segura', 'incluido'],
          ['node:test', 'Node.js', 'Pruebas automatizadas', 'incluido'],
        ],
      },
      flow: { lit: ['auth'] },
      bubble: { text: 'Ojo con express@4 y dotenv@16: sin el número, npm instala la versión más nueva (hoy Express 5), que no es con la que se construyó este proyecto.' },
    },
    {
      step: 12,
      phase: 'auth',
      layer: 'npm',
      title: 'Los scripts del package.json',
      file: `${S1}/package.json`,
      lead: ['Agrega los tres scripts. <code>main</code> apunta a <code>src/index.js</code>.'],
      list: [
        '<code>npm start</code> ejecuta el servicio.',
        '<code>npm run dev</code> lo reinicia al guardar cambios.',
        '<code>npm test</code> corre las pruebas (copia la carpeta <code>tests/</code> de la clase).',
      ],
      visual: editor({ file: `${S1}/package.json`, lang: 'json', focus: [[6, 10], [12, 21]] }),
      flow: { lit: ['auth'] },
      bubble: { text: 'El proyecto es CommonJS (usa require): no tiene "type": "module". Si npm init agregó "type": "commonjs", está bien.' },
    },
    {
      step: 13,
      phase: 'auth',
      layer: 'entorno',
      title: '.env, .gitignore y el secreto',
      file: `${S1}/.env.example`,
      lead: [
        'La plantilla <code>.env.example</code> sí se comparte; el <code>.env</code> real, nunca.',
        'El secreto que firma los tokens <strong>no tiene valor por defecto</strong>: lo generas tú.',
      ],
      commands: [
        { label: 'Copia la plantilla (no sobrescribe si ya existe) y pon tu clave de MySQL', code: 'cp -n .env.example .env' },
        { label: 'Genera el secreto y pégalo en JWT_SECRET', code: 'node -p "require(\'crypto\').randomBytes(32).toString(\'hex\')"' },
      ],
      visual: editor(
        { file: `${S1}/.env.example`, lang: 'ini', focus: [[11, 15]] },
        { file: `${S1}/.gitignore`, lang: 'bash', focus: [[5, 8]] }),
      flow: { lit: ['auth', 'secreto'] },
      bubble: { text: 'Quien conozca JWT_SECRET puede fabricar tokens válidos. Trátalo como una contraseña maestra.' },
      mood: 'think',
    },
    {
      step: 14,
      phase: 'auth',
      layer: 'config/',
      title: 'Configuración y conexión',
      file: `${S1}/src/config/environment.js`,
      lead: [
        '<code>environment.js</code> es el único que lee <code>process.env</code>.',
        '<code>database.js</code> crea un <strong>pool</strong> de conexiones y comprueba que la base responda.',
      ],
      visual: editor(
        js(`${S1}/src/config/environment.js`, { focus: [[18, 21]] }),
        js(`${S1}/src/config/database.js`, { focus: [[5, 14]] })),
      flow: { lit: ['auth', 'dbauth'], route: [['auth', 'dbauth', 'req'], ['dbauth', 'auth', 'res']] },
      bubble: { text: 'jwt.secret queda como texto vacío si falta: así index.js puede detectarlo y negarse a arrancar.' },
    },
    {
      step: 15,
      phase: 'auth',
      layer: 'utils/ y middleware/',
      title: 'Errores y validación de entrada',
      lead: ['Tres piezas pequeñas: <code>crearError</code> le pone un código HTTP a un error, el validador revisa el body y <code>validarCon</code> lo convierte en middleware.'],
      visual: editor(
        js(`${S1}/src/utils/helpers.js`, { focus: [[5, 9]] }),
        js(`${S1}/src/utils/validators.js`, { focus: [[3, 15]] }),
        js(`${S1}/src/middleware/validateInput.js`, { focus: [[4, 13]] })),
      flow: { lit: ['auth'], route: BODY_MALO },
      bubble: { text: 'La contraseña no se recorta con trim(): los espacios hacen parte de ella.' },
    },
    {
      step: 16,
      phase: 'auth',
      layer: 'utils/',
      title: 'password.js: SHA-256 con sal',
      file: `${S1}/src/utils/password.js`,
      lead: [
        '<code>generarHash</code> crea la sal con <code>randomBytes(16)</code> y devuelve <code>sal:hash</code>.',
        '<code>verificarPassword</code> repite el cálculo y compara con <code>timingSafeEqual</code>, que tarda lo mismo acierte o no.',
      ],
      visual: editor(js(`${S1}/src/utils/password.js`, { range: [6, 27], focus: [[12, 14], [20, 24]] })),
      flow: { lit: ['auth'] },
      bubble: { text: 'Es el mismo cálculo del script SQL: SHA2(CONCAT(@sal, contrasenia), 256). Por eso la cuenta admin creada en MySQL funciona desde Node.js.' },
    },
    {
      step: 17,
      phase: 'auth',
      layer: 'models/',
      title: 'El modelo Cuenta',
      file: `${S1}/src/models/Cuenta.js`,
      lead: ['Valida el <code>id</code> y el <code>username</code>. A propósito <strong>no tiene</strong> campo para la contraseña ni para su hash.'],
      visual: editor(js(`${S1}/src/models/Cuenta.js`, { focus: [[31, 41]] })),
      flow: { lit: ['auth'] },
      bubble: { text: 'Si el objeto no puede guardar el hash, el hash no puede terminar por error en una respuesta de la API.' },
    },
    {
      step: 18,
      phase: 'auth',
      layer: 'services/',
      title: 'AuthService: autenticar',
      file: `${S1}/src/services/authService.js`,
      lead: ['Busca la cuenta, comprueba la contraseña y devuelve una <code>Cuenta</code> o lanza un 401.'],
      list: [
        'Consulta <strong>parametrizada</strong> (<code>?</code>): sin inyección SQL.',
        'El mismo mensaje si falla el usuario o la clave.',
        'Si el usuario no existe, compara contra un <strong>hash señuelo</strong> para tardar lo mismo.',
      ],
      visual: editor(js(`${S1}/src/services/authService.js`, { range: [7, 38], focus: [[11, 13], [20, 28]] })),
      flow: { lit: ['auth', 'dbauth'], route: MAL_LOGIN },
      bubble: { text: 'Responder "el usuario no existe" le regalaría a un atacante la lista de cuentas válidas.' },
    },
    {
      step: 19,
      phase: 'auth',
      layer: 'JWT',
      title: '¿Qué es un JWT?',
      lead: [
        'Un <strong>JSON Web Token</strong> son tres partes en base64url separadas por puntos: <code>header.payload.firma</code>.',
        'Está <strong>firmado, no cifrado</strong>: cualquiera puede leerlo, pero nadie puede cambiarlo sin el secreto.',
      ],
      table: {
        head: ['Parte', 'Contiene'],
        rows: [
          ['header', 'El algoritmo: <code>HS256</code>'],
          ['payload', '<code>username</code>, <code>sub</code> (id), <code>iat</code> y <code>exp</code>'],
          ['firma', 'HMAC-SHA256 de las otras dos con <code>JWT_SECRET</code>'],
        ],
      },
      visual: { type: 'jwtlab' },
      flow: { lit: ['auth', 'secreto', 'gestion'] },
      bubble: { text: 'Aquí SHA-2 aparece por segunda vez: HS256 es HMAC con SHA-256. Nunca pongas contraseñas ni datos sensibles en el payload.' },
      mood: 'surprised',
    },
    {
      step: 20,
      phase: 'auth',
      layer: 'utils/',
      title: 'token.js: firmar el token',
      file: `${S1}/src/utils/token.js`,
      lead: ['<code>jwt.sign</code> recibe el contenido, el secreto y las opciones: <code>subject</code> es el id de la cuenta y <code>expiresIn</code> sale del <code>.env</code>.'],
      visual: editor(
        js(`${S1}/src/utils/token.js`, { focus: [[6, 10]] }),
        { title: 'payload.json', lang: 'json', status: 'payload decodificado', text: '{\n  "username": "admin",\n  "iat": 1795795334,\n  "exp": 1795798934,\n  "sub": "1"\n}' }),
      flow: { lit: ['auth', 'secreto'], route: [['auth', 'cliente', 'token']] },
      bubble: { text: 'exp - iat = 3600 segundos: la hora que dice JWT_EXPIRES_IN=1h. La librería calcula las dos fechas por ti.' },
    },
    {
      step: 21,
      phase: 'auth',
      layer: 'controllers/ y routes/',
      title: 'Controlador y ruta del login',
      lead: ['La ruta valida el body, el controlador llama al service y, si todo va bien, responde con el token.'],
      endpoints: [['POST', '/api/auth/login', 'Validar y entregar el token']],
      visual: editor(
        js(`${S1}/src/controllers/authController.js`, { focus: [[8, 16]] }),
        js(`${S1}/src/routes/authRoutes.js`, { focus: [[9, 9]] }),
        js(`${S1}/src/routes/index.js`, { title: 'routes/index.js', focus: [[8, 8]] })),
      flow: { lit: ['auth'], route: LOGIN },
      bubble: { text: 'El prefijo se arma en dos partes: /api en app.js y /auth en routes/index.js. La ruta final es /api/auth/login.' },
    },
    {
      step: 22,
      phase: 'auth',
      layer: 'config/ y middleware/',
      title: 'Errores y aplicación Express',
      lead: ['Este servicio registra solo el <strong>mensaje</strong> de cada error: el error completo podría traer la contraseña.'],
      visual: editor(
        js(`${S1}/src/config/app.js`, { range: [8, 32], focus: [[10, 14], [22, 22], [29, 30]] }),
        js(`${S1}/src/middleware/errorHandler.js`, { focus: [[4, 7], [9, 9]] })),
      flow: { lit: ['auth', 'cliente'] },
      bubble: { text: 'cors() deja que el frontend (puerto 8000) llame al puerto 3001. Para el navegador, otro puerto ya es otro origen.' },
    },
    {
      step: 23,
      phase: 'auth',
      layer: 'src/',
      title: 'Arrancar el servicio',
      file: `${S1}/src/index.js`,
      lead: ['Sin <code>JWT_SECRET</code> no se puede firmar nada, así que el proceso termina con un mensaje claro.'],
      commands: [{ label: 'Desde BACKEND_SRV_1', code: 'npm start' }],
      output: {
        title: 'Si todo está bien:',
        command: 'npm start',
        lines: ['Servicio de autenticacion escuchando en http://localhost:3001', 'Conexion a MySQL exitosa (authentication@localhost:3306)'],
      },
      visual: editor(js(`${S1}/src/index.js`, { focus: [[7, 11]] })),
      flow: { lit: ['auth', 'dbauth'], route: [['auth', 'dbauth', 'req'], ['dbauth', 'auth', 'res']], boot: true },
      bubble: { text: 'El servicio arranca aunque falle MySQL. Confirma siempre que aparezca la línea "Conexion a MySQL exitosa".' },
    },
    {
      step: 24,
      phase: 'auth',
      layer: 'curl',
      title: 'Probar el login',
      lead: ['Con el servicio encendido, abre otra terminal. Elige una petición y presiona <strong>Enviar</strong> para ver su recorrido.'],
      visual: { type: 'tester', requests: PRUEBAS_LOGIN },
      flow: { lit: ['auth'] },
      bubble: { text: '400 significa que faltan datos o llegaron mal; 401, que las credenciales no sirven. Nunca dicen cuál de las dos falló.' },
    },

    // ------------------------------------------------------ INTEGRAR
    {
      step: 25,
      phase: 'integrar',
      layer: 'SRV_2',
      title: 'El segundo servicio ya existe',
      lead: ['<code>BACKEND_SRV_2</code> es la API de gestión personal de la clase 10. Para integrarla <strong>no se tocan</strong> controladores, services, modelos ni rutas.'],
      ordered: [
        'Instalar <code>jsonwebtoken</code>.',
        'Compartir <code>JWT_SECRET</code>.',
        'Crear <code>middleware/autenticacion.js</code>.',
        'Exigirlo en <code>config/app.js</code>.',
        'No arrancar sin secreto (<code>index.js</code>).',
      ],
      visual: { type: 'explorer', title: 'Qué cambia respecto a la clase 10', tree: TREE_SRV2 },
      flow: { lit: ['gestion', 'dbgestion'] },
      bubble: { text: 'Esta es una ventaja de las capas: la seguridad se agrega delante de las rutas sin reescribir la lógica de negocio.' },
    },
    {
      step: 26,
      phase: 'integrar',
      layer: 'entorno',
      title: 'Dependencia y secreto compartido',
      file: `${S2}/.env.example`,
      lead: [
        '<code>JWT_SECRET</code> debe ser <strong>exactamente el mismo</strong> en los dos <code>.env</code>.',
        'Este servicio no necesita <code>JWT_EXPIRES_IN</code>: la fecha ya viene dentro del token.',
      ],
      commands: [{ label: 'En la carpeta del segundo servicio', code: 'cd ../BACKEND_SRV_2\nnpm install jsonwebtoken' }],
      visual: editor(
        { file: `${S2}/.env.example`, lang: 'ini', focus: [[11, 12]] },
        js(`${S2}/src/config/environment.js`, { focus: [[17, 20]] }),
        { file: `${S2}/package.json`, lang: 'json', focus: [[16, 16]] }),
      flow: { lit: ['auth', 'secreto', 'gestion'] },
      bubble: { text: 'Si los secretos son distintos, el login funciona pero la pantalla vuelve enseguida con "Su sesión expiró". Es el error más común.' },
      mood: 'think',
    },
    {
      step: 27,
      phase: 'integrar',
      layer: 'middleware/',
      title: 'El middleware de autenticación',
      file: `${S2}/src/middleware/autenticacion.js`,
      lead: ['Es el guardia de la puerta de gestión.'],
      list: [
        'Lee <code>Authorization: Bearer &lt;token&gt;</code>.',
        '<code>jwt.verify</code> comprueba la firma y la expiración.',
        'Si pasa, deja los datos en <code>req.cuenta</code> y llama a <code>next()</code>.',
        'Si no, responde <strong>401</strong>.',
      ],
      visual: editor(js(`${S2}/src/middleware/autenticacion.js`, { focus: [[13, 16], [18, 23]] })),
      flow: { lit: ['gestion', 'secreto'], route: TOKEN_MALO },
      bubble: { text: 'Fijar algorithms: ["HS256"] impide aceptar tokens sin firma o firmados de otra forma. Y fíjate: no llama a SRV_1, le basta el secreto.' },
    },
    {
      step: 28,
      phase: 'integrar',
      layer: 'config/',
      title: 'Proteger todas las rutas',
      file: `${S2}/src/config/app.js`,
      lead: [
        'Basta con poner el middleware antes del router: <code>app.use(\'/api\', requiereAutenticacion, rutas)</code>.',
        '<code>cors()</code> va <strong>antes</strong>: así la consulta previa del navegador (<code>OPTIONS</code>, sin token) recibe su 204.',
      ],
      visual: editor(js(`${S2}/src/config/app.js`, { range: [7, 35], focus: [[7, 7], [14, 14], [24, 25]] })),
      flow: { lit: ['gestion'], route: SIN_TOKEN },
      bubble: { text: 'Frente a la clase 10, aquí CORS quedó abierto a cualquier origen. El token protege los datos, pero antes de publicar conviene volver a restringirlo.' },
    },
    {
      step: 29,
      phase: 'integrar',
      layer: 'src/',
      title: 'Sin secreto, no arranca',
      file: `${S2}/src/index.js`,
      lead: ['La misma protección del primer servicio: mejor detenerse que responder sin poder verificar.'],
      commands: [{ label: 'En otra terminal, desde BACKEND_SRV_2', code: 'npm start' }],
      output: {
        title: 'Si todo está bien:',
        command: 'npm start',
        lines: ['Servidor escuchando en http://localhost:3000', 'Conexion a MySQL exitosa (personal_management@localhost:3306)'],
      },
      visual: editor(js(`${S2}/src/index.js`, { focus: [[7, 11]] })),
      flow: { lit: ['gestion', 'dbgestion'], route: [['gestion', 'dbgestion', 'req'], ['dbgestion', 'gestion', 'res']], boot: true },
      bubble: { text: 'Ya tienes dos procesos de Node.js en puertos distintos. Eso, con sus dos bases de datos, son tus dos microservicios.' },
    },

    // ------------------------------------------------------ REDIRECCIÓN
    {
      step: 30,
      phase: 'redirigir',
      layer: 'concepto',
      title: '¿Quién redirige de un backend al otro?',
      lead: ['El <strong>navegador</strong>. Pide el token a un servicio, cambia de página y usa ese token con el otro.'],
      table: {
        head: ['Forma', 'Cómo funciona', 'Aquí'],
        rows: [
          ['<strong>Redirige el frontend</strong>', '<code>location.replace</code> y cabecera <code>Authorization</code>', 'Sí'],
          ['Redirección HTTP 302', 'No puede agregar esa cabecera: el token iría en la URL o en una cookie', 'No'],
          ['API Gateway', 'Una sola puerta que reenvía cada petición', 'No'],
          ['Servicio llama a servicio', 'Gestión consulta a autenticación; si cae una, caen ambas', 'No'],
        ],
      },
      visual: secuencia('La redirección, ida y vuelta', [
        { id: 'entrar', label: 'Entrar', steps: SEC_SESION.slice(4) },
        { id: 'volver', label: 'Volver al login', steps: SEC_VENCIDA },
      ]),
      flow: { lit: ['auth', 'cliente', 'gestion'] },
      bubble: { text: 'Redirigir aquí es dos cosas: cambiar de página (login.html a index.html) y cambiar de servidor (puerto 3001 a puerto 3000).' },
    },
    {
      step: 31,
      phase: 'redirigir',
      layer: 'js/',
      title: 'Dos direcciones y la llamada de login',
      file: `${FE}/js/config.js`,
      lead: [
        'El frontend conoce <strong>dos URL base</strong>, una por servicio.',
        '<code>authApi.js</code> es el único que usa <code>fetch</code> sin token: todavía no lo tiene.',
      ],
      visual: editor(
        js(`${FE}/js/config.js`, { focus: [[4, 4], [7, 7]] }),
        js(`${FE}/js/api/authApi.js`, { focus: [[5, 10]] })),
      flow: { lit: ['cliente', 'auth'], route: LOGIN },
      bubble: { text: 'Si cambias el puerto de un servicio, este es el archivo que también debes cambiar.' },
    },
    {
      step: 32,
      phase: 'redirigir',
      layer: 'FRONTEND/',
      title: 'login.html: la puerta de entrada',
      file: `${FE}/login.html`,
      lead: [
        'Un formulario con usuario y contraseña, y un espacio para el mensaje de error.',
        'El orden de los <code>script</code> importa: configuración y utilidades antes de <code>login.js</code>.',
      ],
      visual: editor(
        { file: `${FE}/login.html`, title: 'login.html · formulario', lang: 'xml', range: [14, 35], focus: [[17, 17]] },
        { file: `${FE}/login.html`, title: 'login.html · scripts', lang: 'xml', range: [36, 43], focus: [[37, 41]] }),
      flow: { lit: ['cliente'] },
      bubble: { text: 'method="post" es un seguro: si el JavaScript fallara, el navegador no pondría la clave en la URL.' },
    },
    {
      step: 33,
      phase: 'redirigir',
      layer: 'js/',
      title: 'login.js: entrar y redirigir',
      file: `${FE}/js/login.js`,
      lead: ['Aquí ocurre el salto de un servicio al otro.'],
      list: [
        'Si ya hay token, va directo a <code>index.html</code>.',
        'Pide el token al puerto 3001.',
        'Lo guarda y <strong>redirige</strong> con <code>location.replace</code>.',
        'Si llega <code>?expirada</code>, explica por qué volvió.',
      ],
      visual: editor(
        js(`${FE}/js/login.js`, { title: 'login.js · al enviar', range: [21, 41], focus: [[27, 32]] }),
        js(`${FE}/js/login.js`, { title: 'login.js · al abrir', range: [1, 20], focus: [[3, 6], [17, 19]] })),
      flow: { lit: ['cliente', 'auth', 'gestion'], route: COMPLETO },
      bubble: { text: 'replace() no deja el login en el historial: el botón Atrás no regresa al formulario ya usado.' },
    },
    {
      step: 34,
      part: { n: 1, of: 2, label: 'Guardar la sesión' },
      phase: 'redirigir',
      layer: 'js/utils/',
      title: 'sesion.js: el token en el navegador',
      file: `${FE}/js/utils/sesion.js`,
      lead: [
        'El token se guarda en <code>sessionStorage</code>: dura lo que dure la pestaña.',
        '<code>exigir()</code> devuelve al login a quien entre sin sesión.',
      ],
      visual: editor(
        js(`${FE}/js/utils/sesion.js`, { title: 'sesion.js · guardar', range: [1, 20], focus: [[4, 7]] }),
        js(`${FE}/js/utils/sesion.js`, { title: 'sesion.js · exigir', range: [22, 31], focus: [[24, 30]] })),
      flow: { lit: ['cliente'] },
      bubble: { text: 'Se revisa también en pageshow porque el botón Atrás puede restaurar la página sin volver a cargarla.' },
    },
    {
      step: 34,
      part: { n: 2, of: 2, label: 'fetchConSesion' },
      phase: 'redirigir',
      layer: 'js/utils/',
      title: 'sesion.js: el token en el navegador',
      file: `${FE}/js/utils/sesion.js`,
      lead: [
        'Envuelve a <code>fetch</code>: agrega <code>Authorization: Bearer</code> en cada llamada.',
        'Si el servidor responde <strong>401</strong>, borra la sesión y redirige a <code>login.html?expirada=1</code>.',
      ],
      visual: editor(js(`${FE}/js/utils/sesion.js`, { range: [33, 46], focus: [[36, 39], [41, 44]] })),
      flow: { lit: ['cliente', 'gestion'], route: TOKEN_MALO },
      bubble: { text: 'Quien decide si el token sirve es siempre el backend. El frontend solo reacciona al 401.' },
    },
    {
      step: 35,
      phase: 'redirigir',
      layer: 'FRONTEND/',
      title: 'Página privada y cerrar sesión',
      file: `${FE}/index.html`,
      lead: [
        '<code>index.html</code> comprueba la sesión <strong>antes</strong> de mostrar el contenido y suma un botón para salir.',
        'Cerrar sesión es borrar el token y redirigir.',
      ],
      visual: editor(
        { file: `${FE}/index.html`, lang: 'xml', range: [10, 26], focus: [[12, 14], [21, 24]] },
        js(`${FE}/js/main.js`, { range: [21, 38], focus: [[22, 28], [34, 36]] })),
      flow: { lit: ['cliente'] },
      bubble: { text: 'Esta guarda es comodidad, no seguridad: cualquiera puede saltarla en su navegador. Lo que protege los datos es el 401 de SRV_2.' },
      mood: 'think',
    },
    {
      step: 36,
      phase: 'redirigir',
      layer: 'js/api/',
      title: 'De fetch a fetchConSesion',
      file: `${FE}/js/api/usuariosApi.js`,
      lead: [
        'En las APIs de usuarios, teléfonos, redes y perfiles solo cambia una cosa: <code>fetch</code> por <code>fetchConSesion</code>.',
        'En <code>index.html</code>, carga <code>sesion.js</code> en el <code>&lt;head&gt;</code>.',
      ],
      visual: editor(js(`${FE}/js/api/usuariosApi.js`, { range: [1, 28], focus: [[6, 6], [13, 13], [20, 20]] })),
      flow: { lit: ['cliente', 'gestion'], route: DATOS },
      bubble: { text: 'Un solo punto agrega el token. Si mañana cambia la forma de enviarlo, se toca sesion.js y nada más.' },
    },

    // ------------------------------------------------------ PROBAR Y CERRAR
    {
      step: 37,
      phase: 'probar',
      layer: 'terminal',
      title: 'Encender el sistema',
      lead: ['MySQL corriendo y <strong>tres terminales</strong> abiertas en la raíz del proyecto.'],
      commands: [
        { label: 'Terminal 1 · autenticación', code: 'cd BACKEND_SRV_1 && npm start' },
        { label: 'Terminal 2 · gestión', code: 'cd BACKEND_SRV_2 && npm start' },
        { label: 'Terminal 3 · frontend', code: 'cd FRONTEND && python3 -m http.server 8000' },
      ],
      list: ['Abre <code>http://localhost:8000/login.html</code> e ingresa con <code>admin</code> / <code>Admin123*</code>.'],
      visual: {
        type: 'outputs',
        panels: [
          { title: 'Terminal 1', command: 'npm start', lines: ['Servicio de autenticacion escuchando en http://localhost:3001', 'Conexion a MySQL exitosa (authentication@localhost:3306)'] },
          { title: 'Terminal 2', command: 'npm start', lines: ['Servidor escuchando en http://localhost:3000', 'Conexion a MySQL exitosa (personal_management@localhost:3306)'] },
          { title: 'Terminal 3', command: 'python3 -m http.server 8000', lines: ['Serving HTTP on :: port 8000 (http://[::]:8000/) ...'] },
        ],
      },
      flow: { lit: TODO, route: COMPLETO, boot: true },
      bubble: { text: 'npm start no recarga cambios. Si editas un .env, detén el servicio con Ctrl + C y vuelve a encenderlo.' },
    },
    {
      step: 38,
      phase: 'probar',
      layer: 'curl',
      title: 'El recorrido completo',
      lead: ['Primero guarda el token en la variable <code>TOKEN</code> (macOS y Linux) y envíalo al segundo servicio. Prueba cada petición con <strong>Enviar</strong>.'],
      visual: { type: 'tester', requests: PRUEBAS_SISTEMA },
      flow: { lit: [] },
      bubble: { text: 'La última petición es la prueba de la independencia: con autenticación apagada, gestión sigue atendiendo a quien ya tiene un token vigente.' },
      mood: 'surprised',
    },
    {
      step: 39,
      phase: 'probar',
      layer: 'tests/',
      title: 'Pruebas automatizadas',
      lead: ['No hace falta encender los servidores. Las pruebas con base de datos arrancan un MySQL <strong>temporal</strong> que no toca tus datos.'],
      commands: [{ label: 'Desde la raíz del proyecto', code: '(cd BACKEND_SRV_1 && npm test)\n(cd BACKEND_SRV_2 && npm test)' }],
      table: {
        head: ['Archivo', 'Qué comprueba'],
        rows: [
          ['<code>password.test.js</code>', 'Hash y verificación'],
          ['<code>api.test.js</code> (SRV_1)', 'Login, errores y permisos'],
          ['<code>models.test.js</code>', 'Validaciones de los modelos'],
          ['<code>services.test.js</code>', 'Services con la base simulada'],
          ['<code>api.test.js</code> (SRV_2)', 'API completa y tokens inválidos'],
        ],
      },
      visual: {
        type: 'outputs',
        panels: [
          { title: 'BACKEND_SRV_1', command: 'npm test', lines: ['ℹ tests 9', 'ℹ pass 9', 'ℹ fail 0'] },
          { title: 'BACKEND_SRV_2', command: 'npm test', lines: ['ℹ tests 26', 'ℹ pass 26', 'ℹ fail 0'] },
        ],
      },
      flow: { lit: ['auth', 'gestion'] },
      bubble: { text: 'Si las pruebas no encuentran el ejecutable mysqld, indícale la ruta con la variable MYSQLD_PATH.' },
    },
    {
      step: 40,
      phase: 'probar',
      layer: 'diagnóstico',
      title: 'Cuando algo falla',
      lead: ['Lee primero el mensaje: casi siempre dice en qué servicio buscar.'],
      list: [
        'Pantalla del login: revisa <strong>SRV_1</strong>.',
        'Tablas vacías después de entrar: revisa <strong>SRV_2</strong>.',
        'Entra y vuelve enseguida: revisa <strong>JWT_SECRET</strong>.',
      ],
      visual: {
        type: 'table',
        head: ['Síntoma', 'Causa probable', 'Solución'],
        rows: [
          ['«No fue posible conectar con el servicio de autenticación»', 'SRV_1 no está corriendo', 'Enciéndelo y revisa el puerto 3001'],
          ['«Su sesión expiró» justo después de entrar', '<code>JWT_SECRET</code> distinto', 'Igualar el valor y reiniciar ambos'],
          ['<code>Falta la variable JWT_SECRET</code>', 'No está en el <code>.env</code>', 'Generarlo y agregarlo'],
          ['<code>EADDRINUSE</code>', 'El puerto ya está ocupado', 'Detener el proceso anterior'],
          ['<code>Cannot find module \'jsonwebtoken\'</code>', 'Faltan dependencias', '<code>npm install</code> en ese servicio'],
          ['<code>Failed to fetch</code> en las tablas', 'SRV_2 apagado u otra URL', 'Encenderlo; revisar <code>config.js</code>'],
          ['<code>ERROR 1410</code> en el script', 'No existe <code>personal_manager</code>', 'Crearlo y repetir el script'],
        ],
      },
      flow: { lit: [] },
      bubble: { text: 'Ejecuta npm start desde la carpeta de cada servicio: dotenv busca el .env en la carpeta desde donde se ejecuta.' },
    },
    {
      step: 41,
      phase: 'probar',
      layer: 'seguridad',
      title: 'Antes de producción',
      lead: ['Es un proyecto educativo. Esto es lo que habría que resolver antes de usarlo con datos reales.'],
      visual: {
        type: 'table',
        head: ['Hoy, en la práctica', 'En producción'],
        rows: [
          ['SHA-256 con sal (es muy rápido de probar)', '<code>bcrypt</code> o <code>Argon2</code>, lentos a propósito'],
          ['Intentos de login sin límite', 'Limitar y bloquear intentos'],
          ['El token sirve hasta expirar, aunque se borre la cuenta', 'Revocación, o tokens cortos con renovación'],
          ['HTTP sin cifrar', 'HTTPS siempre'],
          ['CORS acepta cualquier origen', 'Solo los orígenes del frontend'],
          ['Los dos servicios usan el mismo usuario de MySQL: gestión podría leer <code>CUENTA</code>', 'Un usuario de MySQL por servicio'],
          ['<code>admin</code> / <code>Admin123*</code> es pública', 'Cambiar la contraseña'],
        ],
      },
      flow: { lit: ['secreto'] },
      bubble: { text: 'Saber qué le falta a un sistema es parte de construirlo bien.' },
      mood: 'think',
    },
    {
      step: 42,
      kind: 'final',
      phase: 'probar',
      layer: 'retos',
      title: 'Retos para seguir',
      lead: ['Ya construiste e integraste dos microservicios. Ahora hazlos crecer:'],
      ordered: [
        'Crea un usuario de MySQL por servicio y comprueba que gestión ya no pueda leer <code>CUENTA</code>.',
        'Agrega en <code>:3000</code> un <code>GET /api/yo</code> que devuelva los datos de <code>req.cuenta</code>.',
        'Cambia SHA-256 por <code>bcrypt</code> sin tocar el segundo servicio.',
        'Crea un tercer microservicio de auditoría que verifique el mismo token.',
        'Pon un API Gateway que reciba todo en un solo puerto y reenvíe a cada servicio.',
      ],
      visual: { type: 'celebrate' },
      flow: { lit: TODO, route: COMPLETO, boot: true },
      bubble: { title: '¡Lo lograste!', text: 'Dos servicios, un token y una redirección. Haz clic en mí para celebrar otra vez.' },
      mood: 'celebrate',
    },
  ];

  const steps = new Set(slides.filter((s) => s.step != null).map((s) => s.step)).size;
  slides[0].meta.push(`${steps} pasos`);
  slides.forEach((s) => {
    if (!s.id) s.id = s.part ? `paso-${s.step}-${s.part.n}` : `paso-${s.step}`;
    if (s.visual && s.visual.type === 'celebrate') s.visual.caption = `microservicios · ${steps} pasos completados`;
  });

  window.SLIDES = slides;
})();
