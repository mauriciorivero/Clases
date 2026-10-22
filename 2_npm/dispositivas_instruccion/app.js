(() => {
  'use strict';
  const root = document.documentElement;
  root.lang = 'es';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = () => mqReduce.matches;
  const mqDark = matchMedia('(prefers-color-scheme: dark)');
  const OH = () => (typeof window.objectHash === 'function' ? window.objectHash : null);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ================= Datos ================= */
  const P = '~/encriptador $';
  const NODE_V = 'v24.18.0';
  const NPM_V = '12.0.2';
  const RUN_OUT = [
    'Persona: {"name":"mauricio","genre":"hombre","nationality":"colombia","age":"30","friends":["ana","luis"]}',
    'Persona encriptada: 3776f6410707a9f7a3f16ca3d631addb3c2b11f8',
    'Nombre encriptado: 7e96516df3b782ca4250e77a78348bbd5ff339bd',
    'Persona encriptada con MD5 y codificada en base64: Pz29/PLzVerEC3aFx3T4fw==',
  ];
  const TERMS = {
    versions: { steps: [{ cmd: 'node -v', out: [NODE_V] }, { cmd: 'npm -v', out: [NPM_V] }] },
    init: { steps: [{ cmd: 'npm init', out: [
      { t: 'This utility will walk you through creating a package.json file.', c: 'dim' },
      { t: 'It only covers the most common items, and tries to guess sensible defaults.', c: 'dim' },
      '',
      { t: 'Press ^C at any time to quit.', c: 'dim' },
      { q: 'package name: (encriptador) ', a: '' },
      { q: 'version: (1.0.0) ', a: '' },
      { q: 'description: ', a: 'una aplicacion node para encriptar objetos y datos' },
      { q: 'entry point: (index.js) ', a: 'src/index.js' },
      { q: 'test command: ', a: '' },
      { q: 'git repository: ', a: '' },
      { q: 'keywords: ', a: 'encrypt, data, objects, security' },
      { q: 'author: ', a: '@mauriciorivero' },
      { q: 'license: ', a: 'MIT' },
      { q: 'type: ', a: 'module' },
      { t: 'About to write to /…/encriptador/package.json:', c: 'dim' },
      { t: '{ … }', c: 'dim' },
      { q: 'Is this OK? (yes) ', a: 'yes' },
    ] }] },
    install: { steps: [{ cmd: 'npm i object-hash', out: ['added 1 package, and audited 2 packages in 476ms', '', { t: 'found 0 vulnerabilities', c: 'ok' }] }] },
    run: { steps: [{ cmd: 'node src/index.js mauricio hombre colombia 30 ana luis', out: RUN_OUT.map((t, i) => ({ t, link: 'o' + (i + 1) })) }] },
    start: { steps: [{ cmd: 'npm start -- mauricio hombre colombia 30 ana luis', out: [
      { t: 'npm notice run encriptador@1.0.0 start', c: 'dim' },
      { t: 'npm notice run node src/index.js mauricio hombre colombia 30 ana luis', c: 'dim' },
      ...RUN_OUT,
    ] }] },
  };
  const esmScript = (type) => ({ steps: [{ cmd: 'node src/index.js', out: type === 'module' ? [] : [
    { t: '(node:21564) Warning: Failed to load the ES module: /…/encriptador/src/index.js. Make sure to set "type": "module" in the nearest package.json file or use the .mjs extension.', c: 'warn' },
    { t: '(Use `node --trace-warnings ...` to show where the warning was created)', c: 'dim' },
    '/…/encriptador/src/index.js:2',
    "import hash from 'object-hash';",
    '^^^^^^',
    '',
    { t: 'SyntaxError: Cannot use import statement outside a module', c: 'err' },
  ] }] });
  const CRASH = [
    '/…/encriptador/node_modules/object-hash/index.js:82',
    "    throw new Error('Object argument required.');",
    '          ^',
    '',
    { t: 'Error: Object argument required.', c: 'err' },
    { t: '    at applyDefaults (/…/encriptador/node_modules/object-hash/index.js:82:11)', c: 'dim' },
    { t: '    at objectHash (/…/encriptador/node_modules/object-hash/index.js:31:13)', c: 'dim' },
    { t: '    at file:///…/encriptador/src/index.js:17:30', c: 'err' },
    { t: '    at ModuleJob.run (node:internal/modules/esm/module_job:439:25)', c: 'dim' },
    { t: '    at async node:internal/modules/esm/loader:643:26', c: 'dim' },
    { t: '    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)', c: 'dim' },
    '',
    'Node.js ' + NODE_V,
  ];

  const HINTS = {
    'portada': [
      '¡Hola! Soy Hashi. Haz clic en mí en cualquier diapositiva y te doy una pista sobre su código.',
      'Navega con <kbd>←</kbd> <kbd>→</kbd> o con los botones de abajo. La tecla <kbd>H</kbd> también me despierta y <kbd>T</kbd> cambia el tema.',
      'Spoiler: object-hash no cifra, calcula hashes. En el cierre te explico por qué esa diferencia importa.',
    ],
    'mapa': [
      'Haz clic en cualquier paso de la ruta para saltar directo a él.',
      '<code>node_modules/</code> aparece en el paso 3. No lo subas a Git: se reconstruye con <code>npm install</code> a partir de package-lock.json.',
      '<code>config.js</code> es opcional en este proyecto. Lo creas en el paso 7 para sacar la configuración del código.',
    ],
    'paso-1': [
      '<code>-v</code> es la forma corta de <code>--version</code>. Los dos funcionan con node y con npm.',
      'Si instalaste Node con la terminal abierta, ciérrala y abre otra. La terminal vieja todavía no conoce el comando.',
      'No necesitas instalar npm aparte: llega junto con Node.js.',
    ],
    'paso-2': [
      '<code>npm init -y</code> responde que sí a todo. Es la forma más rápida de empezar.',
      'Revisa <code>"type"</code>: npm 12 escribe <code>"commonjs"</code> por defecto y el <code>import</code> del paso 4 necesita <code>"module"</code>.',
      'package.json es JSON estricto: comillas dobles en todas las claves y sin coma después del último elemento.',
    ],
    'paso-3': [
      '<code>npm i</code> es la abreviatura de <code>npm install</code>.',
      '<code>^3.0.0</code> acepta cualquier versión 3.x.x, nunca la 4.0.0. La versión exacta queda escrita en package-lock.json.',
      '<code>crypto</code> viene con Node: se usa con <code>import crypto from \'node:crypto\'</code>, sin instalar nada.',
    ],
    'paso-4': [
      'Si ves <code>Cannot use import statement outside a module</code>, revisa que package.json diga <code>"type": "module"</code>.',
      'Con <code>"module"</code> la terminal no imprime nada. Está bien: por ahora el programa solo importa la librería.',
      'En CommonJS la línea equivalente sería <code>const hash = require(\'object-hash\');</code>.',
    ],
    'paso-5': [
      'Cambia una sola letra de la contraseña y mira cuántas barras de la huella cambian de color.',
      'object-hash usa SHA-1 por defecto y lo muestra en hexadecimal: siempre 40 caracteres, sin importar el largo de la entrada.',
      'Un nombre más preciso sería <code>hashPassword</code>: aquí nada se cifra ni se puede descifrar.',
    ],
    'paso-6': [
      '<code>===</code> compara valor y tipo. Los dos hashes son strings, así que la comparación es directa.',
      'Las mayúsculas cuentan: <code>Clave123</code> y <code>clave123</code> producen hashes totalmente distintos.',
      'Sin sal, dos personas con la misma contraseña tendrían el mismo hash guardado. bcrypt evita eso.',
    ],
    'paso-7': [
      'Con módulos ES la extensión es obligatoria: <code>\'./config.js\'</code> funciona, <code>\'./config\'</code> no.',
      '<code>export const config</code> es una exportación con nombre. Por eso se importa con llaves: <code>{ config }</code>.',
      'Agrega <code>.env</code> a tu <code>.gitignore</code> para que la clave nunca llegue al repositorio.',
    ],
    'paso-8': [
      'Todo lo que llega por argv es texto: <code>age</code> vale <code>\'30\'</code>, no <code>30</code>. Usa <code>Number(args[3])</code> si necesitas un número.',
      'Escribe más nombres al final del comando en el panel: todos terminan dentro de <code>friends</code>.',
      'El comentario de la línea 4 sugiere separar con comas. Mejor solo espacios: si no, la coma queda dentro del valor.',
      'El comentario de la línea 7 dice "name, stapler y friends", pero el objeto tiene otras propiedades. Mantén los comentarios al día.',
      'Detalle de inglés: el género de una persona es <code>gender</code>. <code>genre</code> es un género musical o literario.',
    ],
    'paso-8-hash': [
      'object-hash ordena las claves antes de hashear: <code>{ a, b }</code> y <code>{ b, a }</code> dan el mismo hash.',
      'El orden de los arrays sí cuenta: <code>[\'ana\', \'luis\']</code> y <code>[\'luis\', \'ana\']</code> dan hashes distintos.',
      '<code>hash(\'mauricio\')</code> no es el SHA-1 de "mauricio". La librería hashea <code>string:8:mauricio</code>, con el tipo y el largo.',
    ],
    'paso-9': [
      '<code>npm start</code> es un atajo de <code>npm run start</code>. Un script llamado <code>dev</code> se ejecuta con <code>npm run dev</code>.',
      'El <code>--</code> separa las opciones de npm de las de tu programa. Es obligatorio cuando pasas algo que empieza con guion, como <code>--verbose</code>.',
      'Sin datos, <code>persona.name</code> es <code>undefined</code> y <code>hash(undefined)</code> lanza <code>Object argument required.</code> en la línea 17.',
    ],
    'terminal': [
      'Ejecuta <code>npm start</code> sin datos para ver el error real que lanza la línea 17.',
      'Usa comillas para un dato con espacios: <code>npm start -- "Juan Pablo" hombre colombia 30</code>.',
      'Las flechas <kbd>↑</kbd> <kbd>↓</kbd> recorren los comandos que ya ejecutaste.',
    ],
    'cierre': [
      'Cifrar se deshace con una clave. Un hash va en un solo sentido: no hay vuelta atrás.',
      'En <code>bcrypt.hash(password, 10)</code> el 10 es el costo. Cada punto extra duplica el tiempo de cálculo.',
      'Para el reto: <code>if (args.length &lt; 4) { … process.exit(1); }</code> va justo después de leer <code>args</code>.',
    ],
  };

  /* ================= Editor de código ================= */
  const SNIP = {};
  $$('script[data-snippet]').forEach((s) => { SNIP[s.dataset.snippet] = s.textContent.replace(/^\n/, '').replace(/\s+$/, ''); });

  function highlight(code, lang) {
    if (window.hljs && lang && window.hljs.getLanguage(lang)) {
      try {
        return window.hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
          .replace(/<span class="hljs-keyword">(const|let|var|function)<\/span>/g, '<span class="hljs-keyword kw-storage">$1</span>');
      } catch (e) { /* plain text fallback */ }
    }
    return esc(code);
  }
  function splitLines(html) {
    const lines = []; const open = []; let cur = '';
    const re = /(<span[^>]*>)|(<\/span>)|(\n)|([^<\n]+)/g; let m;
    while ((m = re.exec(html))) {
      if (m[1]) { open.push(m[1]); cur += m[1]; }
      else if (m[2]) { open.pop(); cur += m[2]; }
      else if (m[3]) { cur += '</span>'.repeat(open.length); lines.push(cur); cur = open.join(''); }
      else cur += m[4];
    }
    lines.push(cur);
    return lines;
  }
  function parseRanges(s) {
    const set = new Set();
    (s || '').split(',').forEach((part) => { const [a, b] = part.split('-').map(Number); if (!a) return; for (let n = a; n <= (b || a); n++) set.add(n); });
    return set;
  }
  function renderCode(pre, code) {
    const start = +pre.dataset.start || 1;
    const nums = pre.dataset.nums ? pre.dataset.nums.split(',').map(Number) : null;
    const focus = parseRanges(pre.dataset.focus);
    const links = {};
    (pre.dataset.links || '').split(',').forEach((p) => { const [n, k] = p.split(':'); if (k) links[+n] = k; });
    pre.innerHTML = splitLines(highlight(code, pre.dataset.lang)).map((html, i) => {
      const n = nums ? nums[i] : start + i; const link = links[n];
      return `<span class="line${focus.has(n) ? ' is-focus' : ''}" style="--ln:${i}"${link ? ` data-link="${link}" tabindex="0"` : ''}><span class="ln" aria-hidden="true">${n}</span><span class="lc">${html || ' '}</span></span>`;
    }).join('');
  }
  $$('pre.code[data-src]').forEach((pre) => renderCode(pre, SNIP[pre.dataset.src] || ''));

  // Pestañas del editor
  function selectTab(tab) {
    const list = tab.closest('[role="tablist"]');
    $$('[role="tab"]', list).forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const pane = document.getElementById(t.getAttribute('aria-controls'));
      if (pane) pane.hidden = !on;
    });
    tab.classList.remove('has-news');
  }
  $$('[role="tab"]').forEach((t) => t.addEventListener('click', () => selectTab(t)));

  /* ================= Terminal ================= */
  const colorHashes = (s) => esc(s).replace(/\b[0-9a-f]{40}\b|[A-Za-z0-9+/]{22}==/g, (m) => `<span class="hx">${m}</span>`);
  function termLine(cls, html) { const d = document.createElement('div'); d.className = 'tl' + (cls ? ' ' + cls : ''); d.innerHTML = html; return d; }
  function outLine(o) {
    if (typeof o === 'string') o = { t: o };
    const el = termLine(o.c || '', colorHashes(o.t));
    if (o.link) el.dataset.link = o.link;
    return el;
  }
  const promptHtml = () => `<span class="pr">${esc(P)}</span> `;
  function scriptLines(script) { return script.steps.reduce((n, s) => n + 1 + (s.out ? s.out.length : 0), 1); }

  function playTerminal(box, script, opts = {}) {
    let cancelled = false;
    const token = { cancel() { cancelled = true; } };
    const instant = reduce() || opts.instant;
    box.innerHTML = '';
    const down = () => { box.scrollTop = box.scrollHeight; };
    (async () => {
      await sleep(instant ? 0 : (opts.delay == null ? 520 : opts.delay));
      for (const step of script.steps) {
        if (cancelled) return;
        const line = termLine('', promptHtml() + '<span class="cmd"></span><span class="caret"></span>');
        box.appendChild(line);
        const cmdEl = $('.cmd', line);
        if (instant) cmdEl.textContent = step.cmd;
        else {
          for (const ch of step.cmd) { if (cancelled) return; cmdEl.textContent += ch; await sleep(20 + Math.random() * 36); }
          await sleep(260);
        }
        $('.caret', line).remove();
        for (const o of step.out || []) {
          if (cancelled) return;
          if (o && o.q !== undefined) {
            const l = termLine('', esc(o.q) + '<span class="a"></span><span class="caret"></span>');
            box.appendChild(l); down();
            const a = $('.a', l);
            if (instant) a.textContent = o.a;
            else {
              await sleep(160);
              for (const ch of o.a) { if (cancelled) return; a.textContent += ch; await sleep(14 + Math.random() * 26); }
              await sleep(120);
            }
            $('.caret', l).remove();
          } else {
            box.appendChild(outLine(o));
            if (!instant) await sleep(55);
          }
          down();
        }
        if (!instant) await sleep(300);
      }
      if (cancelled) return;
      box.appendChild(termLine('', promptHtml() + '<span class="caret"></span>'));
      down();
      if (opts.onDone) opts.onDone();
    })();
    return token;
  }
  // Reserva la altura final para que el texto no empuje el diseño mientras se escribe
  $$('[data-term]').forEach((box) => { const s = TERMS[box.dataset.term]; if (s) box.style.minHeight = `min(calc(${scriptLines(s) * 1.6}em + 26px), 52vh, 430px)`; });
  $('#esmTerm').style.minHeight = `calc(${scriptLines(esmScript('commonjs')) * 1.6}em + 26px)`;

  function shellSplit(s) {
    const out = []; let cur = ''; let q = null; let has = false;
    for (const ch of s) {
      if (q) { if (ch === q) q = null; else cur += ch; }
      else if (ch === '"' || ch === "'") { q = ch; has = true; }
      else if (/\s/.test(ch)) { if (cur || has) { out.push(cur); cur = ''; has = false; } }
      else cur += ch;
    }
    if (cur || has) out.push(cur);
    return out;
  }
  const personaFrom = (args) => ({ name: args[0], genre: args[1], nationality: args[2], age: args[3], friends: args.slice(4) });

  /* ================= Escenario three.js (2D) ================= */
  function rrPath(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function hexPath(g, cx, cy, r) {
    g.beginPath();
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + k * Math.PI / 3; const x = cx + Math.cos(a) * r; const y = cy + Math.sin(a) * r; if (k) g.lineTo(x, y); else g.moveTo(x, y); }
    g.closePath();
  }
  const seg = (g, pts) => { g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
  const EMBLEMS = {
    hexagon(g, S) {
      hexPath(g, S / 2, S / 2, S * 0.43); g.stroke(); hexPath(g, S / 2, S / 2, S * 0.24); g.stroke();
      for (let k = 0; k < 6; k += 2) { const a = -Math.PI / 2 + k * Math.PI / 3; seg(g, [[S / 2 + Math.cos(a) * S * 0.24, S / 2 + Math.sin(a) * S * 0.24], [S / 2 + Math.cos(a) * S * 0.43, S / 2 + Math.sin(a) * S * 0.43]]); }
    },
    terminal(g, S) {
      rrPath(g, S * 0.1, S * 0.18, S * 0.8, S * 0.64, S * 0.08); g.stroke();
      seg(g, [[S * 0.1, S * 0.32], [S * 0.9, S * 0.32]]);
      seg(g, [[S * 0.27, S * 0.45], [S * 0.39, S * 0.55], [S * 0.27, S * 0.65]]);
      seg(g, [[S * 0.47, S * 0.66], [S * 0.66, S * 0.66]]);
    },
    braces(g, S) { g.font = `500 ${S * 0.6}px "Geist Mono", ui-monospace, monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('{ }', S / 2, S * 0.53); },
    package(g, S) {
      const c = S / 2; const r = S * 0.42; hexPath(g, c, c, r); g.stroke();
      [Math.PI / 2, -Math.PI / 6, Math.PI * 7 / 6].forEach((a) => seg(g, [[c, c], [c + Math.cos(a) * r, c + Math.sin(a) * r]]));
    },
    importArrow(g, S) {
      seg(g, [[S * 0.2, S * 0.52], [S * 0.2, S * 0.84], [S * 0.8, S * 0.84], [S * 0.8, S * 0.52]]);
      seg(g, [[S * 0.5, S * 0.12], [S * 0.5, S * 0.64]]);
      seg(g, [[S * 0.33, S * 0.47], [S * 0.5, S * 0.64], [S * 0.67, S * 0.47]]);
    },
    hash(g, S) {
      seg(g, [[S * 0.42, S * 0.14], [S * 0.33, S * 0.86]]); seg(g, [[S * 0.68, S * 0.14], [S * 0.59, S * 0.86]]);
      seg(g, [[S * 0.17, S * 0.37], [S * 0.85, S * 0.37]]); seg(g, [[S * 0.14, S * 0.63], [S * 0.82, S * 0.63]]);
    },
    check(g, S) { g.beginPath(); g.arc(S / 2, S / 2, S * 0.4, 0, Math.PI * 2); g.stroke(); seg(g, [[S * 0.3, S * 0.52], [S * 0.44, S * 0.66], [S * 0.71, S * 0.37]]); },
    cross(g, S) { g.beginPath(); g.arc(S / 2, S / 2, S * 0.4, 0, Math.PI * 2); g.stroke(); seg(g, [[S * 0.35, S * 0.35], [S * 0.65, S * 0.65]]); seg(g, [[S * 0.65, S * 0.35], [S * 0.35, S * 0.65]]); },
    gear(g, S) {
      const c = S / 2; const n = 9; g.beginPath();
      for (let k = 0; k < n * 2; k++) {
        const a0 = (k / (n * 2)) * Math.PI * 2; const a1 = ((k + 1) / (n * 2)) * Math.PI * 2; const r = k % 2 ? S * 0.31 : S * 0.42;
        g.lineTo(c + Math.cos(a0) * r, c + Math.sin(a0) * r); g.lineTo(c + Math.cos(a1) * r, c + Math.sin(a1) * r);
      }
      g.closePath(); g.stroke(); g.beginPath(); g.arc(c, c, S * 0.13, 0, Math.PI * 2); g.stroke();
    },
    array(g, S) {
      seg(g, [[S * 0.25, S * 0.2], [S * 0.12, S * 0.2], [S * 0.12, S * 0.8], [S * 0.25, S * 0.8]]);
      seg(g, [[S * 0.75, S * 0.2], [S * 0.88, S * 0.2], [S * 0.88, S * 0.8], [S * 0.75, S * 0.8]]);
      [0.34, 0.5, 0.66].forEach((x) => { g.beginPath(); g.arc(S * x, S * 0.5, S * 0.05, 0, Math.PI * 2); g.fill(); });
    },
    fingerprint(g, S) {
      const c = S / 2; const cy = S * 0.53;
      [[0.07, -0.4, 3.9], [0.15, -0.2, 3.4], [0.23, 0.3, 2.9], [0.31, -0.6, 3.6], [0.39, 0.15, 3.3]].forEach(([r, a0, len], k) => {
        g.beginPath(); g.arc(c, cy, S * r, Math.PI + a0, Math.PI + a0 + len); g.stroke();
        if (k > 1) { g.beginPath(); g.arc(c, cy, S * r, Math.PI + a0 + len + 0.55, Math.PI + a0 + len + 1.25); g.stroke(); }
      });
    },
    play(g, S) {
      rrPath(g, S * 0.14, S * 0.14, S * 0.72, S * 0.72, S * 0.18); g.stroke();
      g.beginPath(); g.moveTo(S * 0.42, S * 0.34); g.lineTo(S * 0.67, S * 0.5); g.lineTo(S * 0.42, S * 0.66); g.closePath(); g.stroke();
    },
    lock(g, S) {
      g.beginPath(); g.moveTo(S * 0.33, S * 0.47); g.lineTo(S * 0.33, S * 0.34); g.arc(S * 0.5, S * 0.34, S * 0.17, Math.PI, 0); g.lineTo(S * 0.67, S * 0.47); g.stroke();
      rrPath(g, S * 0.22, S * 0.46, S * 0.56, S * 0.4, S * 0.07); g.stroke();
      g.beginPath(); g.arc(S * 0.5, S * 0.62, S * 0.045, 0, Math.PI * 2); g.fill();
      seg(g, [[S * 0.5, S * 0.64], [S * 0.5, S * 0.74]]);
    },
  };
  function sampleEmblem(draw) {
    const S = 200; const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = S * 0.05; g.strokeStyle = '#000'; g.fillStyle = '#000';
    draw(g, S);
    const d = g.getImageData(0, 0, S, S).data; const pts = [];
    for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (d[(y * S + x) * 4 + 3] > 140) pts.push(x / S - 0.5, y / S - 0.5);
    return new Float32Array(pts);
  }
  function readTokens() {
    const cs = getComputedStyle(root); const g = (n) => cs.getPropertyValue(n).trim();
    return {
      dot: g('--grid-dot'), spot: g('--grid-spot'), vizA: g('--viz-a'), vizB: g('--viz-b'), glowA: parseFloat(g('--glow-a')) || 0.12,
      rim: g('--hashi-rim'), shadow: g('--hashi-shadow'), code: g('--tool-code'), npm: g('--tool-npm'), dark: isDark(),
    };
  }

  const GRID_FS = `
    uniform vec2 uRes; uniform float uDpr; uniform vec2 uMouse; uniform vec2 uPan; uniform float uSpacing;
    uniform vec3 uDot; uniform vec3 uSpot; uniform vec3 uGlowCol; uniform vec2 uGlowC; uniform float uGlowR; uniform float uGlowA;
    uniform vec2 uWaveO; uniform float uWaveT;
    void main() {
      vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
      vec2 cell = mod(p + uPan, uSpacing) - 0.5 * uSpacing;
      float d = length(cell);
      float spot = 1.0 - smoothstep(0.0, 210.0, distance(p, uMouse));
      float wd = distance(p, uWaveO);
      float wx = (wd - uWaveT * 1150.0) / 70.0;
      float wave = exp(-wx * wx) * clamp(1.0 - uWaveT / 1.5, 0.0, 1.0);
      float k = clamp(spot + wave, 0.0, 1.0);
      float r = 0.95 + spot * 0.75 + wave * 1.25;
      float dotA = (1.0 - smoothstep(r - 0.5, r + 0.7, d)) * (0.72 + 0.28 * k);
      float gl = 1.0 - smoothstep(0.0, max(uGlowR, 1.0), distance(p, uGlowC));
      float glow = uGlowA * gl * gl;
      vec3 col = mix(uGlowCol, mix(uDot, uSpot, k), dotA);
      gl_FragColor = vec4(col, max(dotA, glow));
    }`;
  const PTS_VS = `
    attribute float aSize; attribute float aMix; uniform float uDpr; varying float vMix;
    void main() { vMix = aMix; gl_PointSize = aSize * uDpr; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const PTS_FS = `
    uniform vec3 uA; uniform vec3 uB; uniform float uOpacity; varying float vMix;
    void main() { float d = length(gl_PointCoord - 0.5); float a = 1.0 - smoothstep(0.26, 0.5, d); if (a < 0.02) discard; gl_FragColor = vec4(mix(uA, uB, vMix), a * uOpacity); }`;

  function createStage(canvas) {
    const T = window.THREE; if (!T) return null;
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(0, 1, 0, -1, -10, 10);
    let W = 1; let H = 1;

    const gu = {
      uRes: { value: new T.Vector2(1, 1) }, uDpr: { value: 1 }, uMouse: { value: new T.Vector2(-9999, -9999) }, uPan: { value: new T.Vector2() },
      uSpacing: { value: 26 }, uDot: { value: new T.Color() }, uSpot: { value: new T.Color() }, uGlowCol: { value: new T.Color() },
      uGlowC: { value: new T.Vector2(-9999, -9999) }, uGlowR: { value: 1 }, uGlowA: { value: 0 }, uWaveO: { value: new T.Vector2() }, uWaveT: { value: 9 },
    };
    const grid = new T.Mesh(new T.PlaneGeometry(1, 1), new T.ShaderMaterial({
      uniforms: gu, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: 'void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: GRID_FS,
    }));
    grid.frustumCulled = false; grid.renderOrder = 0; scene.add(grid);

    const N = innerWidth < 760 ? 720 : 1400;
    const pos = new Float32Array(N * 3); const vel = new Float32Array(N * 2);
    const size = new Float32Array(N); const mix = new Float32Array(N);
    const rA = new Float32Array(N); const rB = new Float32Array(N); const rC = new Float32Array(N); const rD = new Float32Array(N); const ph = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      rA[i] = Math.random(); rB[i] = Math.random(); rC[i] = Math.random(); rD[i] = Math.random(); ph[i] = Math.random() * Math.PI * 2;
      size[i] = 1.5 + Math.pow(Math.random(), 2) * 2.6; mix[i] = rB[i];
      pos[i * 3] = rC[i] * innerWidth; pos[i * 3 + 1] = -rD[i] * innerHeight;
    }
    const geo = new T.BufferGeometry();
    const posAttr = new T.BufferAttribute(pos, 3); const mixAttr = new T.BufferAttribute(mix, 1);
    geo.setAttribute('position', posAttr); geo.setAttribute('aSize', new T.BufferAttribute(size, 1)); geo.setAttribute('aMix', mixAttr);
    const pu = { uA: { value: new T.Color() }, uB: { value: new T.Color() }, uOpacity: { value: 0 }, uDpr: { value: 1 } };
    const points = new T.Points(geo, new T.ShaderMaterial({ uniforms: pu, vertexShader: PTS_VS, fragmentShader: PTS_FS, transparent: true, depthTest: false, depthWrite: false }));
    points.frustumCulled = false; points.renderOrder = 2; scene.add(points);

    const SH = {};
    Object.keys(EMBLEMS).forEach((k) => { SH[k] = sampleEmblem(EMBLEMS[k]); });
    if (document.fonts && document.fonts.load) document.fonts.load('500 120px "Geist Mono"').then(() => { SH.braces = sampleEmblem(EMBLEMS.braces); }).catch(() => {});

    const mouse = { x: -9999, y: -9999 };
    addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') { mouse.x = mouse.y = -9999; } }, { passive: true });
    root.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

    const col = { dot: new T.Color(), spot: new T.Color(), a: new T.Color(), b: new T.Color() };
    let glowMax = 0.12; let clock = 0; let waveT0 = -9; let morphT0 = -9;
    let cur = { kind: 'ambient' }; let prev = { kind: 'ambient' };
    const pan = new T.Vector2(); const panT = new T.Vector2();

    function rectOf(el) {
      const r = el.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, s: Math.min(r.width, r.height), ok: r.width >= 56 && r.height >= 56 && r.bottom > -40 && r.top < H + 40 };
    }
    function polyOf(nodes) {
      const pts = nodes.map((n) => { const r = n.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }).filter((p) => p[0] || p[1]);
      const cum = [0];
      for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      return { pts, cum, len: cum[cum.length - 1] || 0 };
    }
    function snapshot(s) {
      if (s.kind === 'emblem') return { kind: 'emblem', name: s.name, rect: s.el ? rectOf(s.el) : s.rect };
      if (s.kind === 'path') return { kind: 'path', poly: s.nodes ? polyOf(s.nodes) : s.poly };
      return { kind: 'ambient' };
    }
    const tmp = [0, 0, 0, 0];
    function target(st, i, t, rm) {
      if (st.kind === 'emblem') {
        const r = st.rect; const sh = SH[st.name];
        if (r && r.ok && sh && sh.length) {
          const k = ((rA[i] * (sh.length / 2)) | 0) * 2; const nx = sh[k]; const ny = sh[k + 1]; const s = r.s * 0.9; const wob = rm ? 0 : 1.3;
          tmp[0] = r.cx + nx * s + Math.sin(t * 1.7 + ph[i]) * wob;
          tmp[1] = r.cy + ny * s + Math.cos(t * 1.3 + ph[i]) * wob;
          tmp[2] = Math.min(1, Math.max(0, 0.5 + nx * 0.95 - ny * 0.95)); tmp[3] = 1; return;
        }
      } else if (st.kind === 'path') {
        const Pp = st.poly;
        if (Pp && Pp.len > 20) {
          const u = (i / N + (rm ? 0 : t * 0.022)) % 1; const d = u * Pp.len;
          let k = 1; while (k < Pp.cum.length - 1 && Pp.cum[k] < d) k++;
          const a = Pp.pts[k - 1]; const b = Pp.pts[k]; const L = (Pp.cum[k] - Pp.cum[k - 1]) || 1; const f = (d - Pp.cum[k - 1]) / L; const j = (rC[i] - 0.5) * 16;
          tmp[0] = a[0] + (b[0] - a[0]) * f - ((b[1] - a[1]) / L) * j;
          tmp[1] = a[1] + (b[1] - a[1]) * f + ((b[0] - a[0]) / L) * j;
          tmp[2] = u; tmp[3] = 2; return;
        }
      }
      tmp[0] = rC[i] * W + (rm ? 0 : Math.sin(t * 0.21 + ph[i]) * 28);
      tmp[1] = rD[i] * H + (rm ? 0 : Math.cos(t * 0.17 + ph[i] * 1.3) * 28);
      tmp[2] = rB[i]; tmp[3] = 0;
    }
    function kick(mag) {
      if (reduce()) return;
      for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2; const m = mag * (0.35 + Math.random()); vel[i * 2] += Math.cos(a) * m; vel[i * 2 + 1] += Math.sin(a) * m; }
    }
    function resize() {
      W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
      camera.right = W; camera.bottom = -H; camera.updateProjectionMatrix();
      grid.scale.set(W, H, 1); grid.position.set(W / 2, -H / 2, 0);
      gu.uRes.value.set(W, H); gu.uDpr.value = dpr; pu.uDpr.value = dpr;
    }
    function setTheme(tk, instant) {
      col.dot.set(tk.dot); col.spot.set(tk.spot); col.a.set(tk.vizA); col.b.set(tk.vizB); glowMax = tk.glowA;
      gu.uGlowCol.value.set(tk.vizA);
      if (instant) { gu.uDot.value.copy(col.dot); gu.uSpot.value.copy(col.spot); pu.uA.value.copy(col.a); pu.uB.value.copy(col.b); }
    }
    function goto(slide, i) {
      const name = slide.dataset.emblem;
      prev = snapshot(cur);
      if (name === 'path') cur = { kind: 'path', nodes: $$('[data-node]', slide) };
      else if (name && $('.viz', slide)) cur = { kind: 'emblem', name, el: $('.viz', slide) };
      else cur = { kind: 'ambient' };
      morphT0 = clock; kick(6);
      panT.set(i * 61, i * 23);
      const r = cur.el ? rectOf(cur.el) : null;
      gu.uWaveO.value.set(r && r.ok ? r.cx : W / 2, r && r.ok ? r.cy : H / 2);
      waveT0 = clock;
    }
    function setShape(name) {
      if (cur.kind !== 'emblem' || cur.name === name) return;
      prev = snapshot(cur); cur = { kind: 'emblem', name, el: cur.el }; morphT0 = clock; kick(4);
    }
    function update(dt, t) {
      clock = t; const rm = reduce();
      if (cur.kind === 'emblem' && cur.el) cur.rect = rectOf(cur.el);
      if (cur.kind === 'path' && cur.nodes) cur.poly = polyOf(cur.nodes);
      const fs = Math.min(2.5, dt * 60); const k = 0.058 * fs; const damp = Math.pow(0.82, fs);
      const since = t - morphT0; const R = 110; const R2 = R * R; const modes = [0, 0, 0];
      const ease = (b) => 1 - Math.pow(1 - b, Math.min(dt * 60, 30)); const eMix = ease(0.08);
      for (let i = 0; i < N; i++) {
        target(since > rB[i] * 0.55 ? cur : prev, i, t, rm);
        const i3 = i * 3; const i2 = i * 2;
        let x = pos[i3]; let y = -pos[i3 + 1]; let vx = vel[i2]; let vy = vel[i2 + 1];
        if (rm) { x = tmp[0]; y = tmp[1]; vx = 0; vy = 0; }
        else {
          vx += (tmp[0] - x) * k; vy += (tmp[1] - y) * k;
          const dx = x - mouse.x; const dy = y - mouse.y; const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 1) { const d = Math.sqrt(d2); const f = (1 - d / R) * 3.4 * fs; vx += (dx / d) * f; vy += (dy / d) * f; }
          vx *= damp; vy *= damp; x += vx * fs; y += vy * fs;
          if (!Number.isFinite(x + y) || Math.abs(x) + Math.abs(y) > 1e5) { x = tmp[0]; y = tmp[1]; vx = 0; vy = 0; }
        }
        pos[i3] = x; pos[i3 + 1] = -y; vel[i2] = vx; vel[i2 + 1] = vy;
        mix[i] += (tmp[2] - mix[i]) * eMix;
        modes[tmp[3]]++;
      }
      posAttr.needsUpdate = true; mixAttr.needsUpdate = true;
      const opT = modes[1] > N * 0.5 ? 0.95 : modes[2] > N * 0.5 ? 0.85 : 0.3;
      pu.uOpacity.value += (opT - pu.uOpacity.value) * ease(0.06);
      const r = cur.kind === 'emblem' ? cur.rect : null;
      if (r && r.ok) { gu.uGlowC.value.set(r.cx, r.cy); gu.uGlowR.value += (r.s * 0.95 - gu.uGlowR.value) * ease(0.1); }
      gu.uGlowA.value += ((r && r.ok ? glowMax : 0) - gu.uGlowA.value) * ease(0.05);
      const ep = rm ? 1 : ease(0.045); pan.x += (panT.x - pan.x) * ep; pan.y += (panT.y - pan.y) * ep;
      gu.uPan.value.copy(pan); gu.uMouse.value.set(mouse.x, mouse.y); gu.uWaveT.value = rm ? 9 : t - waveT0;
      const ec = ease(0.08); gu.uDot.value.lerp(col.dot, ec); gu.uSpot.value.lerp(col.spot, ec); pu.uA.value.lerp(col.a, ec); pu.uB.value.lerp(col.b, ec);
      renderer.render(scene, camera);
    }
    resize();
    return { update, resize, setTheme, goto, setShape, kick };
  }

  /* ================= Hashi, el avatar (three.js) ================= */
  function createHashi(canvas, btn) {
    const T = window.THREE; if (!T) return null;
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return null; }
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    const cam = new T.OrthographicCamera(-1.5, 1.5, 1.5, -1.5, -10, 10);
    let order = 0; const themed = []; const texDraws = [];
    function rrShape(w, h, rt, rb = rt) {
      const s = new T.Shape(); const x = -w / 2; const y = -h / 2;
      s.moveTo(x + rb, y); s.lineTo(x + w - rb, y); if (rb) s.quadraticCurveTo(x + w, y, x + w, y + rb);
      s.lineTo(x + w, y + h - rt); if (rt) s.quadraticCurveTo(x + w, y + h, x + w - rt, y + h);
      s.lineTo(x + rt, y + h); if (rt) s.quadraticCurveTo(x, y + h, x, y + h - rt);
      s.lineTo(x, y + rb); if (rb) s.quadraticCurveTo(x, y, x + rb, y);
      return s;
    }
    const mat = (color, opacity = 1, key) => { const m = new T.MeshBasicMaterial({ color, transparent: true, opacity, depthTest: false, depthWrite: false }); if (key) themed.push([m, key]); return m; };
    const mesh = (g, m) => { const o = new T.Mesh(g, m); o.renderOrder = order++; return o; };
    const RR = (w, h, rt, rb) => new T.ShapeGeometry(rrShape(w, h, rt, rb), 10);
    const CIRC = (r) => new T.CircleGeometry(r, 36);
    const ARC = (ri, ro, a0, len) => new T.RingGeometry(ri, ro, 24, 1, a0, len);
    function glyphTex(ch, px) {
      const c = document.createElement('canvas'); c.width = c.height = 128; const tex = new T.CanvasTexture(c);
      const draw = () => { const g = c.getContext('2d'); g.clearRect(0, 0, 128, 128); g.fillStyle = '#fff'; g.font = `700 ${px}px "Geist Mono", ui-monospace, monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 64, 68); tex.needsUpdate = true; };
      draw(); texDraws.push(draw); return tex;
    }
    const MINT = 0x6fd08c;

    const bot = new T.Group(); scene.add(bot);
    const shadowM = mat(0x000000, 0.16, 'shadow'); const shadow = mesh(CIRC(1), shadowM); shadow.scale.set(0.8, 0.1, 1); shadow.position.y = -1.1; bot.add(shadow);
    const rimM = mat(0x111613, 1, 'rim');
    const feet = [-0.36, 0.36].map((x) => { const f = mesh(RR(0.34, 0.2, 0.09), rimM); f.position.set(x, -1.0, 0); bot.add(f); return f; });
    const body = new T.Group(); body.position.y = -0.98; bot.add(body);
    const antenna = new T.Group(); antenna.position.y = 1.44; body.add(antenna);
    const stalk = mesh(RR(0.06, 0.28, 0.03), rimM); stalk.position.y = 0.12; antenna.add(stalk);
    const glowM = mat(0xf2b04a, 0.22, 'vizB'); const glow = mesh(CIRC(0.2), glowM); glow.position.y = 0.32; antenna.add(glow);
    const bulb = mesh(CIRC(0.1), mat(0xf2b04a, 1, 'vizB')); bulb.position.y = 0.32; antenna.add(bulb);
    const rim = mesh(RR(1.74, 1.46, 0.36), rimM); rim.position.y = 0.73; body.add(rim);
    const screen = mesh(RR(1.58, 1.3, 0.28), mat(0x1a1e1c)); screen.position.y = 0.73; body.add(screen);
    const bar = mesh(RR(1.58, 0.28, 0.28, 0), mat(MINT, 1, 'vizA')); bar.position.y = 1.24; body.add(bar);
    [0xff5f57, 0xfebc2e, 0x28c840].forEach((c, k) => { const d = mesh(CIRC(0.045), mat(c)); d.position.set(-0.6 + k * 0.13, 1.24, 0); body.add(d); });
    const face = new T.Group(); face.position.y = 0.56; body.add(face);
    const eyeM = mat(MINT);
    const eyes = [-0.3, 0.3].map((x) => {
      const g = new T.Group(); g.position.set(x, 0.08, 0);
      const e = mesh(RR(0.19, 0.3, 0.095), eyeM); const h = mesh(CIRC(0.038), mat(0xffffff, 0.85)); h.position.set(-0.035, 0.07, 0);
      g.add(e, h); face.add(g); return g;
    });
    const happy = [-0.3, 0.3].map((x) => { const a = mesh(ARC(0.085, 0.14, 0, Math.PI), eyeM); a.position.set(x, 0.03, 0); a.visible = false; face.add(a); return a; });
    const smile = mesh(ARC(0.085, 0.13, Math.PI * 1.13, Math.PI * 0.74), eyeM); smile.position.y = -0.17; face.add(smile);
    const frown = mesh(ARC(0.085, 0.13, Math.PI * 0.18, Math.PI * 0.64), eyeM); frown.position.y = -0.33; frown.visible = false; face.add(frown);
    const mouth = mesh(CIRC(0.1), mat(0xff8fa3)); mouth.position.y = -0.25; mouth.visible = false; face.add(mouth);
    [-0.54, 0.54].forEach((x) => { const c = mesh(CIRC(0.08), mat(0xff7a9a, 0.5)); c.position.set(x, -0.13, 0); face.add(c); });
    const hands = [['<', -1.07], ['>', 1.07]].map(([ch, x]) => {
      const m = new T.SpriteMaterial({ map: glyphTex(ch, 100), color: MINT, transparent: true, depthTest: false, depthWrite: false }); themed.push([m, 'vizA']);
      const s = new T.Sprite(m); s.scale.set(0.56, 0.56, 1); s.position.set(x, 0.62, 0); s.renderOrder = order++; body.add(s); return s;
    });
    const GLYPHS = ['{ }', '#', ';', '</>', '=>', '()', '[ ]', '0x', '&&', '$'];
    const GKEYS = ['vizA', 'vizB', 'code', 'npm'];
    const pool = GLYPHS.map((ch, k) => {
      const m = new T.SpriteMaterial({ map: glyphTex(ch, ch.length > 2 ? 52 : ch.length > 1 ? 66 : 92), transparent: true, opacity: 0, depthTest: false, depthWrite: false });
      themed.push([m, GKEYS[k % GKEYS.length]]);
      const s = new T.Sprite(m); s.scale.set(0.44, 0.44, 1); s.visible = false; s.renderOrder = 1000 + k; scene.add(s);
      return { s, m, vx: 0, vy: 0, life: 0, rot: 0 };
    });
    if (document.fonts && document.fonts.load) document.fonts.load('700 100px "Geist Mono"').then(() => texDraws.forEach((d) => d())).catch(() => {});

    const st = { t: 0, expr: 'idle', exprUntil: 0, jumpT0: -9, jumpH: 0.32, blinkT0: -9, nextBlink: 1.6, talkUntil: 0, waveUntil: 0, hover: false, news: false, lx: 0, ly: 0 };
    let baseShadow = 0.16;
    const ptr = { x: null, y: null };
    addEventListener('pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; }, { passive: true });
    btn.addEventListener('pointerenter', () => { st.hover = true; });
    btn.addEventListener('pointerleave', () => { st.hover = false; });

    function setExpr(e) {
      st.expr = e;
      const h = e === 'happy';
      eyes.forEach((g) => { g.visible = !h; }); happy.forEach((a) => { a.visible = h; }); frown.visible = e === 'sad';
    }
    function react(e, dur = 1.2, burst = false) {
      setExpr(e); st.exprUntil = st.t + dur;
      if (e !== 'sad') { st.jumpT0 = st.t; st.jumpH = 0.32; }
      if (e === 'happy') st.waveUntil = st.t + 0.9;
      if (burst) spawn(5 + ((Math.random() * 3) | 0));
    }
    function spawn(n) {
      let k = 0;
      for (const p of pool) {
        if (k >= n) break; if (p.life > 0) continue;
        p.life = 1; p.s.visible = true; p.s.position.set((Math.random() - 0.5) * 0.7, 0.45, 0);
        p.vx = (Math.random() - 0.5) * 2.8; p.vy = 1.8 + Math.random() * 1.5; p.rot = (Math.random() - 0.5) * 3; k++;
      }
    }
    function update(dt, t) {
      st.t = t; const rm = reduce();
      if (st.expr !== 'idle' && t > st.exprUntil) setExpr('idle');
      const r = canvas.getBoundingClientRect(); let lx = 0; let ly = 0;
      if (ptr.x !== null) {
        const dx = ptr.x - (r.left + r.width / 2); const dy = ptr.y - (r.top + r.height * 0.55); const m = Math.max(1, Math.hypot(dx, dy)); const k = Math.min(1, m / 260);
        lx = (dx / m) * k; ly = (-dy / m) * k;
      }
      st.lx += (lx - st.lx) * 0.12; st.ly += (ly - st.ly) * 0.12;
      face.position.x = st.lx * 0.1; face.position.y = 0.56 + st.ly * 0.06 + (st.expr === 'sad' ? -0.04 : 0);
      if (t > st.nextBlink) { st.blinkT0 = t; st.nextBlink = t + 2.2 + Math.random() * 3.6; }
      const bp = (t - st.blinkT0) / 0.15; const eyeY = bp < 1 ? Math.max(0.12, Math.abs(1 - 2 * bp)) : 1; const eyeS = st.expr === 'surprised' ? 1.22 : 1;
      eyes.forEach((g) => g.scale.set(eyeS, eyeY * eyeS, 1));
      const talking = t < st.talkUntil;
      const open = st.expr === 'happy' || st.expr === 'surprised' || (talking && Math.sin(t * 24) > -0.2);
      mouth.visible = open && st.expr !== 'sad'; smile.visible = !mouth.visible && st.expr !== 'sad';
      mouth.scale.set(1, talking && st.expr === 'idle' ? 0.4 + 0.45 * Math.abs(Math.sin(t * 12)) : 0.8, 1);
      let jy = 0; let sx = 1; let sy = 1; const jt = t - st.jumpT0;
      if (!rm && jt >= 0 && jt < 0.75) {
        if (jt < 0.12) { const p = jt / 0.12; sy = 1 - 0.16 * p; sx = 1 + 0.12 * p; }
        else if (jt < 0.55) { const p = Math.sin(((jt - 0.12) / 0.43) * Math.PI); jy = p * st.jumpH; sy = 1 + 0.1 * p; sx = 1 - 0.06 * p; }
        else { const p = Math.sin(((jt - 0.55) / 0.2) * Math.PI); sy = 1 - 0.08 * p; sx = 1 + 0.06 * p; }
      }
      const bob = rm ? 0 : Math.sin(t * 2.3) * 0.03;
      body.position.y = -0.98 + bob + jy; body.scale.set(sx, sy * (st.expr === 'sad' ? 0.96 : 1), 1);
      feet.forEach((f) => { f.position.y = -1.0 + jy * 0.85; });
      shadow.scale.set(0.8 * (1 - jy * 0.9), 0.1 * (1 - jy * 0.5), 1); shadowM.opacity = baseShadow * (1 - jy * 1.2);
      const lean = rm ? 0 : st.hover ? -st.lx * 0.12 : Math.sin(t * 1.1) * 0.025;
      body.rotation.z += (lean - body.rotation.z) * 0.1;
      const waving = t < st.waveUntil;
      hands[0].material.rotation = rm ? 0 : Math.sin(t * 2) * 0.12;
      hands[1].material.rotation = rm ? 0 : waving ? Math.sin(t * 18) * 0.5 : -Math.sin(t * 2) * 0.12;
      hands[1].position.y = 0.62 + (waving ? 0.12 : 0);
      const pulse = st.news ? 0.5 + 0.5 * Math.sin(t * 6) : 0.25 + 0.1 * Math.sin(t * 2);
      glow.scale.setScalar(1 + pulse * 0.6); glowM.opacity = 0.12 + pulse * 0.3;
      antenna.rotation.z = rm ? 0 : Math.sin(t * 1.6) * 0.06 - body.rotation.z * 0.5;
      for (const p of pool) {
        if (p.life <= 0) continue;
        p.life -= dt / 1.15; p.vy -= 4.2 * dt; p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.m.rotation += p.rot * dt;
        p.m.opacity = Math.max(0, Math.min(1, p.life * 1.6)); if (p.life <= 0) p.s.visible = false;
      }
      renderer.render(scene, cam);
    }
    function resize() { renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(canvas.clientWidth || 120, canvas.clientHeight || 120, false); }
    function setTheme(tk) { themed.forEach(([m, key]) => { if (tk[key]) m.color.set(tk[key]); }); baseShadow = tk.dark ? 0.5 : 0.16; }
    resize();
    return {
      update, resize, setTheme, react,
      talk(d = 1.1) { st.talkUntil = st.t + d; },
      notify() { st.news = true; st.jumpT0 = st.t; st.jumpH = 0.16; },
      seen() { st.news = false; },
    };
  }

  /* ================= Tema ================= */
  const themeBtn = $('#themeToggle');
  const isDark = () => { const a = root.getAttribute('data-theme'); return a ? a === 'dark' : mqDark.matches; };
  let stage = null; let hashi = null;
  function syncThemeButton() {
    const d = isDark();
    themeBtn.dataset.mode = d ? 'dark' : 'light';
    themeBtn.setAttribute('aria-label', d ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    $('.tt-label', themeBtn).textContent = d ? 'Claro' : 'Oscuro';
  }
  function applySceneTheme(instant) { const tk = readTokens(); if (stage) stage.setTheme(tk, instant); if (hashi) hashi.setTheme(tk); }
  function toggleTheme() {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('encriptador-theme', next); } catch (e) { /* almacenamiento no disponible */ }
    syncThemeButton(); applySceneTheme(false);
  }
  themeBtn.addEventListener('click', toggleTheme);
  const onSystemTheme = () => { syncThemeButton(); applySceneTheme(false); };
  if (mqDark.addEventListener) mqDark.addEventListener('change', onSystemTheme); else if (mqDark.addListener) mqDark.addListener(onSystemTheme);
  new MutationObserver(onSystemTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  syncThemeButton();

  /* ================= Hashi: burbuja de pistas ================= */
  const bubble = $('#bubble'); const bubbleText = $('#bubbleText'); const bubbleCount = $('#bubbleCount'); const bubbleNext = $('#bubbleNext'); const badge = $('#hashiBadge');
  let hintIdx = -1; let bubbleTimer = 0;
  const slides = $$('.slide');
  let index = 0;
  const currentHints = () => HINTS[slides[index].id] || [];
  function openBubble(html, label, isHint) {
    clearTimeout(bubbleTimer);
    bubbleText.innerHTML = html; bubbleCount.textContent = label;
    bubbleNext.hidden = !isHint || currentHints().length < 2;
    bubble.hidden = false; bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    if (hashi) hashi.talk();
  }
  function closeBubble() { clearTimeout(bubbleTimer); bubble.hidden = true; }
  function showNextHint(burst = true) {
    const list = currentHints(); if (!list.length) return;
    hintIdx = (hintIdx + 1) % list.length;
    openBubble(list[hintIdx], `Pista ${hintIdx + 1} de ${list.length}`, true);
    badge.hidden = true;
    if (hashi) { hashi.seen(); hashi.react('happy', 1.3, burst); }
  }
  function say(html, expr, autoHide) {
    openBubble(html, 'Hashi dice', false);
    if (hashi && expr) hashi.react(expr, 1.6, expr === 'happy');
    if (autoHide) bubbleTimer = setTimeout(closeBubble, autoHide);
  }
  $('#hashiBtn').addEventListener('click', () => showNextHint(true));
  bubbleNext.addEventListener('click', () => showNextHint(true));
  $('#bubbleClose').addEventListener('click', closeBubble);

  /* ================= Efectos de texto ================= */
  $$('.display, .title').forEach((h) => {
    const text = h.textContent.trim(); h.setAttribute('aria-label', text);
    h.innerHTML = text.split(/\s+/).map((w, i) => `<span class="w" aria-hidden="true"><span style="--wi:${i}">${esc(w)}</span></span>`).join(' ');
  });
  slides.forEach((s) => $$('[data-anim]', s).forEach((el, k) => el.style.setProperty('--d', String(140 + k * 75))));
  const GL = '0123456789abcdef#{}[]<>=/';
  function scramble(el) {
    if (!el.dataset.final) el.dataset.final = el.textContent;
    const final = el.dataset.final;
    cancelAnimationFrame(el._raf);
    if (reduce()) { el.textContent = final; return; }
    const t0 = performance.now(); const dur = 420 + final.length * 16;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur); const rev = Math.floor(p * final.length); let s = '';
      for (let i = 0; i < final.length; i++) { const ch = final[i]; s += i < rev || ch === ' ' || ch === '·' ? ch : GL[(Math.random() * GL.length) | 0]; }
      el.textContent = s; if (p < 1) el._raf = requestAnimationFrame(tick);
    };
    el._raf = requestAnimationFrame(tick);
  }

  /* ================= Demos ================= */
  // Paso 4: "type" commonjs / module
  const esm = (() => {
    const radios = $$('#esmSeg [role="radio"]'); const term = $('#esmTerm'); const status = $('#esmStatus'); const pkg = $('#esmPkg');
    let type = 'commonjs'; let token = null;
    const pkgText = () => `  "license": "MIT",\n  "author": "@mauriciorivero",\n  "type": "${type}",\n  "main": "src/index.js",\n  "scripts": {`;
    function play(instant) {
      if (token) token.cancel();
      status.hidden = true;
      token = playTerminal(term, esmScript(type), {
        delay: 380, instant,
        onDone: () => {
          const ok = type === 'module'; status.hidden = false; status.classList.toggle('is-err', !ok);
          $('span', status).textContent = ok ? 'Código de salida 0 · sin errores; el programa todavía no imprime nada' : 'Código de salida 1 · SyntaxError';
          if (hashi && slides[index].id === 'paso-4') hashi.react(ok ? 'happy' : 'sad', 1.4, ok);
        },
      });
    }
    function set(t) {
      type = t;
      radios.forEach((b) => { const on = b.dataset.type === t; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
      renderCode(pkg, pkgText());
      play(false);
      if (stage) stage.kick(3);
    }
    radios.forEach((b) => b.addEventListener('click', () => { if (b.dataset.type !== type) set(b.dataset.type); }));
    renderCode(pkg, pkgText());
    return { play, cancel: () => token && token.cancel(), radios, set };
  })();

  // Paso 5: encryptPassword en vivo
  (() => {
    const input = $('#epInput'); const out = $('#epOut'); const fp = $('#epFp'); const len = $('#epLen'); const changed = $('#epChanged');
    fp.innerHTML = '<i></i>'.repeat(40);
    const bars = Array.from(fp.children); let prev = '';
    const fit = () => { input.style.width = Math.max(3, input.value.length + 1) + 'ch'; };
    function render(fromUser) {
      const H = OH();
      if (!H) { out.textContent = 'object-hash no cargó: revisa tu conexión'; return; }
      const h = H(input.value); out.textContent = `'${h}'`; len.textContent = String(h.length);
      let n = 0;
      bars.forEach((b, i) => { b.style.setProperty('--v', String(parseInt(h[i], 16) || 0)); const c = !!prev && prev[i] !== h[i]; if (c) n++; b.classList.toggle('chg', c); });
      changed.textContent = prev && fromUser ? `${n} de 40 caracteres cambiaron` : '';
      prev = h;
      if (fromUser && stage) stage.kick(1.6);
    }
    input.addEventListener('input', () => { fit(); render(true); });
    fit(); render(false);
  })();

  // Paso 6: verifyPassword en vivo
  const verify = (() => {
    const input = $('#vpInput'); const out = $('#vpOut'); const badgeEl = $('#vpBadge'); const a = $('#vpA'); const b = $('#vpB'); const stored = $('#vpStored');
    const slide = $('#paso-6'); let timer = 0; let last = null;
    const fit = () => { input.style.width = Math.max(3, input.value.length + 1) + 'ch'; };
    function render(fromUser) {
      const H = OH();
      if (!H) { out.textContent = 'object-hash no cargó'; return; }
      const saved = H('Clave123'); const h = H(input.value); const ok = h === saved;
      stored.textContent = `'${saved}'`;
      out.textContent = String(ok);
      badgeEl.textContent = ok ? 'coincide' : 'no coincide'; badgeEl.className = 'verdict-badge ' + (ok ? 'is-ok' : 'is-bad');
      a.textContent = saved;
      b.innerHTML = Array.from(h).map((ch, i) => `<span class="${ch === saved[i] ? 's' : 'd'}">${ch}</span>`).join('');
      slide.dataset.emblem = ok ? 'check' : 'cross';
      if (stage && slides[index] === slide) stage.setShape(slide.dataset.emblem);
      if (fromUser && ok !== last) {
        clearTimeout(timer);
        timer = setTimeout(() => { if (hashi && slides[index] === slide) hashi.react(ok ? 'happy' : 'sad', 1.3, ok); }, 350);
      }
      last = ok;
    }
    input.addEventListener('input', () => { fit(); render(true); });
    fit(); render(false);
    return { render };
  })();

  // Paso 8: process.argv en vivo
  (() => {
    const input = $('#argvInput'); const cells = $('#argvCells'); const btn = $('#sliceBtn'); const out = $('#personaOut'); const name = $('#argvName');
    const FIELD = ['name', 'genre', 'nationality', 'age']; let sliced = false;
    const val = (v) => (v === undefined ? '<span class="u">undefined</span>' : Array.isArray(v) ? (v.length ? '[ ' + v.map(val).join(', ') + ' ]' : '[]') : `<span class="s">'${esc(v)}'</span>`);
    function render(animate) {
      cells.classList.remove('anim'); if (animate) { void cells.offsetWidth; cells.classList.add('anim'); }
      const args = shellSplit(input.value);
      const argv = ['/usr/local/bin/node', '/…/encriptador/src/index.js', ...args];
      cells.innerHTML = argv.map((v, i) => {
        const ai = i - 2; const path = i < 2; const f = path ? 'path' : ai < 4 ? FIELD[ai] : 'friends';
        const label = sliced && !path ? `args[${ai}]` : `argv[${i}]`;
        return `<li class="cell${sliced && path ? ' cut' : ''}" data-f="${f}" style="--i:${i}"><span class="ci">${label}</span><span class="cv">'${esc(v)}'</span></li>`;
      }).join('');
      name.textContent = sliced ? 'args = process.argv.slice(2)' : 'process.argv';
      const p = personaFrom(args); const keys = ['name', 'genre', 'nationality', 'age', 'friends'];
      out.innerHTML = '<span class="dim">persona</span> = {\n' + keys.map((k, i) => `  <span class="k" data-f="${k}">${k}</span>: ${val(p[k])}${i < keys.length - 1 ? ',' : ''}`).join('\n') + '\n}';
    }
    btn.addEventListener('click', () => {
      sliced = !sliced; btn.setAttribute('aria-pressed', String(sliced)); btn.textContent = sliced ? 'Quitar .slice(2)' : 'Aplicar .slice(2)';
      render(true); if (stage) stage.kick(2.5); if (hashi && sliced) hashi.react('happy', 1, false);
    });
    input.addEventListener('input', () => { render(); if (stage) stage.kick(0.8); });
    render();
  })();

  // Paso 8, continuación: línea de código ↔ línea impresa
  (() => {
    const slide = $('#paso-8-hash'); let curKey = null;
    const set = (key, on) => $$(`[data-link="${key}"]`, slide).forEach((n) => n.classList.toggle('is-linked', on));
    const pick = (e) => { const n = e.target.closest && e.target.closest('[data-link]'); const k = n ? n.dataset.link : null; if (k === curKey) return; if (curKey) set(curKey, false); curKey = k; if (k) set(k, true); };
    slide.addEventListener('pointerover', pick); slide.addEventListener('focusin', pick);
    slide.addEventListener('pointerleave', () => { if (curKey) set(curKey, false); curKey = null; });
  })();

  // Terminal simulada
  const live = (() => {
    const log = $('#liveLog'); const input = $('#liveInput'); const box = $('#liveTerm');
    const hist = []; let hIdx = 0; let busy = false; let visited = false;
    const PKG = ['{', '  "name": "encriptador",', '  "version": "1.0.0",', '  "description": "una aplicacion node para encriptar objetos y datos",', '  "keywords": [', '    "encrypt",', '    "data",', '    "objects",', '    "security"', '  ],', '  "license": "MIT",', '  "author": "@mauriciorivero",', '  "type": "module",', '  "main": "src/index.js",', '  "scripts": {', '    "test": "echo \\"Error: no test specified\\" && exit 1",', '    "start": "node src/index.js"', '  },', '  "dependencies": {', '    "object-hash": "^3.0.0"', '  }', '}'];
    function runIndex(args, banner) {
      const lines = [];
      if (banner) lines.push({ t: 'npm notice run encriptador@1.0.0 start', c: 'dim' }, { t: 'npm notice run node src/index.js' + (args.length ? ' ' + args.join(' ') : ''), c: 'dim' });
      const persona = personaFrom(args);
      lines.push('Persona: ' + JSON.stringify(persona));
      const H = OH();
      if (!H) { lines.push({ t: 'No se pudo cargar object-hash desde la red. Revisa tu conexión y recarga la página.', c: 'note' }); return { lines }; }
      const e1 = H(persona);
      if (persona.name === undefined) { lines.push(...CRASH); return { lines, error: true }; }
      const e2 = H(persona.name); const e3 = H(persona, { algorithm: 'md5', encoding: 'base64' });
      lines.push('Persona encriptada: ' + e1, 'Nombre encriptado: ' + e2, 'Persona encriptada con MD5 y codificada en base64: ' + e3);
      return { lines, ok: true, commas: args.some((a) => /,$/.test(a)) };
    }
    function runCommand(cmd) {
      if (!cmd) return { lines: [] };
      const argv = shellSplit(cmd); const [c0, c1, c2] = argv;
      if (cmd === 'clear') return { clear: true };
      if (c0 === 'node' && (c1 === '-v' || c1 === '--version') && argv.length === 2) return { lines: [NODE_V] };
      if (c0 === 'npm' && (c1 === '-v' || c1 === '--version') && argv.length === 2) return { lines: [NPM_V] };
      if (c0 === 'ls' && argv.length === 1) return { lines: ['node_modules       package-lock.json  package.json       src'] };
      if (c0 === 'ls' && c1 === 'src' && argv.length === 2) return { lines: ['index.js'] };
      if (c0 === 'cat' && c1 === 'package.json' && argv.length === 2) return { lines: PKG };
      if (c0 === 'npm' && (c1 === 'start' || (c1 === 'run' && c2 === 'start'))) {
        let args = argv.slice(c1 === 'start' ? 2 : 3); if (args[0] === '--') args = args.slice(1);
        return runIndex(args, true);
      }
      if (c0 === 'node' && (c1 === 'src/index.js' || c1 === './src/index.js')) return runIndex(argv.slice(2), false);
      return { lines: [{ t: 'Esta terminal simulada entiende: npm start, npm run start, node src/index.js, node -v, npm -v, ls, cat package.json y clear.', c: 'note' }], unknown: true };
    }
    function exec(raw) {
      const cmd = raw.trim(); input.value = '';
      log.appendChild(termLine('', promptHtml() + `<span class="cmd">${esc(raw)}</span>`));
      if (cmd) { hist.push(cmd); hIdx = hist.length; }
      const res = runCommand(cmd);
      if (res.clear) log.innerHTML = '';
      (res.lines || []).forEach((o) => log.appendChild(outLine(o)));
      box.scrollTop = box.scrollHeight;
      if (res.error) say('Ese error viene de la línea 17: <code>hash(persona.name)</code> recibió <code>undefined</code> porque el comando no trae datos. Agrega al menos un nombre después de <code>--</code>.', 'sad');
      else if (res.commas) say('Mira el JSON: las comas quedaron dentro de los valores, como <code>"mauricio,"</code>. Separa los datos solo con espacios.', 'surprised');
      else if (res.ok) { if (hashi) hashi.react('happy', 1, true); if (stage) stage.kick(4); }
      else if (res.unknown && hashi) hashi.react('surprised', 1);
    }
    async function typeAndRun(cmd) {
      if (busy) return; busy = true; input.value = '';
      if (reduce()) input.value = cmd;
      else for (const ch of cmd) { input.value += ch; await sleep(14 + Math.random() * 24); }
      await sleep(160); busy = false; exec(cmd);
    }
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); if (!busy) exec(input.value); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx > 0) { hIdx--; input.value = hist[hIdx]; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (hIdx < hist.length - 1) { hIdx++; input.value = hist[hIdx]; } else { hIdx = hist.length; input.value = ''; } }
    });
    box.addEventListener('click', () => { if (!getSelection().toString()) input.focus({ preventScroll: true }); });
    $$('[data-cmd]').forEach((b) => b.addEventListener('click', () => { typeAndRun(b.dataset.cmd); input.focus({ preventScroll: true }); }));
    return { enter() { if (!visited) { visited = true; setTimeout(() => typeAndRun('npm start -- mauricio hombre colombia 30 ana luis'), reduce() ? 0 : 700); } } };
  })();

  /* ================= Navegación ================= */
  const deck = $('#deck'); const rail = $('#rail'); const counter = $('#counter'); const progress = $('#progress'); const announcer = $('#announcer');
  const prevBtn = $('#prevBtn'); const nextBtn = $('#nextBtn');
  const railBtns = slides.map((s, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.label = s.dataset.label;
    b.setAttribute('aria-label', 'Ir a ' + s.dataset.label);
    if (s.id === 'paso-1' || s.id === 'terminal') b.classList.add('gap-before');
    b.addEventListener('click', () => go(i)); rail.appendChild(b); return b;
  });
  const tokens = new Map();
  function onEnter(slide) {
    $$('.scr', slide).forEach(scramble);
    const list = [];
    $$('[data-term]', slide).forEach((box) => {
      const name = box.dataset.term;
      list.push(playTerminal(box, TERMS[name], { onDone: name === 'init' ? () => { const t = $('#t2b'); if (t && t.getAttribute('aria-selected') !== 'true') t.classList.add('has-news'); } : null }));
    });
    tokens.set(slide, list);
    if (slide.id === 'paso-4') esm.play(false);
    if (slide.id === 'terminal') live.enter();
  }
  function onLeave(slide) {
    (tokens.get(slide) || []).forEach((t) => t.cancel()); tokens.set(slide, []);
    if (slide.id === 'paso-4') esm.cancel();
  }
  function updateChrome() {
    railBtns.forEach((b, i) => { if (i === index) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); b.classList.toggle('is-done', i < index); });
    $('b', counter).textContent = String(index + 1).padStart(2, '0');
    counter.lastChild.textContent = ' / ' + slides.length;
    progress.style.setProperty('--p', String((index + 1) / slides.length));
    prevBtn.disabled = index === 0; nextBtn.disabled = index === slides.length - 1;
  }
  function go(target, opts = {}) {
    const i = Math.max(0, Math.min(slides.length - 1, target));
    if (i === index && !opts.force) return;
    const from = slides[index]; const to = slides[i];
    deck.dataset.dir = i >= index ? 'next' : 'prev';
    if (from !== to) {
      onLeave(from);
      from.classList.remove('is-entering'); from.classList.add('is-leaving');
      setTimeout(() => { from.classList.remove('is-leaving'); if (from !== slides[index]) from.hidden = true; }, reduce() ? 0 : 300);
    }
    to.hidden = false; to.classList.remove('is-leaving', 'is-entering'); void to.offsetWidth; to.classList.add('is-entering'); to.scrollTop = 0;
    index = i;
    updateChrome();
    onEnter(to);
    if (stage) stage.goto(to, i);
    closeBubble(); hintIdx = -1;
    if (!opts.initial) { badge.hidden = false; badge.style.animation = 'none'; void badge.offsetWidth; badge.style.animation = ''; if (hashi) hashi.notify(); }
    announcer.textContent = `Diapositiva ${i + 1} de ${slides.length}: ${to.dataset.label}`;
    try { history.replaceState(null, '', '#' + to.id); } catch (e) { /* sin historial en este marco */ }
  }
  prevBtn.addEventListener('click', () => go(index - 1));
  nextBtn.addEventListener('click', () => go(index + 1));
  $$('[data-goto]').forEach((b) => b.addEventListener('click', () => {
    const g = b.dataset.goto; if (g === 'next') go(index + 1); else { const k = slides.findIndex((s) => s.id === g); if (k >= 0) go(k); }
  }));

  function moveWithin(el, sel, dir, select) {
    const group = $$(sel, el.parentElement); const k = (group.indexOf(el) + dir + group.length) % group.length;
    group[k].focus(); select(group[k]);
  }
  const fsBtn = $('#fsBtn');
  if (!document.fullscreenEnabled) fsBtn.hidden = true;
  function toggleFullscreen() {
    try { if (document.fullscreenElement) document.exitFullscreen(); else { const p = root.requestFullscreen && root.requestFullscreen(); if (p && p.catch) p.catch(() => {}); } } catch (e) { /* no disponible */ }
  }
  fsBtn.addEventListener('click', toggleFullscreen);

  document.addEventListener('keydown', (e) => {
    const t = e.target; const tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') { if (e.key === 'Escape') t.blur(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const role = t && t.getAttribute ? t.getAttribute('role') : null;
    if ((role === 'tab' || role === 'radio') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      moveWithin(t, `[role="${role}"]`, e.key === 'ArrowRight' ? 1 : -1, role === 'tab' ? selectTab : (b) => b.click());
      return;
    }
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': e.preventDefault(); go(index + 1); break;
      case 'ArrowLeft': case 'PageUp': e.preventDefault(); go(index - 1); break;
      case ' ': if (tag === 'BUTTON') return; e.preventDefault(); go(e.shiftKey ? index - 1 : index + 1); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(slides.length - 1); break;
      case 'h': case 'H': showNextHint(true); break;
      case 't': case 'T': toggleTheme(); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'Escape': closeBubble(); break;
      default: break;
    }
  });

  // Deslizar en pantallas táctiles
  let sw = null;
  deck.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || e.target.closest('input, .editor, .chips, button')) { sw = null; return; }
    sw = { x: e.clientX, y: e.clientY, t: performance.now() };
  }, { passive: true });
  deck.addEventListener('pointerup', (e) => {
    if (!sw) return; const dx = e.clientX - sw.x; const dy = e.clientY - sw.y; const quick = performance.now() - sw.t < 700; sw = null;
    if (quick && Math.abs(dx) > 60 && Math.abs(dy) < 50) go(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ================= Arranque ================= */
  stage = createStage($('#stage'));
  hashi = createHashi($('#hashiCanvas'), $('#hashiBtn'));
  if (!hashi) { $('#hashiCanvas').hidden = true; $('#hashiFallback').hidden = false; }
  applySceneTheme(true);
  addEventListener('resize', () => { if (stage) stage.resize(); if (hashi) hashi.resize(); });

  const fromHash = slides.findIndex((s) => s.id === location.hash.slice(1));
  slides.forEach((s, i) => { if (i !== 0) s.hidden = true; });
  index = 0;
  go(fromHash > 0 ? fromHash : 0, { force: true, initial: true });

  if (stage || hashi) {
    let last = performance.now();
    const loop = (now) => {
      // the first rAF timestamp can be earlier than performance.now(): never step backwards
      const raw = (now - last) / 1000; if (raw > 0) last = now;
      const dt = Math.min(0.05, Math.max(0, raw)); const t = last / 1000;
      if (stage) stage.update(dt, t);
      if (hashi) hashi.update(dt, t);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  setTimeout(() => {
    if (!bubble.hidden) return;
    hintIdx = 0; const list = currentHints();
    openBubble(list[0], `Pista 1 de ${list.length}`, true); badge.hidden = true;
    if (hashi) hashi.react('happy', 1.4, true);
    bubbleTimer = setTimeout(closeBubble, 9000);
  }, reduce() ? 300 : 1400);
})();
