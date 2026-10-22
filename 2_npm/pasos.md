1. Revisar las versiones de nuestro entorno con:

node -v
npm -v

2. npm init
Nos ayuda a inicializar un proyecto de Node.js y crear un archivo package.json, que contiene información sobre el proyecto y sus dependencias.

3. instalar paquete de libreria externa para encriptar contraseñas, por ejemplo object-hash, bcrypt o crypto. Para instalar object-hash, por ejemplo, usamos:
npm i object-hash

4. Se importan las librerías necesarias en el archivo principal de nuestro proyecto (por ejemplo, index.js o app.js):
import hash from 'object-hash';

5. se crea una función para encriptar contraseñas usando la librería importada. Por ejemplo:
function encryptPassword(password) {
  return hash(password);
}

6. Se puede crear una función para verificar si una contraseña ingresada coincide con la contraseña encriptada. Por ejemplo:
function verifyPassword(inputPassword, hashedPassword) {
  return hash(inputPassword) === hashedPassword;
}

7. Se puede crear un archivo de configuración (por ejemplo, config.js) para almacenar información sensible como claves secretas o configuraciones de la aplicación.

8. Creo una serie de llamados para obtener los datos de parametros desde la terminal al iniciar la aplicación par aluego usarlos como argumentos en las funciones de encriptación y verificación de contraseñas. Por ejemplo, usando process.argv para obtener los argumentos de la línea de comandos:

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

8. Por ultimo si quiero crear un script de inicio para mi proyecto, puedo agregarlo en el archivo package.json. Por ejemplo, agregando un script llamado "start" que ejecute el archivo principal de la aplicación:
"scripts": {
  "start": "node src/index.js" 

