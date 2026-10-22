/* Aplica el tema (claro/oscuro) antes de pintar la página para evitar parpadeos. */
(function () {
  'use strict';
  var KEY = 'fs-deck-theme';
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function system() {
    return mq && mq.matches ? 'dark' : 'light';
  }
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }
  function notify() {
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  var saved = stored();
  apply(saved === 'light' || saved === 'dark' ? saved : system());

  window.Deck = window.Deck || {};
  window.Deck.theme = {
    get: function () { return document.documentElement.getAttribute('data-theme'); },
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
