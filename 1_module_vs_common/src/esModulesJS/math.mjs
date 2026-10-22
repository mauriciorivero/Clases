// ========================================
// MÓDULO ES6 MODULES - EL ESTÁNDAR MODERNO DE JAVASCRIPT
// ========================================
//
// EXTENSIÓN IMPORTANTE: .mjs
// Cuando usas ES Modules en Node.js, DEBES usar la extensión .mjs
// (mjs = "module JavaScript") para que Node.js entienda que es un módulo ES6.
//
// CARACTERÍSTICAS PRINCIPALES DE ES MODULES:
// 1. Usa import para IMPORTAR módulos (similar a JavaScript moderno en navegadores)
// 2. Usa export para EXPORTAR funcionalidad
// 3. Es ASÍNCRONO por defecto
// 4. Es el estándar oficial de JavaScript (ECMAScript 2015 en adelante)
// 5. Mejor para desarrollo moderno y aplicaciones web
// ========================================

// Función para SUMAR - Exportada directamente con 'export'
// El keyword 'export' hace esta función disponible para otros módulos
// Es lo equivalente a module.exports en CommonJS
export function add(x, y) {
    return x + y;
}

// Función para RESTAR
// En ES Modules, cada función que queremos compartir lleva 'export' al frente
// Esto hace el código más explícito y claro sobre qué se está exponiendo
export function substract(x, y) {
    return x - y;
}

// Función para MULTIPLICAR
export function multiply(x, y) {
    return x * y;
}

// Función para DIVIDIR
// VALIDACIÓN IMPORTANTE: Verificamos que no se divida por cero
// En ES Modules también podemos usar throw Error para manejar situaciones excepcionales
export function divide(x, y) {
    if (y === 0) {
        throw new Error("Cannot divide by zero");
    }
    return x / y;
}

// ========================================
// COMPARACIÓN: COMMONJS vs ES MODULES
// ========================================
//
// COMMONJS (require):
//   function add(a, b) { return a + b; }
//   module.exports = { add };
//
// ES MODULES (import/export):
//   export function add(x, y) { return x + y; }
//
// ¿CUÁL ES LA DIFERENCIA?
// • ES Modules es más conciso y claro
// • ES Modules es el estándar oficial de JavaScript
// • CommonJS es más compatible con código antiguo
// • En navegadores solo funciona ES Modules
// • En Node.js ambos funcionan (CommonJS por defecto)
// ========================================