// ========================================
// MÓDULO COMMONJS - SISTEMA DE MÓDULOS ORIGINAL DE NODE.JS
// ========================================
//
// Este archivo demuestra cómo crear un módulo usando CommonJS.
// CommonJS fue el sistema estándar de Node.js antes de que ES6 Modules llegara.
//
// CARACTERÍSTICAS PRINCIPALES DE COMMONJS:
// 1. Usa require() para IMPORTAR módulos
// 2. Usa module.exports para EXPORTAR funcionalidad
// 3. Es SÍNCRONO (no usa async/await)
// 4. Los módulos se cargan completamente en memoria
// ========================================

// Función para SUMAR dos números
// Esta función es privada dentro del módulo (no se puede acceder directamente desde afuera)
function add (a, b){
    return a + b;
}

// Función para RESTAR dos números
// Nota: Observa que el nombre tiene un "typo" (substract en lugar de subtract)
// Esta es una "decisión pedagógica" para mostrar que el nombre de la función
// debe ser consistente en todo tu proyecto
function substract (a, b){
    return a - b;
}

// Función para MULTIPLICAR dos números
function multiply (a, b){
    return a * b;
}

// Función para DIVIDIR dos números
// IMPORTANTE: Esta función incluye VALIDACIÓN - un concepto clave en programación
// Validamos que el divisor (b) no sea cero para evitar errores matemáticos
function divide (a, b){
    if (b === 0) {
        throw new Error("Cannot divide by zero");
    }
    return a / b;
}

// ========================================
// EXPORTAR LAS FUNCIONES - HACERLAS PÚBLICAS
// ========================================
//
// module.exports es el objeto especial de Node.js que contiene todo lo que
// este módulo quiere COMPARTIR con otros archivos.
//
// Aquí estamos usando destructuring (desestructuración) para exportar solo
// las funciones que queremos que sean accesibles desde otros módulos.
// Las funciones sin exportar permanecen privadas (encapsuladas).
//
// VENTAJA: Otros archivos pueden usar require('./math.js') para acceder
// a estas funciones.
// ========================================
module.exports = {
    add,
    substract,
    multiply,
    divide
};