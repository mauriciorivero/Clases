/* Terminal simulada: escribe comandos letra por letra y muestra la salida. */
(function (App) {
  'use strict';
  var token = 0;

  App.playTerm = async function (box, lines, idle) {
    var my = ++token;
    box.innerHTML = '';
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (my !== token) return;
      var row = document.createElement('div');
      row.className = 'tl';
      box.appendChild(row);
      if (l.c !== undefined) {
        row.innerHTML = '<span class="ps">$</span><span class="cmd"></span><span class="cur"></span>';
        var cmd = row.querySelector('.cmd'), cur = row.querySelector('.cur');
        await App.sleep(l.wait || 380);
        for (var k = 0; k < l.c.length; k++) {
          if (my !== token) return;
          cmd.textContent += l.c[k];
          await App.sleep(l.fast ? 12 : 26 + Math.random() * 34);
        }
        await App.sleep(260);
        cur.remove();
      } else {
        row.className = 'tl out ' + (l.k || '');
        row.innerHTML = l.o;
        await App.sleep(l.wait || 140);
      }
    }
    if (idle !== false && my === token) {
      var r = document.createElement('div');
      r.className = 'tl';
      r.innerHTML = '<span class="ps">$</span><span class="cur"></span>';
      box.appendChild(r);
    }
  };
})(window.App);
