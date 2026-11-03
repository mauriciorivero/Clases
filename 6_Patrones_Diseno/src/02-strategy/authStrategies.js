// ========================================
// ESTRATEGIA EN EL BACKEND: CÓMO IDENTIFICAMOS AL USUARIO
// ========================================
// Cada estrategia recibe las cabeceras de la petición y devuelve el usuario,
// o null si las credenciales no sirven. Passport.js usa esta misma idea.

export const authStrategies = {
  // Authorization: Bearer <token>
  // (más adelante será un JWT o una sesión de Supabase)
  bearer(headers) {
    const token = headers.authorization?.split(' ')[1];
    return token === 'token-valido' ? { id: 'u1', role: 'user' } : null;
  },

  // x-api-key: <clave>   (para otros servicios, como los microservicios)
  apiKey(headers) {
    const valid = headers['x-api-key'] === 'clave-de-servicio';
    return valid ? { id: 'svc', role: 'service' } : null;
  }
};
