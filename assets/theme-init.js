/* Aplica el tema (claro/oscuro) antes de pintar la página para evitar parpadeos. */
(function () {
  'use strict';
  var KEY = 'node-clases-theme';
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function system() {
    return mq && mq.matches ? 'dark' : 'light';
  }
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  }
  function notify() {
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  // Los estilos que ocultan elementos hasta animarlos solo se activan si hay JavaScript.
  root.classList.add('js');

  var saved = stored();
  apply(saved === 'light' || saved === 'dark' ? saved : system());

  window.Landing = window.Landing || {};
  window.Landing.theme = {
    get: function () { return root.getAttribute('data-theme'); },
    set: function (theme) {
      apply(theme);
      try { localStorage.setItem(KEY, theme); } catch (e) { /* almacenamiento no disponible */ }
      notify();
    },
    toggle: function () { this.set(this.get() === 'dark' ? 'light' : 'dark'); }
  };

  // Si la persona nunca eligió un tema, seguimos el del sistema operativo.
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function () {
      if (!stored()) { apply(system()); notify(); }
    });
  }
})();
