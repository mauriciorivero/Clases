// ==========================================================
// utils/constants.js
// Constantes generales reutilizables en toda la aplicacion.
// Centralizar estos valores evita "numeros magicos" sueltos
// en el codigo y facilita el mantenimiento.
// ==========================================================

// Codigos de estado HTTP usados por la API
const CODIGOS_HTTP = {
  OK: 200,
  CREADO: 201,
  SIN_CONTENIDO: 204,
  SOLICITUD_INCORRECTA: 400,
  NO_ENCONTRADO: 404,
  ERROR_SERVIDOR: 500,
};

// Reglas de negocio para los campos de Persona
const REGLAS_PERSONA = {
  NOMBRE_LONGITUD_MINIMA: 2,
  NOMBRE_LONGITUD_MAXIMA: 100,
  EDAD_MINIMA: 1,
  EDAD_MAXIMA: 120,
};

module.exports = { CODIGOS_HTTP, REGLAS_PERSONA };
