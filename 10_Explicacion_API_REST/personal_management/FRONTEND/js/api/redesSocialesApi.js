// Funciones asincronas para consumir el recurso /api/redes-sociales del backend.
const RedesSocialesApi = {
  // Obtiene el catalogo completo de redes sociales
  async listar() {
    const respuesta = await fetch(`${API_BASE_URL}/redes-sociales`);
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Crea una nueva red social
  async crear(datosRedSocial) {
    const respuesta = await fetch(`${API_BASE_URL}/redes-sociales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosRedSocial)
    });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Actualiza una red social existente
  async actualizar(id, datosRedSocial) {
    const respuesta = await fetch(`${API_BASE_URL}/redes-sociales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosRedSocial)
    });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Elimina una red social
  async eliminar(id) {
    const respuesta = await fetch(`${API_BASE_URL}/redes-sociales/${id}`, { method: 'DELETE' });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  }
};
