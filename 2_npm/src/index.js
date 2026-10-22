//se importa el modulo usando ES6
import hash from 'object-hash';

//cuando inicie el programa puedo usar el comando npm run start mauricio, hombre, colombia
const args = process.argv.slice(2);

//se declara un objeto persona con propiedades name, stapler y friends
const persona = { name: args[0], genre: args[1], nationality: args[2], age: args[3], friends: args.slice(4) };

//muestro en consola el objeto persona en formato JSON
console.log(`Persona: ${JSON.stringify(persona)}`);

//se encripta el objeto persona usando la función hash del modulo object-hash
const personaEncrypted = hash(persona); 

//se encripta solo el nombre de la persona usando la función hash del modulo object-hash
const personaNameEncrypted = hash(persona.name);

const personaMD5Encrypted = hash(persona, { algorithm: 'md5', encoding: 'base64' });

//muestro en consola el objeto persona encriptado
console.log(`Persona encriptada: ${personaEncrypted}`);

//muestro en consola el nombre de la persona encriptado
console.log(`Nombre encriptado: ${personaNameEncrypted}`);

//muestro en consola el objeto persona encriptado con algoritmo MD5 y codificado en base64
console.log(`Persona encriptada con MD5 y codificada en base64: ${personaMD5Encrypted}`);
