// ========================================
// CONSUMIDOR DE MÓDULO COMMONJS
// ========================================
//
// Este archivo demuestra cómo IMPORTAR y USAR un módulo creado con CommonJS.
//
// CONCEPTO CLAVE: require()
// - require() es la función que Node.js proporciona para CARGAR módulos
// - Busca el archivo ./math.js en la misma carpeta
// - Devuelve el objeto que fue exportado en module.exports
// ========================================

// Paso 1: IMPORTAR el módulo de matemáticas
// './math' significa: "busca el archivo math.js en la carpeta actual"
// La extensión .js es opcional - Node.js la añade automáticamente
const math = require('./math');

// ========================================
// USANDO LAS FUNCIONES DEL MÓDULO IMPORTADO
// ========================================
//
// Ahora podemos acceder a las funciones usando la notación de punto (.)
// Los valores están ENCAPSULADOS dentro del objeto 'math'
// ========================================

// Operación 1: SUMA
// Llamamos math.add(5, 3) - accedemos a la función 'add' del módulo 'math'
const resultadoSuma = math.add(5, 3);
console.log(`El resultado de la suma es: ${resultadoSuma}`);

// Operación 2: RESTA
// Nota: Usamos 'substract' (con el typo del archivo original)
// En programación real, consistencia de nomenclatura es CRUCIAL
const resultadoResta = math.substract(10, 4);
console.log(`El resultado de la resta es: ${resultadoResta}`);

// Operación 3: MULTIPLICACIÓN
const multiplyResult = math.multiply(6, 7);
console.log(`El resultado de la multiplicacion es: ${multiplyResult}`);

// Operación 4: DIVISIÓN
// Esta función VALIDA que no se divida por cero
// Si pasáramos 0 como segundo parámetro, obtendríamos un Error
const divideResult = math.divide(20, 5);
console.log(`El resultado de la division es: ${divideResult}`);

// ========================================
// RESUMEN DE COMMONJS
// ========================================
// ✓ require() carga módulos de forma SÍNCRONA
// ✓ module.exports define qué se exporta
// ✓ Es el estándar histórico de Node.js
// ✓ Perfecto para aplicaciones de servidor
// ✓ Se puede usar en Node.js inmediatamente (sin configuración)
// ========================================