/* Aplica el tema guardado (o el del sistema) antes de que la página se pinte. */
(function () {
  var theme = null;
  try { theme = localStorage.getItem('npm-guide-theme'); } catch (e) { /* almacenamiento bloqueado */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
