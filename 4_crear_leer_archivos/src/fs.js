const fs = require('fs');
const fileName = 'ejemplo.txt';

//crear el archivo
fs.writeFileSync(fileName, 'Hola este es un archivo de texto para probar.');
console.log('Archivo creado correctamente');

//leer el archivo
const content = fs.readFileSync(fileName, 'utf-8');
console.log('File content: ', content);

//actualizar el archivo
fs.appendFileSync(fileName, '\n \n Y esta es una nueva linea de texto que se agrego para propbar.\n');
console.log('Texto del archivo actualizado');

fs.unlinkSync(fileName)
console.log('Archivo eliminado');