// ==========================================================
// js/labs.js
// Visuales interactivos propios de esta clase:
//   failsim  -> monolito frente a microservicios cuando algo falla
//   sequence -> quien habla con quien, mensaje por mensaje
//   shalab   -> SHA-256 y sal, calculados de verdad (js/sha256.js)
//   jwtlab   -> firmar, alterar y verificar un JWT
// app.js llama a window.Labs[tipo](spec, ayudas) y agrega el nodo
// que devuelve a la columna derecha de la diapositiva.
// ==========================================================

(function () {
  'use strict';

  const Hash = window.Hash;
  const Scene = () => window.Scene || {};

  // Boton de opcion dentro de un grupo (solo uno queda presionado)
  function toggleGroup(el, label, options, onPick, initial = 0) {
    const group = el('div', { class: 'lab-toggle', role: 'group', 'aria-label': label });
    const buttons = options.map((option, i) => {
      const button = el('button', { class: 'lab-chip', type: 'button', 'aria-pressed': i === initial ? 'true' : 'false', text: option.label });
      button.addEventListener('click', () => {
        buttons.forEach((b, j) => b.setAttribute('aria-pressed', j === i ? 'true' : 'false'));
        onPick(option, i);
      });
      group.append(button);
      return button;
    });
    group.press = (i) => buttons[i].click();
    return group;
  }

  function labShell(el, kicker, title) {
    const body = el('div', { class: 'lab-body' });
    const node = el('figure', { class: 'lab reveal' },
      el('figcaption', { class: 'lab-head' }, el('span', { class: 'panel-kicker', text: kicker }), el('span', { text: title })),
      body);
    return { node, body };
  }

  // ---------------------------------------------------------- monolito vs microservicios
  function failsim(spec, { el }) {
    const { node, body } = labShell(el, 'simulador', 'Provoca una falla y mira qué sigue funcionando');
    const state = { mode: 'mono', down: { auth: false, gestion: false } };

    const board = el('div', { class: 'sim-board' });
    const results = el('ul', { class: 'sim-results' });
    const note = el('p', { class: 'lab-note', 'aria-live': 'polite' });

    const breakAuth = el('button', { class: 'lab-chip lab-chip--danger', type: 'button', 'aria-pressed': 'false', text: 'Tumbar autenticación' });
    const breakData = el('button', { class: 'lab-chip lab-chip--danger', type: 'button', 'aria-pressed': 'false', text: 'Tumbar gestión' });

    const moduleBox = (name, port, down) => el('div', { class: `sim-module${down ? ' is-down' : ''}` },
      el('span', { class: 'sim-module-name', text: name }),
      el('span', { class: 'sim-module-port', text: down ? 'caído' : port }));

    const dbBox = (name) => el('div', { class: 'sim-db' }, el('span', { text: name }));

    function paint() {
      const { mode, down } = state;
      // En el monolito un solo proceso: si un modulo tumba el proceso, caen los dos
      const monoDown = down.auth || down.gestion;
      const authDown = mode === 'mono' ? monoDown : down.auth;
      const dataDown = mode === 'mono' ? monoDown : down.gestion;

      board.textContent = '';
      board.className = `sim-board sim-board--${mode}`;
      if (mode === 'mono') {
        board.append(
          el('div', { class: `sim-process${monoDown ? ' is-down' : ''}` },
            el('span', { class: 'sim-process-label', text: 'Un solo proceso · :3000' }),
            moduleBox('Autenticación', 'módulo', authDown),
            moduleBox('Gestión personal', 'módulo', dataDown)),
          dbBox('Una base de datos'));
      } else {
        board.append(
          el('div', { class: 'sim-column' },
            el('div', { class: `sim-process${authDown ? ' is-down' : ''}` },
              el('span', { class: 'sim-process-label', text: 'Proceso 1 · :3001' }),
              moduleBox('Autenticación', 'servicio', authDown)),
            dbBox('authentication')),
          el('div', { class: 'sim-column' },
            el('div', { class: `sim-process${dataDown ? ' is-down' : ''}` },
              el('span', { class: 'sim-process-label', text: 'Proceso 2 · :3000' }),
              moduleBox('Gestión personal', 'servicio', dataDown)),
            dbBox('personal_management')));
      }

      results.textContent = '';
      [
        ['Iniciar sesión', !authDown],
        ['Consultar datos con una sesión ya abierta', !dataDown],
        ['Entrar desde cero y consultar', !authDown && !dataDown],
      ].forEach(([label, ok]) => results.append(el('li', { class: ok ? 'is-ok' : 'is-fail' },
        el('span', { class: 'sim-mark', 'aria-hidden': 'true', text: ok ? '✓' : '✕' }),
        el('span', { text: label }),
        el('span', { class: 'sr-only', text: ok ? ': funciona' : ': no funciona' }))));

      if (!down.auth && !down.gestion) note.textContent = 'Todo está en pie. Tumba una parte.';
      else if (mode === 'mono') note.textContent = 'Es un solo proceso: la falla de un módulo que lo tumba deja sin servicio a todos.';
      else if (down.auth && down.gestion) note.textContent = 'Sin los dos servicios no hay nada que atender.';
      else if (down.auth) note.textContent = 'Quien ya tiene un token sigue trabajando: gestión lo verifica sola, sin llamar a autenticación.';
      else note.textContent = 'Se puede iniciar sesión, pero no consultar datos. La falla quedó contenida en su servicio.';

      breakAuth.setAttribute('aria-pressed', down.auth ? 'true' : 'false');
      breakData.setAttribute('aria-pressed', down.gestion ? 'true' : 'false');
    }

    const modes = toggleGroup(el, 'Estilo de arquitectura', [{ id: 'mono', label: 'Monolito' }, { id: 'micro', label: 'Microservicios' }], (o) => {
      state.mode = o.id;
      paint();
    });
    breakAuth.addEventListener('click', () => { state.down.auth = !state.down.auth; paint(); });
    breakData.addEventListener('click', () => { state.down.gestion = !state.down.gestion; paint(); });

    body.append(
      el('div', { class: 'lab-row' }, modes, el('div', { class: 'lab-toggle' }, breakAuth, breakData)),
      board, results, note);
    paint();
    return { node };
  }

  // ---------------------------------------------------------- diagrama de secuencia
  function sequence(spec, { el }) {
    const lanes = spec.lanes;
    const { node, body } = labShell(el, 'secuencia', spec.title);
    node.classList.add('lab--sequence');

    const head = el('div', { class: 'seq-lanes' }, lanes.map((l) => el('div', { class: `seq-lane seq-lane--${l.id}` },
      el('span', { class: 'seq-lane-name', text: l.label }),
      el('span', { class: 'seq-lane-sub', text: l.sub }))));
    const list = el('ol', { class: 'seq-steps' });
    const scroll = el('div', { class: 'seq-scroll', tabindex: '0', role: 'region', 'aria-label': 'Mensajes de la secuencia' }, head, list);
    const detail = el('p', { class: 'lab-note seq-detail', 'aria-live': 'polite' });
    const count = el('span', { class: 'seq-count' });
    const nextBtn = el('button', { class: 'btn btn--primary', type: 'button', text: 'Siguiente mensaje' });
    const allBtn = el('button', { class: 'btn', type: 'button', text: 'Ver todo' });
    const resetBtn = el('button', { class: 'btn', type: 'button', text: 'Reiniciar' });

    let scenario = spec.scenarios[0];
    let shown = 1;
    const index = (id) => lanes.findIndex((l) => l.id === id);

    function row(step, i) {
      const a = index(step.from);
      const b = index(step.to);
      const self = a === b;
      const lo = Math.min(a, b);
      const span = Math.abs(a - b) + 1;
      const item = el('li', { class: `seq-step seq-step--${step.kind || 'req'}` });
      const message = el('div', {
        class: `seq-msg${self ? ' seq-msg--self' : b < a ? ' seq-msg--left' : ' seq-msg--right'}`,
        style: `grid-column:${lo + 1} / span ${span};--span:${span}`,
      }, el('span', { class: 'seq-text', text: `${i + 1}. ${step.text}` }), self ? null : el('span', { class: 'seq-arrow', 'aria-hidden': 'true' }));
      item.append(message);
      return item;
    }

    function paint() {
      list.textContent = '';
      scenario.steps.slice(0, shown).forEach((s, i) => list.append(row(s, i)));
      if (list.lastChild) list.lastChild.classList.add('is-current');
      const step = scenario.steps[shown - 1];
      detail.textContent = step.detail;
      count.textContent = `${shown} de ${scenario.steps.length}`;
      nextBtn.disabled = allBtn.disabled = shown >= scenario.steps.length;
      resetBtn.disabled = shown <= 1;
      scroll.scrollTop = scroll.scrollHeight;
    }

    // El paquete del diagrama superior hace el mismo salto que el mensaje
    function travel(step) {
      if (step.from === step.to || !Scene().send) return;
      Scene().send({ route: [[step.from, step.to, step.kind || 'req']] });
    }

    nextBtn.addEventListener('click', () => {
      if (shown >= scenario.steps.length) return;
      shown += 1;
      paint();
      travel(scenario.steps[shown - 1]);
    });
    allBtn.addEventListener('click', () => { shown = scenario.steps.length; paint(); scroll.scrollTop = 0; });
    resetBtn.addEventListener('click', () => { shown = 1; paint(); });

    const tabs = spec.scenarios.length > 1
      ? toggleGroup(el, 'Escenario', spec.scenarios, (o) => { scenario = o; shown = 1; paint(); })
      : null;

    if (tabs) body.append(tabs);
    body.append(scroll, detail, el('div', { class: 'lab-row' }, el('div', { class: 'lab-actions' }, nextBtn, allBtn, resetBtn), count));
    paint();
    return { node, reset: () => { shown = 1; paint(); } };
  }

  // ---------------------------------------------------------- SHA-256 y sal
  function field(el, labelText, value, extra = {}) {
    const input = el('input', { class: 'lab-input', type: 'text', value, spellcheck: 'false', autocomplete: 'off', maxlength: '60', ...extra });
    return { node: el('label', { class: 'lab-field' }, el('span', { class: 'lab-label', text: labelText }), input), input };
  }

  const hashLine = (el, label) => {
    const value = el('code', { class: 'lab-hash' });
    return { node: el('div', { class: 'lab-output' }, el('span', { class: 'lab-label', text: label }), value), value };
  };

  // Pinta en otro color los caracteres que cambiaron respecto a la referencia
  function paintDiff(el, target, text, reference) {
    target.textContent = '';
    for (let i = 0; i < text.length; i++) {
      target.append(text[i] === reference[i] ? document.createTextNode(text[i]) : el('mark', { text: text[i] }));
    }
  }

  // Cambia solo el ultimo caracter, para mostrar el efecto avalancha
  function nudge(text) {
    if (!text) return 'a';
    const last = text.slice(-1);
    const upper = last.toUpperCase();
    const swapped = upper !== last ? upper : last.toLowerCase() !== last ? last.toLowerCase() : last === '*' ? '+' : '*';
    return text.slice(0, -1) + swapped;
  }

  function hashLab(el) {
    const { node, body } = labShell(el, 'laboratorio', 'Escribe y mira el hash cambiar (SHA-256 real)');
    const text = field(el, 'Texto de entrada', 'Admin123*');
    const first = hashLine(el, 'SHA-256 de tu texto');
    const nudged = el('code', { class: 'lab-inline' });
    const second = hashLine(el, 'SHA-256 cambiando solo el último carácter');
    second.node.insertBefore(nudged, second.value);
    const note = el('p', { class: 'lab-note', 'aria-live': 'polite' });

    function paint() {
      const value = text.input.value;
      const other = nudge(value);
      const a = Hash.sha256Hex(value);
      const b = Hash.sha256Hex(other);
      first.value.textContent = a;
      nudged.textContent = `"${other}"`;
      paintDiff(el, second.value, b, a);
      const changed = Array.from(b).filter((c, i) => c !== a[i]).length;
      note.textContent = `Siempre salen 64 caracteres hexadecimales (256 bits). Con un solo cambio en la entrada, ${changed} de 64 caracteres son distintos.`;
    }
    text.input.addEventListener('input', paint);
    body.append(text.node, first.node, second.node, note);
    paint();
    return { node };
  }

  function saltLab(el) {
    const { node, body } = labShell(el, 'laboratorio', 'Dos cuentas con la misma contraseña');
    const password = field(el, 'Contraseña que eligen ana y luis', 'Clave2026*');
    const ana = hashLine(el, 'ana · columna password');
    const luis = hashLine(el, 'luis · columna password');
    const note = el('p', { class: 'lab-note' });
    const attempt = field(el, 'Intento de ingreso de ana', 'Clave2026*');
    const verdict = el('p', { class: 'lab-verdict', 'aria-live': 'polite' });
    let salted = true;
    let salts = [Hash.randomHex(16), Hash.randomHex(16)];

    const stored = (i) => (salted ? `${salts[i]}:${Hash.sha256Hex(salts[i] + password.input.value)}` : Hash.sha256Hex(password.input.value));

    function paint() {
      const a = stored(0);
      ana.value.textContent = a;
      luis.value.textContent = stored(1);
      note.textContent = salted
        ? 'Con sal: misma contraseña, valores distintos. 32 caracteres de sal + ":" + 64 de hash = 97, el tamaño de VARCHAR(97).'
        : 'Sin sal: los dos valores son idénticos. Quien robe la tabla sabe que comparten contraseña.';
      // Mismo calculo de verificarPassword: repetir el hash y comparar
      const [salt, hash] = salted ? a.split(':') : ['', a];
      const calculated = Hash.sha256Hex(salt + attempt.input.value);
      const ok = calculated === hash;
      verdict.className = `lab-verdict ${ok ? 'is-ok' : 'is-fail'}`;
      verdict.textContent = ok
        ? `✓ SHA-256(${salted ? 'sal + intento' : 'intento'}) coincide con lo guardado`
        : `✕ SHA-256(${salted ? 'sal + intento' : 'intento'}) da ${calculated.slice(0, 16)}… y no coincide`;
    }

    const modes = toggleGroup(el, 'Uso de la sal', [{ id: true, label: 'Con sal' }, { id: false, label: 'Sin sal' }], (o) => { salted = o.id; paint(); });
    const again = el('button', { class: 'lab-chip', type: 'button', text: 'Generar sales nuevas' });
    again.addEventListener('click', () => { salts = [Hash.randomHex(16), Hash.randomHex(16)]; paint(); });
    password.input.addEventListener('input', paint);
    attempt.input.addEventListener('input', paint);

    body.append(el('div', { class: 'lab-row' }, modes, again), password.node, ana.node, luis.node, note, attempt.node, verdict);
    paint();
    return { node };
  }

  const shalab = (spec, { el }) => (spec.mode === 'salt' ? saltLab(el) : hashLab(el));

  // ---------------------------------------------------------- JWT
  const SECRET = 'secreto-de-practica-no-usar';

  function sign(payload, secret, alg = 'HS256') {
    const header = { alg, typ: 'JWT' };
    const data = `${Hash.base64urlText(JSON.stringify(header))}.${Hash.base64urlText(JSON.stringify(payload))}`;
    return { header, payload, data, signature: alg === 'none' ? '' : Hash.hmacBase64url(secret, data) };
  }

  function buildCase(id) {
    const now = Math.floor(Date.now() / 1000);
    const payload = { username: 'admin', iat: now, exp: now + 3600, sub: '1' };
    if (id === 'expired') return sign({ ...payload, iat: now - 7200, exp: now - 3600 }, SECRET);
    if (id === 'other') return sign(payload, 'otro-secreto-distinto');
    if (id === 'none') return sign(payload, SECRET, 'none');
    const token = sign(payload, SECRET);
    if (id === 'tampered') {
      // Se cambia el contenido pero se deja la firma original
      const forged = { ...payload, username: 'superadmin', sub: '99' };
      const header = Hash.base64urlText(JSON.stringify(token.header));
      return { ...token, payload: forged, data: `${header}.${Hash.base64urlText(JSON.stringify(forged))}` };
    }
    return token;
  }

  // Las tres comprobaciones que hace jwt.verify en middleware/autenticacion.js
  function verify(token) {
    const now = Math.floor(Date.now() / 1000);
    return [
      ['El algoritmo es HS256', token.header.alg === 'HS256'],
      ['La firma coincide con el JWT_SECRET del servicio', token.signature !== '' && token.signature === Hash.hmacBase64url(SECRET, token.data)],
      ['La fecha exp todavía no pasó', token.payload.exp > now],
    ];
  }

  function jwtlab(spec, { el, highlight }) {
    const { node, body } = labShell(el, 'laboratorio', 'Un token, cinco situaciones');
    const tokenBox = el('p', { class: 'jwt-token', 'aria-label': 'Token JWT' });
    const headerCode = el('code', { class: 'hljs language-json' });
    const payloadCode = el('code', { class: 'hljs language-json' });
    const checks = el('ul', { class: 'sim-results' });
    const verdict = el('p', { class: 'lab-verdict', 'aria-live': 'polite' });

    const block = (title, code, cls) => el('div', { class: `jwt-part ${cls}` },
      el('span', { class: 'lab-label', text: title }),
      el('pre', { class: 'on-dark' }, code));

    function paint(option) {
      const token = buildCase(option.id);
      const [head, payload] = token.data.split('.');
      tokenBox.textContent = '';
      tokenBox.append(
        el('span', { class: 'jwt-h', text: head }), '.',
        el('span', { class: 'jwt-p', text: payload }), '.',
        el('span', { class: 'jwt-s', text: token.signature }));
      headerCode.innerHTML = highlight(JSON.stringify(token.header, null, 2), 'json');
      payloadCode.innerHTML = highlight(JSON.stringify(token.payload, null, 2), 'json');

      const results = verify(token);
      checks.textContent = '';
      results.forEach(([label, ok]) => checks.append(el('li', { class: ok ? 'is-ok' : 'is-fail' },
        el('span', { class: 'sim-mark', 'aria-hidden': 'true', text: ok ? '✓' : '✕' }),
        el('span', { text: label }),
        el('span', { class: 'sr-only', text: ok ? ': cumple' : ': no cumple' }))));
      const ok = results.every(([, passed]) => passed);
      verdict.className = `lab-verdict ${ok ? 'is-ok' : 'is-fail'}`;
      verdict.textContent = ok ? '200 · pasa al controlador' : '401 · {"error":"La sesion no es valida o ya expiro"}';
    }

    const options = [
      { id: 'valid', label: 'Token válido' },
      { id: 'tampered', label: 'Alterar el contenido' },
      { id: 'other', label: 'Otro secreto' },
      { id: 'expired', label: 'Expirado' },
      { id: 'none', label: 'Sin firma (none)' },
    ];
    body.append(
      toggleGroup(el, 'Situación del token', options, paint),
      tokenBox,
      el('div', { class: 'jwt-grid' }, block('Header', headerCode, 'jwt-part--h'), block('Payload', payloadCode, 'jwt-part--p')),
      checks, verdict);
    paint(options[0]);
    return { node };
  }

  window.Labs = { failsim, sequence, shalab, jwtlab };
})();
