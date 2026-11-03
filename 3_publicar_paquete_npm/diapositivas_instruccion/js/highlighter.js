/*
 * Resaltador de sintaxis mínimo (JS, JSON, Bash, Markdown y salida de terminal).
 * Devuelve HTML con <span class="tk-…"> para que el CSS los pinte como un editor oscuro.
 */
window.Highlighter = (function () {
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var STR = /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/y;

  var RULES = {
    js: [
      ['com', /\/\/.*/y],
      ['str', STR],
      ['kw', /\b(?:function|return|const|let|var|new|if|else|import|from|export|default|async|await|typeof)\b/y],
      ['bi', /\b(?:module|exports|require|console|Date|true|false|null|undefined)\b/y],
      ['fn', /[A-Za-z_$][\w$]*(?=\s*\()/y],
      ['prop', /[A-Za-z_$][\w$]*(?=\s*:(?!:))/y],
      ['num', /\b\d+(?:\.\d+)?\b/y],
      [null, /[A-Za-z_$][\w$]*/y],
      ['punc', /[{}()[\];,.:=<>+\-*/!&|?]/y]
    ],
    json: [
      ['prop', /"(?:\\.|[^"\\])*"(?=\s*:)/y],
      ['str', /"(?:\\.|[^"\\])*"/y],
      ['num', /-?\b\d+(?:\.\d+)?\b/y],
      ['kw', /\b(?:true|false|null)\b/y],
      ['punc', /[{}[\],:]/y]
    ],
    bash: [
      ['com', /#.*/y],
      ['cmd', /^[\w.-]+/y],
      ['sub', /(?<=^(?:npm|git|node|cd|mkdir|touch|ls|npx)\s+)[a-z][\w-]*/y],
      ['str', STR],
      ['flag', /(?<=\s)--?[\w-]+(?:=\S*)?/y],
      ['link', /https?:\/\/\S+/y],
      ['punc', /&&|\|\||[|><]/y],
      [null, /[\w./@-]+/y]
    ],
    md: [
      ['head', /^#{1,6}\s.*/y],
      ['com', /^```.*/y],
      ['str', /`[^`]+`/y],
      ['fn', /\*\*[^*]+\*\*/y],
      ['punc', /^\s*[-*]\s/y]
    ],
    out: [
      ['com', /^npm notice/y],
      ['err', /^npm error.*/y],
      ['warn', /^npm warn/y],
      ['ok', /^\+ .*/y],
      ['ok', /^(?:Logged in|added|found 0).*/y],
      ['link', /https?:\/\/\S+/y],
      ['str', /'(?:[^'\\]|\\.)*'/y],
      ['punc', /->|[├└─│]+/y],
      ['num', /\b\d+(?:\.\d+)?(?:ms|B|kB)?\b/y],
      [null, /[\w./@-]+/y]
    ],
    plain: []
  };

  function run(line, rules) {
    var out = '';
    var i = 0;
    while (i < line.length) {
      var matched = false;
      for (var r = 0; r < rules.length; r++) {
        var re = rules[r][1];
        re.lastIndex = i;
        var m = re.exec(line);
        if (m && m[0].length) {
          var cls = rules[r][0];
          out += cls ? '<span class="tk-' + cls + '">' + esc(m[0]) + '</span>' : esc(m[0]);
          i += m[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) { out += esc(line[i]); i++; }
    }
    return out;
  }

  /** Resalta una sola línea. */
  function line(text, lang) {
    return run(text, RULES[lang] || RULES.plain);
  }

  /** Resalta varias líneas; en Markdown resalta también el interior de los bloques ```lang. */
  function lines(list, lang) {
    if (lang !== 'md') return list.map(function (l) { return line(l, lang); });
    var inner = null;
    return list.map(function (l) {
      var fence = /^```(\w*)/.exec(l);
      if (fence) {
        inner = inner === null ? (fence[1] || 'plain') : null;
        return line(l, 'md');
      }
      return inner !== null ? line(l, RULES[inner] ? inner : 'plain') : line(l, 'md');
    });
  }

  /** Texto de interfaz: `código`, **negrita** y *cursiva*. */
  function inline(text) {
    return String(text).split(/(`[^`]+`)/g).map(function (seg, i) {
      if (i % 2) return '<code>' + esc(seg.slice(1, -1)) + '</code>';
      return esc(seg)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    }).join('');
  }

  return { esc: esc, line: line, lines: lines, inline: inline };
})();
