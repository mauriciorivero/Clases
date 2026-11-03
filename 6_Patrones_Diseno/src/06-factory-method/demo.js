import { createProductRepository } from './repositoryFactory.js';
import { ProductService } from '../05-adapter-repository/productService.js';

// 1. Sin argumentos: usa la variable de entorno DB_PROVIDER (o "supabase" por defecto)
const fromEnv = await createProductRepository();
console.log('DB_PROVIDER =', process.env.DB_PROVIDER ?? '(sin definir)', '→', fromEnv.constructor.name);

// 2. Pedimos cada tipo por su nombre
for (const provider of ['supabase', 'mongo']) {
  const repository = await createProductRepository(provider);
  const service = new ProductService(repository);
  await service.addProduct({ name: 'Monitor', price: 220 });
  console.log(provider.padEnd(8), '→', repository.constructor.name, '→', (await service.listProducts()).length, 'producto(s)');
}

// 3. Un proveedor que no existe
try {
  await createProductRepository('oracle');
} catch (error) {
  console.log(error.message);
}
