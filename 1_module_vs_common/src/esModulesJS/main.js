// ========================================
// CONSUMIDOR DE MÓDULO ES6 (IMPORT/EXPORT)
// ========================================
//
// Este archivo demuestra cómo IMPORTAR y USAR un módulo ES6 en Node.js
// Observa la sintaxis diferente a CommonJS - ¡aquí usamos import!
// ========================================

// Paso 1: IMPORTAR las funciones específicas que necesitamos
//
// import { ... } from './archivo'
//
// Los CORCHETES {} permiten "destructuring" (desestructuración)
// Esto significa: "Solo dame estas funciones específicas del módulo"
//
// IMPORTANTE: Aunque este archivo es .js, puede importar de .mjs
// Node.js entiende ambas extensiones cuando se usa import
import {add, substract, multiply, divide} from './math.mjs';

// ========================================
// VENTAJA DEL DESTRUCTURING CON IMPORT
// ========================================
//
// Con CommonJS (require):
//   const math = require('./math.mjs');
//   math.add(5, 3);  ← Necesitas el prefijo 'math.'
//
// Con ES Modules (import con destructuring):
//   import { add } from './math.mjs';
//   add(5, 3);  ← Directo, sin prefijo
//
// Es más conciso y legible. ¡Esto es una ventaja de ES Modules!
// ========================================

// Operación 1: SUMA
// Llamamos directamente a add() sin necesidad de prefijo
const addResult = add(5, 3);
console.log(`Addition Result: ${addResult}`);

// Operación 2: RESTA
const subtractResult = substract(10, 4);
console.log(`Subtraction Result: ${subtractResult}`);

// Operación 3: MULTIPLICACIÓN
const multiplyResult = multiply(6, 7);
console.log(`Multiplication Result: ${multiplyResult}`);

// Operación 4: DIVISIÓN
// Si pasáramos 0 aquí, la función lanzaría un Error
const divideResult = divide(20, 5);
console.log(`Division Result: ${divideResult}`);

// ========================================
// RESUMEN DE ES MODULES
// ========================================
// ✓ import { } permite importar solo lo que necesitas (tree-shaking)
// ✓ export hace cada función un "export nombrado"
// ✓ Sintaxis más moderna y clara
// ✓ Es el estándar de JavaScript moderno
// ✓ Funciona en navegadores Y en Node.js
// ✓ Mejor para proyectos nuevos
// ========================================

// ========================================
// COMPARACIÓN FINAL: CommonJS vs ES Modules
// ========================================
//
// COMMONJS: Más antiguo, síncrono, require/module.exports
// ES MODULES: Más moderno, asíncrono, import/export
//
// Para este curso, entender AMBOS es importante porque:
// • Mucho código existente usa CommonJS
// • Código nuevo prefiere ES Modules
// • Necesitas trabajar con ambos en proyectos reales
// ========================================