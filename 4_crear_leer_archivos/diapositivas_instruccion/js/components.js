/* Componentes visuales: editor de código (modo oscuro) y terminal animada. */
window.Deck = window.Deck || {};
(function (Deck) {
  'use strict';

  const { line: hl, esc } = Deck.highlight;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const LANG_NAME = { js: 'JavaScript', json: 'JSON', txt: 'Texto plano', bash: 'Shell' };
  const FILE_ICON = {
    js: '<span class="fi fi-js">JS</span>',
    json: '<span class="fi fi-json">{}</span>',
    txt: '<span class="fi fi-txt">TXT</span>',
  };
  const COPY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>';
  const DOTS = '<span class="win-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
  const PROMPT = '<span class="tm-pr"><span class="tm-dir">~/4_crear_leer_archivos</span> <span class="tm-sym">$</span> </span>';

  function fromHTML(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      try { if (document.execCommand('copy')) resolve(); else reject(new Error('copy')); } catch (e) { reject(e); }
      ta.remove();
    });
  }

  function editor(cfg) {
    const added = new Set(cfg.added || []);
    let delay = 450;
    let addedCount = 0;

    const rows = cfg.lines.map((src, i) => {
      const n = i + 1;
      const isAdd = added.has(n);
      let body = hl(src, cfg.lang);
      if (isAdd) {
        addedCount++;
        if (src.length) {
          // Cada línea nueva se "teclea" en orden. El paso extra deja sitio al cursor y a la inclinación de las cursivas.
          const dur = Math.min(Math.max(src.length * 22, 260), 1700);
          body = `<span class="type" style="--chars:${src.length + 1};--dur:${dur}ms;--d:${delay}ms">${body}</span>`;
          delay += dur + 120;
        } else {
          delay += 120;
        }
      }
      return `<div class="ln${isAdd ? ' add' : ''}" data-line="${n}"><span class="gut" aria-hidden="true"><span class="mark">${isAdd ? '+' : ''}</span><span class="num">${n}</span></span><span class="txt">${body || ' '}</span></div>`;
    }).join('');

    const root = fromHTML(`
      <figure class="editor${cfg.compact ? ' is-compact' : ''}" data-lang="${cfg.lang}">
        <div class="ed-chrome">
          ${DOTS}
          <div class="ed-tabs"><span class="ed-tab">${FILE_ICON[cfg.lang] || ''}<span>${esc(cfg.file)}</span><span class="ed-x" aria-hidden="true">×</span></span></div>
          <button class="ed-copy" type="button" aria-label="Copiar el código de ${esc(cfg.file)}">${COPY_SVG}<span>Copiar</span></button>
        </div>
        ${cfg.crumbs ? `<div class="ed-crumbs">${cfg.crumbs.map(esc).join('<i>›</i>')}</div>` : ''}
        <div class="ed-body" tabindex="0" role="region" aria-label="Código de ${esc(cfg.file)}"><div class="ed-code">${rows}</div></div>
        <div class="ed-status">
          <span class="st-lang">${LANG_NAME[cfg.lang] || ''}</span><span>UTF-8</span><span>LF</span><span>${cfg.lines.length} líneas</span>
          ${addedCount ? `<span class="st-add">+${addedCount} nuevas</span>` : ''}
        </div>
      </figure>`);
    if (cfg.max) root.style.setProperty('--ed-max', cfg.max);

    const body = root.querySelector('.ed-body');
    const copyBtn = root.querySelector('.ed-copy');
    copyBtn.addEventListener('click', () => {
      copyText(cfg.lines.join('\n')).then(() => {
        copyBtn.classList.add('is-done');
        copyBtn.querySelector('span').textContent = 'Copiado';
        if (Deck.toast) Deck.toast(`Código de ${cfg.file} copiado`);
        setTimeout(() => {
          copyBtn.classList.remove('is-done');
          copyBtn.querySelector('span').textContent = 'Copiar';
        }, 1600);
      }).catch(() => Deck.toast && Deck.toast('No se pudo copiar'));
    });

    function flash(lines) {
      let first = null;
      [].concat(lines).forEach((n) => {
        const row = root.querySelector(`.ln[data-line="${n}"]`);
        if (!row) return;
        first = first || row;
        row.classList.remove('flash');
        void row.offsetWidth;
        row.classList.add('flash');
      });
      if (first) {
        const top = first.offsetTop - body.clientHeight / 3;
        body.scrollTo({ top: Math.max(0, top), left: 0, behavior: reduce ? 'auto' : 'smooth' });
      }
      return !!first;
    }

    return { root, flash };
  }

  function terminal(cfg) {
    const variants = cfg.variants;
    let vi = 0;
    let token = 0;

    const head = variants.length > 1
      ? `<div class="tm-tabs" role="tablist" aria-label="Variantes del comando">${variants.map((v, i) => (
        `<button type="button" role="tab" class="tm-tab${i === 0 ? ' is-on' : ''}" aria-selected="${i === 0}" data-v="${i}">${esc(v.label)}</button>`
      )).join('')}</div>`
      : `<span class="tm-title">${esc(cfg.title || 'zsh — 4_crear_leer_archivos')}</span>`;

    const root = fromHTML(`
      <figure class="terminal">
        <div class="ed-chrome tm-chrome">
          ${DOTS}
          ${head}
          <button class="tm-run" type="button" aria-label="Ejecutar de nuevo">${PLAY_SVG}<span>Ejecutar</span></button>
        </div>
        <div class="tm-body" tabindex="0" role="log" aria-label="Salida de la terminal"></div>
      </figure>`);
    const body = root.querySelector('.tm-body');

    const outRow = (item) => {
      const html = item.out ? (item.lang ? hl(item.out, item.lang) : esc(item.out)) : ' ';
      return `<div class="tm-line tm-out${item.tone ? ' is-' + item.tone : ''}">${html}</div>`;
    };
    const cmdRow = (text, caret) => `<div class="tm-line tm-cmd">${PROMPT}<span class="tm-typed">${text ? hl(text, 'bash') : ''}</span>${caret ? '<span class="tm-caret"></span>' : ''}</div>`;

    function sizeFor() {
      body.style.setProperty('--rows', variants[vi].lines.length + 1);
    }

    function renderStatic() {
      body.innerHTML = variants[vi].lines.map((it) => (it.cmd != null ? cmdRow(it.cmd) : outRow(it))).join('') + cmdRow('', true);
      body.scrollTop = body.scrollHeight;
    }

    function idle() {
      body.innerHTML = cmdRow('', true);
    }

    async function play() {
      const my = ++token;
      const alive = () => my === token;
      sizeFor();
      if (reduce) { renderStatic(); return; }
      body.innerHTML = '';
      root.classList.add('is-running');
      for (const item of variants[vi].lines) {
        if (!alive()) return;
        if (item.cmd != null) {
          body.insertAdjacentHTML('beforeend', cmdRow('', true));
          const row = body.lastElementChild;
          const typed = row.querySelector('.tm-typed');
          await wait(280);
          for (let i = 1; i <= item.cmd.length; i++) {
            if (!alive()) return;
            typed.innerHTML = hl(item.cmd.slice(0, i), 'bash');
            await wait(34 + Math.random() * 30);
          }
          await wait(260);
          if (!alive()) return;
          const caret = row.querySelector('.tm-caret');
          if (caret) caret.remove();
          await wait(180);
        } else {
          body.insertAdjacentHTML('beforeend', outRow(item));
          await wait(item.delay != null ? item.delay : 140);
        }
        body.scrollTop = body.scrollHeight;
      }
      if (!alive()) return;
      body.insertAdjacentHTML('beforeend', cmdRow('', true));
      body.scrollTop = body.scrollHeight;
      root.classList.remove('is-running');
    }

    function stop() {
      token++;
      root.classList.remove('is-running');
    }

    root.querySelector('.tm-run').addEventListener('click', play);
    root.querySelectorAll('.tm-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        vi = Number(tab.dataset.v);
        root.querySelectorAll('.tm-tab').forEach((t) => {
          const on = t === tab;
          t.classList.toggle('is-on', on);
          t.setAttribute('aria-selected', String(on));
        });
        play();
      });
    });

    sizeFor();
    idle();
    return { root, play, stop, reset: () => { stop(); idle(); } };
  }

  Deck.components = { editor, terminal, fromHTML };
})(window.Deck);
