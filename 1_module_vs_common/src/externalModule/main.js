// ========================================
// MÓDULOS EXTERNOS - USANDO PAQUETES NPM
// ========================================
//
// ¿QUÉ ES NPM?
// NPM = Node Package Manager
// Es un gestor de paquetes que permite descargar y usar código escrito por otros
//
// INSTALACIÓN REQUERIDA:
// npm install is-odd
// O versión corta:
// npm i is-odd
//
// Esto descarga el paquete "is-odd" desde el registro npm y lo guarda en node_modules/
// ========================================

// Paso 1: IMPORTAR un módulo EXTERNO instalado con npm
//
// Diferencia importante:
// • require('./math') ← módulo LOCAL (mismo proyecto)
// • require('is-odd') ← módulo EXTERNO (desde node_modules)
//
// Sin './' ni extensión significa que Node.js busca en:
// 1. Módulos nativos built-in (fs, path, etc.)
// 2. node_modules/ carpeta
// ========================================
import isOdd from 'is-odd'; // Importamos el módulo externo is-odd

// ========================================
// USANDO EL MÓDULO EXTERNO
// ========================================
//
// is-odd es un paquete simple que hace una cosa: verificar si un número es impar
// Fue creado por otros programadores y publicado en npm
// Cualquiera puede usarlo incluyen este código: npm install is-odd
// ========================================

// Definimos un número a verificar
const number = 5;

// Llamamos la función isOdd() que proviene del paquete instalado
// isOdd(5) devuelve true (5 es impar)
// isOdd(4) devolvería false (4 es par)
if (isOdd(number)) {
    console.log(`${number} es un número impar.`);
} else {
    console.log(`${number} es un número par.`);
}

// ========================================
// VENTAJAS DE USAR MÓDULOS EXTERNOS (NPM)
// ========================================
//
// ✓ NO TIENES QUE ESCRIBIR CÓDIGO QUE OTROS YA ESCRIBIERON
// ✓ Evitas errores y bugs que otros ya solucionaron
// ✓ Ahorras tiempo de desarrollo
// ✓ Acceso a miles de paquetes útiles
// ✓ Comunidad global contribuyendo mejoras
//
// DESVENTAJAS A TENER EN CUENTA:
// ✗ Depender de código de terceros puede ser riesgoso
// ✗ Si el paquete se descontinúa, tú quedas sin mantenimiento
// ✗ Aumenta el tamaño de tu proyecto (node_modules puede ser muy grande)
// ✗ Necesitas verificar que el paquete sea seguro y confiable
// ========================================

// ========================================
// CASOS DE USO REALES EN TU PROYECTO
// ========================================
//
// En un proyecto real, usarías módulos externos para:
// • Manejo de fechas (moment, date-fns)
// • Validación de datos (joi, yup)
// • Utilidades (lodash)
// • Frameworks (express, react)
// • Bases de datos (mongoose, sequelize)
// • Y mucho más...
// ========================================