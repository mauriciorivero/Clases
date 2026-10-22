/* Controlador de la presentación: construye las diapositivas, navegación, tema e índice. */
window.Deck = window.Deck || {};
(function (Deck) {
  'use strict';

  const { editor, terminal, fromHTML } = Deck.components;
  const fmt = Deck.fmt;
  const esc = Deck.highlight.esc;
  const slides = Deck.slides;
  const N = slides.length;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const deckEl = document.getElementById('deck');
  const progressEl = document.getElementById('progress');
  const counterEl = document.getElementById('counter');
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  const themeBtn = document.getElementById('btn-theme');
  const fullBtn = document.getElementById('btn-full');
  const indexBtn = document.getElementById('btn-index');
  const overview = document.getElementById('overview');
  const ovGrid = document.getElementById('ov-grid');
  const ovClose = document.getElementById('ov-close');
  const toastEl = document.getElementById('toast');
  const announcer = document.getElementById('announcer');

  const ids = {};
  slides.forEach((s, i) => { ids[s.id] = i; });
  const pad = (n) => String(n).padStart(2, '0');

  const ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
    code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    ext: '<path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    restart: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

  /* ---------- Construcción de diapositivas ---------- */
  function buildPanel(cfg, view) {
    if (cfg.type === 'editor') {
      const ed = editor(cfg);
      view.editors.push(ed);
      return ed.root;
    }
    const tm = terminal(cfg);
    view.terminals.push(tm);
    return tm.root;
  }

  function build(s, i) {
    const el = document.createElement('section');
    el.className = `slide layout-${s.layout}`;
    el.id = `slide-${s.id}`;
    el.setAttribute('aria-roledescription', 'diapositiva');
    el.setAttribute('aria-label', `${i + 1} de ${N}: ${s.title}`);
    el.setAttribute('aria-hidden', 'true');
    el.inert = true;

    const inner = fromHTML('<div class="slide-inner"></div>');
    const main = fromHTML('<div class="col-main"></div>');
    const side = fromHTML('<div class="col-side"></div>');
    const view = { el, main, index: i, slide: s, editors: [], terminals: [], stage: null, cleanup: null };
    let ri = 0;
    const reveal = (node) => { node.classList.add('r'); node.style.setProperty('--i', ri++); return node; };
    const addMain = (html) => main.appendChild(reveal(typeof html === 'string' ? fromHTML(html) : html));
    const addSide = (html) => side.appendChild(reveal(typeof html === 'string' ? fromHTML(html) : html));

    addMain(`<div class="kicker">${s.badge ? `<span class="kicker-badge">${esc(s.badge)}</span>` : ''}<span>${fmt(s.kicker)}</span></div>`);
    const tag = i === 0 ? 'h1' : 'h2';
    addMain(`<${tag} class="title">${s.titleHtml || fmt(s.title)}</${tag}>`);
    if (s.lead) addMain(`<p class="lead">${fmt(s.lead)}</p>`);

    if (s.layout === 'cover') {
      addMain(`<div class="cover-actions">
        <button class="btn btn-primary" type="button" data-go="next">Comenzar ${icon('arrow')}</button>
        <button class="btn" type="button" data-action="index">Ver índice</button>
      </div>`);
      addMain(`<div class="chips">${s.chips.map((c) => `<span class="chip">${fmt(c)}</span>`).join('')}</div>`);
      addMain(`<p class="cover-tip"><kbd>←</kbd><kbd>→</kbd> para navegar · haz clic en <strong>Bit</strong> (abajo a la derecha) para recibir pistas</p>`);
    }

    if (s.cards) {
      addMain(`<div class="crud">${s.cards.map((c) => `
        <button class="crud-card" type="button" data-phase="${c.phase}" data-goto="${c.go}">
          <span class="crud-ic">${icon(c.icon)}</span>
          <span class="crud-verb">${esc(c.verb)}</span>
          <code class="crud-fn">${esc(c.fn)}</code>
          <span class="crud-desc">${esc(c.desc)}</span>
        </button>`).join('')}</div>`);
    }
    if (s.roadmap) {
      const steps = slides.filter((x) => /^(paso|reto)-/.test(x.id));
      addMain(`<div class="roadmap"><span class="roadmap-label">Ruta</span><ol>${steps.map((x) => (
        `<li><button type="button" data-goto="${x.id}" title="${esc(x.title)}">${esc(x.badge)}</button></li>`
      )).join('')}</ol></div>`);
    }

    if (s.statement) {
      addMain(`<blockquote class="statement"><span class="statement-tag">Enunciado</span>${fmt(s.statement)}</blockquote>`);
    }
    if (s.concept) {
      addMain(`<div class="concept">${s.concept.map((c) => `
        <div class="concept-item">
          <span class="concept-tag">${esc(c.tag)}</span>
          <code class="concept-path">${esc(c.path)}</code>
          ${c.alt ? `<code class="concept-path concept-alt">${esc(c.alt)}</code>` : ''}
          <span class="concept-desc">${esc(c.desc)}</span>
        </div>`).join('')}</div>`);
    }
    if (s.checklist) {
      addMain(`<fieldset class="checklist"><legend>Lo que debe hacer tu programa</legend>${s.checklist.map((c, k) => `
        <label class="check"><input type="checkbox" data-check="${s.id}-${k}"><span class="check-box" aria-hidden="true"></span><span>${fmt(c)}</span></label>`).join('')}
      </fieldset>`);
      addMain(`<div class="challenge-actions">
        <button class="btn" type="button" data-action="hint">${icon('bulb')} Pedir pista a Bit</button>
        <button class="btn btn-ghost" type="button" data-action="solution" aria-expanded="false" aria-controls="sol-${s.id}">${icon('code')} <span>Mostrar solución</span></button>
      </div>`);
      const sol = fromHTML(`<div class="solution" id="sol-${s.id}" hidden></div>`);
      sol.appendChild(buildPanel(s.solution, view));
      addMain(sol);
    }

    if (s.panels) {
      const wrap = fromHTML('<div class="panels"></div>');
      s.panels.forEach((p) => wrap.appendChild(buildPanel(p, view)));
      addMain(wrap);
    }

    if (s.layout === 'end') {
      addMain(`<div class="recap">${s.recap.map((r) => `<code>${esc(r)}</code>`).join('')}</div>`);
      addMain(`<div class="next-steps"><h3>Para seguir aprendiendo</h3><ul>${s.next.map((n) => `<li>${fmt(n)}</li>`).join('')}</ul></div>`);
      addMain(`<div class="cover-actions">
        <a class="btn btn-primary" href="${s.link.href}" target="_blank" rel="noopener">${esc(s.link.text)} ${icon('ext')}</a>
        <button class="btn" type="button" data-go="0">${icon('restart')} Volver al inicio</button>
      </div>`);
    }

    // Columna lateral: escenario de three.js + notas.
    const stage = fromHTML(`<div class="stage" data-label="${esc(s.stageLabel || 'Sistema de archivos')}"><span class="stage-live" aria-hidden="true"></span></div>`);
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', `Animación: ${s.caption}`);
    view.stage = stage;
    addSide(stage);
    addSide(`<p class="stage-caption">${fmt(s.caption)}</p>`);
    if (s.sidePanels) {
      const wrap = fromHTML('<div class="panels"></div>');
      s.sidePanels.forEach((p) => wrap.appendChild(buildPanel(p, view)));
      addSide(wrap);
    }
    if (s.notes) {
      addSide(`<div class="notes"><h3>Claves</h3><ul>${s.notes.map((n) => `<li>${fmt(n)}</li>`).join('')}</ul></div>`);
    }
    if (s.api) {
      addSide(`<div class="api"><h3>Funciones usadas</h3><ul>${s.api.map((a) => `
        <li><button type="button" class="api-item" data-lines="${a.lines.join(',')}"><code>${esc(a.fn)}</code><span>${esc(a.desc)}</span></button></li>`).join('')}</ul></div>`);
    }

    inner.appendChild(main);
    inner.appendChild(side);
    el.appendChild(inner);
    deckEl.appendChild(el);
    return view;
  }

  const views = slides.map(build);

  /* ---------- Barra de progreso e índice ---------- */
  progressEl.innerHTML = slides.map((s, i) => (
    `<button class="seg" type="button" data-index="${i}" title="${pad(i + 1)} · ${esc(s.title)}" aria-label="Ir a la diapositiva ${i + 1}: ${esc(s.title)}"><span></span></button>`
  )).join('');
  const segs = Array.from(progressEl.children);

  ovGrid.innerHTML = slides.map((s, i) => `
    <button class="ov-card" type="button" data-index="${i}">
      <span class="ov-num">${pad(i + 1)}</span>
      <span class="ov-kicker">${fmt(s.kicker)}</span>
      <span class="ov-title">${esc(s.title)}</span>
    </button>`).join('');
  const ovCards = Array.from(ovGrid.children);

  /* ---------- Navegación ---------- */
  let cur = -1;
  let autoplayTimer = null;

  function go(target) {
    const i = Math.max(0, Math.min(N - 1, target));
    if (i === cur) return;
    const dir = cur < 0 ? 0 : (i > cur ? 1 : -1);
    const prev = views[cur];
    const next = views[i];

    if (prev) {
      prev.el.classList.remove('is-active');
      prev.el.classList.add(dir > 0 ? 'leave-left' : 'leave-right');
      prev.el.setAttribute('aria-hidden', 'true');
      prev.el.inert = true;
      prev.terminals.forEach((t) => t.reset());
      clearTimeout(prev.cleanup);
      prev.cleanup = setTimeout(() => {
        prev.el.classList.remove('leave-left', 'leave-right');
        if (views[cur] !== prev) prev.el.classList.remove('play');
      }, 750);
    }

    clearTimeout(next.cleanup);
    next.el.style.transition = 'none';
    next.el.classList.remove('leave-left', 'leave-right', 'play');
    next.el.style.setProperty('--from', `${dir * 48}px`);
    void next.el.offsetWidth;
    next.el.style.transition = '';
    next.el.classList.add('is-active', 'play');
    next.el.removeAttribute('aria-hidden');
    next.el.inert = false;
    next.el.scrollTop = 0;
    next.main.scrollTop = 0;
    cur = i;

    // Interfaz
    segs.forEach((sg, k) => {
      sg.classList.toggle('is-done', k < i);
      sg.classList.toggle('is-current', k === i);
      if (k === i) sg.setAttribute('aria-current', 'step'); else sg.removeAttribute('aria-current');
    });
    ovCards.forEach((c, k) => c.classList.toggle('is-current', k === i));
    counterEl.textContent = `${pad(i + 1)} / ${pad(N)}`;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === N - 1;
    announcer.textContent = `Diapositiva ${i + 1} de ${N}: ${next.slide.title}`;
    try { history.replaceState(null, '', `#${i + 1}`); } catch (e) { /* file:// en algunos navegadores */ }

    // Escena y avatar
    Deck.scene.setState(next.slide.stage);
    Deck.scene.setStageEl(next.stage);
    Deck.scene.pulse();
    Deck.avatar.setSlide(i, next.slide.hints);

    // Terminales: se ejecutan solas al entrar.
    clearTimeout(autoplayTimer);
    autoplayTimer = setTimeout(() => {
      if (views[cur] === next) next.terminals.forEach((t, k) => setTimeout(() => t.play(), k * 300));
    }, reduce ? 0 : 750);
  }

  const nextSlide = () => go(cur + 1);
  const prevSlide = () => go(cur - 1);

  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  progressEl.addEventListener('click', (e) => {
    const b = e.target.closest('.seg');
    if (b) go(Number(b.dataset.index));
  });

  /* ---------- Interacciones dentro de las diapositivas ---------- */
  function flashLine(lines) {
    const v = views[cur];
    if (!v) return;
    for (const ed of v.editors) {
      if (ed.root.closest('.solution[hidden]')) continue;
      if (ed.flash(lines)) return;
    }
  }
  Deck.avatar.onHint = flashLine;

  deckEl.addEventListener('click', (e) => {
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) { const g = goBtn.dataset.go; go(g === 'next' ? cur + 1 : Number(g)); return; }

    const gotoBtn = e.target.closest('[data-goto]');
    if (gotoBtn && ids[gotoBtn.dataset.goto] != null) { go(ids[gotoBtn.dataset.goto]); return; }

    const apiItem = e.target.closest('.api-item');
    if (apiItem) {
      views[cur].el.querySelectorAll('.api-item').forEach((b) => b.classList.toggle('is-on', b === apiItem));
      flashLine(apiItem.dataset.lines.split(',').map(Number));
      return;
    }

    const action = e.target.closest('[data-action]');
    if (!action) return;
    const a = action.dataset.action;
    if (a === 'index') openOverview();
    else if (a === 'hint') Deck.avatar.hint();
    else if (a === 'solution') {
      const sol = document.getElementById(action.getAttribute('aria-controls'));
      const show = sol.hidden;
      sol.hidden = !show;
      action.setAttribute('aria-expanded', String(show));
      action.querySelector('span').textContent = show ? 'Ocultar solución' : 'Mostrar solución';
      if (show) {
        sol.classList.remove('is-in');
        void sol.offsetWidth;
        sol.classList.add('is-in');
        sol.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
        Deck.avatar.say('¡Ojo! Intenta resolverlo primero; la solución es solo una de muchas posibles.', { autoHide: 5000 });
      }
    }
  });

  deckEl.addEventListener('change', (e) => {
    const box = e.target.closest('.checklist input');
    if (!box) return;
    const list = box.closest('.checklist');
    const all = Array.from(list.querySelectorAll('input'));
    if (box.checked && all.every((x) => x.checked)) {
      Deck.scene.confetti();
      Deck.avatar.say('¡Reto completado! 🎉 Ejecútalo con `node` y revisa que todo funcione.', { name: '¡Bravo!', autoHide: 6000 });
    }
  });

  // Fase del ciclo CRUD sincronizada con la animación (o con un temporizador si no hay WebGL).
  function setPhase(p) {
    document.querySelectorAll('.crud-card').forEach((c) => c.classList.toggle('is-on', Number(c.dataset.phase) === p));
  }
  Deck.scene.on('phase', setPhase);
  let fallbackPhase = 0;
  setInterval(() => {
    if (Deck.scene.ready) return;
    fallbackPhase = (fallbackPhase + 1) % 4;
    setPhase(fallbackPhase);
  }, 2600);

  /* ---------- Índice ---------- */
  let ovOpen = false;
  let ovReturn = null;
  function openOverview() {
    if (ovOpen) return;
    ovOpen = true;
    ovReturn = document.activeElement;
    overview.classList.add('is-open');
    overview.setAttribute('aria-hidden', 'false');
    setTimeout(() => (ovCards[cur] || ovCards[0]).focus(), 60);
  }
  function closeOverview() {
    if (!ovOpen) return;
    ovOpen = false;
    overview.classList.remove('is-open');
    overview.setAttribute('aria-hidden', 'true');
    if (ovReturn && ovReturn.focus) ovReturn.focus();
  }
  indexBtn.addEventListener('click', openOverview);
  ovClose.addEventListener('click', closeOverview);
  overview.addEventListener('click', (e) => {
    const card = e.target.closest('.ov-card');
    if (card) { closeOverview(); go(Number(card.dataset.index)); return; }
    if (e.target === overview) closeOverview();
  });
  overview.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = [ovClose].concat(ovCards);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- Tema, pantalla completa y avisos ---------- */
  function toggleTheme(ev) {
    // El destino se fija antes: si la transición se demora, el respaldo y la transición aplican el mismo tema.
    const target = Deck.theme.get() === 'dark' ? 'light' : 'dark';
    const swap = () => {
      if (Deck.theme.get() !== target) Deck.theme.set(target);
      Deck.scene.renderNow();
    };
    if (!document.startViewTransition || reduce) { swap(); return; }
    setTimeout(swap, 700);
    const r = themeBtn.getBoundingClientRect();
    const x = ev && ev.clientX ? ev.clientX : r.left + r.width / 2;
    const y = ev && ev.clientY ? ev.clientY : r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(swap);
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
  }
  themeBtn.addEventListener('click', toggleTheme);

  function toggleFull() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  fullBtn.addEventListener('click', toggleFull);
  if (!document.documentElement.requestFullscreen) fullBtn.hidden = true;

  let toastTimer = null;
  Deck.toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 1800);
  };

  /* ---------- Teclado ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    const tag = (t.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || t.isContentEditable) return;
    if (ovOpen) {
      if (e.key === 'Escape' || e.key === 'o' || e.key === 'O') { e.preventDefault(); closeOverview(); }
      return;
    }
    const inScroller = t.closest && t.closest('.ed-body, .tm-body');
    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
        if (inScroller && e.key === 'ArrowRight') return;
        nextSlide(); break;
      case 'ArrowLeft':
      case 'PageUp':
        if (inScroller && e.key === 'ArrowLeft') return;
        prevSlide(); break;
      case ' ':
        if (tag === 'button' || tag === 'a') return;
        if (e.shiftKey) prevSlide(); else nextSlide();
        break;
      case 'Home': go(0); break;
      case 'End': go(N - 1); break;
      case 'o': case 'O': openOverview(); break;
      case 't': case 'T': toggleTheme(); break;
      case 'f': case 'F': toggleFull(); break;
      case 'h': case 'H': case '?': Deck.avatar.hint(); break;
      case 'Escape': Deck.avatar.hide(); return;
      default: return;
    }
    e.preventDefault();
  });

  /* ---------- Gestos táctiles ---------- */
  let touch = null;
  deckEl.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || e.target.closest('.ed-body, .tm-body')) { touch = null; return; }
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  deckEl.addEventListener('touchend', (e) => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x;
    const dy = e.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) { if (dx < 0) nextSlide(); else prevSlide(); }
  }, { passive: true });

  /* ---------- Inicio ---------- */
  function fromHash() {
    const n = parseInt((location.hash || '').replace('#', ''), 10);
    return Number.isFinite(n) ? n - 1 : 0;
  }
  window.addEventListener('hashchange', () => go(fromHash()));
  go(fromHash());

  setTimeout(() => {
    if (cur === 0) {
      Deck.avatar.say('¡Hola! Soy Bit 👋 Haz clic en mí cuando quieras una pista sobre el código.', { autoHide: 6500 });
    }
  }, 1400);
})(window.Deck);
