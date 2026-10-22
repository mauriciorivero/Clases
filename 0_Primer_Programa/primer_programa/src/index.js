const args = process.argv.slice(2);

// Valores por defecto: se usan si el usuario no envía argumentos o si estos no son válidos.
// Usamos "let" porque estas variables pueden cambiar más adelante.
let min = 1;
let max = 100;

// Solo intentamos leer el rango si el usuario escribió al menos dos argumentos.
if (args.length >= 2) {
  
  const parseMin = parseInt(args[0], 10);
  const parseMax = parseInt(args[1], 10);



  if (!isNaN(parseMin) && !isNaN(parseMax) && parseMin < parseMax) {
    // Entrada válida: reemplazamos los valores por defecto con los del usuario.
    min = parseMin;
    max = parseMax;
  } else {
    // Entrada inválida: avisamos y seguimos con los valores por defecto (1 a 100).
    console.log('rango inválido: usando valores por defecto del 1 al 100.');
  }
}

const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

// Las comillas invertidas (``) crean una plantilla de texto (template literal),
// donde ${...} inserta el valor de una variable o expresión dentro del mensaje.
console.log(`número aleatorio generado entre ${min} y ${max}: ${randomNumber}`);


