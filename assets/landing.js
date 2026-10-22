/* Landing de las clases de Node.js: fondo animado, robot, tema, enlaces al repositorio y animaciones de entrada. */
(function () {
  'use strict';

  /* Si el sitio no se publica en GitHub Pages, escribe aquí la URL del repositorio
     (por ejemplo 'https://github.com/usuario/repositorio') para que los enlaces "Código" apunten a GitHub.
     Si lo dejas vacío, en GitHub Pages se deduce sola; en cualquier otro lugar los enlaces apuntan a las carpetas locales. */
  var REPO_URL = '';

  var root = document.documentElement;
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var L = window.Landing = window.Landing || {};
  L.pointer = { x: 0, y: 0 };

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function css(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  /* ---------- Enlaces al repositorio ---------- */
  function repoUrl() {
    if (REPO_URL) return REPO_URL.replace(/\/+$/, '');
    var host = /^([^.]+)\.github\.io$/i.exec(location.hostname);
    if (!host) return '';
    var seg = location.pathname.split('/')[1];
    var repo = seg && seg.indexOf('.') < 0 ? seg : location.hostname;
    return 'https://github.com/' + host[1] + '/' + repo;
  }

  function wireRepoLinks() {
    var base = repoUrl();
    if (!base) return;
    $$('[data-code]').forEach(function (a) {
      a.href = base + '/tree/HEAD/' + a.getAttribute('data-code');
    });
    $$('[data-repo]').forEach(function (a) {
      a.href = base;
      a.hidden = false;
    });
  }

  /* ---------- Totales del hero (se recalculan al agregar tarjetas) ---------- */
  function totals() {
    var cards = $$('.card');
    var slides = cards.reduce(function (n, c) { return n + (parseInt(c.getAttribute('data-slides'), 10) || 0); }, 0);
    var a = $('#statClasses'), b = $('#statSlides');
    if (a) a.textContent = cards.length;
    if (b) b.textContent = slides;
  }

  /* ---------- Fondo: símbolos de código, cuadrícula de puntos y un anillo de pulso (canvas 2D) ---------- */
  function startScene() {
    var cv = $('#bg');
    var ctx = cv && cv.getContext && cv.getContext('2d');
    if (!ctx) return;

    var GL = ['{', '}', '(', ')', ';', '=>', '</>', '[ ]', '0', '1', '$', '>_', '"', '=', '+', '//', '*', '&&'];
    var ACCENTS = {
      dark: ['#3b9eff', '#50e3c2', '#ff6bb5'],
      light: ['#0068d6', '#128a4a', '#d6336c']
    };
    var W = 0, H = 0, dpr = 1, grid = null, sprites = [];
    var ringT = 1, t = 0, last = 0, sx = 0, sy = 0, raf = 0, ink = '#fff', strength = 1;

    function palette() {
      return ACCENTS[root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'];
    }

    /* Lee del CSS los colores del tema actual. */
    function readTheme() {
      ink = css('--scene-ink') || '#fff';
      strength = parseFloat(css('--scene-strength')) || 1;
    }

    function build() {
      var n = Math.round(Math.min(60, Math.max(22, W * H / 26000)));
      sprites = [];
      for (var i = 0; i < n; i++) {
        var d = .25 + Math.random() * .75;
        sprites.push({
          g: GL[i % GL.length], d: d, size: (34 + d * 46) * .5,
          // 3 de cada 6 símbolos son del color de la tinta; el resto, acentos
          c: Math.floor(Math.random() * 6),
          x: (Math.random() - .5) * W, y: (Math.random() - .5) * H,
          v: 6 + Math.random() * 14, ph: Math.random() * 6.28,
          kx: 0, ky: 0, rot: (Math.random() - .5) * .3, base: .05 + d * .11
        });
      }
    }

    function dots() {
      var gap = 40, m = 24;
      grid = document.createElement('canvas');
      grid.width = (W + m * 2) * dpr;
      grid.height = (H + m * 2) * dpr;
      var g = grid.getContext('2d');
      g.scale(dpr, dpr);
      g.fillStyle = css('--scene-dot');
      for (var x = gap / 2; x < W + m * 2; x += gap) {
        for (var y = gap / 2; y < H + m * 2; y += gap) g.fillRect(x - 1, y - 1, 2, 2);
      }
    }

    /* Da un empujón a todos los símbolos y lanza la onda. */
    L.kick = function (s) {
      if (REDUCED) return;
      sprites.forEach(function (p) {
        var a = Math.random() * 6.28, f = (120 + Math.random() * 220) * s * p.d;
        p.kx += Math.cos(a) * f; p.ky += Math.sin(a) * f;
      });
      ringT = 0;
    };

    function draw() {
      var pal = palette();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (grid) ctx.drawImage(grid, -24 - sx * 14, -24 - sy * 14, W + 48, H + 48);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      sprites.forEach(function (p) {
        var speed = Math.min(1, (Math.abs(p.kx) + Math.abs(p.ky)) / 200);
        ctx.save();
        ctx.translate(W / 2 + p.x - sx * 60 * p.d, H / 2 - p.y - sy * 60 * p.d);
        ctx.rotate(Math.sin(t * .5 + p.ph) * p.rot);
        ctx.globalAlpha = Math.min(1, (p.base + speed * .25) * strength);
        ctx.fillStyle = p.c < 3 ? ink : pal[p.c - 3];
        ctx.font = '500 ' + p.size + 'px "Geist Mono", ui-monospace, monospace';
        ctx.fillText(p.g, 0, 0);
        ctx.restore();
      });

      if (ringT < 1) {
        var e = 1 - Math.pow(1 - Math.min(ringT, 1), 3), r = e * Math.max(W, H) * .62;
        ctx.globalAlpha = .4 * (1 - e);
        ctx.strokeStyle = pal[0];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, Math.max(r, .1), 0, 6.2832);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    function frame(now) {
      var dt = Math.min(.05, (now - last) / 1000 || 0);
      last = now;
      t += dt;
      sx += (L.pointer.x - sx) * .04;
      sy += (L.pointer.y - sy) * .04;
      sprites.forEach(function (p) {
        // p.y crece hacia arriba: los símbolos suben y reaparecen abajo
        p.y += p.v * p.d * dt;
        p.x += Math.sin(t * .4 + p.ph) * 8 * dt + p.kx * dt;
        p.y += p.ky * dt;
        var f = Math.pow(.02, dt); p.kx *= f; p.ky *= f;
        if (p.y > H / 2 + 60) { p.y = -H / 2 - 60; p.x = (Math.random() - .5) * W; }
        if (p.x > W / 2 + 60) p.x = -W / 2 - 60;
        if (p.x < -W / 2 - 60) p.x = W / 2 + 60;
      });
      if (ringT < 1) ringT += dt / 1.4;
      draw();
      raf = requestAnimationFrame(frame);
    }

    function size() {
      W = window.innerWidth; H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      build(); dots();
      if (REDUCED) draw();
    }

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(size, 120);
    });
    document.addEventListener('themechange', function () {
      readTheme();
      dots();
      if (REDUCED) draw();
    });

    readTheme();
    size();
    if (!REDUCED) raf = requestAnimationFrame(frame);
  }

  /* ---------- Robot: sigue el puntero y reacciona al clic ---------- */
  function startAvatar() {
    var btn = $('#avatarBtn'), av = $('#avatar'), eyes = $('#eyes'), bubble = $('#bubble');
    if (!btn || !av) return;

    var MSGS = [
      '¡Hola! Elige una clase y empezamos.',
      'Cada clase tiene su presentación y su código.',
      'Las presentaciones se navegan con las flechas ← →.',
      'Pulsa T para cambiar entre tema claro y oscuro.',
      '¡Tú puedes! Un paso a la vez.'
    ];
    var n = 0, partyTimer = 0;

    function say(text) {
      bubble.textContent = text;
      bubble.classList.remove('pop');
      void bubble.offsetWidth; // reinicia la animación
      bubble.classList.add('pop');
    }

    btn.addEventListener('click', function () {
      n = (n + 1) % MSGS.length;
      say(MSGS[n]);
      av.setAttribute('data-mood', 'party');
      clearTimeout(partyTimer);
      partyTimer = setTimeout(function () { av.setAttribute('data-mood', 'happy'); }, 1400);
      if (L.kick) L.kick(1);
    });

    if (!REDUCED && eyes) {
      document.addEventListener('pointermove', function (e) {
        var r = av.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        var len = Math.hypot(dx, dy) || 1, k = Math.min(1, len / 240) * 6;
        eyes.style.transform = 'translate(' + (dx / len * k).toFixed(1) + 'px,' + (dy / len * k).toFixed(1) + 'px)';
      });
    }
  }

  /* ---------- Tema ---------- */
  function startTheme() {
    var btn = $('#themeBtn');
    if (!btn || !L.theme) return;
    function toggle() {
      L.theme.toggle();
      btn.classList.remove('is-spinning');
      void btn.offsetWidth;
      btn.classList.add('is-spinning');
    }
    btn.addEventListener('click', toggle);
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (e.target && e.target.tagName) || '';
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (e.target && e.target.isContentEditable)) return;
      if (e.key === 't' || e.key === 'T') toggle();
    });
  }

  /* ---------- Barra de progreso y barra superior ---------- */
  function startScroll() {
    var prog = $('#prog'), top = $('#topbar'), ticking = false;
    function update() {
      ticking = false;
      var max = root.scrollHeight - window.innerHeight;
      if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      if (top) top.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Tarjetas: aparecen al entrar en pantalla y el resplandor sigue al puntero ---------- */
  function startCards() {
    var cards = $$('.card');
    cards.forEach(function (card, i) {
      card.style.setProperty('--i', i % 3);
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Arranque ---------- */
  document.addEventListener('pointermove', function (e) {
    L.pointer.x = e.clientX / window.innerWidth - .5;
    L.pointer.y = e.clientY / window.innerHeight - .5;
  }, { passive: true });

  wireRepoLinks();
  totals();
  startTheme();
  startScroll();
  startCards();
  startAvatar();
  startScene();
  if (L.kick) setTimeout(function () { L.kick(.6); }, 500);
})();
