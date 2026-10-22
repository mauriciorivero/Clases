/* Resaltado de sintaxis mínimo (JS, bash, JSON y texto) y formato de texto en línea. */
window.Deck = window.Deck || {};
(function (Deck) {
  'use strict';

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const span = (cls, s) => `<span class="tk-${cls}">${esc(s)}</span>`;

  // Los textos resaltan sus secuencias de escape (\n, \") con otro color.
  const str = (s) => '<span class="tk-str">' + s.split(/(\\.)/).map((part) => (
    /^\\.$/.test(part) ? `<span class="tk-esc">${esc(part)}</span>` : esc(part)
  )).join('') + '</span>';

  const KEYWORDS = new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'new', 'try', 'catch',
    'throw', 'async', 'await', 'import', 'from', 'export', 'default', 'true', 'false', 'null', 'undefined', 'typeof',
  ]);
  const BUILTINS = new Set(['require', 'console', 'module', 'process']);

  function js(line) {
    let out = '';
    let i = 0;
    let prev = '';
    const n = line.length;
    while (i < n) {
      const c = line[i];
      if (c === '/' && line[i + 1] === '/') { out += span('com', line.slice(i)); break; }
      if (c === "'" || c === '"' || c === '`') {
        let j = i + 1;
        while (j < n && line[j] !== c) { if (line[j] === '\\') j++; j++; }
        out += str(line.slice(i, j + 1));
        i = j + 1; prev = 'str';
        continue;
      }
      if (/\s/.test(c)) {
        let j = i;
        while (j < n && /\s/.test(line[j])) j++;
        out += line.slice(i, j); i = j;
        continue;
      }
      if (/[0-9]/.test(c)) {
        let j = i;
        while (j < n && /[0-9.]/.test(line[j])) j++;
        out += span('num', line.slice(i, j)); i = j; prev = 'num';
        continue;
      }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i;
        while (j < n && /[\w$]/.test(line[j])) j++;
        const word = line.slice(i, j);
        let k = j;
        while (k < n && line[k] === ' ') k++;
        let cls = 'var';
        if (KEYWORDS.has(word)) cls = 'kw';
        else if (prev === '.') cls = line[k] === '(' ? 'fn' : 'prop';
        else if (line[k] === ':' && prev !== '?') cls = 'prop';
        else if (BUILTINS.has(word)) cls = 'builtin';
        else if (line[k] === '(') cls = 'fn';
        out += span(cls, word); i = j; prev = word;
        continue;
      }
      const cls = /[{}()[\]]/.test(c) ? 'brk' : (/[=+\-*<>!&|?:]/.test(c) ? 'op' : 'pun');
      out += span(cls, c); prev = c; i++;
    }
    return out;
  }

  function bash(line) {
    if (/^\s*#/.test(line)) return span('com', line);
    let out = '';
    let first = true;
    const re = /(\s+)|('[^']*'?|"[^"]*"?)|(&&|\|\||\||;)|([^\s'";|&]+)/g;
    let m;
    while ((m = re.exec(line))) {
      if (m[1]) out += m[1];
      else if (m[2]) { out += str(m[2]); first = false; }
      else if (m[3]) { out += span('op', m[3]); first = true; }
      else {
        const w = m[4];
        if (first) { out += span('fn', w); first = false; }
        else if (w[0] === '-') out += span('flag', w);
        else if (/[/.]/.test(w)) out += span('path', w);
        else out += span('arg', w);
      }
    }
    return out;
  }

  function json(line) {
    let out = '';
    let i = 0;
    const re = /"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?|true|false|null|[{}[\],:]/g;
    let m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(i, m.index));
      const t = m[0];
      if (t[0] === '"') out += /^\s*:/.test(line.slice(m.index + t.length)) ? span('key', t) : str(t);
      else if (/^[\d-]/.test(t)) out += span('num', t);
      else if (/^[a-z]/.test(t)) out += span('kw', t);
      else out += span('pun', t);
      i = m.index + t.length;
    }
    return out + esc(line.slice(i));
  }

  const LANGS = { js, bash, json, txt: esc };

  Deck.highlight = {
    esc,
    line(src, lang) { return (LANGS[lang] || esc)(src); },
  };

  // `código`, **negrita** y *cursiva* dentro de los textos de las diapositivas.
  Deck.fmt = function (s) {
    if (!s) return '';
    return String(s).split(/(`[^`]+`)/).map((part) => {
      if (part.length > 1 && part[0] === '`' && part[part.length - 1] === '`') return `<code>${esc(part.slice(1, -1))}</code>`;
      return esc(part)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    }).join('');
  };
})(window.Deck);
