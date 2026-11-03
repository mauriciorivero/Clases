/*
  Contenido de las diapositivas de la clase 6: patrones de diseño.
  Cada diapositiva puede tener:
    type: 'title'                    -> portada
    kicker / title / lead / bullets  -> texto (admite `codigo` y **negrita**)
    motif                            -> animacion de fondo en Three.js (ver app.js)
    accent                           -> color de acento
    diagram                          -> flujo de cajas numeradas: [{ label, sub }]
    cards (+ cardsWide)              -> cuadricula de tarjetas: [{ label, sub, on }]
    code                             -> { file, lang, start, text, marks, hints }
        lang:  js | json | term | env
        marks: { numeroDeLinea: 'add' | 'del' }
        hints: { numeroDeLinea: 'pista que dice el avatar al hacer clic en esa linea' }
    hints                            -> pistas del avatar para esta diapositiva
  Los fragmentos de codigo salen de los archivos de src/ y "start" es el numero de linea
  del archivo donde empieza el fragmento. Si cambias un archivo de src/, actualiza aqui
  el texto, "start" y las claves de "hints" (numero de linea dentro del fragmento).
*/
window.SLIDES = [
  {
    type: 'title',
    kicker: 'Clase 6 · Node.js',
    title: 'Patrones de diseño para el desarrollo web',
    lead: 'Soluciones probadas a los problemas que se repiten en todos los proyectos. Aprenderás ocho patrones con código que corre y verás dónde aparecerán en tus APIs con **Express**, **Supabase** y **MongoDB**.',
    motif: 'cloud',
    accent: '#0070f3',
    hints: [
      '¡Hola! Soy **Patri**. Haz clic en mí cuando quieras una pista sobre el código.',
      'Usa las flechas ← → del teclado para moverte, `T` para cambiar de tema y `H` para pedirme una pista.',
      'Las líneas de código con un punto tienen pista. Haz clic en ellas.'
    ]
  },
  {
    kicker: 'Concepto',
    title: '¿Qué es un patrón de diseño?',
    lead: 'Una **manera probada de resolver un problema** dentro de un contexto. No es una librería ni código para copiar y pegar: es una plantilla de la solución que adaptas a tu proyecto.',
    bullets: [
      'Sirve en cualquier lenguaje, porque describe un esquema general y no una sintaxis.',
      'Nace de la experiencia: son conjuntos de mejores prácticas que otros desarrolladores ya probaron.',
      'La idea viene de la arquitectura (**Christopher Alexander**) y se popularizó en el software con el libro de 23 patrones de la «banda de los cuatro» (1994).'
    ],
    diagram: [
      {
        label: 'Un problema que se repite',
        sub: 'Por ejemplo: «necesito una sola conexión a la base de datos».'
      },
      {
        label: 'El patrón',
        sub: 'Una plantilla con nombre: **Singleton**.'
      },
      {
        label: 'Tu implementación',
        sub: 'La misma idea, adaptada a tu proyecto y a tu lenguaje.'
      }
    ],
    motif: 'grid',
    accent: '#7928ca',
    hints: [
      'Un patrón no se instala con `npm`: se **entiende** y se escribe en tu propio código.',
      'Cuando alguien dice «aquí usamos un Observer», todo el equipo sabe de qué habla.'
    ]
  },
  {
    kicker: 'Motivación',
    title: 'Para qué sirven',
    lead: 'Sin acuerdos, cada quien programa con su propia lógica y el resultado suele ser código que solo su autor entiende. Un patrón de diseño cumple al menos tres objetivos:',
    bullets: [
      '**Estandarizar el lenguaje** entre programadores.',
      '**No perder tiempo** resolviendo problemas que ya están resueltos.',
      '**Crear código reutilizable**, que otra persona pueda entender y mejorar.',
      '**Aviso:** un patrón es una herramienta, no una meta. Si el problema no existe, no lo uses.'
    ],
    motif: 'wave',
    accent: '#50e3c2',
    hints: [
      'Aprender la sintaxis es el primer paso; aprender patrones es el segundo.',
      'Más patrones no significa mejor código. Elige el más simple que resuelva el problema.'
    ]
  },
  {
    kicker: 'Clasificación',
    title: 'Tres tipos de patrones',
    lead: 'Se agrupan según el tipo de problema que resuelven.',
    cards: [
      {
        label: 'Creacionales',
        sub: 'Cómo se **crean** los objetos: ocultan cómo se instancian las clases. Ej.: Singleton, Factory Method, Builder.',
        on: true
      },
      {
        label: 'Estructurales',
        sub: 'Cómo se **componen** clases y objetos para formar estructuras mayores. Ej.: Decorator, Adapter, Facade.',
        on: true
      },
      {
        label: 'De comportamiento',
        sub: 'Cómo **interactúan** los objetos y quién es responsable de qué. Ej.: Observer, Strategy, Chain of Responsibility.',
        on: true
      }
    ],
    cardsWide: true,
    motif: 'ring',
    accent: '#ff0080',
    hints: [
      'Creacional = crear. Estructural = armar. Comportamiento = comunicar.',
      'Hoy verás patrones de los tres grupos.'
    ]
  },
  {
    kicker: 'Mapa',
    title: 'Los 22 patrones mas usados en Web Dev',
    lead: 'Existen muchos patrones; lo importante es **saber que existen** y entenderlos. Hoy programamos los **ocho** resaltados.',
    cards: [
      {
        label: 'Singleton',
        sub: 'Una única instancia',
        on: true
      },
      {
        label: 'Factory Method',
        sub: 'Crea instancias según el tipo',
        on: true
      },
      {
        label: 'Prototype',
        sub: 'Clona instancias existentes'
      },
      {
        label: 'Abstract Factory',
        sub: 'Familias de objetos relacionados'
      },
      {
        label: 'Builder',
        sub: 'Objetos complejos paso a paso'
      },
      {
        label: 'Decorator',
        sub: 'Agrega funciones de forma dinámica',
        on: true
      },
      {
        label: 'Adapter',
        sub: 'Hace que dos clases se entiendan',
        on: true
      },
      {
        label: 'Facade',
        sub: 'Interfaz simple a un sistema complejo',
        on: true
      },
      {
        label: 'Bridge',
        sub: 'Separa abstracción e implementación'
      },
      {
        label: 'Composite',
        sub: 'Objetos complejos a partir de simples'
      },
      {
        label: 'Flyweight',
        sub: 'Reutiliza objetos para hacerlos ligeros'
      },
      {
        label: 'Proxy',
        sub: 'Controla el acceso a una clase'
      },
      {
        label: 'Observer',
        sub: 'Un objeto avisa su estado a muchos',
        on: true
      },
      {
        label: 'Strategy',
        sub: 'El comportamiento se delega en otro objeto',
        on: true
      },
      {
        label: 'Chain of Responsibility',
        sub: 'Una cadena de eslabones atiende la petición',
        on: true
      },
      {
        label: 'Command',
        sub: 'Acciones detrás de una interfaz sencilla'
      },
      {
        label: 'Iterator',
        sub: 'Recorre colecciones de objetos'
      },
      {
        label: 'Mediator',
        sub: 'Un objeto media entre otros'
      },
      {
        label: 'Memento',
        sub: 'Restaura un estado anterior'
      },
      {
        label: 'State',
        sub: 'Cambia el comportamiento según el estado'
      },
      {
        label: 'Template Method',
        sub: 'Reutiliza los pasos de un algoritmo'
      },
      {
        label: 'Visitor',
        sub: 'Separa la lógica de una estructura compleja'
      }
    ],
    motif: 'scatter',
    accent: '#f5a623',
    hints: [
      'La lista de Platzi tiene 22; el libro original de la banda de los cuatro tiene 23, porque incluye también «Interpreter».',
      'Los patrones de esta clase son los que más verás en una API REST con Node.js.'
    ]
  },
  {
    kicker: 'Panorama',
    title: 'Dónde viven los patrones en una API',
    lead: 'Esto es lo que construirás en las próximas clases con **Express**, **Supabase** y **MongoDB**. Hoy aprendes cada pieza por separado y al final las juntamos.',
    diagram: [
      {
        label: 'Petición HTTP',
        sub: 'Llega al servidor de Express.'
      },
      {
        label: 'Middlewares · Chain of Responsibility',
        sub: 'Registrar, atrapar errores, autenticar (**Strategy**) y validar.'
      },
      {
        label: 'Controlador → Servicio · Facade',
        sub: 'Una sola puerta a las reglas del negocio.'
      },
      {
        label: 'Repositorio · Adapter + Factory Method',
        sub: 'Habla con Supabase o MongoDB sin que el servicio lo sepa.'
      },
      {
        label: 'Cliente de base de datos · Singleton',
        sub: 'Una conexión que todas las peticiones reutilizan.'
      },
      {
        label: 'Eventos y caché · Observer + Decorator',
        sub: 'Avisos y caché sin ensuciar la lógica.'
      }
    ],
    motif: 'pipeline',
    accent: '#0070f3',
    hints: [
      'No es un orden estricto: es un mapa de **quién resuelve qué**.',
      'Al terminar la clase vas a poder señalar cada una de estas piezas en código real.'
    ]
  },
  {
    kicker: 'Preparación',
    title: 'Prepara el proyecto',
    lead: 'Una carpeta, un `package.json` y nada más: los ejemplos **no necesitan dependencias**. Cada patrón vive en su propia carpeta.',
    bullets: [
      '`npm pkg set type=module` activa `import` y `export` (clase 1).',
      'Se ejecutan con `npm run <nombre>`: `singleton`, `strategy`, `observer`...',
      'Requiere Node.js 20.12 o superior.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `$ mkdir 6_Patrones_Diseno && cd 6_Patrones_Diseno
$ npm init -y
$ npm pkg set type=module

# estructura final
6_Patrones_Diseno/
├── package.json
└── src/
    ├── lib/
    │   ├── supabaseSimulado.js
    │   └── mongoSimulado.js
    ├── 01-singleton/
    ├── 02-strategy/
    ├── 03-observer/
    ├── 04-decorator/
    ├── 05-adapter-repository/
    ├── 06-factory-method/
    ├── 07-chain-of-responsibility/
    ├── 08-facade/
    └── 09-integrado/`,
      hints: {
        3: '`"type": "module"` en el `package.json`: así Node.js trata los `.js` como ES Modules.',
        9: 'La carpeta `lib/` tiene los dos simuladores de bases de datos (siguiente diapositiva).'
      }
    },
    motif: 'grid',
    accent: '#50e3c2',
    hints: [
      'Si ya hiciste la clase 1, esto te suena: `"type": "module"` cambia la sintaxis de los módulos.',
      'Los números de las carpetas siguen el orden de la clase.'
    ]
  },
  {
    kicker: 'Antes de empezar',
    title: 'Supabase y MongoDB de mentira',
    lead: 'Todavía no tienes cuentas ni paquetes de Supabase y MongoDB. Dos **simuladores** en memoria imitan sus métodos para que practiques los patrones hoy.',
    bullets: [
      'Mismos nombres de método y misma forma de respuesta que los reales.',
      'Cuando llegues a esas clases, solo cambiará la línea del `import`.',
      'Los datos viven en memoria: se borran al terminar el programa.'
    ],
    code: {
      file: 'comparación.js',
      lang: 'js',
      text: `// Lo que escribirás en las próximas clases...
import { createClient } from '@supabase/supabase-js';
import { MongoClient } from 'mongodb';

const { data, error } = await supabase
  .from('products').select('*').eq('id', 1).single();
const docs = await db.collection('products').find({}).toArray();

// ...hoy es idéntico. Solo cambia de dónde importas:
import { createClient } from '../lib/supabaseSimulado.js';
import { MongoClient } from '../lib/mongoSimulado.js';`,
      hints: {
        5: 'Supabase siempre responde con un objeto `{ data, error }`: no lanza excepciones.',
        7: 'MongoDB usa `collection()`, `find()` y `toArray()`. Otra forma de pedir lo mismo.',
        10: 'Los simuladores están en `src/lib/`. Ábrelos si tienes curiosidad.'
      }
    },
    motif: 'rows',
    accent: '#3fcf8e',
    hints: [
      'Que sean simulados no los hace menos útiles: los patrones no dependen de la base de datos.',
      'Más adelante, cambiar el simulador por el paquete real es cambiar una línea.'
    ]
  },
  {
    kicker: 'Patrón 1 · Creacional',
    title: 'Singleton: una sola instancia',
    lead: 'Garantiza que una clase tenga **una única instancia** y que todos accedan a ella. Ideal para el logger, la configuración y la conexión a la base de datos.',
    bullets: [
      'Sin él, cada componente crea su propio logger y los registros se **pierden o se fragmentan**.',
      'Se crea de forma perezosa (lazy loading): solo cuando alguien la pide por primera vez.',
      'Es global: úsalo con moderación, porque dificulta las pruebas.'
    ],
    code: {
      file: 'src/01-singleton/logger.js',
      lang: 'js',
      start: 4,
      text: `export class Logger {
  static #instance = null;
  #entries = [];

  constructor() {
    // Si ya existe una instancia, no dejamos crear otra con \`new\`
    if (Logger.#instance) {
      throw new Error('Usa Logger.getInstance() en lugar de new Logger()');
    }
  }

  // Carga perezosa (lazy loading): se crea la primera vez que alguien la pide
  static getInstance() {`,
      hints: {
        2: 'Campo estático y privado (`#`): nadie fuera de la clase puede tocarlo.',
        7: 'Si ya existe una instancia, `new Logger()` lanza un error. Solo se entra por `getInstance()`.',
        13: 'La primera llamada crea la instancia; las siguientes reciben la misma.'
      }
    },
    motif: 'ring',
    accent: '#0070f3',
    hints: [
      'Prueba la demo: `npm run singleton`.',
      'Un logger por componente significaría varios historiales. Un Singleton, uno solo.'
    ]
  },
  {
    kicker: 'Patrón 1 · Creacional',
    title: 'En ES Modules ya es un Singleton',
    lead: 'Node.js ejecuta cada archivo **una sola vez** y guarda su resultado en caché. Si exportas una instancia, todos los que la importen reciben el mismo objeto, sin `getInstance()`.',
    bullets: [
      'Es la forma más usada en proyectos reales.',
      'Cualquier archivo que haga `import { logger }` comparte el mismo historial.',
      '`npm run singleton` imprime `true` en las comparaciones.'
    ],
    code: {
      file: 'src/01-singleton/logger.js',
      lang: 'js',
      start: 16,
      text: `  static getInstance() {
    if (!Logger.#instance) {
      Logger.#instance = new Logger();
    }
    return Logger.#instance;
  }

  log(level, message) {
    this.#entries.push({ level, message, at: new Date().toISOString() });
    console.log(\`[\${level}] \${message}\`);
  }

  info(message) { this.log('INFO', message); }
  error(message) { this.log('ERROR', message); }

  get history() { return [...this.#entries]; }
}

// En ES Modules, Node.js ejecuta cada archivo UNA sola vez y guarda el
// resultado en caché. Exportar una instancia ya es un Singleton: todos
// reciben el mismo objeto.
export const logger = Logger.getInstance();`,
      hints: {
        9: '`#entries` es privado: solo se lee a través de `history`.',
        16: '`history` devuelve una **copia**, para que nadie modifique el historial desde afuera.',
        22: 'Esta línea crea la instancia al cargar el módulo. Los demás archivos importan ese mismo objeto.'
      }
    },
    motif: 'ring',
    accent: '#0070f3',
    hints: [
      'Es la caché de módulos de Node.js la que hace el trabajo; tú solo exportas la instancia.',
      'La clase se exporta aparte para poder demostrar que `new Logger()` falla.'
    ]
  },
  {
    kicker: 'Patrón 1 · En el backend',
    title: 'Una conexión, muchas peticiones',
    lead: 'Abrir una conexión nueva por cada petición agota las que permite **MongoDB Atlas**. El cliente se crea una vez y todos lo reutilizan.',
    bullets: [
      'Guardamos la **promesa** de conexión, no el cliente: tres peticiones simultáneas esperan la misma conexión.',
      'Si la conexión falla, se limpia para poder reintentar.',
      'En la clase de MongoDB reemplazarás el simulador por el driver real.'
    ],
    code: {
      file: 'src/01-singleton/database.js',
      lang: 'js',
      start: 9,
      text: `const DEFAULT_MONGO_URI = 'mongodb+srv://usuario:clave@cluster.mongodb.net';

let supabase = null;
let mongoPromise = null;

export function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL ?? 'https://demo.supabase.co',
      process.env.SUPABASE_KEY ?? 'clave-de-prueba'
    );
  }
  return supabase;
}

export function getMongoClient() {
  // Guardamos la PROMESA, no el cliente: si llegan 3 peticiones a la vez,
  // las tres esperan la misma conexión en vez de abrir tres.
  if (!mongoPromise) {
    const uri = process.env.MONGODB_URI ?? DEFAULT_MONGO_URI;
    mongoPromise = new MongoClient(uri).connect().catch((error) => {
      mongoPromise = null; // si falla, la próxima petición puede reintentar
      throw error;
    });
  }
  return mongoPromise;
}`,
      hints: {
        4: 'Aquí vive la promesa de conexión. Es `null` hasta que alguien la pide.',
        7: 'El cliente de Supabase se crea una sola vez.',
        19: 'Solo la primera petición entra aquí; las demás reciben la promesa ya creada.',
        21: '`connect()` devuelve una promesa. La guardamos para compartirla.',
        22: 'Sin esta línea, un fallo de red dejaría la promesa rechazada para siempre.'
      }
    },
    motif: 'stream',
    accent: '#0070f3',
    hints: [
      'Si guardaras el cliente en lugar de la promesa, tres peticiones simultáneas abrirían tres conexiones.',
      'La demo imprime «Conexiones abiertas: 1» aunque pidas el cliente tres veces.'
    ]
  },
  {
    kicker: 'Patrón 2 · Comportamiento',
    title: 'Strategy: el problema',
    lead: 'Un carrito que solo acepta tarjeta pierde clientes. Pero una cadena de `if / else` crece con cada método de pago y hay que **editarla** cada vez.',
    bullets: [
      'Es difícil de probar: todo vive en una sola función.',
      'Cada cambio puede romper los métodos que ya funcionaban.',
      'Strategy es, en esencia, un `if / else` bien organizado.'
    ],
    code: {
      file: 'src/02-strategy/checkoutWithIf.js',
      lang: 'js',
      start: 6,
      text: `export function pay(method, amount, info) {
  if (method === 'creditCard') {
    return { ok: true, reference: \`CC-\${info.cardNumber.slice(-4)}\`, amount };
  } else if (method === 'paypal') {
    return { ok: true, reference: \`PP-\${info.email}\`, amount };
  } else if (method === 'bitcoin') {
    return { ok: true, reference: \`BTC-\${info.wallet.slice(0, 6)}\`, amount };
  } else {
    throw new Error(\`Método de pago no soportado: \${method}\`);
  }
}`,
      hints: {
        2: 'Cada rama es una forma distinta de hacer lo mismo: pagar.',
        8: 'Un método nuevo (PSE, Nequi...) obliga a tocar esta función otra vez.'
      }
    },
    motif: 'rows',
    accent: '#f5a623',
    hints: [
      'Si te descubres añadiendo otro `else if` al mismo bloque, es una señal de que necesitas Strategy.',
      'Strategy mueve cada rama a su propio objeto.'
    ]
  },
  {
    kicker: 'Patrón 2 · Comportamiento',
    title: 'Una estrategia por cada forma de pagar',
    lead: 'Cada método de pago es un objeto con el **mismo contrato**: `{ name, pay(amount, info) }`. Agregar uno nuevo es agregar un objeto; nada más cambia.',
    bullets: [
      'En JavaScript no hay interfaces reales: el contrato es una convención.',
      'En el archivo también están `bitcoin` y `bankAccount`.',
      'Al final se agrupan en un catálogo: `paymentStrategies`.'
    ],
    code: {
      file: 'src/02-strategy/paymentStrategies.js',
      lang: 'js',
      start: 4,
      text: `// Todas cumplen el mismo contrato: { name, pay(amount, info) }.
// Agregar un método de pago nuevo = agregar un objeto. No se toca nada más.

export const creditCard = {
  name: 'Tarjeta de crédito',
  pay(amount, { cardNumber }) {
    if (!/^\\d{16}$/.test(cardNumber)) {
      throw new Error('Número de tarjeta inválido');
    }
    return { ok: true, reference: \`CC-\${cardNumber.slice(-4)}\`, amount };
  }
};

export const paypal = {
  name: 'PayPal',
  pay(amount, { email }) {
    if (!email?.includes('@')) throw new Error('Correo de PayPal inválido');
    return { ok: true, reference: \`PP-\${email}\`, amount };
  }
};`,
      hints: {
        1: 'Este es el contrato que cumple toda estrategia.',
        4: 'Una estrategia es un objeto con un nombre y un método `pay`.',
        6: 'Cada estrategia valida **su propia** información de pago.',
        16: 'PayPal necesita un correo; la tarjeta, un número. Cada una pide lo suyo.'
      }
    },
    motif: 'stream',
    accent: '#f5a623',
    hints: [
      'Compara con la diapositiva anterior: ya no hay ningún `if` que decida el método.',
      'Probar una estrategia es fácil: la llamas directamente, sin pasar por el resto.'
    ]
  },
  {
    kicker: 'Patrón 2 · Comportamiento',
    title: 'El contexto delega, no decide',
    lead: '`Payment` no sabe **cómo** se paga: guarda una estrategia y le delega el trabajo. Se puede cambiar en tiempo de ejecución, por ejemplo según lo que elija el usuario.',
    bullets: [
      'La estrategia por defecto sale de `config.json` (`"strategy": "paypal"`), leído con `fs` como en la clase 4.',
      '`Object.hasOwn` evita que un nombre como `"constructor"` cuele una función ajena.',
      'Usa una instancia de `Payment` por pedido: compartirla entre peticiones simultáneas mezclaría estrategias.'
    ],
    code: {
      file: 'src/02-strategy/payment.js',
      lang: 'js',
      start: 7,
      text: `// Contexto: no sabe CÓMO se paga, solo delega en la estrategia elegida
export class Payment {
  #strategy;

  constructor(strategyName = 'creditCard') {
    this.setStrategy(strategyName);
  }

  // Se puede cambiar en tiempo de ejecución, según lo que elija el usuario
  setStrategy(strategyName) {
    // Object.hasOwn evita que "constructor" cuele una función ajena
    if (!Object.hasOwn(paymentStrategies, strategyName)) {
      throw new Error(\`Estrategia de pago desconocida: "\${strategyName}"\`);
    }
    this.#strategy = paymentStrategies[strategyName];
    return this;
  }

  process(amount, info) {
    return this.#strategy.pay(amount, info);
  }
}

// Instancia lista para usar con la estrategia configurada
export const defaultPayment = new Payment(config.payment.strategy);`,
      hints: {
        10: 'Cambiar la estrategia es reemplazar un objeto. Devuelve `this` para poder encadenar.',
        12: 'Los nombres llegan de afuera (un formulario, una API). Hay que validarlos.',
        15: 'La estrategia elegida queda guardada en un campo privado.',
        20: 'Delegar: el contexto no sabe nada de tarjetas ni de PayPal.',
        25: 'Instancia lista para usar con la estrategia de `config.json`.'
      }
    },
    motif: 'stream',
    accent: '#f5a623',
    hints: [
      'Prueba: cambia `"paypal"` por `"bitcoin"` en `config.json` y corre `npm run strategy`.',
      'Ese cambio de comportamiento se hace sin tocar una sola línea de código.'
    ]
  },
  {
    kicker: 'Patrón 2 · En el backend',
    title: 'Estrategias de autenticación',
    lead: 'Cómo identificar al usuario también cambia: un token `Bearer`, una API key, una sesión de Supabase. Cada forma es una estrategia, y Passport.js usa justo esta idea.',
    bullets: [
      'Todas reciben las cabeceras de la petición y devuelven el usuario, o `null`.',
      'El middleware de autenticación delega en la estrategia que le indiques.',
      'Cambiar de `bearer` a `apiKey` es cambiar un texto.'
    ],
    code: {
      file: 'src/02-strategy/authStrategies.js',
      lang: 'js',
      start: 4,
      text: `// Cada estrategia recibe las cabeceras de la petición y devuelve el usuario,
// o null si las credenciales no sirven. Passport.js usa esta misma idea.

export const authStrategies = {
  // Authorization: Bearer <token>
  // (más adelante será un JWT o una sesión de Supabase)
  bearer(headers) {
    const token = headers.authorization?.split(' ')[1];
    return token === 'token-valido' ? { id: 'u1', role: 'user' } : null;
  },

  // x-api-key: <clave>   (para otros servicios, como los microservicios)
  apiKey(headers) {
    const valid = headers['x-api-key'] === 'clave-de-servicio';
    return valid ? { id: 'svc', role: 'service' } : null;
  }
};`,
      hints: {
        7: 'Estrategia `bearer`: lee el token de la cabecera `authorization`.',
        9: 'Aquí compararás el token con un JWT o con una sesión de Supabase.',
        13: 'Estrategia `apiKey`: pensada para que se comuniquen servicios entre sí (microservicios).'
      }
    },
    motif: 'stream',
    accent: '#f5a623',
    hints: [
      'Más adelante, estas estrategias se conectarán con Supabase Auth.',
      'En los microservicios, un servicio se identifica con una API key en lugar de un usuario.'
    ]
  },
  {
    kicker: 'Patrón 3 · Comportamiento',
    title: 'Observer: el sujeto avisa',
    lead: 'Crea una relación **uno a muchos**: cuando cambia el estado del sujeto, todos sus observadores se enteran y reaccionan. Es la relación Modelo → Vista de MVC.',
    bullets: [
      'Ejemplo: tres listas desplegables (color, precio, marca) que dependen de la categoría elegida.',
      'El sujeto **no sabe** qué hace cada observador con el aviso.',
      'Olvidar darse de baja (`unsubscribe`) causa fugas de memoria.'
    ],
    code: {
      file: 'src/03-observer/subject.js',
      lang: 'js',
      start: 4,
      text: `// Relación uno a muchos: cuando el sujeto cambia, todos sus observadores
// se enteran. El sujeto no sabe qué hace cada uno con el aviso.
export class Subject {
  #observers = new Set();

  // Devuelve la función para darse de baja.
  // Olvidarla causa fugas de memoria.
  subscribe(observer) {
    this.#observers.add(observer);
    return () => this.#observers.delete(observer);
  }

  async notify(data) {
    // allSettled: si un observador falla, los demás reciben el aviso igual
    const results = await Promise.allSettled(
      [...this.#observers].map(async (observer) => observer.update(data))
    );
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Un observador falló:', result.reason.message);
      }
    }
  }
}`,
      hints: {
        8: '`subscribe` guarda al observador y devuelve la función para darse de baja.',
        10: 'Llamar a esta función quita al observador de la lista.',
        13: '`notify` recorre a los observadores y les entrega el dato.',
        15: '`allSettled` espera a todos, aunque alguno falle.',
        19: 'Un observador que falla no impide que los demás reciban el aviso.'
      }
    },
    motif: 'burst',
    accent: '#ff0080',
    hints: [
      'El patrón también se llama «publicar / suscribirse» (publish / subscribe).',
      'Piensa en una suscripción a un canal de YouTube: el canal no sabe quién eres, solo avisa.'
    ]
  },
  {
    kicker: 'Patrón 3 · Comportamiento',
    title: 'Los observadores reaccionan',
    lead: '`CategoryDropdown` es el sujeto; cada `FilterDropdown` es un observador que recarga sus opciones cuando cambia la categoría.',
    bullets: [
      '`loadItems` se inyecta: sirve con `fetch` en el navegador o con una consulta en el servidor.',
      'Cada observador solo necesita un método `update`.',
      'Útil para notificaciones, filtros y suscriptores.'
    ],
    code: {
      file: 'src/03-observer/dropdowns.js',
      lang: 'js',
      start: 3,
      text: `// Sujeto: la lista de categorías. Cuando el usuario elige una, avisa.
export class CategoryDropdown extends Subject {
  selected = null;

  select(category) {
    this.selected = category;
    return this.notify(category);
  }
}

// Observador: cada filtro recarga sus opciones cuando cambia la categoría.
// \`loadItems\` es quien pide los datos: un fetch en el navegador o una
// consulta en el servidor.
export class FilterDropdown {
  items = [];

  constructor(filterType, loadItems) {
    this.filterType = filterType;
    this.loadItems = loadItems;
  }

  async update(category) {
    this.items = await this.loadItems(this.filterType, category);
  }
}`,
      hints: {
        2: 'El sujeto hereda `subscribe` y `notify` de `Subject`.',
        7: 'Al elegir una categoría, se notifica a todos los observadores.',
        14: 'El observador no hereda de nada: basta con que tenga `update`.',
        22: '`update` recibe la categoría y recarga las opciones del filtro.'
      }
    },
    motif: 'burst',
    accent: '#ff0080',
    hints: [
      'Corre `npm run observer` y observa qué pasa con el filtro de precio después de darse de baja.',
      'Tras `unsubscribePrice()`, el filtro de precio conserva sus opciones anteriores: ya no se entera.'
    ]
  },
  {
    kicker: 'Patrón 3 · En el backend',
    title: 'Observer en Node.js: `events`',
    lead: 'Node.js ya trae el patrón: `emit()` notifica y `on()` suscribe. Los suscriptores reaccionan a un pedido **sin que el código que lo crea sepa que existen**.',
    bullets: [
      'Un correo, el inventario y la auditoría escuchan `order:created`.',
      '`emit()` es síncrono: los suscriptores corren antes de la siguiente línea.',
      'Supabase Realtime y los Change Streams de MongoDB son el mismo patrón, con la red de por medio.'
    ],
    code: {
      file: 'src/03-observer/orderEvents.js',
      lang: 'js',
      start: 3,
      text: `// ========================================
// OBSERVER EN EL BACKEND: EL MÓDULO NATIVO \`events\`
// ========================================
// Node.js ya trae el patrón: emit() es "notificar" y on() es "suscribirse".
// Es un Singleton por módulo: todos los archivos que lo importen comparten
// el mismo emisor.
export const orderEvents = new EventEmitter();

// Cada suscriptor reacciona al pedido sin que el código que lo crea
// sepa que existe.
export function registerOrderListeners() {
  orderEvents.on('order:created', (order) => {
    console.log(\`  · Correo de confirmación enviado a \${order.email}\`);
  });
  orderEvents.on('order:created', (order) => {
    console.log(\`  · Inventario descontado del producto \${order.productId}\`);
  });
  orderEvents.on('order:created', (order) => {
    console.log(\`  · Auditoría: pedido \${order.id} registrado\`);
  });
}`,
      hints: {
        7: 'Un solo emisor compartido por todos los archivos que lo importen.',
        11: 'Se registran los suscriptores una vez, al iniciar la aplicación.',
        12: '`on(evento, función)`: la función se ejecuta cada vez que alguien emite `order:created`.',
        16: 'Para agregar otra reacción (por ejemplo, un SMS) basta con un `on` más.'
      }
    },
    motif: 'burst',
    accent: '#ff0080',
    hints: [
      'Para agregar una reacción nueva a un pedido no tocas el código que crea pedidos.',
      'Así se desacopla una API: crear el pedido por un lado y avisar por otro.'
    ]
  },
  {
    kicker: 'Patrón 4 · Estructural',
    title: 'Decorator: agrega, no modifica',
    lead: 'Añade comportamiento a **una instancia concreta** sin tocar la clase base ni las demás instancias. Como pedir un sándwich con ingredientes especiales: solo ese pedido cambia.',
    bullets: [
      'Alternativas peores: inflar la clase base o crear una subclase por cada combinación.',
      'Los decoradores se **apilan**: `new Exquisite(new Deluxe(sandwich))`.',
      'El sándwich original conserva su tipo y su precio.'
    ],
    code: {
      file: 'src/04-decorator/sandwich.js',
      lang: 'js',
      start: 15,
      text: `// El decorador envuelve a un sándwich y, por defecto, delega todo en él
class SandwichDecorator {
  constructor(sandwich) {
    this.sandwich = sandwich;
  }

  get type() { return this.sandwich.type; }
  get price() { return this.sandwich.price; }
  order() { return \`\${this.type} · $\${this.price.toFixed(2)}\`; }
}

// Cada decorador cambia solo lo que le interesa
export class Deluxe extends SandwichDecorator {
  get type() { return \`\${super.type} Lujoso\`; }
  get price() { return super.price + 1.75; }
}

export class Exquisite extends SandwichDecorator {
  get type() { return \`\${super.type} Exquisito\`; }
  get price() { return super.price + 10.75; }
}`,
      hints: {
        2: 'El decorador recibe un sándwich y lo guarda: lo **envuelve**.',
        7: 'Por defecto, todo se delega en el sándwich envuelto.',
        14: '`super.type` es el tipo del sándwich envuelto; el decorador le agrega «Lujoso».',
        15: 'Suma 1.75 al precio del sándwich envuelto, sin modificarlo.',
        20: 'Otro decorador: Exquisito suma 10.75. Pueden combinarse.'
      }
    },
    motif: 'rows',
    accent: '#7928ca',
    hints: [
      'Ejecuta `npm run decorator` y mira que `turkey.order()` no cambia aunque lo decores.',
      'Decorar es envolver: el objeto de adentro nunca se entera.'
    ]
  },
  {
    kicker: 'Patrón 4 · En el backend',
    title: 'Decoradores de funciones',
    lead: 'En el backend casi siempre decoras **funciones**: una función que recibe otra y devuelve una versión con «superpoderes»: registro, tiempo, caché o reintentos.',
    bullets: [
      'El orden importa: `withTiming(withCache(fn))` mide también los aciertos de la caché.',
      'En el archivo también está `withRetry`, para reintentar si la conexión falla.',
      'Los decoradores `@` de TypeScript y de NestJS son una sintaxis para esta misma idea.'
    ],
    code: {
      file: 'src/04-decorator/functionDecorators.js',
      lang: 'js',
      start: 7,
      text: `export const withLogging = (fn, label = fn.name) => async (...args) => {
  console.log(\`→ \${label}(\${args.map((a) => JSON.stringify(a)).join(', ')})\`);
  const result = await fn(...args);
  console.log(\`← \${label} terminó\`);
  return result;
};

export const withTiming = (fn, label = fn.name) => async (...args) => {
  const start = performance.now();
  try {
    return await fn(...args);
  } finally {
    const ms = (performance.now() - start).toFixed(0);
    console.log(\`  \${label} tardó \${ms} ms\`);
  }
};

export const withCache = (fn, ttlMs = 5000) => {
  const cache = new Map();
  return async (...args) => {
    const key = JSON.stringify(args);
    const hit = cache.get(key);
    if (hit && hit.expiresAt > Date.now()) return hit.value;

    const value = await fn(...args);
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  };
};`,
      hints: {
        1: 'Recibe una función y devuelve **otra** que hace lo mismo y además registra la llamada.',
        3: 'La función original se ejecuta tal cual; el decorador solo la rodea.',
        8: '`withTiming` mide cuánto tarda la función envuelta.',
        12: '`finally` imprime el tiempo aunque la función lance un error.',
        18: '`withCache` guarda resultados en un `Map` durante `ttlMs` milisegundos.',
        23: 'Si el resultado sigue vigente, se devuelve sin llamar a la base de datos.'
      }
    },
    motif: 'rows',
    accent: '#7928ca',
    hints: [
      'En la demo, la segunda consulta tarda 0 ms: salió de la caché.',
      'La función `findProducts` original no sabe que tiene caché ni que se mide.'
    ]
  },
  {
    kicker: 'Patrón 5 · Estructural',
    title: 'Adapter: traduce una interfaz a otra',
    lead: 'Supabase responde `{ data, error }`; MongoDB usa `find()` y `_id`. Un **Adapter** hace que dos piezas que no se entienden hablen el mismo idioma. Aquí, cada base de datos se adapta a un repositorio común.',
    bullets: [
      'El contrato: `findAll`, `findById` y `create`.',
      'Esta combinación se conoce como **Repository**: oculta de dónde vienen los datos.',
      'El adaptador de Supabase traduce `{ data, error }` a valores o excepciones.'
    ],
    code: {
      file: 'src/05-adapter-repository/supabaseProductRepository.js',
      lang: 'js',
      start: 1,
      text: `import { ProductRepository } from './productRepository.js';

// Supabase no lanza errores: los devuelve. Aquí los volvemos excepciones.
function unwrap({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

// ADAPTER: traduce el contrato del repositorio al lenguaje de Supabase
export class SupabaseProductRepository extends ProductRepository {
  constructor(supabase) {
    super();
    this.supabase = supabase;
  }

  #products() {
    return this.supabase.from('products');
  }

  async findAll() {
    return unwrap(await this.#products().select('*').order('id'));
  }

  async findById(id) {
    const result = await this.#products().select('*').eq('id', id).single();
    if (result.error?.code === 'PGRST116') return null; // no existe
    return unwrap(result);
  }

  async create(product) {
    return unwrap(await this.#products().insert(product).select().single());
  }
}`,
      hints: {
        4: '`unwrap` convierte `{ data, error }` en un valor o en una excepción.',
        10: '`extends ProductRepository`: se compromete a cumplir el contrato.',
        17: 'Así se accede a una tabla en Supabase: `from("products")`.',
        21: 'Pedir todo, ordenado por `id`: `select().order()`.',
        26: '`PGRST116` significa «no hay filas»: el repositorio devuelve `null`.',
        31: 'Insertar y pedir de vuelta la fila creada, con su `id` asignado.'
      }
    },
    motif: 'pipeline',
    accent: '#50e3c2',
    hints: [
      'El contrato está en `productRepository.js`: una clase base que lanza error si falta un método.',
      'Un enchufe adaptador no cambia la electricidad: solo la forma de conectarla.'
    ]
  },
  {
    kicker: 'Patrón 5 · Estructural',
    title: 'El mismo contrato, otra base de datos',
    lead: 'El adaptador de MongoDB cumple el **mismo contrato**, pero por dentro usa `find().toArray()`, `findOne()` e `insertOne()` y traduce `_id` a `id`.',
    bullets: [
      'Cambia el método y la forma del dato; lo que ve el resto de la aplicación, no.',
      'Con el driver real, el `id` se convierte con `new ObjectId(id)`.',
      'Cambiar de MongoDB a Supabase es cambiar de adaptador.'
    ],
    code: {
      file: 'src/05-adapter-repository/mongoProductRepository.js',
      lang: 'js',
      start: 1,
      text: `import { ProductRepository } from './productRepository.js';

// ADAPTER: traduce el mismo contrato al lenguaje de MongoDB
export class MongoProductRepository extends ProductRepository {
  constructor(db) {
    super();
    this.products = db.collection('products');
  }

  // MongoDB guarda el identificador como \`_id\`; la app espera \`id\`
  #toProduct(doc) {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { id: _id, ...rest };
  }

  async findAll() {
    const docs = await this.products.find({}).toArray();
    return docs.map((doc) => this.#toProduct(doc));
  }

  async findById(id) {
    // Con el driver real: this.products.findOne({ _id: new ObjectId(id) })
    return this.#toProduct(await this.products.findOne({ _id: id }));
  }

  async create(product) {
    const { insertedId } = await this.products.insertOne({ ...product });
    return { id: insertedId, ...product };
  }
}`,
      hints: {
        4: 'Mismo contrato, otra implementación.',
        7: 'Aquí se elige la colección `products`.',
        11: 'MongoDB guarda el identificador como `_id`; la aplicación espera `id`. Este método traduce.',
        18: '`find({}).toArray()` es el equivalente a `select("*")` de Supabase.',
        28: 'Se copia el producto: `insertOne` del driver real agrega `_id` al objeto que recibe.'
      }
    },
    motif: 'pipeline',
    accent: '#50e3c2',
    hints: [
      'Ejecuta `npm run adapter`: las dos bases de datos imprimen la misma estructura.',
      'Solo cambia el valor del `id`: un número en Supabase y un texto largo en MongoDB.'
    ]
  },
  {
    kicker: 'Patrón 5 · Estructural',
    title: 'El servicio no sabe qué base de datos usa',
    lead: '`ProductService` contiene las reglas del negocio y recibe el repositorio por el constructor. Depende de la **abstracción**, no de Supabase ni de MongoDB.',
    bullets: [
      'Cambiar de base de datos no toca ni una línea del servicio.',
      'Para las pruebas basta con un repositorio falso.',
      'Es el principio de inversión de dependencias, la «D» de SOLID.'
    ],
    code: {
      file: 'src/05-adapter-repository/productService.js',
      lang: 'js',
      start: 1,
      text: `// El servicio contiene las reglas del negocio. Depende de la ABSTRACCIÓN
// (cualquier repositorio con findAll/findById/create), no de Supabase ni
// de MongoDB.
export class ProductService {
  constructor(repository) {
    this.repository = repository;
  }

  listProducts() {
    return this.repository.findAll();
  }

  async getProduct(id) {
    const product = await this.repository.findById(id);
    if (!product) {
      // \`status\` le sirve a la capa HTTP para responder 404 en lugar de 500
      const error = new Error(\`Producto \${id} no encontrado\`);
      throw Object.assign(error, { status: 404 });
    }
    return product;
  }

  addProduct({ name, price }) {
    if (!name || !(price > 0)) throw new Error('Datos de producto inválidos');
    return this.repository.create({ name, price });
  }
}`,
      hints: {
        5: 'El repositorio llega desde afuera: es una **dependencia inyectada**.',
        10: 'Delega en el repositorio; no sabe si hay SQL o documentos detrás.',
        18: '`status: 404` le servirá a la capa HTTP para responder con el código correcto.',
        24: 'Las reglas de negocio (validar datos) viven aquí, no en la base de datos.'
      }
    },
    motif: 'pipeline',
    accent: '#50e3c2',
    hints: [
      'Esta es la idea central de la arquitectura limpia: las reglas no dependen de los detalles.',
      'Mañana puedes migrar de MongoDB a Supabase y este archivo sigue igual.'
    ]
  },
  {
    kicker: 'Patrón 6 · Creacional',
    title: 'Factory Method: pide por tipo',
    lead: 'Quien necesita un repositorio dice **qué** quiere (`"mongo"`), no **cómo** se construye. Con la variable `DB_PROVIDER` eliges la base de datos sin cambiar código.',
    bullets: [
      'En JavaScript lo habitual es una función fábrica, no una jerarquía de clases.',
      'El registro `providers` permite agregar proveedores sin `if / else`.',
      'La fábrica reutiliza los clientes Singleton de `database.js`.'
    ],
    code: {
      file: 'src/06-factory-method/repositoryFactory.js',
      lang: 'js',
      start: 11,
      text: `// Registro: cada proveedor sabe construir su repositorio.
// Reutiliza los clientes Singleton de database.js.
const providers = {
  supabase: async () => new SupabaseProductRepository(getSupabase()),
  mongo: async () => {
    const client = await getMongoClient();
    return new MongoProductRepository(client.db('shop'));
  }
};

// Sin argumento, se lee la variable de entorno DB_PROVIDER
const defaultProvider = () => process.env.DB_PROVIDER ?? 'supabase';

export async function createProductRepository(provider = defaultProvider()) {
  if (!Object.hasOwn(providers, provider)) {
    const options = Object.keys(providers).join(', ');
    throw new Error(\`Proveedor desconocido "\${provider}" (usa: \${options})\`);
  }
  return providers[provider]();
}`,
      hints: {
        3: 'Un registro: nombre del proveedor → cómo construir su repositorio.',
        4: 'Supabase: construye el adaptador con el cliente Singleton.',
        5: 'MongoDB: espera la conexión Singleton y escoge la base `shop`.',
        12: 'Sin argumento, lee `DB_PROVIDER` de las variables de entorno (como el `.env` de la clase 5).',
        15: 'Un proveedor que no existe se rechaza con un mensaje claro.'
      }
    },
    motif: 'grid',
    accent: '#3fcf8e',
    hints: [
      'Prueba: `DB_PROVIDER=mongo npm run factory`.',
      'Para soportar otra base de datos agregas un adaptador y una línea al registro.'
    ]
  },
  {
    kicker: 'Patrón 7 · Comportamiento',
    title: 'Chain of Responsibility: la cadena',
    lead: 'La petición pasa por una **cadena de eslabones**. Cada uno decide si la atiende, la modifica o se la pasa al siguiente con `next()`. Así funcionan los middlewares de Express.',
    bullets: [
      'Un eslabón que no llama a `next()` **corta** la cadena.',
      'Cada eslabón conoce solo al siguiente, no a toda la cadena.',
      'El orden en que los registras es el orden en que se ejecutan.'
    ],
    code: {
      file: 'src/07-chain-of-responsibility/pipeline.js',
      lang: 'js',
      start: 4,
      text: `// Cada middleware decide si atiende la petición, la modifica o se la pasa al
// siguiente llamando a next(). Así funcionan los middlewares de Express.
export function createPipeline(...middlewares) {
  return async function handle(req) {
    const res = {
      status: 200,
      body: null,
      send(status, body) {
        this.status = status;
        this.body = body;
      }
    };

    const dispatch = async (index) => {
      const middleware = middlewares[index];
      if (middleware) await middleware(req, res, () => dispatch(index + 1));
    };

    try {
      await dispatch(0);
    } catch (error) {
      res.send(500, { error: error.message });
    }
    return res;
  };
}`,
      hints: {
        3: 'Recibe los middlewares y devuelve la función que atiende cada petición.',
        14: '`dispatch(i)` ejecuta el eslabón número `i`.',
        16: '`next` simplemente llama a `dispatch(index + 1)`: el siguiente eslabón.',
        20: 'Se inicia la cadena por el primer eslabón.',
        22: 'Red de seguridad: si algo escapa a todos los eslabones, responde 500.'
      }
    },
    motif: 'stream',
    accent: '#0070f3',
    hints: [
      'Son unas 20 líneas: así de pequeño es el corazón de un framework como Express.',
      'Los eslabones ven y comparten los mismos `req` y `res`.'
    ]
  },
  {
    kicker: 'Patrón 7 · Comportamiento',
    title: 'Middlewares: cada uno hace una cosa',
    lead: 'Registrar, atrapar errores, autenticar y validar son eslabones independientes. Puedes combinarlos en el orden que necesites.',
    bullets: [
      '`logRequest` actúa antes y después de `next()`, como las capas de una cebolla.',
      '`errorHandler` atrapa lo que falle en los eslabones que vienen después de él.',
      '`authenticate` delega en una estrategia de autenticación.',
      'Responder sin llamar a `next()` corta la cadena.'
    ],
    code: {
      file: 'src/07-chain-of-responsibility/middlewares.js',
      lang: 'js',
      start: 1,
      text: `import { logger } from '../01-singleton/logger.js';
import { authStrategies } from '../02-strategy/authStrategies.js';

// Registra la petición y, cuando la cadena termina, la respuesta
export async function logRequest(req, res, next) {
  logger.info(\`\${req.method} \${req.path}\`);
  await next();
  logger.info(\`\${req.method} \${req.path} → \${res.status}\`);
}

// Atrapa los errores de los eslabones que siguen y los vuelve una respuesta
export async function errorHandler(req, res, next) {
  try {
    await next();
  } catch (error) {
    res.send(error.status ?? 500, { error: error.message });
  }
}

// Fábrica de middlewares: delega en una ESTRATEGIA de autenticación
export function authenticate(strategyName) {
  const strategy = authStrategies[strategyName];
  return async (req, res, next) => {
    const user = strategy(req.headers);
    if (!user) {
      return res.send(401, { error: 'No autorizado' }); // corta la cadena
    }
    req.user = user;
    await next();
  };
}

export async function validateProduct(req, res, next) {
  const { name, price } = req.body ?? {};
  if (!name || !(price > 0)) {
    return res.send(400, { error: 'name y price son obligatorios' });
  }
  await next();
}`,
      hints: {
        7: 'Todo lo que viene después de `await next()` se ejecuta cuando la cadena ya terminó.',
        12: 'Por eso `errorHandler` debe ir **antes** de los eslabones que quiere proteger.',
        16: 'El error define su código (`status`) o se responde 500.',
        22: 'Aquí entra el patrón Strategy: la estrategia se elige por su nombre.',
        26: 'Sin credenciales, responde 401 y **no** llama a `next()`: la cadena se detiene.',
        36: 'Datos inválidos: 400, y el controlador ni se entera.'
      }
    },
    motif: 'stream',
    accent: '#0070f3',
    hints: [
      'Corre `npm run chain` y mira cómo cada petición se detiene en un eslabón distinto.',
      'La primera no pasa de `authenticate`; la segunda no pasa de `validateProduct`.'
    ]
  },
  {
    kicker: 'Patrón 7 · Con Express',
    title: 'En Express es casi igual',
    lead: 'Cuando instales Express (próxima clase), los eslabones se registran con `app.use()`. Cambia solo la forma de responder: `res.status().json()` en lugar de `res.send(status, body)`.',
    bullets: [
      'Un middleware de errores tiene **cuatro** parámetros.',
      'En Express 5, los errores de los controladores `async` llegan solos al middleware de errores.',
      'Este archivo es solo una referencia: no está en la carpeta de la clase.'
    ],
    code: {
      file: 'server.js (referencia)',
      lang: 'js',
      text: `import express from 'express';
import { authStrategies } from './authStrategies.js';

const app = express();

// eslabón 1: lee el cuerpo JSON
app.use(express.json());

// eslabón 2: registra la petición
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.path}\`);
  next();
});

// eslabón 3: autentica con una estrategia (Strategy)
app.use((req, res, next) => {
  const user = authStrategies.bearer(req.headers);
  if (!user) return res.status(401).json({ error: 'No autorizado' });
  req.user = user;
  next();
});

// controlador: el último eslabón
app.post('/products', async (req, res) => {
  res.status(201).json(await productService.addProduct(req.body));
});

// middleware de errores: se reconoce por sus 4 parámetros
app.use((err, req, res, next) => {
  res.status(err.status ?? 500).json({ error: err.message });
});

app.listen(3000);`,
      hints: {
        7: '`express.json()` ya es un middleware: Express te trae varios.',
        17: 'Las estrategias de autenticación son las mismas que ya escribiste.',
        18: 'Sin `next()`, la cadena se corta, igual que en nuestro `pipeline.js`.',
        29: 'Express reconoce el middleware de errores porque tiene cuatro parámetros.'
      }
    },
    motif: 'stream',
    accent: '#0070f3',
    hints: [
      'No hace falta instalar Express todavía: esta diapositiva es un adelanto.',
      'Lo que aprendiste en `pipeline.js` es exactamente lo que Express hace por dentro.'
    ]
  },
  {
    kicker: 'Patrón 8 · Estructural',
    title: 'Facade: una puerta simple',
    lead: 'Ofrece una **interfaz unificada y simple** para usar un sistema complejo. El controlador llama a `placeOrder()`; por dentro se coordinan catálogo, pagos, pedidos y notificaciones.',
    bullets: [
      'Es la capa de **servicios** de una API REST.',
      'Aquí combina Strategy (pago), Repository (catálogo) y Observer (aviso).',
      'Los controladores quedan de una línea y los errores salen por un solo camino.'
    ],
    code: {
      file: 'src/08-facade/checkoutFacade.js',
      lang: 'js',
      start: 3,
      text: `// ========================================
// FACADE: UNA PUERTA SIMPLE A UN SISTEMA COMPLICADO
// ========================================
// El controlador solo llama a placeOrder(). Por dentro coordinamos cuatro
// subsistemas: catálogo, pagos, pedidos y notificaciones.
export class CheckoutFacade {
  #orders = [];

  constructor({ productService, events }) {
    this.productService = productService;
    this.events = events;
  }

  async placeOrder({ productId, email, paymentMethod, paymentInfo }) {
    // 1. Catálogo: el producto debe existir
    const product = await this.productService.getProduct(productId);

    // 2. Pago: una estrategia NUEVA por pedido, para que las peticiones
    //    simultáneas no se mezclen
    const payment = new Payment(paymentMethod);
    const receipt = payment.process(product.price, paymentInfo);

    // 3. Pedido: lo guardamos
    const order = {
      id: this.#orders.length + 1,
      productId,
      email,
      total: product.price,
      receipt: receipt.reference
    };
    this.#orders.push(order);

    // 4. Notificaciones: avisamos a quien esté escuchando (Observer)
    this.events.emit('order:created', order);

    return order;
  }
}`,
      hints: {
        14: 'Un solo método público para todo el proceso de compra.',
        16: 'Paso 1: el catálogo. Si el producto no existe, falla con 404.',
        20: 'Paso 2: una estrategia nueva por pedido, para no mezclar peticiones simultáneas.',
        31: 'Paso 3: se guarda el pedido.',
        34: 'Paso 4: se avisa a los observadores (correo, inventario, auditoría).'
      }
    },
    motif: 'ring',
    accent: '#ff0080',
    hints: [
      'Sin fachada, el controlador tendría que conocer y ordenar los cuatro pasos.',
      'Corre `npm run facade` y mira cómo las notificaciones salen solas.'
    ]
  },
  {
    kicker: 'Todos juntos',
    title: 'Una mini API con los ocho patrones',
    lead: 'Peticiones simuladas atraviesan la cadena hasta llegar a un controlador. Sin servidor ni dependencias: solo `node`.',
    bullets: [
      'Factory Method elige la base de datos; Singleton aporta sus clientes.',
      'Decorator guarda en caché la lista de productos.',
      'Observer reacciona a cada pedido; Facade lo coordina.',
      'Chain of Responsibility y Strategy protegen cada ruta.'
    ],
    code: {
      file: 'src/09-integrado/api.js',
      lang: 'js',
      start: 14,
      text: `// Factory Method (+ Singleton): elige la base de datos con DB_PROVIDER
const repository = await createProductRepository();
const productService = new ProductService(repository);
await productService.addProduct({ name: 'Teclado', price: 45 });
await productService.addProduct({ name: 'Mouse', price: 18 });

// Observer: los suscriptores reaccionan a los pedidos
registerOrderListeners();

// Facade: el controlador de pedidos usa una sola puerta
const checkout = new CheckoutFacade({ productService, events: orderEvents });

// Decorator: la lista se consulta mucho, así que la guardamos en caché
const listProducts = withCache(() => productService.listProducts(), 10_000);

// Controladores: el último eslabón de la cadena
const routes = {
  'GET /products': async (req, res) => res.send(200, await listProducts()),
  'POST /orders': async (req, res) => {
    res.send(201, await checkout.placeOrder(req.body));
  }
};

async function router(req, res) {
  const controller = routes[\`\${req.method} \${req.path}\`];
  if (!controller) return res.send(404, { error: 'Ruta no encontrada' });
  await controller(req, res);
}

// Chain of Responsibility + Strategy: registrar, atrapar errores,
// autenticar (estrategia "bearer") y enrutar
const api = createPipeline(
  logRequest,
  errorHandler,
  authenticate('bearer'),
  router
);`,
      hints: {
        2: '**Factory Method** (y Singleton por debajo): elige Supabase o MongoDB según `DB_PROVIDER`.',
        3: 'El servicio recibe un repositorio: **Adapter / Repository**.',
        8: '**Observer**: se registran los suscriptores de los pedidos.',
        11: '**Facade**: el controlador de pedidos usa una sola puerta.',
        14: '**Decorator**: la lista se cachea 10 segundos (`10_000` ms).',
        32: '**Chain of Responsibility** con una **Strategy** de autenticación: registrar, atrapar errores, autenticar y enrutar.'
      }
    },
    motif: 'pipeline',
    accent: '#7928ca',
    hints: [
      'Cambia de base de datos con `DB_PROVIDER=mongo npm run integrado` y mira que la API se comporta igual.',
      'Esto es una API REST sin Express: cuando lo instales, solo cambiará la cadena.'
    ]
  },
  {
    kicker: 'Pruébalo',
    title: 'Ejecuta los ejemplos',
    lead: 'Cada carpeta tiene su propia demo. Corre las nueve y compara qué imprime cada una.',
    bullets: [
      'Cambia de base de datos sin tocar código: `DB_PROVIDER=mongo npm run integrado`.',
      'La segunda consulta autenticada a `/products` sale de la caché, aunque la respuesta se vea igual.',
      'Rompe algo a propósito (¡es la mejor forma de aprender!) y lee el error.'
    ],
    code: {
      file: 'terminal',
      lang: 'term',
      text: `$ npm run singleton
$ npm run strategy
$ npm run observer
$ npm run decorator
$ npm run adapter
$ npm run factory
$ npm run chain
$ npm run facade

$ npm run integrado
[INFO] GET /products
[INFO] GET /products → 401
401 {"error":"No autorizado"}

[INFO] GET /products
[INFO] GET /products → 200
200 [{"id":1,"name":"Teclado","price":45},{"id":2,"name":"Mouse","price":18}]

[INFO] GET /products
[INFO] GET /products → 200
200 [{"id":1,"name":"Teclado","price":45},{"id":2,"name":"Mouse","price":18}]

[INFO] POST /orders
  · Correo de confirmación enviado a ana@correo.com
  · Inventario descontado del producto 1
  · Auditoría: pedido 1 registrado
[INFO] POST /orders → 201
201 {"id":1,"productId":1,"email":"ana@correo.com","total":45,"receipt":"PP-ana@correo.com"}

[INFO] POST /orders
[INFO] POST /orders → 404
404 {"error":"Producto no-existe no encontrado"}

[INFO] GET /nada
[INFO] GET /nada → 404
404 {"error":"Ruta no encontrada"}`,
      hints: {
        10: 'La mini API completa. Las peticiones pasan por los eslabones hasta llegar al controlador.'
      }
    },
    motif: 'burst',
    accent: '#50e3c2',
    hints: [
      'Tres códigos para fijarte: 401 (sin credenciales), 201 (creado) y 404 (no existe).',
      'Los avisos con «·» son los observadores reaccionando al pedido.'
    ]
  },
  {
    kicker: 'Criterio',
    title: 'Cuándo usarlos y cuándo no',
    lead: 'Los patrones son soluciones, no adornos. Antes de aplicar uno, pregúntate qué problema real resuelve.',
    bullets: [
      'Si solo hay **una** forma de hacerlo, no necesitas un Strategy.',
      'Demasiados patrones hacen el código difícil de seguir: elige el más simple que resuelva el problema.'
    ],
    cards: [
      {
        label: 'Singleton',
        sub: 'Necesitas una sola instancia compartida: logger, conexión.',
        on: true
      },
      {
        label: 'Strategy',
        sub: 'Hay varias formas de hacer lo mismo y se elige al ejecutar.',
        on: true
      },
      {
        label: 'Observer',
        sub: 'Un cambio debe notificar a varios interesados.',
        on: true
      },
      {
        label: 'Decorator',
        sub: 'Quieres añadir funciones sin modificar el original.',
        on: true
      },
      {
        label: 'Adapter',
        sub: 'Dos piezas no se entienden, o quieres poder cambiar de base de datos.',
        on: true
      },
      {
        label: 'Factory Method',
        sub: 'Qué objeto crear depende de la configuración.',
        on: true
      },
      {
        label: 'Chain of Responsibility',
        sub: 'Una petición pasa por varios pasos independientes.',
        on: true
      },
      {
        label: 'Facade',
        sub: 'Un proceso toca varios subsistemas y quieres una sola entrada.',
        on: true
      }
    ],
    motif: 'cloud',
    accent: '#f5a623',
    hints: [
      'Primero identifica el problema; después, busca el patrón. Nunca al revés.',
      'Si no puedes explicar en una frase qué problema resuelve un patrón en tu código, probablemente sobra.'
    ]
  },
  {
    kicker: 'Práctica',
    title: 'Retos para practicar',
    lead: 'Elige uno por patrón. Todos se resuelven **agregando** archivos o líneas, no reescribiendo lo que ya funciona: esa es la señal de que el patrón está bien aplicado.',
    bullets: [
      '**Strategy:** agrega la estrategia `nequi` a `paymentStrategies.js` sin tocar `payment.js`.',
      '**Observer:** suscribe un observador a `order:created` que escriba el pedido en un archivo con `fs`.',
      '**Decorator:** escribe `withRateLimit(fn, max)`, que rechace más de `max` llamadas por minuto.',
      '**Adapter:** agrega el método `delete(id)` al contrato y a los dos adaptadores.',
      '**Factory Method:** agrega un proveedor `memory` que guarde los productos en un arreglo.',
      '**Chain of Responsibility:** crea el middleware `requireRole("admin")` que use `req.user.role`.'
    ],
    motif: 'grid',
    accent: '#ff0080',
    hints: [
      'En las próximas clases reemplazarás los simuladores por Express, Supabase y MongoDB Atlas reales.',
      'Si un reto te obliga a editar muchos archivos viejos, revisa dónde está el acoplamiento.'
    ]
  },
  {
    kicker: 'Créditos',
    title: 'Fuentes',
    lead: 'Esta clase se basa en dos artículos. Los ejemplos de código se reescribieron para Node.js moderno (ES Modules) y para el backend.',
    bullets: [
      '**Platzi:** «¿Qué son los patrones de diseño? Conoce para qué te sirven», de Italo Morales F. `platzi.com/blog/patrones-de-diseno`',
      '**freeCodeCamp en español:** «4 patrones de diseño que deberías saber para desarrollo web: Observador, Singleton, estrategia y decorador», traducido por Elias Ezequiel Pereyra Gomez (21 de abril de 2023). El original en inglés es de freeCodeCamp.',
      '**Libro de referencia:** «Design Patterns: Elements of Reusable Object-Oriented Software», de Gamma, Helm, Johnson y Vlissides (1994).'
    ],
    motif: 'cloud',
    accent: '#0070f3',
    hints: [
      '¡Terminaste! Ahora abre la carpeta `src/` y juega con los ejemplos.',
      'Lee los artículos originales: explican los mismos patrones con otros ejemplos.'
    ]
  }
];
