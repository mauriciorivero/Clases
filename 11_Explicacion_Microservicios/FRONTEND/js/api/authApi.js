// Funciones asincronas para consumir el microservicio de autenticacion.
const AuthApi = {
  // Devuelve { token, usuario: { id, username } }
  async iniciarSesion(username, password) {
    const respuesta = await fetch(`${AUTH_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  }
};
