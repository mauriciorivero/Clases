import { createClient } from '../lib/supabaseSimulado.js';
import { MongoClient } from '../lib/mongoSimulado.js';
import { SupabaseProductRepository } from './supabaseProductRepository.js';
import { MongoProductRepository } from './mongoProductRepository.js';
import { ProductService } from './productService.js';

const supabase = createClient('https://demo.supabase.co', 'clave-de-prueba');
const mongo = await new MongoClient('mongodb+srv://usuario:clave@cluster.mongodb.net').connect();

const repositories = {
  Supabase: new SupabaseProductRepository(supabase),
  MongoDB: new MongoProductRepository(mongo.db('shop'))
};

// El MISMO código de servicio funciona con las dos bases de datos
for (const [name, repository] of Object.entries(repositories)) {
  const service = new ProductService(repository);

  const created = await service.addProduct({ name: 'Teclado', price: 45 });
  await service.addProduct({ name: 'Mouse', price: 18 });

  console.log(`--- ${name} ---`);
  console.log('Lista:', await service.listProducts());
  console.log('Por id:', await service.getProduct(created.id));

  try {
    await service.getProduct('no-existe');
  } catch (error) {
    console.log('Error controlado:', error.message);
  }
}
