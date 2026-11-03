import { createPipeline } from './pipeline.js';
import { authenticate, errorHandler, logRequest, validateProduct } from './middlewares.js';

// El último eslabón es el "controlador": solo corre si todos los anteriores dejaron pasar
const createProduct = async (req, res) => res.send(201, { created: req.body.name, by: req.user.id });

// El orden importa: logRequest envuelve a todos; errorHandler atrapa lo que falle después de él
const handle = createPipeline(logRequest, errorHandler, authenticate('bearer'), validateProduct, createProduct);

const requests = [
  { method: 'POST', path: '/products', headers: {}, body: { name: 'Teclado', price: 45 } },
  { method: 'POST', path: '/products', headers: { authorization: 'Bearer token-valido' }, body: { name: '' } },
  { method: 'POST', path: '/products', headers: { authorization: 'Bearer token-valido' }, body: { name: 'Teclado', price: 45 } }
];

for (const req of requests) {
  const res = await handle(req);
  console.log(`${res.status} ${JSON.stringify(res.body)}\n`);
}
