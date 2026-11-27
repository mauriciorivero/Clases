// Manejo de la sesion en el navegador. El token se guarda en sessionStorage:
// dura lo que dure la pestaña. Quien decide si es valido es siempre el backend.
const Sesion = {
  guardar(token, username) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('username', username);
  },

  obtenerToken() {
    return sessionStorage.getItem('token');
  },

  obtenerUsername() {
    return sessionStorage.getItem('username');
  },

  cerrar() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
  },

  // Para paginas privadas: sin sesion se vuelve al login. Tambien se revisa en
  // 'pageshow' porque el boton "Atras" puede restaurar la pagina sin recargarla.
  exigir() {
    const comprobar = () => {
      if (!this.obtenerToken()) location.replace('login.html');
    };
    comprobar();
    window.addEventListener('pageshow', comprobar);
  }
};

// fetch con el token de la sesion. Si el backend lo rechaza, se vuelve al login.
async function fetchConSesion(url, opciones = {}) {
  const token = Sesion.obtenerToken();
  const respuesta = await fetch(url, {
    ...opciones,
    headers: { ...opciones.headers, Authorization: `Bearer ${token}` }
  });

  if (respuesta.status === 401 && token) {
    Sesion.cerrar();
    location.replace('login.html?expirada=1');
  }
  return respuesta;
}
