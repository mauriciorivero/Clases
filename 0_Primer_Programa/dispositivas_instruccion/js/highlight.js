/* Resaltado de sintaxis mínimo para JavaScript y JSON (una línea a la vez). */
(function (App) {
  'use strict';
  var esc = App.esc;
  var KW = /^(const|let|var|if|else|function|return|new|true|false|null)$/;
  var BI = /^(console|Math|process|JSON)$/;

  App.hl = function (line, lang) {
    var re = lang === 'json'
      ? /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)/g
      : /(\/\/.*)|(`(?:[^`\\]|\\.)*`)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;
    var out = '', last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      last = re.lastIndex;
      var t = m[0], e = esc(t);
      if (lang === 'json') {
        if (m[1]) out += m[2] ? '<span class="jk">' + esc(m[1]) + '</span>' + esc(m[2]) : '<span class="st">' + e + '</span>';
        else out += '<span class="nu">' + e + '</span>';
      } else if (m[1]) out += '<span class="cm">' + e + '</span>';
      else if (m[2]) out += '<span class="st">' + e.replace(/\$\{[^}]*\}/g, function (x) { return '<span class="ip">' + x + '</span>'; }) + '</span>';
      else if (m[3]) out += '<span class="st">' + e + '</span>';
      else if (m[4]) out += '<span class="nu">' + e + '</span>';
      else {
        var prev = line[m.index - 1], next = line.slice(last).match(/^\s*\(/);
        if (KW.test(t)) out += '<span class="kw">' + e + '</span>';
        else if (BI.test(t)) out += '<span class="bi">' + e + '</span>';
        else if (next) out += '<span class="fn">' + e + '</span>';
        else if (prev === '.') out += '<span class="pr">' + e + '</span>';
        else out += e;
      }
    }
    return out + esc(line.slice(last));
  };
})(window.App);
