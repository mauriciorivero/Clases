import { ProductRepository } from './productRepository.js';

// ADAPTER: traduce el mismo contrato al lenguaje de MongoDB
export class MongoProductRepository extends ProductRepository {
  constructor(db) {
    super();
    this.products = db.collection('products');
  }

  // MongoDB guarda el identificador como `_id`; la app espera `id`
  #toProduct(doc) {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { id: _id, ...rest };
  }

  async findAll() {
    const docs = await this.products.find({}).toArray();
    return docs.map((doc) => this.#toProduct(doc));
  }

  async findById(id) {
    // Con el driver real: this.products.findOne({ _id: new ObjectId(id) })
    return this.#toProduct(await this.products.findOne({ _id: id }));
  }

  async create(product) {
    const { insertedId } = await this.products.insertOne({ ...product });
    return { id: insertedId, ...product };
  }
}
