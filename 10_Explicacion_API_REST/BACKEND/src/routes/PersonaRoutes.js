// ==========================================================
// routes/persona.routes.js
// Define los endpoints del recurso "persona" y los conecta
// con su respectivo metodo del controller. Este router se monta
// en config/app.js bajo el prefijo "/api/personas".
// ==========================================================

const express = require('express');

const routerPersona = express.Router();

// POST   /api/personas      -> crear una persona
routerPersona.post('/', personaController.crearPersona);

// GET    /api/personas      -> listar todas las personas
routerPersona.get('/', personaController.obtenerPersonas);

// GET    /api/personas/:id  -> obtener una persona por id
routerPersona.get('/:id', personaController.obtenerPersonaPorId);

// PUT    /api/personas/:id  -> actualizar una persona existente
routerPersona.put('/:id', personaController.actualizarPersona);

// DELETE /api/personas/:id  -> eliminar una persona
routerPersona.delete('/:id', personaController.eliminarPersona);

module.exports = routerPersona;