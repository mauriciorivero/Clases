import { ProductRepository } from './productRepository.js';

// Supabase no lanza errores: los devuelve. Aquí los volvemos excepciones.
function unwrap({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

// ADAPTER: traduce el contrato del repositorio al lenguaje de Supabase
export class SupabaseProductRepository extends ProductRepository {
  constructor(supabase) {
    super();
    this.supabase = supabase;
  }

  #products() {
    return this.supabase.from('products');
  }

  async findAll() {
    return unwrap(await this.#products().select('*').order('id'));
  }

  async findById(id) {
    const result = await this.#products().select('*').eq('id', id).single();
    if (result.error?.code === 'PGRST116') return null; // no existe
    return unwrap(result);
  }

  async create(product) {
    return unwrap(await this.#products().insert(product).select().single());
  }
}
