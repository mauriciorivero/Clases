// ==========================================================
// controllers/persona.controller.js
// Capa de controladores: maneja la entrada/salida HTTP de cada
// endpoint (req/res), delega la logica de negocio al service y
// se encarga de responder con el formato JSON estandar de la API.
// ==========================================================

const personaService = require('../services/persona.service');

const crearPersona = async (req, res) => {
    try {
        const nuevaPersona = await personaService.crearPersona(req.body);

        res.status(CODIGOS_HTTP.CREADO).json({
            success: true,
            message: 'Persona creada exitosamente.',
            data: nuevaPersona,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const obtenerPersonas = async (req, res) => {
    try {
        const personas = await personaService.obtenerPersonas();
        res.status(CODIGOS_HTTP.OBTENIDO).json({
            success: true,
            message: 'Personas obtenidas exitosamente.',
            data: personas,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const obtenerPersonaPorId = async (req, res) => {
    try {
        const persona = await personaService.obtenerPersonaPorId(req.params.id);
        if (!persona) {
            return res.status(404).json({
                success: false,
                message: 'Persona no encontrada.',
                data: null,
            });
        }
        res.status(200).json({
            success: true,
            message: 'Persona obtenida exitosamente.',
            data: persona,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const actualizarPersona = async (req, res) => {
    try {
        const personaActualizada = await personaService.actualizarPersona(req.params.id, req.body);
        if (!personaActualizada) {
            return res.status(404).json({
                success: false,
                message: 'Persona no encontrada.',
                data: null,
            });
        }
        res.status(201).json({
            success: true,
            message: 'Persona actualizada exitosamente.',
            data: personaActualizada,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const eliminarPersona = async (req, res) => {
    try {
        const personaEliminada = await personaService.eliminarPersona(req.params.id);
        if (!personaEliminada) {
            return res.status(404).json({
                success: false,
                message: 'Persona no encontrada.',
                data: null,
            });
        }
        res.status(200).json({
            success: true,
            message: 'Persona eliminada exitosamente.',
            data: personaEliminada,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    crearPersona,
    obtenerPersonas,
    obtenerPersonaPorId,
    actualizarPersona,
    eliminarPersona
}

