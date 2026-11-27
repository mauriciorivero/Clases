// Pagina de inicio de sesion: valida las credenciales y redirige al modulo de gestion.
document.addEventListener('DOMContentLoaded', () => {
  if (Sesion.obtenerToken()) {
    location.replace('index.html');
    return;
  }

  const formulario = $('#form-login');
  const boton = $('#login-btn-ingresar');
  const mensajeError = $('#login-error');

  function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.hidden = !mensaje;
  }

  if (new URLSearchParams(location.search).has('expirada')) {
    mostrarError('Su sesión expiró, ingrese nuevamente');
  }

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    mostrarError('');
    boton.disabled = true;

    try {
      const { token, usuario } = await AuthApi.iniciarSesion(
        $('#login-username').value.trim(),
        $('#login-password').value
      );
      Sesion.guardar(token, usuario.username);
      location.replace('index.html');
    } catch (error) {
      // fetch lanza TypeError cuando el servidor no responde
      mostrarError(
        error instanceof TypeError ? 'No fue posible conectar con el servicio de autenticación' : error.message
      );
      boton.disabled = false;
    }
  });
});
