# paso1
Inicializar el proyecto con
```bash
npm init -y
```

# paso2
Luego crear el directorio src con el comando:
```bash
mkdir src
```

# paso3
Dentro de src crear el archivo index.js con el comando:
```bash
touch src/index.js
```

Si estamos dentro de src solo es:
```bash
touch index.js
```

# paso4
Vamos a crar dos funciones y a exportarlas usando el siguente código
```javascript
function getTimeStamp(){
    return Date.now();
}

function getLongTime(locale = 'es-ES'){
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short'
    };

    return new Date().toLocaleString(locale, options)
}

module.exports = {
    getTimeStamp,
    getLongTime
}
```

# paso5
En la raiz del proyecto vamos a crear un archivo readme en formato markdown que servira como portada de nuestro paquete
```bash
touch README.md
```

# paso6
En el archivo readme.md vamos a colocar la siguiente información que nos servira para establecer la pagina inicial de nuestro paquete:
´´´markdown
#SENA-DATE

Una utilidad para manejar fechas en formato tiemstamp y long time

#Install

```bash
npm sena-date
```

# paso7
Editaremos nuestro archivo de configuracion package.json para incluir el script de ejecución del paquete y la información de descripción del paquete

# paso8
linkearemos este proyecto al sistema de paquetes local de npm usando el comando:
Luego crear el directorio src con el comando:

```bash
npm link
```

# paso9
Luego debemos movernos al proyecto principal donde haremos uso de ese paquete que ya esta en local estableciendo un enlace simbolico. Esto lo haremos es solo para probarlo en local, aun no lo hemos publicado. Escribimos este comando en el proyecto donde lo usaremos:

```bash
npm link sena-date
```

# paso10
Luego para usarlo en el proyecto podemos traerlo usando requiere si usamos commonJS o import si usamos modules ES6

# paso11
para publicar este proyecto en npm primero debemos publicar el proyecto en github

# paso12
Debemos autenticarnos con npm, primero debemos crear una cuenta en su portal oficial, luego debemos usar el comando

```bash
npm adduser
```

Si ya estamos logeados en nuestro navegador por defecto y ejecutamos ese comando, se nos abrira el navegador para autenticarnos. En versiones mas actuales de npm el comando es:

```bash
npm login
```

# paso13
Ya con todo lo anterior listo debemos ejecutar un comando que primero pasará toda la informacion sobre nuestro paquete, para eso usaremos el comando:

```bash
npm publish --dry-run
```

Aqui podemos revisar que la información del paquete que se enviará al portal de npm sea corercta

# paso14
Finalmente para publicar usamos el comando:

```bash
npm publish
```

En este paso hay que tener en cuenta que la autenticacion de dos factores debe estar activa en nuestra cuenta de npm o sino nos arrojará un error.

y para los que usen WSDL

```bash
npm login --auth-type=legacy
```
