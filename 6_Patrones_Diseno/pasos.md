# Clase 6 · Patrones de diseño para el desarrollo web

Guion de la clase. La presentación (`diapositivas_instruccion/index.html`) sigue este mismo orden y el código completo de cada paso está en `src/`. Los ejemplos no necesitan dependencias: solo Node.js 20.12 o superior.

# paso1
Preparar el proyecto. El `"type": "module"` activa `import` y `export` (como en la clase 1).
```bash
mkdir 6_Patrones_Diseno && cd 6_Patrones_Diseno
npm init -y
npm pkg set type=module
mkdir -p src/lib
```

# paso2
Copiar los dos simuladores a `src/lib/`: `supabaseSimulado.js` y `mongoSimulado.js`. Imitan los métodos de `@supabase/supabase-js` y del driver `mongodb` y guardan los datos en memoria. Cuando lleguemos a esas clases solo cambiará el `import`:
```js
// hoy
import { createClient } from '../lib/supabaseSimulado.js';
// en la clase de Supabase
import { createClient } from '@supabase/supabase-js';
```

# paso3 · Singleton (`src/01-singleton`)
Problema: si cada componente crea su propio logger, los registros se pierden o se fragmentan.
1. `logger.js`: una clase con un campo estático privado y `getInstance()`. Al final, `export const logger = Logger.getInstance();` (en ES Modules, el caché de módulos ya lo vuelve un Singleton).
2. `database.js`: un cliente de Supabase y una **promesa** de conexión a MongoDB compartidos por todas las peticiones.
```bash
npm run singleton
```
Fíjate en que `Conexiones abiertas` es `1` aunque pidamos el cliente tres veces a la vez.

# paso4 · Strategy (`src/02-strategy`)
Problema: una cadena de `if / else` para elegir el método de pago crece y se rompe (`checkoutWithIf.js`).
1. `paymentStrategies.js`: un objeto por método de pago, todos con `pay(amount, info)`.
2. `payment.js`: el contexto `Payment`, que guarda la estrategia y delega en ella. `setStrategy()` la cambia en tiempo de ejecución.
3. `config.json`: la estrategia por defecto. Cambia `"paypal"` por `"bitcoin"` y vuelve a correr.
4. `authStrategies.js`: la misma idea aplicada a la autenticación (`bearer` y `apiKey`).
```bash
npm run strategy
```

# paso5 · Observer (`src/03-observer`)
Problema: varias partes dependen de un mismo dato y deben enterarse cuando cambia.
1. `subject.js`: `subscribe()` devuelve la función para darse de baja y `notify()` avisa a todos (con `Promise.allSettled`, para que un observador que falle no detenga a los demás).
2. `dropdowns.js`: una lista de categorías (sujeto) y tres filtros (observadores).
3. `orderEvents.js`: el mismo patrón con el módulo nativo `events` (`emit` y `on`).
```bash
npm run observer
```

# paso6 · Decorator (`src/04-decorator`)
Problema: agregar funciones a *una* instancia sin tocar la clase ni las demás.
1. `sandwich.js`: `Deluxe` y `Exquisite` envuelven a un sándwich y se pueden apilar.
2. `functionDecorators.js`: `withLogging`, `withTiming`, `withCache` y `withRetry`, que envuelven funciones.
```bash
npm run decorator
```
Cambia el orden de `withTiming(withCache(fn))` y observa qué cambia en la salida.

# paso7 · Adapter y Repository (`src/05-adapter-repository`)
Problema: Supabase y MongoDB hablan idiomas distintos, y no queremos que el resto de la app lo note.
1. `productRepository.js`: el contrato (`findAll`, `findById`, `create`).
2. `supabaseProductRepository.js` y `mongoProductRepository.js`: un adaptador por base de datos. El de MongoDB traduce `_id` a `id`.
3. `productService.js`: las reglas del negocio; recibe el repositorio por el constructor.
```bash
npm run adapter
```

# paso8 · Factory Method (`src/06-factory-method`)
`repositoryFactory.js`: `createProductRepository('mongo')` devuelve el repositorio correcto. Sin argumento, lee `DB_PROVIDER`.
```bash
npm run factory
DB_PROVIDER=mongo npm run factory
```

# paso9 · Chain of Responsibility (`src/07-chain-of-responsibility`)
Problema: una petición debe pasar por varios pasos independientes (registrar, autenticar, validar...).
1. `pipeline.js`: `createPipeline(...middlewares)`; cada eslabón recibe `(req, res, next)`.
2. `middlewares.js`: `logRequest`, `errorHandler`, `authenticate` (que delega en una estrategia) y `validateProduct`.
```bash
npm run chain
```
Observa que cada petición se detiene en un eslabón distinto: 401, 400 y 201.

# paso10 · Facade (`src/08-facade`)
`checkoutFacade.js`: `placeOrder()` coordina catálogo, pago, pedido y notificaciones. El controlador solo hace una llamada.
```bash
npm run facade
```

# paso11 · Todos juntos (`src/09-integrado`)
`api.js` simula una API REST: las peticiones atraviesan la cadena de middlewares hasta llegar al controlador, que usa la fachada, el repositorio y la caché.
```bash
npm run integrado
DB_PROVIDER=mongo npm run integrado
```
Las dos ejecuciones responden igual, con la misma estructura; solo cambia el `id`.

# Retos
- **Strategy:** agrega la estrategia `nequi` sin tocar `payment.js`.
- **Observer:** suscribe un observador a `order:created` que escriba el pedido en un archivo con `fs`.
- **Decorator:** escribe `withRateLimit(fn, max)`.
- **Adapter:** agrega `delete(id)` al contrato y a los dos adaptadores.
- **Factory Method:** agrega un proveedor `memory` que guarde los productos en un arreglo.
- **Chain of Responsibility:** crea el middleware `requireRole("admin")`.

# Fuentes
- Platzi: «¿Qué son los patrones de diseño? Conoce para qué te sirven», de Italo Morales F. https://platzi.com/blog/patrones-de-diseno/
- freeCodeCamp en español: «4 patrones de diseño que deberías saber para desarrollo web: Observador, Singleton, estrategia y decorador», traducido por Elias Ezequiel Pereyra Gomez (21 de abril de 2023). https://www.freecodecamp.org/espanol/news/4-patrones-de-diseno-que-deberias-saber-para-desarrollo-web-observador-singleton-estrategia-y-decorador/
- Gamma, Helm, Johnson y Vlissides: *Design Patterns: Elements of Reusable Object-Oriented Software* (1994).
