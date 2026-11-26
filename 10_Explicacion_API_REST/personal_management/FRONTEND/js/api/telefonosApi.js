// Funciones asincronas para consumir el recurso /api/telefonos del backend.
const TelefonosApi = {
  // Obtiene todos los telefonos registrados
  async listar() {
    const respuesta = await fetch(`${API_BASE_URL}/telefonos`);
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Crea un nuevo telefono
  async crear(datosTelefono) {
    const respuesta = await fetch(`${API_BASE_URL}/telefonos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosTelefono)
    });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Actualiza un telefono existente
  async actualizar(id, datosTelefono) {
    const respuesta = await fetch(`${API_BASE_URL}/telefonos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosTelefono)
    });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  },

  // Elimina un telefono
  async eliminar(id) {
    const respuesta = await fetch(`${API_BASE_URL}/telefonos/${id}`, { method: 'DELETE' });
    if (!respuesta.ok) throw new Error(await extraerMensajeError(respuesta));
    return respuesta.json();
  }
};
