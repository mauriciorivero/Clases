/* Utilidades compartidas y espacio de nombres global de la presentación. */
window.App = window.App || {};
(function (App) {
  'use strict';
  App.REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  App.$ = function (s, r) { return (r || document).querySelector(s); };
  App.esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  App.sleep = function (ms) {
    return new Promise(function (r) { setTimeout(r, App.REDUCED ? 0 : ms); });
  };
  /* Posición del puntero (-0.5 a 0.5), la lee la escena de three.js para el parallax. */
  App.pointer = { x: 0, y: 0 };
})(window.App);
