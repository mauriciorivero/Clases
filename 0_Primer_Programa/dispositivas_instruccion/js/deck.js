/* Controlador de la presentación: construye las diapositivas, navegación, avatar y el simulador del paso 9. */
(function (App) {
  'use strict';
  var $ = App.$, SL = App.SLIDES, GROUPS = App.GROUPS;
  var host = $('#slides'), dotsEl = $('#dots'), avatar = $('#avatar'), bubble = $('#bubble'), deck = $('#deck');
  var els = [], cur = -1, group = 0;

  /* ---- construir DOM ---- */
  SL.forEach(function (s, i) {
    var sec = document.createElement('section');
    sec.className = 'slide';
    sec.setAttribute('aria-label', 'Diapositiva ' + (i + 1));
    sec.innerHTML = s.html;
    host.appendChild(sec); els.push(sec);
    var b = document.createElement('button');
    b.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
    b.innerHTML = '<i></i>';
    b.addEventListener('click', function () { go(i); });
    dotsEl.appendChild(b);
  });

  /* ---- simulador del paso 9: misma lógica que src/index.js ---- */
  function sim(args) {
    var min = 1, max = 100, out = [];
    if (args.length >= 2) {
      var a = parseInt(args[0], 10), b = parseInt(args[1], 10);
      if (!isNaN(a) && !isNaN(b) && a < b) { min = a; max = b; }
      else out.push({ o: 'rango inválido: usando valores por defecto del 1 al 100.', k: 'err' });
    }
    var n = Math.floor(Math.random() * (max - min + 1)) + min;
    out.push({ o: 'número aleatorio generado entre ' + min + ' y ' + max + ': ' + n, k: 'ok', wait: 200 });
    return out;
  }
  function runPlay() {
    var box = $('.term', els[cur]);
    var args = [$('#inMin').value.trim(), $('#inMax').value.trim()].filter(function (x) { return x !== ''; });
    var lines = [{ c: ('node src/index.js ' + args.join(' ')).trim(), fast: true, wait: 120 }].concat(sim(args));
    App.playTerm(box, lines);
    if (App.kick) App.kick(.8);
  }

  /* ---- paso 8: bloques de código ---- */
  function setGroup(g) {
    group = Math.max(0, Math.min(GROUPS.length - 1, g));
    var el = els[cur], G = GROUPS[group];
    el.querySelectorAll('.cl').forEach(function (l) {
      var n = +l.dataset.n, on = n >= G.l[0] && n <= G.l[1];
      l.classList.toggle('on', on); l.classList.toggle('dim', !on);
    });
    el.querySelectorAll('[data-g]').forEach(function (b) { b.setAttribute('aria-current', String(+b.dataset.g === group)); });
    var ex = $('#explain', el);
    ex.innerHTML = '<b>' + G.t + '</b>' + G.d;
    ex.classList.remove('flip'); void ex.offsetWidth; ex.classList.add('flip');
  }

  /* ---- navegación ---- */
  function enter(i) {
    var s = SL[i];
    if (s.term) App.playTerm($('.term', els[i]), s.term, s.idle);
    if (s.groups) setGroup(0);
    if (s.play) runPlay();
  }
  function go(n) {
    n = Math.max(0, Math.min(SL.length - 1, n));
    if (n === cur) return;
    var old = cur >= 0 ? els[cur] : null;
    if (old) { old.classList.add('out'); setTimeout(function () { old.classList.remove('active', 'out'); }, 220); }
    cur = n; els[n].classList.add('active'); els[n].scrollTop = 0;
    deck.classList.toggle('is-title', n === 0);
    avatar.dataset.mood = SL[n].mood;
    bubble.textContent = SL[n].bubble || '';
    bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    $('#count').textContent = String(n + 1).padStart(2, '0') + ' / ' + String(SL.length).padStart(2, '0');
    $('#prog').style.transform = 'scaleX(' + (n / (SL.length - 1)) + ')';
    dotsEl.querySelectorAll('button').forEach(function (b, j) { b.setAttribute('aria-current', String(j === n)); });
    $('#prev').disabled = n === 0; $('#next').disabled = n === SL.length - 1;
    try { history.replaceState(null, '', '#' + (n + 1)); } catch (e) {}
    if (App.kick) App.kick(SL[n].kick ? 1.2 : .6);
    enter(n);
  }
  function next() { if (SL[cur].groups && group < GROUPS.length - 1) { setGroup(group + 1); return; } go(cur + 1); }
  function prev() { if (SL[cur].groups && group > 0) { setGroup(group - 1); return; } go(cur - 1); }

  $('#next').addEventListener('click', next);
  $('#prev').addEventListener('click', prev);

  document.addEventListener('keydown', function (e) {
    if (e.target.matches && e.target.matches('input,textarea')) { if (e.key === 'Enter' && SL[cur].play) runPlay(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.target.closest('button'))) { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'ArrowDown' && SL[cur].groups) { e.preventDefault(); setGroup(group + 1); }
    else if (e.key === 'ArrowUp' && SL[cur].groups) { e.preventDefault(); setGroup(group - 1); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(SL.length - 1);
  });

  var tx = 0, ty = 0;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 50) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  host.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.hasAttribute('data-next')) next();
    else if (t.hasAttribute('data-restart')) go(0);
    else if (t.dataset.g !== undefined) setGroup(+t.dataset.g);
    else if (t.id === 'run') runPlay();
    else if (t.dataset.a !== undefined) { var p = t.dataset.a.split('|'); $('#inMin').value = p[0]; $('#inMax').value = p[1]; runPlay(); }
    else if (t.dataset.copy !== undefined) {
      var lbl = t.textContent;
      var done = function (m) { t.textContent = m; setTimeout(function () { t.textContent = lbl; }, 1400); };
      try { navigator.clipboard.writeText(t.dataset.copy).then(function () { done('Copiado'); }, function () { done('Selecciona y copia'); }); }
      catch (err) { done('Selecciona y copia'); }
    }
  });

  /* ---- avatar: los ojos siguen al puntero y la escena hace parallax ---- */
  document.addEventListener('mousemove', function (e) {
    var r = avatar.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .4;
    var dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 400)), dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 400));
    if (avatar.dataset.mood !== 'think') $('#eyes').style.transform = 'translate(' + (dx * 5).toFixed(1) + 'px,' + (dy * 4).toFixed(1) + 'px)';
    App.pointer.x = e.clientX / innerWidth - .5; App.pointer.y = e.clientY / innerHeight - .5;
  });

  /* ---- arranque ---- */
  var start = parseInt((location.hash || '').replace('#', ''), 10);
  go(isNaN(start) ? 0 : start - 1);
  function boot() { App.startScene(); }
  if (document.fonts && document.fonts.load) {
    Promise.race([document.fonts.load('500 64px "Geist Mono"'), new Promise(function (r) { setTimeout(r, 1500); })]).then(boot, boot);
  } else boot();
})(window.App);
