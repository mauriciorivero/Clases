// ========================================
// TODOS LOS PATRONES JUNTOS: UNA MINI API
// ========================================
// Simula lo que harás con Express: peticiones que atraviesan una cadena de
// middlewares hasta llegar a un controlador. Sin servidor ni dependencias.
import { createPipeline } from '../07-chain-of-responsibility/pipeline.js';
import { authenticate, errorHandler, logRequest } from '../07-chain-of-responsibility/middlewares.js';
import { createProductRepository } from '../06-factory-method/repositoryFactory.js';
import { ProductService } from '../05-adapter-repository/productService.js';
import { CheckoutFacade } from '../08-facade/checkoutFacade.js';
import { orderEvents, registerOrderListeners } from '../03-observer/orderEvents.js';
import { withCache } from '../04-decorator/functionDecorators.js';

// Factory Method (+ Singleton): elige la base de datos con DB_PROVIDER
const repository = await createProductRepository();
const productService = new ProductService(repository);
await productService.addProduct({ name: 'Teclado', price: 45 });
await productService.addProduct({ name: 'Mouse', price: 18 });

// Observer: los suscriptores reaccionan a los pedidos
registerOrderListeners();

// Facade: el controlador de pedidos usa una sola puerta
const checkout = new CheckoutFacade({ productService, events: orderEvents });

// Decorator: la lista se consulta mucho, así que la guardamos en caché
const listProducts = withCache(() => productService.listProducts(), 10_000);

// Controladores: el último eslabón de la cadena
const routes = {
  'GET /products': async (req, res) => res.send(200, await listProducts()),
  'POST /orders': async (req, res) => {
    res.send(201, await checkout.placeOrder(req.body));
  }
};

async function router(req, res) {
  const controller = routes[`${req.method} ${req.path}`];
  if (!controller) return res.send(404, { error: 'Ruta no encontrada' });
  await controller(req, res);
}

// Chain of Responsibility + Strategy: registrar, atrapar errores,
// autenticar (estrategia "bearer") y enrutar
const api = createPipeline(
  logRequest,
  errorHandler,
  authenticate('bearer'),
  router
);

// --- Simulamos peticiones ---
const auth = { authorization: 'Bearer token-valido' };
const [firstProduct] = await productService.listProducts();

const requests = [
  { method: 'GET', path: '/products', headers: {} },
  { method: 'GET', path: '/products', headers: auth },
  { method: 'GET', path: '/products', headers: auth },
  { method: 'POST', path: '/orders', headers: auth, body: { productId: firstProduct.id, email: 'ana@correo.com', paymentMethod: 'paypal', paymentInfo: { email: 'ana@correo.com' } } },
  { method: 'POST', path: '/orders', headers: auth, body: { productId: 'no-existe', email: 'ana@correo.com', paymentMethod: 'paypal', paymentInfo: { email: 'ana@correo.com' } } },
  { method: 'GET', path: '/nada', headers: auth }
];

for (const req of requests) {
  const res = await api(req);
  console.log(`${res.status} ${JSON.stringify(res.body)}\n`);
}
