// Funciones asincronas para consumir el recurso /api/usuarios del backend.
// Toda comunicacion con el servidor pasa por fetch + async/await.
const UsuariosApi = {
  // Obtiene la lista de usuarios activos (vista resumen)
  async listar() {
    const respuesta = await fetch(`${API_BASE_URL}/usuarios`);
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Obtiene el detalle completo de un usuario (con telefonos y perfiles sociales)
  async obtenerPorId(id) {
    const respuesta = await fetch(`${API_BASE_URL}/usuarios/${id}`);
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Crea un nuevo usuario
  async crear(datosUsuario) {
    const respuesta = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosUsuario)
    });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Actualiza un usuario existente
  async actualizar(id, datosUsuario) {
    const respuesta = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosUsuario)
    });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Elimina (desactiva) un usuario
  async eliminar(id) {
    const respuesta = await fetch(`${API_BASE_URL}/usuarios/${id}`, { method: 'DELETE' });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  }
};
