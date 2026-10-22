/* Bit: el avatar de código que da pistas al hacerle clic. */
window.Deck = window.Deck || {};
(function (Deck) {
  'use strict';

  const root = document.getElementById('bit');
  const btn = document.getElementById('bit-btn');
  const bubble = document.getElementById('bit-bubble');
  const textEl = bubble.querySelector('.bb-text');
  const countEl = bubble.querySelector('.bb-count');
  const nameEl = bubble.querySelector('.bb-name');
  const nextBtn = bubble.querySelector('.bb-next');
  const closeBtn = bubble.querySelector('.bb-close');
  const face = root.querySelector('.bit-face');
  const announcer = document.getElementById('announcer');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const IDLE_LINES = [
    'Aquí no tengo pistas, ¡pero sigue así! 💪',
    'Psst… las flechas ← → te llevan entre diapositivas.',
    '¿Sabías que puedes copiar cualquier bloque de código con el botón Copiar?',
  ];

  let hints = [];
  let idx = -1;
  let typingToken = 0;
  let hideTimer = null;
  let nudgeTimer = null;
  let open = false;

  const api = {
    onHint: null,
    setSlide,
    hint,
    say,
    hide,
  };
  Deck.avatar = api;

  /* ---------- Gestos ---------- */
  function setMood(m) { root.dataset.mood = m; }

  function restartClass(cls) {
    root.classList.remove(cls);
    void root.offsetWidth;
    root.classList.add(cls);
  }

  function sparks() {
    if (reduce) return;
    const glyphs = ['{ }', '✦', ';', '</>', '✦', '()'];
    for (let i = 0; i < 5; i++) {
      const s = document.createElement('span');
      s.className = 'bit-spark';
      s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      s.style.setProperty('--dx', `${(Math.random() - 0.5) * 110}px`);
      s.style.setProperty('--dy', `${-50 - Math.random() * 50}px`);
      s.style.setProperty('--rot', `${(Math.random() - 0.5) * 60}deg`);
      s.style.animationDelay = `${i * 40}ms`;
      root.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    }
  }

  root.addEventListener('animationend', (e) => {
    if (e.animationName === 'bit-jump') root.classList.remove('is-jumping');
    if (e.animationName === 'bit-nudge') root.classList.remove('is-nudge');
  });

  /* ---------- Burbuja de texto ---------- */
  function segments(text) {
    return text.split(/(`[^`]+`)/).filter(Boolean).map((s) => (
      s.length > 1 && s[0] === '`' && s[s.length - 1] === '`' ? { code: true, t: s.slice(1, -1) } : { code: false, t: s }
    ));
  }

  async function typeText(text) {
    const my = ++typingToken;
    textEl.textContent = '';
    root.classList.add('is-talking');
    for (const seg of segments(text)) {
      const node = seg.code ? document.createElement('code') : document.createTextNode('');
      textEl.appendChild(node);
      const chars = Array.from(seg.t);
      for (let i = 0; i < chars.length; i += 2) {
        if (my !== typingToken) return;
        const chunk = chars.slice(i, i + 2).join('');
        if (seg.code) node.textContent += chunk; else node.data += chunk;
        if (!reduce) await wait(16);
      }
    }
    if (my === typingToken) root.classList.remove('is-talking');
  }

  function say(text, opts) {
    opts = opts || {};
    clearTimeout(hideTimer);
    nameEl.textContent = opts.name || 'Bit';
    countEl.textContent = opts.count || '';
    nextBtn.hidden = !opts.next;
    bubble.classList.add('is-open');
    bubble.setAttribute('aria-hidden', 'false');
    open = true;
    if (announcer) announcer.textContent = text.replace(/`/g, '');
    typeText(text);
    if (opts.autoHide) hideTimer = setTimeout(hide, opts.autoHide);
  }

  function hide() {
    clearTimeout(hideTimer);
    typingToken++;
    root.classList.remove('is-talking');
    bubble.classList.remove('is-open');
    bubble.setAttribute('aria-hidden', 'true');
    open = false;
    setMood('happy');
  }

  function hint() {
    clearTimeout(nudgeTimer);
    root.classList.remove('has-unseen');
    restartClass('is-jumping');
    sparks();
    if (!hints.length) {
      setMood('wow');
      say(IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)], { autoHide: 5000 });
      return;
    }
    idx = (idx + 1) % hints.length;
    const h = hints[idx];
    const text = typeof h === 'string' ? h : h.t;
    setMood(idx % 2 ? 'think' : 'wow');
    setTimeout(() => setMood('happy'), 900);
    say(text, { count: `Pista ${idx + 1}/${hints.length}`, next: hints.length > 1 });
    if (h.line && api.onHint) api.onHint(h.line);
  }

  function setSlide(i, list) {
    hints = list || [];
    idx = -1;
    if (open) hide();
    root.classList.toggle('has-unseen', hints.length > 0);
    clearTimeout(nudgeTimer);
    if (hints.length && !reduce) nudgeTimer = setTimeout(() => restartClass('is-nudge'), 12000);
  }

  btn.addEventListener('click', hint);
  nextBtn.addEventListener('click', hint);
  closeBtn.addEventListener('click', hide);

  /* ---------- Ojos que siguen al puntero y parpadeo ---------- */
  let tx = 0; let ty = 0; let ex = 0; let ey = 0;
  window.addEventListener('pointermove', (e) => {
    const r = btn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * 0.45);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 260);
    tx = (dx / d) * 4 * k;
    ty = (dy / d) * 3 * k;
  }, { passive: true });

  function look() {
    ex += (tx - ex) * 0.15;
    ey += (ty - ey) * 0.15;
    face.setAttribute('transform', `translate(${ex.toFixed(2)} ${ey.toFixed(2)})`);
    requestAnimationFrame(look);
  }
  if (!reduce) requestAnimationFrame(look);

  function blink() {
    root.classList.add('is-blink');
    setTimeout(() => root.classList.remove('is-blink'), 150);
    setTimeout(blink, 2400 + Math.random() * 3200);
  }
  setTimeout(blink, 1800);
})(window.Deck);
