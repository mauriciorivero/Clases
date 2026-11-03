/* Piezas de interfaz reutilizables: ventana, editor, terminal, árbol de archivos y columna de texto. */
(function (App) {
  'use strict';
  var esc = App.esc;

  function win(title, body, copy) {
    return '<div class="win rise" style="--d:3"><div class="wbar"><span class="tl3"><i></i><i></i><i></i></span><span class="wt">' + title + '</span>' +
      (copy ? '<button class="copy-btn" data-copy="' + esc(copy) + '">Copiar</button>' : '<span></span>') + '</div>' + body + '</div>';
  }

  App.editor = function (file, lines, lang) {
    var body = '<div class="code">' + lines.map(function (l, i) {
      return '<div class="cl" data-n="' + (i + 1) + '" style="--i:' + i + '"><span class="ln">' + (i + 1) + '</span><span class="tx">' + (App.hl(l, lang) || ' ') + '</span></div>';
    }).join('') + '</div><div class="status"><span>' + (lang === 'json' ? 'JSON' : 'JavaScript') + '</span><span>UTF-8</span><span>LF</span><span>' + lines.length + ' líneas</span></div>';
    return win('<span class="tab"><b class="fi ' + lang + '">' + (lang === 'json' ? '{}' : 'JS') + '</b>' + file + '</span>', body, lines.join('\n'));
  };

  App.terminal = function (cwd, copy) {
    return win('zsh — ' + cwd, '<div class="term" aria-live="polite"></div>', copy);
  };

  App.tree = function (items) {
    return '<div class="tree rise" style="--d:5"><div class="lbl">Estructura del proyecto</div>' + items.map(function (it) {
      var name = it[1] + (it[2] ? '/' : '');
      return '<div class="row' + (it[3] ? ' new' : '') + '"><span>' + '  '.repeat(it[0]) + (it[2] ? '<span class="d">' + esc(name) + '</span>' : esc(name)) + '</span></div>';
    }).join('') + '</div>';
  };

  App.copyCol = function (eyebrow, title, paras, note) {
    return '<div class="copy"><p class="eyebrow rise" style="--d:0">' + eyebrow + '</p><h2 class="rise" style="--d:1">' + title + '</h2>' +
      paras.map(function (p, i) { return '<p class="lead rise" style="--d:' + (i + 2) + '">' + p + '</p>'; }).join('') +
      (note ? '<p class="note rise" style="--d:' + (paras.length + 2) + '">' + note + '</p>' : '') + '</div>';
  };
})(window.App);
