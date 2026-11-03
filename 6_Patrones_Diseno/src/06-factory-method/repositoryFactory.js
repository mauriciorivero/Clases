// ========================================
// FACTORY METHOD: PEDIR UN OBJETO POR SU TIPO
// ========================================
// Quien necesita un repositorio dice QUÉ quiere ("mongo"), no CÓMO se
// construye. En JavaScript lo habitual es una función fábrica en lugar de
// una jerarquía de clases.
import { getMongoClient, getSupabase } from '../01-singleton/database.js';
import { SupabaseProductRepository } from '../05-adapter-repository/supabaseProductRepository.js';
import { MongoProductRepository } from '../05-adapter-repository/mongoProductRepository.js';

// Registro: cada proveedor sabe construir su repositorio.
// Reutiliza los clientes Singleton de database.js.
const providers = {
  supabase: async () => new SupabaseProductRepository(getSupabase()),
  mongo: async () => {
    const client = await getMongoClient();
    return new MongoProductRepository(client.db('shop'));
  }
};

// Sin argumento, se lee la variable de entorno DB_PROVIDER
const defaultProvider = () => process.env.DB_PROVIDER ?? 'supabase';

export async function createProductRepository(provider = defaultProvider()) {
  if (!Object.hasOwn(providers, provider)) {
    const options = Object.keys(providers).join(', ');
    throw new Error(`Proveedor desconocido "${provider}" (usa: ${options})`);
  }
  return providers[provider]();
}
