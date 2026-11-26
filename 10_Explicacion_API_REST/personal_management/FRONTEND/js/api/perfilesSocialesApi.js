// Funciones asincronas para consumir el recurso /api/perfiles-sociales del backend.
const PerfilesSocialesApi = {
  // Obtiene todos los perfiles sociales registrados
  async listar() {
    const respuesta = await fetch(`${API_BASE_URL}/perfiles-sociales`);
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Crea un nuevo perfil social (asocia un usuario con una red social)
  async crear(datosPerfil) {
    const respuesta = await fetch(`${API_BASE_URL}/perfiles-sociales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosPerfil)
    });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Actualiza la url de un perfil social existente (identificado por su llave compuesta)
  async actualizar(redSocialId, usuarioId, urlPerfil) {
    const respuesta = await fetch(`${API_BASE_URL}/perfiles-sociales/${redSocialId}/${usuarioId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urlPerfil })
    });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Elimina un perfil social
  async eliminar(redSocialId, usuarioId) {
    const respuesta = await fetch(`${API_BASE_URL}/perfiles-sociales/${redSocialId}/${usuarioId}`, {
      method: 'DELETE'
    });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  }
};
