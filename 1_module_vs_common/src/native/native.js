// ========================================
// MÓDULOS NATIVOS - FUNCIONALIDAD BUILT-IN DE NODE.JS
// ========================================
//
// ¿QUÉ SON MÓDULOS NATIVOS?
// Son módulos que vienen INCLUIDOS con Node.js
// No necesitas hacer npm install - están disponibles automáticamente
//
// EJEMPLOS DE MÓDULOS NATIVOS:
// • fs (file system) - trabajar con archivos
// • path - manipular rutas de archivos
// • http - crear servidores web
// • os - información del sistema operativo
// • crypto - encriptación
// • events - manejo de eventos
// • streams - procesamiento de datos en flujo
// Y muchos más...
// ========================================

// Paso 1: IMPORTAR el módulo nativo 'fs' (file system)
//
// fs = File System (Sistema de Archivos)
// Te permite:
// • Leer archivos
// • Escribir archivos
// • Borrar archivos
// • Crear carpetas
// • Y más operaciones del sistema de archivos
import fs from 'fs';

// ========================================
// CONCEPTOS IMPORTANTES AQUÍ
// ========================================
//
// 1. RUTAS: './src/native/archivoTexto.txt'
//    Las rutas especifican dónde está el archivo
//    ./ significa "en la carpeta actual del proyecto"
//
// 2. ENCODING: 'utf8'
//    Indica cómo decodificar los bytes del archivo
//    utf8 es el estándar para texto en español y emojis
//
// 3. CALLBACKS: function(err, data) { ... }
//    Node.js es ASÍNCRONO - no bloquea tu programa
//    El callback se ejecuta cuando el archivo se haya leído
// ========================================

// Leer el contenido del archivo de forma ASÍNCRONA
//
// ¿POR QUÉ ASÍNCRONO?
// Leer archivos desde el disco es LENTO (en tiempo de computadora)
// Si fuera síncrono, tu programa se pararía esperando
// Con asíncrono, tu código sigue ejecutándose mientras Node.js lee el archivo
// Cuando termina, ejecuta el callback
//
// PARÁMETROS:
// 1. './src/native/archivoTexto.txt' - ruta del archivo
// 2. 'utf8' - encoding del archivo (cómo decodificar los bytes)
// 3. (err, data) => {...} - callback que se ejecuta cuando termina
fs.readFile('./archivoTexto.txt', 'utf8', (err, data) => {
    // ========================================
    // MANEJO DE ERRORES EN CALLBACKS
    // ========================================
    // El patrón Node.js es: (err, data)
    // Si hay error, 'err' contiene información del error
    // Si todo va bien, 'err' es null
    if (err) {
        // Si hubo error (archivo no existe, permisos insuficientes, etc.)
        console.error('Error al leer el archivo:', err);
        return; // Salimos de la función para no ejecutar lo demás
    }

    // ========================================
    // ÉXITO - PROCESAR LOS DATOS
    // ========================================
    // Si llegamos aquí, el archivo se leyó correctamente
    // 'data' contiene el contenido del archivo como string
    console.log('Contenido del archivo:');
    console.log(data);
});

// ========================================
// FLUJO DE EJECUCIÓN ASÍNCRONO
// ========================================
//
// 1. Node.js comienza a leer el archivo (en background)
// 2. El programa CONTINÚA ejecutándose (no se bloquea)
// 3. Cuando termina la lectura, ejecuta el callback
// 4. El callback imprime el resultado
//
// NOTA: Si agregaras otro console.log aquí afuera,
// probablemente se ejecutaría ANTES de que el archivo se leyera
// porque Node.js no espera que termine la lectura asíncrona
// ========================================

// ========================================
// ALTERNATIVAS A CALLBACKS
// ========================================
//
// Las nuevas versiones de Node.js ofrecen alternativas más modernas:
//
// 1. PROMISES: fs.promises.readFile()
// 2. ASYNC/AWAIT: async function { await fs.promises.readFile() }
//
// Estas son más limpias que callbacks anidados (callback hell)
// Pero debes conocer callbacks para entender código antiguo
// ========================================

// ========================================
// CASOS DE USO DE MÓDULOS NATIVOS
// ========================================
//
// fs (file system):
//   • Leer configuración desde archivos JSON
//   • Procesar archivos CSV de datos
//   • Guardar registros (logs) de la aplicación
//   • Crear reportes en PDF o Excel
//
// path:
//   • Crear rutas multiplataforma (Windows vs Linux)
//   • Extraer extensión de archivo
//
// http:
//   • Crear servidores web
//   • Hacer peticiones HTTP
//
// Más adelante aprenderás a usar estos en aplicaciones reales
// ========================================