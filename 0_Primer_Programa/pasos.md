Primer Programa

-1er paso
Mkdir primer_programa
Cd primer_programa

-2do Paso
Git init

-3er Paso
npm init

-4to Paso
touch src/index.js

-5to paso
Abrir el archivo src/index.js y escribir el siguiente código:
```javascript
console.log("Hola Mundo");
```
-6to paso
Abrir la terminal y ejecutar el siguiente comando:
```bash
node src/index.js
```

-7mo paso
Si todo está correcto, deberías ver en la terminal el mensaje "Hola Mundo".

-8vo paso
Crear un programa que genera numeros aleatorios con los argumentos que se le pasen al momento de ejecutar el programa. Por ejemplo, si ejecutamos el programa con los argumentos 1 y 10, debería generar un número aleatorio entre 1 y 10.
```javascript
const args = process.argv.slice(2);

let min = 1;
let max = 100;

if (args.length >= 2) {
  const parseMin = parseInt(args[0], 10);
  const parseMax = parseInt(args[1], 10);

  if (!isNaN(parseMin) && !isNaN(parseMax) && parseMin < parseMax) {
    min = parseMin;
    max = parseMax;
  } else {
    console.log('rango inválido: usando valores por defecto del 1 al 100.');
  }
}

const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
console.log(`número aleatorio generado entre ${min} y ${max}: ${randomNumber}`);
```

-9no paso
Abrir la terminal y ejecutar el siguiente comando para generar un número aleatorio entre 1 y 10:
```bash
node src/index.js 1 10
```

