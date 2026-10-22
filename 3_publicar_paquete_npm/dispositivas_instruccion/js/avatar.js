/*
 * Bit: el avatar de código.
 * - Sigue el puntero con los ojos, parpadea y flota.
 * - Con cada clic rebota, lanza símbolos de código y muestra la siguiente pista de la diapositiva.
 * - Si recibe demasiados clics seguidos… se marea.
 */
window.Avatar = (function () {
  var el = {};
  var opts = {};
  var state = {
    slide: null,
    index: -1,
    hintIndex: -1,
    opened: {},          // diapositivas cuyas pistas ya se abrieron
    clicks: [],
    typing: null,
    closeTimer: null,
    moodTimer: null,
    lookTimer: null,
    lookOverride: null,
    dizzy: false
  };
  var GLYPHS = ['{ }', '</>', '( )', ';', '=>', '[ ]', '$', '#', '&&', '//'];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(options) {
    opts = options || {};
    el.buddy = document.getElementById('buddy');
    el.avatar = document.getElementById('avatar');
    el.eyes = el.avatar.querySelector('.av-eyes');
    el.bubble = document.getElementById('bubble');
    el.text = document.getElementById('bubbleText');
    el.count = document.getElementById('bubbleCount');
    el.lines = document.getElementById('bubbleLines');
    el.next = document.getElementById('bubbleNext');
    el.close = document.getElementById('bubbleClose');

    el.avatar.addEventListener('click', onAvatarClick);
    el.next.addEventListener('click', function () { bounce(); nextHint(); });
    el.close.addEventListener('click', function () { close(); });
    el.text.addEventListener('click', finishTyping);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    scheduleBlink();
  }

  /* ---------- Interacción ---------- */
  function onAvatarClick() {
    var now = performance.now();
    state.clicks = state.clicks.filter(function (t) { return now - t < 1800; });
    state.clicks.push(now);

    if (state.dizzy) return;
    if (state.clicks.length >= 6) {
      state.clicks = [];
      getDizzy();
      return;
    }
    bounce();
    sparkle();
    nextHint();
  }

  function getDizzy() {
    state.dizzy = true;
    setMood('dizzy', 2200);
    say('¡Uy, uy! Demasiados clics seguidos… 😵‍💫 Dame un segundito para compilar mis ideas.', { count: '', showNext: false });
    setTimeout(function () { state.dizzy = false; }, 2200);
  }

  function nextHint() {
    var hints = (state.slide && state.slide.hints) || [];
    if (!hints.length) {
      say('Aquí no tengo pistas, ¡pero sigue avanzando! 🚀');
      return;
    }
    state.hintIndex = (state.hintIndex + 1) % hints.length;
    state.opened[state.index] = true;
    el.buddy.classList.remove('has-unread');

    var hint = hints[state.hintIndex];
    var linesLabel = '';
    if (hint.lines) linesLabel = (/[-,]/.test(hint.lines) ? 'Líneas ' : 'Línea ') + hint.lines.replace(/-/g, '–').replace(/,/g, ', ');

    setMood('happy', 900);
    say(hint.text, {
      count: 'Pista ' + (state.hintIndex + 1) + '/' + hints.length,
      lines: linesLabel,
      showNext: hints.length > 1
    });
    if (opts.onHint) opts.onHint(hint, state.index);
  }

  /* ---------- Globo de diálogo ---------- */
  function say(text, o) {
    o = o || {};
    clearTimeout(state.closeTimer);
    el.bubble.classList.remove('is-closing');
    if (el.bubble.hidden) {
      el.bubble.hidden = false;
    } else {
      // Reinicia la animación de entrada para dar sensación de "nuevo mensaje"
      el.bubble.style.animation = 'none';
      void el.bubble.offsetWidth;
      el.bubble.style.animation = '';
    }
    el.count.textContent = o.count || '';
    el.lines.textContent = o.lines ? '▍' + o.lines + ' resaltada' + (/^Líneas/.test(o.lines) ? 's' : '') : '';
    el.next.hidden = !o.showNext;
    typeText(text);
    if (o.autoclose) state.closeTimer = setTimeout(close, o.autoclose);
  }

  function typeText(text) {
    finishTyping();
    el.text.innerHTML = window.Highlighter.inline(text);
    if (reduceMotion) return;

    // Recolecta los nodos de texto y los vacía para "escribirlos" carácter a carácter
    var walker = document.createTreeWalker(el.text, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) {
      nodes.push({ node: walker.currentNode, full: walker.currentNode.nodeValue });
      walker.currentNode.nodeValue = '';
    }
    var n = 0;
    var pos = 0;
    el.text.classList.add('is-typing');
    el.avatar.classList.add('is-talking');
    state.typing = setInterval(function () {
      for (var k = 0; k < 2; k++) {
        if (n >= nodes.length) { finishTyping(); return; }
        var item = nodes[n];
        pos++;
        item.node.nodeValue = item.full.slice(0, pos);
        if (pos >= item.full.length) { n++; pos = 0; }
      }
    }, 18);
    state.typingNodes = nodes;
  }

  function finishTyping() {
    if (state.typing) {
      clearInterval(state.typing);
      state.typing = null;
      (state.typingNodes || []).forEach(function (item) { item.node.nodeValue = item.full; });
    }
    el.text.classList.remove('is-typing');
    el.avatar.classList.remove('is-talking');
  }

  function close(silent) {
    clearTimeout(state.closeTimer);
    finishTyping();
    if (!el.bubble.hidden) {
      if (silent || reduceMotion) {
        el.bubble.hidden = true;
      } else {
        el.bubble.classList.add('is-closing');
        setTimeout(function () {
          el.bubble.hidden = true;
          el.bubble.classList.remove('is-closing');
        }, 220);
      }
    }
    if (opts.onClose) opts.onClose();
  }

  function isOpen() { return !el.bubble.hidden; }

  /* ---------- Expresiones ---------- */
  function setMood(mood, ms) {
    clearTimeout(state.moodTimer);
    el.avatar.classList.remove('is-happy', 'is-dizzy');
    if (mood) el.avatar.classList.add('is-' + mood);
    if (ms) state.moodTimer = setTimeout(function () { el.avatar.classList.remove('is-' + mood); }, ms);
  }

  function bounce() {
    el.avatar.classList.remove('is-bounce');
    void el.avatar.offsetWidth;
    el.avatar.classList.add('is-bounce');
    setTimeout(function () { el.avatar.classList.remove('is-bounce'); }, 720);
  }

  function center() {
    var r = el.avatar.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.42 };
  }

  /** Lanza símbolos de código (DOM) y partículas en la escena three.js. */
  function sparkle(count) {
    var c = center();
    if (window.Stage && window.Stage.burst) window.Stage.burst(c.x, c.y, { count: 22 });
    if (reduceMotion) return;
    count = count || 5;
    for (var i = 0; i < count; i++) {
      var g = document.createElement('span');
      g.className = 'spark-glyph';
      g.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      var ang = (-160 + Math.random() * 140) * Math.PI / 180;
      var dist = 60 + Math.random() * 60;
      g.style.left = (c.x - 10) + 'px';
      g.style.top = (c.y - 10) + 'px';
      g.style.setProperty('--gx', Math.cos(ang) * dist + 'px');
      g.style.setProperty('--gy', Math.sin(ang) * dist + 'px');
      g.style.setProperty('--gr', (Math.random() * 60 - 30) + 'deg');
      g.style.animationDelay = (i * 40) + 'ms';
      document.body.appendChild(g);
      g.addEventListener('animationend', function () { this.remove(); });
    }
  }

  function celebrate(message) {
    setMood('happy', 2600);
    bounce();
    sparkle(9);
    setTimeout(bounce, 760);
    if (message) say(message, { autoclose: 6500 });
  }

  /* ---------- Ojos ---------- */
  function onPointerMove(e) {
    if (state.lookOverride) return;
    lookTowards(e.clientX, e.clientY);
  }

  function lookTowards(x, y) {
    var c = center();
    var dx = x - c.x;
    var dy = y - c.y;
    var d = Math.sqrt(dx * dx + dy * dy) || 1;
    var k = Math.min(1, d / 220);
    el.eyes.style.transform = 'translate(' + (dx / d * 4 * k).toFixed(2) + 'px,' + (dy / d * 3 * k).toFixed(2) + 'px)';
  }

  /** Mira hacia el contenido de la diapositiva por un momento. */
  function glanceAtSlide() {
    clearTimeout(state.lookTimer);
    state.lookOverride = true;
    el.eyes.style.transform = 'translate(-4px,-1.5px)';
    state.lookTimer = setTimeout(function () { state.lookOverride = null; }, 1300);
  }

  function scheduleBlink() {
    setTimeout(function () {
      blink();
      if (Math.random() < 0.25) setTimeout(blink, 220);
      scheduleBlink();
    }, 2400 + Math.random() * 3600);
  }

  function blink() {
    el.avatar.classList.add('is-blink');
    setTimeout(function () { el.avatar.classList.remove('is-blink'); }, 120);
  }

  /* ---------- Cambio de diapositiva ---------- */
  function setSlide(slide, index) {
    state.slide = slide;
    state.index = index;
    state.hintIndex = -1;
    close(true);
    el.buddy.classList.toggle('has-unread', !!(slide.hints && slide.hints.length) && !state.opened[index]);
    glanceAtSlide();
  }

  return {
    init: init,
    setSlide: setSlide,
    nextHint: function () { bounce(); sparkle(); nextHint(); },
    say: say,
    close: close,
    isOpen: isOpen,
    react: function (mood, ms) { setMood(mood, ms || 1200); bounce(); },
    celebrate: celebrate
  };
})();
