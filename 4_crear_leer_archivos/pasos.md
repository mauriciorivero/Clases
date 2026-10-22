# paso1
inicializar el repositorio con:
```bash
npm init
````

o con:
```bash
npm init -y
```

# paso2
crear un archivo llamado fs.js en la carpeta raiz con:
```bash
mkdir src
touch src/fs.js
```

# paso3
Dentro del archivo fs.js agregar el siguiente código que llama a la libreria fs e inicializa una constante para tarabjar con archivos
```js
const fs = require('fs');
const fileName = 'ejemplo.txt';
```

# paso4
Dentro del archivo fs.js agregar el siguiente código que hace que cree un nuevo archivo y escriba una linea de texto
```js
fs.writeFileSync(fileName, 'Hola este es un archivo de texto para probar.');
console.log('Archivo creado correctamente');
```

# paso4.1
Por ahora corramos el programa y vemos que sucede
```bash
node src/fs.js
```

# paso5
Dentro del archivo fs.js agregar el siguiente código que hace que lea el archivo creado
```js
const content = fs.readFileSync(fileName, 'utf-8');
console.log('File content: ', content);
```

# paso5.1
Por ahora corramos el programa y vemos que sucede
```bash
node src/fs.js
```

# paso6
Dentro del archivo fs.js agregar el siguiente código que hace que lea el archivo creado se actualice con una nueva linea
```js
fs.appendFileSync(fileName, '\n \n Y esta es una nueva linea de texto que se agrego para propbar.\n');
console.log('Texto del archivo actualizado');
```

# paso7
Por ahora corramos el programa y vemos que sucede
```bash
node src/fs.js
```

# paso8
Dentro del archivo fs.js agregar el siguiente código que hace que el archivo sea borrado
```js
fs.unlinkSync(fileName)
console.log('Archivo eliminado');
```

# Reto1
Hacer una copia del archivo y que se guarde en otra carpeta antes de borrarlo definitivamente

# Reto2
hacer un programa que cree un archivo de texto en un directorio de una ruta relativa del sistema (esta aplicación) y lo mueva (no copie) a una ruta absoluta diferente