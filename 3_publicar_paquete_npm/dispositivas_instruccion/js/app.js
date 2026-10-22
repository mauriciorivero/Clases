/*
 * Motor de la presentación: construye las diapositivas, maneja la navegación,
 * el editor de código, el índice, el tema y conecta a Bit con el contenido.
 */
(function () {
  'use strict';

  var GUIDE = window.GUIDE;
  var HL = window.Highlighter;
  var inline = HL.inline;
  var esc = HL.esc;
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var deck = document.getElementById('deck');
  var dotsEl = document.getElementById('dots');
  var counterEl = document.getElementById('counter');
  var progressEl = document.getElementById('progressBar');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var nextLabel = document.getElementById('nextLabel');
  var phasePill = document.getElementById('phasePill');
  var phasePillText = document.getElementById('phasePillText');
  var indexPanel = document.getElementById('indexPanel');
  var indexBody = document.getElementById('indexBody');
  var toastEl = document.getElementById('toast');

  var slides = GUIDE.slides;
  var total = slides.length;
  var totalSteps = slides.filter(function (s) { return s.type === 'step'; }).length;
  var slideEls = [];
  var current = -1;
  var leaveTimers = {};
  var celebrateTimer = null;
  var seen = {};

  /* ======================================================================
     Plantillas
     ====================================================================== */

  var ICONS = {
    arrow: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    copy: '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6l2 2h7.4A2.5 2.5 0 0 1 21 9.5v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5z" fill="currentColor" opacity=".85"/></svg>',
    branch: '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><circle cx="6" cy="5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="6" cy="19" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="8" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6 7.2v9.6M18 10.2c0 4-6 3-11 6.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    pkg: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 2.8 20.5 7.5v9L12 21.2 3.5 16.5v-9z M3.9 7.7 12 12.2l8.1-4.5M12 12.2v8.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    globe: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    app: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 9h17M8 13.5l2 1.8-2 1.8M12.5 17h3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  function phaseOf(slide) {
    if (slide.type === 'step') return String(slide.phase);
    if (slide.type === 'final') return 'final';
    return 'intro';
  }

  function slideIndexOfStep(step) {
    for (var i = 0; i < total; i++) if (slides[i].type === 'step' && slides[i].step === step) return i;
    return 0;
  }

  /* ---------- Editor ---------- */
  function tabIcon(tab) {
    if (tab.kind === 'terminal') return '<span class="fi fi--file" style="color:var(--accent-ed)">&gt;_</span>';
    if (tab.kind === 'preview') return '<span class="fi fi--md">◉</span>';
    return fileIcon(tab.file || tab.label);
  }

  function fileIcon(name) {
    if (/\.m?js$/.test(name)) return '<span class="fi fi--js">JS</span>';
    if (/\.json$/.test(name)) return '<span class="fi fi--json">{}</span>';
    if (/\.md$/i.test(name)) return '<span class="fi fi--md">M↓</span>';
    if (/^\.git/.test(name.split('/').pop())) return '<span class="fi fi--git">◆</span>';
    return '<span class="fi fi--file">≡</span>';
  }

  function langLabel(tab) {
    if (tab.kind === 'terminal') return 'zsh';
    if (tab.kind === 'preview') return 'Vista previa';
    return { js: 'JavaScript', json: 'JSON', md: 'Markdown', bash: 'Shell', plain: 'Ignore' }[tab.lang] || 'Texto';
  }

  function tabTitle(tab, project) {
    if (tab.kind === 'terminal') return 'zsh — ' + project;
    if (tab.kind === 'preview') return 'Vista previa: README.md';
    return (tab.file || tab.label) + ' — ' + project;
  }

  function renderTree(tree) {
    var rows = tree.map(function (row, k) {
      var m = /^(\s*)(.+?)(?:\s([+*@]))?$/.exec(row);
      var depth = m[1].length / 2;
      var name = m[2];
      var flag = m[3] || '';
      var folder = /\/$/.test(name);
      var cls = 'tree-item';
      var badge = '';
      var icon;
      if (flag === '+') { cls += ' is-new'; badge = '<span class="tree-badge">U</span>'; }
      if (flag === '*') { cls += ' is-active'; badge = '<span class="tree-badge tree-badge--m">M</span>'; }
      if (flag === '@') { cls += ' is-link'; badge = '<span class="tree-badge tree-badge--l">↪</span>'; }
      if (folder) icon = '<span class="tree-chev">▾</span><span class="fi fi--folder">' + ICONS.folder + '</span>';
      else if (flag === '@') icon = '<span class="fi fi--link">↪</span>';
      else icon = fileIcon(name);
      return '<li class="' + cls + '" style="--depth:' + depth + ';--t:' + k + '">' + icon +
        '<span class="tree-name">' + esc(name.replace(/\/$/, '')) + '</span>' + badge + '</li>';
    });
    return '<aside class="explorer" aria-label="Explorador de archivos"><div class="explorer__title">Explorador</div><ul class="tree">' + rows.join('') + '</ul></aside>';
  }

  function renderCodePane(tab) {
    var html = HL.lines(tab.code, tab.lang || 'plain');
    return html.map(function (line, i) {
      return '<div class="cl" data-line="' + (i + 1) + '" style="--d:' + (i * 32) + 'ms">' +
        '<span class="cl__n">' + (i + 1) + '</span><span class="cl__c">' + (line || ' ') + '</span></div>';
    }).join('');
  }

  function renderTerminalPane(tab) {
    var t = 0;
    var out = tab.code.map(function (raw, i) {
      var n = i + 1;
      var isCmd = raw.indexOf('$ ') === 0 || raw.indexOf('> ') === 0;
      if (isCmd) {
        var repl = raw[0] === '>';
        var cmd = raw.slice(2);
        var chars = Math.max(cmd.length, 1);
        var td = Math.min(chars * 26, 1200);
        var line = '<div class="cl cl--term cl--cmd" data-line="' + n + '" style="--d:' + t + 'ms">' +
          '<span class="prompt' + (repl ? ' prompt--repl' : '') + '">' + (repl ? '&gt;' : '$') + '</span>' +
          '<span class="cl__c type" style="--chars:' + chars + ';--td:' + td + 'ms;--d:' + (t + 140) + 'ms">' +
          HL.line(cmd, repl ? 'js' : 'bash') + '</span></div>';
        t += td + 300;
        return line;
      }
      if (raw.indexOf('# ') === 0) {
        var c = '<div class="cl cl--term cl--comment" data-line="' + n + '" style="--d:' + t + 'ms"><span class="cl__c">' + esc(raw) + '</span></div>';
        t += 90;
        return c;
      }
      var o = '<div class="cl cl--term cl--out" data-line="' + n + '" style="--d:' + t + 'ms"><span class="cl__c">' +
        (HL.line(raw, tab.outLang || 'out') || ' ') + '</span></div>';
      t += 55;
      return o;
    });
    out.push('<div class="cl cl--term" style="--d:' + t + 'ms"><span class="prompt">$</span><span class="caret"></span></div>');
    return out.join('');
  }

  function renderEditor(cfg, opts) {
    opts = opts || {};
    var tabs = cfg.tabs;
    var project = cfg.project || (cfg.tree && cfg.tree[0] ? cfg.tree[0].replace(/\/.*$/, '') : 'sena-date');
    var first = tabs[0];

    var tabsHtml = tabs.map(function (tab, i) {
      return '<button class="ed-tab' + (i === 0 ? ' is-active' : '') + '" type="button" role="tab" aria-selected="' + (i === 0) + '" data-tab="' + i + '"' +
        ' data-tab-title="' + esc(tabTitle(tab, project)) + '" data-tab-lang="' + esc(langLabel(tab)) + '" data-kind="' + tab.kind + '">' +
        tabIcon(tab) + '<span>' + esc(tab.label) + '</span></button>';
    }).join('');

    var panesHtml = tabs.map(function (tab, i) {
      var body;
      var cls = 'pane';
      if (tab.kind === 'terminal') { body = '<div class="code">' + renderTerminalPane(tab) + '</div>'; cls += ' pane--term'; }
      else if (tab.kind === 'preview') { body = '<div class="preview">' + tab.html + '</div>'; }
      else { body = '<div class="code">' + renderCodePane(tab) + '</div>'; }
      return '<div class="' + cls + (i === 0 ? ' is-shown' : '') + '" role="tabpanel" data-pane="' + i + '">' + body + '</div>';
    }).join('');

    return '<div class="editor"' + (opts.anim === false ? '' : ' data-anim="window"') + ' data-editor>' +
      '<div class="editor__titlebar">' +
        '<div class="editor__lights" aria-hidden="true"><span></span><span></span><span></span></div>' +
        '<div class="editor__title" data-ed-title>' + esc(tabTitle(first, project)) + '</div>' +
        '<button class="editor__copy" type="button" data-copy' + (first.kind === 'preview' ? ' hidden' : '') + '>' + ICONS.copy + '<span>Copiar</span></button>' +
      '</div>' +
      (tabs.length > 1 || cfg.showTabs ? '<div class="editor__tabs" role="tablist">' + tabsHtml + '</div>' : '<div class="editor__tabs" role="tablist" hidden>' + tabsHtml + '</div>') +
      '<div class="editor__body">' +
        (cfg.tree ? renderTree(cfg.tree) : '') +
        '<div class="panes">' + panesHtml + '</div>' +
      '</div>' +
      '<div class="editor__status">' +
        '<span><span class="status-dot"></span><span style="display:inline-flex;gap:5px;align-items:center">' + ICONS.branch + 'main</span><span>⊗ 0  ⚠ 0</span></span>' +
        '<span><span data-ed-lang>' + esc(langLabel(first)) + '</span><span>UTF-8</span><span>Geist Mono</span></span>' +
      '</div>' +
    '</div>';
  }

  function renderDiagram(level) {
    function node(on, icon, title, sub) {
      return '<div class="lm-node ' + (on ? 'is-on' : 'is-off') + '"><div class="lm-node__icon">' + icon + '</div>' +
        '<div class="lm-node__title">' + title + '</div><div class="lm-node__sub">' + sub + '</div></div>';
    }
    function wire(on, label) {
      return '<div class="lm-wire' + (on ? ' is-on' : '') + '"><span class="lm-wire__label">' + label + '</span>' +
        '<svg viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8H88" vector-effect="non-scaling-stroke"/><path class="lm-head" d="M88 3 L99 8 L88 13Z"/></svg>' +
        '<span class="lm-packet"></span></div>';
    }
    return '<div class="linkmap" data-anim aria-label="Diagrama del enlace simbólico">' +
      node(true, ICONS.pkg, 'sena-date/', 'código real') +
      wire(true, 'npm link') +
      node(true, ICONS.globe, 'npm global', '↪ acceso directo') +
      wire(level >= 2, 'npm link sena-date') +
      node(level >= 2, ICONS.app, 'mi-app/', 'node_modules ↪') +
    '</div>';
  }

  /* ---------- Diapositivas ---------- */
  function renderCover(s) {
    var title = esc(s.title).replace(/npm$/, '<span class="grad">npm</span>');
    return '<div class="slide__inner cover">' +
      '<div class="cover__text">' +
        '<div class="eyebrow" data-anim><span class="eyebrow__tag">Node.js</span>Clase práctica · paquetes npm</div>' +
        '<h1 class="cover__title" data-anim>' + title + '</h1>' +
        '<p class="cover__lead" data-anim>' + inline(s.lead) + '</p>' +
        '<div class="cover__cta" data-anim>' +
          '<button class="btn btn--primary" type="button" data-go="next">Comenzar ' + ICONS.arrow + '</button>' +
          '<button class="btn" type="button" data-go="1">Ver la ruta</button>' +
        '</div>' +
        '<div class="cover__keys" data-anim>' +
          '<span><kbd>←</kbd><kbd>→</kbd> navegar</span>' +
          '<span><kbd>H</kbd> pista de Bit</span>' +
          '<span><kbd>T</kbd> tema</span>' +
          '<span><kbd>I</kbd> índice</span>' +
        '</div>' +
      '</div>' +
      '<div class="cover__visual" data-anim="window">' +
        '<div class="chip-float chip-float--a"><i style="--c:var(--p0)"></i><b>14</b> pasos</div>' +
        renderEditor({ project: 'mi-app', tabs: [{ label: 'Terminal', kind: 'terminal', code: s.terminal }] }, { anim: false }) +
        '<div class="chip-float chip-float--b"><i style="--c:var(--p3)"></i>npm publish</div>' +
        '<div class="chip-float chip-float--c"><i style="--c:var(--p2)"></i><b>627 B</b> paquete</div>' +
      '</div>' +
    '</div>';
  }

  function renderOverview(s) {
    var cards = GUIDE.phases.map(function (p, i) {
      var chips = p.steps.map(function (n) {
        var st = slides[slideIndexOfStep(n)];
        return '<li><button class="step-chip" type="button" data-go="' + slideIndexOfStep(n) + '">' +
          '<span class="step-chip__n">' + pad(n) + '</span><span class="step-chip__t">' + esc(st.title) + '</span>' +
          '<span class="step-chip__arrow">→</span></button></li>';
      }).join('');
      return '<article class="phase-card" data-anim style="--c:var(--p' + i + ')">' +
        '<div class="phase-card__top"><span class="phase-card__num">' + pad(i + 1) + '</span><span class="phase-card__name">' + esc(p.full) + '</span></div>' +
        '<p class="phase-card__desc">' + esc(p.desc) + '</p>' +
        '<ul class="phase-card__steps">' + chips + '</ul>' +
      '</article>';
    }).join('');
    return '<div class="slide__inner overview">' +
      '<header class="overview__head">' +
        '<div class="phase-tag" data-anim style="margin-bottom:14px">Mapa del recorrido</div>' +
        '<h2 class="section-title" data-anim>' + esc(s.title) + '</h2>' +
        '<p class="section-lead" data-anim>' + inline(s.lead) + '</p>' +
      '</header>' +
      '<div class="phases"><div class="phases__line"></div>' + cards + '</div>' +
    '</div>';
  }

  function renderStep(s) {
    var phase = GUIDE.phases[s.phase];
    var points = (s.points || []).map(function (p) { return '<li data-anim>' + inline(p) + '</li>'; }).join('');
    var note = '';
    if (s.note) {
      note = '<div class="note note--' + s.note.type + '" data-anim><span class="note__icon">' + (s.note.type === 'warn' ? '!' : 'i') + '</span>' +
        '<div>' + inline(s.note.text) + '</div></div>';
    }
    return '<div class="slide__inner step' + (s.diagram ? ' has-diagram' : '') + '">' +
      '<div class="step__text">' +
        '<div class="step__meta" data-anim><span class="phase-tag">Fase ' + (s.phase + 1) + ' · ' + esc(phase.name) + '</span></div>' +
        '<div class="step__num"><span class="step__num-value">' + pad(s.step) + '</span><span class="step__num-total">/ ' + pad(totalSteps) + '</span></div>' +
        '<h2 class="step__title" data-anim>' + inline(s.title) + '</h2>' +
        '<p class="step__lead" data-anim>' + inline(s.lead) + '</p>' +
        '<ul class="step__points">' + points + '</ul>' +
        note +
      '</div>' +
      '<div class="step__visual">' +
        renderEditor(s.editor) +
        (s.diagram ? renderDiagram(s.diagram) : '') +
      '</div>' +
    '</div>';
  }

  function renderFinal(s) {
    var items = s.achievements.map(function (a) {
      return '<li data-anim><span class="check">' + ICONS.check + '</span><span>' + inline(a) + '</span></li>';
    }).join('');
    return '<div class="slide__inner final">' +
      '<div>' +
        '<div class="phase-tag" data-anim style="margin-bottom:14px">Misión cumplida</div>' +
        '<h2 class="final__title" data-anim>Tu paquete ya vive en <span class="grad">npm</span></h2>' +
        '<p class="section-lead" data-anim>' + inline(s.lead) + '</p>' +
        '<ul class="achievements">' + items + '</ul>' +
        '<div class="cover__cta" data-anim>' +
          '<button class="btn btn--primary" type="button" data-go="0">Volver al inicio ' + ICONS.arrow + '</button>' +
          '<button class="btn" type="button" data-action="index">Ver el índice</button>' +
        '</div>' +
      '</div>' +
      '<div>' + renderEditor({ project: 'sena-date', tabs: [{ label: 'chuleta.sh', kind: 'terminal', code: s.cheatsheet }] }) + '</div>' +
    '</div>';
  }

  function buildSlides() {
    var html = slides.map(function (s, i) {
      var body = s.type === 'cover' ? renderCover(s)
        : s.type === 'overview' ? renderOverview(s)
        : s.type === 'final' ? renderFinal(s)
        : renderStep(s);
      var label = s.type === 'step' ? 'Paso ' + s.step + ': ' + s.title : s.title;
      return '<section class="slide" id="slide-' + (i + 1) + '" data-index="' + i + '" role="group" aria-roledescription="diapositiva" aria-label="' + esc(label) + '">' + body + '</section>';
    }).join('');
    deck.innerHTML = html;
    slideEls = Array.prototype.slice.call(deck.querySelectorAll('.slide'));

    // Orden de aparición escalonada
    slideEls.forEach(function (el) {
      el.querySelectorAll('[data-anim]').forEach(function (a, k) { a.style.setProperty('--i', k); });
    });
  }

  function buildDots() {
    var html = '';
    var lastPhase = null;
    slides.forEach(function (s, i) {
      var ph = phaseOf(s);
      var gap = lastPhase !== null && ph !== lastPhase ? ' dot--gap' : '';
      lastPhase = ph;
      var label = s.type === 'step' ? 'Paso ' + s.step + ': ' + s.title : s.short || s.title;
      html += '<button class="dot' + gap + '" type="button" role="tab" data-go="' + i + '" aria-label="' + esc(label) + '" title="' + esc(label) + '"></button>';
    });
    dotsEl.innerHTML = html;
  }

  function buildIndex() {
    var html = '<div class="index-group">Inicio</div>';
    function item(i, n, title, color) {
      return '<button class="index-item" type="button" data-go="' + i + '"' + (color ? ' style="--c:' + color + '"' : '') + '>' +
        '<span class="index-item__n">' + n + '</span><span>' + esc(title) + '</span></button>';
    }
    html += item(0, '◆', slides[0].short) + item(1, '◇', slides[1].short + ': ' + slides[1].title);
    GUIDE.phases.forEach(function (p, pi) {
      html += '<div class="index-group" style="--c:var(--p' + pi + ')">Fase ' + (pi + 1) + ' · ' + esc(p.full) + '</div>';
      p.steps.forEach(function (n) {
        var i = slideIndexOfStep(n);
        html += item(i, pad(n), slides[i].title, 'var(--p' + pi + ')');
      });
    });
    html += '<div class="index-group">Cierre</div>' + item(total - 1, '★', slides[total - 1].title);
    indexBody.innerHTML = html;
  }

  /* ======================================================================
     Navegación
     ====================================================================== */
  function go(i, opts) {
    opts = opts || {};
    i = Math.max(0, Math.min(total - 1, i));
    if (i === current) return;
    var dir = current === -1 ? 1 : (i > current ? 1 : -1);
    deck.style.setProperty('--dir', dir);

    var prev = slideEls[current];
    var next = slideEls[i];

    if (prev) {
      clearTimeout(leaveTimers[current]);
      prev.classList.remove('is-active');
      if (!reduceMotion) {
        prev.classList.add('is-leaving');
        var leaving = current;
        leaveTimers[leaving] = setTimeout(function () { slideEls[leaving].classList.remove('is-leaving'); }, 520);
      }
      prev.setAttribute('aria-hidden', 'true');
      prev.inert = true;
    }

    clearTimeout(leaveTimers[i]);
    next.classList.remove('is-leaving');
    resetEditors(next);
    next.scrollTop = 0;
    next.classList.add('is-active');
    next.removeAttribute('aria-hidden');
    next.inert = false;

    current = i;
    seen[i] = true;
    updateChrome();

    if (!opts.fromHash) {
      try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) { /* file:// en algunos navegadores */ }
    }

    var s = slides[i];
    window.Avatar.setSlide(s, i);
    document.dispatchEvent(new CustomEvent('slidechange', {
      detail: { index: i, total: total, dir: dir, phase: phaseOf(s), type: s.type }
    }));

    clearTimeout(celebrateTimer);
    if (s.celebrate || s.type === 'final') {
      celebrateTimer = setTimeout(function () {
        if (window.Stage && window.Stage.celebrate) window.Stage.celebrate();
        window.Avatar.celebrate(s.type === 'final' ? null : '¡Publicado! 🎉 Tu paquete ya está en npm. Haz clic en mí para ver más pistas.');
      }, s.type === 'final' ? 900 : 2300);
    }
  }

  function next() { go(current < total - 1 ? current + 1 : 0); }
  function prev() { go(current - 1); }

  function updateChrome() {
    var s = slides[current];
    var phase = phaseOf(s);
    root.setAttribute('data-phase', phase);
    root.setAttribute('data-slide', current);

    counterEl.textContent = pad(current + 1) + ' / ' + pad(total);
    progressEl.style.width = (current / (total - 1) * 100) + '%';
    prevBtn.disabled = current === 0;
    nextLabel.textContent = current === 0 ? 'Comenzar' : current === total - 1 ? 'Reiniciar' : 'Siguiente';
    nextBtn.setAttribute('aria-label', current === total - 1 ? 'Volver al inicio' : 'Siguiente diapositiva');

    var label = s.type === 'step' ? 'Fase ' + (s.phase + 1) + ' · ' + GUIDE.phases[s.phase].name
      : s.type === 'cover' ? 'Introducción'
      : s.type === 'overview' ? 'Mapa del recorrido'
      : '¡Completado!';
    if (phasePillText.textContent !== label) {
      phasePill.classList.remove('is-changing');
      void phasePill.offsetWidth;
      phasePill.classList.add('is-changing');
      setTimeout(function () { phasePillText.textContent = label; }, reduceMotion ? 0 : 200);
    }

    Array.prototype.forEach.call(dotsEl.children, function (d, k) {
      d.classList.toggle('is-active', k === current);
      d.classList.toggle('is-seen', !!seen[k]);
      d.setAttribute('aria-selected', k === current);
    });
    Array.prototype.forEach.call(indexBody.querySelectorAll('.index-item'), function (b) {
      b.classList.toggle('is-current', Number(b.getAttribute('data-go')) === current);
    });
  }

  /* ======================================================================
     Editor: pestañas, copiar y resaltado de líneas
     ====================================================================== */
  function resetEditors(slideEl) {
    slideEl.querySelectorAll('[data-editor]').forEach(function (ed) {
      ed.style.removeProperty('--base');
      switchTab(ed, 0, true);
      clearHighlight(ed);
    });
  }

  function switchTab(editor, idx, silent) {
    var tabs = editor.querySelectorAll('.ed-tab');
    var panes = editor.querySelectorAll('.pane');
    if (!tabs[idx]) return;
    if (!silent) editor.style.setProperty('--base', '40ms');
    tabs.forEach(function (t, k) {
      t.classList.toggle('is-active', k === idx);
      t.setAttribute('aria-selected', k === idx);
    });
    panes.forEach(function (p, k) { p.classList.toggle('is-shown', k === idx); });
    editor.querySelector('[data-ed-title]').textContent = tabs[idx].getAttribute('data-tab-title');
    editor.querySelector('[data-ed-lang]').textContent = tabs[idx].getAttribute('data-tab-lang');
    editor.querySelector('[data-copy]').hidden = tabs[idx].getAttribute('data-kind') === 'preview';
  }

  function activeTabIndex(editor) {
    var tabs = Array.prototype.slice.call(editor.querySelectorAll('.ed-tab'));
    return Math.max(0, tabs.findIndex(function (t) { return t.classList.contains('is-active'); }));
  }

  function parseLines(spec) {
    var set = {};
    String(spec).split(',').forEach(function (part) {
      var m = part.trim().split('-');
      var a = parseInt(m[0], 10);
      var b = m[1] ? parseInt(m[1], 10) : a;
      for (var n = a; n <= b; n++) set[n] = true;
    });
    return set;
  }

  function clearHighlight(editor) {
    var scope = editor || deck;
    scope.querySelectorAll('.cl.is-hl').forEach(function (l) { l.classList.remove('is-hl'); });
    scope.querySelectorAll('.pane.has-hl').forEach(function (p) { p.classList.remove('has-hl'); });
  }

  function highlightHint(hint, slideIndex) {
    var slideEl = slideEls[slideIndex];
    var editor = slideEl && slideEl.querySelector('[data-editor]');
    if (!editor) return;
    clearHighlight(editor);
    if (typeof hint.tab === 'number' && hint.tab !== activeTabIndex(editor)) {
      switchTab(editor, hint.tab);
      var tabEl = editor.querySelectorAll('.ed-tab')[hint.tab];
      tabEl.classList.remove('is-pinged');
      void tabEl.offsetWidth;
      tabEl.classList.add('is-pinged');
    }
    if (!hint.lines) return;
    var pane = editor.querySelector('.pane.is-shown');
    var set = parseLines(hint.lines);
    var first = null;
    pane.querySelectorAll('.cl[data-line]').forEach(function (l) {
      if (set[l.getAttribute('data-line')]) {
        l.classList.add('is-hl');
        if (!first) first = l;
      }
    });
    if (first) {
      pane.classList.add('has-hl');
      pane.scrollTo({ top: Math.max(0, first.offsetTop - pane.clientHeight / 3), behavior: reduceMotion ? 'auto' : 'smooth' });
      var r = editor.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) editor.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  function codeForCopy(editor) {
    var idx = activeTabIndex(editor);
    var s = slides[current];
    var cfg = s.type === 'final' ? { tabs: [{ kind: 'terminal', code: s.cheatsheet }] }
      : s.type === 'cover' ? { tabs: [{ kind: 'terminal', code: s.terminal }] }
      : s.editor;
    var tab = cfg.tabs[idx];
    if (tab.kind === 'terminal') {
      return tab.code
        .filter(function (l) { return l.indexOf('$ ') === 0 || l.indexOf('> ') === 0; })
        .map(function (l) { return l.slice(2); })
        .join('\n');
    }
    return tab.code.join('\n');
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    if (!ok) throw new Error('copy failed');
  }

  function onCopy(btn) {
    var editor = btn.closest('[data-editor]');
    copyText(codeForCopy(editor)).then(function () {
      btn.classList.add('is-done');
      btn.querySelector('span').textContent = '¡Copiado!';
      setTimeout(function () {
        btn.classList.remove('is-done');
        btn.querySelector('span').textContent = 'Copiar';
      }, 1600);
      toast('Código copiado al portapapeles');
      window.Avatar.react('happy', 1200);
    }).catch(function () {
      toast('No se pudo copiar. Selecciona el texto manualmente.');
    });
  }

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 1900);
  }

  /* ======================================================================
     Índice, tema y pantalla completa
     ====================================================================== */
  var lastFocus = null;
  function openIndex() {
    if (!indexPanel.hidden) return;
    lastFocus = document.activeElement;
    indexPanel.classList.remove('is-closing');
    indexPanel.hidden = false;
    var cur = indexBody.querySelector('.is-current') || indexBody.querySelector('.index-item');
    if (cur) { cur.focus(); cur.scrollIntoView({ block: 'center' }); }
  }
  function closeIndex() {
    if (indexPanel.hidden) return;
    if (reduceMotion) { indexPanel.hidden = true; }
    else {
      indexPanel.classList.add('is-closing');
      setTimeout(function () { indexPanel.hidden = true; indexPanel.classList.remove('is-closing'); }, 280);
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function toggleTheme() {
    var nextTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', nextTheme);
    try { localStorage.setItem('npm-guide-theme', nextTheme); } catch (e) { /* sin almacenamiento */ }
    var btn = document.getElementById('themeBtn');
    btn.classList.remove('is-spinning');
    void btn.offsetWidth;
    btn.classList.add('is-spinning');
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: nextTheme } }));
    toast(nextTheme === 'light' ? 'Modo claro activado' : 'Modo oscuro activado');
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (root.requestFullscreen) root.requestFullscreen().catch(function () {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  /* ======================================================================
     Eventos
     ====================================================================== */
  function bindEvents() {
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);
    document.getElementById('indexBtn').addEventListener('click', openIndex);
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);
    document.getElementById('fsBtn').addEventListener('click', toggleFullscreen);

    document.addEventListener('click', function (e) {
      var goEl = e.target.closest('[data-go]');
      if (goEl) {
        var v = goEl.getAttribute('data-go');
        if (!indexPanel.hidden) closeIndex();
        if (v === 'next') next(); else go(Number(v));
        return;
      }
      if (e.target.closest('[data-close]')) { closeIndex(); return; }
      if (e.target.closest('[data-action="index"]')) { openIndex(); return; }

      var tab = e.target.closest('.ed-tab');
      if (tab) {
        var editor = tab.closest('[data-editor]');
        clearHighlight(editor);
        switchTab(editor, Number(tab.getAttribute('data-tab')));
        return;
      }
      var copy = e.target.closest('[data-copy]');
      if (copy) onCopy(copy);
    });

    // Enlaces de la marca (#1) también navegan
    document.querySelector('.brand').addEventListener('click', function (e) { e.preventDefault(); go(0); });

    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (!indexPanel.hidden) {
        if (e.key === 'Escape' || e.key === 'i' || e.key === 'I') { e.preventDefault(); closeIndex(); }
        return;
      }
      switch (e.key) {
        case 'ArrowRight': case 'PageDown':
          e.preventDefault(); next(); break;
        case ' ':
          if (tag === 'button' || tag === 'a') return;
          e.preventDefault(); e.shiftKey ? prev() : next(); break;
        case 'ArrowLeft': case 'PageUp':
          e.preventDefault(); prev(); break;
        case 'Home': e.preventDefault(); go(0); break;
        case 'End': e.preventDefault(); go(total - 1); break;
        case 'h': case 'H': window.Avatar.nextHint(); break;
        case 't': case 'T': toggleTheme(); break;
        case 'i': case 'I': openIndex(); break;
        case 'f': case 'F': toggleFullscreen(); break;
        case 'Escape': window.Avatar.close(); break;
      }
    });

    // Gesto de deslizar en pantallas táctiles
    var touch = null;
    deck.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'touch' || e.target.closest('.pane, .editor__tabs')) { touch = null; return; }
      touch = { x: e.clientX, y: e.clientY, t: Date.now() };
    });
    deck.addEventListener('pointerup', function (e) {
      if (!touch) return;
      var dx = e.clientX - touch.x;
      var dy = e.clientY - touch.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - touch.t < 800) {
        dx < 0 ? next() : prev();
      }
      touch = null;
    });

    window.addEventListener('hashchange', function () {
      var n = parseInt(location.hash.slice(1), 10);
      if (n >= 1 && n <= total) go(n - 1, { fromHash: true });
    });

    // Si el sistema cambia de tema y el usuario no eligió uno, seguirlo
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    if (mq.addEventListener) {
      mq.addEventListener('change', function (ev) {
        var stored = null;
        try { stored = localStorage.getItem('npm-guide-theme'); } catch (e) { /* nada */ }
        if (stored) return;
        root.setAttribute('data-theme', ev.matches ? 'light' : 'dark');
        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: ev.matches ? 'light' : 'dark' } }));
      });
    }
  }

  /* ======================================================================
     Inicio
     ====================================================================== */
  buildSlides();
  buildDots();
  buildIndex();
  slideEls.forEach(function (el) { el.setAttribute('aria-hidden', 'true'); el.inert = true; });

  window.Avatar.init({
    onHint: highlightHint,
    onClose: function () { clearHighlight(); }
  });
  bindEvents();

  var start = parseInt(location.hash.slice(1), 10);
  go(start >= 1 && start <= total ? start - 1 : 0, { fromHash: true });

  // Saludo inicial de Bit
  setTimeout(function () {
    if (current === 0 && !window.Avatar.isOpen()) window.Avatar.nextHint();
  }, 1600);
})();
